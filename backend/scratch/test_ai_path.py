import asyncio
import json
import traceback
from app.ai_engine.mistral_client import mistral_client
from app.core.database import AsyncSessionLocal
from app.models import Career
from sqlalchemy.future import select

async def test_ai_path():
    from_role = "Graphic Designer"
    to_role = "Frontend Developer"
    
    async with AsyncSessionLocal() as db:
        res_careers = await db.execute(select(Career).where(Career.is_active == True))
        careers = res_careers.scalars().all()
        db_titles = [c.title for c in careers]
        
    prompt = f"""
    Suggest a logical, realistic career transition path from a user's current custom role '{from_role}' to their target role '{to_role}'.
    
    Here are the available roles in our platform database: {", ".join(db_titles)}.
    
    You MUST return a JSON object with a single key "path" containing a list of strings representing the sequence of roles from '{from_role}' to '{to_role}'.
    Prefer to use existing database roles as intermediate steps if they logically fit.
    Ensure the first element is '{from_role}' and the last element is '{to_role}'.
    The path should have between 2 and 4 roles total.
    
    Example output format:
    {{
        "path": ["{from_role}", "Android Developer", "{to_role}"]
    }}
    
    Output ONLY the raw JSON object, with no markdown tags and no extra text.
    """
    
    try:
        print("Sending request to Mistral...")
        ai_response = await mistral_client.chat_completion(
            prompt=prompt,
            system_prompt="You are a professional career transitions advisor. You always output valid, clean JSON objects.",
            response_format="json"
        )
        print("Response received:", ai_response)
        
        if "Mock career guidance result" in ai_response or "your-mistral-api-key-here" in ai_response:
            raise ValueError("Mistral API key is unconfigured, using fallback path.")
            
        clean_res = ai_response.strip()
        if clean_res.startswith("```"):
            lines = clean_res.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].strip() == "```":
                lines = lines[:-1]
            clean_res = "\n".join(lines).strip()
            
        data = json.loads(clean_res)
        path = None
        if isinstance(data, dict) and "path" in data:
            path = data["path"]
        elif isinstance(data, list):
            path = data
        elif isinstance(data, dict):
            for val in data.values():
                if isinstance(val, list):
                    path = val
                    break
                    
        print("Parsed Path:", path)
    except Exception as e:
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ai_path())
