import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"
url = f"{base_url}/bsgupadmin/create-question/"

# Payload 1: just question_id and user_id
payload1 = {
    "question_id": 41,
    "user_id": 32
}

# Payload 2: question_id, user_id, and action=delete
payload2 = {
    "question_id": 41,
    "user_id": 32,
    "action": "delete"
}

# Payload 3: quiz_id, question_id, user_id, action=delete
payload3 = {
    "quiz_id": 21,
    "question_id": 41,
    "user_id": 32,
    "action": "delete"
}

payloads = [payload1, payload2, payload3]

for i, p in enumerate(payloads, 1):
    print(f"Testing Payload {i}: {p}")
    req = urllib.request.Request(url, method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, data=json.dumps(p).encode('utf-8'), timeout=5) as r:
            print(f"  Status: {r.status}")
            print(f"  Body: {r.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"  Status: {e.code}")
        print(f"  Body: {e.read().decode('utf-8') if e.fp else ''}")
    except Exception as e:
        print(f"  Error: {e}")
