import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

const PaymentHistory = () => {
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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
        createdAt: new Date(payment.createdAt)
      }));

      // Format online payments
      const formattedOnlinePayments = onlinePaymentsData.map(payment => ({
        id: payment._id,
        paymentId: `ONL_${payment._id.slice(-8).toUpperCase()}`, // Payment Number for online payments
        transactionId: payment.transactionId || `TXN_${payment._id.slice(-8).toUpperCase()}`, // Keep transaction ID separate
        auctionId: payment.auctionId,
        amount: payment.amount,
        bank: "IPG", // Internet Payment Gateway
        branch: "IPG", // Internet Payment Gateway
        date: new Date(payment.createdAt).toLocaleDateString('en-CA'),
        status: 'complete', // Online payments are always complete (no admin approval needed)
        remark: payment.remark || "Online payment",
        paymentType: "Online Payment",
        cardNumber: payment.cardNumber,
        cardType: payment.cardType,
        // Bidder details
        fullName: payment.fullName,
        contactNumber: payment.contactNumber,
        billingAddress: payment.billingAddress,
        emailAddress: payment.emailAddress,
        createdAt: new Date(payment.createdAt)
      }));

      // Combine both payment types
      const combinedPayments = [...formattedBankPayments, ...formattedOnlinePayments];
      
      // Sort by creation date (newest first)
      combinedPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setAllPayments(combinedPayments);

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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const downloadInvoice = (payment) => {
    // Mask card number (show only last 4 digits)
    const maskCardNumber = (cardNumber) => {
      if (!cardNumber) return '****';
      const last4 = cardNumber.slice(-4);
      return `****${last4}`;
    };

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

    // Create professional invoice content
    const invoiceContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                              ikmangems.lk                                   ║
║                                INVOICE                                      ║
║                           [Company Logo]                                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

BIDDER DETAILS
════════════════════════════════════════════════════════════════════════════════
Name:                     ${payment.fullName || 'N/A'}
Contact Number:           ${payment.contactNumber || 'N/A'}
Address:                  ${payment.billingAddress || 'N/A'}
Email:                    ${payment.emailAddress || 'N/A'}

PAYMENT DETAILS
════════════════════════════════════════════════════════════════════════════════
Payment Number:           ${payment.paymentId}
${payment.paymentType === 'Online Payment' ? `
Transaction ID:           ${payment.transactionId}
` : ''}
Auction ID:               ${payment.auctionId}
Payment Method:           ${payment.paymentType === 'Bank Deposit' ? 'Bank Deposit' : 'Online Payment'}
${payment.paymentType === 'Bank Deposit' ? `
Bank:                     ${payment.bank}
Branch:                   ${payment.branch}
` : `
Payment Type:             ${payment.cardType === 'visa' ? 'Visa Card' : payment.cardType === 'mastercard' ? 'Master Card' : 'Card Payment'}
`}
Deposited Amount:         ${formatAmount(payment.amount)}
Currency:                 LKR
Payment Date:             ${formatReceiptDate(payment.date)}
Remarks:                  ${payment.remark}
Status:                   ${getStatusText(payment.status).toUpperCase()}

════════════════════════════════════════════════════════════════════════════════

Invoice Reference:         ${payment.paymentId.slice(-4)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}

Generated at:             ${formatReceiptDate(new Date())}
Page:                     1 of 1

════════════════════════════════════════════════════════════════════════════════

                    IKMAN GEMS AUCTION PLATFORM
                    Colombo, Sri Lanka
                    Tel: +94 11 234 5678
                    Email: support@ikmangems.lk
                    Website: www.ikmangems.lk
                    
                    Thank you for choosing Ikman Gems!
                    Your trusted partner in precious gemstones.
                    
                    All rights reserved © 2024 Ikman Gems

════════════════════════════════════════════════════════════════════════════════
    `.trim();

    // Create HTML content for better formatting
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Invoice - ${payment.paymentId}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border: 2px solid #333;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white;
            text-align: center;
            padding: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .header h2 {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .logo-placeholder {
            font-size: 12px;
            opacity: 0.7;
            margin-top: 5px;
        }
        .section {
            margin: 20px 0;
        }
        .section h3 {
            color: #495057;
            font-size: 16px;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #dee2e6;
        }
        .content {
            padding: 30px;
        }
        .payment-details {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #495057;
        }
        .value {
            color: #212529;
            font-family: 'Courier New', monospace;
        }
        .status-complete {
            color: #28a745;
            font-weight: bold;
        }
        .status-failed {
            color: #dc3545;
            font-weight: bold;
        }
        .footer {
            background: #343a40;
            color: white;
            text-align: center;
            padding: 15px;
            font-size: 12px;
        }
        .reference {
            background: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        }
        .reference-code {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #495057;
        }
        @media print {
            body { background: white; }
            .receipt-container { box-shadow: none; border: 1px solid #000; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <h1>ikmangems.lk</h1>
            <h2>INVOICE</h2>
            <div class="logo-placeholder">[Company Logo]</div>
        </div>
        
        <div class="content">
            <div class="section">
                <h3>BIDDER DETAILS</h3>
                <div class="payment-details">
                    <div class="detail-row">
                        <span class="label">Name:</span>
                        <span class="value">${payment.fullName || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Contact Number:</span>
                        <span class="value">${payment.contactNumber || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Address:</span>
                        <span class="value">${payment.billingAddress || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Email:</span>
                        <span class="value">${payment.emailAddress || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h3>PAYMENT DETAILS</h3>
                <div class="payment-details">
                    <div class="detail-row">
                        <span class="label">Payment Number:</span>
                        <span class="value">${payment.paymentId}</span>
                    </div>
                    ${payment.paymentType === 'Online Payment' ? `
                    <div class="detail-row">
                        <span class="label">Transaction ID:</span>
                        <span class="value">${payment.transactionId}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="label">Auction ID:</span>
                        <span class="value">${payment.auctionId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Payment Method:</span>
                        <span class="value">${payment.paymentType === 'Bank Deposit' ? 'Bank Deposit' : 'Online Payment'}</span>
                    </div>
                    ${payment.paymentType === 'Bank Deposit' ? `
                    <div class="detail-row">
                        <span class="label">Bank:</span>
                        <span class="value">${payment.bank}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Branch:</span>
                        <span class="value">${payment.branch}</span>
                    </div>
                    ` : `
                    <div class="detail-row">
                        <span class="label">Payment Type:</span>
                        <span class="value">${payment.cardType === 'visa' ? 'Visa Card' : payment.cardType === 'mastercard' ? 'Master Card' : 'Card Payment'}</span>
                    </div>
                    `}
                    <div class="detail-row">
                        <span class="label">Deposited Amount:</span>
                        <span class="value">${formatAmount(payment.amount)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Currency:</span>
                        <span class="value">LKR</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Payment Date:</span>
                        <span class="value">${formatReceiptDate(payment.date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Remarks:</span>
                        <span class="value">${payment.remark}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Status:</span>
                        <span class="value ${payment.status === 'success' || payment.status === 'complete' ? 'status-complete' : 'status-failed'}">${getStatusText(payment.status).toUpperCase()}</span>
                    </div>
                </div>
            </div>
            
            <div class="reference">
                <div>Invoice Reference:</div>
                <div class="reference-code">${payment.paymentId.slice(-4)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}</div>
            </div>
            
            <div style="text-align: center; margin: 20px 0; color: #6c757d;">
                <div>Generated at: ${formatReceiptDate(new Date())}</div>
                <div>Page: 1 of 1</div>
            </div>
        </div>
        
        <div class="footer">
            <div><strong>IKMAN GEMS AUCTION PLATFORM</strong></div>
            <div>Colombo, Sri Lanka</div>
            <div>Tel: +94 11 234 5678</div>
            <div>Email: support@ikmangems.lk</div>
            <div>Website: www.ikmangems.lk</div>
            <div style="margin-top: 10px;">
                <div>Thank you for choosing Ikman Gems!</div>
                <div>Your trusted partner in precious gemstones.</div>
            </div>
            <div style="margin-top: 10px; font-size: 10px;">
                All rights reserved © 2024 Ikman Gems
            </div>
        </div>
    </div>
</body>
</html>`;

    // Create and download as HTML file (opens in browser, can be saved as PDF)
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${payment.paymentId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success("Invoice downloaded successfully!");
  };

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">📋 Total Payments</h3>
                <p className="text-3xl font-bold text-blue-600">{allPayments.length}</p>
                <p className="text-sm text-gray-500">All transactions</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">🏦 Bank Deposits</h3>
                <p className="text-3xl font-bold text-blue-600">{allPayments.filter(p => p.paymentType === 'Bank Deposit').length}</p>
                <p className="text-sm text-gray-500">
                  {allPayments.filter(p => p.paymentType === 'Bank Deposit' && p.status === 'pending').length} Pending
                </p>
              </div>
              <div className="text-4xl">🏦</div>
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">💳 Online Payments</h3>
                <p className="text-3xl font-bold text-green-600">{allPayments.filter(p => p.paymentType === 'Online Payment').length}</p>
                <p className="text-sm text-gray-500">
                  {allPayments.filter(p => p.paymentType === 'Online Payment' && p.status === 'complete').length} Complete
                </p>
              </div>
              <div className="text-4xl">💳</div>
            </div>
          </div>
        </div>

        {/* Combined Payment Table */}
        <div className="bg-white rounded-[20px] shadow-sm overflow-hidden">
          {allPayments.length === 0 ? (
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
                    <th className="px-6 py-4 text-left font-semibold">Payment Number</th>
                    <th className="px-6 py-4 text-left font-semibold">Auction ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Payment Type</th>
                    <th className="px-6 py-4 text-left font-semibold">Deposited Amount</th>
                    <th className="px-6 py-4 text-left font-semibold">Bank</th>
                    <th className="px-6 py-4 text-left font-semibold">Branch</th>
                    <th className="px-6 py-4 text-left font-semibold">Payment Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Payment Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`font-mono text-sm ${payment.paymentType === 'Bank Deposit' ? 'text-blue-600' : 'text-green-600'}`}>
                          {payment.paymentId}
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
                        {payment.bank}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {payment.branch}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {/* Download logic: All payments can download invoice (including failed ones) */}
                        {payment.paymentType === 'Bank Deposit' ? (
                          payment.status === 'pending' ? (
                            <span className="px-3 py-1 bg-gray-300 text-gray-600 rounded-[8px] text-sm font-medium cursor-not-allowed">
                              ⏳ Pending
                            </span>
                          ) : (
                            <button
                              onClick={() => downloadInvoice(payment)}
                              className={`px-3 py-1 text-white rounded-[8px] transition-colors text-sm font-medium ${
                                payment.status === 'success' || payment.status === 'complete' 
                                  ? 'bg-blue-500 hover:bg-blue-600' 
                                  : 'bg-red-500 hover:bg-red-600'
                              }`}
                            >
                              📄 Download Invoice
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => downloadInvoice(payment)}
                            className="px-3 py-1 bg-green-500 text-white rounded-[8px] hover:bg-green-600 transition-colors text-sm font-medium"
                          >
                            📄 Download Invoice
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
      <Toaster position="top-right" />
    </div>
  );
};

export default PaymentHistory;
