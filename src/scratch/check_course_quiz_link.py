import urllib.request
import json

base_url = "https://api.bsguplms.in"

# 1. Check get-quiz/ by course_id before creating a new one
course_id = 31
get_url = f"{base_url}/bsgupadmin/get-quiz/?course_id={course_id}"
try:
    with urllib.request.urlopen(get_url) as r:
        data = json.loads(r.read().decode('utf-8'))
        print("Quiz by course_id before:")
        print(json.dumps(data, indent=2))
except Exception as e:
    print("Failed to get quiz by course_id:", e)

# 2. Create a quiz for course 31
create_quiz_url = f"{base_url}/bsgupadmin/create-quiz/"
quiz_payload = {
    "user_id": 32,
    "course_id": course_id,
    "title": "Course Link Test Quiz",
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
        print(f"\nCreated Quiz ID: {quiz_id}")
except Exception as e:
    print("Failed to create quiz:", e)
    exit(1)

# 3. Check get-quiz/ by course_id after creating a new one
try:
    with urllib.request.urlopen(get_url) as r:
        data = json.loads(r.read().decode('utf-8'))
        print("\nQuiz by course_id after:")
        print(json.dumps(data, indent=2))
except Exception as e:
    print("Failed to get quiz by course_id after creation:", e)
