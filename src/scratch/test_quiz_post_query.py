import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

# 1. Create a quiz
create_quiz_url = f"{base_url}/bsgupadmin/create-quiz/"
quiz_payload = {
    "user_id": 32,
    "course_id": 31,
    "title": "POST Query Update Test Quiz",
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

# 2. Try POST update with quiz_id in query params
update_url = f"{create_quiz_url}?quiz_id={quiz_id}"
update_payload = {
    "user_id": 32,
    "course_id": 31,
    "title": "POST Query Update Test Quiz (Updated Title)",
    "total_marks": 100,
    "passing_marks": 60,
    "duration": 30
}
req_update = urllib.request.Request(update_url, method="POST")
req_update.add_header("Content-Type", "application/json")
try:
    with urllib.request.urlopen(req_update, data=json.dumps(update_payload).encode('utf-8')) as r:
        print("\nPOST Query Update Response:")
        print(json.dumps(json.loads(r.read().decode('utf-8')), indent=2))
except Exception as e:
    print(f"\nPOST Query Update Failed: {e}")

# 3. Fetch quiz to check if title got updated
get_quiz_url = f"{base_url}/bsgupadmin/get-quiz/?quiz_id={quiz_id}"
try:
    with urllib.request.urlopen(get_quiz_url) as r:
        print("\nQuiz after update:")
        print(json.dumps(json.loads(r.read().decode('utf-8')), indent=2))
except Exception as e:
    print(f"Failed to fetch quiz after update: {e}")
