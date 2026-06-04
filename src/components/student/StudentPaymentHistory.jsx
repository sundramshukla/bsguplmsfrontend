import React, { useEffect, useState } from 'react';

const StudentPaymentHistory = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId') || 'guest';
    const key = `paymentHistory_${userId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    setPayments(history);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Payment History</h2>
        <p className="text-slate-500 mt-2">View your past transactions and download invoices.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Invoice ID</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Course</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-800">{payment.id}</td>
                  <td className="py-4 px-6 text-slate-600">{payment.date}</td>
                  <td className="py-4 px-6 text-slate-800 font-medium">{payment.course}</td>
                  <td className="py-4 px-6 font-bold text-slate-700">{payment.amount}</td>
                  <td className="py-4 px-6 text-slate-500">{payment.method}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500">
                    No payment history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentHistory;
