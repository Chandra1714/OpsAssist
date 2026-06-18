import json
import os

try:
    import openai
except ImportError:
    openai = None

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def is_openai_enabled() -> bool:
    return bool(OPENAI_API_KEY and openai)


def call_openai(prompt: str, temperature: float = 0.3, max_tokens: int = 300) -> str:
    if not is_openai_enabled():
        raise RuntimeError("OpenAI is not configured")

    openai.api_key = OPENAI_API_KEY
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content.strip()


def analyze_incident_openai(incident: dict) -> dict:
    prompt = (
        "You are an AI incident analyst. "
        f"Incident title: {incident.get('title')}\n"
        f"Severity: {incident.get('severity')}\n"
        f"Status: {incident.get('status')}\n"
        f"Error message: {incident.get('error_message') or 'None'}\n"
        f"Logs: {incident.get('logs') or 'None'}\n"
        f"Description: {incident.get('description') or 'None'}\n"
        "Provide a JSON output with keys: summary, root_cause, confidence_score, recommendations, suggested_commands."
    )
    answer = call_openai(prompt)
    try:
        parsed = json.loads(answer)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass
    return {
        "summary": answer,
        "root_cause": None,
        "confidence_score": None,
        "recommendations": [answer],
        "suggested_commands": [],
    }


def chat_reply_openai(messages: list[dict]) -> str:
    if not is_openai_enabled():
        raise RuntimeError("OpenAI is not configured")

    openai.api_key = OPENAI_API_KEY
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.4,
        max_tokens=350,
    )
    return response.choices[0].message.content.strip()
