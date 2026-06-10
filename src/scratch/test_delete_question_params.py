import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"

paths = [
    "bsgupadmin/delete-question/",
    "bsgupadmin/deletequestion/",
    "bsgupadmin/delete_question/",
    "bsgupadmin/remove-question/",
    "bsgupadmin/removequestion/",
    "bsgupadmin/delete-quiz-question/",
    "bsgupadmin/delete-quiz-questions/",
]

methods = ["DELETE", "POST"]

for path in paths:
    for method in methods:
        url = f"{base_url}/{path}?question_id=40&user_id=32"
        print(f"Testing {method} {url}...")
        req = urllib.request.Request(url, method=method)
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                print(f"  SUCCESS: Status {response.status}")
                print(f"  Body: {response.read().decode('utf-8')[:300]}")
        except urllib.error.HTTPError as e:
            print(f"  FAILED: Status {e.code}")
            try:
                print(f"  Body: {e.read().decode('utf-8')[:300]}")
            except Exception:
                pass
        except Exception as e:
            print(f"  Error: {e}")
