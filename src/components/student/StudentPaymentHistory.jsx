import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../config';

const StudentPaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError('');
      try {
        const userId = localStorage.getItem('userId') || 'guest';
        const studentEmail = localStorage.getItem('studentEmail') || '';
        const studentName = localStorage.getItem('studentName') || '';

        // 1. Load local payments
        const key = `paymentHistory_${userId}`;
        const localHistory = JSON.parse(localStorage.getItem(key) || '[]');

        // 2. Fetch backend payments
        let backendPayments = [];
        try {
          const res = await fetch(`${BASE_URL}/bsgupadmin/admindashboard/?user_id=1`);
          const data = await res.json();
          if (data.success && data.data && data.data.recent_payments) {
            // Filter by student email or name
            backendPayments = data.data.recent_payments.filter(p =>
              (studentEmail && p.user && p.user.toLowerCase() === studentEmail.toLowerCase()) ||
              (studentName && p.user && p.user.toLowerCase() === studentName.toLowerCase())
            );
          }
        } catch (err) {
          console.warn('Backend payment history fetch failed, using local storage:', err);
        }

        // 3. Normalize and merge unique payments
        const merged = [];

        // Add local ones first
        localHistory.forEach(p => {
          const cleanAmount = p.amount ? p.amount.replace(/[₹\s,]/g, '') : '0';
          merged.push({
            id: p.id,
            date: p.date,
            course: p.course,
            amount: cleanAmount,
            method: p.method || 'Razorpay',
            status: p.status || 'Paid',
            user: studentEmail || studentName || 'Student',
            created_at: p.date
          });
        });

        // Add backend ones if not duplicate
        backendPayments.forEach(p => {
          if (!merged.some(item => item.id === p.transaction_id)) {
            const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : 'Recent';
            merged.push({
              id: p.transaction_id,
              date: dateStr,
              course: p.course_name || (p.payment_for === 'course' ? 'Course Enrollment' : 'General Payment'),
              amount: p.amount,
              method: 'Razorpay',
              status: 'Paid',
              user: p.user,
              created_at: p.created_at
            });
          }
        });

        setPayments(merged);
      } catch (err) {
        console.error(err);
        setError('Could not retrieve payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handlePrintInvoice = (payment) => {
    const newWindow = window.open('', '_blank', 'width=800,height=900');
    if (!newWindow) {
      alert('Please allow popups to view or download the invoice');
      return;
    }

    const transactionId = payment.id || 'N/A';
    const dateStr = payment.date || 'Recent';
    const amountVal = parseFloat(payment.amount || '0').toFixed(2);
    const userEmail = payment.user || 'Student';
    const courseTitle = payment.course || 'Online Course Enrollment';

    newWindow.document.write(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Invoice - ${transactionId}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #333;
              margin: 0;
              padding: 40px;
              background-color: #fff;
            }
            .invoice-box {
              max-width: 800px;
              margin: auto;
              border: 1px solid #eee;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
              padding: 30px;
              border-radius: 10px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #10b981;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #10b981;
            }
            .invoice-title {
              font-size: 28px;
              font-weight: 300;
              text-align: right;
              color: #555;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            .details-table td {
              padding: 8px 0;
              vertical-align: top;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            .items-table th {
              background-color: #f8fafc;
              border-bottom: 2px solid #e2e8f0;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              color: #475569;
            }
            .items-table td {
              border-bottom: 1px solid #e2e8f0;
              padding: 12px;
              color: #334155;
            }
            .total-row td {
              font-weight: bold;
              font-size: 18px;
              border-top: 2px solid #10b981;
              padding-top: 15px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #94a3b8;
              font-size: 12px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="logo">⚜️ THE BHARAT SCOUTS & GUIDES (UP)</div>
              <div class="invoice-title">TAX INVOICE</div>
            </div>
            
            <table class="details-table">
              <tr>
                <td>
                  <strong>Billed To:</strong><br>
                  ${userEmail}
                </td>
                <td style="text-align: right;">
                  <strong>Invoice ID:</strong> ${transactionId}<br>
                  <strong>Date:</strong> ${dateStr}<br>
                  <strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">PAID</span>
                </td>
              </tr>
            </table>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Course Access: <strong>${courseTitle}</strong></td>
                  <td style="text-align: right;">₹ ${amountVal}</td>
                </tr>
                <tr class="total-row">
                  <td>Total Paid</td>
                  <td style="text-align: right;">₹ ${amountVal}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              Thank you for your payment. This is a computer-generated tax invoice and does not require a signature.<br>
              © The Bharat Scouts & Guides, Uttar Pradesh. All Rights Reserved.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  return (
    <div className="p-6 text-left">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Payment History & Invoices</h2>
        <p className="text-slate-500 mt-2">View your past transactions and download official tax invoices.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <p className="text-xl text-slate-500 font-medium animate-pulse">Loading transaction records...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-6 text-center font-semibold">
          {error}
        </div>
      ) : (
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
                  <th className="py-4 px-6">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {payments.map((payment, index) => (
                  <tr key={payment.id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-800">{payment.id}</td>
                    <td className="py-4 px-6 text-slate-600">{payment.date}</td>
                    <td className="py-4 px-6 text-slate-800 font-medium">{payment.course}</td>
                    <td className="py-4 px-6 font-bold text-slate-700">₹ {parseFloat(payment.amount || '0').toFixed(2)}</td>
                    <td className="py-4 px-6 text-slate-500">{payment.method}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handlePrintInvoice(payment)}
                        className="bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                      >
                        <span>⬇️</span> Invoice
                      </button>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-slate-500">
                      No payment history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPaymentHistory;
