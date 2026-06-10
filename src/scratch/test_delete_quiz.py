import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

# 1. Create a quiz to have a valid quiz ID to delete
create_quiz_url = f"{base_url}/bsgupadmin/create-quiz/"
quiz_payload = {
    "user_id": 32,
    "course_id": 31,
    "title": "DELETE Test Quiz",
    "total_marks": 100,
    "passing_marks": 60,
    "duration": 30
}
req = urllib.request.Request(create_quiz_url, method="POST")
req.add_header("Content-Type", "application/json")
try:
    with urllib.request.urlopen(req, data=json.dumps(quiz_payload).encode('utf-8')) as r:
        quiz_data = json.loads(r.read().decode('utf-8'))
        quiz_id = quiz_data.get('quiz_id') or quiz_data.get('id') or quiz_data.get('data', {}).get('quiz_id')
except Exception as e:
    print(f"Failed to create quiz: {e}")
    exit(1)

print(f"Created Quiz ID: {quiz_id}")

# 2. Try deleting the quiz with various query parameters
test_cases = [
    f"/bsgupadmin/create-quiz/?quiz_id={quiz_id}",
    f"/bsgupadmin/create-quiz/?quiz_id={quiz_id}&user_id=32",
    f"/bsgupadmin/create-quiz/?quiz_id={quiz_id}&user_id=32&course_id=31",
]

for path in test_cases:
    url = f"{base_url}{path}"
    print(f"\nTrying DELETE: {url}")
    req_del = urllib.request.Request(url, method="DELETE")
    try:
        with urllib.request.urlopen(req_del, timeout=5) as r:
            print(f"  Success! Status: {r.status}")
            print(f"  Body: {r.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"  HTTPError: {e.code}")
        print(f"  Body: {e.read().decode('utf-8') if e.fp else ''}")
    except Exception as e:
        print(f"  Error: {e}")
