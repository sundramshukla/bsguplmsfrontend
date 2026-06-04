import React, { useEffect, useState } from 'react';
import { readPaymentResult, clearPaymentResult } from '../utils/paymentUtils';

const PaymentResult = () => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    setResult(readPaymentResult());
  }, []);

  const isSuccess = window.location.hash.includes('success');

  const handleGoToEnrolled = () => {
    clearPaymentResult();
    window.location.hash = '#student';
    window.dispatchEvent(new Event('hashchange'));
  };

  const handleRetry = () => {
    clearPaymentResult();
    window.location.hash = '#courses';
    window.dispatchEvent(new Event('hashchange'));
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-8 text-center">
        <div className="text-6xl mb-4">{isSuccess ? '✅' : '❌'}</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {isSuccess ? 'Payment Successful' : 'Payment Failed'}
        </h2>
        <p className="text-slate-600 mb-6">
          {result?.message ||
            (isSuccess
              ? 'Your course enrollment is complete. You can start learning now.'
              : 'Your payment could not be completed. Please try again.')}
        </p>

        {result?.courseTitle && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left text-sm">
            <p className="text-slate-500 font-semibold mb-1">Course</p>
            <p className="font-bold text-slate-800">{result.courseTitle}</p>
            {result.amount != null && (
              <>
                <p className="text-slate-500 font-semibold mt-3 mb-1">Amount</p>
                <p className="font-bold text-emerald-600">₹ {result.amount}</p>
              </>
            )}
            {result.orderId && (
              <>
                <p className="text-slate-500 font-semibold mt-3 mb-1">Order ID</p>
                <p className="font-mono text-xs text-slate-700 break-all">{result.orderId}</p>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isSuccess ? (
            <button
              onClick={handleGoToEnrolled}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Go to My Courses
            </button>
          ) : (
            <>
              <button
                onClick={handleRetry}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleGoToEnrolled}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Student Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
