import React, { useState } from 'react';
import { Mail, Send, Users, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function EmailSystem() {
  const [emailData, setEmailData] = useState({
    recipients: 'all',
    specificEmails: '',
    subject: '',
    message: '',
    template: 'custom',
    priority: 'normal'
  });

  const [sentEmails, setSentEmails] = useState([
    {
      id: 1,
      subject: 'Welcome to GemBid!',
      recipients: 'all',
      sentAt: '2025-09-25 10:30 AM',
      status: 'delivered',
      recipientCount: 1250
    },
    {
      id: 2,
      subject: 'Account Verification Required',
      recipients: 'specific',
      sentAt: '2025-09-24 2:15 PM',
      status: 'delivered',
      recipientCount: 25
    },
    {
      id: 3,
      subject: 'System Maintenance Notice',
      recipients: 'active',
      sentAt: '2025-09-23 9:00 AM',
      status: 'pending',
      recipientCount: 980
    }
  ]);

  const emailTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to GemBid Platform!',
      message: 'Welcome to our platform! We\'re excited to have you join our community of gem enthusiasts. Start exploring our exclusive gem auctions and discover rare treasures from around the world.'
    },
    {
      id: 'verification',
      name: 'Email Verification',
      subject: 'Please Verify Your Email Address',
      message: 'Thank you for registering with GemBid. To complete your account setup and start bidding on exclusive gems, please verify your email address by clicking the link below.'
    },
    {
      id: 'suspension',
      name: 'Account Suspension Notice',
      subject: 'Important: Your Account Has Been Suspended',
      message: 'Your GemBid account has been temporarily suspended due to a violation of our terms of service. Please contact our support team for more information on how to resolve this issue.'
    },
    {
      id: 'reactivation',
      name: 'Account Reactivated',
      subject: 'Great News! Your Account is Now Active',
      message: 'Your GemBid account has been successfully reactivated. Welcome back! You can now resume bidding on our exclusive gem auctions and accessing all platform features.'
    },
    {
      id: 'promotion',
      name: 'Special Promotion',
      subject: 'Limited Time: Exclusive Gem Auction',
      message: 'Don\'t miss out on our exclusive gem auction featuring rare sapphires, emeralds, and diamonds. Special bidding starts tomorrow with starting prices 30% below market value!'
    },
    {
      id: 'maintenance',
      name: 'System Maintenance',
      subject: 'Scheduled System Maintenance Notice',
      message: 'We will be performing scheduled maintenance on our platform. During this time, some features may be temporarily unavailable. We apologize for any inconvenience.'
    },
    {
      id: 'custom',
      name: 'Custom Message',
      subject: '',
      message: ''
    }
  ];

  const recipientOptions = [
    { value: 'all', label: 'All Users', icon: '👥', description: 'Send to all registered users' },
    { value: 'active', label: 'Active Users Only', icon: '✅', description: 'Send to users with active accounts' },
    { value: 'suspended', label: 'Suspended Users Only', icon: '⚠️', description: 'Send to users with suspended accounts' },
    { value: 'verified', label: 'Verified Users', icon: '🔒', description: 'Send to email-verified users only' },
    { value: 'buyers', label: 'Active Buyers', icon: '💎', description: 'Send to users who have made purchases' },
    { value: 'sellers', label: 'Registered Sellers', icon: '🏪', description: 'Send to users with seller accounts' },
    { value: 'specific', label: 'Specific Email Addresses', icon: '📧', description: 'Enter specific email addresses' }
  ];

  const handleTemplateChange = (templateId) => {
    const template = emailTemplates.find(t => t.id === templateId);
    setEmailData({
      ...emailData,
      template: templateId,
      subject: template.subject,
      message: template.message
    });
  };

  const handleSendEmail = () => {
    // Validation
    if (!emailData.subject.trim()) {
      alert('Please enter an email subject');
      return;
    }
    
    if (!emailData.message.trim()) {
      alert('Please enter an email message');
      return;
    }
    
    if (emailData.recipients === 'specific' && !emailData.specificEmails.trim()) {
      alert('Please enter email addresses for specific recipients');
      return;
    }

    // Validate specific emails format
    if (emailData.recipients === 'specific') {
      const emails = emailData.specificEmails.split(',').map(email => email.trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        alert(`Invalid email addresses found: ${invalidEmails.join(', ')}`);
        return;
      }
    }

    // Calculate recipient count (mock data)
    const recipientCounts = {
      'all': 1250,
      'active': 980,
      'suspended': 45,
      'verified': 1100,
      'buyers': 750,
      'sellers': 180,
      'specific': emailData.specificEmails.split(',').length
    };

    const recipientCount = recipientCounts[emailData.recipients];
    const recipientLabels = {
      'all': 'all users',
      'active': 'active users',
      'suspended': 'suspended users',
      'verified': 'verified users',
      'buyers': 'active buyers',
      'sellers': 'registered sellers',
      'specific': 'specific recipients'
    };

    // Add to sent emails
    const newEmail = {
      id: Date.now(),
      subject: emailData.subject,
      recipients: emailData.recipients,
      sentAt: new Date().toLocaleString(),
      status: 'pending',
      recipientCount: recipientCount,
      priority: emailData.priority
    };

    setSentEmails([newEmail, ...sentEmails]);

    alert(`Email scheduled successfully!\n\nRecipients: ${recipientCount} ${recipientLabels[emailData.recipients]}\nSubject: ${emailData.subject}\nPriority: ${emailData.priority}\n\nThe email will be processed and delivered shortly.`);
    
    // Reset form
    setEmailData({
      recipients: 'all',
      specificEmails: '',
      subject: '',
      message: '',
      template: 'custom',
      priority: 'normal'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Mail className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Email System
          </h1>
          <p className="text-gray-600 mt-2">Send emails to users individually or in groups with customizable templates.</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Compose Email Section */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-6 flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Compose Email
                </h3>
                
                <div className="space-y-4">
                  {/* Email Template Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
                    <select 
                      value={emailData.template} 
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {emailTemplates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Recipients Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                    <select 
                      value={emailData.recipients} 
                      onChange={(e) => setEmailData({...emailData, recipients: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {recipientOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {recipientOptions.find(opt => opt.value === emailData.recipients)?.description}
                    </p>
                  </div>

                  {/* Specific Emails Input */}
                  {emailData.recipients === 'specific' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses</label>
                      <textarea 
                        value={emailData.specificEmails} 
                        onChange={(e) => setEmailData({...emailData, specificEmails: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                        placeholder="Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)"
                      />
                    </div>
                  )}

                  {/* Priority Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select 
                      value={emailData.priority} 
                      onChange={(e) => setEmailData({...emailData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">🔵 Low Priority</option>
                      <option value="normal">⚪ Normal Priority</option>
                      <option value="high">🟡 High Priority</option>
                      <option value="urgent">🔴 Urgent</option>
                    </select>
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input 
                      type="text" 
                      value={emailData.subject} 
                      onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email subject..."
                    />
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea 
                      value={emailData.message} 
                      onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                      placeholder="Enter your email message here..."
                    />
                  </div>

                  {/* Send Button */}
                  <button 
                    onClick={handleSendEmail}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Send className="w-4 h-4" />
                    Send Email
                  </button>
                </div>
              </div>
            </div>

            {/* Email History Section */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Email History
                </h3>
                
                <div className="space-y-4">
                  {sentEmails.map((email) => (
                    <div key={email.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{email.subject}</h4>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(email.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                            {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {email.recipientCount} recipients
                        </span>
                        <span>{email.sentAt}</span>
                        {email.priority !== 'normal' && (
                          <span className={`px-2 py-1 rounded-full font-medium ${
                            email.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            email.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {email.priority}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600">
                        Recipients: {recipientOptions.find(opt => opt.value === email.recipients)?.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Statistics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Email Statistics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">1,255</div>
                    <div className="text-sm text-gray-600">Emails Sent</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">98.2%</div>
                    <div className="text-sm text-gray-600">Delivery Rate</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">23</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">12</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}