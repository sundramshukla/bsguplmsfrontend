import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"
url = f"{base_url}/bsgupadmin/create-question/?question_id=41&user_id=32"

req = urllib.request.Request(url, method="DELETE")
try:
    with urllib.request.urlopen(req, timeout=5) as r:
        print(f"Status: {r.status}")
        print(f"Body: {r.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTPError Status: {e.code}")
    print(f"HTTPError Headers: {dict(e.headers)}")
    print(f"HTTPError Body: {e.read().decode('utf-8') if e.fp else ''}")
except Exception as e:
    print(f"Exception: {e}")
