"""
Career Populator Service
========================
Analyzes scraped job data to dynamically create/update career paths,
link career_skills with proper importance/proficiency, and expand
the skill taxonomy from real job market data.
"""

import logging
import re
import datetime
from typing import Dict, List, Optional, Tuple, Any
from collections import Counter, defaultdict

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_

from app.core.database import AsyncSessionLocal
from app.models import Career, CareerSkill, Skill, Job

logger = logging.getLogger("career_populator")

# ── Career Title Classification Rules ──────────────────────────────────────
# Maps raw job titles to canonical career names using keyword patterns.
# Order matters — more specific patterns should come first.
CAREER_CLASSIFICATION_RULES: List[Tuple[List[str], str, str, str]] = [
    # (keywords_any, career_title, career_category, career_slug)
    # AI & Machine Learning
    (["machine learning", "ml engineer", "ml developer"], "ML Engineer", "AI & Machine Learning", "ml-engineer"),
    (["deep learning", "nlp engineer", "computer vision"], "ML Engineer", "AI & Machine Learning", "ml-engineer"),
    (["ai engineer", "artificial intelligence"], "AI Engineer", "AI & Machine Learning", "ai-engineer"),
    (["data scientist", "data science"], "Data Scientist", "Data Science", "data-scientist"),
    (["data analyst", "business intelligence analyst", "bi analyst", "bi developer"], "Data Analyst", "Data Science", "data-analyst"),
    (["data engineer", "etl developer", "data pipeline"], "Data Engineer", "Data Science", "data-engineer"),

    # Web Development
    (["frontend developer", "front-end developer", "front end developer", "react developer",
      "react engineer", "angular developer", "vue developer", "ui developer", "ui engineer"],
     "Frontend Developer", "Web Development", "frontend-developer"),
    (["backend developer", "back-end developer", "back end developer", "server-side",
      "node.js developer", "django developer", "flask developer", "spring developer",
      "api developer"],
     "Backend Developer", "Web Development", "backend-developer"),
    (["full stack", "fullstack", "full-stack"], "Full Stack Developer", "Web Development", "full-stack-developer"),
    (["web developer", "web engineer"], "Full Stack Developer", "Web Development", "full-stack-developer"),

    # Mobile Development
    (["android developer", "android engineer", "kotlin developer"], "Android Developer", "Mobile Development", "android-developer"),
    (["ios developer", "ios engineer", "swift developer"], "iOS Developer", "Mobile Development", "ios-developer"),
    (["mobile developer", "mobile engineer", "react native", "flutter"], "Mobile Developer", "Mobile Development", "mobile-developer"),

    # Cloud & DevOps
    (["devops", "dev ops", "site reliability", "sre", "platform engineer"],
     "DevOps Engineer", "Cloud & Operations", "devops-engineer"),
    (["cloud engineer", "cloud architect", "aws engineer", "azure engineer", "gcp engineer"],
     "Cloud Engineer", "Cloud & Operations", "cloud-engineer"),

    # Security
    (["security engineer", "cybersecurity", "infosec", "penetration tester", "security analyst"],
     "Cybersecurity Analyst", "Security", "cybersecurity-analyst"),

    # Quality Assurance
    (["qa engineer", "quality assurance", "test engineer", "sdet", "automation tester",
      "software tester", "test automation"],
     "QA Engineer", "Quality Assurance", "qa-engineer"),

    # Management & Business
    (["product manager", "product owner"], "Product Manager", "Management", "product-manager"),
    (["project manager", "program manager", "scrum master", "agile coach"],
     "Project Manager", "Management", "project-manager"),
    (["business analyst", "business systems analyst"], "Business Analyst", "Business Intelligence", "business-analyst"),

    # Design
    (["ui/ux", "ux designer", "ui designer", "user experience", "user interface", "product designer"],
     "UI/UX Designer", "Design", "ui-ux-designer"),

    # Catch-all Engineering
    (["software engineer", "software developer", "sde", "application developer",
      "systems engineer", "solutions engineer"],
     "Software Engineer", "Engineering", "software-engineer"),
    (["technical architect", "solution architect", "system architect", "enterprise architect"],
     "Software Architect", "Engineering", "software-architect"),
    (["database administrator", "dba", "database architect", "database engineer"],
     "Database Administrator", "Engineering", "database-administrator"),
]

