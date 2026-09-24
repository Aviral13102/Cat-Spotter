import json

def build_nudge_prompt(rule_id: str, data: dict) -> str:
    facts = json.dumps(data)
    return f"Rule {rule_id} triggered. Facts: {facts}. Give a brief, calm safety nudge to the operator."
