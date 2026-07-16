import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

def probe_profile(user_id=None):
    if user_id is not None:
        url = f"{base_url}/bsgupadmin/profile/?user_id={user_id}"
    else:
        url = f"{base_url}/bsgupadmin/profile/"
    print(f"\nProbing profile: url={url}")
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            print(f"Status: {r.status}")
            data = json.loads(r.read().decode('utf-8'))
            print("Response (Success):", json.dumps(data, indent=2)[:500])
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code}")
        body = e.read().decode('utf-8', errors='ignore')
        try:
            err_data = json.loads(body)
            print("Response (JSON Error):", json.dumps(err_data, indent=2))
        except:
            print("Response (HTML/Text Error):", body[:500])
    except Exception as e:
        print(f"Exception: {e}")

probe_profile(47)
probe_profile(1)
probe_profile()
