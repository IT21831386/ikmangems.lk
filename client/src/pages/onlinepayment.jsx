import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const OnlinePayment = ({ goBack, clearAllData: parentClearAllData, bidderData, paymentType = "order", penaltyData = null }) => {
  const [searchParams] = useSearchParams();
  const isRegistrationPayment = paymentType === 'registration';
  const [formData, setFormData] = useState({
    // Use bidder data if available
    bidId: bidderData?.bidId || "",
    amount: isRegistrationPayment ? "1000" : (bidderData?.amount || ""),
    remark: bidderData?.remark || "",
    cardType: "visa",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cardHolderName: "",
    cvvNumber: "",
    fullName: bidderData?.fullName || "",
    emailAddress: bidderData?.emailAddress || "",
    contactNumber: bidderData?.contactNumber || "",
    billingAddress: bidderData?.billingAddress || "",
  });

  const [saveCardDetails, setSaveCardDetails] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(""); // pending, confirmed, etc.
  const [errors, setErrors] = useState({});

  // Update form data when bidderData changes
  useEffect(() => {
    if (bidderData) {
      setFormData(prev => ({
        ...prev,
        bidId: bidderData.bidId || prev.bidId,
        amount: isRegistrationPayment ? "1000" : (bidderData.amount || prev.amount),
        remark: bidderData.remark || prev.remark,
        fullName: bidderData.fullName || prev.fullName,
        emailAddress: bidderData.emailAddress || prev.emailAddress,
        contactNumber: bidderData.contactNumber || prev.contactNumber,
        billingAddress: bidderData.billingAddress || prev.billingAddress,
      }));
    }
  }, [bidderData, isRegistrationPayment]);

  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString().slice(2));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Payment amount validation - only allow positive numbers and decimal point (exact same as bank deposit)
    if (name === 'amount') {
      // For registration payments, amount is read-only
      if (isRegistrationPayment) {
        return;
      }
      
      // Remove all characters except numbers and decimal point
      let numericValue = value.replace(/[^0-9.]/g, '');
      
      // Ensure only one decimal point
      const parts = numericValue.split('.');
      if (parts.length > 2) {
        return; // Don't update if more than one decimal point
      }
      
      // Prevent negative numbers by removing any minus signs
      numericValue = numericValue.replace(/-/g, '');
      
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      
      // Validate the amount
      const validation = validatePaymentAmount(numericValue);
      if (!validation.valid && numericValue.trim() !== '') {
        setErrors(prev => ({ ...prev, [name]: validation.message }));
      } else {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
      return;
    }
    
    // Card number validation - only allow numbers and limit to 16 digits
    if (name === 'cardNumber') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
      if (numericValue.length <= 16) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
        
        // Validate card number when complete
        if (numericValue.length === 16) {
          const validation = validateCardNumber(numericValue, formData.cardType);
          if (!validation.valid) {
            setErrors(prev => ({ ...prev, [name]: validation.message }));
          } else {
            setErrors(prev => ({ ...prev, [name]: "" }));
          }
        } else {
          setErrors(prev => ({ ...prev, [name]: "" }));
        }
      }
      return;
    }
    
    // Cardholder name validation - allow letters, spaces, hyphens, apostrophes, periods
    if (name === 'cardHolderName') {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Validate cardholder name
      if (value.trim().length >= 2) {
        const validation = validateCardholderName(value);
        if (!validation.valid) {
          setErrors(prev => ({ ...prev, [name]: validation.message }));
        } else {
          setErrors(prev => ({ ...prev, [name]: "" }));
        }
      } else {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
      return;
    }
    
    // CVV validation - only allow numbers and limit to 3 digits
    if (name === 'cvvNumber') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
      if (numericValue.length <= 3) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
        
        // Validate CVV when complete
        if (numericValue.length === 3) {
          const validation = validateCVV(numericValue);
          if (!validation.valid) {
            setErrors(prev => ({ ...prev, [name]: validation.message }));
          } else {
            setErrors(prev => ({ ...prev, [name]: "" }));
          }
        } else {
          setErrors(prev => ({ ...prev, [name]: "" }));
        }
      }
      return;
    }
    
    // Contact number validation - only allow numbers and limit to 10 digits
    if (name === 'contactNumber') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
        
        // Validate contact number when complete
        if (numericValue.length === 10) {
          const validation = validateContactNumber(numericValue);
          if (!validation.valid) {
            setErrors(prev => ({ ...prev, [name]: validation.message }));
          } else {
            setErrors(prev => ({ ...prev, [name]: "" }));
          }
        } else {
          setErrors(prev => ({ ...prev, [name]: "" }));
        }
      }
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Payment amount validation (exact same as bank deposit)
  const validatePaymentAmount = (amount) => {
    // Check if empty
    if (!amount.trim()) {
      return { valid: false, message: "Invalid payment amount" };
    }
    
    // Check if contains only numbers and decimal point (no negative signs, letters, or other characters)
    if (!/^\d+(\.\d+)?$/.test(amount)) {
      return { valid: false, message: "Invalid payment amount" };
    }
    
    // Check if starts with zero (leading zeros)
    if (amount.startsWith('0') && amount.length > 1 && !amount.startsWith('0.')) {
      return { valid: false, message: "Invalid payment amount" };
    }
    
    // Convert to number and check if zero, negative, or less than 1000
    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      return { valid: false, message: "Invalid payment amount" };
    }
    if (numAmount < 1000) {
      return { valid: false, message: "Minimum payment amount is 1000" };
    }
    
    return { valid: true, message: "" };
  };

  // Expiry date validation
  const validateExpiryDate = (month, year) => {
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      return { valid: false, message: "Invalid expiry date" };
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    
    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);
    
    // Check if expiry date is before current date
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return { valid: false, message: "Invalid expiry date" };
    }
    
    // Check if month is valid (1-12)
    if (expiryMonth < 1 || expiryMonth > 12) {
      return { valid: false, message: "Invalid expiry date" };
    }
    
    return { valid: true, message: "" };
  };

  // Card number validation
  const validateCardNumber = (cardNumber, cardType) => {
    if (!cardNumber || cardNumber.length !== 16) {
      return { valid: false, message: "Invalid input" };
    }
    
    // Check if all digits
    if (!/^\d{16}$/.test(cardNumber)) {
      return { valid: false, message: "Invalid input" };
    }
    
    // Check card type validation
    if (cardType === 'visa') {
      if (!cardNumber.startsWith('4')) {
        return { valid: false, message: "Invalid input" };
      }
    } else if (cardType === 'mastercard') {
      const firstTwo = cardNumber.substring(0, 2);
      const firstFour = cardNumber.substring(0, 4);
      if (!((firstTwo >= '51' && firstTwo <= '55') || (firstFour >= '2221' && firstFour <= '2720'))) {
        return { valid: false, message: "Invalid input" };
      }
    }
    
    return { valid: true, message: "" };
  };

  // Cardholder name validation
  const validateCardholderName = (name) => {
    if (!name || name.trim().length < 2) {
      return { valid: false, message: "Invalid input" };
    }
    
    // Allow letters, spaces, hyphens, apostrophes, and periods
    if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
      return { valid: false, message: "Invalid input" };
    }
    
    return { valid: true, message: "" };
  };

  // CVV validation
  const validateCVV = (cvv) => {
    if (!cvv || cvv.length !== 3) {
      return { valid: false, message: "Invalid input" };
    }
    
    // Check if all digits
    if (!/^\d{3}$/.test(cvv)) {
      return { valid: false, message: "Invalid input" };
    }
    
    return { valid: true, message: "" };
  };

  // Contact number validation
  const validateContactNumber = (contactNumber) => {
    if (!contactNumber || contactNumber.length !== 10) {
      return { valid: false, message: "Contact number must be 10 digits" };
    }
    
    // Check if all digits
    if (!/^\d{10}$/.test(contactNumber)) {
      return { valid: false, message: "Contact number must contain only digits" };
    }
    
    // Check if starts with 0
    if (!contactNumber.startsWith('0')) {
      return { valid: false, message: "Contact number must start with 0" };
    }
    
    return { valid: true, message: "" };
  };

  const clearAllData = () => {
    setCurrentStep(1);
    setOtpCode("");
    setIsSubmitting(false);
    setPaymentId(null);
    setPaymentStatus("");
    setFormData({
      bidId: "",
      amount: "",
      remark: "",
      cardType: "visa",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cardHolderName: "",
      cvvNumber: "",
      fullName: "",
      emailAddress: "",
      contactNumber: "",
      billingAddress: "",
    });
    setErrors({});
    
    // Clear parent form data and navigate back
    if (parentClearAllData) {
      parentClearAllData();
    } else if (goBack) {
      goBack();
    }
  };

  const nextStep = async () => {
    // Validation per step
    if (currentStep === 1) {
      // BID ID is not required for any payment type
      if (!formData.amount || !formData.contactNumber) {
        toast.error("Please fill in Payment Amount and Contact Number");
        return;
      }
      
      // Validate payment amount
      const amountValidation = validatePaymentAmount(formData.amount);
      if (!amountValidation.valid) {
        setErrors(prev => ({ ...prev, amount: amountValidation.message }));
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cardHolderName || !formData.cvvNumber) {
        toast.error("Please fill in all card details");
        return;
      }
      
      // Validate expiry date
      const expiryValidation = validateExpiryDate(formData.expiryMonth, formData.expiryYear);
      if (!expiryValidation.valid) {
        setErrors(prev => ({ ...prev, expiryDate: expiryValidation.message }));
        return;
      }
      
      // Validate card number
      const cardNumberValidation = validateCardNumber(formData.cardNumber, formData.cardType);
      if (!cardNumberValidation.valid) {
        setErrors(prev => ({ ...prev, cardNumber: cardNumberValidation.message }));
        return;
      }
      
      // Validate cardholder name
      const cardholderValidation = validateCardholderName(formData.cardHolderName);
      if (!cardholderValidation.valid) {
        setErrors(prev => ({ ...prev, cardHolderName: cardholderValidation.message }));
        return;
      }
      
      // Validate CVV
      const cvvValidation = validateCVV(formData.cvvNumber);
      if (!cvvValidation.valid) {
        setErrors(prev => ({ ...prev, cvvNumber: cvvValidation.message }));
        return;
      }
      
      // Create payment and send OTP
      await createPaymentAndSendOTP();
      return; // Don't increment step here, createPaymentAndSendOTP handles it
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Clear sensitive card details when going back from card details page
      if (currentStep === 2) {
        setFormData(prev => ({
          ...prev,
          cardType: "visa",
          cardNumber: "",
          expiryMonth: "",
          expiryYear: "",
          cardHolderName: "",
          cvvNumber: ""
        }));
      }
      setCurrentStep((prev) => prev - 1);
    }
  };

  const createPaymentAndSendOTP = async () => {
    try {
      setIsSubmitting(true);
      const requestData = {
        ...formData,
        paymentType: paymentType,
        saveCardDetails: saveCardDetails
      };
      console.log('Sending payment data to backend:', requestData);
      
      const response = await fetch('http://localhost:5001/api/online-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        setPaymentId(result.data.id);
        toast.success("OTP sent to your mobile number");
        setCurrentStep(3);
      } else {
        toast.error(result.message || "Failed to create payment");
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      toast.error("Failed to create payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Verify OTP with backend
      const response = await fetch('http://localhost:5001/api/online-payments/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentId,
          otp: otpCode
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update payment status to completed
        const updateResponse = await fetch(`http://localhost:5001/api/online-payments/${paymentId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'completed' }),
        });

        if (updateResponse.ok) {
          toast.success("Payment successful!");
          setCurrentStep(4); // success screen
          
          // Store payment status in localStorage
          if (formData.bidId) {
            const status = paymentType === 'penalty' ? 'rejected' : 'completed';
            localStorage.setItem(`payment_status_${formData.bidId}`, status);
          }
        } else {
          toast.error("Payment verification failed");
          setCurrentStep(5); // error screen
        }
      } else {
        toast.error(result.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/online-payments/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentId
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("OTP resent successfully");
      } else {
        toast.error(result.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error("Failed to resend OTP");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white p-8 shadow-lg" style={{ borderRadius: "30px", fontFamily: "Poppins" }}>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Online Payment Portal
            </h1>
            
            <div className="space-y-6">
              {!isRegistrationPayment && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                    BID ID
                  </label>
                  <input
                    type="text"
                    name="bidId"
                    value={formData.bidId}
                    onChange={handleInputChange}
                    placeholder="Enter BID ID"
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 outline-none focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                    style={{ borderRadius: "30px" }}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                  Payment Amount (LKR)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  readOnly={isRegistrationPayment}
                  className={`w-full px-4 py-3 border outline-none focus:border-blue-500 ${
                    isRegistrationPayment 
                      ? 'bg-gray-100 cursor-not-allowed' 
                      : 'bg-white'
                  } ${
                    errors.amount 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  style={{ borderRadius: "30px" }}
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
                    {errors.amount}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  placeholder="Enter remarks (optional)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 outline-none resize-none focus:border-blue-500 bg-white"
                  style={{ borderRadius: "30px" }}
                />
              </div>
              
              {/* Show contact number field if not provided in bidderData */}
              {!bidderData?.contactNumber && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                    Contact Number
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="0701354967"
                    maxLength="10"
                    autoComplete="off"
                    className={`w-full px-4 py-3 border outline-none focus:border-blue-500 bg-white ${
                      errors.contactNumber 
                        ? 'border-red-400 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    style={{ borderRadius: "30px" }}
                  />
                  {errors.contactNumber && (
                    <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
                      {errors.contactNumber}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex justify-end gap-4 mt-8">
                <button onClick={goBack} className="px-8 py-2 bg-gray-500 hover:bg-gray-600 text-white transition-colors rounded-lg" style={{ fontFamily: "Poppins" }}>
                  Back
                </button>
                <button onClick={nextStep} className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white transition-colors rounded-lg" style={{ fontFamily: "Poppins" }}>
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="bg-white p-8 shadow-lg" style={{ borderRadius: "30px", fontFamily: "Poppins" }}>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Online Payment Portal
            </h1>
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Card Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                  Card Type
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer" style={{ fontFamily: "Poppins" }}>
                    <input
                      type="radio"
                      name="cardType"
                      value="visa"
                      checked={formData.cardType === "visa"}
                      onChange={handleInputChange}
                      className="mr-2"
                      style={{ accentColor: '#dc2626' }}
                    />
                    VISA
                  </label>
                  <label className="flex items-center cursor-pointer" style={{ fontFamily: "Poppins" }}>
                    <input
                      type="radio"
                      name="cardType"
                      value="mastercard"
                      checked={formData.cardType === "mastercard"}
                      onChange={handleInputChange}
                      className="mr-2"
                      style={{ accentColor: '#dc2626' }}
                    />
                    MasterCard
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="xxxx xxxx xxxx xxxx"
                  maxLength={16}
                  className={`w-full px-4 py-3 border outline-none focus:border-blue-500 bg-white ${
                    errors.cardNumber 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  style={{ borderRadius: "30px" }}
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
                    {errors.cardNumber}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={`${formData.expiryMonth}${formData.expiryMonth ? '/' : ''}${formData.expiryYear}`}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      const month = value.slice(0, 2);
                      const year = value.slice(2, 4);
                      setFormData(prev => ({
                        ...prev,
                        expiryMonth: month,
                        expiryYear: year
                      }));
                      
                      // Validate expiry date
                      if (month.length === 2 && year.length === 2) {
                        const validation = validateExpiryDate(month, year);
                        if (!validation.valid) {
                          setErrors(prev => ({ ...prev, expiryDate: validation.message }));
                        } else {
                          setErrors(prev => ({ ...prev, expiryDate: "" }));
                        }
                      } else {
                        setErrors(prev => ({ ...prev, expiryDate: "" }));
                      }
                    }
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`w-full px-4 py-3 border outline-none focus:border-blue-500 bg-white ${
                    errors.expiryDate 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  style={{ borderRadius: "30px" }}
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
                    {errors.expiryDate}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardHolderName"
                  value={formData.cardHolderName}
                  onChange={handleInputChange}
                  placeholder="Enter cardholder name"
                  className={`w-full px-4 py-3 border outline-none focus:border-blue-500 bg-white ${
                    errors.cardHolderName 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  style={{ borderRadius: "30px" }}
                />
                {errors.cardHolderName && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
                    {errors.cardHolderName}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
                  CVV
                </label>
                <input
                  type="text"
                  name="cvvNumber"
                  value={formData.cvvNumber}
                  onChange={handleInputChange}
                  placeholder="CVV"
                  maxLength={3}
                  className={`w-full px-4 py-3 border outline-none focus:border-blue-500 bg-white ${
                    errors.cvvNumber 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  style={{ borderRadius: "30px" }}
                />
                {errors.cvvNumber && (
                  <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
                    {errors.cvvNumber}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: "Poppins" }}>
                  3 digits on back of your card
                </p>
              </div>
              
              {/* Save Card Details Option */}
              <div className="mt-6">
                <label className="flex items-center cursor-pointer" style={{ fontFamily: "Poppins" }}>
                  <input
                    type="checkbox"
                    checked={saveCardDetails}
                    onChange={(e) => setSaveCardDetails(e.target.checked)}
                    className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">
                    Save card details for future payments
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: "Poppins" }}>
                  Your card details will be securely stored for faster checkout next time
                </p>
              </div>
              
              <div className="flex justify-end gap-4 mt-8">
                <button onClick={prevStep} className="px-8 py-2 bg-gray-500 hover:bg-gray-600 text-white transition-colors rounded-lg" style={{ fontFamily: "Poppins" }}>
                  Back
                </button>
                <button onClick={nextStep} className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white transition-colors rounded-lg" style={{ fontFamily: "Poppins" }}>
                  Next
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="bg-white p-8 shadow-lg" style={{ borderRadius: "30px", fontFamily: "Poppins" }}>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Online Payment Portal
            </h1>
            
            <div className="space-y-6 text-center">
              <div className="bg-blue-50 p-6 rounded-[20px]">
                <h2 className="text-2xl font-bold text-blue-800 mb-4" style={{ fontFamily: "Poppins" }}>
                  Verify Your Payment
                </h2>
                <p className="text-gray-700 mb-4" style={{ fontFamily: "Poppins" }}>
                  We have sent a text message with OTP code to your contact number ending with {formData.contactNumber.slice(-4)} for the transaction performed on {formData.cardNumber.slice(0, 4)} xxxx xxxx {formData.cardNumber.slice(-4)}. You are paying merchant ikmangems.lk the amount of LKR {formData.amount} on {new Date().toLocaleString()}.
                </p>
                <label className="block mb-3 font-medium text-gray-700" style={{ fontFamily: "Poppins" }}>
                  Enter your OTP code:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full max-w-xs px-4 py-3 border border-gray-300 outline-none focus:border-blue-500 bg-white text-center text-lg mx-auto"
                  style={{ borderRadius: "30px" }}
                />
                <div className="flex justify-center space-x-4 mt-6">
                  <button 
                    onClick={handleResendOTP}
                    className="px-4 py-1.5 bg-gray-500 hover:bg-gray-600 text-white transition-colors rounded-lg text-sm" 
                    style={{ fontFamily: "Poppins" }}
                  >
                    RESEND
                  </button>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white transition-colors rounded-lg text-sm"
                    style={{ fontFamily: "Poppins" }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-8 py-2 text-white transition-colors rounded-lg ${
                    isSubmitting 
                      ? 'bg-blue-300 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  style={{ fontFamily: "Poppins" }}
                >
                  {isSubmitting ? "Verifying..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col justify-center items-center p-6" style={{ fontFamily: "Poppins" }}>
            <div className="bg-white p-10 max-w-md mx-4 text-center relative shadow-2xl" style={{ borderRadius: "30px", fontFamily: "Poppins" }}>
              <button 
                onClick={clearAllData}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
              <div className="text-6xl mb-6" style={{ color: '#10B981' }}>
                ✔️
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Payment Successful!
              </h2>
              <div className="bg-green-50 p-6 rounded-[20px] text-green-700 mb-8" style={{ fontFamily: "Poppins" }}>
                <p className="mb-2">Your payment has been processed successfully.</p>
                <p className="font-semibold">Confirmation email has been sent to: {formData.emailAddress}</p>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-red-600" style={{ fontFamily: "Poppins" }}>
              Payment Failed
            </h1>
            <div className="bg-red-50 p-6 rounded-[20px] text-red-700" style={{ fontFamily: "Poppins" }}>
              <p>We're sorry, but your payment could not be processed.</p>
              <p>Please check your card details and try again.</p>
            </div>
            <button onClick={() => setCurrentStep(1)} className="px-8 py-3 bg-blue-500 text-white rounded-[30px]" style={{ fontFamily: "Poppins" }}>
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col justify-center items-center p-6" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-3xl w-full">{renderStepContent()}</div>
      
    </div>
  );
};

export default OnlinePayment;
