import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Eye, ArrowLeft, Save, X, AlertCircle, CheckCircle, Clock, User, Mail, Phone, MapPin, Calendar, Shield, Activity } from 'lucide-react';

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

  // phone val

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

//phone / email val

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
// ...existing code...

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
                        <button
                          onClick={() => handleUserSelect(user)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
                      disabled={!hasChanges() || saving || phoneError}
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


/*import React, { useState, useEffect } from 'react';

export default function AdminUserManagement() {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserList, setShowUserList] = useState(true);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Fetch users from backend
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
    setShowUserList(false);
    setActiveTab('general');
  };

  const handleBackToList = () => {
    setShowUserList(true);
    setSelectedUser(null);
    setEditingUser(null);
  };

  const handleUpdateUser = async () => {
  if (!editingUser) return;
  try {
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
    setSelectedUser(updatedUser); // Use updatedUser directly

    alert('User details updated successfully!');
  } catch (err) {
    console.error('Error updating user:', err);
    alert('Failed to update user details. Please try again.');
  }
};

  const handleRoleChange = role => editingUser && setEditingUser({ ...editingUser, role });
  const handleStatusChange = status => editingUser && setEditingUser({ ...editingUser, status });
  const handleEmailVerification = verified =>
    editingUser && setEditingUser({ ...editingUser, isAccountVerified: verified });

  const getRoleBadge = role => {
    const roleConfig = {
      admin: { bg: 'bg-red-100', text: 'text-red-800', icon: '👑' },
      seller: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '💼' },
      user: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '👤' },
    };
    const config = roleConfig[role?.toLowerCase()] || roleConfig.user;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
      </span>
    );
  };

  const getStatusBadge = status => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
      deleted: { bg: 'bg-red-100', text: 'text-red-800', icon: '⛔' },
      suspended: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⚠️' },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active'}
      </span>
    );
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: '⚙️' },
    { id: 'security', label: 'Account Security', icon: '🔒' },
    { id: 'activity', label: 'User Activity', icon: '📊' },
  ];

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading users...</div>;
  if (error)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-600">
        {error}
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Retry
        </button>
      </div>
    );

  if (showUserList) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <div className="flex mb-4 space-x-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded"
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="user">User</option>
          </select>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td className="px-6 py-4">
                  {user.firstName} {user.lastName}
                  <br />
                  <span className="text-gray-500 text-xs">{user.email}</span>
                </td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                <td className="px-6 py-4">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => handleUserSelect(user)} className="text-blue-600">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <button onClick={handleBackToList} className="mb-4 text-blue-600">
        ← Back to User List
      </button>
      <h1 className="text-2xl font-bold mb-4">Edit User: {selectedUser?.firstName}</h1>

      <div className="mb-4">
        <nav className="flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 border-b-2 ${activeTab === tab.id ? 'border-blue-600' : ''}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'general' && editingUser && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>First Name</label>
              <input
                type="text"
                value={editingUser.firstName || ''}
                onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label>Last Name</label>
              <input
                type="text"
                value={editingUser.lastName || ''}
                onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                value={editingUser.email || ''}
                onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label>Username</label>
              <input
                type="text"
                value={editingUser.username || ''}
                onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label>Phone</label>
              <input
                type="tel"
                value={editingUser.phone || ''}
                onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label>Country</label>
              <input
                type="text"
                value={editingUser.country || ''}
                onChange={e => setEditingUser({ ...editingUser, country: e.target.value })}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label>City</label>
              <input
                type="text"
                value={editingUser.city || ''}
                onChange={e => setEditingUser({ ...editingUser, city: e.target.value })}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label>Address</label>
              <input
                type="text"
                value={editingUser.address || ''}
                onChange={e => setEditingUser({ ...editingUser, address: e.target.value })}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label>Bio</label>
              <textarea
                value={editingUser.bio || ''}
                onChange={e => setEditingUser({ ...editingUser, bio: e.target.value })}
                className="w-full border px-2 py-1 rounded h-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Role</label>
              <select
                value={editingUser.role || 'user'}
                onChange={e => handleRoleChange(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label>Status</label>
              <select
                value={editingUser.status || 'active'}
                onChange={e => handleStatusChange(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="active">Active</option>
                <option value="deleted">Deleted</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label>Email Verified</label>
            <input
              type="checkbox"
              checked={editingUser.isAccountVerified || false}
              onChange={e => handleEmailVerification(e.target.checked)}
            />
          </div>

          <button onClick={handleUpdateUser} className="px-4 py-2 bg-blue-600 text-white rounded">
            Update User
          </button>
        </div>
      )}
    </div>
  );
}
*/


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



/*import React, { useState, useEffect } from 'react';

export default function AdminUserManagement() {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserList, setShowUserList] = useState(true);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5001/api/user/all-users", {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setEditingUser({ ...user });
    setShowUserList(false);
    setActiveTab('general');
  };

  const handleBackToList = () => {
    setShowUserList(true);
    setSelectedUser(null);
    setEditingUser(null);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch(`http://localhost:5001/api/user/${editingUser._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const updatedUser = await response.json();
      setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
      setSelectedUser(updatedUser);
      alert('User details updated successfully!');
    } catch (error) {
      console.error("Error updating user:", error);
      alert('Failed to update user details. Please try again.');
    }
  };

  const handleRoleChange = (role) => editingUser && setEditingUser({ ...editingUser, role });
  const handleStatusChange = (status) => editingUser && setEditingUser({ ...editingUser, status });
  const handleEmailVerification = (verified) => editingUser && setEditingUser({ ...editingUser, emailVerified: verified });

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'bg-red-100', text: 'text-red-800', icon: '👑' },
      seller: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '💼' },
      bidder: { bg: 'bg-green-100', text: 'text-green-800', icon: '🏷️' },
      user: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '👤' }
    };
    const config = roleConfig[role?.toLowerCase()] || roleConfig.user;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
      inactive: { bg: 'bg-red-100', text: 'text-red-800', icon: '⛔' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: '⛔' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' }
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active'}
      </span>
    );
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: '⚙️' },
    { id: 'security', label: 'Account Security', icon: '🔒' },
    { id: 'activity', label: 'User Activity', icon: '📊' }
  ];

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading users...</div>;
  if (error) return <div className="flex flex-col justify-center items-center min-h-screen text-red-600">{error}<button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button></div>;

  if (showUserList) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <div className="flex mb-4 space-x-4">
          <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border rounded"/>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 border rounded">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="bidder">Bidder</option>
            <option value="user">User</option>
          </select>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td className="px-6 py-4">{user.name}<br/><span className="text-gray-500 text-xs">{user.email}</span></td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                <td className="px-6 py-4">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => handleUserSelect(user)} className="text-blue-600">Edit</button>
                  <button onClick={() => alert('View activity')} className="text-green-600">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <button onClick={handleBackToList} className="mb-4 text-blue-600">← Back to User List</button>
      <h1 className="text-2xl font-bold mb-4">Edit User: {selectedUser?.name}</h1>

      <div className="mb-4">
        <nav className="flex space-x-4">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-2 border-b-2 ${activeTab===tab.id?'border-blue-600':''}`}>{tab.icon} {tab.label}</button>
          ))}
        </nav>
      </div>

      {activeTab === 'general' && editingUser && (
        <div className="space-y-4">
          <div>
            <label>Name</label>
            <input type="text" value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name:e.target.value})} className="w-full border px-2 py-1 rounded"/>
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email:e.target.value})} className="w-full border px-2 py-1 rounded"/>
          </div>
          <div>
            <label>Role</label>
            <select value={editingUser.role || 'user'} onChange={e => handleRoleChange(e.target.value)} className="w-full border px-2 py-1 rounded">
              <option value="user">User</option>
              <option value="bidder">Bidder</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label>Status</label>
            <select value={editingUser.status || 'active'} onChange={e => handleStatusChange(e.target.value)} className="w-full border px-2 py-1 rounded">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label>Email Verified</label>
            <input type="checkbox" checked={editingUser.emailVerified || false} onChange={e => handleEmailVerification(e.target.checked)} />
          </div>
          <button onClick={handleUpdateUser} className="px-4 py-2 bg-blue-600 text-white rounded">Update User</button>
        </div>
      )}
    </div>
  );
}


/*
import React, { useState } from 'react';

export default function AdminUserManagement() {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserList, setShowUserList] = useState(true);
  
  // Mock users data
  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: 'Dananjaya',
      lastName: 'Silva',
      email: 'dananjaya@example.com',
      username: 'dananjaya_gems',
      phone: '+94 70 123 4567',
      country: 'Sri Lanka',
      city: 'Negombo',
      address: '123 Main Street, Negombo',
      bio: 'Passionate gem collector and trader',
      role: 'bidder',
      status: 'active',
      emailVerified: false,
      joinDate: '2024-01-15',
      lastLogin: '2024-09-20'
    },
    {
      id: 2,
      firstName: 'Priya',
      lastName: 'Fernando',
      email: 'priya.fernando@example.com',
      username: 'priya_seller',
      phone: '+94 71 987 6543',
      country: 'Sri Lanka',
      city: 'Colombo',
      address: '456 Gem Street, Colombo 03',
      bio: 'Professional gem dealer with 10+ years experience',
      role: 'seller',
      status: 'active',
      emailVerified: true,
      joinDate: '2023-08-10',
      lastLogin: '2024-09-25'
    },
    {
      id: 3,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gemrockauctions.com',
      username: 'admin_main',
      phone: '+94 77 555 0123',
      country: 'Sri Lanka',
      city: 'Kandy',
      address: 'Admin Office, Kandy',
      bio: 'System administrator',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      joinDate: '2023-01-01',
      lastLogin: '2024-09-25'
    }
  ]);

  const [editingUser, setEditingUser] = useState(null);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setEditingUser({...user});
    setShowUserList(false);
    setActiveTab('general');
  };

  const handleBackToList = () => {
    setShowUserList(true);
    setSelectedUser(null);
    setEditingUser(null);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const updatedUsers = users.map(user => 
      user.id === editingUser.id ? editingUser : user
    );
    setUsers(updatedUsers);
    setSelectedUser(editingUser);
    alert('User details updated successfully!');
  };

  const handleRoleChange = (newRole) => {
    if (editingUser) {
      setEditingUser({...editingUser, role: newRole});
    }
  };

  const handleStatusChange = (newStatus) => {
    if (editingUser) {
      setEditingUser({...editingUser, status: newStatus});
    }
  };

  const handleEmailVerification = (verified) => {
    if (editingUser) {
      setEditingUser({...editingUser, emailVerified: verified});
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'bg-red-100', text: 'text-red-800', icon: '👑' },
      seller: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '💼' },
      bidder: { bg: 'bg-green-100', text: 'text-green-800', icon: '🏷️' }
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
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: '⛔' },
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
    { id: 'general', label: 'General Settings', icon: '⚙️' },
    { id: 'security', label: 'Account Security', icon: '🔒' },
    { id: 'activity', label: 'User Activity', icon: '📊' }
  ];

  if (showUserList) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
          </div>

          <div className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="seller">Seller</option>
                  <option value="bidder">Bidder</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                Total Users: {users.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              @{user.username}
                            </div>
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
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleUserSelect(user)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => alert(`View ${user.firstName}'s activity`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBackToList}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit User: {selectedUser?.firstName} {selectedUser?.lastName}
                </h1>
                <p className="text-gray-600">Manage user account and permissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getRoleBadge(selectedUser?.role)}
              {getStatusBadge(selectedUser?.status)}
            </div>
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
         
          {activeTab === 'general' && editingUser && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Details</h2>
                <p className="text-gray-600 mb-6">
                  Update user information and account settings. Payment details are not accessible for security reasons.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editingUser.firstName}
                    onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editingUser.lastName}
                    onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={editingUser.country}
                    onChange={(e) => setEditingUser({...editingUser, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={editingUser.city}
                    onChange={(e) => setEditingUser({...editingUser, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editingUser.address}
                    onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={editingUser.bio}
                  onChange={(e) => setEditingUser({...editingUser, bio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                />
              </div>

           
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="font-medium text-gray-900 mb-4">Account Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Role
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Status
                    </label>
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

              <div className="pt-4">
                <button
                  onClick={handleUpdateUser}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update User Details
                </button>
              </div>
            </div>
          )}

          
          {activeTab === 'security' && editingUser && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h2>
                <p className="text-gray-600 mb-6">
                  Manage user security settings and account verification status.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">🔒</span>
                  <span className="text-red-800 font-medium">Password Management</span>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  For security reasons, admins cannot view or change user passwords. Users must reset their own passwords.
                </p>
              </div>

              <div className="space-y-4">
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

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Force Password Reset</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Send a password reset email to the user
                  </p>
                  <button
                    onClick={() => alert(`Password reset email sent to ${editingUser.email}`)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  >
                    Send Reset Email
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Session Management</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Force logout user from all devices
                  </p>
                  <button
                    onClick={() => alert(`${editingUser.firstName} has been logged out from all devices`)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Force Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && selectedUser && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h2>
                <p className="text-gray-600 mb-6">
                  View user's account activity and statistics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-medium text-blue-900">Account Info</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Join Date:</span>
                      <span>{new Date(selectedUser.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Login:</span>
                      <span>{new Date(selectedUser.lastLogin).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span>{selectedUser.status}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-medium text-green-900">Activity Stats</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Bids:</span>
                      <span>23</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Won Auctions:</span>
                      <span>5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Bids:</span>
                      <span>3</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-medium text-purple-900">Financial</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Payment Methods:</span>
                      <span className="text-gray-500">🔒 Hidden</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Spent:</span>
                      <span className="text-gray-500">🔒 Hidden</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Payments:</span>
                      <span className="text-gray-500">🔒 Hidden</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="p-4">
                    <div className="flex items-center text-sm">
                      <span className="mr-2">🏷️</span>
                      <span className="text-gray-600">Placed bid on Blue Sapphire auction</span>
                      <span className="ml-auto text-gray-400">2 hours ago</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center text-sm">
                      <span className="mr-2">🔐</span>
                      <span className="text-gray-600">Logged in from new device</span>
                      <span className="ml-auto text-gray-400">1 day ago</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center text-sm">
                      <span className="mr-2">✏️</span>
                      <span className="text-gray-600">Updated profile information</span>
                      <span className="ml-auto text-gray-400">3 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}*/