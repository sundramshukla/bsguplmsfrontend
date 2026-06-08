import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { getAdminUserId } from '../../utils/adminAnalyticsUtils';

const AdminPaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      setError('');
      try {
        const adminId = getAdminUserId();
        const res = await fetch(`${BASE_URL}/bsgupadmin/admindashboard/?user_id=${encodeURIComponent(adminId)}`);
        const data = await res.json();
        if (data.success && data.data && data.data.recent_payments) {
          setPayments(data.data.recent_payments);
        } else {
          setPayments([]);
        }
      } catch (err) {
        console.error('Failed to load payment history:', err);
        setError(err.message || 'Failed to load payments.');
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  const handlePrintInvoice = (payment) => {
    const newWindow = window.open('', '_blank', 'width=800,height=900');
    if (!newWindow) {
      alert('Please allow popups to view or download the receipt');
      return;
    }

    const transactionId = payment.transaction_id || 'N/A';
    const rawDate = payment.created_at || new Date().toISOString();
    const dateStr = new Date(rawDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const amountVal = parseFloat(payment.amount || '0').toFixed(2);
    const userEmail = payment.user || 'Student';
    const courseTitle = payment.course_name || (payment.payment_for === 'course' ? 'Course Enrollment' : 'General Payment');

    newWindow.document.write(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Receipt - ${transactionId}</title>
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
              border-bottom: 2px solid #7c3aed;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #7c3aed;
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
              border-top: 2px solid #7c3aed;
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
              <div class="invoice-title">PAYMENT RECEIPT</div>
            </div>
            
            <table class="details-table">
              <tr>
                <td>
                  <strong>Billed To:</strong><br>
                  ${userEmail}
                </td>
                <td style="text-align: right;">
                  <strong>Receipt ID:</strong> ${transactionId}<br>
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
              Thank you for your payment. This is a computer-generated receipt and does not require a signature.<br>
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

  const filteredPayments = payments.filter(payment => {
    const term = searchTerm.toLowerCase();
    return (
      (payment.user && payment.user.toLowerCase().includes(term)) ||
      (payment.transaction_id && payment.transaction_id.toLowerCase().includes(term)) ||
      (payment.amount && payment.amount.toString().includes(term))
    );
  });

  return (
    <div className="p-4 md:p-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 font-sans">Payment History</h2>
          <p className="text-slate-500 mt-2 font-sans">Track and manage student enrollment payments.</p>
        </div>
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <p className="text-xl text-slate-500 font-medium animate-pulse">Loading payments...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-6 text-center font-semibold">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-sm">
                <tr>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredPayments.map((payment, index) => (
                  <tr key={payment.transaction_id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{payment.user}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                      {payment.transaction_id}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600">
                      ₹ {parseFloat(payment.amount || '0').toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handlePrintInvoice(payment)}
                        className="bg-violet-100 hover:bg-violet-600 text-violet-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <span>📄</span> View / Print Receipt
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-slate-500">
                      No payments found.
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

export default AdminPaymentHistory;
