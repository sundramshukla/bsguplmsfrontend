import urllib.request
import json
import urllib.error

base_url = "https://api.bsguplms.in"

urls = [
    f"{base_url}/bsgupadmin/get-quiz/?lesson_id=5",
    f"{base_url}/bsgupadmin/get-quiz/?lesson=5",
    f"{base_url}/bsgupadmin/get-quiz/?course_id=31",
]

for url in urls:
    print(f"\n=================================")
    print(f"Probing: {url}")
    try:
        with urllib.request.urlopen(url, timeout=5) as res:
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
