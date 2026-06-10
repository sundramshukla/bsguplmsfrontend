import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

paths = [
    "bsgupadmin/delete-quiz-question/",
    "bsgupadmin/delete-quiz-question",
    "bsgupadmin/delete_quiz_question/",
    "bsgupadmin/delete_quiz_question",
    "bsgupadmin/remove-quiz-question/",
    "bsgupadmin/remove-quiz-question",
    "bsgupadmin/question-delete/",
    "bsgupadmin/question-delete",
    "bsgupadmin/delete-question-quiz/",
    "bsgupadmin/delete-question-quiz",
    "bsgupadmin/delete-question-from-quiz/",
    "bsgupadmin/delete-question-from-quiz",
    "bsgupadmin/quiz-question/",
    "bsgupadmin/quiz-questions/",
    "bsgupadmin/questions/",
    "bsgupadmin/question/",
    # Let's also try without bsgupadmin prefix just in case
    "delete-question/",
    "delete-question",
    "create-question/",
    "create-question",
]

methods = ["GET", "POST", "DELETE"]

for path in paths:
    for method in methods:
        url = f"{base_url}/{path}"
        req = urllib.request.Request(url, method=method)
        req.add_header("Content-Type", "application/json")
        try:
            # Send a dummy body for POST to avoid missing content-length/body issues
            body = json.dumps({"question_id": 39}).encode("utf-8") if method == "POST" else None
            with urllib.request.urlopen(req, data=body, timeout=3) as response:
                print(f"EXIST: {method} {url} -> {response.status}")
                print(f"  Body: {response.read().decode('utf-8')[:300]}")
        except urllib.error.HTTPError as e:
            # If status is NOT 404, it means the URL exists!
            if e.code != 404:
                print(f"EXIST: {method} {url} -> {e.code}")
                print(f"  Body: {e.read().decode('utf-8')[:300]}")
        except Exception as e:
            pass
print("Done probing.")
