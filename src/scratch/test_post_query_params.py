import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

def create_quiz_and_question():
    # Create quiz
    create_quiz_url = f"{base_url}/bsgupadmin/create-quiz/"
    quiz_payload = {
        "user_id": 32,
        "course_id": 31,
        "title": "POST Query Delete Test Quiz",
        "total_marks": 100,
        "passing_marks": 60,
        "duration": 30
    }
    req = urllib.request.Request(create_quiz_url, method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, data=json.dumps(quiz_payload).encode('utf-8')) as r:
        quiz_data = json.loads(r.read().decode('utf-8'))
        quiz_id = quiz_data.get('quiz_id') or quiz_data.get('id') or quiz_data.get('data', {}).get('quiz_id')

    # Add question
    add_question_url = f"{base_url}/bsgupadmin/create-question/"
    question_payload = {
        "user_id": 32,
        "quiz_id": int(quiz_id),
        "question": "Query Delete Question?",
        "option1": "A",
        "option2": "B",
        "option3": "C",
        "option4": "D",
        "correct_answer": "A"
    }
    req = urllib.request.Request(add_question_url, method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, data=json.dumps(question_payload).encode('utf-8')) as r:
        question_data = json.loads(r.read().decode('utf-8'))
        question_id = question_data.get('question_id') or question_data.get('id') or question_data.get('data', {}).get('question_id')

    return quiz_id, question_id

# Test variations of POST with query params
variations = [
    "?question_id={q_id}&action=delete&user_id=32",
    "?question_id={q_id}&delete=true&user_id=32",
    "?question_id={q_id}&method=delete&user_id=32",
    "?question_id={q_id}&user_id=32&delete=1"
]

for var in variations:
    quiz_id, question_id = create_quiz_and_question()
    query = var.format(q_id=question_id)
    url = f"{base_url}/bsgupadmin/create-question/{query}"
    print(f"\nCreated Quiz {quiz_id}, Question {question_id}. Testing POST {url}")
    
    # We send an empty body or minimal body to see if it bypasses validation
    req = urllib.request.Request(url, method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        # Try with empty body first
        with urllib.request.urlopen(req, data=json.dumps({}).encode('utf-8')) as r:
            print(f"  POST Response: {json.loads(r.read().decode('utf-8'))}")
    except urllib.error.HTTPError as e:
        print(f"  POST HTTPError: {e.code}")
        print(f"  Body: {e.read().decode('utf-8')[:300]}")
        
    # Check if the question was deleted
    get_quiz_url = f"{base_url}/bsgupadmin/get-quiz/?quiz_id={quiz_id}"
    try:
        with urllib.request.urlopen(get_quiz_url) as r:
            quiz_detail = json.loads(r.read().decode('utf-8'))
            questions = quiz_detail.get('questions', [])
            q_ids = [q.get('question_id') or q.get('id') for q in questions]
            print(f"  Questions remaining in quiz: {q_ids}")
            if int(question_id) not in q_ids:
                print(f"  !!! SUCCESS !!! Question {question_id} was DELETED!")
            else:
                print(f"  Question still exists.")
    except Exception as e:
        print(f"  Fetch error: {e}")
