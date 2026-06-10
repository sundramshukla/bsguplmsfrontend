import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

url = f"{base_url}/bsgupadmin/create-quiz/?quiz_id=21&question_id=41&user_id=32"

req = urllib.request.Request(url, method="DELETE")
try:
    with urllib.request.urlopen(req, timeout=5) as response:
        print(f"Status: {response.status}")
        print(f"Body: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(f"Body: {e.read().decode('utf-8') if e.fp else ''}")
except Exception as e:
    print(f"Error: {e}")
