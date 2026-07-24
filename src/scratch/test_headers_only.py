import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"
profile_url = f"{base_url}/bsgupadmin/profile/?user_id=1"

headers_to_test = [
    ("No Auth Header", {}),
    ("Bearer Header (dummy token)", {"Authorization": "Bearer dummy_token_value_123"}),
    ("Token Header (dummy token)", {"Authorization": "Token dummy_token_value_123"}),
]

for desc, headers in headers_to_test:
    print(f"\nTesting: {desc}")
    req = urllib.request.Request(profile_url, method="GET")
    for k, v in headers.items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req) as r:
            print(f"  Status: {r.status}")
            print(f"  Body: {r.read().decode('utf-8')[:100]}...")
    except urllib.error.HTTPError as e:
        print(f"  HTTPError: {e.code}")
        try:
            print(f"  Body: {e.read().decode('utf-8')}")
        except Exception:
            pass
    except Exception as e:
        print(f"  Exception: {e}")
