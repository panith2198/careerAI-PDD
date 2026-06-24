import sys
sys.path.append("e:/CareerAI/backend")

from app.tasks.sync_tasks import parse_salary_from_description

def test_parser():
    test_cases = [
        ("Pay: Up to \u20b92,700,000.00 per year\n\nBenefits...", (None, 2700000)),
        ("Salary: \u20b9600,000.00 - \u20b9800,000.00 per year", (600000, 800000)),
        ("Pay: \u20b920,000.00 - \u20b935,000.00 per month", (240000, 420000)),
        ("wages: \u20b950,000 per month", (None, 600000)),
        ("We offer 12 - 18 LPA depending on skills.", (1200000, 1800000)),
        ("Earn 8 Lakhs per annum plus bonus.", (None, 800000)),
        ("Salary range: \u20b9 6,00,000 - \u20b9 8,00,000", (600000, 800000)),
        ("No salary details specified here.", (None, None))
    ]

    passed = True
    for desc, expected in test_cases:
        result = parse_salary_from_description(desc)
        if result == expected:
            print(f"[PASS] parsed: '{desc[:40]}...' -> {result}")
        else:
            print(f"[FAIL] parsed: '{desc[:40]}...' -> Got {result}, Expected {expected}")
            passed = False
            
    if passed:
        print("\nAll salary parsing test cases passed successfully!")
    else:
        print("\nSome test cases failed.")

if __name__ == "__main__":
    test_parser()
