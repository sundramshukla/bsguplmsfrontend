import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"

paths = [
    "bsgupadmin/manage-question/",
    "bsgupadmin/manage-questions/",
    "bsgupadmin/question-api/",
    "bsgupadmin/questions-api/",
    "bsgupadmin/quiz-question-api/",
    "bsgupadmin/quiz-questions-api/",
    "bsgupadmin/question-detail/",
    "bsgupadmin/questions-detail/",
]

for path in paths:
    for method in ["GET", "POST", "DELETE"]:
        url = f"{base_url}/{path}"
        req = urllib.request.Request(url, method=method)
        try:
            with urllib.request.urlopen(req, timeout=3) as r:
                print(f"EXIST: {method} {url} -> {r.status}")
        except urllib.error.HTTPError as e:
            if e.code != 404:
                print(f"EXIST: {method} {url} -> {e.code}")
        except Exception:
            pass
print("Done probing.")
