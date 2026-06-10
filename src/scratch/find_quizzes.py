import urllib.request
import json

base_url = "https://api.bsguplms.in"

print("Scanning by quiz_id...")
for qid in range(1, 100):
    url = f"{base_url}/bsgupadmin/get-quiz/?quiz_id={qid}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=3) as r:
            data = json.loads(r.read().decode('utf-8'))
            if data.get('success') != False:
                print(f"Quiz ID {qid} exists:")
                print(f"  Title: {data.get('quiz', {}).get('title') or data.get('title')}")
                print(f"  Course ID: {data.get('quiz', {}).get('course')}")
                questions = data.get('questions', [])
                print(f"  Questions ({len(questions)}):")
                for q in questions:
                    print(f"    - ID: {q.get('question_id') or q.get('id')}, Text: {q.get('question')}")
    except Exception as e:
        pass

print("\nScanning by course_id...")
for cid in range(1, 100):
    url = f"{base_url}/bsgupadmin/get-quiz/?course_id={cid}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=3) as r:
            data = json.loads(r.read().decode('utf-8'))
            if data.get('success') != False:
                # If data is a list
                if isinstance(data, list):
                    data = data[0] if len(data) > 0 else {}
                elif isinstance(data.get('data'), list):
                    data = data.get('data')[0] if len(data.get('data')) > 0 else {}
                
                title = data.get('title') or data.get('quiz', {}).get('title')
                if title:
                    print(f"Course ID {cid} has quiz:")
                    print(f"  Title: {title}")
                    questions = data.get('questions', [])
                    print(f"  Questions ({len(questions)}):")
                    for q in questions:
                        print(f"    - ID: {q.get('question_id') or q.get('id')}, Text: {q.get('question')}")
    except Exception as e:
        pass
