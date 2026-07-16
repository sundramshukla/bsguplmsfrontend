import urllib.request
import json
import urllib.error

base_url = "http://127.0.0.1:8000"

urls = [
    f"{base_url}/bsgupadmin/get-quiz/?lesson_id=5",
    f"{base_url}/bsgupadmin/get-quiz/?lesson=5",
    f"{base_url}/bsgupadmin/get-quiz/?quiz_id=1",
]

for url in urls:
    print(f"\n=================================")
    print(f"Probing local: {url}")
    try:
        with urllib.request.urlopen(url, timeout=2) as res:
            print(f"Status: {res.status}")
            data = json.loads(res.read().decode('utf-8'))
            print("Response (Success):", json.dumps(data, indent=2)[:500])
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code}")
        body = e.read().decode('utf-8', errors='ignore')
        if "application/json" in e.headers.get("Content-Type", ""):
            print("JSON error body:", body[:500])
        else:
            print("HTML error body (first 200 chars):", body[:200])
    except Exception as e:
        print(f"Error: {e}")
