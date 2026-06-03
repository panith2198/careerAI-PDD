import datetime
import json
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, desc, or_
from pydantic import BaseModel

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, Job, JobApplication, UserSkill, Skill, UserProfile, Resume
from app.services.job_matching_service import job_matching_service

logger = logging.getLogger("jobs_api")

router = APIRouter()

# Schema definitions for payloads and responses
class ApplyPayload(BaseModel):
    resume_id: int
    cover_note: Optional[str] = None

class JobDetailResponse(BaseModel):
    job_id: int
    title: str
    company_name: str
    career_id: Optional[int]
    description_raw: str
    required_skills_json: List[str]
    location_city: Optional[str]
    work_mode: str
    experience_min_months: int
    salary_min: Optional[int]
    salary_max: Optional[int]
    source: str
    is_fresher_eligible: bool
    posting_date: str

    class Config:
        from_attributes = True

@router.get("/list")
async def list_jobs(
    city: Optional[str] = Query(default=None),
    work_mode: Optional[str] = Query(default=None),
    career_id: Optional[int] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch a paginated list of active jobs with optional filtering.
    """
    offset = (page - 1) * limit
    conditions = [Job.is_active == True]

    if city:
        conditions.append(Job.location_city.ilike(f"%{city}%"))
    if work_mode:
        conditions.append(Job.work_mode == work_mode)
    if career_id:
        conditions.append(Job.career_id == career_id)

    # 1. Total matching count
    count_stmt = select(func.count(Job.job_id)).where(and_(*conditions))
    count_res = await db.execute(count_stmt)
    total = count_res.scalar() or 0

    # 2. Paginated selection
    stmt = (
        select(Job)
        .where(and_(*conditions))
        .order_by(desc(Job.posting_date), Job.job_id)
        .offset(offset)
        .limit(limit)
    )
    res = await db.execute(stmt)
    items = res.scalars().all()

    # Format return items with clean dates & parsed skills
    formatted_items = []
    for item in items:
        req_skills = item.required_skills_json
        if isinstance(req_skills, str):
            try:
                req_skills = json.loads(req_skills)
            except Exception:
                req_skills = []
        elif not isinstance(req_skills, list):
            req_skills = []

        formatted_items.append({
            "job_id": item.job_id,
            "title": item.title,
            "company_name": item.company_name,
            "career_id": item.career_id,
            "description_raw": item.description_raw,
            "required_skills_json": req_skills,
            "location_city": item.location_city,
            "work_mode": item.work_mode,
            "experience_min_months": item.experience_min_months,
            "salary_min": item.salary_min,
            "salary_max": item.salary_max,
            "source": item.source,
            "is_fresher_eligible": item.is_fresher_eligible,
            "posting_date": item.posting_date.isoformat() if hasattr(item.posting_date, "isoformat") else str(item.posting_date)
        })

    return {
        "items": formatted_items,
        "total": total,
        "filters": {
            "city": city,
            "work_mode": work_mode,
            "career_id": career_id,
            "page": page,
            "limit": limit
        }
    }

@router.post("/match")
async def match_jobs_semantic(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Match jobs semantically using Hybrid ANN vector spaces & local RRF fusion fallbacks.
    """
    # 1. Fetch current user skills & profile
    stmt_skills = select(UserSkill, Skill).join(Skill, UserSkill.skill_id == Skill.skill_id).where(
        UserSkill.user_id == current_user.user_id
    )
    res_skills = await db.execute(stmt_skills)
    user_skills = res_skills.all()
    user_skill_names = [skill.skill_name for _, skill in user_skills]

    # Gather user preferences
    stmt_profile = select(UserProfile).where(UserProfile.user_id == current_user.user_id)
    res_profile = await db.execute(stmt_profile)
    profile = res_profile.scalar_one_or_none()

    pref_city = profile.city if profile else None
    pref_mode = profile.preferred_work_mode if profile else None

    # 2. Build candidate query profile
    skills_query = ", ".join(user_skill_names) if user_skill_names else "fresher"
    candidate_desc = f"Skills: {skills_query}."
    if pref_city:
        candidate_desc += f" Location: {pref_city}."
    if pref_mode:
        candidate_desc += f" Mode: {pref_mode}."

    # 3. Perform Hybrid dense + sparse ANN candidate lookup
    matches = await job_matching_service.match_candidate_to_jobs(
        query=candidate_desc,
        collection_name="jobs",
        db=db,
        top_k=10
    )

    # Convert results or run standard high-accuracy Jaccard fallback matching
    matched_job_ids = []
    for m in matches:
        metadata = m.get("metadata", {})
        if "job_id" in metadata:
            matched_job_ids.append(int(metadata["job_id"]))

    # Fetch matching Jobs from Database
    if matched_job_ids:
        stmt_db_jobs = select(Job).where(Job.job_id.in_(matched_job_ids), Job.is_active == True)
        res_db_jobs = await db.execute(stmt_db_jobs)
        db_jobs = {j.job_id: j for j in res_db_jobs.scalars().all()}
    else:
        db_jobs = {}

    final_matches = []
    match_scores = {}

    user_skills_set = {s.lower().strip() for s in user_skill_names}

    # 4. If ANN query yielded entries, merge them. Otherwise, run full database fallback
    if db_jobs:
        for m in matches:
            jid = int(m.get("metadata", {}).get("job_id"))
            if jid in db_jobs:
                job = db_jobs[jid]
                req_skills = job.required_skills_json
                if isinstance(req_skills, str):
                    try:
                        req_skills = json.loads(req_skills)
                    except Exception:
                        req_skills = []
                elif not isinstance(req_skills, list):
                    req_skills = []

                # Compute exact skills alignment score
                req_clean = {str(s).lower().strip() for s in req_skills}
                score = 80.0
                if req_clean:
                    intersect = user_skills_set.intersection(req_clean)
                    score = (len(intersect) / len(req_clean)) * 100.0

                final_matches.append({
                    "job_id": job.job_id,
                    "title": job.title,
                    "company_name": job.company_name,
                    "location_city": job.location_city,
                    "work_mode": job.work_mode,
                    "score": round(score, 2)
                })
                match_scores[str(job.job_id)] = round(score, 2)
    else:
        # DB-wide fallback matching (very stable, perfect for development environments)
        stmt_all = select(Job).where(Job.is_active == True).limit(50)
        res_all = await db.execute(stmt_all)
        all_jobs = res_all.scalars().all()

        for job in all_jobs:
            req_skills = job.required_skills_json
            if isinstance(req_skills, str):
                try:
                    req_skills = json.loads(req_skills)
                except Exception:
                    req_skills = []
            elif not isinstance(req_skills, list):
                req_skills = []

            req_clean = {str(s).lower().strip() for s in req_skills}
            score = 50.0
            if req_clean:
                intersect = user_skills_set.intersection(req_clean)
                score = (len(intersect) / len(req_clean)) * 100.0

            # Geo location bonus
            if pref_city and job.location_city and pref_city.lower() in job.location_city.lower():
                score = min(100.0, score + 15.0)
            # Work mode bonus
            if pref_mode and job.work_mode == pref_mode:
                score = min(100.0, score + 10.0)

            final_matches.append({
                "job_id": job.job_id,
                "title": job.title,
                "company_name": job.company_name,
                "location_city": job.location_city,
                "work_mode": job.work_mode,
                "score": round(score, 2)
            })
            match_scores[str(job.job_id)] = round(score, 2)

        # Sort matches by score descending
        final_matches = sorted(final_matches, key=lambda x: x["score"], reverse=True)[:10]

    return {
        "matched_jobs": final_matches,
        "match_scores": match_scores,
        "top_k": 10
    }

@router.get("/applications")
async def list_applications(
    status: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch a paginated history of applications submitted by the current user.
    """
    limit = 10
    offset = (page - 1) * limit

    conditions = [JobApplication.user_id == current_user.user_id]
    if status:
        conditions.append(JobApplication.status == status)

    count_stmt = select(func.count(JobApplication.application_id)).where(and_(*conditions))
    count_res = await db.execute(count_stmt)
    total = count_res.scalar() or 0

    stmt = (
        select(JobApplication, Job)
        .join(Job, JobApplication.job_id == Job.job_id)
        .where(and_(*conditions))
        .order_by(desc(JobApplication.created_at))
        .offset(offset)
        .limit(limit)
    )
    res = await db.execute(stmt)
    results = res.all()

    items = []
    for app_record, job_record in results:
        items.append({
            "application_id": app_record.application_id,
            "job_id": job_record.job_id,
            "job_title": job_record.title,
            "company_name": job_record.company_name,
            "match_score": float(app_record.match_score) if app_record.match_score else 0.0,
            "status": app_record.status,
            "applied_at": app_record.applied_at.isoformat() if app_record.applied_at else None,
            "status_updated_at": app_record.status_updated_at.isoformat() if app_record.status_updated_at else None
        })

    return {
        "items": items,
        "total": total,
        "page": page
    }

@router.get("/{id}")
async def get_job_detail(id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieve full details of a specific job listing. (Public access allowed)
    """
    stmt = select(Job).where(Job.job_id == id)
    res = await db.execute(stmt)
    job = res.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job listing not found."
        )

    req_skills = job.required_skills_json
    if isinstance(req_skills, str):
        try:
            req_skills = json.loads(req_skills)
        except Exception:
            req_skills = []
    elif not isinstance(req_skills, list):
        req_skills = []

    return {
        "job_id": job.job_id,
        "title": job.title,
        "company_name": job.company_name,
        "career_id": job.career_id,
        "description_raw": job.description_raw,
        "required_skills_json": req_skills,
        "location_city": job.location_city,
        "work_mode": job.work_mode,
        "experience_min_months": job.experience_min_months,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "source": job.source,
        "is_fresher_eligible": job.is_fresher_eligible,
        "posting_date": job.posting_date.isoformat() if hasattr(job.posting_date, "isoformat") else str(job.posting_date)
    }

@router.post("/{id}/apply", status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    id: int,
    payload: ApplyPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Apply to a specific job using a parsed resume.
    """
    # 1. Verify Job exists
    stmt_job = select(Job).where(Job.job_id == id, Job.is_active == True)
    res_job = await db.execute(stmt_job)
    job = res_job.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active job listing not found."
        )

    # 2. Verify Resume exists and belongs to current user
    stmt_resume = select(Resume).where(Resume.resume_id == payload.resume_id, Resume.user_id == current_user.user_id)
    res_resume = await db.execute(stmt_resume)
    resume = res_resume.scalar_one_or_none()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied."
        )

    # 3. Check for existing application
    stmt_app = select(JobApplication).where(
        JobApplication.user_id == current_user.user_id,
        JobApplication.job_id == id
    )
    res_app = await db.execute(stmt_app)
    existing = res_app.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted an application for this job."
        )

    # 4. Compute fit compatibility
    req_skills = job.required_skills_json
    if isinstance(req_skills, str):
        try:
            req_skills = json.loads(req_skills)
        except Exception:
            req_skills = []
    elif not isinstance(req_skills, list):
        req_skills = []

    stmt_skills = select(UserSkill, Skill).join(Skill, UserSkill.skill_id == Skill.skill_id).where(
        UserSkill.user_id == current_user.user_id
    )
    res_skills = await db.execute(stmt_skills)
    user_skills = res_skills.all()
    user_skills_set = {skill.skill_name.lower().strip() for _, skill in user_skills}

    req_clean = {str(s).lower().strip() for s in req_skills}
    match_pct = 75.0
    if req_clean:
        intersect = user_skills_set.intersection(req_clean)
        match_pct = (len(intersect) / len(req_clean)) * 100.0

    # 5. Create active Application record
    new_app = JobApplication(
        user_id=current_user.user_id,
        job_id=id,
        match_score=round(match_pct, 2),
        status="applied",
        cover_letter=payload.cover_note,
        ai_interview_tips=f"Preparation tips for {job.title} role at {job.company_name}.",
        applied_at=datetime.datetime.utcnow(),
        status_updated_at=datetime.datetime.utcnow()
    )

    db.add(new_app)
    await db.flush()

    return {
        "application_id": new_app.application_id,
        "status": "applied"
    }

@router.post("/{id}/save", status_code=status.HTTP_201_CREATED)
async def save_job(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Bookmark / save a job listing for future application.
    """
    # 1. Verify Job exists
    stmt_job = select(Job).where(Job.job_id == id, Job.is_active == True)
    res_job = await db.execute(stmt_job)
    job = res_job.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active job listing not found."
        )

    # 2. Check for existing bookmark or application
    stmt_app = select(JobApplication).where(
        JobApplication.user_id == current_user.user_id,
        JobApplication.job_id == id
    )
    res_app = await db.execute(stmt_app)
    existing = res_app.scalar_one_or_none()

    if existing:
        if existing.status == "saved":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Job is already saved."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"You have already applied/interacted with this job (status: {existing.status})."
            )

    # 3. Create saved application record
    new_save = JobApplication(
        user_id=current_user.user_id,
        job_id=id,
        status="saved",
        match_score=0.0,
        status_updated_at=datetime.datetime.utcnow()
    )
    db.add(new_save)
    await db.flush()

    return {"message": "Job saved successfully.", "status": "saved"}

@router.delete("/{id}/save", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_job(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Unsave / remove a saved job bookmark.
    """
    # Find saved record
    stmt = select(JobApplication).where(
        JobApplication.user_id == current_user.user_id,
        JobApplication.job_id == id,
        JobApplication.status == "saved"
    )
    res = await db.execute(stmt)
    save_record = res.scalar_one_or_none()

    if not save_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved job listing not found or already applied."
        )

    await db.delete(save_record)
    await db.flush()
    return None



