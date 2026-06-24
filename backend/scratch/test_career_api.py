"""
End-to-end API test for career system.
Tests: career list, career detail, career recommendations
"""
import asyncio
import sys
import os
import httpx

BASE_URL = "http://localhost:8000/api/v1"

async def main():
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Login to get token
        print("=" * 70)
        print("1. LOGGING IN")
        print("=" * 70)
        login_res = await client.post(f"{BASE_URL}/auth/login", json={
            "email": "eswarch2004y@gmail.com",
            "password": "password"
        })
        if login_res.status_code != 200:
            print(f"Login failed: {login_res.status_code} {login_res.text}")
            return
        token = login_res.json().get("access_token")
        print(f"Login successful! Token: {token[:20]}...")
        
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Career list
        print("\n" + "=" * 70)
        print("2. CAREER LIST (/careers)")
        print("=" * 70)
        careers_res = await client.get(f"{BASE_URL}/careers?limit=50", headers=headers)
        if careers_res.status_code != 200:
            print(f"Career list failed: {careers_res.status_code} {careers_res.text}")
        else:
            data = careers_res.json()
            items = data.get("items", [])
            print(f"Total careers: {data.get('total', 0)}")
            print(f"Items returned: {len(items)}")
            for c in items[:10]:
                sal_min = c.get('avg_salary_min', 'N/A')
                sal_max = c.get('avg_salary_max', 'N/A')
                sal_str = f"Rs.{sal_min/100000:.0f}L-Rs.{sal_max/100000:.0f}L" if sal_min and sal_max else "N/A"
                skills_list = c.get('skills', [])[:3]
                print(f"  {c['title']:<30s} | {c.get('category',''):<20s} | {sal_str:<15s} | Fit={c.get('fit_score',0)}% | Skills={skills_list}")

        # 3. Career detail
        if items:
            print("\n" + "=" * 70)
            print("3. CAREER DETAIL")
            print("=" * 70)
            slug = items[0].get("slug", "software-engineer")
            detail_res = await client.get(f"{BASE_URL}/careers/{slug}", headers=headers)
            if detail_res.status_code == 200:
                d = detail_res.json()
                print(f"Title: {d.get('title')}")
                print(f"Category: {d.get('category')}")
                print(f"Fit Score: {d.get('fit_score')}%")
                print(f"Salary: Rs.{d.get('avg_salary_min',0)/100000:.0f}L - Rs.{d.get('avg_salary_max',0)/100000:.0f}L")
                print(f"Demand: {d.get('demand_score')}")
                print(f"Growth: {d.get('growth_rate_pct')}%")
                print(f"Difficulty: {d.get('difficulty_level')}")
                print(f"Skills: {[s['name'] for s in d.get('skills', [])]}")
            else:
                print(f"Detail failed: {detail_res.status_code}")

        # 4. Career recommendations
        print("\n" + "=" * 70)
        print("4. CAREER RECOMMENDATIONS (/career/recommend)")
        print("=" * 70)
        rec_res = await client.post(f"{BASE_URL}/career/recommend", json={"force_refresh": True}, headers=headers)
        if rec_res.status_code == 200:
            rec_data = rec_res.json()
            recs = rec_data.get("careers", [])
            print(f"Recommendations count: {len(recs)}")
            print(f"Model used: {rec_data.get('model_used', 'N/A')}")
            for r in recs:
                print(f"  #{r['rank']} {r['title']:<30s} | Fit={r['fit_score']}% | Gap Skills: {r.get('gap_skills',{}).get('missing',[])[:3]}")
        else:
            print(f"Recommendations failed: {rec_res.status_code} {rec_res.text}")

        print("\nDone!")

if __name__ == "__main__":
    asyncio.run(main())
