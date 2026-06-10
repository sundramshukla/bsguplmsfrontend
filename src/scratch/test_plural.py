import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"

for method in ["GET", "POST", "DELETE"]:
    url = f"{base_url}/bsgupadmin/create-questions/"
    req = urllib.request.Request(url, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            print(f"{method} -> {r.status}")
    except urllib.error.HTTPError as e:
        print(f"{method} -> {e.code}")
    except Exception as e:
        print(f"{method} -> Error: {e}")
