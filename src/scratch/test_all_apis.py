import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_request(url, method="GET", body=None, headers=None):
    if headers is None:
        headers = {}
    
    req = urllib.request.Request(url, method=method)
    for key, val in headers.items():
        req.add_header(key, val)
        
    data = None
    if body is not None:
        if isinstance(body, dict):
            req.add_header("Content-Type", "application/json")
            data = json.dumps(body).encode("utf-8")
        else:
            data = body
            
    try:
        with urllib.request.urlopen(req, data=data, timeout=8) as response:
            status = response.status
            resp_body = response.read().decode("utf-8")
            try:
                parsed = json.loads(resp_body)
                return status, parsed, None
            except Exception:
                return status, resp_body, None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8") if e.fp else ""
        try:
            parsed = json.loads(err_body)
            return e.code, parsed, e
        except Exception:
            return e.code, err_body, e
    except Exception as e:
        return 0, str(e), e

def test_registered_students():
    print("\n--- Testing Registered Students API ---")
    url = f"{BASE_URL}/bsgupadmin/registered-students-list/?admin_id=8"
    print(f"Request: GET {url}")
    status, body, err = make_request(url)
    print(f"Response Status: {status}")
    if err:
        print(f"Error / Failure Details: {body}")
    else:
        print(f"Success! Retrieved {len(body) if isinstance(body, list) else 'some'} students.")
        print(json.dumps(body, indent=2)[:500] + "...")

def test_quiz_lifecycle():
    print("\n--- Testing Quiz & Attempt Lifecycle APIs ---")
    
    # 1. Create a quiz linked to lesson 5
    create_url = f"{BASE_URL}/bsgupadmin/create-quiz/"
    quiz_payload = {
        "user_id": 1,
        "lesson": 5,
        "title": "Integration Test Assessment",
        "total_questions": 1,
        "marks_per_question": 2,
        "passing_marks": 60,
        "duration": 15,
        "is_final": True,
        "is_active": True
    }
    print(f"1. Creating Quiz: POST {create_url}")
    status, create_resp, err = make_request(create_url, method="POST", body=quiz_payload)
    print(f"Response Status: {status}")
    print(f"Response: {json.dumps(create_resp, indent=2)}")
    
    if err:
        print("Skipping subsequent lifecycle tests due to creation error.")
        return
        
    quiz_id = None
    if isinstance(create_resp, dict):
        if "data" in create_resp and "id" in create_resp["data"]:
            quiz_id = create_resp["data"]["id"]
        elif "id" in create_resp:
            quiz_id = create_resp["id"]
            
    if not quiz_id:
        # Try fetching the quiz to get the ID
        get_url = f"{BASE_URL}/bsgupadmin/get-quiz/?lesson_id=5"
        print(f"2. Fetching Quiz: GET {get_url}")
        status, get_resp, err = make_request(get_url)
        if isinstance(get_resp, dict) and "data" in get_resp:
            quiz_id = get_resp["data"].get("id") or get_resp["data"].get("quiz_id")
            print(f"Found Quiz ID from fetch: {quiz_id}")
            
    if not quiz_id:
        print("Could not obtain Quiz ID. Skipping start and submit tests.")
        return

    # 3. Create question
    quest_url = f"{BASE_URL}/bsgupadmin/create-question/"
    quest_payload = {
        "user_id": 1,
        "quiz_id": int(quiz_id),
        "questions": [
            {
                "question": "What is Python?",
                "option1": "Programming Language",
                "option2": "Snake",
                "option3": "Both",
                "option4": "None",
                "correct_answer": "Programming Language"
            }
        ]
    }
    print(f"3. Creating Question: POST {quest_url}")
    status, quest_resp, err = make_request(quest_url, method="POST", body=quest_payload)
    print(f"Response Status: {status}")
    print(f"Response: {json.dumps(quest_resp, indent=2)}")

    # 4. Start quiz attempt
    start_url = f"{BASE_URL}/user/start-quiz/"
    start_payload = {
        "user_id": 1,
        "quiz_id": int(quiz_id)
    }
    print(f"4. Starting Quiz Attempt: POST {start_url}")
    status, start_resp, err = make_request(start_url, method="POST", body=start_payload)
    print(f"Response Status: {status}")
    print(f"Response: {json.dumps(start_resp, indent=2)}")
    
    attempt_id = None
    if isinstance(start_resp, dict) and "data" in start_resp:
        attempt_id = start_resp["data"].get("attempt_id")
        
    if not attempt_id:
        print("Failed to retrieve attempt_id. Skipping submit quiz test.")
        return

    # 5. Submit quiz attempt
    submit_payload = {
        "user_id": 1,
        "quiz_id": int(quiz_id),
        "attempt_id": int(attempt_id),
        "answers": [
            {
                "question_id": 1,
                "answer": "Programming Language"
            }
        ]
    }
    print(f"5. Submitting Quiz: PUT {start_url}")
    status, submit_resp, err = make_request(start_url, method="PUT", body=submit_payload)
    print(f"Response Status: {status}")
    print(f"Response: {json.dumps(submit_resp, indent=2)}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        BASE_URL = sys.argv[1]
    print(f"Using BASE_URL: {BASE_URL}")
    test_registered_students()
    test_quiz_lifecycle()
