import urllib.request
import urllib.error

url = "https://api.bsguplms.in/bsgupadmin/nonexistent-route-for-debug/"
try:
    with urllib.request.urlopen(url, timeout=5) as response:
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"Status: {e.code}")
    print(e.read().decode('utf-8')[:2000])
