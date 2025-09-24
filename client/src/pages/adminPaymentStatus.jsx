import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AdminPaymentStatus = () => {
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all payments
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Fetch bank deposits
      const bankResponse = await fetch('http://localhost:5001/api/payments');
      const bankData = await bankResponse.json();
      
      // Fetch online payments
      const onlineResponse = await fetch('http://localhost:5001/api/online-payments');
      const onlineData = await onlineResponse.json();
      
      // Combine and format all payments
      const bankPayments = (bankData || []).map(payment => ({
        id: payment._id,
        paymentId: `BNK_${payment._id.slice(-8).toUpperCase()}`,
        auctionId: payment.auctionId,
        paymentType: 'Bank Deposit',
        amount: payment.amount,
        date: payment.paiddate ? new Date(payment.paiddate).toLocaleDateString('en-LK') : new Date().toLocaleDateString('en-LK'),
        status: payment.status,
        bank: payment.bank,
        branch: payment.branch,
        slip: payment.slip,
        fullName: payment.fullName,
        emailAddress: payment.emailAddress,
        contactNumber: payment.contactNumber,
        billingAddress: payment.billingAddress,
        remark: payment.remark,
        transactionId: null,
        cardType: null
      }));

      const onlinePayments = (onlineData.data || []).map(payment => ({
        id: payment._id,
        paymentId: `ONL_${payment._id.slice(-8).toUpperCase()}`,
        auctionId: payment.auctionId,
        paymentType: 'Online Payment',
        amount: payment.amount,
        date: new Date(payment.createdAt).toLocaleDateString('en-LK'),
        status: 'completed', // Online payments are always completed
        bank: 'IPG',
        branch: 'IPG',
        slip: null,
        fullName: payment.fullName,
        emailAddress: payment.emailAddress,
        contactNumber: payment.contactNumber,
        billingAddress: payment.billingAddress,
        remark: payment.remark,
        transactionId: payment.transactionId,
        cardType: payment.cardType
      }));

      // Combine all payments and sort by date (newest first)
      const combinedPayments = [...bankPayments, ...onlinePayments].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setAllPayments(combinedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // Update bank deposit status
  const updateBankPaymentStatus = async (paymentId, status) => {
    try {
      const response = await fetch(`http://localhost:5001/api/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Payment status updated to ${status}`);
        fetchPayments(); // Refresh data
      } else {
        toast.error(result.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  // Format amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failure':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'Complete';
      case 'failure':
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'Poppins' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: 'Poppins' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Status Management</h1>
          <p className="text-gray-600">Manage and approve payment transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[20px] shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">🏦</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bank Deposits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allPayments.filter(p => p.paymentType === 'Bank Deposit').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[20px] shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">💳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Online Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allPayments.filter(p => p.paymentType === 'Online Payment').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[20px] shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allPayments.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[20px] shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allPayments.filter(p => p.status === 'success' || p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Combined Payment Table */}
        <div className="bg-white rounded-[20px] shadow-sm overflow-hidden">
          {allPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Payments Found</h3>
              <p className="text-gray-500">No payments have been submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Gem ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Seller ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Bidder ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Auction ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Payment Type</th>
                    <th className="px-6 py-4 text-left font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left font-semibold">Payment Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Bank Slip</th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {/* Placeholder - will be replaced by other developer */}
                          GEM-{payment.id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {/* Placeholder - will be replaced by other developer */}
                          SELLER-{payment.id.slice(-4).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {/* Placeholder - will be replaced by other developer */}
                          BIDDER-{payment.id.slice(-4).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {payment.auctionId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          payment.paymentType === 'Bank Deposit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {payment.paymentType === 'Bank Deposit' ? '🏦' : '💳'} {payment.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {formatAmount(payment.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4">
                        {payment.slip ? (
                          <button
                            onClick={() => window.open(`http://localhost:5001${payment.slip}`, '_blank')}
                            className="px-3 py-1 bg-blue-500 text-white rounded-[8px] hover:bg-blue-600 transition-colors text-sm font-medium"
                          >
                            📄 View Slip
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {payment.paymentType === 'Bank Deposit' && payment.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateBankPaymentStatus(payment.id, 'success')}
                              className="px-3 py-1 bg-green-500 text-white rounded-[8px] hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => updateBankPaymentStatus(payment.id, 'failure')}
                              className="px-3 py-1 bg-red-500 text-white rounded-[8px] hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No action needed</span>
                        )}
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
    </div>
  );
};

export default AdminPaymentStatus;
