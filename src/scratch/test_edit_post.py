import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

quiz_url = f"{base_url}/bsgupadmin/get-quiz/?quiz_id=21"
try:
    with urllib.request.urlopen(quiz_url) as r:
        quiz_data = json.loads(r.read().decode('utf-8'))
        print("Quiz Data Loaded:")
        questions = quiz_data.get('questions', [])
        if not questions:
            print("No questions found in quiz 21.")
            exit()
        
        target_q = questions[0]
        print(f"Target Question to edit: {target_q}")
        
        edit_url = f"{base_url}/bsgupadmin/create-question/"
        payload = {
            "user_id": 32, # Admin user ID 32
            "quiz_id": 21,
            "question_id": target_q['question_id'],
            "question": target_q['question'],
            "option1": target_q['option1'],
            "option2": target_q['option2'],
            "option3": target_q['option3'],
            "option4": target_q['option4'],
            "correct_answer": target_q.get('correct_answer', target_q['option1'])
        }
        
        req = urllib.request.Request(edit_url, method="POST")
        req.add_header("Content-Type", "application/json")
        body = json.dumps(payload).encode("utf-8")
        
        try:
            with urllib.request.urlopen(req, data=body) as edit_r:
                print(f"Edit POST Status: {edit_r.status}")
                print(f"Edit POST Body: {edit_r.read().decode('utf-8')}")
        except urllib.error.HTTPError as e:
            print(f"Edit POST HTTPError: {e.code}")
            print(f"Edit POST Body: {e.read().decode('utf-8') if e.fp else ''}")
            
except Exception as e:
    print(f"Error: {e}")
