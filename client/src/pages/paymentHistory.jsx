import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    method: "all", // all, online, bank
    status: "all", // all, complete, pending, failed
    dateRange: "all" // all, last30days, last3months, lastyear
  });

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      console.log("Fetching payment history...");
      
      // Fetch both online and bank payments
      const [onlineResponse, bankResponse] = await Promise.all([
        fetch('http://localhost:5001/api/online-payments'),
        fetch('http://localhost:5001/api/payments')
      ]);

      console.log("Online payments response status:", onlineResponse.status);
      console.log("Bank payments response status:", bankResponse.status);

      if (!onlineResponse.ok || !bankResponse.ok) {
        throw new Error(`API request failed: Online=${onlineResponse.status}, Bank=${bankResponse.status}`);
      }

      const [onlinePayments, bankPayments] = await Promise.all([
        onlineResponse.json(),
        bankResponse.json()
      ]);

      console.log("Online payments data:", onlinePayments);
      console.log("Bank payments data:", bankPayments);

      // Handle different response formats
      const onlineData = onlinePayments.data || onlinePayments || [];
      const bankData = bankPayments.data || bankPayments || [];

      console.log("Processed online data:", onlineData);
      console.log("Processed bank data:", bankData);

      // Combine and format the payments
      const combinedPayments = [
        ...onlineData.map(payment => ({
          id: payment._id,
          paymentId: `ONL_${payment._id.slice(-8).toUpperCase()}`,
          auctionId: payment.auctionId,
          paymentMethod: "Online Payment",
          methodIcon: "💳",
          amount: payment.amount,
          paymentDate: new Date(payment.createdAt).toLocaleDateString('en-CA'),
          remark: payment.remark || "Online payment",
          status: payment.status === 'verified' ? 'complete' : payment.status,
          fullName: payment.fullName,
          emailAddress: payment.emailAddress
        })),
        ...bankData.map(payment => ({
          id: payment._id,
          paymentId: `BNK_${payment._id.slice(-8).toUpperCase()}`,
          auctionId: payment.auctionId,
          paymentMethod: "Bank Deposit",
          methodIcon: "🏦",
          amount: payment.amount,
          paymentDate: new Date(payment.paiddate).toLocaleDateString('en-CA'),
          remark: payment.remark || "Bank deposit",
          status: payment.status || "pending", // Bank deposits start as pending, need admin approval
          fullName: payment.fullName,
          emailAddress: payment.emailAddress
        }))
      ];

      console.log("Combined payments:", combinedPayments);

      // Sort by date (newest first)
      combinedPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
      setPayments(combinedPayments);

      // If no data, show sample data for testing
      if (combinedPayments.length === 0) {
        console.log("No payments found, showing sample data");
        const samplePayments = [
          {
            id: "sample1",
            paymentId: "ONL_12345678",
            auctionId: "R2345",
            paymentMethod: "Online Payment",
            methodIcon: "💳",
            amount: 5200000,
            paymentDate: "2024-01-15",
            remark: "Ruby auction payment",
            status: "complete", // Online payments are complete immediately
            fullName: "John Doe",
            emailAddress: "john@example.com"
          },
          {
            id: "sample2",
            paymentId: "BNK_87654321",
            auctionId: "R2346",
            paymentMethod: "Bank Deposit",
            methodIcon: "🏦",
            amount: 3500000,
            paymentDate: "2024-01-14",
            remark: "Emerald bid payment",
            status: "pending", // Bank deposits start as pending, need admin approval
            fullName: "Jane Smith",
            emailAddress: "jane@example.com"
          },
          {
            id: "sample3",
            paymentId: "BNK_11111111",
            auctionId: "R2347",
            paymentMethod: "Bank Deposit",
            methodIcon: "🏦",
            amount: 2800000,
            paymentDate: "2024-01-13",
            remark: "Sapphire bid payment",
            status: "success", // Bank deposit approved by admin
            fullName: "Mike Johnson",
            emailAddress: "mike@example.com"
          },
          {
            id: "sample4",
            paymentId: "BNK_22222222",
            auctionId: "R2348",
            paymentMethod: "Bank Deposit",
            methodIcon: "🏦",
            amount: 1500000,
            paymentDate: "2024-01-12",
            remark: "Diamond bid payment",
            status: "failure", // Bank deposit rejected by admin
            fullName: "Sarah Wilson",
            emailAddress: "sarah@example.com"
          }
        ];
        setPayments(samplePayments);
        toast.info("Showing sample data - Backend not connected");
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error(`Failed to load payment history: ${error.message}`);
      
      // Show sample data on error
      const samplePayments = [
        {
          id: "sample1",
          paymentId: "ONL_12345678",
          auctionId: "R2345",
          paymentMethod: "Online Payment",
          methodIcon: "💳",
          amount: 5200000,
          paymentDate: "2024-01-15",
          remark: "Ruby auction payment",
          status: "complete", // Online payments are complete immediately
          fullName: "John Doe",
          emailAddress: "john@example.com"
        },
        {
          id: "sample2",
          paymentId: "BNK_87654321",
          auctionId: "R2346",
          paymentMethod: "Bank Deposit",
          methodIcon: "🏦",
          amount: 3500000,
          paymentDate: "2024-01-14",
          remark: "Emerald bid payment",
          status: "pending", // Bank deposits start as pending, need admin approval
          fullName: "Jane Smith",
          emailAddress: "jane@example.com"
        },
        {
          id: "sample3",
          paymentId: "BNK_11111111",
          auctionId: "R2347",
          paymentMethod: "Bank Deposit",
          methodIcon: "🏦",
          amount: 2800000,
          paymentDate: "2024-01-13",
          remark: "Sapphire bid payment",
          status: "success", // Bank deposit approved by admin
          fullName: "Mike Johnson",
          emailAddress: "mike@example.com"
        },
        {
          id: "sample4",
          paymentId: "BNK_22222222",
          auctionId: "R2348",
          paymentMethod: "Bank Deposit",
          methodIcon: "🏦",
          amount: 1500000,
          paymentDate: "2024-01-12",
          remark: "Diamond bid payment",
          status: "failure", // Bank deposit rejected by admin
          fullName: "Sarah Wilson",
          emailAddress: "sarah@example.com"
        }
      ];
      setPayments(samplePayments);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'text-green-600 bg-green-100';
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'failure':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'success':
        return 'Success';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'failure':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredPayments = payments.filter(payment => {
    if (filter.method !== 'all' && payment.paymentMethod.toLowerCase() !== filter.method) {
      return false;
    }
    if (filter.status !== 'all' && payment.status !== filter.status) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'Poppins' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" style={{ fontFamily: 'Poppins' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-[20px] p-6 mb-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment History</h1>
          <p className="text-gray-600">View all your transaction history and payment status</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[20px] p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={filter.method}
                onChange={(e) => setFilter({...filter, method: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] outline-none"
              >
                <option value="all">All Methods</option>
                <option value="online">Online Payment</option>
                <option value="bank">Bank Deposit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] outline-none"
              >
                <option value="all">All Status</option>
                <option value="complete">Complete</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="failure">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filter.dateRange}
                onChange={(e) => setFilter({...filter, dateRange: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] outline-none"
              >
                <option value="all">All Time</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last3months">Last 3 Months</option>
                <option value="lastyear">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Table */}
        <div className="bg-white rounded-[20px] shadow-sm overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Payments Found</h3>
              <p className="text-gray-500">You haven't made any payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Payment ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Auction ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Payment Method</th>
                    <th className="px-6 py-4 text-left font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left font-semibold">Payment Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Remark</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment, index) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-blue-600">
                          {payment.paymentId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {payment.auctionId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{payment.methodIcon}</span>
                          <span className="text-gray-700">{payment.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {formatAmount(payment.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {payment.paymentDate}
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                        {payment.remark}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default PaymentHistory;
