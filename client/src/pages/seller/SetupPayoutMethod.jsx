import React, { useState, useEffect } from 'react';
import { Wallet, Building2, CreditCard, AlertCircle, CheckCircle2, ArrowLeft, Loader } from 'lucide-react';

const SetupPayoutMethod = () => {
  const [payoutMethod, setPayoutMethod] = useState('bank_account');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [existingPayout, setExistingPayout] = useState(null);

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [swiftCode, setSwiftCode] = useState('');

  const [mobileProvider, setMobileProvider] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    fetchExistingPayout();
  }, []);

  const fetchExistingPayout = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/payout/details', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success && data.data) {
        setExistingPayout(data.data);
        if (data.data.payoutMethod === 'bank_account') {
          setBankName(data.data.bankName || '');
          setAccountNumber(data.data.accountNumber || '');
          setAccountHolderName(data.data.accountHolderName || '');
          setBranchCode(data.data.branchCode || '');
          setSwiftCode(data.data.swiftCode || '');
        } else if (data.data.payoutMethod === 'mobile_money') {
          setMobileProvider(data.data.mobileProvider || '');
          setMobileNumber(data.data.mobileNumber || '');
          setAccountName(data.data.accountName || '');
        }
        setPayoutMethod(data.data.payoutMethod);
      }
    } catch (err) {
      console.error('Failed to fetch payout details:', err);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const payoutData = {
      payoutMethod,
      bankName: payoutMethod === 'bank_account' ? bankName : undefined,
      accountNumber: payoutMethod === 'bank_account' ? accountNumber : undefined,
      accountHolderName: payoutMethod === 'bank_account' ? accountHolderName : undefined,
      branchCode: payoutMethod === 'bank_account' ? branchCode : undefined,
      swiftCode: payoutMethod === 'bank_account' ? swiftCode : undefined,
      mobileProvider: payoutMethod === 'mobile_money' ? mobileProvider : undefined,
      mobileNumber: payoutMethod === 'mobile_money' ? mobileNumber : undefined,
      accountName: payoutMethod === 'mobile_money' ? accountName : undefined
    };

    try {
      const response = await fetch('http://localhost:5001/api/payout/setup', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payoutData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/verification';
        }, 2000);
      } else {
        setError(data.message || 'Failed to setup payout method');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Payout setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sriLankanBanks = [
    'Bank of Ceylon',
    'Commercial Bank of Ceylon',
    'Hatton National Bank',
    'Nations Trust Bank',
    'Sampath Bank',
    'Seylan Bank',
    'DFCC Bank',
    'National Development Bank',
    'Pan Asia Banking Corporation',
    'Union Bank',
    'Other'
  ];

  const mobileProviders = ['Dialog', 'Mobitel', 'Hutch', 'Airtel'];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payout Method Setup Complete!</h2>
          <p className="text-gray-600 mb-4">Your payout details have been saved successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to verification center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-3xl mx-auto">
        <a
          href="/verification"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Verification Center
        </a>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Setup Payout Method</h1>
                <p className="text-blue-100">Choose how you want to receive your earnings</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {existingPayout && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Existing Payout Method Found</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You can update your payout details below. Any changes will replace your existing setup.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Payout Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank_account')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      payoutMethod === 'bank_account'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className={`w-6 h-6 mb-2 ${
                      payoutMethod === 'bank_account' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <h3 className="font-semibold text-gray-900 mb-1">Bank Account</h3>
                    <p className="text-xs text-gray-600">Direct bank transfer</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('mobile_money')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      payoutMethod === 'mobile_money'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 mb-2 ${
                      payoutMethod === 'mobile_money' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <h3 className="font-semibold text-gray-900 mb-1">Mobile Money</h3>
                    <p className="text-xs text-gray-600">Mobile wallet transfer</p>
                  </button>
                </div>
              </div>

              {payoutMethod === 'bank_account' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select your bank</option>
                      {sriLankanBanks.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full name as per bank account"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your account number"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch Code
                      </label>
                      <input
                        type="text"
                        value={branchCode}
                        onChange={(e) => setBranchCode(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Branch code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SWIFT/BIC Code
                      </label>
                      <input
                        type="text"
                        value={swiftCode}
                        onChange={(e) => setSwiftCode(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="For international transfers"
                      />
                    </div>
                  </div>
                </div>
              )}

              {payoutMethod === 'mobile_money' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Provider *
                    </label>
                    <select
                      value={mobileProvider}
                      onChange={(e) => setMobileProvider(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select your provider</option>
                      {mobileProviders.map(provider => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Name registered with mobile provider"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="07XXXXXXXX"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Important Information</p>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Ensure all details are accurate to avoid payment delays</li>
                      <li>You can update your payout method anytime</li>
                      <li>Payouts are processed within 3-5 business days</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      {existingPayout ? 'Update Payout Method' : 'Save Payout Method'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPayoutMethod;