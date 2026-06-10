import urllib.request
import json

base_url = "https://api.bsguplms.in"
url = f"{base_url}/bsgupadmin/get-quiz/?quiz_id=21"

try:
    with urllib.request.urlopen(url) as response:
        print(f"Status: {response.status}")
        data = json.loads(response.read().decode('utf-8'))
        print(f"Success: {data.get('success')}")
        print(f"Quiz Title: {data.get('quiz', {}).get('title') if data.get('quiz') else data.get('data', {}).get('title')}")
        print(f"Questions Count: {len(data.get('questions', []))}")
        print("Questions:")
        for q in data.get('questions', []):
            print(f"  ID: {q.get('question_id')}, Question: {q.get('question')}")
except Exception as e:
    print(f"Error: {e}")
