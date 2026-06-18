from . import ai_engine
from .openai_service import analyze_incident_openai, chat_reply_openai, is_openai_enabled


def analyze_incident(incident):
    if is_openai_enabled():
        try:
            result = analyze_incident_openai(
                {
                    "title": incident.title,
                    "severity": incident.severity,
                    "status": incident.status,
                    "error_message": incident.error_message,
                    "logs": incident.logs,
                    "description": incident.description,
                }
            )
            if result and isinstance(result, dict) and result.get("summary") and result.get("recommendations"):
                return result
        except Exception:
            pass
    return ai_engine.analyze_incident_rule_based(incident)


def chat_assistant(messages, incident=None):
    if is_openai_enabled():
        try:
            return chat_reply_openai(messages)
        except Exception:
            pass
    return ai_engine.ai_chat_response(messages, incident)
