import urllib.request
import json

base_url = "https://api.bsguplms.in"
url = f"{base_url}/bsgupadmin/createcourse/"
try:
    with urllib.request.urlopen(url) as r:
        data = json.loads(r.read().decode('utf-8'))
        print(json.dumps(data, indent=2))
except Exception as e:
    print("Error:", e)
