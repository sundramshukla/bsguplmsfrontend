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
        "title": "POST Delete Test Quiz",
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
        "question": "Test Question?",
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

# Let's test different delete flags in POST body
flags = [
    {"action": "delete"},
    {"delete": True},
    {"delete": "true"},
    {"is_delete": True},
    {"method": "delete"},
    {"operation": "delete"}
]

for flag_dict in flags:
    quiz_id, question_id = create_quiz_and_question()
    print(f"\nCreated Quiz {quiz_id}, Question {question_id}. Testing flag: {flag_dict}")
    
    url = f"{base_url}/bsgupadmin/create-question/"
    payload = {
        "user_id": 32,
        "quiz_id": int(quiz_id),
        "question_id": int(question_id),
        "question": "Test Question?",
        "option1": "A",
        "option2": "B",
        "option3": "C",
        "option4": "D",
        "correct_answer": "A",
        **flag_dict
    }
    
    req = urllib.request.Request(url, method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, data=json.dumps(payload).encode('utf-8')) as r:
            res_data = json.loads(r.read().decode('utf-8'))
            print(f"  POST Response: {res_data}")
    except Exception as e:
        print(f"  POST Error: {e}")
        continue
        
    # Check if the question was deleted
    get_quiz_url = f"{base_url}/bsgupadmin/get-quiz/?quiz_id={quiz_id}"
    try:
        with urllib.request.urlopen(get_quiz_url) as r:
            quiz_detail = json.loads(r.read().decode('utf-8'))
            questions = quiz_detail.get('questions', [])
            q_ids = [q.get('question_id') or q.get('id') for q in questions]
            print(f"  Questions remaining in quiz: {q_ids}")
            if int(question_id) not in q_ids:
                print(f"  !!! SUCCESS !!! Question {question_id} was DELETED using flag: {flag_dict}")
            else:
                print(f"  Question still exists.")
    except Exception as e:
        print(f"  Fetch error: {e}")
