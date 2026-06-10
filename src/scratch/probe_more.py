import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

endpoints = [
    # Variations of delete-question / delete_question / remove-question
    {"url": f"{base_url}/bsgupadmin/delete-question", "method": "DELETE", "data": None},
    {"url": f"{base_url}/bsgupadmin/delete-question", "method": "POST", "data": {"question_id": 39}},
    
    {"url": f"{base_url}/bsgupadmin/delete_question/", "method": "DELETE", "data": None},
    {"url": f"{base_url}/bsgupadmin/delete_question/", "method": "POST", "data": {"question_id": 39}},
    {"url": f"{base_url}/bsgupadmin/delete_question", "method": "DELETE", "data": None},
    {"url": f"{base_url}/bsgupadmin/delete_question", "method": "POST", "data": {"question_id": 39}},

    {"url": f"{base_url}/bsgupadmin/deletequestion", "method": "DELETE", "data": None},
    {"url": f"{base_url}/bsgupadmin/deletequestion", "method": "POST", "data": {"question_id": 39}},

    {"url": f"{base_url}/bsgupadmin/remove-question/", "method": "DELETE", "data": None},
    {"url": f"{base_url}/bsgupadmin/remove-question/", "method": "POST", "data": {"question_id": 39}},
    {"url": f"{base_url}/bsgupadmin/remove-question", "method": "DELETE", "data": None},
    {"url": f"{base_url}/bsgupadmin/remove-question", "method": "POST", "data": {"question_id": 39}},

    # Maybe the question is deleted using delete-quiz/ or similar? No, that deletes the quiz.
]

for idx, ep in enumerate(endpoints):
    url = ep["url"]
    method = ep["method"]
    data = ep["data"]
    
    print(f"[{idx+1}] Testing {method} {url}...")
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    
    body_bytes = None
    if data is not None:
        body_bytes = json.dumps(data).encode("utf-8")
        
    try:
        with urllib.request.urlopen(req, data=body_bytes, timeout=5) as response:
            print(f"  SUCCESS: Status {response.status}, Body: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"  FAILED: Status {e.code}, Body: {e.read().decode('utf-8') if e.fp else ''}")
    except Exception as e:
        print(f"  ERROR: {e}")
