import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"
url = f"{base_url}/bsgupadmin/create-question/"

payload = {
    "user_id": 32,
    "quiz_id": 23,
    "question_id": 43,
    "question": "What is 2+2? (Edited)",
    "option1": "3",
    "option2": "4",
    "option3": "5",
    "option4": "6",
    "correct_answer": "4"
}

req = urllib.request.Request(url, method="PUT")
req.add_header("Content-Type", "application/json")
try:
    with urllib.request.urlopen(req, data=json.dumps(payload).encode('utf-8')) as r:
        print(f"Status: {r.status}")
        print(f"Body: {r.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(f"Headers: {dict(e.headers)}")
    print(f"Body: {e.read().decode('utf-8') if e.fp else ''}")
except Exception as e:
    print(f"Exception: {e}")
