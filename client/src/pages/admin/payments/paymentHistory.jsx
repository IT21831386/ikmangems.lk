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
      const formattedBankPayments = bankPaymentsData.map(payment => ({
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
      }));

      // Format online payments
      const formattedOnlinePayments = onlinePaymentsData.map(payment => ({
        id: payment._id,
        paymentId: `ONL_${payment._id.slice(-8).toUpperCase()}`,
        transactionId: payment.transactionId || `TXN_${payment._id.slice(-8).toUpperCase()}`,
        auctionId: payment.auctionId,
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
      }));

      // Combine both payment types
      const combinedPayments = [...formattedBankPayments, ...formattedOnlinePayments];
      
      // Sort by creation date (newest first)
      combinedPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Filter out deleted payments for user view
      console.log('All payments before filtering:', combinedPayments.map(p => ({ id: p.id, deleted: p.deleted, status: p.status })));
      const nonDeletedPayments = combinedPayments.filter(payment => !payment.deleted);
      console.log('Non-deleted payments after filtering:', nonDeletedPayments.map(p => ({ id: p.id, deleted: p.deleted, status: p.status })));
      
      setAllPayments(nonDeletedPayments);

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
    // Format date like the example (DD/MM/YYYY HH:MM AM/PM)
    const formatReceiptDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      
      return `${day}/${month}/${year} ${displayHours}:${minutes} ${ampm}`;
    };

    // Generate invoice reference
    const referenceCode = `${payment.paymentId.slice(-4)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create PDF using jsPDF
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Header with same color as cyber receipt
    doc.setFillColor(61, 82, 109); // Dark blue-gray color from cyber receipt
    doc.rect(0, 0, 210, 35, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ikmangems.lk', 105, 12, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text("Sri Lanka's premier platform for authentic gem auctions", 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 105, 28, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 50;
    
    // Decorative line under header
    doc.setDrawColor(61, 82, 109);
    doc.setLineWidth(0.5);
    doc.line(20, 42, 190, 42);
    
    // Bidder Details Section - Center Right (moved down)
    const bidderStartY = 60;
    const centerX = 105; // Center of A4 page (210mm / 2)
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(61, 82, 109);
    doc.text('BIDDER DETAILS', centerX + 40, bidderStartY);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`${payment.fullName || 'N/A'}`, centerX + 40, bidderStartY + 10);
    doc.text(`${payment.contactNumber || 'N/A'}`, centerX + 40, bidderStartY + 16);
    doc.text(`${payment.billingAddress || 'N/A'}`, centerX + 40, bidderStartY + 22);
    doc.text(`${payment.emailAddress || 'N/A'}`, centerX + 40, bidderStartY + 28);
    
    // Payment Details Section - Center (exactly in middle)
    const paymentStartY = bidderStartY + 50;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(61, 82, 109);
    doc.text('PAYMENT DETAILS', centerX, paymentStartY, { align: 'center' });
    yPosition = paymentStartY + 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Payment details with proper spacing like in the image
    const labelX = centerX - 50;
    const valueX = centerX + 20;
    
    doc.text('Payment Number:', labelX, yPosition);
    doc.text(payment.paymentId, valueX, yPosition);
    yPosition += 10;
    
    if (payment.paymentType === 'Online Payment') {
      doc.text('Transaction ID:', labelX, yPosition);
      doc.text(payment.transactionId, valueX, yPosition);
      yPosition += 10;
    }
    
    doc.text('BID ID:', labelX, yPosition);
    doc.text(payment.auctionId, valueX, yPosition);
    yPosition += 10;
    
    doc.text('Payment Method:', labelX, yPosition);
    doc.text(payment.paymentType === 'Bank Deposit' ? 'Bank Deposit' : 'Online Payment', valueX, yPosition);
    yPosition += 10;
    
    if (payment.paymentType === 'Bank Deposit') {
      doc.text('Bank:', labelX, yPosition);
      doc.text(payment.bank, valueX, yPosition);
      yPosition += 10;
      doc.text('Branch:', labelX, yPosition);
      doc.text(payment.branch, valueX, yPosition);
      yPosition += 10;
    } else {
      const cardTypeText = payment.cardType === 'visa' ? 'Visa Card' : 
                          payment.cardType === 'mastercard' ? 'Master Card' : 'Card Payment';
      doc.text('Payment Type:', labelX, yPosition);
      doc.text(cardTypeText, valueX, yPosition);
      yPosition += 10;
    }
    
    doc.text('Deposited Amount:', labelX, yPosition);
    doc.text(formatAmount(payment.amount), valueX, yPosition);
    yPosition += 10;
    
    doc.text('Currency:', labelX, yPosition);
    doc.text('LKR', valueX, yPosition);
    yPosition += 10;
    
    doc.text('Payment Date:', labelX, yPosition);
    doc.text(formatReceiptDate(payment.date), valueX, yPosition);
    yPosition += 10;
    
    doc.text('Remarks:', labelX, yPosition);
    doc.text(payment.remark || 'N/A', valueX, yPosition);
    yPosition += 10;
    
    // Status as regular text like other items
    const statusText = getStatusText(payment.status).toUpperCase();
    doc.text('Status:', labelX, yPosition);
    doc.text(statusText, valueX, yPosition);
    yPosition += 15;
    
    // Horizontal bar below payment details
    doc.setDrawColor(61, 82, 109);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Position footer at bottom of page (A4 height is 297mm, footer height is 35mm)
    const footerY = 262; // 297 - 35 = 262mm from top
    
    // Invoice Reference without container (plain text)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(61, 82, 109);
    doc.text('Invoice Reference:', centerX, yPosition, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(referenceCode, centerX, yPosition + 8, { align: 'center' });
    yPosition += 20;
    
    // Generated info with darker text
    doc.setTextColor(50, 50, 50); // Much darker than before
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated at: ${formatReceiptDate(new Date())}`, 20, yPosition);
    doc.text('Page: 1 of 1', 170, yPosition);
    
    // Footer with same color as header
    doc.setFillColor(61, 82, 109); // Same dark blue-gray color
    doc.rect(0, footerY, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ikmangems.lk', 105, footerY + 8, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Colombo, Sri Lanka', 105, footerY + 15, { align: 'center' });
    doc.text('info@ikmangems.lk | +94 11 123 4567', 105, footerY + 21, { align: 'center' });
    doc.text('© 2025 ikmangems.lk. All rights reserved.', 105, footerY + 27, { align: 'center' });
    
    // Download the PDF
    doc.save(`invoice_${payment.paymentId}.pdf`);
    
    toast.success("Invoice downloaded as PDF!");
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
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              Found {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </div>
          )}
          </div>

        {/* Payment Information Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div style={{ backgroundColor: '#2C3E50' }} className="text-white px-8 py-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Payment Information</h2>
              <div className="flex space-x-2">
                <button
                  onClick={fetchPaymentHistory}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  style={{ borderRadius: '30px' }}
                >
                  🔄 Refresh
                </button>
              </div>
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
                <thead className="bg-gray-200 border-b border-gray-300">
                  <tr>
                    <th className="w-[12%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Payment Type</th>
                    <th className="w-[13%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Payment Number</th>
                    <th className="w-[10%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">BID ID</th>
                    <th className="w-[13%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Deposited Amount</th>
                    <th className="w-[12%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Bank</th>
                    <th className="w-[12%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Branch</th>
                    <th className="w-[12%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Payment Date</th>
                    <th className="w-[11%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Payment Status</th>
                    <th className="w-[15%] px-4 py-6 text-left text-base font-bold text-gray-900 whitespace-nowrap">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment, index) => (
                    <tr key={payment.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="w-[12%] px-4 py-5">
                        <span className="text-sm font-bold text-gray-800">
                          {payment.paymentType === 'Bank Deposit' ? 'Bank Deposit' : 'Online Payment'}
                        </span>
                      </td>
                      <td className="w-[13%] px-4 py-5">
                        <span className="font-mono text-xs font-bold truncate block text-gray-800">
                          {payment.paymentId}
                        </span>
                      </td>
                      <td className="w-[10%] px-4 py-5">
                        <span className="text-gray-800 text-sm">
                          {payment.auctionId}
                        </span>
                      </td>
                      <td className="w-[13%] px-4 py-5">
                        <span className="font-bold text-gray-800 text-sm">
                          {formatAmount(payment.amount)}
                        </span>
                      </td>
                      <td className="w-[12%] px-4 py-5 text-gray-700 font-medium text-sm truncate">
                        {payment.bank}
                      </td>
                      <td className="w-[12%] px-4 py-5 text-gray-700 font-medium text-sm truncate">
                        {payment.branch || 'Not Available'}
                      </td>
                      <td className="w-[12%] px-4 py-5 text-gray-700 font-medium text-sm">
                        {payment.date}
                      </td>
                      <td className="w-[11%] px-4 py-5">
                        <span 
                          className="text-xs font-semibold"
                          style={{ 
                            color: payment.status === 'pending' ? '#EA580C' : (payment.status === 'complete' || payment.status === 'success' ? '#4ECDC4' : '#FF6B6B')
                          }}
                        >
                          {getStatusText(payment.status)}
                        </span>
                      </td>
                      <td className="w-[15%] px-4 py-5">
                        {/* Download logic: All payments can download invoice (including failed ones) */}
                        {payment.paymentType === 'Bank Deposit' ? (
                          payment.status === 'pending' ? (
                            <span className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold cursor-not-allowed border border-gray-300 w-24 justify-center">
                              ⏳ Pending
                            </span>
                          ) : (
                            <button
                              onClick={() => downloadInvoice(payment)}
                              className="flex items-center justify-center px-3 py-1.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 w-24"
                              style={{ backgroundColor: '#000000', borderRadius: '30px' }}
                            >
                              📄 Download
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => downloadInvoice(payment)}
                            className="flex items-center justify-center px-3 py-1.5 text-white rounded-lg hover:opacity-90 transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 w-24"
                            style={{ backgroundColor: '#000000', borderRadius: '30px' }}
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