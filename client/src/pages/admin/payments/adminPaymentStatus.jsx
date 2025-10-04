import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';

const AdminPaymentStatus = () => {
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
        date: payment.paiddate ? new Date(payment.paiddate).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
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
        cardType: null,
        createdAt: new Date(payment.createdAt || payment.paiddate),
        // Add deleted fields for admin view
        deleted: payment.deleted || false,
        deleteReason: payment.deleteReason,
        deletedBy: payment.deletedBy,
        deletedAt: payment.deletedAt,
        // Bank deposits are always regular payments (not registration)
        isRegistration: false
      }));

      console.log('Raw online payments from API:', onlineData.data);
      console.log('Sample payment structure:', onlineData.data?.[0]);
      
      const onlinePayments = (onlineData.data || []).map(payment => {
        const isRegistration = payment.paymentType === 'registration';
        console.log(`Payment ${payment._id}: paymentType=${payment.paymentType}, isRegistration=${isRegistration}, amount=${payment.amount}, remark=${payment.remark}`);
        
        // Additional check: if it's a registration payment by amount and remark
        const isRegistrationByContent = payment.amount === 1000 && 
          (payment.remark?.toLowerCase().includes('registration') || 
           payment.remark?.toLowerCase().includes('seller') ||
           payment.bidId === 'REGISTRATION');
        
        const finalIsRegistration = isRegistration || isRegistrationByContent;
        console.log(`Payment ${payment._id}: isRegistrationByContent=${isRegistrationByContent}, finalIsRegistration=${finalIsRegistration}`);
        
        return {
          id: payment._id,
          paymentId: `ONL_${payment._id.slice(-8).toUpperCase()}`,
          auctionId: finalIsRegistration ? 'N/A' : payment.bidId,
          paymentType: finalIsRegistration ? 'Registration Payment' : 'Online Payment',
          amount: payment.amount,
          date: new Date(payment.createdAt).toLocaleDateString('en-CA'),
          status: 'complete', // Online payments are always completed
          bank: 'IPG',
          branch: 'IPG',
          slip: null,
          fullName: payment.fullName,
          emailAddress: payment.emailAddress,
          contactNumber: payment.contactNumber,
          billingAddress: payment.billingAddress,
          remark: payment.remark,
          transactionId: payment.transactionId,
          cardType: payment.cardType,
          createdAt: new Date(payment.createdAt),
          // Add registration-specific fields
          isRegistration: finalIsRegistration
        };
      });

      // Combine all payments and sort by date (newest first)
      const combinedPayments = [...bankPayments, ...onlinePayments].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setAllPayments(combinedPayments);

      // If no data, show sample data for testing
      if (combinedPayments.length === 0) {
        const samplePayments = [
          {
            id: "sample1",
            paymentId: "BNK_87654321",
            auctionId: "R2346",
            amount: 3500000,
            bank: "Commercial Bank",
            branch: "Colombo 07",
            date: "2024-01-14",
            status: "pending",
            remark: "Emerald bid payment",
            paymentType: "Bank Deposit",
            fullName: "John Smith",
            contactNumber: "+94 77 123 4567",
            billingAddress: "123 Main Street, Colombo 03",
            emailAddress: "john.smith@email.com",
            slip: "/uploads/sample-slip.jpg"
          },
          {
            id: "sample2",
            paymentId: "BNK_11111111",
            auctionId: "R2347",
            amount: 2800000,
            bank: "Sampath Bank",
            branch: "Kandy",
            date: "2024-01-13",
            status: "success",
            remark: "Sapphire bid payment",
            paymentType: "Bank Deposit",
            fullName: "Sarah Johnson",
            contactNumber: "+94 77 987 6543",
            billingAddress: "456 Oak Avenue, Kandy",
            emailAddress: "sarah.johnson@email.com"
          },
          {
            id: "sample3",
            paymentId: "ONL_12345678",
            transactionId: "TXN1704123456789ABC123",
            auctionId: "R2345",
            amount: 5200000,
            bank: "IPG",
            branch: "IPG",
            date: "2024-01-15",
            status: "complete",
            remark: "Ruby auction payment",
            paymentType: "Online Payment",
            cardType: "visa",
            fullName: "Michael Brown",
            contactNumber: "+94 77 555 1234",
            billingAddress: "789 Pine Road, Galle",
            emailAddress: "michael.brown@email.com"
          }
        ];

        setAllPayments(samplePayments);
        toast.info("Showing sample data - Backend not connected");
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
      
      // Show sample data on error
      const samplePayments = [
        {
          id: "sample1",
          paymentId: "BNK_87654321",
          auctionId: "R2346",
          amount: 3500000,
          bank: "Commercial Bank",
          branch: "Colombo 07",
          date: "2024-01-14",
          status: "pending",
          remark: "Emerald bid payment",
          paymentType: "Bank Deposit",
          fullName: "John Smith",
          contactNumber: "+94 77 123 4567",
          billingAddress: "123 Main Street, Colombo 03",
          emailAddress: "john.smith@email.com"
        }
      ];

      setAllPayments(samplePayments);
    } finally {
      setLoading(false);
    }
  };

  // Update bank deposit status
  const updateBankPaymentStatus = async (paymentId, status) => {
    try {
      console.log('Updating payment status:', { paymentId, status });
      console.log('API URL:', `http://localhost:5001/api/payments/${paymentId}/status`);
      
      const response = await fetch(`http://localhost:5001/api/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        toast.error(`Server error: ${response.status} - ${errorText}`);
        return;
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        toast.success(`Payment status updated to ${status}`);
        fetchPayments(); // Refresh data
      } else {
        toast.error(result.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(`Network error: ${error.message}`);
    }
  };


  // Delete admin payment with toast confirmation
  const deleteAdminPayment = async (paymentId, paymentNumber, paymentType) => {
    // Show confirmation toast
    const toastId = toast(
      (t) => (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Confirm Delete</span>
          </div>
          <p className="text-sm text-gray-600">
            Are you sure you want to permanently delete payment {paymentNumber}? This action cannot be undone.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                toast.dismiss(toastId);
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(toastId);
                await executeDelete(paymentId, paymentNumber, paymentType);
              }}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keep toast open until user clicks
        style: {
          background: '#fff',
          color: '#000',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '400px',
        },
      }
    );
  };

  // Execute the actual delete
  const executeDelete = async (paymentId, paymentNumber, paymentType) => {
    try {
      // Choose the correct API endpoint based on payment type
      const apiUrl = paymentType === 'Online Payment' 
        ? `http://localhost:5001/api/online-payments/${paymentId}`
        : `http://localhost:5001/api/payments/${paymentId}`;
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(`Payment ${paymentNumber} permanently deleted from database`);
        fetchPayments(); // Refresh data
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        toast.error(errorData.message || 'Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Network error: Failed to delete payment');
    }
  };

  // View bank slip in modal
  const viewBankSlip = (slipUrl, paymentId) => {
    setSelectedSlip({
      url: `http://localhost:5001${slipUrl}`,
      paymentId: paymentId
    });
    setShowSlipModal(true);
  };

  // Close bank slip modal
  const closeSlipModal = () => {
    setShowSlipModal(false);
    setSelectedSlip(null);
  };

  // Format amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'text-blue-700';
      case 'success':
        return 'text-blue-700';
      case 'pending':
        return 'text-yellow-700';
      case 'failed':
        return 'text-red-700';
      case 'failure':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'success':
        return 'Complete';
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

  // Filter payments based on filters
  const filteredPayments = allPayments.filter(payment => {
    // Date filter
    const matchesDate = dateFilter === '' || payment.date === dateFilter;
    
    // Payment type filter
    const matchesPaymentType = paymentTypeFilter === '' || 
      (paymentTypeFilter === 'bank' && payment.paymentType === 'Bank Deposit') ||
      (paymentTypeFilter === 'online' && (payment.paymentType === 'Online Payment' || payment.paymentType === 'Registration Payment')) ||
      (paymentTypeFilter === 'regular' && payment.paymentType === 'Online Payment' && !payment.isRegistration) ||
      (paymentTypeFilter === 'penalty' && (payment.paymentType === 'penalty' || payment.remark?.toLowerCase().includes('penalty'))) ||
      (paymentTypeFilter === 'registration' && payment.isRegistration);
    
    // Bank filter
    const matchesBank = bankFilter === '' || payment.bank === bankFilter;
    
    // Status filter
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'Approved' && payment.status === 'success') ||
      (statusFilter === 'Rejected' && payment.status === 'failure') ||
      (statusFilter === 'Completed' && (payment.status === 'success' || payment.status === 'complete')) ||
      (statusFilter === 'Pending' && payment.status === 'pending');
    
    if (paymentTypeFilter === 'registration') {
      console.log(`Payment ${payment.id}: isRegistration=${payment.isRegistration}, paymentType=${payment.paymentType}, matchesRegistration=${payment.isRegistration}`);
    }
    
    return matchesDate && matchesPaymentType && matchesBank && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ fontFamily: 'Poppins' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6" style={{ fontFamily: 'Poppins' }}>
      <div className="max-w-7xl mx-auto">

        {/* Filter Section */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Payment Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Types</option>
                <option value="bank">Bank Deposits</option>
                <option value="online">Online Payments</option>
              </select>
            </div>

            {/* Bank Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
              <select
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Banks</option>
                <option value="Sampath Bank">Sampath Bank</option>
                <option value="Commercial Bank">Commercial Bank</option>
                <option value="Hatton National Bank">Hatton National Bank</option>
                <option value="Bank of Ceylon">Bank of Ceylon</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setDateFilter('');
                setPaymentTypeFilter('');
                setBankFilter('');
                setStatusFilter('');
              }}
              style={{ backgroundColor: '#4ECDC4' }} className="px-4 py-2 text-black rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => setPaymentTypeFilter('')}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              paymentTypeFilter === '' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPaymentTypeFilter('regular')}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              paymentTypeFilter === 'regular' 
                ? 'bg-green-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Regular
          </button>
          <button
            onClick={() => setPaymentTypeFilter('penalty')}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              paymentTypeFilter === 'penalty' 
                ? 'bg-red-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Penalty
          </button>
          <button
            onClick={() => setPaymentTypeFilter('registration')}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              paymentTypeFilter === 'registration' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Registration
          </button>
        </div>

        {/* Payment Management Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div style={{ backgroundColor: '#21374B' }} className="text-white px-8 py-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Transaction History</h2>
              </div>
              <button
                onClick={fetchPayments}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                style={{ borderRadius: '30px' }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 opacity-30">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                {searchTerm ? 'No Matching Payments Found' : 'No Payments Found'}
              </h3>
              <p className="text-gray-500 text-lg">
                {searchTerm 
                  ? `No payments match your search "${searchTerm}". Try a different search term.`
                  : "No payments have been submitted yet."
                }
              </p>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead className="bg-gray-200 border-b border-gray-300">
                  <tr>
                    <th className="w-[11%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Payment Type</th>
                    <th className="w-[12%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Payment Number</th>
                    <th className="w-[10%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">BID ID</th>
                    <th className="w-[12%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Amount</th>
                    <th className="w-[11%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Bank</th>
                    <th className="w-[11%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Branch</th>
                    <th className="w-[11%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Payment Date</th>
                    <th className="w-[10%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Bank Slip</th>
                    <th className="w-[12%] px-4 py-6 text-center text-base font-bold text-gray-900 whitespace-nowrap">Actions</th>
                    <th className="w-[6%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment, index) => (
                    <tr key={payment.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="w-[11%] px-4 py-5">
                        <span className={`text-sm font-bold ${
                          payment.paymentType === 'Registration Payment' 
                            ? 'text-purple-700' 
                            : payment.paymentType === 'Bank Deposit' 
                            ? 'text-blue-700' 
                            : 'text-green-700'
                        }`}>
                          {payment.paymentType}
                        </span>
                      </td>
                      <td className="w-[12%] px-4 py-5">
                        <span className="font-mono text-xs font-bold truncate block text-gray-800">
                          {payment.paymentId}
                        </span>
                      </td>
                      <td className="w-[10%] px-4 py-5">
                        <span className={`text-sm font-medium ${
                          payment.isRegistration 
                            ? 'text-purple-600 font-bold' 
                            : 'text-gray-800'
                        }`}>
                          {payment.isRegistration ? 'N/A' : payment.auctionId}
                        </span>
                      </td>
                      <td className="w-[12%] px-4 py-5">
                        <span className="font-bold text-gray-800 text-sm">
                          {formatAmount(payment.amount)}
                        </span>
                      </td>
                      <td className="w-[11%] px-4 py-5 text-gray-700 font-medium text-sm truncate">
                        {payment.bank}
                      </td>
                      <td className="w-[11%] px-4 py-5 text-gray-700 font-medium text-sm truncate">
                        {payment.branch || 'Not Available'}
                      </td>
                      <td className="w-[11%] px-4 py-5 text-gray-700 font-medium text-sm">
                        {payment.date}
                      </td>
                      <td className="w-[10%] px-4 py-5">
                        {payment.slip ? (
                          <button
                            onClick={() => viewBankSlip(payment.slip, payment.paymentId)}
                            className="inline-flex items-center px-3 py-1.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                            style={{ backgroundColor: '#6B7280', borderRadius: '30px' }}
                          >
                            📄 View
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="w-[12%] px-4 py-5">
                        {payment.deleted ? (
                          <span 
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                            style={{ 
                              backgroundColor: '#6B7280',
                              borderRadius: '30px'
                            }}
                          >
                            {payment.deletedBy === 'admin' ? 'Deleted by admin' : 'Deleted by user'}
                          </span>
                        ) : payment.paymentType === 'Bank Deposit' && payment.status === 'pending' ? (
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => updateBankPaymentStatus(payment.id, 'success')}
                              className="flex items-center justify-center px-3 py-1.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                              style={{ backgroundColor: '#4ECDC4', borderRadius: '30px' }}
                            >
                              <span className="text-center">
                                ✅<br />Approve
                              </span>
                            </button>
                            <button
                              onClick={() => updateBankPaymentStatus(payment.id, 'failure')}
                              className="flex items-center justify-center px-3 py-1.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                              style={{ backgroundColor: '#FF6B6B', borderRadius: '30px' }}
                            >
                              <span className="text-center">
                                ❌<br />Reject
                              </span>
                            </button>
                          </div>
                        ) : (
                          <span 
                            className="text-xs font-semibold"
                            style={{ 
                              color: payment.deleted ? '#6B7280' : (payment.status === 'complete' || payment.status === 'success' ? '#4ECDC4': '#FF6B6B')
                            }}
                          >
                            {payment.deleted ? 'Deleted by user' : (payment.status === 'success' ? 'Approved' : payment.status === 'failure' ? 'Rejected' : getStatusText(payment.status))}
                          </span>
                        )}
                      </td>
                      <td className="w-[6%] px-4 py-5">
                        <button
                          onClick={() => deleteAdminPayment(payment.id, payment.paymentId, payment.paymentType)}
                          className="flex items-center justify-center px-2 py-1.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 w-10"
                          style={{ backgroundColor: '#FF6B6B', borderRadius: '30px' }}
                          title="Delete payment"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bank Slip Modal */}
      {showSlipModal && selectedSlip && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden relative border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{ backgroundColor: '#2C3E50' }}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Bank Slip Document
                  </h3>
                  <p className="text-blue-200 text-sm">
                    Payment ID: {selectedSlip.paymentId}
                  </p>
                </div>
              </div>
              <button
                onClick={closeSlipModal}
                className="text-white hover:text-gray-300 transition-colors duration-200 p-3 hover:bg-white hover:bg-opacity-20 rounded-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 max-h-[85vh] overflow-auto bg-gray-50">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex justify-center">
                  <img
                    src={selectedSlip.url}
                    alt="Bank Slip"
                    className="max-w-full h-auto rounded-xl shadow-lg border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div 
                    className="hidden text-center p-12 text-gray-500"
                    style={{ display: 'none' }}
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">Unable to load bank slip</h4>
                    <p className="text-gray-500 mb-6">The image may be corrupted or the file path is incorrect</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      

      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Poppins',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </div>
  );
};

export default AdminPaymentStatus;