# ── Extended Skills to Auto-Create ─────────────────────────────────────────
EXTENDED_SKILLS_DEFINITIONS = {
    # Technical skills
    "JavaScript": {"slug": "javascript", "category": "technical", "domain": "Web Development"},
    "TypeScript": {"slug": "typescript", "category": "technical", "domain": "Web Development"},
    "Java": {"slug": "java", "category": "technical", "domain": "Enterprise"},
    "C++": {"slug": "cpp", "category": "technical", "domain": "Systems Programming"},
    "C#": {"slug": "csharp", "category": "technical", "domain": "Enterprise"},
    "Go": {"slug": "go", "category": "technical", "domain": "Backend Development"},
    "Rust": {"slug": "rust", "category": "technical", "domain": "Systems Programming"},
    "Ruby": {"slug": "ruby", "category": "technical", "domain": "Web Development"},
    "PHP": {"slug": "php", "category": "technical", "domain": "Web Development"},
    "Node.js": {"slug": "nodejs", "category": "technical", "domain": "Backend Development"},
    "Angular": {"slug": "angular", "category": "technical", "domain": "Web Development"},
    "Vue.js": {"slug": "vuejs", "category": "technical", "domain": "Web Development"},
    "Next.js": {"slug": "nextjs", "category": "technical", "domain": "Web Development"},
    "Django": {"slug": "django", "category": "technical", "domain": "Web Development"},
    "Flask": {"slug": "flask", "category": "technical", "domain": "Web Development"},
    "Spring Boot": {"slug": "spring-boot", "category": "technical", "domain": "Enterprise"},
    "TensorFlow": {"slug": "tensorflow", "category": "technical", "domain": "AI & Machine Learning"},
    "PyTorch": {"slug": "pytorch", "category": "technical", "domain": "AI & Machine Learning"},
    "Pandas": {"slug": "pandas", "category": "technical", "domain": "Data Science"},
    "NumPy": {"slug": "numpy", "category": "technical", "domain": "Data Science"},
    "Scikit-learn": {"slug": "scikit-learn", "category": "technical", "domain": "Data Science"},
    "MongoDB": {"slug": "mongodb", "category": "technical", "domain": "Databases"},
    "Redis": {"slug": "redis", "category": "technical", "domain": "Databases"},
    "GraphQL": {"slug": "graphql", "category": "technical", "domain": "API Development"},
    "REST API": {"slug": "rest-api", "category": "technical", "domain": "API Development"},
    "Terraform": {"slug": "terraform", "category": "tool", "domain": "DevOps"},
    "Ansible": {"slug": "ansible", "category": "tool", "domain": "DevOps"},
    "Jenkins": {"slug": "jenkins", "category": "tool", "domain": "DevOps"},

    # Cloud platforms
    "AWS": {"slug": "aws", "category": "technical", "domain": "Cloud"},
    "Azure": {"slug": "azure", "category": "technical", "domain": "Cloud"},
    "GCP": {"slug": "gcp", "category": "technical", "domain": "Cloud"},

    # Tools
    "Jira": {"slug": "jira", "category": "tool", "domain": "Project Management"},
    "Figma": {"slug": "figma", "category": "tool", "domain": "Design"},
    "Linux": {"slug": "linux", "category": "technical", "domain": "Systems"},
    "CI/CD": {"slug": "cicd", "category": "tool", "domain": "DevOps"},

    # Soft skills
    "Communication": {"slug": "communication", "category": "soft", "domain": "General"},
    "Problem Solving": {"slug": "problem-solving", "category": "soft", "domain": "General"},
    "Leadership": {"slug": "leadership", "category": "soft", "domain": "Management"},
    "Agile": {"slug": "agile", "category": "domain", "domain": "Project Management"},
}

