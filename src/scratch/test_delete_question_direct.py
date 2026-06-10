import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"
# Let's delete the newly created question ID 40
url = f"{base_url}/bsgupadmin/create-question/?question_id=40&user_id=32"

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
