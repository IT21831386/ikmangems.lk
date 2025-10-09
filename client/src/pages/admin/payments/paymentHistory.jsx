import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from 'jspdf';

const PaymentHistory = () => {
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

      const [onlineData, bankData] = await Promise.all([
        onlineResponse.json(),
        bankResponse.json()
      ]);

      console.log("Online payments data:", onlineData);
      console.log("Bank payments data:", bankData);

      // Handle different response formats
      const onlinePaymentsData = onlineData.data || onlineData || [];
      const bankPaymentsData = bankData.data || bankData || [];

      console.log("Processed online data:", onlinePaymentsData);
      console.log("Processed bank data:", bankPaymentsData);
      console.log("Bank payments with deleted field:", bankPaymentsData.map(p => ({ id: p._id, deleted: p.deleted, status: p.status })));

      // Format bank payments
      const formattedBankPayments = bankPaymentsData.map(payment => {
        console.log('Bank payment data:', {
          id: payment._id,
          auctionId: payment.auctionId,
          remark: payment.remark,
          amount: payment.amount
        });
        
        return {
          id: payment._id,
          paymentId: `BNK_${payment._id.slice(-8).toUpperCase()}`,
          auctionId: payment.auctionId,
          amount: payment.amount,
        bank: payment.bank,
        branch: payment.branch,
        date: new Date(payment.paiddate).toLocaleDateString('en-CA'),
        status: payment.status || "pending",
        slip: payment.slip,
          remark: payment.remark || "Bank deposit",
        paymentType: "Bank Deposit",
        // Bidder details
          fullName: payment.fullName,
        contactNumber: payment.contactNumber,
        billingAddress: payment.billingAddress,
        emailAddress: payment.emailAddress,
        createdAt: new Date(payment.createdAt),
        // Add deleted fields for filtering
        deleted: payment.deleted || false,
        deleteReason: payment.deleteReason,
        deletedBy: payment.deletedBy,
        deletedAt: payment.deletedAt
      };
      });

      // Format online payments
      const formattedOnlinePayments = onlinePaymentsData.map(payment => {
        console.log('Online payment data:', {
          id: payment._id,
          bidId: payment.bidId,
          remark: payment.remark,
          amount: payment.amount
        });
        
        return {
          id: payment._id,
          paymentId: `ONL_${payment._id.slice(-8).toUpperCase()}`,
          transactionId: payment.transactionId || `TXN_${payment._id.slice(-8).toUpperCase()}`,
          auctionId: payment.bidId, // Online payments use bidId field
          amount: payment.amount,
          bank: "IPG",
          branch: "IPG",
          date: new Date(payment.createdAt).toLocaleDateString('en-CA'),
          status: 'complete',
          remark: payment.remark || "Online payment",
          paymentType: "Online Payment",
          cardNumber: payment.cardNumber,
          cardType: payment.cardType,
          // Bidder details
          fullName: payment.fullName,
          contactNumber: payment.contactNumber,
          billingAddress: payment.billingAddress,
          emailAddress: payment.emailAddress,
          createdAt: new Date(payment.createdAt),
          // Add deleted fields for filtering
          deleted: payment.deleted || false,
          deleteReason: payment.deleteReason,
          deletedBy: payment.deletedBy,
          deletedAt: payment.deletedAt
        };
      });

      // Combine both payment types
      const combinedPayments = [...formattedBankPayments, ...formattedOnlinePayments];
      
      // Sort by creation date (newest first)
      combinedPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Filter out deleted payments for user view
      console.log('All payments before filtering:', combinedPayments.map(p => ({ id: p.id, deleted: p.deleted, status: p.status })));
      const nonDeletedPayments = combinedPayments.filter(payment => !payment.deleted);
      console.log('Non-deleted payments after filtering:', nonDeletedPayments.map(p => ({ id: p.id, deleted: p.deleted, status: p.status })));
      
      // Filter out registration payments (seller registration fees from verification center)
      const nonRegistrationPayments = nonDeletedPayments.filter(payment => {
        const isRegistration = payment.paymentType === 'registration' || 
          (payment.amount === 1000 && 
           (payment.remark?.toLowerCase().includes('registration') || 
            payment.remark?.toLowerCase().includes('seller') ||
            payment.auctionId === 'REGISTRATION'));
        
        console.log(`Payment ${payment.id}: isRegistration=${isRegistration}, amount=${payment.amount}, remark=${payment.remark}`);
        return !isRegistration;
      });
      
      console.log('Non-registration payments after filtering:', nonRegistrationPayments.length);
      setAllPayments(nonRegistrationPayments);

      // If no data, show sample data for testing
      if (combinedPayments.length === 0) {
        console.log("No payments found, showing sample data");
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
          },
          {
            id: "sample4",
            paymentId: "ONL_87654321",
            transactionId: "TXN1704123456789DEF456",
            auctionId: "R2349",
            amount: 1800000,
            bank: "IPG",
            branch: "IPG",
            date: "2024-01-11",
            status: "complete",
            remark: "Topaz bid payment",
            paymentType: "Online Payment",
            cardType: "mastercard",
            fullName: "Emily Davis",
            contactNumber: "+94 77 444 5678",
            billingAddress: "321 Elm Street, Negombo",
            emailAddress: "emily.davis@email.com"
          }
        ];

        setAllPayments(samplePayments);
        toast.info("Showing sample data - Backend not connected");
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error(`Failed to load payment history: ${error.message}`);
      
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
          paymentType: "Bank Deposit"
        },
        {
          id: "sample2",
          paymentId: "ONL_12345678",
          transactionId: "TXN1704123456789ABC123",
          auctionId: "R2345",
          amount: 5200000,
          bank: "IPG",
          branch: "IPG",
          date: "2024-01-15",
          status: "complete",
          remark: "Ruby auction payment",
          paymentType: "Online Payment"
        }
      ];

      setAllPayments(samplePayments);
    } finally {
      setLoading(false);
    }
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

  // Filter payments based on search term
  const filteredPayments = allPayments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.paymentId?.toLowerCase().includes(searchLower) ||
      payment.auctionId?.toLowerCase().includes(searchLower) ||
      payment.amount?.toString().includes(searchLower) ||
      payment.paymentType?.toLowerCase().includes(searchLower) ||
      payment.status?.toLowerCase().includes(searchLower) ||
      payment.fullName?.toLowerCase().includes(searchLower) ||
      payment.emailAddress?.toLowerCase().includes(searchLower) ||
      payment.contactNumber?.includes(searchLower) ||
      payment.billingAddress?.toLowerCase().includes(searchLower) ||
      payment.bank?.toLowerCase().includes(searchLower) ||
      payment.branch?.toLowerCase().includes(searchLower) ||
      payment.remark?.toLowerCase().includes(searchLower) ||
      payment.transactionId?.toLowerCase().includes(searchLower) ||
      payment.cardType?.toLowerCase().includes(searchLower)
    );
  });

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };


  const downloadInvoice = (payment) => {
    try {
      const doc = new jsPDF();
      
      // Set up colors
      const primaryColor = [41, 128, 185]; // Blue
      const secondaryColor = [52, 73, 94]; // Dark gray
      const accentColor = [46, 204, 113]; // Green
      
      // Header Section (Compact)
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 30, 'F');
      
      // Company Logo/Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('ikmangems.lk', 20, 20);
      
      // Tagline (Compact)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Sri Lanka\'s premier platform for authentic gem auctions, connecting buyers with verified dealers.', 20, 26);
      
      // Invoice Title
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 20, 45);
      
      // Invoice Number and Date (Side by side)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice #: ${payment.paymentId}`, 20, 55);
      doc.text(`Date: ${payment.date}`, 120, 55);
      
      // Company Details Box (Compact)
      doc.setFillColor(248, 249, 250);
      doc.rect(120, 35, 80, 25, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(120, 35, 80, 25, 'S');
      
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('ikmangems.lk', 125, 42);
      doc.setFont('helvetica', 'normal');
      doc.text('Colombo, Sri Lanka', 125, 48);
      doc.text('info@ikmangems.lk', 125, 54);
      
      // Customer Details Section (Compact)
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', 20, 70);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.fullName || 'N/A', 20, 78);
      doc.text(payment.emailAddress || 'N/A', 20, 84);
      doc.text(payment.contactNumber || 'N/A', 20, 90);
      
      // Payment Details Table Header (Centered)
      const tableWidth = 150;
      const tableStartX = (210 - tableWidth) / 2; // Center the table
      doc.setFillColor(...primaryColor);
      doc.rect(tableStartX, 100, tableWidth, 10, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Description', tableStartX + 5, 107);
      doc.text('Details', tableStartX + 80, 107);
      
      // Payment Details Rows
      let yPos = 115;
      
      // Payment Type Row
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Payment Method', tableStartX + 5, yPos);
      doc.text(payment.paymentType || 'N/A', tableStartX + 80, yPos);
      yPos += 6;
      
      // BID ID Row
      doc.text('BID ID', tableStartX + 5, yPos);
      doc.text(payment.auctionId || 'N/A', tableStartX + 80, yPos);
      yPos += 6;
      
      // Payment Date Row
      doc.text('Payment Date', tableStartX + 5, yPos);
      doc.text(payment.date || 'N/A', tableStartX + 80, yPos);
      yPos += 6;
      
      // Status Row
      doc.text('Status', tableStartX + 5, yPos);
      const statusText = payment.status === 'complete' || payment.status === 'success' ? 'Completed' : 
                        payment.status === 'pending' ? 'Pending' : 
                        payment.status === 'failed' || payment.status === 'failure' ? 'Failed' : payment.status;
      doc.text(statusText, tableStartX + 80, yPos);
      yPos += 6;
      
      // Card Type (for online payments)
      if (payment.paymentType === 'Online Payment' && payment.cardType) {
        doc.text('Card Type', tableStartX + 5, yPos);
        doc.text(payment.cardType.toUpperCase(), tableStartX + 80, yPos);
        yPos += 6;
      }
      
      // Transaction ID (for online payments)
      if (payment.transactionId) {
        doc.text('Transaction ID', tableStartX + 5, yPos);
        doc.text(payment.transactionId, tableStartX + 80, yPos);
        yPos += 6;
      }
      
      // Bank Details (for bank deposits)
      if (payment.paymentType === 'Bank Deposit') {
        if (payment.bank) {
          doc.text('Bank', tableStartX + 5, yPos);
          doc.text(payment.bank, tableStartX + 80, yPos);
          yPos += 6;
        }
        if (payment.branch) {
          doc.text('Branch', tableStartX + 5, yPos);
          doc.text(payment.branch, tableStartX + 80, yPos);
          yPos += 6;
        }
      }
      
      // Remark
      if (payment.remark) {
        doc.text('Description', tableStartX + 5, yPos);
        doc.text(payment.remark, tableStartX + 80, yPos);
        yPos += 6;
      }
      
      // Amount Section (Compact)
      yPos += 10;
      
      // Simple underline
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(50, yPos, 160, yPos);
      
      // Amount label
      yPos += 8;
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const amountLabel = 'Amount:';
      const amountLabelWidth = doc.getTextWidth(amountLabel);
      doc.text(amountLabel, (210 - amountLabelWidth) / 2, yPos);
      
      // Amount value
      yPos += 6;
      doc.setTextColor(...accentColor);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const amountText = formatAmount(payment.amount);
      const amountWidth = doc.getTextWidth(amountText);
      doc.text(amountText, (210 - amountWidth) / 2, yPos);
      
      // Footer (Ultra Compact)
      yPos += 12;
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for your business!', 20, yPos);
      doc.text('For any queries, please contact us at info@ikmangems.lk', 20, yPos + 4);
      doc.text('This is a computer-generated invoice.', 20, yPos + 8);
      
      // Copyright at the very bottom
      doc.setFontSize(7);
      doc.text('© 2025 ikmangems.lk. All rights reserved.', 20, yPos + 12);
      
      // Download the PDF
      doc.save(`invoice_${payment.paymentId}.pdf`);
      toast.success("Invoice downloaded successfully!");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate invoice. Please try again.');
    }
  };


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
        {/* Header */}


        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Search Payments</h3>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search by payment number, BID ID, or any other field..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-12 py-4 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-gradient-to-r from-indigo-50 to-purple-50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-indigo-400 hover:text-indigo-600 transition-colors duration-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-indigo-800">
                    Found {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} matching "{searchTerm}"
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Payment Information</h2>
              </div>
              <button
                onClick={fetchPaymentHistory}
                className="flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
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
                  : "You haven't made any payments yet."
                }
              </p>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b-2 border-indigo-200">
                  <tr>
                    <th className="w-[12%] px-4 py-6 text-left text-base font-bold text-indigo-800 whitespace-nowrap">Payment Type</th>
                    <th className="w-[13%] px-4 py-6 text-left text-base font-bold text-indigo-800 whitespace-nowrap">Payment Number</th>
                    <th className="w-[10%] px-4 py-6 text-left text-base font-bold text-indigo-800 whitespace-nowrap">BID ID</th>
                    <th className="w-[13%] px-4 py-6 text-left text-base font-bold text-indigo-800 whitespace-nowrap">Deposited Amount</th>
                    <th className="w-[12%] px-4 py-6 text-left text-base font-bold text-indigo-800 whitespace-nowrap">Bank</th>
                    <th className="w-[12%] px-4 py-6 text-left text-base font-bold text-indigo-800 whitespace-nowrap">Branch</th>
                    <th className="w-[12%] px-4 py-6 text-left text-base font-bold text-indigo-800 whitespace-nowrap">Payment Date</th>
                    <th className="w-[11%] px-4 py-6 text-left text-base font-bold text-indigo-800 whitespace-nowrap">Payment Status</th>
                    <th className="w-[15%] px-4 py-6 text-left text-base font-bold text-indigo-800 whitespace-nowrap">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  {filteredPayments.map((payment, index) => (
                    <tr key={payment.id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gradient-to-r from-blue-25 to-indigo-25'}`}>
                      <td className="w-[12%] px-4 py-5">
                        <span className="text-sm font-bold text-black">
                          {payment.paymentType === 'Bank Deposit' ? 'Bank Deposit' : 'Online Payment'}
                        </span>
                      </td>
                      <td className="w-[13%] px-4 py-5">
                        <span className="font-mono text-xs font-bold truncate block text-gray-800">
                          {payment.paymentId}
                        </span>
                      </td>
                      <td className="w-[10%] px-4 py-5">
                        <span className="text-black text-sm">
                          {payment.auctionId || 'N/A'}
                        </span>
                      </td>
                      <td className="w-[13%] px-4 py-5">
                        <span className="font-bold text-blue-600 text-sm">
                          {formatAmount(payment.amount)}
                        </span>
                      </td>
                      <td className="w-[12%] px-4 py-5 text-gray-700 font-medium text-sm truncate">
                        {payment.bank}
                      </td>
                      <td className="w-[12%] px-4 py-5 text-gray-700 font-medium text-sm truncate">
                        {payment.branch || 'Not Available'}
                      </td>
                      <td className="w-[12%] px-4 py-5">
                        <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 font-semibold text-xs rounded-md border border-rose-200">
                          📅 {payment.date}
                        </span>
                      </td>
                      <td className="w-[11%] px-4 py-5">
                        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold w-20 ${
                          payment.status === 'complete' || payment.status === 'success' 
                            ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200' 
                            : payment.status === 'pending'
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200'
                            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200'
                        }`}>
                          {payment.status === 'success' ? 'Complete' : payment.status === 'failure' ? 'Failed' : getStatusText(payment.status)}
                        </span>
                      </td>
                      <td className="w-[15%] px-4 py-5">
                        {/* Download logic: All payments can download invoice (including failed ones) */}
                        {payment.paymentType === 'Bank Deposit' ? (
                          payment.status === 'pending' ? (
                            <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-lg text-xs font-semibold cursor-not-allowed border border-gray-300 w-24 justify-center">
                              ⏳ Pending
                            </span>
                          ) : (
                            <button
                              onClick={() => downloadInvoice(payment)}
                              className="flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-xs font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-24"
                            >
                              📄 Download
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => downloadInvoice(payment)}
                            className="flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-xs font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-24"
                          >
                            📄 Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
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

export default PaymentHistory;