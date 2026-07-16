import urllib.request
import urllib.error
import re

base_url = "https://api.bsguplms.in"
url = f"{base_url}/user/nonexistent_path_12345/"

try:
    urllib.request.urlopen(url)
except urllib.error.HTTPError as e:
    html = e.read().decode('utf-8')
    matches = re.findall(r'<li>\s*(.*?)\s*</li>', html, re.DOTALL)
    for m in matches:
        clean = re.sub('<[^<]+?>', '', m).strip()
        clean = re.sub(r'\s+', ' ', clean)
        print(clean)
