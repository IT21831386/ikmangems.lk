import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import OnlinePayment from './onlinepayment';

const PaymentForm = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState("home"); // home, bank, online
  const [paymentStatus, setPaymentStatus] = useState(""); // pending, confirmed, etc.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(""); // bank or online
  const [paymentType, setPaymentType] = useState("order"); // order or penalty
  const [penaltyData, setPenaltyData] = useState(null);
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
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  // Check URL parameters on component mount
  useEffect(() => {
    const type = searchParams.get('type');
    const bidId = searchParams.get('bidId');
    const amount = searchParams.get('amount');
    
    if (type === 'penalty' && bidId && amount) {
      setPaymentType('penalty');
      setPenaltyData({
        bidId: bidId,
        originalAmount: parseFloat(amount),
        penaltyAmount: Math.round(parseFloat(amount) * 0.15)
      });
      // Pre-fill amount with penalty amount
      setFormData(prev => ({
        ...prev,
        auctionId: bidId,
        amount: Math.round(parseFloat(amount) * 0.15).toString(),
        remark: `Penalty fee for bid rejection - Bid ID: ${bidId}`
      }));
    } else if (bidId) {
      // Pre-fill BID ID for regular payment
      setFormData(prev => ({
        ...prev,
        auctionId: bidId
      }));
    }
  }, [searchParams]);

  const sriLankanBanks = [
    "Bank of Ceylon",
    "Commercial Bank",
    "Sampath Bank",
    "Hatton National Bank"
  ];

  // Validation functions
  const validateEmail = (email) => {
    // Check for spaces
    if (email.includes(' ')) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check for exactly one @ symbol
    const atCount = (email.match(/@/g) || []).length;
    if (atCount === 0) {
      return { valid: false, message: "Enter a valid email" };
    }
    if (atCount > 1) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Split email into local and domain parts
    const parts = email.split('@');
    const localPart = parts[0];
    const domainPart = parts[1];
    
    // Check local part (before @)
    if (!localPart || localPart.length === 0) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check domain part (after @)
    if (!domainPart || domainPart.length === 0) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check for valid characters in local part: letters, numbers, dots, underscores, hyphens
    const validLocalRegex = /^[a-zA-Z0-9._-]+$/;
    if (!validLocalRegex.test(localPart)) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check for valid domain format
    const validDomainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!validDomainRegex.test(domainPart)) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check that domain has at least one dot and valid TLD (top-level domain)
    const domainParts = domainPart.split('.');
    if (domainParts.length < 2) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check TLD (last part after last dot)
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check that domain doesn't start or end with dot or hyphen
    if (domainPart.startsWith('.') || domainPart.endsWith('.') || 
        domainPart.startsWith('-') || domainPart.endsWith('-')) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check that local part doesn't start or end with dot
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check for consecutive dots
    if (email.includes('..')) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Enhanced domain validation - check for valid domain structure
    const domainName = domainParts.slice(0, -1).join('.');
    if (!domainName || domainName.length === 0) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check domain name doesn't start or end with hyphen
    if (domainName.startsWith('-') || domainName.endsWith('-')) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check for consecutive hyphens in domain name
    if (domainName.includes('--')) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check for valid TLD length (2-63 characters)
    if (tld.length < 2 || tld.length > 63) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    // Check for common valid TLDs (basic validation)
    const commonTlds = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'uk', 'ca', 'au', 'de', 'fr', 'jp', 'in', 'lk', 'io', 'me', 'tv', 'cc', 'info', 'biz', 'name', 'pro', 'aero', 'coop', 'museum'];
    const isValidTld = commonTlds.includes(tld.toLowerCase()) || tld.length >= 2;
    
    if (!isValidTld) {
      return { valid: false, message: "Enter a valid email" };
    }
    
    return { valid: true, message: "" };
  };

  const validateContactNumber = (contact) => {
    // Check if contains non-numeric characters
    if (!/^\d+$/.test(contact)) {
      return { valid: false, message: "Enter a valid phone number" };
    }
    
    // Check if exactly 10 digits
    if (contact.length !== 10) {
      return { valid: false, message: "Enter a valid phone number" };
    }
    
    // Check if starts with 0
    if (!contact.startsWith('0')) {
      return { valid: false, message: "Enter a valid phone number" };
    }
    
    return { valid: true, message: "" };
  };

  const validateDepositedAmount = (amount) => {
    // Check if empty
    if (!amount.trim()) {
      return { valid: false, message: "Invalid deposited amount" };
    }
    
    // Check if contains only numbers and decimal point (no negative signs, letters, or other characters)
    if (!/^\d+(\.\d+)?$/.test(amount)) {
      return { valid: false, message: "Invalid deposited amount" };
    }
    
    // Check if starts with zero (leading zeros)
    if (amount.startsWith('0') && amount.length > 1 && !amount.startsWith('0.')) {
      return { valid: false, message: "Invalid deposited amount" };
    }
    
    // Convert to number and check if zero, negative, or less than 1000
    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      return { valid: false, message: "Invalid deposited amount" };
    }
    if (numAmount < 1000) {
      return { valid: false, message: "Minimum deposited amount is 1000" };
    }
    
    return { valid: true, message: "" };
  };

  // Full name validation
  const validateFullName = (name) => {
    if (!name || name.trim().length < 2) {
      return { valid: false, message: "Invalid input" };
    }
    
    if (name.trim().length > 100) {
      return { valid: false, message: "Invalid input" };
    }
    
    // Allow letters, spaces, hyphens, apostrophes, and periods
    if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
      return { valid: false, message: "Invalid input" };
    }
    
    return { valid: true, message: "" };
  };

  // Billing address validation
  const validateBillingAddress = (address) => {
    if (!address || address.trim().length < 5) {
      return { valid: false, message: "Invalid input" };
    }
    
    if (address.trim().length > 150) {
      return { valid: false, message: "Invalid input" };
    }
    
    return { valid: true, message: "" };
  };

  // Branch validation - allow letters, numbers, spaces, and hyphens
  const validateBranch = (branch) => {
    if (!branch || branch.trim().length === 0) {
      return { valid: false, message: "Invalid input" };
    }
    
    // Allow letters, numbers, spaces, and hyphens
    if (!/^[a-zA-Z0-9\s\-]+$/.test(branch)) {
      return { valid: false, message: "Invalid input" };
    }
    
    return { valid: true, message: "" };
  };

  // Payment date validation
  const validatePaymentDate = (date) => {
    if (!date) {
      return { valid: false, message: "Invalid input" };
    }
    
    const selectedDate = new Date(date);
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);
    
    // Reset time to start of day for accurate comparison
    selectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    // Check if date is in the future
    if (selectedDate > currentDate) {
      return { valid: false, message: "Payment date cannot be in the future" };
    }
    
    // Check if date is more than 1 week ago
    if (selectedDate < oneWeekAgo) {
      return { valid: false, message: "Payment should be done within one week" };
    }
    
    return { valid: true, message: "" };
  };

  const validateBidderDetails = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else {
      const fullNameValidation = validateFullName(formData.fullName);
      if (!fullNameValidation.valid) {
        errors.fullName = fullNameValidation.message;
      }
    }
    
    if (!formData.emailAddress.trim()) {
      errors.emailAddress = "Email address is required";
    } else {
      const emailValidation = validateEmail(formData.emailAddress);
      if (!emailValidation.valid) {
        errors.emailAddress = emailValidation.message;
      }
    }
    
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = "Contact number is required";
    } else {
      const contactValidation = validateContactNumber(formData.contactNumber);
      if (!contactValidation.valid) {
        errors.contactNumber = contactValidation.message;
      }
    }
    
    if (!formData.billingAddress.trim()) {
      errors.billingAddress = "Billing address is required";
    } else {
      const billingValidation = validateBillingAddress(formData.billingAddress);
      if (!billingValidation.valid) {
        errors.billingAddress = billingValidation.message;
      }
    }
    
    return errors;
  };

  // Handle blur events for validation
  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    
    if (name === 'fullName') {
      if (value.trim() === '') {
        setErrors(prev => ({ ...prev, [name]: '' }));
      } else {
        const fullNameValidation = validateFullName(value);
        if (!fullNameValidation.valid) {
          setErrors(prev => ({ ...prev, [name]: fullNameValidation.message }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
      }
    }
    
    if (name === 'emailAddress') {
      if (value.trim() === '') {
        setErrors(prev => ({ ...prev, [name]: '' }));
      } else {
        const emailValidation = validateEmail(value);
        if (!emailValidation.valid) {
          setErrors(prev => ({ ...prev, [name]: emailValidation.message }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
      }
    }
    
    if (name === 'contactNumber') {
      if (value.trim() === '') {
        setErrors(prev => ({ ...prev, [name]: '' }));
      } else {
        const contactValidation = validateContactNumber(value);
        if (!contactValidation.valid) {
          setErrors(prev => ({ ...prev, [name]: contactValidation.message }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
      }
    }
    
    if (name === 'billingAddress') {
      if (value.trim() === '') {
        setErrors(prev => ({ ...prev, [name]: '' }));
      } else {
        const billingValidation = validateBillingAddress(value);
        if (!billingValidation.valid) {
          setErrors(prev => ({ ...prev, [name]: billingValidation.message }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
      }
    }
    
    if (name === 'branch') {
      if (value.trim() === '') {
        setErrors(prev => ({ ...prev, [name]: '' }));
      } else {
        const branchValidation = validateBranch(value);
        if (!branchValidation.valid) {
          setErrors(prev => ({ ...prev, [name]: branchValidation.message }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
      }
    }
    
    if (name === 'paiddate') {
      if (value.trim() === '') {
        setErrors(prev => ({ ...prev, [name]: '' }));
      } else {
        const dateValidation = validatePaymentDate(value);
        if (!dateValidation.valid) {
          setErrors(prev => ({ ...prev, [name]: dateValidation.message }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Contact number validation - only allow numbers and limit to 10 digits
    if (name === 'contactNumber') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
        // Don't show validation errors while typing
      }
      return;
    }
    
    // Email validation - only validate on blur
    if (name === 'emailAddress') {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Don't show validation errors while typing
      return;
    }
    
    // Branch validation - allow letters, numbers, spaces, and hyphens with auto-capitalization
    if (name === 'branch') {
      // Remove all characters except letters, numbers, spaces, and hyphens
      let filteredValue = value.replace(/[^a-zA-Z0-9\s\-]/g, '');
      
      // Auto-capitalize first letter of each word
      filteredValue = filteredValue.replace(/\b\w/g, (char) => char.toUpperCase());
      
      setFormData((prev) => ({ ...prev, [name]: filteredValue }));
      
      // Validate the branch
      const validation = validateBranch(filteredValue);
      if (!validation.valid && filteredValue.trim() !== '') {
        setErrors(prev => ({ ...prev, [name]: validation.message }));
      } else {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
      return;
    }
    
    // Deposited amount validation - only allow positive numbers and decimal point
    if (name === 'amount') {
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
      const validation = validateDepositedAmount(numericValue);
      if (!validation.valid && numericValue.trim() !== '') {
        setErrors(prev => ({ ...prev, [name]: validation.message }));
      } else {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    // Don't change page immediately, wait for Next button
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload only image files (JPEG, JPG, PNG)");
        // Reset file input
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        // Reset file input
        e.target.value = '';
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
    // Keep payment method selected when going back
    // Don't clear any details when going back from payment portal
    // Keep all form data intact
    setErrors({});
  };

  const clearAllData = () => {
    setCurrentPage("home");
    setPaymentStatus("");
    setPaymentMethod("");
    setFormData({
      fullName: "",
      emailAddress: "",
      contactNumber: "",
      billingAddress: "",
      auctionId: "",
      bank: "",
      branch: "",
      paiddate: "",
      amount: "",
      remark: "",
      slip: null
    });
    setPreviewImage(null);
    setErrors({});
  };

  const handleBankDepositConfirm = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    // Validate required fields
    if (!formData.bank || !formData.branch || !formData.paiddate || !formData.amount || !formData.auctionId) {
      toast.error("Please fill in all required fields including BID ID");
      return;
    }

    if (!formData.slip) {
      toast.error("Please upload a deposit slip");
      return;
    }

    // Validate deposited amount
    const amountValidation = validateDepositedAmount(formData.amount);
    if (!amountValidation.valid) {
      setErrors(prev => ({ ...prev, amount: amountValidation.message }));
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('paiddate', formData.paiddate);
      formDataToSend.append('bank', formData.bank);
      formDataToSend.append('branch', formData.branch);
      formDataToSend.append('remark', formData.remark || '');
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('emailAddress', formData.emailAddress);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('billingAddress', formData.billingAddress);
      formDataToSend.append('auctionId', formData.auctionId);
      formDataToSend.append('paymentType', paymentType);
      formDataToSend.append('slip', formData.slip);

      console.log('Sending bank deposit data:', {
        amount: formData.amount,
        paiddate: formData.paiddate,
        bank: formData.bank,
        branch: formData.branch,
        remark: formData.remark,
        fullName: formData.fullName,
        emailAddress: formData.emailAddress,
        contactNumber: formData.contactNumber,
        billingAddress: formData.billingAddress,
        auctionId: formData.auctionId,
        paymentType: paymentType,
        slip: formData.slip?.name
      });

      const response = await fetch('http://localhost:5001/api/payments', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();
      console.log('Bank deposit response:', result);

      if (response.ok && result.success) {
        toast.success("Bank deposit submitted successfully!");
        setPaymentStatus("pending");
        
          // Store payment status in localStorage with raw bid ID
          if (formData.auctionId) {
            const status = paymentType === 'penalty' ? 'rejected' : 'completed';
            // Extract raw bid ID from formatted ID (BID-013 -> raw ID)
            const bidIdMatch = formData.auctionId.match(/BID-(\d+)/);
            if (bidIdMatch) {
              // We need to find the actual raw bid ID
              // For now, store with formatted ID and we'll handle lookup in auction_details
              localStorage.setItem(`payment_status_${formData.auctionId}`, status);
            } else {
              // This is already a raw bid ID
              localStorage.setItem(`payment_status_${formData.auctionId}`, status);
            }
          }
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

  const renderBidderDetails = (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-l-4 border-blue-500 p-8 rounded-[30px] shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-8" style={{ fontFamily: 'Poppins' }}>
        Bidder Details
      </h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Full Name
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleInputChange} 
            onBlur={handleInputBlur}
            placeholder="Sanjaya Dissanayake" 
            autoComplete="off"
            maxLength={100}
            className={`w-full px-6 py-4 border-2 rounded-[30px] outline-none transition-all duration-300 bg-white ${
              errors.fullName 
                ? 'border-red-400 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-400'
            }`}
            style={{ fontFamily: 'Poppins', fontSize: '16px' }} 
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
              {errors.fullName}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            E-mail Address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text" 
            name="emailAddress" 
            value={formData.emailAddress} 
            onChange={handleInputChange} 
            onBlur={handleInputBlur}
            placeholder="sanjay@example.com" 
            autoComplete="off"
            className={`w-full px-6 py-4 border-2 rounded-[30px] outline-none transition-all duration-300 bg-white ${
              errors.emailAddress 
                ? 'border-red-400 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-400'
            }`}
            style={{ fontFamily: 'Poppins', fontSize: '16px' }} 
          />
          {errors.emailAddress && (
            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
              {errors.emailAddress}
            </p>
          )}
        </div>
        
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
            onBlur={handleInputBlur}
            placeholder="0701354967" 
            maxLength="10"
            autoComplete="off"
            className={`w-full px-6 py-4 border-2 rounded-[30px] outline-none transition-all duration-300 bg-white ${
              errors.contactNumber 
                ? 'border-red-400 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-400'
            }`}
            style={{ fontFamily: 'Poppins', fontSize: '16px' }} 
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
              {errors.contactNumber}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Billing Address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea 
            name="billingAddress" 
            value={formData.billingAddress} 
            onChange={handleInputChange} 
            onBlur={handleInputBlur}
            placeholder="Enter your billing address" 
            maxLength={150}
            className={`w-full px-6 py-4 border-2 rounded-[30px] outline-none resize-none transition-all duration-300 bg-white ${
              errors.billingAddress 
                ? 'border-red-400 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-400'
            }`}
            rows={4} 
            style={{ fontFamily: 'Poppins', fontSize: '16px' }}
          />
          {errors.billingAddress && (
            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
              {errors.billingAddress}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderPaymentMethods = (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Poppins' }}>
        Payment Methods
      </h2>
      
      <div className="space-y-4">
        <label className={`flex items-center p-6 border-2 rounded-[30px] cursor-pointer transition-all duration-300 ${
          paymentMethod === 'bank' 
            ? 'border-teal-500 bg-teal-50 shadow-md' 
            : 'border-gray-200 hover:border-teal-400 hover:bg-teal-50'
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="bank"
            checked={paymentMethod === 'bank'}
            onChange={() => handlePaymentMethodChange('bank')}
            className="w-5 h-5 text-teal-600 mr-4"
          />
          <div className="flex items-center">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-xl">🏦</span>
            </div>
            <span className="font-semibold text-gray-700 text-lg" style={{ fontFamily: 'Poppins' }}>
              Bank Deposit
            </span>
          </div>
        </label>

        <label className={`flex items-center p-6 border-2 rounded-[30px] cursor-pointer transition-all duration-300 ${
          paymentMethod === 'online' 
            ? 'border-red-500 bg-red-50 shadow-md' 
            : 'border-gray-200 hover:border-red-400 hover:bg-red-50'
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="online"
            checked={paymentMethod === 'online'}
            onChange={() => handlePaymentMethodChange('online')}
            className="w-5 h-5 text-red-600 mr-4"
          />
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-xl">💳</span>
        </div>
            <span className="font-semibold text-gray-700 text-lg" style={{ fontFamily: 'Poppins' }}>
              Online Payment
            </span>
        </div>
        </label>
      </div>
      
      {errors.paymentMethod && (
        <p className="text-red-500 text-sm mt-2" style={{ fontFamily: 'Poppins' }}>
          {errors.paymentMethod}
        </p>
      )}

      <div className="flex justify-end mt-8">
        <button 
          onClick={() => {
            // Validate bidder details first
            const bidderErrors = validateBidderDetails();
            if (Object.keys(bidderErrors).length > 0) {
              setErrors(bidderErrors);
              return;
            }
            
            // Check if payment method is selected
            if (!paymentMethod) {
              setErrors({ ...errors, paymentMethod: "Please select a payment method" });
              return;
            }
            
            // Clear any previous errors
            setErrors({});
            setCurrentPage(paymentMethod);
          }}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[30px] transition-all duration-300 shadow-lg transform hover:scale-105"
          style={{ fontFamily: 'Poppins', fontSize: '18px' }}
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderBankDepositPortal = (
    <div className="bg-white p-8 shadow-lg" style={{ borderRadius: "30px", fontFamily: "Poppins" }}>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bank Deposit Portal</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            BID ID
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            name="auctionId" 
            value={formData.auctionId} 
            onChange={handleInputChange} 
            placeholder="Enter BID ID"
            readOnly
            className="w-full px-4 py-3 border border-gray-300 outline-none focus:border-blue-500 bg-gray-100 cursor-not-allowed" 
            style={{ borderRadius: "30px" }} 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Bank
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <select 
              name="bank" 
              value={formData.bank} 
              onChange={handleInputChange} 
              className="w-full px-4 py-3 border border-gray-300 outline-none appearance-none focus:border-blue-500 bg-white" 
              style={{ borderRadius: "30px" }}
            >
              <option value="">Select the bank</option>
              {sriLankanBanks.map((bank, index) => (
                <option key={index} value={bank}>{bank}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Branch
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            name="branch" 
            value={formData.branch} 
            onChange={handleInputChange} 
            onBlur={handleInputBlur}
            placeholder="Enter branch name"
            className={`w-full px-4 py-3 border outline-none focus:border-blue-500 bg-white ${
              errors.branch 
                ? 'border-red-400 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`} 
            style={{ borderRadius: "30px" }} 
          />
          {errors.branch && (
            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
              {errors.branch}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Payment Date
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="date" 
            name="paiddate" 
            value={formData.paiddate} 
            onChange={handleInputChange} 
            onBlur={handleInputBlur}
            className={`w-full px-4 py-3 border outline-none focus:border-blue-500 bg-white ${
              errors.paiddate 
                ? 'border-red-400 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
            }`} 
            style={{ borderRadius: "30px" }} 
          />
          {errors.paiddate && (
            <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins' }}>
              {errors.paiddate}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Poppins' }}>
            Deposited Amount
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text" 
            name="amount" 
            value={formData.amount} 
            onChange={handleInputChange} 
            className={`w-full px-4 py-3 border border-gray-300 outline-none focus:border-blue-500 bg-white ${
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
            rows={3}
            placeholder="Enter remarks (optional)"
            className="w-full px-4 py-3 border border-gray-300 outline-none resize-none focus:border-blue-500 bg-white" 
            style={{ borderRadius: "30px" }} 
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Poppins' }}>
            UPLOAD BANK SLIP
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="border-2 border-dashed border-orange-300 bg-white p-8 text-center" style={{ borderRadius: "30px" }}>
            {previewImage ? (
              <div>
                <img 
                  src={previewImage} 
                  alt="Deposit slip preview" 
                  className="mx-auto max-h-48 mb-4"
                  style={{ borderRadius: "20px" }}
                />
                <button 
                  type="button" 
                  onClick={() => { 
                    setPreviewImage(null); 
                    setFormData(prev => ({ ...prev, slip: null })); 
                  }} 
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600" 
                  style={{ borderRadius: "20px" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="inline-block px-6 py-3 bg-orange-500 text-black font-semibold cursor-pointer hover:bg-orange-600 transition-colors"
                  style={{ borderRadius: "20px", fontFamily: "Poppins" }}
                >
                  Choose File
                </label>
                 <p className="text-gray-600 mt-4" style={{ fontFamily: "Poppins" }}>
                   Select any image - only JPEG/JPG/PNG accepted (max 5 MB)
                 </p>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button 
            type="button" 
            onClick={goBackToHome} 
            className="px-8 py-3 bg-gray-500 text-white hover:bg-gray-600 transition-colors" 
            style={{ borderRadius: "30px", fontFamily: "Poppins" }}
          >
            Back
          </button>
          <button 
            type="button" 
            onClick={handleBankDepositConfirm}
            disabled={isSubmitting}
            className={`px-8 py-3 text-white transition-colors ${
              isSubmitting 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            style={{ borderRadius: "30px", fontFamily: "Poppins" }}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );


  const renderPaymentPendingOverlay = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 bg-opacity-95 flex items-center justify-center z-50" style={{ borderRadius: "30px" }}>
      <div className="bg-white p-10 max-w-md mx-4 text-center relative shadow-2xl" style={{ borderRadius: "30px", fontFamily: "Poppins" }}>
        <button 
          onClick={clearAllData}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>
        <div className="text-6xl mb-6 animate-spin" style={{ color: '#3B82F6' }}>
          ⏳
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Payment Pending
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          We'll Let You Know Once the Payment is Confirmed!
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-white" style={{ fontFamily: 'Poppins' }}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontFamily: 'Poppins',
            borderRadius: '30px',
          },
        }}
      />
      <div className="flex justify-center">
        {/* Centered Form */}
        <div className="w-full max-w-4xl">
          {currentPage === "home" && (
            <div className="bg-white rounded-[30px] p-8 shadow-xl border border-gray-100">
              <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center" style={{ fontFamily: 'Poppins' }}>
                {paymentType === 'penalty' ? 'Penalty Payment Form' : 'Custom Order Form'}
              </h1>
              
              {/* Penalty Payment Info */}
              {paymentType === 'penalty' && penaltyData && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-red-800 mb-3">Penalty Payment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600 mb-1">Original Bid Amount</p>
                        <p className="text-xl font-bold text-gray-900">
                          LKR {penaltyData.originalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-red-600 mb-1">Penalty Fee (15%)</p>
                        <p className="text-xl font-bold text-red-600">
                          LKR {penaltyData.penaltyAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {renderBidderDetails}
              {renderPaymentMethods}
            </div>
          )}
          {currentPage === "bank" && (
            <div className="relative">
              {renderBankDepositPortal}
              {/* Payment Pending Overlay - only show on bank deposit page */}
              {paymentStatus === "pending" && renderPaymentPendingOverlay()}
        </div>
          )}
          {currentPage === "online" && (
            <OnlinePayment 
              goBack={goBackToHome}
              clearAllData={clearAllData}
              paymentType={paymentType}
              penaltyData={penaltyData}
              bidderData={{
                fullName: formData.fullName,
                emailAddress: formData.emailAddress,
                contactNumber: formData.contactNumber,
                billingAddress: formData.billingAddress,
                auctionId: formData.auctionId,
                amount: formData.amount,
                remark: formData.remark
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;