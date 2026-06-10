import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"

paths = [
    "bsgupadmin/delete/",
    "bsgupadmin/delete",
    "bsgupadmin/remove/",
    "bsgupadmin/remove",
    "bsgupadmin/destroy/",
    "bsgupadmin/destroy",
]

for path in paths:
    for method in ["DELETE", "POST", "GET"]:
        url = f"{base_url}/{path}?question_id=40&id=40&user_id=32"
        print(f"Testing {method} {url}...")
        req = urllib.request.Request(url, method=method)
        try:
            with urllib.request.urlopen(req, timeout=3) as r:
                print(f"  SUCCESS: Status {r.status}")
        except urllib.error.HTTPError as e:
            if e.code != 404:
                print(f"  FOUND: Status {e.code}")
        except Exception:
            pass
print("Done probing.")
