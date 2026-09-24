import asyncio
from anthropic import AsyncAnthropic
from app.config import settings
from app.llm.templates import get_fallback_template
from app.llm.prompts import build_nudge_prompt
import time

class LLMClient:
    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
        self.cache = {}
        
    async def get_nudge(self, rule_id: str, data: dict) -> str:
        cache_key = f"{rule_id}:{hash(frozenset(data.items()))}"
        if cache_key in self.cache:
            entry = self.cache[cache_key]
            if time.time() - entry['time'] < 30:
                return entry['text']
                
        if not self.client:
            return get_fallback_template(rule_id, data)
            
        prompt = build_nudge_prompt(rule_id, data)
        try:
            res = await self.client.messages.create(
                model=settings.CLAUDE_NUDGE_MODEL,
                max_tokens=120,
                temperature=0.1,
                timeout=settings.LLM_TIMEOUT_S,
                system="You are CAT Spotter, an experienced, calm foreman.",
                messages=[{"role": "user", "content": prompt}]
            )
            text = res.content[0].text.strip()
            self.cache[cache_key] = {'text': text, 'time': time.time()}
            return text
        except Exception as e:
            print(f"LLM Error: {e}")
            return get_fallback_template(rule_id, data)

llm_client = LLMClient()
