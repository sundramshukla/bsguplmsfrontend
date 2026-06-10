import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

# 1. Fetch quiz 21
quiz_url = f"{base_url}/bsgupadmin/get-quiz/?quiz_id=21"
try:
    with urllib.request.urlopen(quiz_url) as r:
        quiz_data = json.loads(r.read().decode('utf-8'))
    print("Fetched Quiz Data:")
    print(json.dumps(quiz_data, indent=2))
except Exception as e:
    print(f"Error fetching quiz: {e}")
    exit(1)

# 2. Try PUT /bsgupadmin/create-quiz/ with questions list modified
# Let's say we have questions. We can try sending the PUT request with a modified questions list.
# But first, let's see if we can perform a normal PUT request with questions list.
# We'll construct a PUT payload.
quiz_info = quiz_data.get('quiz', {})
questions = quiz_data.get('questions', [])

# Let's try to remove the last question from the list
if len(questions) > 1:
    modified_questions = questions[:-1]
else:
    modified_questions = []

print(f"\nOriginal questions count: {len(questions)}")
print(f"Target modified questions count: {len(modified_questions)}")

payload = {
    "id": quiz_info.get('id'),
    "quiz_id": quiz_info.get('id'),
    "user_id": 32,
    "course_id": quiz_info.get('course'),
    "title": quiz_info.get('title'),
    "total_marks": quiz_info.get('total_marks'),
    "passing_marks": quiz_info.get('passing_marks'),
    "duration": quiz_info.get('duration'),
    "questions": modified_questions
}

put_url = f"{base_url}/bsgupadmin/create-quiz/"
req = urllib.request.Request(put_url, method="PUT")
req.add_header("Content-Type", "application/json")

try:
    with urllib.request.urlopen(req, data=json.dumps(payload).encode('utf-8')) as r:
        print(f"\nPUT Status: {r.status}")
        print(f"PUT Response: {r.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"\nPUT HTTPError Status: {e.code}")
    print(f"PUT HTTPError Body: {e.read().decode('utf-8') if e.fp else ''}")
except Exception as e:
    print(f"\nPUT Exception: {e}")
