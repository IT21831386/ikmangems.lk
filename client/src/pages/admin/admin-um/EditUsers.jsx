/*import React, { useState } from 'react';


export default function EditUsers({ editingUser, setEditingUser, handleUpdateUser }) {
  const [activeTab, setActiveTab] = useState('general');

  const handleRoleChange = (newRole) => {
    setEditingUser({ ...editingUser, role: newRole });
  };

  const handleStatusChange = (newStatus) => {
    setEditingUser({ ...editingUser, status: newStatus });
  };

  const handleEmailVerification = (verified) => {
    setEditingUser({ ...editingUser, emailVerified: verified });
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'bg-red-100', text: 'text-red-800', icon: '' },
      seller: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '' },
      bidder: { bg: 'bg-green-100', text: 'text-green-800', icon: '' }
    };
    const config = roleConfig[role] || roleConfig.bidder;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: '' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: '' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: '' },
    { id: 'security', label: 'Account Security', icon: '' },
    { id: 'activity', label: 'User Activity', icon: '' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit User: {editingUser.firstName} {editingUser.lastName}
            </h1>
            <p className="text-gray-600">Manage user account and permissions</p>
          </div>
          <div className="flex items-center space-x-2">
            {getRoleBadge(editingUser.role)}
            {getStatusBadge(editingUser.status)}
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editingUser.firstName}
                    onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editingUser.lastName}
                    onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="font-medium text-gray-900 mb-4">Account Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bidder">Bidder</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                    <select
                      value={editingUser.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpdateUser}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update User Details
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Email Verification</h4>
                  <p className="text-sm text-gray-600">User's email verification status</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingUser.emailVerified}
                    onChange={(e) => handleEmailVerification(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h2>
              <p className="text-gray-600 mb-6">Activity details here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}*/