# ── Static Career Seed (Fallback) ─────────────────────────────────────────
STATIC_CAREER_SEED = [
    {
        "title": "Software Engineer",
        "slug": "software-engineer",
        "category": "Engineering",
        "description": "Design, develop, and maintain scalable software systems using modern programming languages and engineering best practices. Collaborate with cross-functional teams to deliver high-quality applications.",
        "avg_salary_min": 600000,
        "avg_salary_max": 2500000,
        "growth_rate_pct": 22.0,
        "demand_score": 95.0,
        "difficulty_level": "medium",
        "time_to_job_ready_months": 6,
        "skills": [("Python", "must_have", "intermediate"), ("JavaScript", "must_have", "intermediate"), ("Git", "must_have", "beginner"), ("SQL", "good_to_have", "intermediate"), ("Docker", "good_to_have", "beginner")]
    },
    {
        "title": "Frontend Developer",
        "slug": "frontend-developer",
        "category": "Web Development",
        "description": "Build responsive, high-performance user interfaces using modern JavaScript frameworks. Create pixel-perfect UI components with seamless user experiences and accessibility standards.",
        "avg_salary_min": 500000,
        "avg_salary_max": 2000000,
        "growth_rate_pct": 18.5,
        "demand_score": 91.0,
        "difficulty_level": "medium",
        "time_to_job_ready_months": 5,
        "skills": [("React", "must_have", "intermediate"), ("JavaScript", "must_have", "intermediate"), ("Git", "must_have", "beginner"), ("TypeScript", "good_to_have", "beginner")]
    },
    {
        "title": "Backend Developer",
        "slug": "backend-developer",
        "category": "Web Development",
        "description": "Architect and build robust server-side applications, RESTful APIs, and microservices. Manage databases, implement authentication, and ensure application scalability and security.",
        "avg_salary_min": 600000,
        "avg_salary_max": 2200000,
        "growth_rate_pct": 19.0,
        "demand_score": 90.0,
        "difficulty_level": "medium",
        "time_to_job_ready_months": 6,
        "skills": [("Python", "must_have", "intermediate"), ("SQL", "must_have", "intermediate"), ("Docker", "good_to_have", "beginner"), ("Git", "must_have", "beginner"), ("REST API", "good_to_have", "intermediate")]
    },
    {
        "title": "Full Stack Developer",
        "slug": "full-stack-developer",
        "category": "Web Development",
        "description": "Develop end-to-end web applications spanning frontend interfaces and backend services. Manage the complete software development lifecycle from database design to deployment.",
        "avg_salary_min": 700000,
        "avg_salary_max": 2500000,
        "growth_rate_pct": 20.0,
        "demand_score": 93.0,
        "difficulty_level": "hard",
        "time_to_job_ready_months": 8,
        "skills": [("React", "must_have", "intermediate"), ("Python", "must_have", "intermediate"), ("SQL", "must_have", "intermediate"), ("Git", "must_have", "beginner"), ("Docker", "good_to_have", "beginner")]
    },
    {
        "title": "DevOps Engineer",
        "slug": "devops-engineer",
        "category": "Cloud & Operations",
        "description": "Automate infrastructure provisioning, CI/CD pipelines, and container orchestration. Bridge development and operations to optimize software delivery velocity and system reliability.",
        "avg_salary_min": 800000,
        "avg_salary_max": 2800000,
        "growth_rate_pct": 24.0,
        "demand_score": 94.0,
        "difficulty_level": "hard",
        "time_to_job_ready_months": 9,
        "skills": [("Docker", "must_have", "intermediate"), ("Kubernetes", "must_have", "intermediate"), ("Git", "must_have", "beginner"), ("Python", "good_to_have", "beginner"), ("Linux", "good_to_have", "intermediate"), ("AWS", "good_to_have", "beginner")]
    },
    {
        "title": "Data Analyst",
        "slug": "data-analyst",
        "category": "Data Science",
        "description": "Transform raw datasets into actionable business insights through statistical analysis, visualization, and reporting. Build interactive dashboards and drive data-informed decision-making.",
        "avg_salary_min": 400000,
        "avg_salary_max": 1500000,
        "growth_rate_pct": 15.5,
        "demand_score": 88.0,
        "difficulty_level": "medium",
        "time_to_job_ready_months": 4,
        "skills": [("Python", "must_have", "intermediate"), ("SQL", "must_have", "intermediate"), ("Git", "good_to_have", "beginner")]
    },
    {
        "title": "Data Scientist",
        "slug": "data-scientist",
        "category": "Data Science",
        "description": "Apply advanced statistical modeling, machine learning algorithms, and predictive analytics to solve complex business problems. Communicate insights to stakeholders through compelling data storytelling.",
        "avg_salary_min": 800000,
        "avg_salary_max": 3000000,
        "growth_rate_pct": 28.0,
        "demand_score": 92.0,
        "difficulty_level": "hard",
        "time_to_job_ready_months": 10,
        "skills": [("Python", "must_have", "advanced"), ("SQL", "must_have", "intermediate"), ("Git", "good_to_have", "beginner")]
    },
    {
        "title": "Data Engineer",
        "slug": "data-engineer",
        "category": "Data Science",
        "description": "Design and build scalable data pipelines, ETL workflows, and data warehousing solutions. Ensure data quality, availability, and governance across the organization's data infrastructure.",
        "avg_salary_min": 700000,
        "avg_salary_max": 2500000,
        "growth_rate_pct": 25.0,
        "demand_score": 89.0,
        "difficulty_level": "hard",
        "time_to_job_ready_months": 8,
        "skills": [("Python", "must_have", "intermediate"), ("SQL", "must_have", "advanced"), ("Docker", "good_to_have", "beginner"), ("AWS", "good_to_have", "beginner")]
    },
    {
        "title": "ML Engineer",
        "slug": "ml-engineer",
        "category": "AI & Machine Learning",
        "description": "Build, train, and deploy production-grade machine learning models. Optimize model performance, implement MLOps pipelines, and integrate AI capabilities into scalable applications.",
        "avg_salary_min": 1000000,
        "avg_salary_max": 3500000,
        "growth_rate_pct": 32.0,
        "demand_score": 90.0,
        "difficulty_level": "expert",
        "time_to_job_ready_months": 12,
        "skills": [("Python", "must_have", "advanced"), ("SQL", "good_to_have", "intermediate"), ("Docker", "good_to_have", "intermediate"), ("Git", "must_have", "beginner")]
    },
    {
        "title": "AI Engineer",
        "slug": "ai-engineer",
        "category": "AI & Machine Learning",
        "description": "Research and implement state-of-the-art AI systems including large language models, computer vision, and natural language processing solutions for enterprise applications.",
        "avg_salary_min": 1200000,
        "avg_salary_max": 4000000,
        "growth_rate_pct": 35.0,
        "demand_score": 88.0,
        "difficulty_level": "expert",
        "time_to_job_ready_months": 14,
        "skills": [("Python", "must_have", "advanced"), ("SQL", "good_to_have", "intermediate"), ("Git", "must_have", "beginner")]
    },
    {
        "title": "Android Developer",
        "slug": "android-developer",
        "category": "Mobile Development",
        "description": "Design and build high-performance native Android applications using Kotlin and modern Android development tools. Implement Material Design patterns and optimize app performance.",
        "avg_salary_min": 500000,
        "avg_salary_max": 2000000,
        "growth_rate_pct": 16.5,
        "demand_score": 86.0,
        "difficulty_level": "medium",
        "time_to_job_ready_months": 6,
        "skills": [("Kotlin", "must_have", "intermediate"), ("Git", "must_have", "beginner")]
    },
    {
        "title": "iOS Developer",
        "slug": "ios-developer",
        "category": "Mobile Development",
        "description": "Create elegant, performant iOS applications using Swift and SwiftUI. Follow Apple Human Interface Guidelines and implement native platform features for seamless user experiences.",
        "avg_salary_min": 600000,
        "avg_salary_max": 2200000,
        "growth_rate_pct": 14.0,
        "demand_score": 82.0,
        "difficulty_level": "medium",
        "time_to_job_ready_months": 6,
        "skills": [("Swift", "must_have", "intermediate"), ("Git", "must_have", "beginner")]
    },
    {
        "title": "Cloud Engineer",
        "slug": "cloud-engineer",
        "category": "Cloud & Operations",
        "description": "Design and manage cloud infrastructure on AWS, Azure, or GCP. Implement IaC, autoscaling, monitoring, and cost optimization strategies for enterprise cloud deployments.",
        "avg_salary_min": 900000,
        "avg_salary_max": 3000000,
        "growth_rate_pct": 26.0,
        "demand_score": 91.0,
        "difficulty_level": "hard",
        "time_to_job_ready_months": 9,
        "skills": [("AWS", "must_have", "intermediate"), ("Docker", "must_have", "intermediate"), ("Kubernetes", "good_to_have", "beginner"), ("Python", "good_to_have", "beginner"), ("Linux", "good_to_have", "intermediate")]
    },
    {
        "title": "QA Engineer",
        "slug": "qa-engineer",
        "category": "Quality Assurance",
        "description": "Design comprehensive test strategies, automate regression suites, and ensure software quality through systematic testing methodologies. Collaborate with development teams to shift testing left.",
        "avg_salary_min": 400000,
        "avg_salary_max": 1500000,
        "growth_rate_pct": 12.0,
        "demand_score": 80.0,
        "difficulty_level": "medium",
        "time_to_job_ready_months": 5,
        "skills": [("Python", "must_have", "intermediate"), ("SQL", "good_to_have", "beginner"), ("Git", "must_have", "beginner")]
    },
    {
        "title": "Cybersecurity Analyst",
        "slug": "cybersecurity-analyst",
        "category": "Security",
        "description": "Protect organizational assets by monitoring security threats, conducting vulnerability assessments, and implementing security controls. Respond to incidents and maintain compliance frameworks.",
        "avg_salary_min": 600000,
        "avg_salary_max": 2500000,
        "growth_rate_pct": 30.0,
        "demand_score": 87.0,
        "difficulty_level": "hard",
        "time_to_job_ready_months": 8,
        "skills": [("Python", "good_to_have", "intermediate"), ("Linux", "must_have", "intermediate"), ("SQL", "good_to_have", "beginner")]
    },
    {
        "title": "UI/UX Designer",
        "slug": "ui-ux-designer",
        "category": "Design",
        "description": "Create user-centered digital experiences through research, wireframing, prototyping, and usability testing. Translate business requirements into intuitive, accessible, and visually compelling interfaces.",
        "avg_salary_min": 400000,
        "avg_salary_max": 1800000,
        "growth_rate_pct": 13.0,
        "demand_score": 78.0,
        "difficulty_level": "medium",
        "time_to_job_ready_months": 6,
        "skills": [("Figma", "must_have", "intermediate"), ("React", "good_to_have", "beginner")]
    },
    {
        "title": "Product Manager",
        "slug": "product-manager",
        "category": "Management",
        "description": "Define product vision, strategy, and roadmap. Prioritize features based on user research, business goals, and technical feasibility. Drive cross-functional alignment and measure product success metrics.",
        "avg_salary_min": 800000,
        "avg_salary_max": 3000000,
        "growth_rate_pct": 17.0,
        "demand_score": 85.0,
        "difficulty_level": "hard",
        "time_to_job_ready_months": 8,
        "skills": [("SQL", "good_to_have", "beginner"), ("Jira", "good_to_have", "intermediate"), ("Agile", "must_have", "intermediate")]
    },
    {
        "title": "Business Analyst",
        "slug": "business-analyst",
        "category": "Business Intelligence",
        "description": "Bridge business needs and technology solutions by gathering requirements, analyzing processes, and recommending improvements. Create detailed documentation and facilitate stakeholder communication.",
        "avg_salary_min": 400000,
        "avg_salary_max": 1500000,
        "growth_rate_pct": 11.0,
        "demand_score": 79.0,
        "difficulty_level": "medium",
        "time_to_job_ready_months": 5,
        "skills": [("SQL", "must_have", "intermediate"), ("Python", "good_to_have", "beginner")]
    },
    {
        "title": "Software Architect",
        "slug": "software-architect",
        "category": "Engineering",
        "description": "Design large-scale system architectures, define technical standards, and guide engineering teams on best practices. Evaluate technology choices and ensure systems meet non-functional requirements.",
        "avg_salary_min": 1500000,
        "avg_salary_max": 4500000,
        "growth_rate_pct": 20.0,
        "demand_score": 84.0,
        "difficulty_level": "expert",
        "time_to_job_ready_months": 18,
        "skills": [("Python", "must_have", "advanced"), ("Docker", "must_have", "advanced"), ("Kubernetes", "good_to_have", "intermediate"), ("SQL", "must_have", "advanced"), ("AWS", "good_to_have", "intermediate")]
    },
    {
        "title": "Database Administrator",
        "slug": "database-administrator",
        "category": "Engineering",
        "description": "Manage, optimize, and secure database systems for high availability and performance. Implement backup strategies, monitor query performance, and ensure data integrity across production environments.",
        "avg_salary_min": 500000,
        "avg_salary_max": 2000000,
        "growth_rate_pct": 9.0,
        "demand_score": 75.0,
        "difficulty_level": "hard",
        "time_to_job_ready_months": 7,
        "skills": [("SQL", "must_have", "advanced"), ("Python", "good_to_have", "beginner"), ("Linux", "good_to_have", "intermediate")]
    },
]


def classify_job_title(title: str) -> Optional[Tuple[str, str, str]]:
    """
    Classify a raw job title into a canonical career (title, category, slug).
    Returns None if no match is found.
    """
    title_lower = title.lower().strip()
    for keywords, career_title, category, slug in CAREER_CLASSIFICATION_RULES:
        for kw in keywords:
            if kw in title_lower:
                return career_title, category, slug
    return None


async def ensure_skills_exist(session: AsyncSession) -> Dict[str, int]:
    """
    Ensure all extended skills exist in the skills table.
    Returns a map of skill_name (lowercase) -> skill_id.
    """
    # Fetch existing skills
    res = await session.execute(select(Skill))
    existing_skills = res.scalars().all()
    skills_map = {s.skill_name.lower().strip(): s.skill_id for s in existing_skills}

    # Create missing skills from extended definitions
    for skill_name, attrs in EXTENDED_SKILLS_DEFINITIONS.items():
        if skill_name.lower().strip() not in skills_map:
            # Check if slug already exists
            slug_check = await session.execute(
                select(Skill).where(Skill.skill_slug == attrs["slug"])
            )
            if slug_check.scalar_one_or_none():
                continue

            new_skill = Skill(
                skill_name=skill_name,
                skill_slug=attrs["slug"],
                category=attrs["category"],
                domain=attrs["domain"],
                market_demand_score=70.0,
                is_trending=False
            )
            session.add(new_skill)
            await session.flush()
            skills_map[skill_name.lower().strip()] = new_skill.skill_id
            logger.info(f"Created new skill: {skill_name} (ID={new_skill.skill_id})")

    return skills_map


async def populate_careers_from_jobs(session: Optional[AsyncSession] = None) -> Dict[str, Any]:
    """
    Main entry point: analyze scraped jobs and create/update career entries.
    If no jobs exist, falls back to static seed data.
    """
    own_session = session is None
    if own_session:
        session = AsyncSessionLocal()

    try:
        result = await _do_populate(session)
        if own_session:
            await session.commit()
        return result
    except Exception as e:
        if own_session:
            await session.rollback()
        logger.error(f"Career population failed: {e}")
        raise
    finally:
        if own_session:
            await session.close()


async def _do_populate(session: AsyncSession) -> Dict[str, Any]:
    """Core population logic."""
    # 1. Ensure extended skills exist
    skills_map = await ensure_skills_exist(session)
    await session.flush()

    # Re-fetch skills_map after flush to ensure all IDs are current
    res_skills = await session.execute(select(Skill))
    all_skills = res_skills.scalars().all()
    skills_map = {s.skill_name.lower().strip(): s.skill_id for s in all_skills}

    # 2. Check if we have jobs to analyze
    job_count_res = await session.execute(select(func.count(Job.job_id)))
    job_count = job_count_res.scalar() or 0

    if job_count == 0:
        logger.info("No jobs found in database. Using static career seed.")
        return await _seed_static_careers(session, skills_map)

    # 3. Fetch all active jobs
    jobs_res = await session.execute(select(Job).where(Job.is_active == True))
    jobs = jobs_res.scalars().all()
    logger.info(f"Analyzing {len(jobs)} jobs to derive career data...")

    # 4. Classify jobs into career buckets
    career_buckets: Dict[str, Dict[str, Any]] = {}
    for job in jobs:
        classification = classify_job_title(job.title)
        if classification is None:
            continue

        career_title, category, slug = classification
        if career_title not in career_buckets:
            career_buckets[career_title] = {
                "title": career_title,
                "category": category,
                "slug": slug,
                "jobs": [],
                "salaries_min": [],
                "salaries_max": [],
                "experience_months": [],
                "skills_counter": Counter(),
            }

        bucket = career_buckets[career_title]
        bucket["jobs"].append(job)

        if job.salary_min and job.salary_min > 0:
            bucket["salaries_min"].append(job.salary_min)
        if job.salary_max and job.salary_max > 0:
            bucket["salaries_max"].append(job.salary_max)
        if job.experience_min_months and job.experience_min_months > 0:
            bucket["experience_months"].append(job.experience_min_months)

        # Count skill occurrences
        if job.required_skills_json and isinstance(job.required_skills_json, list):
            for skill_name in job.required_skills_json:
                bucket["skills_counter"][skill_name.lower().strip()] += 1

    if not career_buckets:
        logger.info("No job titles matched career classification rules. Using static seed.")
        return await _seed_static_careers(session, skills_map)

    logger.info(f"Classified jobs into {len(career_buckets)} career categories")

    # 5. Also seed any static careers not found in job data for comprehensive coverage
    static_titles = {c["title"] for c in STATIC_CAREER_SEED}
    job_derived_titles = set(career_buckets.keys())
    missing_static = static_titles - job_derived_titles

    # 6. Create/update career records from job analysis
    careers_created = 0
    careers_updated = 0

    for career_title, bucket in career_buckets.items():
        num_jobs = len(bucket["jobs"])

        # Compute salary aggregates (use median for robustness)
        avg_salary_min = _median(bucket["salaries_min"]) if bucket["salaries_min"] else None
        avg_salary_max = _median(bucket["salaries_max"]) if bucket["salaries_max"] else None

        # Salary sanity check: if median from scraped data is unreasonably low
        # (e.g. < ₹200K/year), prefer the static fallback values
        static_match = next((s for s in STATIC_CAREER_SEED if s["title"] == career_title), None)
        MIN_REASONABLE_SALARY = 200000  # ₹2L minimum

        if avg_salary_min is not None and avg_salary_min < MIN_REASONABLE_SALARY:
            avg_salary_min = static_match["avg_salary_min"] if static_match else 500000
        if avg_salary_max is not None and avg_salary_max < MIN_REASONABLE_SALARY:
            avg_salary_max = static_match["avg_salary_max"] if static_match else 1800000

        # If no salary data from jobs, use static fallback
        if avg_salary_min is None or avg_salary_max is None:
            if static_match:
                avg_salary_min = avg_salary_min or static_match["avg_salary_min"]
                avg_salary_max = avg_salary_max or static_match["avg_salary_max"]
            else:
                avg_salary_min = avg_salary_min or 500000
                avg_salary_max = avg_salary_max or 1800000

        # Ensure min <= max
        if avg_salary_min and avg_salary_max and avg_salary_min > avg_salary_max:
            avg_salary_min, avg_salary_max = avg_salary_max, avg_salary_min

        # Compute demand score (normalize based on job count, max 99)
        demand_score = min(99.0, 60.0 + (num_jobs * 2.5))

        # Compute difficulty level from avg experience
        avg_exp = _median(bucket["experience_months"]) if bucket["experience_months"] else 0
        if avg_exp >= 72:
            difficulty_level = "expert"
        elif avg_exp >= 36:
            difficulty_level = "hard"
        elif avg_exp >= 12:
            difficulty_level = "medium"
        else:
            difficulty_level = "easy"

        # Time to job ready (in months) — heuristic
        time_to_ready = max(3, min(18, int(avg_exp / 6))) if avg_exp > 0 else 6

        # Growth rate — estimated from demand
        growth_rate_pct = round(10.0 + (demand_score / 10.0), 1)

        # Get description from static seed or generate one
        static_match = next((s for s in STATIC_CAREER_SEED if s["title"] == career_title), None)
        description = static_match["description"] if static_match else f"Build expertise in {career_title} through hands-on projects and industry-relevant skills. This career path offers strong growth opportunities in the technology sector."

        # Upsert career record
        existing = await session.execute(
            select(Career).where(Career.slug == bucket["slug"])
        )
        career_obj = existing.scalar_one_or_none()

        if career_obj:
            career_obj.avg_salary_min = avg_salary_min
            career_obj.avg_salary_max = avg_salary_max
            career_obj.demand_score = demand_score
            career_obj.growth_rate_pct = growth_rate_pct
            career_obj.difficulty_level = difficulty_level
            career_obj.time_to_job_ready_months = time_to_ready
            career_obj.is_active = True
            careers_updated += 1
        else:
            career_obj = Career(
                title=career_title,
                slug=bucket["slug"],
                category=bucket["category"],
                description=description,
                avg_salary_min=avg_salary_min,
                avg_salary_max=avg_salary_max,
                growth_rate_pct=growth_rate_pct,
                demand_score=demand_score,
                difficulty_level=difficulty_level,
                time_to_job_ready_months=time_to_ready,
                is_active=True
            )
            session.add(career_obj)
            careers_created += 1

        await session.flush()

        # 7. Link career_skills based on skill frequency in matched jobs
        await _link_career_skills(session, career_obj, bucket["skills_counter"], num_jobs, skills_map)

        # Also link career to matching jobs
        for job in bucket["jobs"]:
            if job.career_id != career_obj.career_id:
                job.career_id = career_obj.career_id

    # 8. Seed remaining static careers not covered by job data
    for static_career in STATIC_CAREER_SEED:
        if static_career["title"] in missing_static:
            existing = await session.execute(
                select(Career).where(Career.slug == static_career["slug"])
            )
            if existing.scalar_one_or_none():
                continue

            career_obj = Career(
                title=static_career["title"],
                slug=static_career["slug"],
                category=static_career["category"],
                description=static_career["description"],
                avg_salary_min=static_career["avg_salary_min"],
                avg_salary_max=static_career["avg_salary_max"],
                growth_rate_pct=static_career["growth_rate_pct"],
                demand_score=static_career["demand_score"],
                difficulty_level=static_career["difficulty_level"],
                time_to_job_ready_months=static_career["time_to_job_ready_months"],
                is_active=True
            )
            session.add(career_obj)
            await session.flush()
            careers_created += 1

            # Link static skills
            for skill_name, importance, min_prof in static_career["skills"]:
                skill_id = skills_map.get(skill_name.lower().strip())
                if skill_id:
                    # Check if link already exists
                    link_check = await session.execute(
                        select(CareerSkill).where(
                            and_(
                                CareerSkill.career_id == career_obj.career_id,
                                CareerSkill.skill_id == skill_id
                            )
                        )
                    )
                    if not link_check.scalar_one_or_none():
                        cs = CareerSkill(
                            career_id=career_obj.career_id,
                            skill_id=skill_id,
                            importance=importance,
                            min_proficiency=min_prof,
                            weightage=5.0 if importance == "must_have" else 2.0 if importance == "good_to_have" else 1.0
                        )
                        session.add(cs)

    await session.flush()

    summary = {
        "careers_created": careers_created,
        "careers_updated": careers_updated,
        "total_career_buckets_from_jobs": len(career_buckets),
        "static_careers_added": len(missing_static),
        "total_skills": len(skills_map),
        "status": "success"
    }
    logger.info(f"Career population complete: {summary}")
    return summary


