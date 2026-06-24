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
    # 0. Auto-populate careers if table is empty
    career_count_res = await db.execute(select(func.count(Career.career_id)))
    career_count = career_count_res.scalar() or 0
    if career_count == 0:
        try:
            from app.tasks.career_populator import populate_careers_from_jobs
            await populate_careers_from_jobs(db)
            await db.flush()
        except Exception as e:
            import logging
            logging.getLogger("career_api").warning(f"Auto-populate failed: {e}")

    # 1. Check if recommendations already exist to prevent duplicate execution
    if not payload.force_refresh:
        latest_time_stmt = (
            select(CareerRecommendation.created_at)
            .where(CareerRecommendation.user_id == current_user.user_id)
            .order_by(desc(CareerRecommendation.created_at))
            .limit(1)
        )
        latest_time_res = await db.execute(latest_time_stmt)
        latest_time = latest_time_res.scalar_one_or_none()

        if latest_time:
            existing_stmt = (
                select(CareerRecommendation)
                .where(
                    and_(
                        CareerRecommendation.user_id == current_user.user_id,
                        CareerRecommendation.created_at == latest_time
                    )
                )
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
                        "slug": career.slug if career else "unspecified",
                        "fit_score": round(float(r.fit_score)),
                        "rank": r.rank,
                        "reasoning": r.reasoning_json,
                        "gap_skills": r.gap_skills_json
                    })
                return {
                    "careers": output,
                    "generated_at": latest_time.isoformat(),
                    "rag_sources": ["db_cache_recs"],
                    "model_used": recs[0].ai_model
                }

    # 2. Re-calculate recommendations dynamically
    # Load user declared skills in detail
    user_skills_stmt = (
        select(
            Skill.skill_name,
            UserSkill.proficiency_level,
            UserSkill.years_of_experience,
            UserSkill.is_verified
        )
        .join(UserSkill, UserSkill.skill_id == Skill.skill_id)
        .where(UserSkill.user_id == current_user.user_id)
    )
    user_skills_res = await db.execute(user_skills_stmt)
    user_skills = [
        {
            "skill_name": row[0],
            "proficiency_level": row[1],
            "years_of_experience": float(row[2]),
            "is_verified": bool(row[3])
        }
        for row in user_skills_res.fetchall()
    ]

    # Fetch career skill taxonomy
    careers_res = await db.execute(select(Career).where(Career.is_active == True))
    careers = careers_res.scalars().all()

    # Fetch career-specific details in key-value format for taxonomy matching
    careers_skills_taxonomy = {}
    careers_map = {}
    for c in careers:
        careers_map[c.title] = c
        cs_stmt = (
            select(
                Skill.skill_name,
                CareerSkill.importance,
                CareerSkill.min_proficiency,
                CareerSkill.weightage
            )
            .join(CareerSkill, CareerSkill.skill_id == Skill.skill_id)
            .where(CareerSkill.career_id == c.career_id)
        )
        cs_res = await db.execute(cs_stmt)
        careers_skills_taxonomy[c.title] = [
            {
                "skill_name": row[0],
                "importance": row[1],
                "min_proficiency": row[2],
                "weightage": float(row[3])
            }
            for row in cs_res.fetchall()
        ]

    # Invoke content-based recommendation algorithms
    cb_recs = RecommendationEngineAlg.recommend_careers(
        user_skills=user_skills,
        careers_skills_taxonomy=careers_skills_taxonomy,
        top_n=5
    )

    output = []
    generated_time = datetime.datetime.utcnow()

    # Create sets of user skill names for intersection/difference
    user_skills_names = {us["skill_name"].lower().strip() for us in user_skills}

    for rank, (score, title) in enumerate(cb_recs, 1):
        career = careers_map[title]
        career_skills = careers_skills_taxonomy[title]
        career_skills_names = {cs["skill_name"].lower().strip() for cs in career_skills}
        
        common_count = len(user_skills_names.intersection(career_skills_names))
        
        # Structure reasoning mapping
        reasoning = {
            "match_ratio": round(score, 4),
            "common_skills_count": common_count
        }
        
        # Missing skills
        missing_skills = [
            cs["skill_name"] for cs in career_skills 
            if cs["skill_name"].lower().strip() not in user_skills_names
        ]
        
        # Save to database
        db_rec = CareerRecommendation(
            user_id=current_user.user_id,
            career_id=career.career_id,
            fit_score=round(score * 100.0, 2),
            rank=rank,
            ai_model="RandomForest+TF-IDF",
            reasoning_json=reasoning,
            gap_skills_json={"missing": missing_skills},
            trigger="manual",
            created_at=generated_time
        )
        db.add(db_rec)
        
        output.append({
            "career_id": career.career_id,
            "title": title,
            "slug": career.slug,
            "fit_score": round(score * 100.0),
            "rank": rank,
            "reasoning": reasoning,
            "gap_skills": db_rec.gap_skills_json
        })

    await db.flush()

    return {
        "careers": output,
        "generated_at": generated_time.isoformat(),
        "rag_sources": ["tf_idf_taxonomy_mapping"],
        "model_used": "RandomForest+TF-IDF"
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
            "slug": c.slug,
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

@router.get("")
@router.get("/list")
async def list_careers(
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    sort: Optional[str] = Query(default="recommended"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List career details with optional filters, AI fit matching, and sorting."""
    # Auto-populate if careers table is empty
    career_count_res = await db.execute(select(func.count(Career.career_id)))
    career_count = career_count_res.scalar() or 0
    if career_count == 0:
        try:
            from app.tasks.career_populator import populate_careers_from_jobs
            await populate_careers_from_jobs(db)
            await db.flush()
        except Exception:
            pass

    # 1. Fetch user skills in detail to compute fit scores
    user_skills_stmt = (
        select(
            Skill.skill_name,
            UserSkill.proficiency_level,
            UserSkill.years_of_experience,
            UserSkill.is_verified
        )
        .join(UserSkill, UserSkill.skill_id == Skill.skill_id)
        .where(UserSkill.user_id == current_user.user_id)
    )
    user_skills_res = await db.execute(user_skills_stmt)
    user_skills = [
        {
            "skill_name": row[0],
            "proficiency_level": row[1],
            "years_of_experience": float(row[2]),
            "is_verified": bool(row[3])
        }
        for row in user_skills_res.fetchall()
    ]

    # 2. Build conditions
    conditions = [Career.is_active == True]
    if category and category.lower() != "all":
        conditions.append(Career.category.ilike(category))
    if search:
        conditions.append(
            (Career.title.ilike(f"%{search}%")) | (Career.description.ilike(f"%{search}%"))
        )

    # 3. Load all career skills in detail to avoid N+1 queries
    cs_stmt = (
        select(
            CareerSkill.career_id,
            Skill.skill_name,
            CareerSkill.importance,
            CareerSkill.min_proficiency,
            CareerSkill.weightage
        )
        .join(Skill, CareerSkill.skill_id == Skill.skill_id)
    )
    cs_res = await db.execute(cs_stmt)
    career_skills_map = {}
    for row in cs_res.fetchall():
        cid = row[0]
        if cid not in career_skills_map:
            career_skills_map[cid] = []
        career_skills_map[cid].append({
            "skill_name": row[1],
            "importance": row[2],
            "min_proficiency": row[3],
            "weightage": float(row[4])
        })

    # 4. Fetch matching careers
    stmt = select(Career).where(and_(*conditions))
    res = await db.execute(stmt)
    matching_careers = res.scalars().all()

    # Fetch pre-computed fit scores from the database recommendations for the current user
    rec_stmt = select(CareerRecommendation).where(CareerRecommendation.user_id == current_user.user_id)
    rec_res = await db.execute(rec_stmt)
    recs = rec_res.scalars().all()
    rec_fit_scores = {r.career_id: float(r.fit_score) for r in recs}

    # 5. Process and calculate fit scores
    careers_with_score = []
    for c in matching_careers:
        c_skills = career_skills_map.get(c.career_id, [])
        
        # Retrieve fit score from database if available, otherwise fallback to rule-based algorithm
        if c.career_id in rec_fit_scores:
            fit_score = rec_fit_scores[c.career_id]
        else:
            fit_score = RecommendationEngineAlg.calculate_rule_based_fit(user_skills, c_skills) * 100.0
            
        careers_with_score.append({
            "career_id": c.career_id,
            "title": c.title,
            "slug": c.slug,
            "category": c.category,
            "description": c.description,
            "avg_salary_min": c.avg_salary_min,
            "avg_salary_max": c.avg_salary_max,
            "growth_rate_pct": float(c.growth_rate_pct) if c.growth_rate_pct is not None else 0.0,
            "demand_score": float(c.demand_score) if c.demand_score is not None else 0.0,
            "fit_score": round(fit_score),
            "skills": [sk["skill_name"] for sk in c_skills]
        })

    # 6. Apply sorting
    if sort == "salary":
        careers_with_score.sort(key=lambda x: (x["avg_salary_max"] or 0, x["avg_salary_min"] or 0), reverse=True)
    elif sort == "growth":
        careers_with_score.sort(key=lambda x: x["growth_rate_pct"], reverse=True)
    elif sort == "popularity":
        careers_with_score.sort(key=lambda x: x["demand_score"], reverse=True)
    else:  # "recommended"
        careers_with_score.sort(key=lambda x: (x["fit_score"], x["demand_score"]), reverse=True)

    # 7. Apply pagination
    total = len(careers_with_score)
    offset = (page - 1) * limit
    paginated_items = careers_with_score[offset:offset+limit]

    return {
        "items": paginated_items,
        "total": total,
        "page": page,
        "filters": {"category": category, "search": search, "sort": sort}
    }

@router.get("/graph")
async def get_career_graph_path(
    from_role: str = Query(...),
    to_role: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate transition path between two careers using Mistral AI.
    Falls back to Dijkstra shortest path search if AI fails or key is unconfigured.
    """
    # 1. Fetch active careers for vocabulary context and mapping
    res_careers = await db.execute(select(Career).where(Career.is_active == True))
    careers = res_careers.scalars().all()
    
    role_to_id = {c.title.lower(): c.career_id for c in careers}
    
    end_id = role_to_id.get(to_role.lower())
    if not end_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Designated target career designation does not exist."
        )
        
    start_id = role_to_id.get(from_role.lower())
    
    # 2. Try Mistral AI Path Generation first
    try:
        from app.ai_engine.mistral_client import mistral_client
        import json
        import traceback
        
        db_titles = [c.title for c in careers]
        
        prompt = f"""
        Suggest a logical, realistic, step-by-step career transition pathway from a user's current role '{from_role}' to their target role '{to_role}'.
        
        Here are the available roles in our platform database: {", ".join(db_titles)}.
        
        You MUST return a JSON object with a single key "path" containing a list of strings representing the sequence of roles from '{from_role}' to '{to_role}'.
        
        Requirements:
        - The path MUST start with '{from_role}' and end with '{to_role}'.
        - The path MUST contain at least one intermediate role (i.e. at least 3 roles total, and up to 5 roles total) to show a progression of learning and experience.
        - Prefer to use existing database roles as intermediate steps if they logically fit (e.g. from the list above), but you may also include realistic industry roles not in the database if necessary to bridge the gap.
        
        Example output format:
        {{
            "path": ["{from_role}", "Web Designer", "Frontend Developer", "{to_role}"]
        }}
        
        Output ONLY the raw JSON object, with no markdown tags and no extra text.
        """
        
        ai_response = await mistral_client.chat_completion(
            prompt=prompt,
            system_prompt="You are a professional career transitions advisor. You always output valid, clean JSON objects.",
            response_format="json"
        )
        
        if "Mock career guidance result" in ai_response or "your-mistral-api-key-here" in ai_response:
            raise ValueError("Mistral API key is unconfigured, triggering fallback.")
            
        # Robust JSON cleaning and parsing
        clean_res = ai_response.strip()
        if clean_res.startswith("```"):
            lines = clean_res.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].strip() == "```":
                lines = lines[:-1]
            clean_res = "\n".join(lines).strip()
            
        data = json.loads(clean_res)
        path = None
        if isinstance(data, dict) and "path" in data:
            path = data["path"]
        elif isinstance(data, list):
            path = data
        elif isinstance(data, dict):
            for val in data.values():
                if isinstance(val, list):
                    path = val
                    break
                    
        if path and isinstance(path, list) and len(path) >= 2 and str(path[0]).lower() == from_role.lower() and str(path[-1]).lower() == to_role.lower():
            # Normalize capitalization
            path[0] = from_role
            path[-1] = to_role
            return {
                "path": path,
                "hops": len(path) - 1,
                "total_weight": float(len(path) * 5.0)
            }
        else:
            raise ValueError("Invalid path structure returned from AI")
            
    except Exception as e:
        import sys
        print(f"AI Path generation fallback triggered: {e}", file=sys.stderr)
        traceback.print_exc()

    # 3. Fallback: run Dijkstra search if starting role is in the DB
    if start_id:
        g = CareerGraph()
        for c in careers:
            g.add_node(c.career_id, {"title": c.title})
            
        for c1 in careers:
            for c2 in careers:
                if c1.career_id != c2.career_id:
                    diff = abs((c1.avg_salary_min or 0) - (c2.avg_salary_min or 0)) / 100000.0
                    
                    diff_lvl1 = (c1.difficulty_level or "medium").lower()
                    diff_lvl2 = (c2.difficulty_level or "medium").lower()
                    
                    is_c1_senior = diff_lvl1 in ["hard", "expert", "senior"]
                    is_c2_senior = diff_lvl2 in ["hard", "expert", "senior"]
                    
                    if c1.category == c2.category:
                        weight = max(diff, 1.0)
                    else:
                        if is_c1_senior or is_c2_senior:
                            weight = max(diff, 1.0) + 15.0
                        else:
                            weight = max(diff, 1.0) + 2.0
                    g.add_edge(c1.career_id, c2.career_id, weight)

        total_weight, id_path = PathFinder.run_dijkstra(g, start_id, end_id)
        if total_weight != float("inf"):
            id_to_role = {c.career_id: c.title for c in careers}
            path_names = [id_to_role[node_id] for node_id in id_path]
            return {
                "path": path_names,
                "hops": len(path_names) - 1,
                "total_weight": round(total_weight, 2)
            }

    # Ultimate fallback: direct path
    return {
        "path": [from_role, to_role],
        "hops": 1,
        "total_weight": 10.0
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
async def get_career_details(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve in-depth career details by URL slug, matching user skills."""
    stmt = select(Career).where(Career.slug == slug)
    res = await db.execute(stmt)
    career = res.scalar_one_or_none()
    
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career role not found matching slug."
        )
        
    # Fetch user skills in detail
    user_skills_stmt = (
        select(
            Skill.skill_name,
            UserSkill.proficiency_level,
            UserSkill.years_of_experience,
            UserSkill.is_verified
        )
        .join(UserSkill, UserSkill.skill_id == Skill.skill_id)
        .where(UserSkill.user_id == current_user.user_id)
    )
    user_skills_res = await db.execute(user_skills_stmt)
    user_skills = [
        {
            "skill_name": row[0],
            "proficiency_level": row[1],
            "years_of_experience": float(row[2]),
            "is_verified": bool(row[3])
        }
        for row in user_skills_res.fetchall()
    ]
    user_skills_names = {us["skill_name"].lower().strip() for us in user_skills}

    # Fetch skill details for this career
    cs_stmt = (
        select(
            Skill.skill_name,
            CareerSkill.importance,
            CareerSkill.min_proficiency,
            CareerSkill.weightage
        )
        .join(CareerSkill, CareerSkill.skill_id == Skill.skill_id)
        .where(CareerSkill.career_id == career.career_id)
    )
    cs_res = await db.execute(cs_stmt)
    db_skills = cs_res.all()

    career_skills = []
    skills = []
    for name, imp, min_prof, weight in db_skills:
        has_it = name.lower().strip() in user_skills_names
        skills.append({
            "name": name,
            "importance": imp,
            "has_skill": has_it
        })
        career_skills.append({
            "skill_name": name,
            "importance": imp,
            "min_proficiency": min_prof,
            "weightage": float(weight)
        })
        
    # Fetch from database recommendations if available
    rec_stmt = select(CareerRecommendation).where(
        and_(
            CareerRecommendation.user_id == current_user.user_id,
            CareerRecommendation.career_id == career.career_id
        )
    ).order_by(desc(CareerRecommendation.created_at)).limit(1)
    rec_res = await db.execute(rec_stmt)
    rec = rec_res.scalar_one_or_none()
    
    if rec:
        fit_score = float(rec.fit_score)
    else:
        fit_score = RecommendationEngineAlg.calculate_rule_based_fit(user_skills, career_skills) * 100.0

    return {
        "career_id": career.career_id,
        "title": career.title,
        "slug": career.slug,
        "category": career.category,
        "description": career.description,
        "avg_salary_min": career.avg_salary_min,
        "avg_salary_max": career.avg_salary_max,
        "growth_rate_pct": float(career.growth_rate_pct) if career.growth_rate_pct is not None else 0.0,
        "demand_score": float(career.demand_score),
        "difficulty_level": career.difficulty_level,
        "time_to_ready_months": career.time_to_job_ready_months,
        "fit_score": round(fit_score),
        "skills": skills,
        "rag_doc_ids": [f"kb_career_{career.career_id}"]
    }


@router.post("/sync")
async def sync_careers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually trigger career population from scraped job data.
    Re-analyzes all jobs and updates career entries, skills, and mappings.
    """
    try:
        from app.tasks.career_populator import populate_careers_from_jobs
        result = await populate_careers_from_jobs(db)
        await db.flush()
        return {
            "message": "Career sync completed successfully",
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Career sync failed: {str(e)}"
        )
