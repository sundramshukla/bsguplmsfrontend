import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"
email = "bsgupteststudent101@mailinator.com"
password = "testpassword123"

# 1. Login to get token and userId
login_url = f"{base_url}/bsgupadmin/loginthroughemail/"
payload = {"email": email, "password": password}

token = None
user_id = None

try:
    req = urllib.request.Request(login_url, method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, data=json.dumps(payload).encode('utf-8')) as r:
        data = json.loads(r.read().decode('utf-8'))
        print("Login Success:")
        print(json.dumps(data, indent=2))
        
        # Extract token
        if "token" in data:
            token = data["token"]
        elif "data" in data and "token" in data["data"]:
            token = data["data"]["token"]
            
        # Extract user id
        if "user_id" in data:
            user_id = data["user_id"]
        elif "data" in data and "user_id" in data["data"]:
            user_id = data["data"]["user_id"]
        elif "data" in data and "id" in data["data"]:
            user_id = data["data"]["id"]
        elif "id" in data:
            user_id = data["id"]
except Exception as e:
    print(f"Login failed: {e}")

if not token or not user_id:
    print(f"Could not retrieve token ({token}) or user_id ({user_id})")
    # Let's try with bsgupteststudent102@mailinator.com
    email = "bsgupteststudent102@mailinator.com"
    payload = {"email": email, "password": password}
    try:
        req = urllib.request.Request(login_url, method="POST")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, data=json.dumps(payload).encode('utf-8')) as r:
            data = json.loads(r.read().decode('utf-8'))
            print("Login Success (student 102):")
            print(json.dumps(data, indent=2))
            if "token" in data: token = data["token"]
            elif "data" in data and "token" in data["data"]: token = data["data"]["token"]
            if "user_id" in data: user_id = data["user_id"]
            elif "data" in data and "user_id" in data["data"]: user_id = data["data"]["user_id"]
            elif "data" in data and "id" in data["data"]: user_id = data["data"]["id"]
            elif "id" in data: user_id = data["id"]
    except Exception as e2:
        print(f"Login failed for student 102: {e2}")

if token and user_id:
    # 2. Test profile endpoint with different authorization headers
    profile_url = f"{base_url}/bsgupadmin/profile/?user_id={user_id}"
    
    headers_to_test = [
        ("No Auth Header", {}),
        ("Bearer Header", {"Authorization": f"Bearer {token}"}),
        ("Token Header", {"Authorization": f"Token {token}"}),
    ]
    
    for desc, headers in headers_to_test:
        print(f"\nTesting: {desc} with headers {headers}")
        req = urllib.request.Request(profile_url, method="GET")
        for k, v in headers.items():
            req.add_header(k, v)
        try:
            with urllib.request.urlopen(req) as r:
                print(f"  Status: {r.status}")
                res_body = r.read().decode('utf-8')
                print(f"  Body: {res_body[:200]}...")
        except urllib.error.HTTPError as e:
            print(f"  HTTPError: {e.code}")
            try:
                print(f"  Body: {e.read().decode('utf-8')}")
            except Exception:
                pass
        except Exception as e:
            print(f"  Exception: {e}")
else:
    print("Skipping profile tests because credentials are missing.")
