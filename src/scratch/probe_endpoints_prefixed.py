import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

paths = [
    "bsgupadmin/create-question/",
    "bsgupadmin/delete-question/",
    "bsgupadmin/delete-question",
    "bsgupadmin/deletequestion/",
    "bsgupadmin/deletequestion",
    "bsgupadmin/delete_question/",
    "bsgupadmin/delete_question",
    "bsgupadmin/remove-question/",
    "bsgupadmin/remove-question",
    "bsgupadmin/removequestion/",
    "bsgupadmin/remove_question/",
    "bsgupadmin/delete-quiz-question/",
    "bsgupadmin/delete-quiz-question",
    "bsgupadmin/delete-quiz-questions/",
    "bsgupadmin/delete-question-quiz/",
    "bsgupadmin/delete-question-from-quiz/",
    "bsgupadmin/question-delete/",
    "bsgupadmin/question/",
    "bsgupadmin/questions/",
    "bsgupadmin/quiz-question/",
    "bsgupadmin/quiz-questions/",
    "bsgupadmin/create-question/delete/",
    "bsgupadmin/create-question/remove/",
    "bsgupadmin/create-question/destroy/",
]

methods = ["GET", "POST", "DELETE"]

for path in paths:
    for method in methods:
        url = f"{base_url}/{path}"
        req = urllib.request.Request(url, method=method)
        req.add_header("Content-Type", "application/json")
        try:
            body = json.dumps({"question_id": 39, "id": 39}).encode("utf-8") if method == "POST" else None
            with urllib.request.urlopen(req, data=body, timeout=3) as response:
                print(f"EXIST: {method} {url} -> {response.status}")
                print(f"  Body: {response.read().decode('utf-8')[:300]}")
        except urllib.error.HTTPError as e:
            if e.code != 404:
                print(f"EXIST: {method} {url} -> {e.code}")
                print(f"  Body: {e.read().decode('utf-8')[:300]}")
        except Exception as e:
            pass
print("Done probing.")
