import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import notificationService from '../../services/notificationService';

const UserCommunication = () => {
  const { addNotification } = useNotifications();
  
  // State management
  const [activeTab, setActiveTab] = useState('send-notification');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  // Send notification form state
  const [notificationForm, setNotificationForm] = useState({
    recipient: '',
    title: '',
    message: '',
    type: 'info',
    channels: ['in-app'],
    priority: 'medium',
    scheduledFor: ''
  });

  // Bulk messaging form state
  const [bulkForm, setBulkForm] = useState({
    userGroup: 'all',
    customUsers: [],
    title: '',
    message: '',
    channels: ['in-app'],
    templateId: '',
    scheduledFor: ''
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    title: '',
    message: '',
    type: 'general',
    variables: [],
    isActive: true
  });

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892' }
    ];
    
    const mockTemplates = [
      {
        id: 1,
        name: 'Welcome Message',
        title: 'Welcome to IB Bank',
        message: 'Welcome {{userName}}! Your account has been successfully created.',
        type: 'welcome',
        variables: ['userName'],
        isActive: true
      },
      {
        id: 2,
        name: 'Transaction Alert',
        title: 'Transaction Notification',
        message: 'A {{transactionType}} of {{amount}} has been processed on your account.',
        type: 'transaction',
        variables: ['transactionType', 'amount'],
        isActive: true
      }
    ];

    setUsers(mockUsers);
    setTemplates(mockTemplates);
  }, []);

  // Handle send notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await notificationService.sendNotification({
        ...notificationForm,
        timestamp: new Date().toISOString()
      });

      addNotification({
        type: 'success',
        title: 'Notification Sent',
        message: `Notification sent successfully to ${notificationForm.recipient}`,
        autoClose: true,
        duration: 5000
      });

      // Reset form
      setNotificationForm({
        recipient: '',
        title: '',
        message: '',
        type: 'info',
        channels: ['in-app'],
        priority: 'medium',
        scheduledFor: ''
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Send Failed',
        message: 'Failed to send notification. Please try again.',
        autoClose: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk messaging
  const handleBulkMessage = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recipientCount = bulkForm.userGroup === 'all' ? users.length : bulkForm.customUsers.length;
      
      await notificationService.sendBulkNotification({
        ...bulkForm,
        timestamp: new Date().toISOString()
      });

      addNotification({
        type: 'success',
        title: 'Bulk Message Sent',
        message: `Message sent to ${recipientCount} users successfully`,
        autoClose: true,
        duration: 5000
      });

      // Reset form
      setBulkForm({
        userGroup: 'all',
        customUsers: [],
        title: '',
        message: '',
        channels: ['in-app'],
        templateId: '',
        scheduledFor: ''
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Bulk Send Failed',
        message: 'Failed to send bulk message. Please try again.',
        autoClose: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle template creation
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newTemplate = {
        ...templateForm,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };

      setTemplates([...templates, newTemplate]);

      addNotification({
        type: 'success',
        title: 'Template Created',
        message: `Template "${templateForm.name}" created successfully`,
        autoClose: true,
        duration: 5000
      });

      // Reset form
      setTemplateForm({
        name: '',
        title: '',
        message: '',
        type: 'general',
        variables: [],
        isActive: true
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Template Creation Failed',
        message: 'Failed to create template. Please try again.',
        autoClose: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle channel selection
  const handleChannelChange = (channel, formType) => {
    const setForm = formType === 'notification' ? setNotificationForm : setBulkForm;
    const form = formType === 'notification' ? notificationForm : bulkForm;

    setForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  // Apply template to bulk form
  const applyTemplate = (templateId) => {
    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      setBulkForm(prev => ({
        ...prev,
        title: template.title,
        message: template.message,
        templateId: templateId
      }));
    }
  };

  const tabs = [
    { id: 'send-notification', label: 'Send Notification', icon: '📤' },
    { id: 'bulk-messaging', label: 'Bulk Messaging', icon: '📢' },
    { id: 'templates', label: 'Templates', icon: '📝' },
    { id: 'history', label: 'History', icon: '📋' }
  ];

  const channels = [
    { id: 'in-app', label: 'In-App', icon: '📱' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'sms', label: 'SMS', icon: '💬' },
    { id: 'push', label: 'Push', icon: '🔔' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">User Communication</h2>
        <p className="text-gray-600 mt-1">Send notifications, manage bulk messaging, and create templates</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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

      {/* Tab Content */}
      <div className="p-6">
        {/* Send Notification Tab */}
        {activeTab === 'send-notification' && (
          <form onSubmit={handleSendNotification} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient
                </label>
                <select
                  value={notificationForm.recipient}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select recipient</option>
                  {users.map(user => (
                    <option key={user.id} value={user.email}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={notificationForm.priority}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter notification title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your message"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Channels
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {channels.map(channel => (
                  <label key={channel.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationForm.channels.includes(channel.id)}
                      onChange={() => handleChannelChange(channel.id, 'notification')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {channel.icon} {channel.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule For (Optional)
              </label>
              <input
                type="datetime-local"
                value={notificationForm.scheduledFor}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, scheduledFor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        )}

        {/* Bulk Messaging Tab */}
        {activeTab === 'bulk-messaging' && (
          <form onSubmit={handleBulkMessage} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Group
                </label>
                <select
                  value={bulkForm.userGroup}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, userGroup: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Users</option>
                  <option value="premium">Premium Users</option>
                  <option value="custom">Custom Selection</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template (Optional)
                </label>
                <select
                  value={bulkForm.templateId}
                  onChange={(e) => {
                    setBulkForm(prev => ({ ...prev, templateId: e.target.value }));
                    if (e.target.value) applyTemplate(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select template</option>
                  {templates.filter(t => t.isActive).map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {bulkForm.userGroup === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                  {users.map(user => (
                    <label key={user.id} className="flex items-center space-x-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bulkForm.customUsers.includes(user.id)}
                        onChange={(e) => {
                          setBulkForm(prev => ({
                            ...prev,
                            customUsers: e.target.checked
                              ? [...prev.customUsers, user.id]
                              : prev.customUsers.filter(id => id !== user.id)
                          }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {user.name} ({user.email})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={bulkForm.title}
                onChange={(e) => setBulkForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter message title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={bulkForm.message}
                onChange={(e) => setBulkForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your message"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Channels
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {channels.map(channel => (
                  <label key={channel.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkForm.channels.includes(channel.id)}
                      onChange={() => handleChannelChange(channel.id, 'bulk')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {channel.icon} {channel.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Bulk Message'}
              </button>
            </div>
          </form>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Create Template Form */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Create New Template</h3>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter template name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="welcome">Welcome</option>
                      <option value="transaction">Transaction</option>
                      <option value="security">Security</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter template title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={templateForm.message}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter template message (use {{variableName}} for variables)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use double curly braces for variables: {'{'}{'{'} userName {'}'}{'}'},  {'{'}{'{'} amount {'}'}{'}'},  etc.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Templates */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Existing Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800">{template.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.title}</p>
                    <p className="text-sm text-gray-500 mb-3">{template.message}</p>
                    {template.variables.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Variables:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map(variable => (
                            <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {variable}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        Edit
                      </button>
                      <button className="text-xs text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Communication History</h3>
              <div className="flex space-x-2">
                <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                  <option>All Types</option>
                  <option>Individual</option>
                  <option>Bulk</option>
                </select>
                <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <span className="text-4xl mb-2 block">📋</span>
              <p className="text-gray-500">Communication history will appear here</p>
              <p className="text-sm text-gray-400 mt-1">Send some notifications to see the history</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCommunication;