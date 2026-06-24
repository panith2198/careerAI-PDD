import logging
import time
import hashlib
import datetime
import asyncio
import re
from typing import Dict, Any, Optional

try:
    from celery import Celery
    from app.core.config import settings
    celery_app = Celery(
        "careerai_tasks",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL
    )
except ImportError:
    class MockCelery:
        def task(self, *args, **kwargs):
            def decorator(func):
                func.delay = lambda *a, **kw: func(*a, **kw)
                return func
            return decorator
    celery_app = MockCelery()

from app.core.database import AsyncSessionLocal
from app.models import Job, Career, Skill
from sqlalchemy.future import select
from jobspy import scrape_jobs
import pandas as pd

logger = logging.getLogger("sync_tasks")

SKILL_ALIASES = {
    "react": ["react", "react.js", "reactjs", "react js"],
    "javascript": ["javascript", "js", "java script", "es6", "ecmascript"],
    "typescript": ["typescript", "ts"],
    "python": ["python", "py"],
    "docker": ["docker", "dockerfile", "docker-compose"],
    "kubernetes": ["kubernetes", "k8s"],
    "kotlin": ["kotlin"],
    "swift": ["swift", "swiftui"],
    "git": ["git", "github", "gitlab", "bitbucket"],
    "sql": ["sql", "mysql", "postgresql", "postgres", "sqlite", "mssql", "sql server"],
    "java": ["java"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp", ".net", "dotnet"],
    "go": ["golang", "go lang"],
    "rust": ["rust"],
    "ruby": ["ruby", "ruby on rails", "rails"],
    "php": ["php", "laravel"],
    "node.js": ["node.js", "nodejs", "node js", "express.js", "expressjs"],
    "angular": ["angular", "angularjs"],
    "vue.js": ["vue", "vue.js", "vuejs"],
    "next.js": ["next.js", "nextjs"],
    "django": ["django"],
    "flask": ["flask"],
    "spring boot": ["spring boot", "spring", "spring framework"],
    "tensorflow": ["tensorflow", "tf"],
    "pytorch": ["pytorch", "torch"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "mongodb": ["mongodb", "mongo"],
    "redis": ["redis"],
    "graphql": ["graphql"],
    "rest api": ["rest api", "restful", "rest"],
    "terraform": ["terraform"],
    "ansible": ["ansible"],
    "jenkins": ["jenkins"],
    "aws": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "azure": ["azure", "microsoft azure"],
    "gcp": ["gcp", "google cloud", "google cloud platform"],
    "linux": ["linux", "ubuntu", "centos", "rhel"],
    "ci/cd": ["ci/cd", "cicd", "continuous integration", "continuous deployment"],
    "figma": ["figma"],
    "jira": ["jira"],
    "agile": ["agile", "scrum", "kanban"]
}


def resolve_location(row_location: str, description: str) -> str:
    if not row_location or pd.isna(row_location):
        row_location = ""
    
    loc_str = str(row_location).strip()
    
    cities = [
        "Bengaluru", "Bangalore", "Hyderabad", "Chennai", "Pune", "Mumbai", 
        "Delhi", "Noida", "Gurugram", "Gurgaon", "Kolkata", "Ahmedabad", 
        "Kochi", "Trivandrum", "Jaipur", "Coimbatore", "Indore", "Chandigarh", 
        "Mohali", "Bhubaneswar"
    ]
    
    state_to_city = {
        "KA": "Bengaluru",
        "TN": "Chennai",
        "TS": "Hyderabad",
        "AP": "Hyderabad",
        "MH": "Pune",
        "DL": "Delhi",
        "HR": "Gurugram",
        "UP": "Noida",
        "WB": "Kolkata"
    }
    
    state_names = {
        "karnataka": "Bengaluru",
        "tamil nadu": "Chennai",
        "telangana": "Hyderabad",
        "andhra pradesh": "Hyderabad",
        "maharashtra": "Pune",
        "haryana": "Gurugram",
        "uttar pradesh": "Noida",
        "west bengal": "Kolkata"
    }
    
    # 1. Check if a specific city is mentioned in the location string
    for city in cities:
        if re.search(r'\b' + re.escape(city) + r'\b', loc_str, re.IGNORECASE):
            return city
            
    # 2. Check for state codes in location, e.g. "TN, IN", "KA, IN"
    for state_code, city_fallback in state_to_city.items():
        if re.search(r'\b' + re.escape(state_code) + r'\b', loc_str, re.IGNORECASE):
            # Check if city is in description first
            desc_snippet = description[:1000]
            for city in cities:
                if re.search(r'\b' + re.escape(city) + r'\b', desc_snippet, re.IGNORECASE):
                    return city
            return city_fallback
            
    # 3. If it's remote
    if "remote" in loc_str.lower() or "work from home" in loc_str.lower():
        return "Remote"
        
    # 4. If it's just "IN" or "India", search the description snippet
    if loc_str.lower() in ("", "in", "india"):
        desc_snippet = description[:1000]
        # Check cities
        for city in cities:
            if re.search(r'\b' + re.escape(city) + r'\b', desc_snippet, re.IGNORECASE):
                return city
        # Check states
        desc_snippet_lower = desc_snippet.lower()
        for state_name, city_fallback in state_names.items():
            if state_name in desc_snippet_lower:
                return city_fallback
        return "India"
        
    return loc_str


def parse_salary_from_description(desc: str) -> tuple[Optional[int], Optional[int]]:
    """
    Parses salary information from raw description text as fallback.
    Returns (salary_min, salary_max) in annual INR.
    """
    import re
    from typing import Optional
    
    # 1. Look for rupee range per year: e.g. ₹1,200,000.00 - ₹1,800,000.00 per year
    range_year = re.search(r'(?:pay|salary|wages?):?\s*₹?\s*([0-9,]+)(?:\.00)?\s*-\s*₹?\s*([0-9,]+)(?:\.00)?\s*(?:per\s*year|/year|annum|yearly)', desc, re.IGNORECASE)
    if range_year:
        try:
            min_val = int(range_year.group(1).replace(',', ''))
            max_val = int(range_year.group(2).replace(',', ''))
            return min_val, max_val
        except ValueError:
            pass

    # 2. Look for rupee single value per year: e.g. Up to ₹2,700,000.00 per year
    single_year = re.search(r'(?:pay|salary|wages?):?\s*(?:up\s*to)?\s*₹?\s*([0-9,]+)(?:\.00)?\s*(?:per\s*year|/year|annum|yearly)', desc, re.IGNORECASE)
    if single_year:
        try:
            val = int(single_year.group(1).replace(',', ''))
            return None, val
        except ValueError:
            pass

    # 3. Look for monthly range: e.g. ₹20,000 - ₹35,000 per month
    range_month = re.search(r'(?:pay|salary|wages?):?\s*₹?\s*([0-9,]+)(?:\.00)?\s*-\s*₹?\s*([0-9,]+)(?:\.00)?\s*(?:per\s*month|/month|monthly)', desc, re.IGNORECASE)
    if range_month:
        try:
            min_val = int(range_month.group(1).replace(',', '')) * 12
            max_val = int(range_month.group(2).replace(',', '')) * 12
            return min_val, max_val
        except ValueError:
            pass

    # 4. Look for single monthly: e.g. ₹50,000 per month
    single_month = re.search(r'(?:pay|salary|wages?):?\s*(?:up\s*to)?\s*₹?\s*([0-9,]+)(?:\.00)?\s*(?:per\s*month|/month|monthly)', desc, re.IGNORECASE)
    if single_month:
        try:
            val = int(single_month.group(1).replace(',', '')) * 12
            return None, val
        except ValueError:
            pass

    # 5. Look for LPA range: e.g. 12 - 18 LPA or 6-10 Lakhs
    lpa_range = re.search(r'([0-9.]+)\s*-\s*([0-9.]+)\s*(?:lpa|lakhs?|l\s*per\s*annum)', desc, re.IGNORECASE)
    if lpa_range:
        try:
            min_val = int(float(lpa_range.group(1)) * 100000)
            max_val = int(float(lpa_range.group(2)) * 100000)
            return min_val, max_val
        except ValueError:
            pass

    # 6. Look for single LPA: e.g. 12 LPA or 8 Lakhs
    lpa_single = re.search(r'(?:up\s*to)?\s*([0-9.]+)\s*(?:lpa|lakhs?|l\s*per\s*annum)', desc, re.IGNORECASE)
    if lpa_single:
        try:
            val = int(float(lpa_single.group(1)) * 100000)
            return None, val
        except ValueError:
            pass

    # 7. Fallback generic range: e.g. ₹ 6,00,000 - ₹ 8,00,000
    generic_range = re.search(r'₹\s*([0-9,]+)(?:\.00)?\s*-\s*₹\s*([0-9,]+)(?:\.00)?', desc)
    if generic_range:
        try:
            min_val = int(generic_range.group(1).replace(',', ''))
            max_val = int(generic_range.group(2).replace(',', ''))
            if min_val < 150000:
                min_val *= 12
                max_val *= 12
            return min_val, max_val
        except ValueError:
            pass

    return None, None


async def async_sync_external_jobs(source: str) -> Dict[str, Any]:
    logger.info(f"Starting async database import for source: {source}")
    
    async with AsyncSessionLocal() as db:
        # 1. Fetch career roles to search for
        res_careers = await db.execute(select(Career).where(Career.is_active == True))
        careers = res_careers.scalars().all()
        
        search_terms = []
        if careers:
            search_terms = [c.title for c in careers]
        else:
            search_terms = ["Software Engineer", "Data Scientist", "Frontend Developer", "Backend Developer"]
            
        # 2. Fetch canonical skill taxonomy to parse descriptions
        res_skills = await db.execute(select(Skill))
        skills = res_skills.scalars().all()
        skill_names = [s.skill_name for s in skills]

        total_pulled = 0
        total_imported = 0
        seen_urls = set()  # In-memory deduplication within this sync batch
        
        # Determine target site names based on Celery source parameter
        site_names = [source] if source in ("linkedin", "indeed", "zip_recruiter", "google", "glassdoor") else ["indeed", "zip_recruiter"]
        
        # Default locations
        location = "India"
        country_indeed = "India"
        
        for term in search_terms:
            logger.info(f"Running JobSpy scraper for term: '{term}' on {site_names} in location: '{location}'")
            try:
                # Wrap scraper in executor to avoid blocking the main event loop
                loop = asyncio.get_event_loop()
                jobs_df = await loop.run_in_executor(
                    None,
                    lambda t=term: scrape_jobs(
                        site_name=site_names,
                        search_term=t,
                        location=location,
                        results_wanted=20,
                        hours_old=72,
                        country_indeed=country_indeed,
                        description_format="markdown",
                        verbose=0
                    )
                )
            except Exception as e:
                logger.error(f"JobSpy scrape_jobs failed for term '{term}': {e}")
                continue
                
            if jobs_df is None or jobs_df.empty:
                logger.info(f"No job listings returned for term: '{term}'")
                continue
                
            logger.info(f"Scraped {len(jobs_df)} listings for term: '{term}'")
            total_pulled += len(jobs_df)
            
            # Map columns to lowercase to prevent casing discrepancies
            jobs_df.columns = [c.lower() for c in jobs_df.columns]
            
            for _, row in jobs_df.iterrows():
                job_url = row.get("job_url")
                if not job_url or pd.isna(job_url):
                    continue
                
                job_url_str = str(job_url)
                
                # Skip if already processed in this batch
                if job_url_str in seen_urls:
                    continue
                seen_urls.add(job_url_str)
                
                # Uniqueness is guaranteed by SHA-256 hashing the URL to fit string(100) constraints
                external_id = hashlib.sha256(job_url_str.encode("utf-8")).hexdigest()[:100]
                
                # Capture direct URL (bypasses job board redirect)
                job_url_direct_val = row.get("job_url_direct")
                if job_url_direct_val and pd.notna(job_url_direct_val):
                    job_url_direct_val = str(job_url_direct_val)
                else:
                    job_url_direct_val = None
                
                title = str(row.get("title", term))
                company = str(row.get("company", "Confidential"))
                description = str(row.get("description", ""))
                title_lower = title.lower()
                
                # Capture company metadata
                company_url_val = row.get("company_url")
                if company_url_val and pd.notna(company_url_val):
                    company_url_val = str(company_url_val)[:300]
                else:
                    company_url_val = None
                
                company_logo_val = row.get("company_logo")
                if company_logo_val and pd.notna(company_logo_val):
                    company_logo_val = str(company_logo_val)[:500]
                else:
                    company_logo_val = None
                
                # Extract job_type (fulltime, parttime, internship, contract)
                raw_job_type = row.get("job_type")
                job_type_val = None
                if raw_job_type and pd.notna(raw_job_type):
                    jt_str = str(raw_job_type).lower().replace("-", "").replace(" ", "").replace("_", "")
                    if "fulltime" in jt_str or "full" in jt_str:
                        job_type_val = "fulltime"
                    elif "parttime" in jt_str or "part" in jt_str:
                        job_type_val = "parttime"
                    elif "intern" in jt_str:
                        job_type_val = "internship"
                    elif "contract" in jt_str:
                        job_type_val = "contract"
                
                # Extract currency
                currency_val = row.get("currency")
                if currency_val and pd.notna(currency_val):
                    currency_val = str(currency_val).upper()[:10]
                else:
                    currency_val = "INR"
                
                # Perform skill overlap matching using robust word boundaries and aliases
                desc_lower = description.lower()
                matched_skills = []
                
                # Fetch row-level skills if populated by jobspy
                row_skills = []
                skills_val = row.get("skills")
                if skills_val and pd.notna(skills_val):
                    if isinstance(skills_val, str):
                        parts = re.split(r'[;,]', skills_val)
                        for part in parts:
                            p_clean = part.strip().lower()
                            if p_clean:
                                row_skills.append(p_clean)
                    elif isinstance(skills_val, list):
                        for s in skills_val:
                            if s:
                                row_skills.append(str(s).strip().lower())

                for s_name in skill_names:
                    s_lower = s_name.lower().strip()
                    aliases = SKILL_ALIASES.get(s_lower, [s_lower])
                    matched = False
                    
                    # Check description/title matching
                    for alias in aliases:
                        if re.search(r'\b' + re.escape(alias) + r'\b', desc_lower):
                            matched = True
                            break
                        if re.search(r'\b' + re.escape(alias) + r'\b', title_lower):
                            matched = True
                            break
                            
                    # Check if it was in the row['skills']
                    if not matched and row_skills:
                        for r_skill in row_skills:
                            if r_skill == s_lower or any(alias in r_skill for alias in aliases):
                                matched = True
                                break
                                
                    if matched:
                        matched_skills.append(s_name)
                
                # Determine work mode
                is_remote = row.get("is_remote", False)
                loc_str = str(row.get("location", "")).lower()
                
                if is_remote or "remote" in loc_str or "remote" in title_lower:
                    work_mode = "remote"
                elif "hybrid" in loc_str or "hybrid" in desc_lower or "hybrid" in title_lower:
                    work_mode = "hybrid"
                else:
                    work_mode = "onsite"
                    
                # Parse min/max experience
                exp_months = 0
                exp_match = re.search(r"(\d+)\+?\s*years?\s*of\s*experience", desc_lower)
                if exp_match:
                    exp_months = int(exp_match.group(1)) * 12
                
                # Normalize salary bounds
                min_amt = row.get("min_amount")
                max_amt = row.get("max_amount")
                interval = str(row.get("interval", "")).lower()
                
                salary_min = None
                salary_max = None
                
                if min_amt is not None and pd.notna(min_amt):
                    min_val = float(min_amt)
                    if interval == "hourly":
                        salary_min = int(min_val * 8 * 22 * 12)
                    elif interval == "monthly":
                        salary_min = int(min_val * 12)
                    else:
                        salary_min = int(min_val)
                        
                if max_amt is not None and pd.notna(max_amt):
                    max_val = float(max_amt)
                    if interval == "hourly":
                        salary_max = int(max_val * 8 * 22 * 12)
                    elif interval == "monthly":
                        salary_max = int(max_val * 12)
                    else:
                        salary_max = int(max_val)
                
                if salary_min is None and salary_max is None:
                    # Fallback: parse salary from raw description text
                    parsed_min, parsed_max = parse_salary_from_description(description)
                    if parsed_min is not None:
                        salary_min = parsed_min
                    if parsed_max is not None:
                        salary_max = parsed_max
                
                # Associate with matching career model ID
                mapped_career_id = None
                for c in careers:
                    if c.title.lower() in title_lower:
                        mapped_career_id = c.career_id
                        break
                
                # Map source enum value
                row_site = str(row.get("site", "indeed")).lower()
                if "linkedin" in row_site:
                    source_val = "linkedin"
                elif "naukri" in row_site:
                    source_val = "naukri"
                elif "zip" in row_site:
                    source_val = "zip_recruiter"
                elif "google" in row_site:
                    source_val = "google"
                elif "glassdoor" in row_site:
                    source_val = "glassdoor"
                else:
                    source_val = "indeed"
                
                # Parse date_posted
                posted_val = row.get("date_posted")
                if posted_val and pd.notna(posted_val):
                    try:
                        posting_date = pd.to_datetime(posted_val).date()
                    except Exception:
                        posting_date = datetime.date.today()
                else:
                    posting_date = datetime.date.today()
                
                # Determine location_city
                city_val = row.get("city")
                if not city_val or pd.isna(city_val) or str(city_val).strip() == "":
                    city_val = row.get("location")
                location_city_val = resolve_location(city_val, description)

                # Perform DB upsert
                stmt_check = select(Job).where(Job.external_id == external_id)
                res_check = await db.execute(stmt_check)
                existing_job = res_check.scalar_one_or_none()
                
                if existing_job:
                    # Update active listing details
                    existing_job.title = title
                    existing_job.company_name = company
                    existing_job.job_url = job_url_str
                    existing_job.job_url_direct = job_url_direct_val
                    existing_job.company_url = company_url_val
                    existing_job.company_logo_url = company_logo_val
                    existing_job.description_raw = description
                    existing_job.required_skills_json = matched_skills
                    existing_job.location_city = location_city_val
                    existing_job.work_mode = work_mode
                    existing_job.job_type = job_type_val
                    existing_job.experience_min_months = exp_months
                    existing_job.salary_min = salary_min
                    existing_job.salary_max = salary_max
                    existing_job.currency = currency_val
                    existing_job.is_active = True
                else:
                    new_job = Job(
                        external_id=external_id,
                        job_url=job_url_str,
                        job_url_direct=job_url_direct_val,
                        title=title,
                        company_name=company,
                        company_url=company_url_val,
                        company_logo_url=company_logo_val,
                        career_id=mapped_career_id,
                        description_raw=description,
                        required_skills_json=matched_skills,
                        location_city=location_city_val,
                        work_mode=work_mode,
                        job_type=job_type_val,
                        experience_min_months=exp_months,
                        salary_min=salary_min,
                        salary_max=salary_max,
                        currency=currency_val,
                        source=source_val,
                        is_fresher_eligible=(exp_months == 0),
                        posting_date=posting_date,
                        is_active=True
                    )
                    db.add(new_job)
                    total_imported += 1
            
            # Commit results after each career batch
            await db.commit()
            
        # After sync, trigger career population to update career data from new jobs
        try:
            from app.tasks.career_populator import populate_careers_from_jobs
            career_result = await populate_careers_from_jobs(db)
            await db.commit()
            logger.info(f"Career population after sync: {career_result}")
        except Exception as pop_err:
            logger.warning(f"Career population after sync failed: {pop_err}")

        return {
            "source": source,
            "jobs_pulled": total_pulled,
            "jobs_imported": total_imported,
            "status": "success"
        }


@celery_app.task(bind=True, max_retries=5)
def sync_external_jobs_rate_limited(self, source: str) -> Dict[str, Any]:
    """
    Crawls external API listings (LinkedIn/Indeed/ZipRecruiter) using python-jobspy,
    parses skill requirements, maps taxonomy careers, and imports active postings.
    """
    logger.info(f"Initiating rate-limited job synchronization crawler for source: {source}")
    try:
        return asyncio.run(async_sync_external_jobs(source))
    except Exception as e:
        logger.warning(f"Crawling failed for source {source} due to error: {e}")
        retry_delay = 60 * (2 ** self.request.retries if hasattr(self, "request") else 1)
        if hasattr(self, "retry"):
            raise self.retry(exc=e, countdown=retry_delay)
        raise e
