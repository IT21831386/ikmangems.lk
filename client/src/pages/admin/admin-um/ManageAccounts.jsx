import React, { useState } from 'react';
import { Trash2, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AccountManagement() {
  const [accountStatus, setAccountStatus] = useState('active');
  const [suspendReason, setSuspendReason] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    role: 'user',
    phone: '',
    country: 'Sri Lanka'
  });

  const handleAccountAction = (action) => {
    let message = '';
    switch(action) {
      case 'suspend':
        if (!suspendReason.trim()) {
          alert('Please provide a reason for suspension');
          return;
        }
        message = `Account suspended. Reason: ${suspendReason}`;
        setAccountStatus('suspended');
        break;
      case 'activate':
        message = 'Account activated successfully!';
        setAccountStatus('active');
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
          message = 'Account deleted successfully!';
          setAccountStatus('deleted');
        } else {
          return;
        }
        break;
    }
    alert(message);
    setSuspendReason('');
  };

  const handleAddUser = () => {
    // Validation
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.username || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Password validation
    if (newUser.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    const roleLabels = {
      'user': 'User',
      'seller': 'Seller', 
      'admin': 'Administrator'
    };

    alert(`User account created successfully!\n\nName: ${newUser.firstName} ${newUser.lastName}\nEmail: ${newUser.email}\nRole: ${roleLabels[newUser.role]}\nUsername: ${newUser.username}`);
    
    // Reset form
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      role: 'user',
      phone: '',
      country: 'Sri Lanka'
    });
    setShowAddUser(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Account Management
              </h1>
              <p className="text-gray-600 mt-2">Manage user account status and perform administrative actions.</p>
            </div>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showAddUser ? 'Cancel' : '+ Add New User'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New User Form */}
          {showAddUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Add New User Account</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User - Regular customer account</option>
                    <option value="seller">Seller - Can list and sell gems</option>
                    <option value="admin">Admin - Full administrative access</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+94 70 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select
                    value={newUser.country}
                    onChange={(e) => setNewUser({...newUser, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleAddUser}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Create User Account
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Role Permissions:</strong><br/>
                  • <strong>User:</strong> Can browse, bid on gems, and make purchases<br/>
                  • <strong>Seller:</strong> All user permissions plus ability to list and sell gems<br/>
                  • <strong>Admin:</strong> Full access including user management and system administration
                </p>
              </div>
            </div>
          )}
          {/* Current Account Status */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Current Account Status</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                accountStatus === 'active' ? 'bg-green-100 text-green-800' :
                accountStatus === 'suspended' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {accountStatus === 'active' && <CheckCircle className="w-4 h-4" />}
                {accountStatus === 'suspended' && <AlertTriangle className="w-4 h-4" />}
                {accountStatus === 'deleted' && <Trash2 className="w-4 h-4" />}
                {accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)}
              </span>
            </div>
            
            {/* Account Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-700">User ID</p>
                <p className="text-sm text-gray-900">68d3c1dcdfea5d09a2e7562b</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Registration Date</p>
                <p className="text-sm text-gray-900">January 15, 2024</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Last Login</p>
                <p className="text-sm text-gray-900">September 25, 2025</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Role</p>
                <p className="text-sm text-gray-900">User</p>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-6">Account Actions</h3>
            
            {/* Suspend Account */}
            <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-gray-900">Suspend Account</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Temporarily disable the user's account. They will not be able to login or perform any actions.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Suspension *
                </label>
                <textarea 
                  value={suspendReason} 
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 h-24 resize-none"
                  placeholder="Please provide a detailed reason for suspension (e.g., violation of terms, suspicious activity, etc.)"
                />
              </div>
              
              <button 
                onClick={() => handleAccountAction('suspend')}
                disabled={accountStatus === 'suspended' || accountStatus === 'deleted'}
                className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  accountStatus === 'suspended' || accountStatus === 'deleted'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                {accountStatus === 'suspended' ? 'Account Already Suspended' : 'Suspend Account'}
              </button>
            </div>

            {/* Activate Account */}
            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-gray-900">Activate Account</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Reactivate a suspended account. The user will regain full access to their account.
              </p>
              
              <button 
                onClick={() => handleAccountAction('activate')}
                disabled={accountStatus === 'active' || accountStatus === 'deleted'}
                className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  accountStatus === 'active' || accountStatus === 'deleted'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {accountStatus === 'active' ? 'Account Already Active' : 'Activate Account'}
              </button>
            </div>

            {/* Delete Account */}
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-gray-900">Delete Account</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Permanently delete this account and all associated data. This action cannot be undone.
              </p>
              
              <div className="bg-red-100 border border-red-300 rounded-md p-4 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm font-medium text-red-800">Warning: This action is irreversible</p>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  All user data, including bids, transactions, and personal information will be permanently removed.
                </p>
              </div>
              
              <button 
                onClick={() => handleAccountAction('delete')}
                disabled={accountStatus === 'deleted'}
                className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  accountStatus === 'deleted'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {accountStatus === 'deleted' ? 'Account Already Deleted' : 'Delete Account'}
              </button>
            </div>
          </div>

          {/* Action History */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">Recent Actions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-xs text-gray-500">User registration completed</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Jan 15, 2024</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Verified</p>
                    <p className="text-xs text-gray-500">Email verification completed</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Jan 15, 2024</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Login</p>
                    <p className="text-xs text-gray-500">User accessed their account</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Sep 25, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}