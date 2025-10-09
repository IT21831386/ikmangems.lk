/*import React, { useState } from 'react';
import { Check, Circle, Lock, Mail, CreditCard, FileText, Building2, Wallet, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VerificationCenter= () => {
  const [currentStep, setCurrentStep] = useState(6);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const navigate = useNavigate();
  
  // Check for payment completion on component mount - Updated: 2024
  useEffect(() => {
    const checkPaymentStatus = () => {
      // Check localStorage for registration payment status
      const registrationPaymentStatus = localStorage.getItem('payment_status_REGISTRATION');
      if (registrationPaymentStatus === 'completed') {
        setPaymentStatus('completed');
        setCompletedSteps(prev => new Set([...prev, 6])); // Mark step 6 as completed
        setCurrentStep(7); // Move to next step (Platform Review)
        // Clear the payment status from localStorage
        localStorage.removeItem('payment_status_REGISTRATION');
      }
    };

    checkPaymentStatus();
    
    // Also check periodically in case user returns from payment
    const interval = setInterval(checkPaymentStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const steps = [
    {
      id: 1,
      name: 'Create Account',
      description: 'Set up your basic seller profile',
      details: ['Name, email, password', 'Contact information', 'Shop name'],
      icon: Circle,
      time: '2 min',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Verify Email',
      description: 'Confirm ownership of your email',
      details: ['Verification link sent', 'Click to confirm', 'One-time code'],
      icon: Mail,
      time: '2 min',
      status: 'current'
    },
    {
      id: 3,
      name: 'Verify Identity',
      description: 'Submit your ID documents',
      details: ['Government-issued ID', 'NIC, Passport, or License', 'Clear photo required'],
      icon: FileText,
      time: '5 min',
      status: 'upcoming'
    },
    {
      id: 4,
      name: 'Verify Business',
      description: 'Upload business documents (if applicable)',
      details: ['Business registration', 'Tax ID number', 'Licenses & permits'],
      icon: Building2,
      time: '5 min',
      status: 'upcoming',
      optional: true
    },
    {
      id: 5,
      name: 'Setup Payout Method',
      description: 'Add your bank account details',
      details: ['Bank account info', 'Verification deposit', 'Multiple options supported'],
      icon: Wallet,
      time: '3 min',
      status: 'upcoming'
    },
    {
      id: 6,
      name: 'Pay Registration Fee',
      description: 'Complete platform fee payment',
      details: ['Secure payment gateway', 'Multiple payment options', 'One-time fee'],
      icon: CreditCard,
      time: '2 min',
      status: 'upcoming'
    },
    {
      id: 7,
      name: 'Platform Review',
      description: 'We verify your documents',
      details: ['Admin verification', 'Document review', 'Account activation'],
      icon: CheckCircle2,
      time: '1-3 business days',
      status: 'upcoming'
    }
  ];

  const getStepStatus = (step) => {
    if (completedSteps.has(step.id)) return 'completed';
    if (step.id === currentStep) return 'current';
    return 'upcoming';
  };

  const handleStepAction = (step) => {
    // Don't allow action on completed steps
    if (completedSteps.has(step.id)) {
      return;
    }
    
    if (step.id === 6 && step.name === 'Pay Registration Fee') {
      // Navigate to payment form for registration fee
      navigate('/payment-form?type=registration');
    } else if (step.id === 7 && step.name === 'Platform Review') {
      // Platform review is handled by admin, just show message
      alert('Your documents are under review. You will be notified once the review is complete.');
    } else {
      // Default behavior for other steps
      setCurrentStep(currentStep + 1);
    }
  };

  const StatusIcon = ({ step }) => {
    const status = getStepStatus(step);
    const Icon = step.icon;
    
    if (status === 'completed') {
      return (
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      );
    }
    
    if (status === 'current') {
      return (
        <div className="w-9 h-9 rounded-full bg-gray-500 flex items-center justify-center animate-pulse">
          <Icon className="w-3 h-3 text-white" />
        </div>
      );
    }
    
    return (
      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
        <Icon className="w-3 h-3 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-left mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Complete these steps to start selling on our platform
          </h1>
          
        </div>

      
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {currentStep - 1} of {steps.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

       
        <div className="space-y-6">
          {steps.map((step, index) => {
            const status = getStepStatus(step);
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="relative">
                
                {!isLast && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 -mb-6" />
                )}
                
                
                <div 
                  className={`relative bg-white rounded-xl border-0 transition-all duration-300 ${
                    status === 'completed' 
                      ? 'hover:shadow-md' 
                      : status === 'current'
                      ? 'border-blue-400 shadow-lg hover:shadow-xl'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                     
                      <StatusIcon step={step} />
                      
                    
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-xl font-semibold ${
                            status === 'current' ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {step.name}
                          </h3>
                          {step.optional && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                              Optional
                            </span>
                          )}
                          <span className="ml-auto text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.time}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        
                        
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                        
                    
                        {status === 'current' && (
                          <button 
                            onClick={() => handleStepAction(step)}
                            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
                          >
                            {step.id === 6 && step.name === 'Pay Registration Fee' 
                              ? (paymentStatus === 'completed' ? 'Payment Completed' : 'Pay Registration Fee')
                              : step.id === 7 && step.name === 'Platform Review'
                              ? 'Under Review'
                              : 'Continue'
                            }
                          </button>
                        )}
                        
                        {status === 'completed' && (
                          <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-medium">
                            <Check className="w-4 h-4" />
                            Completed
                          </div>
                        )}
                        
                        {status === 'upcoming' && (
                          <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
                            <Lock className="w-4 h-4" />
                            Complete previous steps to unlock
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      
        <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Status Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-700">Completed</span>
            </div>
            {/*<div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Circle className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-700">Current Step</span>
          
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-700">Upcoming</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationCenter;*/


import React, { useState, useEffect } from 'react';
import { Check, Circle, Lock, Mail, CreditCard, FileText, Building2, Wallet, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VerificationCenter = () => {
  const [nicStatus, setNicStatus] = useState('not_uploaded');
  const [businessStatus, setBusinessStatus] = useState('not_uploaded');
  const [payoutStatus, setPayoutStatus] = useState('not_completed');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [reviewStatus, setReviewStatus] = useState('not_started');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserVerificationStatus();
  }, []);

  // Add refresh functionality
  const refreshStatus = () => {
    fetchUserVerificationStatus();
  };

  const fetchUserVerificationStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/verification/status', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setNicStatus(data.data.nicStatus || 'not_uploaded');
        setBusinessStatus(data.data.businessStatus || 'not_uploaded');
        setPayoutStatus(data.data.payoutStatus || 'not_completed');
        setPaymentStatus(data.data.registrationPaymentStatus || 'unpaid');
        setReviewStatus(data.data.sellerVerificationStatus || 'not_started');
      }
    } catch (err) {
      console.error('Failed to fetch verification status:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      id: 1,
      name: 'Create Account',
      description: 'Set up your basic seller profile',
      details: ['Name, email, password', 'Contact information', 'Shop name'],
      icon: Circle,
      time: '2 min',
      isRequired: true
    },
    {
      id: 2,
      name: 'Verify Email',
      description: 'Confirm ownership of your email',
      details: ['Verification link sent', 'Click to confirm', 'One-time code'],
      icon: Mail,
      time: '2 min',
      isRequired: true
    },
    {
      id: 3,
      name: 'Verify Identity (NIC)',
      description: 'Submit your ID documents',
      details: ['Government-issued ID', 'NIC, Passport, or License', 'Clear photo required'],
      icon: FileText,
      time: '5 min',
      isRequired: true,
      getStatus: () => nicStatus
    },
    {
      id: 4,
      name: 'Verify Business',
      description: 'Upload business documents (Optional)',
      details: ['Business registration', 'Tax ID number', 'Licenses & permits'],
      icon: Building2,
      time: '5 min',
      isRequired: false,
      getStatus: () => businessStatus
    },
    {
      id: 5,
      name: 'Setup Payout Method',
      description: 'Add your bank account details',
      details: ['Bank account info', 'Verification deposit', 'Multiple options supported'],
      icon: Wallet,
      time: '3 min',
      isRequired: true,
      getStatus: () => payoutStatus === 'completed' ? 'approved' : payoutStatus === 'not_completed' ? 'not_uploaded' : payoutStatus
    },
    {
      id: 6,
      name: 'Pay Registration Fee',
      description: 'Complete platform fee payment',
      details: ['Secure payment gateway', 'Multiple payment options', 'One-time fee'],
      icon: CreditCard,
      time: '2 min',
      isRequired: true,
      getStatus: () => paymentStatus === 'paid' ? 'approved' : paymentStatus === 'unpaid' ? 'not_uploaded' : paymentStatus
    },
    {
      id: 7,
      name: 'Platform Review',
      description: 'We verify your documents',
      details: ['Admin verification', 'Document review', 'Account activation'],
      icon: CheckCircle2,
      time: '1-3 business days',
      isRequired: true,
      getStatus: () => {
        if (reviewStatus === 'verified') return 'approved';
        if (reviewStatus === 'in_review') return 'pending';
        if (reviewStatus === 'rejected') return 'rejected';
        return 'not_uploaded';
      }
    }
  ];

  const getStepStatus = (step) => {
    // Step 1 & 2 are always completed
    if (step.id <= 2) return 'completed';
    
    // For steps with dynamic status
    if (step.getStatus) {
      const status = step.getStatus();
      if (status === 'approved' || status === 'paid' || status === 'completed' || status === 'skipped') return 'completed';
      if (status === 'pending' || status === 'in_review') return 'pending';
      if (status === 'rejected') return 'rejected';
      if (status === 'not_uploaded' || status === 'unpaid' || status === 'not_completed' || status === 'not_started') {
        return step.isRequired ? 'available' : 'skippable';
      }
    }
    
    return 'available';
  };

  const StatusIcon = ({ step }) => {
    const status = getStepStatus(step);
    const Icon = step.icon;
    
    if (status === 'completed') {
      return (
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      );
    }
    
    if (status === 'pending') {
      return (
        <div className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center">
          <Clock className="w-3 h-3 text-white animate-pulse" />
        </div>
      );
    }
    
    if (status === 'rejected') {
      return (
        <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center">
          <XCircle className="w-3 h-3 text-white" />
        </div>
      );
    }
    
    if (status === 'skippable') {
      return (
        <div className="w-9 h-9 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center">
          <Icon className="w-3 h-3 text-purple-600" />
        </div>
      );
    }
    
    if (status === 'available') {
      return (
        <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
          <Icon className="w-3 h-3 text-blue-600" />
        </div>
      );
    }
    
    return (
      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
        <Icon className="w-3 h-3 text-gray-400" />
      </div>
    );
  };

  const handleSkipBusiness = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/verification/skip-business', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setBusinessStatus('skipped');
        await fetchUserVerificationStatus();
      }
    } catch (err) {
      console.error('Failed to skip business verification:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Clock className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const completedSteps = steps.filter(s => {
    const status = getStepStatus(s);
    return status === 'completed';
  }).length;

  const requiredSteps = steps.filter(s => s.isRequired).length;
  const completedRequiredSteps = steps.filter(s => {
    if (!s.isRequired) return false;
    const status = getStepStatus(s);
    return status === 'completed';
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-left mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Complete Your Seller Verification
              </h1>
              <p className="text-gray-600">
                Complete all required steps in any order. {completedRequiredSteps} of {requiredSteps} required steps completed.
              </p>
            </div>
            <button
              onClick={refreshStatus}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Refresh Status
            </button>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Required Steps Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {completedRequiredSteps} of {requiredSteps} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedRequiredSteps / requiredSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const status = getStepStatus(step);
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="relative">
                {!isLast && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 -mb-6" />
                )}
                
                <div 
                  className={`relative bg-white rounded-xl border-2 transition-all duration-300 ${
                    status === 'completed' 
                      ? 'border-green-200 hover:shadow-md' 
                      : status === 'available'
                      ? 'border-blue-400 shadow-lg hover:shadow-xl'
                      : status === 'pending'
                      ? 'border-yellow-400 shadow-md'
                      : status === 'rejected'
                      ? 'border-red-400 shadow-md'
                      : status === 'skippable'
                      ? 'border-purple-200 hover:shadow-md'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <StatusIcon step={step} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-xl font-semibold ${
                            status === 'available' || status === 'skippable' ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {step.name}
                          </h3>
                          {!step.isRequired && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              Optional
                            </span>
                          )}
                          {step.isRequired && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              Required
                            </span>
                          )}
                          <span className="ml-auto text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.time}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                        
                        {/* NIC Verification - Step 3 */}
                        {step.id === 3 && (status === 'available' || status === 'rejected') && (
                          <div className="mt-4">
                            <a
                              href="/upload-nic"
                              className={`inline-block px-6 py-2 ${
                                status === 'rejected' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                              } text-white font-medium rounded-lg transition-colors duration-200`}
                            >
                              {status === 'rejected' ? 'Resubmit NIC Documents' : 'Upload NIC Documents'}
                            </a>
                          </div>
                        )}
                        
                        {/* Business Verification - Step 4 */}
                        {step.id === 4 && (status === 'available' || status === 'skippable' || status === 'rejected') && (
                          <div className="mt-4 flex gap-3">
                            <a
                              href="/upload-business"
                              className={`inline-block px-6 py-2 ${
                                status === 'rejected' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                              } text-white font-medium rounded-lg transition-colors duration-200`}
                            >
                              {status === 'rejected' ? 'Resubmit Business Documents' : 'Upload Business Documents'}
                            </a>
                            {!step.isRequired && status !== 'rejected' && (
                              <button
                                onClick={handleSkipBusiness}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                              >
                                Skip This Step
                              </button>
                            )}
                          </div>
                        )}
                        
                        {/* Payout Setup - Step 5 */}
                        {step.id === 5 && (status === 'available' || status === 'rejected') && (
                          <div className="mt-4">
                            <a
                              href="/setup-payout-method"
                              className={`inline-block px-6 py-2 ${
                                status === 'rejected' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                              } text-white font-medium rounded-lg transition-colors duration-200`}
                            >
                              {status === 'rejected' ? 'Update Payout Method' : 'Setup Payout Method'}
                            </a>
                          </div>
                        )}
                        
                        {/* Payment - Step 6 */}
                        {step.id === 6 && (status === 'available' || status === 'rejected') && (
                          <div className="mt-4">
                            <button
                              onClick={() => navigate('/payment-form?type=registration')}
                              className={`inline-block px-6 py-2 ${
                                status === 'rejected' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                              } text-white font-medium rounded-lg transition-colors duration-200`}
                            >
                              {status === 'rejected' ? 'Retry Payment' : 'Pay Registration Fee'}
                            </button>
                          </div>
                        )}

                        
                        {/* Pending Status */}
                        {status === 'pending' && (
                          <div className="mt-4 flex items-center gap-2 text-yellow-600 text-sm font-medium">
                            <Clock className="w-4 h-4 animate-pulse" />
                            {step.id === 7 ? 'Under Admin Review' : 'Documents submitted - Under Review'}
                          </div>
                        )}
                        
                        {/* Completed Status */}
                        {status === 'completed' && (
                          <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-medium">
                            <Check className="w-4 h-4" />
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Status Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-700">Completed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                <Circle className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-700">Pending</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-700">Rejected</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-700">Optional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationCenter;