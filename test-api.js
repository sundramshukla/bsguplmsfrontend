const fetch = require('node-fetch');
const BASE_URL = 'https://api.bsguplms.in';

async function test() {
  const coursesRes = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
  const coursesData = await coursesRes.json();
  const test5 = coursesData.data.find(c => c.title.toLowerCase().includes('test5') || c.title.toLowerCase().includes('test 5'));
  if (!test5) {
    console.log("Course test5 not found");
    return;
  }
  console.log("Course test5:", test5);

  const res = await fetch(`${BASE_URL}/bsgupadmin/get-quiz/?course_id=${test5.id}`);
  const data = await res.json();
  console.log("Quiz response:", JSON.stringify(data, null, 2));
}

test();
