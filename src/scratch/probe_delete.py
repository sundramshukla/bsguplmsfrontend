import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

endpoints = [
    # 1. POST delete-question
    {"url": f"{base_url}/bsgupadmin/delete-question/", "method": "POST", "data": {"question_id": 39}},
    # 2. DELETE delete-question
    {"url": f"{base_url}/bsgupadmin/delete-question/?question_id=39", "method": "DELETE", "data": None},
    # 3. POST delete-question with query param
    {"url": f"{base_url}/bsgupadmin/delete-question/?question_id=39", "method": "POST", "data": None},
    # 4. POST deletequestion
    {"url": f"{base_url}/bsgupadmin/deletequestion/", "method": "POST", "data": {"question_id": 39}},
    # 5. DELETE deletequestion
    {"url": f"{base_url}/bsgupadmin/deletequestion/?question_id=39", "method": "DELETE", "data": None},
    # 6. POST deletequestion with query param
    {"url": f"{base_url}/bsgupadmin/deletequestion/?question_id=39", "method": "POST", "data": None},
    # 7. POST create-question with action=delete
    {"url": f"{base_url}/bsgupadmin/create-question/?action=delete&question_id=39", "method": "POST", "data": None},
    # 8. POST create-question with query param question_id and DELETE method? No, delete is 405.
    # 9. POST to create-question with method header or delete key in body
    {"url": f"{base_url}/bsgupadmin/create-question/", "method": "POST", "data": {"action": "delete", "question_id": 39}},
    # 10. POST to delete-question/
    {"url": f"{base_url}/bsgupadmin/delete-question/", "method": "POST", "data": {"id": 39}},
]

for idx, ep in enumerate(endpoints):
    url = ep["url"]
    method = ep["method"]
    data = ep["data"]
    
    print(f"[{idx+1}] Testing {method} {url} with data {data}...")
    
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    
    body_bytes = None
    if data is not None:
        body_bytes = json.dumps(data).encode("utf-8")
        
    try:
        with urllib.request.urlopen(req, data=body_bytes, timeout=5) as response:
            status = response.status
            resp_body = response.read().decode("utf-8")
            print(f"  SUCCESS: Status {status}, Body: {resp_body}")
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode("utf-8") if e.fp else ""
        print(f"  FAILED: Status {e.code}, Body: {resp_body}")
    except Exception as e:
        print(f"  ERROR: {e}")
