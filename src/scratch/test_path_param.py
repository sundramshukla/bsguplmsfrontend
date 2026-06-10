import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

# 1. Create a quiz
create_quiz_url = f"{base_url}/bsgupadmin/create-quiz/"
quiz_payload = {
    "user_id": 32,
    "course_id": 31,
    "title": "Path Param Test Quiz",
    "total_marks": 100,
    "passing_marks": 60,
    "duration": 30
}

try:
    req = urllib.request.Request(create_quiz_url, method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, data=json.dumps(quiz_payload).encode('utf-8')) as r:
        quiz_data = json.loads(r.read().decode('utf-8'))
        quiz_id = quiz_data.get('quiz_id') or quiz_data.get('id') or quiz_data.get('data', {}).get('quiz_id')
except Exception as e:
    print(f"Failed to create quiz: {e}")
    exit(1)

# 2. Add a question
add_question_url = f"{base_url}/bsgupadmin/create-question/"
question_payload = {
    "user_id": 32,
    "quiz_id": int(quiz_id),
    "question": "What is 2+2?",
    "option1": "3",
    "option2": "4",
    "option3": "5",
    "option4": "6",
    "correct_answer": "4"
}

try:
    req = urllib.request.Request(add_question_url, method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, data=json.dumps(question_payload).encode('utf-8')) as r:
        question_data = json.loads(r.read().decode('utf-8'))
        question_id = question_data.get('question_id') or question_data.get('id') or question_data.get('data', {}).get('question_id')
except Exception as e:
    print(f"Failed to add question: {e}")
    exit(1)

print(f"Created Quiz ID: {quiz_id}, Question ID: {question_id}")

# 3. Test DELETE with path parameter
url = f"{base_url}/bsgupadmin/create-question/{question_id}/"
print(f"Testing DELETE {url}")
req = urllib.request.Request(url, method="DELETE")
try:
    with urllib.request.urlopen(req) as r:
        print(f"  Status: {r.status}")
        print(f"  Body: {r.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"  HTTPError: {e.code}")
    print(f"  Body: {e.read().decode('utf-8') if e.fp else ''}")
except Exception as e:
    print(f"  Exception: {e}")

# 4. Test DELETE with path parameter and user_id
url_user = f"{base_url}/bsgupadmin/create-question/{question_id}/?user_id=32"
print(f"Testing DELETE {url_user}")
req_user = urllib.request.Request(url_user, method="DELETE")
try:
    with urllib.request.urlopen(req_user) as r:
        print(f"  Status: {r.status}")
        print(f"  Body: {r.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"  HTTPError: {e.code}")
    print(f"  Body: {e.read().decode('utf-8') if e.fp else ''}")
except Exception as e:
    print(f"  Exception: {e}")

# 5. Fetch quiz to see if question was deleted
get_quiz_url = f"{base_url}/bsgupadmin/get-quiz/?quiz_id={quiz_id}"
try:
    with urllib.request.urlopen(get_quiz_url) as r:
        print("\nFetched Quiz detail:")
        print(json.dumps(json.loads(r.read().decode('utf-8')), indent=2))
except Exception as e:
    print(f"Failed to fetch quiz: {e}")
