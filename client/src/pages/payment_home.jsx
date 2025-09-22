import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import OnlinePayment from "./onlinepayment";
import { useNavigate } from "react-router";

const PaymentForm = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("home"); // home, bank, online
  const [paymentStatus, setPaymentStatus] = useState(""); // pending, confirmed, etc.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    contactNumber: "",
    billingAddress: "",
    bank: "",
    branch: "",
    paiddate: "",
    amount: "",
    auctionId: "",
    remark: "",
    slip: null,
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cardHolderName: "",
    cvvNumber: "",
    cardType: "visa",
  });
  const [previewImage, setPreviewImage] = useState(null);

  const sriLankanBanks = [
    "Select Your Bank",
    "Bank of Ceylon",
    "Peoples Bank",
    "Commercial Bank",
    "Hatton National Bank",
    "Sampath Bank",
    "Nations Trust Bank",
    "DFCC Bank",
    "Pan Asia Banking Corporation",
    "Union Bank",
    "Seylan Bank",
    "National Development Bank",
    "Regional Development Bank",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload only image files (JPEG, PNG, GIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, slip: file }));
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const goBackToHome = () => {
    setCurrentPage("home");
    setPaymentStatus("");
  };

  const handleBankDepositConfirm = async () => {
    // Validate required fields
    if (!formData.bank || !formData.branch || !formData.paiddate || !formData.amount || !formData.auctionId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.slip) {
      toast.error("Please upload a deposit slip");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('emailAddress', formData.emailAddress);
      submitData.append('contactNumber', formData.contactNumber);
      submitData.append('billingAddress', formData.billingAddress);
      submitData.append('bank', formData.bank);
      submitData.append('branch', formData.branch);
      submitData.append('paiddate', formData.paiddate);
      submitData.append('amount', formData.amount);
      submitData.append('auctionId', formData.auctionId);
      submitData.append('remark', formData.remark);
      submitData.append('slip', formData.slip);

      const response = await fetch('http://localhost:5001/api/payments', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        setPaymentStatus("pending");
        toast.success("Bank deposit submitted successfully! Payment is pending verification.");
      } else {
        toast.error(result.message || "Failed to submit bank deposit");
      }
    } catch (error) {
      console.error('Bank deposit error:', error);
      toast.error("Failed to submit bank deposit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Render Components ---

  const renderBidderDetails = (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-[30px]" style={{ minWidth: 380 }}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6" style={{ fontFamily: 'Poppins' }}>Bidder Details</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Full Name
            <span style={{ color: "red", marginLeft: "2px" }}>*</span>
          </label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Sanjay Dissanayake" className="w-full px-4 py-3 border border-gray-300 rounded-[30px] outline-none" style={{ fontFamily: 'Poppins' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            E-mail Address
            <span style={{ color: "red", marginLeft: "2px" }}>*</span>
          </label>
          <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} placeholder="sanjay@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-[30px] outline-none" style={{ fontFamily: 'Poppins' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Contact Number
            <span style={{ color: "red", marginLeft: "2px" }}>*</span>
          </label>
          <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="94 770 123456" className="w-full px-4 py-3 border border-gray-300 rounded-[30px] outline-none" style={{ fontFamily: 'Poppins' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Billing Address
            <span style={{ color: "red", marginLeft: "2px" }}>*</span>
          </label>
          <textarea name="billingAddress" value={formData.billingAddress} onChange={handleInputChange} placeholder="Enter your billing address" className="w-full px-4 py-3 border border-gray-300 rounded-[30px] outline-none resize-none" rows={3} style={{ fontFamily: 'Poppins' }} />
        </div>
      </div>
    </div>
  );

  const renderPaymentMethods = (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6" style={{ fontFamily: 'Poppins' }}>Payment Methods</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-[30px] p-4 cursor-pointer bg-gray-50 border-gray-300 hover:bg-green-50 hover:border-green-300 transition-all"
             onClick={() => setCurrentPage("bank")}>
          <span className="font-medium text-gray-700" style={{ fontFamily: 'Poppins' }}>Bank Deposit</span>
        </div>
        <div className="border rounded-[30px] p-4 cursor-pointer bg-gray-50 border-gray-300 hover:bg-red-50 hover:border-red-300 transition-all"
             onClick={() => setCurrentPage("online")}>
          <span className="font-medium text-gray-700" style={{ fontFamily: 'Poppins' }}>Online Payment</span>
        </div>
      </div>
      
      {/* Payment History Link */}
      <div className="mt-6 text-center">
        <button 
          onClick={() => navigate('/payment-history')}
          className="px-6 py-3 bg-blue-500 text-white rounded-[30px] hover:bg-blue-600 transition-all"
          style={{ fontFamily: 'Poppins' }}
        >
          📋 View Payment History
        </button>
      </div>
    </div>
  );

  const renderBankDepositPortal = (
    <div className="p-6 bg-white rounded-[30px]" style={{ minWidth: 400 }}>
      <h1 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Poppins' }}>Bank Deposit Portal</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Bank
            <span style={{ color: "red", marginLeft: "2px" }}>*</span>
          </label>
          <select name="bank" value={formData.bank} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-[30px]" style={{ fontFamily: 'Poppins' }}>
            {sriLankanBanks.map((b, i) => (<option key={i} value={b} disabled={i === 0}>{b}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Branch
            <span style={{ color: "red", marginLeft: "2px" }}>*</span>
          </label>
          <input name="branch" value={formData.branch} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-[30px]" style={{ fontFamily: 'Poppins' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Deposit Date
            <span style={{ color: "red", marginLeft: "2px" }}>*</span>
          </label>
          <input type="date" name="paiddate" value={formData.paiddate} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-[30px]" style={{ fontFamily: 'Poppins' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Deposit Amount
            <span style={{ color: "red", marginLeft: "2px" }}>*</span>
          </label>
          <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-[30px]" style={{ fontFamily: 'Poppins' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Auction ID
            <span style={{ color: "red", marginLeft: "2px" }}>*</span>
          </label>
          <input name="auctionId" value={formData.auctionId} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-[30px]" style={{ fontFamily: 'Poppins' }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Remarks
          </label>
          <textarea name="remark" value={formData.remark} onChange={handleInputChange} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-[30px]" style={{ fontFamily: 'Poppins' }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Poppins' }}>Upload Deposit Slip</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-[30px] p-6 text-center">
            {previewImage ? (
              <div>
                <img src={previewImage} alt="Deposit slip preview" className="mx-auto max-h-48 rounded-[30px] shadow-md mb-4"/>
                <button type="button" onClick={() => { setPreviewImage(null); setFormData(prev => ({ ...prev, slip: null })); }} className="px-4 py-1 bg-red-500 text-white rounded-[30px]">Remove</button>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-2">🗂️</div>
                <p className="text-lg font-medium text-gray-700 mb-1" style={{ fontFamily: 'Poppins' }}>Upload files here</p>
                <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 mt-2" />
                <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={goBackToHome} className="px-6 py-2 bg-gray-500 text-white rounded-[30px]">Back</button>
          <button 
            type="button" 
            onClick={handleBankDepositConfirm}
            disabled={isSubmitting}
            className={`px-6 py-2 text-white rounded-[30px] ${isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );

  // Payment Pending Overlay Component
  const renderPaymentPendingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[30px] p-8 max-w-md mx-4 text-center relative">
        <div className="text-6xl mb-4">⭐</div>
        <h2 className="text-3xl font-bold text-orange-600 mb-4" style={{ fontFamily: 'Poppins' }}>
          Payment Pending
        </h2>
        <p className="text-gray-700 mb-6" style={{ fontFamily: 'Poppins' }}>
          We'll Let You Know Once the Payment is Confirmed!
        </p>
        <div className="bg-yellow-50 p-4 rounded-[20px] mb-6">
          <p className="text-sm text-gray-600" style={{ fontFamily: 'Poppins' }}>
            Your bank deposit has been submitted and is being verified. You will receive a confirmation email once the payment is processed.
          </p>
        </div>
        <button 
          onClick={goBackToHome}
          className="px-6 py-2 bg-blue-500 text-white rounded-[30px] hover:bg-blue-600"
          style={{ fontFamily: 'Poppins' }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "#fff", fontFamily: 'Poppins' }}>
      <div className="flex flex-col md:flex-row max-w-6xl mx-auto gap-7">
        {/* Left: Order Form or Bank Deposit */}
        <div className="flex-1">
          {currentPage === "home" && (
            <div className="bg-yellow-50 rounded-[30px] p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Poppins' }}>Custom Order Form</h1>
              {renderBidderDetails}
              {renderPaymentMethods}
            </div>
          )}
          {currentPage === "bank" && renderBankDepositPortal}
          {currentPage === "online" && <OnlinePayment goBack={goBackToHome} />}
        </div>

        {/* Right: Placeholder for Gem Details */}
        <div className="flex-1 bg-white rounded-[30px] p-8 shadow" style={{ minHeight: 600 }}>
          <div className="h-full flex items-center justify-center text-gray-400" style={{ fontFamily: 'Poppins', minHeight: 200 }}>
            Gem details section
            {/* You can later render gem info here dynamically */}
          </div>
        </div>
      </div>
      
      {/* Payment Pending Overlay */}
      {paymentStatus === "pending" && renderPaymentPendingOverlay()}
      
      <Toaster position="top-right"/>
    </div>
  );
};

export default PaymentForm;
