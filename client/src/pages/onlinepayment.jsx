import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const OnlinePayment = ({ goBack }) => {
  const [formData, setFormData] = useState({
    auctionId: "",
    amount: "",
    remark: "",
    cardType: "visa",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cardHolderName: "",
    cvvNumber: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString().slice(2));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    // Validation per step
    if (currentStep === 1) {
      if (!formData.auctionId || !formData.amount) {
        toast.error("Please fill in Auction ID and Payment Amount");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cardHolderName) {
        toast.error("Please fill in all card details");
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.cvvNumber) {
        toast.error("Please enter CVV");
        return;
      }
    }
    if (currentStep === 3) {
      // Generate OTP and move to step 4
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      toast.success(`OTP sent to your registered mobile: ${otp}`); // For demo/testing
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Verify OTP
    if (otpCode !== generatedOtp) {
      toast.error("Invalid OTP. Please try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Send payment data to backend API
      const response = await fetch('http://localhost:5001/api/online-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Payment successful!");
        setCurrentStep(6); // success screen
      } else {
        toast.error(result.message || "Payment failed");
        setCurrentStep(7); // error screen
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment failed. Please try again.");
      setCurrentStep(7); // error screen
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Poppins" }}>
              Online Payment
            </h1>
            <h3 className="text-xl font-bold text-blue-800 mb-4" style={{ fontFamily: "Poppins" }}>
              Step 1: Payment Details
            </h3>
            <div>
              <label className="block mb-2 text-gray-700" style={{ fontFamily: "Poppins" }}>
                Auction ID <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="auctionId"
                value={formData.auctionId}
                onChange={handleInputChange}
                placeholder="Enter Auction ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-[30px] outline-none"
                style={{ fontFamily: "Poppins" }}
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700" style={{ fontFamily: "Poppins" }}>
                Payment Amount (LKR) <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-[30px] outline-none"
                style={{ fontFamily: "Poppins" }}
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700" style={{ fontFamily: "Poppins" }}>
                Remark
              </label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                placeholder="Additional remarks"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-[30px] resize-none outline-none"
                style={{ fontFamily: "Poppins" }}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={prevStep} disabled className="px-8 py-3 bg-gray-400 text-white rounded-[30px] cursor-not-allowed" style={{ fontFamily: "Poppins" }}>
                Back
              </button>
              <button onClick={nextStep} className="px-8 py-3 bg-blue-500 text-white rounded-[30px]" style={{ fontFamily: "Poppins" }}>
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Poppins" }}>
              Online Payment
            </h1>
            <h3 className="text-xl font-bold text-blue-800 mb-4" style={{ fontFamily: "Poppins" }}>
              Step 2: Card Details
            </h3>
            <div>
              <label className="block mb-2 text-gray-700" style={{ fontFamily: "Poppins" }}>
                Card Type <span style={{ color: "red" }}>*</span>
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
                  />
                  MasterCard
                </label>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-gray-700" style={{ fontFamily: "Poppins" }}>
                Card Number <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="Enter card number"
                maxLength={19}
                className="w-full px-4 py-3 border border-gray-300 rounded-[30px] outline-none"
                style={{ fontFamily: "Poppins" }}
                onInput={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  e.target.value = value.match(/.{1,4}/g)?.join(" ") || "";
                  setFormData((prev) => ({ ...prev, cardNumber: e.target.value }));
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-gray-700" style={{ fontFamily: "Poppins" }}>
                  Expiry Month <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-[30px] outline-none"
                  style={{ fontFamily: "Poppins" }}
                >
                  <option value="">MM</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-gray-700" style={{ fontFamily: "Poppins" }}>
                  Expiry Year <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-[30px] outline-none"
                  style={{ fontFamily: "Poppins" }}
                >
                  <option value="">YY</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-gray-700" style={{ fontFamily: "Poppins" }}>
                  Cardholder Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="cardHolderName"
                  value={formData.cardHolderName}
                  onChange={handleInputChange}
                  placeholder="Enter cardholder name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-[30px] outline-none"
                  style={{ fontFamily: "Poppins" }}
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="px-8 py-3 bg-gray-500 text-white rounded-[30px]" style={{ fontFamily: "Poppins" }}>
                Previous
              </button>
              <button onClick={nextStep} className="px-8 py-3 bg-blue-500 text-white rounded-[30px]" style={{ fontFamily: "Poppins" }}>
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Poppins" }}>
              Online Payment
            </h1>
            <h3 className="text-xl font-bold text-blue-800 mb-6" style={{ fontFamily: "Poppins" }}>
              Step 3: Security Code
            </h3>
            <p className="mb-4 text-gray-700" style={{ fontFamily: "Poppins" }}>
              Please enter the 3-digit security code (CVV) from the back of your card
            </p>
            <input
              type="text"
              name="cvvNumber"
              value={formData.cvvNumber}
              onChange={handleInputChange}
              placeholder="CVV"
              maxLength={4}
              className="w-1/4 mx-auto px-4 py-3 border border-gray-300 rounded-[30px] text-center outline-none"
              style={{ fontFamily: "Poppins" }}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
                setFormData((prev) => ({ ...prev, cvvNumber: e.target.value }));
              }}
            />
            <p className="mt-2 text-xs text-gray-500" style={{ fontFamily: "Poppins" }}>
              3 digits on back of your card
            </p>
            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="px-8 py-3 bg-gray-500 text-white rounded-[30px]" style={{ fontFamily: "Poppins" }}>
                Previous
              </button>
              <button onClick={nextStep} className="px-8 py-3 bg-green-600 text-white rounded-[30px]" style={{ fontFamily: "Poppins" }}>
                Pay Now
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Poppins" }}>
              Online Payment
            </h1>
            <h3 className="text-xl font-bold text-blue-800 mb-4" style={{ fontFamily: "Poppins" }}>
              Step 4: Order Review
            </h3>
            <div className="bg-blue-50 p-6 rounded-[20px]">
              <h4 className="font-semibold text-blue-800 mb-4" style={{ fontFamily: "Poppins" }}>
                Payment Details
              </h4>
              <div className="flex items-center mb-4 space-x-4">
                <div className="w-8 h-8 bg-orange-500 rounded"></div>
                <div className="w-8 h-8 bg-blue-600 rounded"></div>
                <span className="text-sm" style={{ fontFamily: "Poppins" }}>
                  Ending in {formData.cardNumber.slice(-4)}
                </span>
              </div>
              <p className="text-gray-700 mb-4" style={{ fontFamily: "Poppins" }}>
                Auction Payment - {formData.remark || "Gemstone Purchase"}
              </p>
              <p className="text-2xl font-bold text-blue-800" style={{ fontFamily: "Poppins" }}>
                TOTAL: LKR Rs {formData.amount}
              </p>
              <p className="mt-6 p-4 bg-white rounded-[20px] text-sm text-gray-600" style={{ fontFamily: "Poppins" }}>
                The next screen you see may be payment card verification through your card issuer.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button onClick={prevStep} className="px-8 py-3 bg-gray-500 text-white rounded-[30px]" style={{ fontFamily: "Poppins" }}>
                Previous
              </button>
              <button onClick={nextStep} className="px-8 py-3 bg-green-600 text-white rounded-[30px]" style={{ fontFamily: "Poppins" }}>
                Confirm & Pay
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Poppins" }}>
              Online Payment
            </h1>
            <h3 className="text-xl font-bold text-blue-800 mb-4" style={{ fontFamily: "Poppins" }}>
              Step 5: OTP Verification
            </h3>
            <div className="bg-blue-50 p-6 rounded-[20px]">
              <p className="text-gray-700 mb-4" style={{ fontFamily: "Poppins" }}>
                We have sent a text message with OTP code to your registered mobile number.
              </p>
              <p className="text-gray-700 mb-6" style={{ fontFamily: "Poppins" }}>
                For the transaction performed on card ending {formData.cardNumber.slice(-4)}. You are paying merchant ikmangems.lk the amount of LKR {formData.amount}.
              </p>
              <label className="block mb-2 font-medium text-gray-700" style={{ fontFamily: "Poppins" }}>
                Enter your OTP code below:
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter OTP"
                className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-[30px] text-center text-lg outline-none mx-auto"
                style={{ fontFamily: "Poppins" }}
              />
              <div className="flex justify-center space-x-4 mt-6">
                <button className="px-6 py-2 bg-gray-500 text-white rounded-[30px]" style={{ fontFamily: "Poppins" }}>
                  RESEND
                </button>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 bg-red-500 text-white rounded-[30px]"
                  style={{ fontFamily: "Poppins" }}
                >
                  CANCEL
                </button>
              </div>
              <p className="mt-4 text-xs text-gray-500" style={{ fontFamily: "Poppins" }}>
                This page will automatically timeout after 7 minutes.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-[30px] text-white ${isSubmitting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                style={{ fontFamily: "Poppins" }}
              >
                {isSubmitting ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="text-center space-y-6">
            <div className="text-green-500 text-6xl mb-4">✔️</div>
            <h1 className="text-3xl font-bold text-green-600" style={{ fontFamily: "Poppins" }}>
              Payment Successful!
            </h1>
            <div className="bg-green-50 p-6 rounded-[20px] text-green-700" style={{ fontFamily: "Poppins" }}>
              <p>Transaction ID: TXN{Date.now()}</p>
              <p>Amount Paid: LKR {formData.amount}</p>
              <p>Auction ID: {formData.auctionId}</p>
              <p>Your payment has been processed successfully. You will receive a confirmation email shortly.</p>
            </div>
          </div>
        );
      case 7:
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
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6" style={{ fontFamily: "Poppins" }}>
      <div className="max-w-3xl w-full">{renderStepContent()}</div>
      {goBack && (
        <button
          onClick={goBack}
          className="mt-6 px-8 py-3 bg-gray-300 text-gray-700 rounded-[30px]"
          style={{ fontFamily: "Poppins" }}
        >
          Cancel / Back to Order Form
        </button>
      )}
      <Toaster position="top-right" />
    </div>
  );
};

export default OnlinePayment;
