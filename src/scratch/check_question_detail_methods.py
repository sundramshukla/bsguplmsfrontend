import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

# 1. Create a quiz and a question to get a valid question ID
create_quiz_url = f"{base_url}/bsgupadmin/create-quiz/"
quiz_payload = {
    "user_id": 32,
    "course_id": 31,
    "title": "Detail Endpoints Test Quiz",
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

add_question_url = f"{base_url}/bsgupadmin/create-question/"
question_payload = {
    "user_id": 32,
    "quiz_id": int(quiz_id),
    "question": "Question for detail check",
    "option1": "1",
    "option2": "2",
    "option3": "3",
    "option4": "4",
    "correct_answer": "1"
}
req = urllib.request.Request(add_question_url, method="POST")
req.add_header("Content-Type", "application/json")
try:
    with urllib.request.urlopen(req, data=json.dumps(question_payload).encode('utf-8')) as r:
        question_data = json.loads(r.read().decode('utf-8'))
        question_id = question_data.get('question_id') or question_data.get('id') or question_data.get('data', {}).get('question_id')
except Exception as e:
    print(f"Failed to add question: {e}")
    exit(1)

print(f"Created Quiz ID: {quiz_id}, Question ID: {question_id}")

# 2. Check allowed methods on /bsgupadmin/create-question/<question_id>/
detail_url = f"{base_url}/bsgupadmin/create-question/{question_id}/"
print(f"\nChecking detail URL: {detail_url}")

for method in ["GET", "PUT", "PATCH", "DELETE", "OPTIONS"]:
    req_detail = urllib.request.Request(detail_url, method=method)
    try:
        with urllib.request.urlopen(req_detail, timeout=3) as r:
            print(f"  {method}: Allowed (Status {r.status})")
            print(f"    Body: {r.read().decode('utf-8')[:300]}")
    except urllib.error.HTTPError as e:
        print(f"  {method}: Status {e.code}, Allow: {e.headers.get('Allow')}")
        print(f"    Body: {e.read().decode('utf-8')[:300]}")
    except Exception as e:
        print(f"  {method}: Error {e}")
