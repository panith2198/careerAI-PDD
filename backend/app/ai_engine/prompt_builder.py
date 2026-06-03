from typing import Dict, Any, List, Union
import json

class PromptBuilder:
    """
    Magic Prompt Factory: Formulates structured, context-rich 5-layer instruction templates
    for MistralAI to achieve reliable career reasoning, parsing, roadmapping, and RAG.
    
    5-Layer Structure:
        ROLE -> CONTEXT -> CONSTRAINTS -> GOAL -> TEMPLATE
    """
    
    @staticmethod
    def build_career_recommendation_prompt(
        rag_context_chunks: List[str], 
        user_skills: List[str], 
        education: str, 
        interests: List[str], 
        city: str, 
        scores_json: Dict[str, Any], 
        market_demand_json: Dict[str, Any]
    ) -> str:
        """6.1 Career Recommendation Prompt Template."""
        return f"""
ROLE:
You are an expert AI Career Counselor for freshers entering the Indian job market in 2025. You have deep knowledge of skill-to-job mappings, career trajectory modeling, and market demand. All recommendations are grounded in retrieved knowledge base documents.

CONTEXT:
* RAG chunks (ms-marco reranked): {json.dumps(rag_context_chunks)}
* User: skills={json.dumps(user_skills)}, education={education}, interests={json.dumps(interests)}, city={city}, assessment_scores={json.dumps(scores_json)}
* Market demand: {json.dumps(market_demand_json)}

CONSTRAINTS:
1. Only recommend careers with realistic fresher entry points.
2. Ground ALL recommendations in the RAG context — never hallucinate.
3. Salary in INR only.
4. Strict JSON output.
5. Max 5 careers ranked by fit_score.
6. Cite RAG source doc for each recommendation.
7. Mark low confidence if RAG context insufficient.

GOAL:
Generate: (a) Top-5 careers with fit_score 0-100, (b) Required skills, (c) Gap skills, (d) Time-to-job-ready months, (e) INR salary range, (f) 3/5/10yr growth trajectory, (g) RAG source citations.

TEMPLATE:
{{"careers":[{{"title":str,"fit_score":int,"required_skills":[],"gap_skills":[],"time_to_ready_months":int,"salary_range_inr":{{"min":int,"max":int}},"growth":str,"rag_sources":[]}}]}}
"""

    @staticmethod
    def build_resume_parsing_prompt(
        resume_raw_text: str, 
        spacy_skills: List[str], 
        spacy_orgs: List[str], 
        spacy_dates: List[str], 
        scored_sections: List[Dict[str, Any]], 
        taxonomy_json: Dict[str, Any]
    ) -> str:
        """6.2 Resume Parsing Prompt Template."""
        return f"""
ROLE:
You are a precision resume data extractor using local spaCy NER and ms-marco-MiniLM-L-6-v2 for section relevance scoring. No external API is called — all inference is local and private.

CONTEXT:
* PyMuPDF extracted text: {resume_raw_text}
* spaCy NER entities: skills={json.dumps(spacy_skills)}, orgs={json.dumps(spacy_orgs)}, dates={json.dumps(spacy_dates)}
* ms-marco scored sections by relevance: {json.dumps(scored_sections)}
* Skill taxonomy: {json.dumps(taxonomy_json)}

CONSTRAINTS:
1. Extract ONLY explicitly stated info — zero hallucination.
2. Normalize skills to canonical form via taxonomy.
3. Dates in YYYY-MM or 'Present'.
4. Missing = null.
5. Pure JSON only.
6. PII handled locally — never sent externally.
7. ms-marco score used to identify most important sections.

GOAL:
Extract all resume fields: personal info, education, experience with duration months, skills with proficiency inferred from context, certifications, projects with tech stack, ATS compatibility score (formatting + keyword density).

TEMPLATE:
{{"personal":{{"name":str,"email":str,"phone":str,"linkedin":str,"github":str}},"education":[],"experience":[{{"company":str,"role":str,"duration_months":int,"bullets":[]}}],"skills":[{{"name":str,"canonical":str,"level":str}}],"certifications":[],"projects":[],"ats_score":int}}
"""

    @staticmethod
    def build_skill_gap_prompt(
        rag_context: List[str], 
        current_skills_json: Dict[str, Any], 
        target_career: str, 
        benchmarks_json: Dict[str, Any], 
        ner_skills: List[str]
    ) -> str:
        """6.3 Skill Gap Analysis Prompt Template."""
        return f"""
ROLE:
You are a skill gap analyst specialized in Indian tech job market competency frameworks. You base ALL gap assessments on ms-marco-reranked knowledge base documents — zero hallucination policy.

CONTEXT:
* ms-marco reranked RAG docs: {json.dumps(rag_context)}
* User skills with proficiency: {json.dumps(current_skills_json)}
* Target career: {target_career}
* Industry benchmarks: {json.dumps(benchmarks_json)}
* spaCy NER extracted skills from resume: {json.dumps(ner_skills)}

CONSTRAINTS:
1. Proficiency: Beginner/Intermediate/Advanced/Expert only.
2. Every gap traceable to RAG source.
3. Free resources only (Coursera/YouTube/freeCodeCamp/NPTEL).
4. JSON only.
5. Max 10 priority gaps.
6. confidence=low if RAG context doesn't confirm requirement.

GOAL:
Produce gap report: (a) Missing skills, (b) Current vs required proficiency, (c) Business-impact priority score, (d) Free course recommendations, (e) Estimated learning hours, (f) RAG source citations, (g) Confidence score per gap.

TEMPLATE:
{{"skill_gaps":[{{"skill":str,"current_level":str,"required_level":str,"priority":"High|Medium|Low","resources":[{{"name":str,"url":str,"hours":int,"free":bool}}],"rag_source":str,"confidence":float}}]}}
"""

    @staticmethod
    def build_learning_roadmap_prompt(
        user_profile_json: Dict[str, Any], 
        target_career: str, 
        gap_json: Dict[str, Any], 
        hours_per_week: int, 
        budget_inr: int, 
        target_months: int, 
        rag_course_catalog: List[str]
    ) -> str:
        """6.4 Learning Roadmap Generation Prompt Template."""
        return f"""
ROLE:
You are a Learning Path Architect who designs evidence-based, DAG-ordered roadmaps for freshers. All resources are drawn from RAG knowledge base course catalogs, reranked by ms-marco for relevance to learner's specific gap profile.

CONTEXT:
* Learner: {json.dumps(user_profile_json)}
* Target career: {target_career}
* Gap analysis: {json.dumps(gap_json)}
* Time: {hours_per_week} hrs/week
* Budget: {budget_inr} INR
* Timeline: {target_months} months
* RAG course catalog (ms-marco reranked): {json.dumps(rag_course_catalog)}

CONSTRAINTS:
1. Milestones achievable within time/budget.
2. Prerequisite DAG — no circular dependencies.
3. Free resources first.
4. Each milestone has measurable completion criteria.
5. Total <= {target_months} months.
6. JSON only.
7. Cite RAG source for each resource.

GOAL:
Generate week-by-week roadmap: (a) 3 phases Foundation/Intermediate/Advanced, (b) Weekly milestones with criteria, (c) Resources from RAG catalog, (d) Portfolio projects, (e) Phase checkpoint assessments, (f) RAG citations.

TEMPLATE:
{{"roadmap":{{"total_weeks":int,"phases":[{{"phase":str,"weeks":int,"milestones":[{{"week":int,"title":str,"resources":[{{"name":str,"url":str,"type":str,"hours":int}}],"project":str,"checkpoint":str,"rag_source":str}}]}}]}}
"""

    @staticmethod
    def build_jd_parsing_prompt(
        jd_raw_text: str, 
        bm25_keywords: List[str], 
        msmarco_scores: List[Dict[str, Any]], 
        spacy_entities: List[Dict[str, Any]], 
        taxonomy_json: Dict[str, Any]
    ) -> str:
        """6.5 JD Parsing Prompt Template."""
        return f"""
ROLE:
You are a job description analyst using local BM25 keyword extraction and ms-marco-MiniLM-L-6-v2 for relevance scoring of requirements. All inference is local — no external API calls.

CONTEXT:
* JD raw text from PDF/web scrape: {jd_raw_text}
* BM25 top-keywords: {json.dumps(bm25_keywords)}
* ms-marco section relevance scores: {json.dumps(msmarco_scores)}
* spaCy NER: {json.dumps(spacy_entities)}
* Career taxonomy: {json.dumps(taxonomy_json)}

CONSTRAINTS:
1. Classify requirements as must-have vs nice-to-have using ms-marco scores.
2. Experience in months.
3. Normalize skills via taxonomy.
4. Detect work mode from text.
5. Pure JSON only.
6. No hallucination — only explicitly stated info.

GOAL:
Extract: (a) Title + career category, (b) Must-have skills with min proficiency, (c) Nice-to-have skills, (d) Experience requirements, (e) Education, (f) Work mode + location, (g) Salary if stated, (h) ATS keyword density score.

TEMPLATE:
{{"title":str,"career_category":str,"must_have_skills":[{{"skill":str,"min_level":str}}],"nice_to_have":[],"experience_min_months":int,"education":str,"work_mode":str,"location":str,"salary_range":{{"min":int,"max":int}},"ats_keywords":[],"ats_density_score":float}}
"""

