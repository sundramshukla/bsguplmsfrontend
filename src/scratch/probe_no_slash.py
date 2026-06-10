import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"

paths = [
    "bsgupadmin/delete-question",
    "bsgupadmin/deletequestion",
    "bsgupadmin/delete_question",
    "bsgupadmin/remove-question",
    "bsgupadmin/removequestion",
    "bsgupadmin/delete-quiz-question",
    "bsgupadmin/delete-quiz-questions",
]

methods = ["DELETE", "POST"]

for path in paths:
    for method in methods:
        url = f"{base_url}/{path}?question_id=40&user_id=32"
        req = urllib.request.Request(url, method=method)
        try:
            with urllib.request.urlopen(req, timeout=3) as r:
                print(f"MATCH: {method} {url} -> Status {r.status}")
        except urllib.error.HTTPError as e:
            if e.code != 404:
                print(f"MATCH (Method not allowed / Bad request): {method} {url} -> Status {e.code}")
        except Exception as e:
            pass
print("Done probing.")
