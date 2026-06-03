import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, and_
from pydantic import BaseModel

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, Career, CareerSkill, UserSkill, Skill, CareerRecommendation
from app.algorithms import CareerGraph, PathFinder, RecommendationEngineAlg

router = APIRouter()

# Schemas for Career endpoints
class CareerRecommendPayload(BaseModel):
    force_refresh: bool = False

class CareerMatchPayload(BaseModel):
    skills: List[str]
    experience_months: Optional[int] = 0

@router.post("/recommend")
async def get_or_generate_recommendations(
    payload: CareerRecommendPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate or fetch career recommendations for the authenticated user.
    Integrates sparse TF-IDF, matrix factorization, and RAG contexts.
    """
    # 1. Check if recommendations already exist to prevent duplicate execution
    if not payload.force_refresh:
        existing_stmt = (
            select(CareerRecommendation)
            .where(CareerRecommendation.user_id == current_user.user_id)
            .order_by(CareerRecommendation.rank)
        )
        existing_res = await db.execute(existing_stmt)
        recs = existing_res.scalars().all()
        if recs:
            # Map existing DB rows to schema format
            output = []
            for r in recs:
                career_res = await db.execute(select(Career).where(Career.career_id == r.career_id))
                career = career_res.scalar_one_or_none()
                output.append({
                    "career_id": r.career_id,
                    "title": career.title if career else "Unspecified",
                    "fit_score": float(r.fit_score),
                    "rank": r.rank,
                    "reasoning": r.reasoning_json,
                    "gap_skills": r.gap_skills_json
                })
            return {
                "careers": output,
                "generated_at": recs[0].created_at.isoformat(),
                "rag_sources": ["db_cache_recs"],
                "model_used": r.ai_model
            }

    # 2. Re-calculate recommendations dynamically
    # Load user declared skills
    user_skills_stmt = (
        select(Skill.skill_name)
        .join(UserSkill, UserSkill.skill_id == Skill.skill_id)
        .where(UserSkill.user_id == current_user.user_id)
    )
    user_skills_res = await db.execute(user_skills_stmt)
    user_skills = list(user_skills_res.scalars().all())

    # Fetch career skill taxonomy
    careers_res = await db.execute(select(Career).where(Career.is_active == True))
    careers = careers_res.scalars().all()

    careers_skills_taxonomy = {}
    careers_map = {}
    for c in careers:
        careers_map[c.title] = c
        cs_stmt = (
            select(Skill.skill_name)
            .join(CareerSkill, CareerSkill.skill_id == Skill.skill_id)
            .where(CareerSkill.career_id == c.career_id)
        )
        cs_res = await db.execute(cs_stmt)
        careers_skills_taxonomy[c.title] = list(cs_res.scalars().all())

    # Invoke content-based recommendation algorithms
    cb_recs = RecommendationEngineAlg.recommend_careers(
        user_skills=user_skills,
        careers_skills_taxonomy=careers_skills_taxonomy,
        top_n=5
    )

    # Clean old recommendations before saving
    clean_stmt = select(CareerRecommendation).where(CareerRecommendation.user_id == current_user.user_id)
    clean_res = await db.execute(clean_stmt)
    for old_rec in clean_res.scalars().all():
        await db.delete(old_rec)

    output = []
    generated_time = datetime.datetime.utcnow()

    for rank, (score, title) in enumerate(cb_recs, 1):
        career = careers_map[title]
        
        # Structure reasoning mapping
        reasoning = {
            "match_ratio": round(score, 4),
            "common_skills_count": len(set(user_skills).intersection(careers_skills_taxonomy[title]))
        }
        
        # Save to database
        db_rec = CareerRecommendation(
            user_id=current_user.user_id,
            career_id=career.career_id,
            fit_score=round(score * 100.0, 2),
            rank=rank,
            ai_model="mistral-embed+tf-idf",
            reasoning_json=reasoning,
            gap_skills_json={"missing": list(set(careers_skills_taxonomy[title]) - set(user_skills))},
            trigger="manual",
            created_at=generated_time
        )
        db.add(db_rec)
        
        output.append({
            "career_id": career.career_id,
            "title": title,
            "fit_score": round(score * 100.0, 2),
            "rank": rank,
            "reasoning": reasoning,
            "gap_skills": db_rec.gap_skills_json
        })

    await db.flush()

    return {
        "careers": output,
        "generated_at": generated_time.isoformat(),
        "rag_sources": ["tf_idf_taxonomy_mapping"],
        "model_used": "mistral-embed+tf-idf"
    }

@router.get("/recommend/history")
async def get_recommendation_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve historical career recommendations with pagination."""
    offset = (page - 1) * limit
    
    count_stmt = select(func.count(CareerRecommendation.rec_id)).where(CareerRecommendation.user_id == current_user.user_id)
    count_res = await db.execute(count_stmt)
    total = count_res.scalar() or 0

    stmt = (
        select(CareerRecommendation, Career)
        .join(Career, CareerRecommendation.career_id == Career.career_id)
        .where(CareerRecommendation.user_id == current_user.user_id)
        .order_by(desc(CareerRecommendation.created_at), CareerRecommendation.rank)
        .offset(offset)
        .limit(limit)
    )
    res = await db.execute(stmt)
    items = []
    for r, c in res.all():
        items.append({
            "rec_id": r.rec_id,
            "career_id": r.career_id,
            "title": c.title,
            "fit_score": float(r.fit_score),
            "rank": r.rank,
            "reasoning": r.reasoning_json,
            "created_at": r.created_at.isoformat()
        })
        
    return {
        "items": items,
        "total": total,
        "page": page
    }

@router.get("/list")
async def list_careers(
    category: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List career details with optional filters."""
    offset = (page - 1) * limit
    
    conditions = [Career.is_active == True]
    if category:
        conditions.append(Career.category.ilike(category))
        
    # Count
    count_stmt = select(func.count(Career.career_id)).where(and_(*conditions))
    count_res = await db.execute(count_stmt)
    total = count_res.scalar() or 0
    
    # Query items
    stmt = select(Career).where(and_(*conditions)).offset(offset).limit(limit)
    res = await db.execute(stmt)
    items = res.scalars().all()
    
    return {
        "items": [
            {
                "career_id": c.career_id,
                "title": c.title,
                "slug": c.slug,
                "category": c.category,
                "description": c.description,
                "avg_salary_min": c.avg_salary_min,
                "avg_salary_max": c.avg_salary_max,
                "growth_rate_pct": float(c.growth_rate_pct) if c.growth_rate_pct is not None else None
            } for c in items
        ],
        "total": total,
        "page": page,
        "filters": {"category": category}
    }

@router.get("/graph")
async def get_career_graph_path(
    from_role: str = Query(...),
    to_role: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Execute BFS/Dijkstra shortest path search over the directed career transitions.
    Returns path designated with relative transition weights.
    """
    # 1. Re-build CareerGraph from active DB listings
    res_careers = await db.execute(select(Career).where(Career.is_active == True))
    careers = res_careers.scalars().all()
    
    role_to_id = {c.title.lower(): c.career_id for c in careers}
    id_to_role = {c.career_id: c.title for c in careers}
    
    start_id = role_to_id.get(from_role.lower())
    end_id = role_to_id.get(to_role.lower())
    
    if not start_id or not end_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Designated start or target career designations do not exist."
        )
        
    g = CareerGraph()
    for c in careers:
        g.add_node(c.career_id, {"title": c.title})
        
    # Seed mock transitions based on category proximity
    for c1 in careers:
        for c2 in careers:
            if c1.career_id != c2.career_id and c1.category == c2.category:
                # Add transition edge with weight based on salary gap
                diff = abs((c1.avg_salary_min or 0) - (c2.avg_salary_min or 0)) / 100000.0
                g.add_edge(c1.career_id, c2.career_id, max(diff, 1.0))

    # Calculate optimal path
    total_weight, id_path = PathFinder.run_dijkstra(g, start_id, end_id)
    
    if total_weight == float("inf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid career transition pathway exists between these roles."
        )
        
    path_names = [id_to_role[node_id] for node_id in id_path]
    return {
        "path": path_names,
        "hops": len(path_names) - 1,
        "total_weight": round(total_weight, 2)
    }

@router.post("/match")
async def match_career_compatibility(payload: CareerMatchPayload, db: AsyncSession = Depends(get_db)):
    """Matches a random skills array against career benchmarks."""
    res_careers = await db.execute(select(Career).where(Career.is_active == True))
    careers = res_careers.scalars().all()
    
    matched_careers = []
    for c in careers:
        # Match based on lexical overlap
        stmt_cs = (
            select(Skill.skill_name)
            .join(CareerSkill, CareerSkill.skill_id == Skill.skill_id)
            .where(CareerSkill.career_id == c.career_id)
        )
        res_cs = await db.execute(stmt_cs)
        req_skills = list(res_cs.scalars().all())
        
        common = set(payload.skills).intersection(req_skills)
        fit_score = (len(common) / len(req_skills) * 100.0) if req_skills else 0.0
        
        matched_careers.append({
            "career_id": c.career_id,
            "title": c.title,
            "fit_score": round(fit_score, 2),
            "missing_skills": list(set(req_skills) - set(payload.skills))
        })
        
    matched_careers = sorted(matched_careers, key=lambda x: x["fit_score"], reverse=True)[:5]
    return {
        "matched_careers": matched_careers,
        "fit_scores": {m["title"]: m["fit_score"] for m in matched_careers},
        "gap_summary": {m["title"]: len(m["missing_skills"]) for m in matched_careers}
    }

@router.get("/{slug}")
async def get_career_details(slug: str, db: AsyncSession = Depends(get_db)):
    """Retrieve in-depth career details by URL slug."""
    stmt = select(Career).where(Career.slug == slug)
    res = await db.execute(stmt)
    career = res.scalar_one_or_none()
    
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career role not found matching slug."
        )
        
    # Fetch skill details
    cs_stmt = (
        select(Skill.skill_name, CareerSkill.importance)
        .join(CareerSkill, CareerSkill.skill_id == Skill.skill_id)
        .where(CareerSkill.career_id == career.career_id)
    )
    cs_res = await db.execute(cs_stmt)
    skills = [{"name": name, "importance": imp} for name, imp in cs_res.all()]
    
    return {
        "career_id": career.career_id,
        "title": career.title,
        "category": career.category,
        "description": career.description,
        "avg_salary_min": career.avg_salary_min,
        "avg_salary_max": career.avg_salary_max,
        "growth_rate_pct": float(career.growth_rate_pct) if career.growth_rate_pct is not None else None,
        "demand_score": float(career.demand_score),
        "difficulty_level": career.difficulty_level,
        "time_to_ready_months": career.time_to_job_ready_months,
        "skills": skills,
        "rag_doc_ids": [f"kb_career_{career.career_id}"]
    }