async def _link_career_skills(
    session: AsyncSession,
    career: Career,
    skills_counter: Counter,
    total_jobs: int,
    skills_map: Dict[str, int]
):
    """
    Link skills to a career based on frequency analysis from job data.
    Importance is determined by how often a skill appears across matching jobs.
    """
    if not skills_counter or total_jobs == 0:
        # Fall back to static skill definitions
        static_match = next((s for s in STATIC_CAREER_SEED if s["title"] == career.title), None)
        if static_match:
            for skill_name, importance, min_prof in static_match["skills"]:
                skill_id = skills_map.get(skill_name.lower().strip())
                if skill_id:
                    link_check = await session.execute(
                        select(CareerSkill).where(
                            and_(
                                CareerSkill.career_id == career.career_id,
                                CareerSkill.skill_id == skill_id
                            )
                        )
                    )
                    if not link_check.scalar_one_or_none():
                        cs = CareerSkill(
                            career_id=career.career_id,
                            skill_id=skill_id,
                            importance=importance,
                            min_proficiency=min_prof,
                            weightage=5.0 if importance == "must_have" else 2.0
                        )
                        session.add(cs)
        return

    # Delete existing career_skills for this career to rebuild
    existing_links = await session.execute(
        select(CareerSkill).where(CareerSkill.career_id == career.career_id)
    )
    for link in existing_links.scalars().all():
        await session.delete(link)
    await session.flush()

    # Process top skills by frequency
    for skill_name_lower, count in skills_counter.most_common(15):
        skill_id = skills_map.get(skill_name_lower)
        if not skill_id:
            continue

        frequency_ratio = count / total_jobs

        # Determine importance based on frequency
        if frequency_ratio >= 0.5:
            importance = "must_have"
            weightage = 5.0
        elif frequency_ratio >= 0.2:
            importance = "good_to_have"
            weightage = 2.5
        else:
            importance = "optional"
            weightage = 1.0

        # Determine minimum proficiency based on typical experience level
        if frequency_ratio >= 0.6:
            min_proficiency = "intermediate"
        elif frequency_ratio >= 0.3:
            min_proficiency = "beginner"
        else:
            min_proficiency = "beginner"

        cs = CareerSkill(
            career_id=career.career_id,
            skill_id=skill_id,
            importance=importance,
            min_proficiency=min_proficiency,
            weightage=round(weightage * frequency_ratio * 3, 2) + 1.0
        )
        session.add(cs)


