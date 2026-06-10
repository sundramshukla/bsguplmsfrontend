import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"
url = f"{base_url}/bsgupadmin/get-quiz/?quiz_id=30&user_id=32"

for method in ["GET", "POST", "PUT", "DELETE", "OPTIONS"]:
    req = urllib.request.Request(url, method=method)
    try:
        with urllib.request.urlopen(req, timeout=3) as r:
            print(f"{method}: Allowed (Status {r.status})")
    except urllib.error.HTTPError as e:
        print(f"{method}: Status {e.code}, Allow: {e.headers.get('Allow')}")
    except Exception as e:
        print(f"{method}: Error {e}")
