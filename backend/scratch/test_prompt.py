import asyncio
import json
import sys
from app.ai_engine.mistral_client import mistral_client

async def test():
    prompt = """
    Generate a detailed, high-fidelity learning roadmap for transitioning into the role of 'Data Analyst'.
    The user has 12 weeks, committing 15 hours per week.
    Key skills to schedule: SQL, Python, Excel.
    
    You MUST return a valid JSON object matching the following structure exactly, with no markdown formatting tags and no extra conversational text:
    {
        "phases": [
            {
                "phase": 1,
                "weeks": "Weeks 1-4",
                "topics": [
                    {
                        "topic_id": "m_0_0",
                        "title": "Specific Topic 1 detailing core tools/frameworks for Data Analyst",
                        "description": "Short description of what to learn and master in this topic",
                        "resources": [
                            {
                                "title": "Reference link, course, or book 1 for Data Analyst",
                                "type": "VIDEO COURSE",
                                "author": "Author name or platform",
                                "countText": "12 LESSONS",
                                "url": "https://example.com"
                            }
                        ],
                        "portfolio_project": {
                            "title": "Milestone Portfolio Project Title",
                            "description": "Short description of project to build"
                        }
                    }
                ]
            }
        ]
    }
    Provide 3 phases. Each phase should contain at least 2 detailed topics.
    Ensure there are no empty lists, empty strings, or nulls.
    """
    try:
        res = await mistral_client.chat_completion(
            prompt=prompt,
            system_prompt="You are a professional technical education curriculum planner. You always output valid, clean JSON structures directly.",
            response_format="json"
        )
        print("Success! Response length:", len(res))
        # print safely to stdout with utf-8
        sys.stdout.buffer.write(res.encode('utf-8'))
        print("\nChecking JSON parsing:")
        data = json.loads(res)
        print("Phases count:", len(data.get("phases", [])))
        print("First phase topics count:", len(data.get("phases", [])[0].get("topics", [])))
    except Exception as e:
        print("Error during test:", e)

if __name__ == "__main__":
    asyncio.run(test())