async def _seed_static_careers(session: AsyncSession, skills_map: Dict[str, int]) -> Dict[str, Any]:
    """Seed all static careers when no job data is available."""
    created = 0

    for career_data in STATIC_CAREER_SEED:
        # Check if career already exists
        existing = await session.execute(
            select(Career).where(Career.slug == career_data["slug"])
        )
        if existing.scalar_one_or_none():
            continue

        career = Career(
            title=career_data["title"],
            slug=career_data["slug"],
            category=career_data["category"],
            description=career_data["description"],
            avg_salary_min=career_data["avg_salary_min"],
            avg_salary_max=career_data["avg_salary_max"],
            growth_rate_pct=career_data["growth_rate_pct"],
            demand_score=career_data["demand_score"],
            difficulty_level=career_data["difficulty_level"],
            time_to_job_ready_months=career_data["time_to_job_ready_months"],
            is_active=True
        )
        session.add(career)
        await session.flush()
        created += 1

        # Link skills
        for skill_name, importance, min_prof in career_data["skills"]:
            skill_id = skills_map.get(skill_name.lower().strip())
            if skill_id:
                cs = CareerSkill(
                    career_id=career.career_id,
                    skill_id=skill_id,
                    importance=importance,
                    min_proficiency=min_prof,
                    weightage=5.0 if importance == "must_have" else 2.0 if importance == "good_to_have" else 1.0
                )
                session.add(cs)

    await session.flush()

    return {
        "careers_created": created,
        "careers_updated": 0,
        "source": "static_seed",
        "status": "success"
    }


def _median(values: List[int]) -> int:
    """Calculate median of a list of integers."""
    if not values:
        return 0
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    mid = n // 2
    if n % 2 == 0:
        return (sorted_vals[mid - 1] + sorted_vals[mid]) // 2
    return sorted_vals[mid]
