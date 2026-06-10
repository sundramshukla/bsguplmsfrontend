import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"
url = f"{base_url}/bsgupadmin/create-question/"

req = urllib.request.Request(url, method="PUT")
req.add_header("Content-Type", "application/json")
body = json.dumps({
    "user_id": 2,
    "quiz_id": 1,
    "question": "test",
    "option1": "a",
    "option2": "b",
    "option3": "c",
    "option4": "d",
    "correct_answer": "a",
    "question_id": 39
}).encode("utf-8")

try:
    with urllib.request.urlopen(req, data=body, timeout=5) as response:
        print(f"PUT Status: {response.status}")
        print(f"PUT Body: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"PUT HTTPError: {e.code}")
    print(f"PUT Body: {e.read().decode('utf-8') if e.fp else ''}")
except Exception as e:
    print(f"PUT Error: {e}")
