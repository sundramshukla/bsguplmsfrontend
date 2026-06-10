import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"

paths = [
    "bsgupadmin/edit-question/",
    "bsgupadmin/editquestion/",
    "bsgupadmin/update-question/",
    "bsgupadmin/updatequestion/",
    "bsgupadmin/question-edit/",
    "bsgupadmin/question-delete/",
    "bsgupadmin/delete-questions/",
    "bsgupadmin/remove-questions/",
]

methods = ["GET", "POST", "PUT", "DELETE"]

for path in paths:
    for method in methods:
        url = f"{base_url}/{path}?question_id=43&user_id=32&quiz_id=23"
        req = urllib.request.Request(url, method=method)
        try:
            with urllib.request.urlopen(req, timeout=3) as r:
                print(f"MATCH: {method} {url} -> Status {r.status}")
                print(f"  Body: {r.read().decode('utf-8')[:200]}")
        except urllib.error.HTTPError as e:
            if e.code != 404:
                print(f"MATCH (Method not allowed / Bad request): {method} {url} -> Status {e.code}")
                print(f"  Body: {e.read().decode('utf-8')[:200]}")
        except Exception as e:
            pass
print("Done probing.")
