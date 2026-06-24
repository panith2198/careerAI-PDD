import re
import pandas as pd
from typing import Optional, List

SKILL_ALIASES = {
    "react": ["react", "react.js", "reactjs", "react js"],
    "javascript": ["javascript", "js", "java script", "es6"],
    "typescript": ["typescript", "ts"],
    "python": ["python", "py"],
    "docker": ["docker"],
    "kubernetes": ["kubernetes", "k8s"],
    "kotlin": ["kotlin"],
    "swift": ["swift"],
    "git": ["git", "github", "gitlab"],
    "sql": ["sql", "mysql", "postgresql", "postgres", "sqlite", "mssql", "sql server"]
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

def match_skills(description: str, title: str, skill_names: List[str], row_skills_val: Optional[str] = None) -> List[str]:
    desc_lower = description.lower()
    title_lower = title.lower()
    matched_skills = []
    
    row_skills = []
    if row_skills_val and pd.notna(row_skills_val):
        if isinstance(row_skills_val, str):
            parts = re.split(r'[;,]', row_skills_val)
            for part in parts:
                p_clean = part.strip().lower()
                if p_clean:
                    row_skills.append(p_clean)
        elif isinstance(row_skills_val, list):
            for s in row_skills_val:
                if s:
                    row_skills.append(str(s).strip().lower())

    for s_name in skill_names:
        s_lower = s_name.lower().strip()
        aliases = SKILL_ALIASES.get(s_lower, [s_lower])
        matched = False
        
        for alias in aliases:
            if re.search(r'\b' + re.escape(alias) + r'\b', desc_lower):
                matched = True
                break
            if re.search(r'\b' + re.escape(alias) + r'\b', title_lower):
                matched = True
                break
                
        if not matched and row_skills:
            for r_skill in row_skills:
                if r_skill == s_lower or any(alias in r_skill for alias in aliases):
                    matched = True
                    break
                    
        if matched:
            matched_skills.append(s_name)
            
    return matched_skills

# Test runner
def run_tests():
    test_cases = [
        # Location cases
        {"loc": "TN, IN", "desc": "Chennai, Tamil Nadu\nJob Summary", "expected_loc": "Chennai"},
        {"loc": "IN", "desc": "Others, Karnataka\nJob Summary", "expected_loc": "Bengaluru"},
        {"loc": "Remote, IN", "desc": "We are seeking a developer...", "expected_loc": "Remote"},
        {"loc": "IN", "desc": "Noida based position.", "expected_loc": "Noida"},
        {"loc": "Mumbai", "desc": "Job in Mumbai", "expected_loc": "Mumbai"},
        {"loc": "IN", "desc": "Just India description", "expected_loc": "India"},
        
        # Skill cases
        {"desc": "Must know reactjs and js.", "title": "Dev", "skills_col": None, "skills_db": ["React", "javascript"], "expected_skills": ["React", "javascript"]},
        {"desc": "Position for a senior developer.", "title": "React Native Developer", "skills_col": "ES6; Python", "skills_db": ["React", "javascript", "Python"], "expected_skills": ["React", "javascript", "Python"]},
    ]
    
    print("Running parsing tests...")
    all_passed = True
    for i, tc in enumerate(test_cases):
        if "expected_loc" in tc:
            res = resolve_location(tc["loc"], tc["desc"])
            passed = res == tc["expected_loc"]
            print(f"Case {i+1} Location: input='{tc['loc']}', desc='{tc['desc'][:30]}...' -> got='{res}', expected='{tc['expected_loc']}' | {'PASS' if passed else 'FAIL'}")
            if not passed:
                all_passed = False
        else:
            res = match_skills(tc["desc"], tc["title"], tc["skills_db"], tc["skills_col"])
            passed = sorted(res) == sorted(tc["expected_skills"])
            print(f"Case {i+1} Skills: desc='{tc['desc']}', title='{tc['title']}' -> got={res}, expected={tc['expected_skills']} | {'PASS' if passed else 'FAIL'}")
            if not passed:
                all_passed = False
                
    if all_passed:
        print("\nALL TESTS PASSED!")
    else:
        print("\nSOME TESTS FAILED!")

if __name__ == "__main__":
    run_tests()
