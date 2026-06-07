const BASE_URL = 'https://api.bsguplms.in';

async function test() {
  const userId = 29;

  try {
    // 1. Fetch all available courses
    console.log("Fetching courses from admin API...");
    const coursesRes = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
    const coursesData = await coursesRes.json();
    if (!coursesData.success || !coursesData.data || coursesData.data.length === 0) {
      console.log("No courses found in the database. Please create a course first.");
      return;
    }

    // Sort courses by ID descending so we test the newest ones first
    const courses = coursesData.data.sort((a, b) => b.id - a.id);
    console.log(`Found ${courses.length} courses. Finding a valid one recognized by the payment API...`);

    let success = false;
    for (const course of courses) {
      const payload = {
        payment_for: 'course',
        course_id: course.id,
        user_id: userId
      };

      console.log(`\nTesting Course ID ${course.id} ("${course.title}")...`);
      const res = await fetch(`${BASE_URL}/payment/createpaymentorder/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      let responseData = {};
      try {
        responseData = JSON.parse(text);
      } catch (e) {}

      console.log("Status:", res.status);
      console.log("Response:", text);

      // If the course is found (either order is created [200] or already enrolled [400]), it is valid
      if (res.status === 200 || (responseData.message && responseData.message.toLowerCase().includes('already enrolled'))) {
        console.log(`\n✅ Successfully found and verified a valid course ID: ${course.id}`);
        success = true;
        break;
      } else if (responseData.message && responseData.message.toLowerCase().includes('course not found')) {
        console.log(`❌ Course ID ${course.id} returned "Course not found" on the payment API. Trying next course...`);
      }
    }

    if (!success) {
      console.log("\n❌ None of the courses in the catalog were recognized by the payment API. Please ensure a course is correctly created in the Admin panel.");
    }

  } catch (err) {
    console.error("Error running test:", err);
  }
}

test();



