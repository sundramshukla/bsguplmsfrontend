import urllib.request
import urllib.error

base_url = "https://api.bsguplms.in"

urls = [
    f"{base_url}/bsgupadmin/delete-question/39/",
    f"{base_url}/bsgupadmin/delete-question/39",
    f"{base_url}/bsgupadmin/deletequestion/39/",
    f"{base_url}/bsgupadmin/deletequestion/39",
    f"{base_url}/bsgupadmin/delete_question/39/",
    f"{base_url}/bsgupadmin/delete_question/39",
    f"{base_url}/bsgupadmin/remove-question/39/",
    f"{base_url}/bsgupadmin/remove-question/39",
]

for url in urls:
    print(f"Probing DELETE {url}...")
    req = urllib.request.Request(url, method="DELETE")
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"  Response: {response.status}")
            print(f"  Body: {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"  HTTPError: {e.code}, Body: {e.read().decode('utf-8') if e.fp else ''}")
    except Exception as e:
        print(f"  Error: {e}")
