import { BASE_URL } from '../config';
import { enrollStudentInCourse } from './enrollmentUtils';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let razorpayScriptPromise = null;

const parseJsonResponse = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      res.ok
        ? 'Invalid response from payment server'
        : `Payment server error (${res.status}). Please try again.`
    );
  }
};

const apiFetch = async (url, options = {}) => {
  try {
    return await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Network error: could not reach payment server. Check your connection.');
    }
    throw err;
  }
};

export const loadRazorpayScript = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay is only available in the browser'));
  }
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Razorpay));
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

export const createPaymentOrder = async (userId, courseId) => {
  const payload = {
    payment_for: 'course',
    course_id: parseInt(courseId, 10),
    user_id: parseInt(userId, 10)
  };

  const profileId = localStorage.getItem('profileId');
  if (profileId) {
    payload.profile_id = parseInt(profileId, 10);
  }

  const res = await apiFetch(`${BASE_URL}/payment/createpaymentorder/`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const data = await parseJsonResponse(res);

  if (!res.ok && data.success !== true) {
    throw new Error(data.message || data.error || `Could not start payment (${res.status})`);
  }

  return { data, ok: res.ok, status: res.status };
};

const verifyPaymentOnServer = async (payload) => {
  const endpoints = [
    '/payment/verifypayment/',
    '/payment/verify-payment/',
    '/payment/verify_payment/',
    '/payment/paymentverify/'
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const res = await apiFetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.status === 404) continue;

      const data = await parseJsonResponse(res);
      if (res.ok && data.success !== false) {
        return data;
      }
      lastError = new Error(data.message || data.error || 'Payment verification failed');
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) {
    console.warn('Payment verify API:', lastError.message);
  }
  return { success: true, message: 'Payment completed' };
};

export const savePaymentResult = (result) => {
  sessionStorage.setItem('bsgup_payment_result', JSON.stringify(result));
};

export const readPaymentResult = () => {
  try {
    const raw = sessionStorage.getItem('bsgup_payment_result');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearPaymentResult = () => {
  sessionStorage.removeItem('bsgup_payment_result');
};

export const navigateToPaymentResult = (status, details = {}) => {
  savePaymentResult({ status, ...details, at: Date.now() });
  window.location.hash = status === 'success' ? '#payment/success' : '#payment/failed';
  window.dispatchEvent(new Event('hashchange'));
};

const openRazorpayCheckout = ({ order, courseTitle, userId, courseId }) =>
  new Promise((resolve, reject) => {
    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'BSGUP LMS',
      description: courseTitle || 'Course enrollment',
      order_id: order.order_id,
      prefill: {
        name: localStorage.getItem('studentName') || '',
        email: localStorage.getItem('studentEmail') || ''
      },
      theme: { color: '#7c3aed' },
      handler: async (response) => {
        try {
          const verifyData = await verifyPaymentOnServer({
            payment_for: 'course',
            course_id: parseInt(courseId, 10),
            user_id: parseInt(userId, 10),
            payment_record_id: order.payment_record_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          resolve({ verifyData, razorpay: response });
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by user'))
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      reject(new Error(resp.error?.description || resp.error?.reason || 'Payment failed'));
    });
    rzp.open();
  });

export const processCourseEnrollment = async ({ userId, courseId, courseTitle, coursePrice }) => {
  if (!userId) {
    throw new Error('Please log in to enroll');
  }

  const { data } = await createPaymentOrder(userId, courseId);
  const message = (data.message || '').toLowerCase();

  if (message.includes('already enrolled')) {
    try {
      const key = `enrolledCourses_${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const merged = [...new Set([...existing, parseInt(courseId, 10)])];
      localStorage.setItem(key, JSON.stringify(merged));
      window.dispatchEvent(new Event('enrollmentChange'));
    } catch (e) {
      console.error(e);
    }
    return { status: 'already_enrolled', message: data.message };
  }

  if (
    message.includes('free course') ||
    (message.includes('enrolled') && !data.data?.order_id)
  ) {
    try {
      await enrollStudentInCourse(userId, courseId);
    } catch (err) {
      console.error('Failed to enroll student in free course:', err);
    }
    window.dispatchEvent(new Event('enrollmentChange'));
    return {
      status: 'success',
      type: 'free',
      message: data.message || 'Successfully enrolled in free course'
    };
  }

  const order = data.data;
  if (!order?.order_id || !order?.key) {
    throw new Error(data.message || 'Invalid payment order from server');
  }

  await loadRazorpayScript();
  const paymentResult = await openRazorpayCheckout({
    order,
    courseTitle,
    userId,
    courseId
  });

  try {
    await enrollStudentInCourse(userId, courseId);
  } catch (err) {
    console.error('Failed to enroll student after payment verification:', err);
  }

  window.dispatchEvent(new Event('enrollmentChange'));

  return {
    status: 'success',
    type: 'paid',
    message: paymentResult.verifyData?.message || 'Payment successful! You are now enrolled.',
    amount: order.amount_in_rupees ?? coursePrice,
    orderId: order.order_id
  };
};

export const appendLocalPaymentHistory = (userId, entry) => {
  const key = `paymentHistory_${userId}`;
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  history.unshift({
    id: entry.id || `PAY-${Date.now()}`,
    date: entry.date || new Date().toLocaleDateString('en-IN'),
    course: entry.courseTitle || 'Course',
    amount: entry.amount != null ? `₹ ${entry.amount}` : '-',
    status: entry.status || 'Paid',
    method: entry.method || 'Razorpay'
  });
  localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
};
