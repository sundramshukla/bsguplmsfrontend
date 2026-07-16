import urllib.request
import urllib.error
from bs4 import BeautifulSoup

base_url = "https://api.bsguplms.in"
url = f"{base_url}/nonexistent_path_12345/"

try:
    urllib.request.urlopen(url)
except urllib.error.HTTPError as e:
    html = e.read().decode('utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    for idx, code in enumerate(soup.find_all('code')):
        text = code.get_text().strip()
        if text:
            print(f"{idx}: {text}")
