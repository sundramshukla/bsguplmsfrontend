import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"
user_id = 32
course_id = 31

# 1. Enroll user in course 31 if not already enrolled
enroll_url = f"{base_url}/user/enrollment/"
enroll_payload = {
    "user_id": user_id,
    "course_id": course_id
}
req = urllib.request.Request(enroll_url, method="POST")
req.add_header("Content-Type", "application/json")
try:
    with urllib.request.urlopen(req, data=json.dumps(enroll_payload).encode('utf-8')) as r:
        print("Enrollment status: success")
except urllib.error.HTTPError as e:
    # Already enrolled is fine
    print(f"Enrollment status: {e.code}")

# 2. Get enrollments and check current quiz ID for course 31
my_courses_url = f"{base_url}/user/my-courses/?user_id={user_id}"
current_quiz_id = None
try:
    with urllib.request.urlopen(my_courses_url) as r:
        data = json.loads(r.read().decode('utf-8'))
        rows = data.get('data') or data.get('enrollments') or []
        for row in rows:
            c_id = row.get('course_id') or (row.get('course') and row.get('course').get('id'))
            if c_id == course_id:
                current_quiz_id = row.get('quiz_id') or (row.get('quiz') and row.get('quiz').get('id'))
                print(f"Current Quiz ID in enrollment: {current_quiz_id}")
except Exception as e:
    print("Failed to fetch enrollments:", e)

# 3. Create a new quiz for course 31
create_quiz_url = f"{base_url}/bsgupadmin/create-quiz/"
quiz_payload = {
    "user_id": 32,
    "course_id": course_id,
    "title": "Recreation Workaround Test Quiz",
    "total_marks": 100,
    "passing_marks": 60,
    "duration": 30
}
req = urllib.request.Request(create_quiz_url, method="POST")
req.add_header("Content-Type", "application/json")
new_quiz_id = None
try:
    with urllib.request.urlopen(req, data=json.dumps(quiz_payload).encode('utf-8')) as r:
        quiz_data = json.loads(r.read().decode('utf-8'))
        new_quiz_id = quiz_data.get('quiz_id') or quiz_data.get('id') or quiz_data.get('data', {}).get('quiz_id')
        print(f"Created New Quiz ID: {new_quiz_id}")
except Exception as e:
    print("Failed to create new quiz:", e)

# 4. Check enrollments again to see if the quiz ID updated to new_quiz_id
if new_quiz_id:
    try:
        with urllib.request.urlopen(my_courses_url) as r:
            data = json.loads(r.read().decode('utf-8'))
            rows = data.get('data') or data.get('enrollments') or []
            for row in rows:
                c_id = row.get('course_id') or (row.get('course') and row.get('course').get('id'))
                if c_id == course_id:
                    updated_quiz_id = row.get('quiz_id') or (row.get('quiz') and row.get('quiz').get('id'))
                    print(f"Updated Quiz ID in enrollment: {updated_quiz_id}")
                    if int(updated_quiz_id) == int(new_quiz_id):
                        print("SUCCESS: The enrollment API automatically updated to the new quiz ID!")
                    else:
                        print("FAIL: Quiz ID in enrollment did not update.")
    except Exception as e:
        print("Failed to fetch enrollments after quiz creation:", e)
