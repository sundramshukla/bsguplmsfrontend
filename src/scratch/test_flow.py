import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

# 1. Create a quiz
create_quiz_url = f"{base_url}/bsgupadmin/create-quiz/"
quiz_payload = {
    "user_id": 32,
    "course_id": 31,
    "title": "Temp Test Quiz",
    "total_marks": 100,
    "passing_marks": 60,
    "duration": 30
}

try:
    req = urllib.request.Request(create_quiz_url, method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, data=json.dumps(quiz_payload).encode('utf-8')) as r:
        quiz_data = json.loads(r.read().decode('utf-8'))
        print("Quiz Created:")
        print(json.dumps(quiz_data, indent=2))
        quiz_id = quiz_data.get('quiz_id') or quiz_data.get('id') or quiz_data.get('data', {}).get('quiz_id')
except Exception as e:
    print(f"Failed to create quiz: {e}")
    exit(1)

if not quiz_id:
    print("No quiz_id returned.")
    exit(1)

# 2. Add a question
add_question_url = f"{base_url}/bsgupadmin/create-question/"
question_payload = {
    "user_id": 32,
    "quiz_id": int(quiz_id),
    "question": "What color is the sky?",
    "option1": "Blue",
    "option2": "Green",
    "option3": "Red",
    "option4": "Yellow",
    "correct_answer": "Blue"
}

try:
    req = urllib.request.Request(add_question_url, method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, data=json.dumps(question_payload).encode('utf-8')) as r:
        question_data = json.loads(r.read().decode('utf-8'))
        print("Question Added:")
        print(json.dumps(question_data, indent=2))
        question_id = question_data.get('question_id') or question_data.get('id') or question_data.get('data', {}).get('question_id')
except Exception as e:
    print(f"Failed to add question: {e}")
    exit(1)

if not question_id:
    print("No question_id returned.")
    exit(1)

# 3. Try to fetch the quiz to make sure everything looks right
get_quiz_url = f"{base_url}/bsgupadmin/get-quiz/?quiz_id={quiz_id}"
try:
    with urllib.request.urlopen(get_quiz_url) as r:
        print("Fetched Quiz detail:")
        print(json.dumps(json.loads(r.read().decode('utf-8')), indent=2))
except Exception as e:
    print(f"Failed to fetch quiz: {e}")

# 4. Now let's try to delete this specific question using DELETE on create-question/?question_id=...&user_id=32
# Since we got 405 on this earlier, let's see if there is another endpoint we can hit.
# Wait! Let's probe delete on `/bsgupadmin/create-question/` again but with user_id query param just in case
print(f"\nAttempting deletion of question_id={question_id}...")
# Let's test a few URLs for deletion:
urls_to_test = [
    f"{base_url}/bsgupadmin/create-question/?question_id={question_id}&user_id=32",
    f"{base_url}/bsgupadmin/create-quiz/?quiz_id={quiz_id}&question_id={question_id}&user_id=32",
]

for url in urls_to_test:
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

# 5. Let's fetch the quiz details again to see if the quiz was deleted or if the question was deleted
try:
    with urllib.request.urlopen(get_quiz_url) as r:
        print("\nFetched Quiz detail after delete attempts:")
        print(json.dumps(json.loads(r.read().decode('utf-8')), indent=2))
except Exception as e:
    print(f"\nFailed to fetch quiz after delete attempts (maybe the quiz itself got deleted): {e}")
