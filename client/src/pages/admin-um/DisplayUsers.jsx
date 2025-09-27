import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Eye, ArrowLeft, Save, X, AlertCircle, CheckCircle, Clock, User, Mail, Phone, MapPin, Calendar, Shield, Activity } from 'lucide-react';
import AddUser from './AddUser';

export default function AdminUserManagement() {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserList, setShowUserList] = useState(true);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/user/all-users', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter users by search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleUserSelect = user => {
    setSelectedUser(user);
    setEditingUser({ ...user });
    setOriginalUser({ ...user });
    setShowUserList(false);
    setActiveTab('general');
    setSuccessMessage('');
  };

  const handleBackToList = () => {
    setShowUserList(true);
    setSelectedUser(null);
    setEditingUser(null);
    setOriginalUser(null);
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    if (originalUser) {
      setEditingUser({ ...originalUser });
    }
  };

  const hasChanges = () => {
    if (!editingUser || !originalUser) return false;
    return JSON.stringify(editingUser) !== JSON.stringify(originalUser);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !hasChanges()) return;
    
    try {
      setSaving(true);
      const response = await fetch(`http://localhost:5001/api/user/users/${editingUser._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const updatedUser = await response.json();

      // Update users array and selected user
      setUsers(users.map(u => (u._id === updatedUser._id ? updatedUser : u)));
      setSelectedUser(updatedUser);
      setOriginalUser({ ...updatedUser });
      setSuccessMessage('User details updated successfully!');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/user/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      // Remove user from the list
      setUsers(users.filter(u => u._id !== userId));
      setSuccessMessage('User deleted successfully!');
      setDeleteConfirm(null);
      
      // If we're currently viewing the deleted user, go back to list
      if (selectedUser && selectedUser._id === userId) {
        handleBackToList();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
      setDeleteConfirm(null);
    }
  };

  // phone validation
  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 12) {
      return 'Phone number must be between 9 and 12 digits';
    }
    return '';
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  //phone / email validation
  const handleInputChange = (field, value) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [field]: value });
      if (field === 'phone') {
        setPhoneError(validatePhone(value));
      }

      if (field === 'email') {
        setEmailError(validateEmail(value));
      }
    }
  };

  const getRoleBadge = role => {
    const roleConfig = {
      admin: { bg: 'bg-red-100', text: 'text-red-800', icon: Shield },
      seller: { bg: 'bg-blue-100', text: 'text-blue-800', icon: User },
      user: { bg: 'bg-gray-100', text: 'text-gray-800', icon: User },
    };
    const config = roleConfig[role?.toLowerCase()] || roleConfig.user;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
      </span>
    );
  };

  const getStatusBadge = status => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      deleted: { bg: 'bg-red-100', text: 'text-red-800', icon: X },
      suspended: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.active;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active'}
      </span>
    );
  };

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <div className="text-red-600 text-center mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (showUserList) {
    return (


        
      <div className="min-h-screen bg-gray-50">


        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage user accounts, roles, and permissions</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="seller">Seller</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleUserSelect(user)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                            disabled={user.role === 'admin'}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the user "{deleteConfirm.firstName} {deleteConfirm.lastName}"? 
                This action cannot be undone and will permanently remove all user data.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(deleteConfirm._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center text-blue-600 hover:text-blue-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to User List
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit User: {selectedUser?.firstName} {selectedUser?.lastName}
              </h1>
              <p className="text-gray-600 mt-2">Manage user account and permissions</p>
            </div>
            <div className="flex items-center space-x-3">
              {selectedUser && (
                <>
                  {getRoleBadge(selectedUser.role)}
                  {getStatusBadge(selectedUser.status)}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'general' && editingUser && (
              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={editingUser.firstName || ''}
                        onChange={e => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={editingUser.lastName || ''}
                        onChange={e => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={editingUser.email || ''}
                          onChange={e => handleInputChange('email', e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {emailError && (
                        <div className="text-red-500 text-xs mt-1">{emailError}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={editingUser.username || ''}
                        onChange={e => handleInputChange('username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={editingUser.phone || ''}
                          onChange={e => handleInputChange('phone', e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {phoneError && (
                        <div className="text-red-500 text-xs mt-1">{phoneError}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={editingUser.country || ''}
                        onChange={e => handleInputChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={editingUser.city || ''}
                          onChange={e => handleInputChange('city', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={editingUser.address || ''}
                        onChange={e => handleInputChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={editingUser.bio || ''}
                      onChange={e => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* Account Settings */}
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        value={editingUser.role || 'user'}
                        onChange={e => handleInputChange('role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={editingUser.status || 'active'}
                        onChange={e => handleInputChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="deleted">Deleted</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Verified</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingUser.isAccountVerified || false}
                          onChange={e => handleInputChange('isAccountVerified', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpdateUser}
                      disabled={!hasChanges() || saving || phoneError || emailError}
                      className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    {hasChanges() && (
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    )}
                  </div>
                  {hasChanges() && (
                    <span className="text-sm text-amber-600 font-medium">You have unsaved changes</span>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && selectedUser && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Account Security</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="text-amber-800 font-medium">Security features coming soon</span>
                  </div>
                  <p className="text-amber-700 text-sm mt-1">
                    Password management and security settings will be available in the next update.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'activity' && selectedUser && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">User Activity</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">Activity tracking coming soon</span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    User activity logs and analytics will be available in the next update.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}