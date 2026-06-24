import sys
import asyncio
from jobspy import scrape_jobs
import pandas as pd

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    print("Running JobSpy scrape to inspect fields...")
    try:
        df = scrape_jobs(
            site_name=["indeed"],
            search_term="Frontend Developer",
            location="India",
            results_wanted=5,
            country_indeed="India",
            verbose=0
        )
        if df is None or df.empty:
            print("No jobs found")
            return
            
        print(f"Scraped {len(df)} jobs successfully.")
        
        # Map columns to lowercase
        df.columns = [c.lower() for c in df.columns]
        
        for idx, row in df.iterrows():
            print(f"\n--- Job {idx+1} ---")
            print(f"Title: {row.get('title')}")
            print(f"Company: {row.get('company')}")
            print(f"Location column value: {row.get('location')}")
            print(f"City column value: {row.get('city') if 'city' in row else 'N/A'}")
            print(f"Is_remote: {row.get('is_remote')}")
            
            # Check skills column
            skills_val = row.get('skills')
            print(f"Skills column value: {skills_val} (Type: {type(skills_val)})")
            
            # Check description sample
            desc = row.get('description', '')
            print(f"Desc snippet: {desc[:200].strip()}...")
            
    except Exception as e:
        print("Error during test:", e)

if __name__ == "__main__":
    main()
