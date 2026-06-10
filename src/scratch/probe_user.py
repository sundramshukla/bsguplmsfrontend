import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

paths = [
    "user/delete-question/",
    "user/delete-question",
    "user/delete-quiz-question/",
    "user/delete-quiz-question",
    "user/create-question/",
    "user/create-question",
    "user/deletequestion/",
    "user/remove-question/",
    "user/question/",
    "user/questions/",
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
