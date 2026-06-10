import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"

paths = [
    "bsgupadmin/update-quiz/",
    "bsgupadmin/updatequiz/",
    "bsgupadmin/edit-quiz/",
    "bsgupadmin/editquiz/",
]

methods = ["POST", "PUT", "DELETE", "GET"]

for path in paths:
    for method in methods:
        url = f"{base_url}/{path}"
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
