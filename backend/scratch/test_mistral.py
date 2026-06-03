import asyncio
from app.ai_engine.mistral_client import mistral_client

async def test():
    print(f"API Key in Settings: '{mistral_client.api_key}'")
    try:
        res = await mistral_client.chat_completion("Say hello", system_prompt="You are a helpful assistant")
        print("Response:", res)
    except Exception as e:
        print("Error during chat completion:", e)

if __name__ == "__main__":
    asyncio.run(test())
