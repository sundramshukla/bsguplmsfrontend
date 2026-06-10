import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"

# Let's test question ID 39 (from the screenshot) or other numbers to see the status code
endpoints = [
    f"{base_url}/bsgupadmin/create-question/39/",
    f"{base_url}/bsgupadmin/create-question/39",
    f"{base_url}/bsgupadmin/create-quiz/1/",
]

for url in endpoints:
    print(f"Probing DELETE {url}...")
    req = urllib.request.Request(url, method="DELETE")
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"  Response: {response.status}")
    except urllib.error.HTTPError as e:
        print(f"  HTTPError: {e.code}, Body: {e.read().decode('utf-8') if e.fp else ''}")
    except Exception as e:
        print(f"  Error: {e}")
