/*import React, { useState } from 'react';
import { Check, Circle, Lock, Mail, CreditCard, FileText, Building2, Wallet, CheckCircle2, Clock } from 'lucide-react';

const VerificationCenter= () => {
  const [currentStep, setCurrentStep] = useState(2);
  
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
    if (step.id < currentStep) return 'completed';
    if (step.id === currentStep) return 'current';
    return 'upcoming';
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
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
                          >
                            Continue
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
import { Check, Circle, Lock, Mail, CreditCard, FileText, Building2, Wallet, CheckCircle2, Clock } from 'lucide-react';

const VerificationCenter = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [nicStatus, setNicStatus] = useState('not_uploaded');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserVerificationStatus();
  }, []);

  const fetchUserVerificationStatus = async () => {
    try {
      const response = await fetch('/api/nic/status', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setNicStatus(data.data.nicStatus);
        
        if (data.data.nicStatus === 'approved') {
          setCurrentStep(4);
        } else if (data.data.nicStatus === 'pending') {
          setCurrentStep(3);
        } else {
          setCurrentStep(3);
        }
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
      status: 'completed'
    },
    {
      id: 2,
      name: 'Verify Email',
      description: 'Confirm ownership of your email',
      details: ['Verification link sent', 'Click to confirm', 'One-time code'],
      icon: Mail,
      time: '2 min',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Verify Identity',
      description: 'Submit your ID documents',
      details: ['Government-issued ID', 'NIC, Passport, or License', 'Clear photo required'],
      icon: FileText,
      time: '5 min',
      status: currentStep >= 3 ? 'current' : 'upcoming',
      nicRequired: true
    },
    {
      id: 4,
      name: 'Verify Business',
      description: 'Upload business documents (if applicable)',
      details: ['Business registration', 'Tax ID number', 'Licenses & permits'],
      icon: Building2,
      time: '5 min',
      status: currentStep >= 4 ? (currentStep === 4 ? 'current' : 'completed') : 'upcoming',
      optional: true,
      requiresNIC: true
    },
    {
      id: 5,
      name: 'Setup Payout Method',
      description: 'Add your bank account details',
      details: ['Bank account info', 'Verification deposit', 'Multiple options supported'],
      icon: Wallet,
      time: '3 min',
      status: currentStep >= 5 ? (currentStep === 5 ? 'current' : 'completed') : 'upcoming',
      requiresNIC: true
    },
    {
      id: 6,
      name: 'Pay Registration Fee',
      description: 'Complete platform fee payment',
      details: ['Secure payment gateway', 'Multiple payment options', 'One-time fee'],
      icon: CreditCard,
      time: '2 min',
      status: currentStep >= 6 ? (currentStep === 6 ? 'current' : 'completed') : 'upcoming',
      requiresNIC: true
    },
    {
      id: 7,
      name: 'Platform Review',
      description: 'We verify your documents',
      details: ['Admin verification', 'Document review', 'Account activation'],
      icon: CheckCircle2,
      time: '1-3 business days',
      status: currentStep >= 7 ? 'current' : 'upcoming',
      requiresNIC: true
    }
  ];

  const getStepStatus = (step) => {
    if (step.nicRequired && step.id === 3) {
      if (nicStatus === 'approved') return 'completed';
      if (nicStatus === 'pending') return 'pending';
      return 'current';
    }
    
    if (step.requiresNIC && nicStatus !== 'approved') {
      return 'locked';
    }
    
    if (step.id < currentStep) return 'completed';
    if (step.id === currentStep) return 'current';
    return 'upcoming';
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
        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
          <Icon className="w-3 h-3 text-white" />
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
    
    if (status === 'locked') {
      return (
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
          <Lock className="w-3 h-3 text-gray-400" />
        </div>
      );
    }
    
    return (
      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
        <Icon className="w-3 h-3 text-gray-400" />
      </div>
    );
  };

  const handleContinue = (step) => {
    if (step.id === 3 && nicStatus === 'approved') {
      setCurrentStep(4);
    } else if (step.id !== 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Clock className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
              {steps.filter(s => getStepStatus(s) === 'completed').length} of {steps.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(steps.filter(s => getStepStatus(s) === 'completed').length / steps.length) * 100}%` }}
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
                      : status === 'current'
                      ? 'border-blue-400 shadow-lg hover:shadow-xl'
                      : status === 'pending'
                      ? 'border-yellow-400 shadow-md'
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
                        
                        {status === 'current' && step.id !== 3 && (
                          <button 
                            onClick={() => handleContinue(step)}
                            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
                          >
                            Continue
                          </button>
                        )}
                        
                        {status === 'current' && step.id === 3 && (
                          <div className="mt-4">
                            <a
                              href="/upload-nic"
                              className="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
                            >
                              Upload NIC Documents
                            </a>
                          </div>
                        )}
                        
                        {status === 'pending' && (
                          <div className="mt-4 flex items-center gap-2 text-yellow-600 text-sm font-medium">
                            <Clock className="w-4 h-4 animate-pulse" />
                            Under Admin Review - Please wait for approval
                          </div>
                        )}
                        
                        {status === 'completed' && (
                          <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-medium">
                            <Check className="w-4 h-4" />
                            Completed
                          </div>
                        )}
                        
                        {status === 'locked' && (
                          <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
                            <Lock className="w-4 h-4" />
                            Complete NIC verification to unlock
                          </div>
                        )}
                        
                        {status === 'upcoming' && !step.requiresNIC && (
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-700">Completed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Circle className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-700">Current Step</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-700">Pending Review</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-700">Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationCenter;