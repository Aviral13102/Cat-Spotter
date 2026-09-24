import re

class VoiceIntentParser:
    def parse(self, text: str) -> dict:
        t = text.lower()
        if re.search(r'\b(start|begin)\s.*task\b', t):
            return {"intent": "start_task", "slots": {}, "confidence": 0.9}
        elif re.search(r'\b(complete|finish|done)\s.*task\b', t):
            return {"intent": "complete_task", "slots": {}, "confidence": 0.9}
        elif re.search(r'\bnext\stask\b', t):
            return {"intent": "next_task", "slots": {}, "confidence": 0.9}
        elif re.search(r'\b(eta|how\slong)\b', t):
            return {"intent": "eta", "slots": {}, "confidence": 0.9}
        elif re.search(r'\b(status|how\sam\si\sdoing|score)\b', t):
            return {"intent": "status", "slots": {}, "confidence": 0.9}
        elif re.search(r'\b(log|report)\sincident\b', t):
            return {"intent": "log_incident", "slots": {}, "confidence": 0.9}
        elif re.search(r'\b(idle|waiting|break)\b', t) and 'reason' in t:
            return {"intent": "idle_reason", "slots": {}, "confidence": 0.9}
        elif re.search(r'\backnowledge\b', t) or re.search(r'\bgot\sit\b', t):
            return {"intent": "ack", "slots": {}, "confidence": 0.9}
        elif re.search(r'\bsnooze\b', t):
            return {"intent": "snooze", "slots": {}, "confidence": 0.9}
        elif re.search(r'\bweather\b', t):
            return {"intent": "weather", "slots": {}, "confidence": 0.9}
        elif re.search(r'\btraining\b', t):
            return {"intent": "training", "slots": {}, "confidence": 0.9}
        elif re.search(r'\b(help|what\scan\si\ssay)\b', t):
            return {"intent": "help", "slots": {}, "confidence": 0.9}
        return {"intent": "help", "slots": {}, "confidence": 0.0}

parser = VoiceIntentParser()
