import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"
url = f"{base_url}/bsgupadmin/nonexistent_random_path_12345/"

req = urllib.request.Request(url, method="GET")
try:
    with urllib.request.urlopen(req, timeout=5) as r:
        print(f"Status: {r.status}")
except urllib.error.HTTPError as e:
    print(f"Status: {e.code}")
    body = e.read().decode('utf-8')
    print("Body length:", len(body))
    # Check if 'urlpatterns' or 'Using the URLconf' is in the body
    if "urlpatterns" in body or "URLconf" in body or "views" in body or "admin" in body:
        print("Django URLconf debug page detected!")
        # Print lines containing urlpatterns or urls
        for line in body.splitlines():
            if any(term in line for term in ["admin", "course", "quiz", "question", "lesson", "profile"]):
                print(line.strip())
    else:
        print("Standard 404 page / Debug is False.")
        print(body[:1000])
except Exception as e:
    print("Error:", e)
