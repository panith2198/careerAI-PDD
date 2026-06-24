import asyncio
from jobspy import scrape_jobs
import pandas as pd

def main():
    print("Running a small JobSpy scrape to inspect raw columns...")
    try:
        df = scrape_jobs(
            site_name=["indeed"],
            search_term="Frontend Developer",
            location="India",
            results_wanted=2,
            country_indeed="India",
            verbose=0
        )
        print("Columns in DataFrame:")
        print(df.columns.tolist())
        print("\nFirst row details:")
        if not df.empty:
            row = df.iloc[0]
            for col in df.columns:
                print(f"{col}: {row[col]}")
        else:
            print("DataFrame is empty.")
    except Exception as e:
        print("Scrape failed:", e)

if __name__ == "__main__":
    main()
