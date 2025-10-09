import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [showEmailVerification, setShowEmailVerification] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const { user: authUser } = useAuth();
  
  // Load user data from backend
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Resolve email: AuthContext -> localStorage.user -> localStorage.userEmail
        const lsUserRaw = localStorage.getItem('user');
        const lsUser = (() => { try { return lsUserRaw ? JSON.parse(lsUserRaw) : null; } catch { return null; } })();
        const userEmail = authUser?.email || lsUser?.email || localStorage.getItem('userEmail');
        if (!userEmail) {
          setError('No user email found. Please sign in again.');
          return;
        }
        
        const response = await fetch(`http://localhost:5001/api/user/profile?email=${encodeURIComponent(userEmail)}`);
        if (response.ok) {
          const userData = await response.json();
          if (userData._id) setUserId(userData._id);
          
          // Update general settings
          setGeneralSettings({
            firstName: userData.firstName || 'Dananjaya',
            lastName: userData.lastName || '',
            email: userData.email || 'dananjaya@example.com',
            username: userData.username || 'dananjaya_gems',
            phone: userData.phone || '',
            country: userData.country || 'Sri Lanka',
            city: userData.city || 'Negombo',
            address: userData.address || '',
            bio: userData.bio || ''
          });
          
          // Update credit cards from backend
          console.log('User data from backend:', userData);
          console.log('Saved cards from backend:', userData.savedCards);
          
          if (Array.isArray(userData.savedCards) && userData.savedCards.length > 0) {
            const mappedCards = userData.savedCards.map((card, index) => ({
              id: index + 1,
              cardNumber: card.cardNumber,
              cardType: card.cardType,
              expiryDate: card.expiryDate,
              holderName: card.holderName,
              isDefault: card.isDefault || false
            }));
            console.log('Mapped credit cards:', mappedCards);
            setCreditCards(mappedCards);
          } else {
            console.log('No saved cards found');
            setCreditCards([]);
          }
        } else {
          const err = await response.json().catch(() => ({ message: 'Failed to load profile' }));
          setError(err.message || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError(error.message || 'Error loading user data');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  // State for General Settings
  const [generalSettings, setGeneralSettings] = useState({
    firstName: 'Dananjaya',
    lastName: '',
    email: 'dananjaya@example.com',
    username: 'dananjaya_gems',
    phone: '',
    country: 'Sri Lanka',
    city: 'Negombo',
    address: '',
    bio: ''
  });

  // State for Password & Security
  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    loginAlerts: true
  });

  // State for Credit Cards
  const [creditCards, setCreditCards] = useState([
    {
      id: 1,
      cardNumber: '**** **** **** 4532',
      cardType: 'Visa',
      expiryDate: '12/25',
      holderName: 'Dananjaya Silva',
      isDefault: true
    },
    {
      id: 2,
      cardNumber: '**** **** **** 8765',
      cardType: 'Mastercard',
      expiryDate: '08/26',
      holderName: 'Dananjaya Silva',
      isDefault: false
    }
  ]);

  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    cardType: 'Visa'
  });

  const [showAddCard, setShowAddCard] = useState(false);

  const handleGeneralUpdate = async () => {
    if (!userId) {
      alert('User not loaded yet');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/api/user/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: generalSettings.firstName,
          lastName: generalSettings.lastName,
          username: generalSettings.username,
          email: generalSettings.email,
          phone: generalSettings.phone,
          country: generalSettings.country,
          city: generalSettings.city,
          address: generalSettings.address,
          bio: generalSettings.bio
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Update failed' }));
        throw new Error(err.message || 'Update failed');
      }
      alert('General settings updated successfully!');
    } catch (e) {
      console.error('Failed to update user:', e);
      alert(`Failed to update: ${e.message}`);
    }
  };

  const handlePasswordUpdate = () => {
    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password updated successfully!');
    setPasswordSettings({
      ...passwordSettings,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.expiryDate || !newCard.cvv || !newCard.holderName) {
      alert('Please fill in all card details');
      return;
    }
    
    const cardTypeFromNumber = newCard.cardNumber.startsWith('4') ? 'Visa' : 
                              newCard.cardNumber.startsWith('5') ? 'Mastercard' : 'Other';
    
    const card = {
      id: Date.now(),
      cardNumber: `**** **** **** ${newCard.cardNumber.slice(-4)}`,
      cardType: cardTypeFromNumber,
      expiryDate: newCard.expiryDate,
      holderName: newCard.holderName,
      isDefault: creditCards.length === 0
    };
    
    setCreditCards([...creditCards, card]);
    setNewCard({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      holderName: '',
      cardType: 'Visa'
    });
    setShowAddCard(false);
    alert('Credit card added successfully!');
  };

  const handleRemoveCard = (cardId) => {
    if (window.confirm('Are you sure you want to remove this card?')) {
      setCreditCards(creditCards.filter(card => card.id !== cardId));
    }
  };

  const handleSetDefaultCard = (cardId) => {
    setCreditCards(creditCards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })));
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: '⚙️' },
    { id: 'security', label: 'Password & Security', icon: '🔒' },
    { id: 'cards', label: 'Credit Cards', icon: '💳' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        </div>

        {loading && (
          <div className="p-6 text-gray-600">Loading profile…</div>
        )}
        {!loading && error && (
          <div className="p-6 text-red-600">{error}</div>
        )}

        {/* Tab Navigation */}
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
          {/* Email Verification Alert */}
          {showEmailVerification && activeTab === 'general' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span className="text-yellow-800">Your email address needs to be verified.</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">
                    Verify
                  </button>
                  <button 
                    onClick={() => setShowEmailVerification(false)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Member Details</h2>
                <p className="text-gray-600 mb-6">
                  Your privacy matters! Your username, feedback, country and registration date will be 
                  displayed to all visitors, but only sellers you transact with and administrators can 
                  view your full details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.firstName}
                    onChange={(e) => setGeneralSettings({...generalSettings, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.lastName}
                    onChange={(e) => setGeneralSettings({...generalSettings, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={generalSettings.email}
                    onChange={(e) => setGeneralSettings({...generalSettings, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={generalSettings.username}
                    onChange={(e) => setGeneralSettings({...generalSettings, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={generalSettings.phone}
                    onChange={(e) => setGeneralSettings({...generalSettings, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+94 70 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={generalSettings.country}
                    onChange={(e) => setGeneralSettings({...generalSettings, country: e.target.value})}
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
                    value={generalSettings.city}
                    onChange={(e) => setGeneralSettings({...generalSettings, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={generalSettings.address}
                    onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={generalSettings.bio}
                  onChange={(e) => setGeneralSettings({...generalSettings, bio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Tell us about yourself and your interest in gems..."
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleGeneralUpdate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update General Settings
                </button>
              </div>
            </div>
          )}

          {/* Password & Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Password Settings</h2>
                <p className="text-gray-600 mb-6">
                  Keep your account secure by using a strong password and enabling additional security features.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordSettings.currentPassword}
                    onChange={(e) => setPasswordSettings({...passwordSettings, currentPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordSettings.newPassword}
                    onChange={(e) => setPasswordSettings({...passwordSettings, newPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordSettings.confirmPassword}
                    onChange={(e) => setPasswordSettings({...passwordSettings, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  onClick={handlePasswordUpdate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Password
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Features</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={passwordSettings.twoFactorEnabled}
                        onChange={(e) => setPasswordSettings({...passwordSettings, twoFactorEnabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Login Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={passwordSettings.loginAlerts}
                        onChange={(e) => setPasswordSettings({...passwordSettings, loginAlerts: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Credit Cards Tab */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Credit Cards</h2>
                  <p className="text-gray-600">Manage your payment methods for bidding</p>
                </div>
                <button
                  onClick={() => setShowAddCard(!showAddCard)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {showAddCard ? 'Cancel' : '+ Add Card'}
                </button>
              </div>

              {/* Add New Card Form */}
              {showAddCard && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Add New Credit Card</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={newCard.cardNumber}
                        onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1234 5678 9012 3456"
                        maxLength="16"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={newCard.expiryDate}
                        onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={newCard.cvv}
                        onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={newCard.holderName}
                        onChange={(e) => setNewCard({...newCard, holderName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={handleAddCard}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Add Card
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Cards */}
              <div className="space-y-4">
                {creditCards.map((card) => (
                  <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                          {card.cardType === 'Visa' ? 'VISA' : 'MC'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{card.cardNumber}</p>
                          <p className="text-sm text-gray-600">
                            {card.holderName} • Expires {card.expiryDate}
                          </p>
                          {card.isDefault && (
                            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!card.isDefault && (
                          <button
                            onClick={() => handleSetDefaultCard(card.id)}
                            className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveCard(card.id)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {creditCards.length === 0 && !showAddCard && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💳</div>
                  <p className="text-gray-600">No credit cards added yet</p>
                  <p className="text-sm text-gray-500 mt-1">Add a card to start bidding on gems</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// src/pages/user/EditUserDemo.jsx
/*import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, UserCog, Lock, Users } from "lucide-react";
import jsPDF from "jspdf";

const mockUser = {
  _id: "68d3c1dcdfea5d09a2e7562b",
  name: "John Doe",
  email: "john@example.com",
  role: "User",
  status: "Active",
  createdAt: "2024-01-15T10:30:00Z",
  password: "password123",
  bio: "This is a sample bio.",
  phone: "+1234567890",
  address: "123 Main St, City, Country",
};

export default function EditUserDemo() {
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    setUser(mockUser);
    setNewRole(mockUser.role);
  }, []);

  const handleChange = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  const handleSavePDF = () => {
    const doc = new jsPDF();
    doc.text("User Details", 10, 10);
    doc.text(`ID: ${user._id}`, 10, 20);
    doc.text(`Name: ${user.name}`, 10, 30);
    doc.text(`Email: ${user.email}`, 10, 40);
    doc.text(`Phone: ${user.phone}`, 10, 50);
    doc.text(`Address: ${user.address}`, 10, 60);
    doc.text(`Role: ${user.role}`, 10, 70);
    doc.text(`Status: ${user.status}`, 10, 80);
    doc.text(`Registered: ${new Date(user.createdAt).toLocaleDateString()}`, 10, 90);
    doc.text(`Bio: ${user.bio}`, 10, 100);
    doc.save(`${user.name}-details.pdf`);
  };

  const handleDelete = () => {
    alert(`Deleted user: ${user.name}`);
  };

  const handleUpdatePassword = () => {
    alert(`Password updated to: ${newPassword}`);
    setUser({ ...user, password: newPassword });
    setNewPassword("");
  };

  const handleUpdateRole = () => {
    alert(`Role updated to: ${newRole}`);
    setUser({ ...user, role: newRole });
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold">Edit User</h1>

      <div className="flex flex-col lg:flex-row gap-6">
       
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Personal Info</h2>
            <Input
              value={user.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Full Name"
            />
            <Input
              value={user.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Email"
            />
            <Input
              value={user.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Phone Number"
            />
            <Textarea
              value={user.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Bio"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Address</h2>
            <Textarea
              value={user.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Address"
            />
          </div>



         
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" /> Update Role
        </h2>
        <Input
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          placeholder="New Role (Admin/User)"
        />
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUpdateRole}>Update Role</Button>
      </div>

   
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Lock className="w-5 h-5" /> Update Password
        </h2>
        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button onClick={handleUpdatePassword} className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
      </div>


        </div>

       
        <div className="w-full lg:w-1/3 space-y-6 p-4 border-l border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserCog className="w-5 h-5" /> Account Info
          </h2>
          <Input
            value={user.status}
            onChange={(e) => handleChange("status", e.target.value)}
            placeholder="Status (Active/Inactive)"
          />

          <div className="flex flex-col gap-4 mt-6">
            <Button onClick={handleSavePDF} className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Save as PDF
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete User
            </Button>
          </div>
        </div>
      </div>

     
    </div>
  );
}*/
