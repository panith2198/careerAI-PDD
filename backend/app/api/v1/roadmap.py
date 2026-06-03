import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, desc
from pydantic import BaseModel

from app.core.database import get_db
from app.api.v1.deps import get_current_user
from app.models import User, Career, CareerSkill, Skill, Roadmap
from app.tasks.ai_tasks import generate_async_career_roadmap
import json
import heapq

router = APIRouter()

# Schema definitions for Roadmap endpoints
class RoadmapGeneratePayload(BaseModel):
    career_id: int
    hours_per_week: int
    target_months: int
    budget_inr: Optional[int] = 0

class MilestoneUpdatePayload(BaseModel):
    milestone_id: str
    completed: bool
    note: Optional[str] = None

@router.post("/generate", status_code=status.HTTP_202_ACCEPTED)
async def request_roadmap_generation(
    payload: RoadmapGeneratePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate personalized roadmap using Celery task queue integration.
    """
    # 1. Verify target career exists
    stmt_career = select(Career).where(Career.career_id == payload.career_id)
    res_career = await db.execute(stmt_career)
    career = res_career.scalar_one_or_none()
    
    if not career:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target career role not found."
        )

    # 2. Archive any existing active/draft roadmaps for this career to avoid UI conflicts
    from sqlalchemy import update
    stmt_archive = (
        update(Roadmap)
        .where(
            Roadmap.user_id == current_user.user_id,
            Roadmap.career_id == payload.career_id,
            Roadmap.status.in_(["active", "draft"])
        )
        .values(status="paused")
    )
    await db.execute(stmt_archive)

    # 3. Fetch career skills
    stmt_cs = select(CareerSkill, Skill).join(Skill, CareerSkill.skill_id == Skill.skill_id).where(
        CareerSkill.career_id == payload.career_id
    )
    res_cs = await db.execute(stmt_cs)
    career_skills = res_cs.all()
    
    skills_list = [sk for _, sk in career_skills]
    skills_str = ", ".join([s.skill_name for s in skills_list]) if skills_list else "General Professional Competencies"

    total_weeks = payload.target_months * 4
    milestones_data = None
    
    # Try AI Generation first
    try:
        from app.ai_engine.mistral_client import mistral_client
        
        prompt = f"""
        Generate a detailed, high-fidelity learning roadmap for transitioning into the role of '{career.title}'.
        The user has {total_weeks} weeks, committing {payload.hours_per_week} hours per week.
        Key skills to schedule: {skills_str}.
        
        You MUST return a valid JSON object matching the following structure exactly, with no markdown formatting tags and no extra conversational text:
        {{
            "phases": [
                {{
                    "phase": 1,
                    "weeks": "Weeks 1-4",
                    "topics": [
                        {{
                            "topic_id": "m_0_0",
                            "title": "Specific Topic 1 detailing core tools/frameworks for {career.title}",
                            "description": "Short description of what to learn and master in this topic",
                            "resources": [
                                {{
                                    "title": "Reference link, course, or book 1 for {career.title}",
                                    "type": "VIDEO COURSE",
                                    "author": "Author name or platform",
                                    "countText": "12 LESSONS",
                                    "url": "https://..."
                                }}
                            ],
                            "portfolio_project": {{
                                "title": "Milestone Portfolio Project Title",
                                "description": "Short description of project to build"
                            }}
                        }}
                    ]
                }}
            ]
        }}
        Provide 3 phases. Each phase should contain at least 2 detailed topics.
        Ensure there are no empty lists, empty strings, or nulls.
        """
        
        ai_response = await mistral_client.chat_completion(
            prompt=prompt,
            system_prompt="You are a professional technical education curriculum planner. You always output valid, clean JSON structures directly.",
            response_format="json"
        )
        
        if "Mock career guidance result" in ai_response or "your-mistral-api-key-here" in ai_response:
            raise ValueError("Mistral API key is unconfigured, using topological fallback.")
            
        milestones_data = json.loads(ai_response)
        if not isinstance(milestones_data, dict) or "phases" not in milestones_data:
            raise ValueError("Invalid JSON format from AI")
            
    except Exception as e:
        if not career_skills:
            phases = []
            for i in range(3):
                week_start = 1 + i * (total_weeks // 3)
                week_end = (i + 1) * (total_weeks // 3)
                phases.append({
                    "phase": i + 1,
                    "weeks": f"Weeks {week_start}-{week_end}",
                    "topics": [
                        {
                            "topic_id": f"m_{i}_0",
                            "title": f"Fundamentals of {career.title}" if i == 0 else (f"Intermediate {career.title} Patterns" if i == 1 else f"Advanced {career.title} Integration"),
                            "description": f"Learn core concepts and baseline tools for starting out as a {career.title}.",
                            "resources": [
                                {
                                    "title": f"Official {career.title} Starter Guide",
                                    "type": "ARTICLE",
                                    "author": "Industry Standard Docs",
                                    "countText": "5 MIN READ",
                                    "url": "https://docs.microsoft.com"
                                }
                            ],
                            "portfolio_project": {
                                "title": f"Baseline {career.title} Sandbox App",
                                "description": "Create a fully functional test sandbox project containing basic utilities."
                            }
                        }
                    ]
                })
            milestones_data = {"phases": phases}
        else:
            all_skill_ids = [cs.skill_id for cs, _ in career_skills]
            skills_map = {skill.skill_id: skill for _, skill in career_skills}
            importance_map = {cs.skill_id: cs.importance for cs, _ in career_skills}
            
            adj = {sid: [] for sid in all_skill_ids}
            in_degree = {sid: 0 for sid in all_skill_ids}
            
            for cs, skill in career_skills:
                if skill.parent_skill_id and skill.parent_skill_id in adj:
                    adj[skill.parent_skill_id].append(skill.skill_id)
                    in_degree[skill.skill_id] += 1
                    
            importance_score = {"must_have": 1, "good_to_have": 2, "optional": 3}
            heap = []
            for sid in all_skill_ids:
                if in_degree[sid] == 0:
                    imp = importance_score.get(importance_map[sid], 3)
                    heapq.heappush(heap, (0, imp, sid))
                    
            sorted_skills = []
            while heap:
                _, _, u = heapq.heappop(heap)
                sorted_skills.append(skills_map[u])
                for v in adj[u]:
                    in_degree[v] -= 1
                    if in_degree[v] == 0:
                        imp = importance_score.get(importance_map[v], 3)
                        heapq.heappush(heap, (0, imp, v))
                        
            for sid in all_skill_ids:
                if skills_map[sid] not in sorted_skills:
                    sorted_skills.append(skills_map[sid])
                    
            weeks = total_weeks if total_weeks > 0 else 12
            phase_count = min(3, len(sorted_skills))
            skills_per_phase = max(1, len(sorted_skills) // phase_count) if phase_count > 0 else 1
            
            phases = []
            for i in range(phase_count):
                phase_skills = sorted_skills[i * skills_per_phase : (i + 1) * skills_per_phase]
                week_start = 1 + i * (weeks // phase_count)
                week_end = (i + 1) * (weeks // phase_count)
                
                topics = []
                for idx, s in enumerate(phase_skills):
                    topics.append({
                        "topic_id": f"m_{i}_{idx}",
                        "title": f"Master {s.skill_name}",
                        "description": f"Deep dive study on {s.skill_name} architectures, data validation, and core pipelines.",
                        "resources": [
                            {
                                "title": f"Introduction to {s.skill_name}",
                                "type": "ARTICLE",
                                "author": f"{s.skill_name} Experts Team",
                                "countText": "10 MIN READ",
                                "url": "https://github.com"
                            },
                            {
                                "title": f"{s.skill_name} Practice Labs",
                                "type": "TUTORIAL",
                                "author": "Open Source Community",
                                "countText": "5 STEPS",
                                "url": "https://mdn.mozilla.org"
                            }
                        ],
                        "portfolio_project": {
                            "title": f"Custom {s.skill_name} Integration Project",
                            "description": f"Build a robust implementation module applying key concepts of {s.skill_name}."
                        }
                    })
                
                phases.append({
                    "phase": i + 1,
                    "weeks": f"Weeks {week_start}-{week_end}",
                    "topics": topics if topics else [
                        {
                            "topic_id": f"m_{i}_0",
                            "title": f"Topics for phase {i+1}",
                            "description": "General domain knowledge topics.",
                            "resources": [],
                            "portfolio_project": {
                                "title": "Phase Capstone",
                                "description": "Complete phase exercises."
                            }
                        }
                    ]
                })
            milestones_data = {"phases": phases}

    # 4. Create active Roadmap entry
    new_roadmap = Roadmap(
        user_id=current_user.user_id,
        career_id=payload.career_id,
        title=f"Become a {career.title} in {payload.target_months}M",
        total_weeks=total_weeks,
        hours_per_week=payload.hours_per_week,
        status="active",
        completion_pct=0.00,
        ai_model_used="mistral-large-latest",
        milestones_json=milestones_data
    )
    db.add(new_roadmap)
    await db.flush()

    # Trigger system notification
    try:
        from app.services.notification_service import notification_service
        await notification_service.send_system_notification(
            user_id=current_user.user_id,
            title="Roadmap Generated",
            message=f"Your personalized learning roadmap for {career.title} has been generated successfully!",
            type="roadmap",
            db=db
        )
    except Exception as ne:
        import traceback
        traceback.print_exc()

    await db.commit()

    return {
        "task_id": "roadmap_task_sync",
        "roadmap_id": new_roadmap.roadmap_id
    }

@router.get("/list")
async def list_user_roadmaps(
    status: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch paginated listings of the user's active/paused roadmaps."""
    limit = 10
    offset = (page - 1) * limit
    
    conditions = [Roadmap.user_id == current_user.user_id]
    if status:
        conditions.append(Roadmap.status == status)
        
    count_stmt = select(func.count(Roadmap.roadmap_id)).where(and_(*conditions))
    count_res = await db.execute(count_stmt)
    total = count_res.scalar() or 0
    
    stmt = (
        select(Roadmap)
        .where(and_(*conditions))
        .order_by(desc(Roadmap.generated_at))
        .offset(offset)
        .limit(limit)
    )
    res = await db.execute(stmt)
    items = res.scalars().all()
    
    return {
        "items": [
            {
                "roadmap_id": r.roadmap_id,
                "career_id": r.career_id,
                "title": r.title,
                "total_weeks": r.total_weeks,
                "hours_per_week": r.hours_per_week,
                "status": r.status,
                "completion_pct": float(r.completion_pct),
                "generated_at": r.generated_at.isoformat()
            } for r in items
        ],
        "total": total,
        "page": page
    }

@router.get("/{id}")
async def get_roadmap_details(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full roadmap details, milestones structure, and course citations."""
    stmt = select(Roadmap).where(Roadmap.roadmap_id == id, Roadmap.user_id == current_user.user_id)
    res = await db.execute(stmt)
    roadmap = res.scalar_one_or_none()
    
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found or access denied."
        )
        
    return {
        "roadmap_id": roadmap.roadmap_id,
        "title": roadmap.title,
        "total_weeks": roadmap.total_weeks,
        "hours_per_week": roadmap.hours_per_week,
        "status": roadmap.status,
        "completion_pct": float(roadmap.completion_pct),
        "milestones_json": roadmap.milestones_json,
        "rag_sources": [f"kb_courses_career_{roadmap.career_id}"],
        "generated_at": roadmap.generated_at.isoformat()
    }

@router.patch("/{id}/milestone")
async def update_roadmap_milestone(
    id: int,
    payload: MilestoneUpdatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update active roadmap milestone completion states and re-calculate percentage progress."""
    stmt = select(Roadmap).where(Roadmap.roadmap_id == id, Roadmap.user_id == current_user.user_id)
    res = await db.execute(stmt)
    roadmap = res.scalar_one_or_none()
    
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found or access denied."
        )

    # Fetch/mutate milestones_json copy
    milestones = dict(roadmap.milestones_json or {})
    completed_list = list(milestones.get("completed_milestones", []))
    
    if payload.completed:
        if payload.milestone_id not in completed_list:
            completed_list.append(payload.milestone_id)
    else:
        if payload.milestone_id in completed_list:
            completed_list.remove(payload.milestone_id)
            
    milestones["completed_milestones"] = completed_list
    roadmap.milestones_json = milestones
    
    # Calculate exact progress
    total_milestones = 0
    phases = milestones.get("phases", [])
    for phase in phases:
        topics = phase.get("topics", [])
        total_milestones += len(topics)
        
    if total_milestones > 0:
        new_pct = (len(completed_list) / total_milestones) * 100.0
    else:
        new_pct = 0.0
        
    roadmap.completion_pct = min(100.0, max(0.0, new_pct))
    roadmap.status = "active"
    roadmap.last_activity_at = datetime.datetime.utcnow()
    
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(roadmap, "milestones_json")
    
    await db.commit()
    
    return {
        "completion_pct": float(roadmap.completion_pct),
        "updated_at": roadmap.last_activity_at.isoformat()
    }

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def archive_roadmap(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Soft delete roadmap listings (status=paused or archived)."""
    stmt = select(Roadmap).where(Roadmap.roadmap_id == id, Roadmap.user_id == current_user.user_id)
    res = await db.execute(stmt)
    roadmap = res.scalar_one_or_none()
    
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found or access denied."
        )

    # Soft delete / archiving
    roadmap.status = "archived"
    await db.flush()
    return None


