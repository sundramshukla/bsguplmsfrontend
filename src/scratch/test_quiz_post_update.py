import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

# 1. Create a quiz
create_quiz_url = f"{base_url}/bsgupadmin/create-quiz/"
quiz_payload = {
    "user_id": 32,
    "course_id": 31,
    "title": "POST Update Test Quiz",
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

# 2. Add a question
add_question_url = f"{base_url}/bsgupadmin/create-question/"
question_payload = {
    "user_id": 32,
    "quiz_id": int(quiz_id),
    "question": "Question to be removed",
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

# 3. Verify it was added
get_quiz_url = f"{base_url}/bsgupadmin/get-quiz/?quiz_id={quiz_id}"
try:
    with urllib.request.urlopen(get_quiz_url) as r:
        print("Quiz before update:")
        print(json.dumps(json.loads(r.read().decode('utf-8')), indent=2))
except Exception as e:
    print(f"Failed to fetch quiz: {e}")

# 4. Now send a POST request to create-quiz/ with quiz_id and empty questions list
update_payload = {
    "id": int(quiz_id),
    "quiz_id": int(quiz_id),
    "user_id": 32,
    "course_id": 31,
    "title": "POST Update Test Quiz (Updated Title)",
    "total_marks": 100,
    "passing_marks": 60,
    "duration": 30,
    "questions": []  # Let's try sending empty questions list
}

req_update = urllib.request.Request(create_quiz_url, method="POST")
req_update.add_header("Content-Type", "application/json")
try:
    with urllib.request.urlopen(req_update, data=json.dumps(update_payload).encode('utf-8')) as r:
        print("\nPOST Update Response:")
        print(json.dumps(json.loads(r.read().decode('utf-8')), indent=2))
except Exception as e:
    print(f"\nPOST Update Failed: {e}")

# 5. Fetch quiz again to see if title updated and if the question got deleted
try:
    with urllib.request.urlopen(get_quiz_url) as r:
        print("\nQuiz after update:")
        print(json.dumps(json.loads(r.read().decode('utf-8')), indent=2))
except Exception as e:
    print(f"Failed to fetch quiz after update: {e}")
