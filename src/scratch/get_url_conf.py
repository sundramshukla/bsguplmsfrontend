import urllib.request
import urllib.error
import re

base_url = "https://api.bsguplms.in"
url = f"{base_url}/bsgupadmin/nonexistent_random_path_12345/"

req = urllib.request.Request(url, method="GET")
try:
    with urllib.request.urlopen(req, timeout=5) as r:
        pass
except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8')
    # Extract url patterns from django debug page
    # Look for <code> or similar pattern matching lines
    print("All urlpatterns found:")
    lines = body.splitlines()
    for line in lines:
        if "<code>" in line:
            clean_line = re.sub('<[^<]+?>', '', line).strip()
            print(clean_line)
