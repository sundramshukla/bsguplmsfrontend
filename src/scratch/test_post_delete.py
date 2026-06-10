import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

# Let's delete the newly created question ID 40
edit_url = f"{base_url}/bsgupadmin/create-question/"
payload = {
    "user_id": 32,
    "quiz_id": 21,
    "question_id": 40,
    "question": "Which software use by State headquarter to generate all online certificate?",
    "option1": "BSGINDIA.COM",
    "option2": "BSGUP.COM",
    "option3": "BSGUP.ORG",
    "option4": "UPBSG.COM",
    "correct_answer": "BSGUP.COM",
    "action": "delete"
}

req = urllib.request.Request(edit_url, method="POST")
req.add_header("Content-Type", "application/json")
body = json.dumps(payload).encode("utf-8")

try:
    with urllib.request.urlopen(req, data=body) as edit_r:
        print(f"Edit POST Status: {edit_r.status}")
        print(f"Edit POST Body: {edit_r.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"Edit POST HTTPError: {e.code}")
    print(f"Edit POST Body: {e.read().decode('utf-8') if e.fp else ''}")
except Exception as e:
    print(f"Error: {e}")
