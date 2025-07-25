import os
import openai
from app.config import settings
import redis
import hashlib
import json

# Set the API key
openai.api_key = settings.OPENAI_API_KEY

MODEL = "gpt-3.5-turbo"
MAX_TOKENS = 2048
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.Redis.from_url(REDIS_URL)
CACHE_TTL = 60 * 60  # 1 hour

def ask_gpt(prompt: str, system: str = "You are an expert electrical engineer AI assistant."):
    cache_key = "ai:" + hashlib.sha256((system + "|" + prompt).encode()).hexdigest()
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    try:
        response = openai.ChatCompletion.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            max_tokens=MAX_TOKENS,
        )
        answer = response.choices[0].message.content
        redis_client.setex(cache_key, CACHE_TTL, json.dumps(answer))
        return answer
    except Exception as e:
        return f"[AI Error] {str(e)}"
