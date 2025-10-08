const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage (replace with database in production)
let pendingUsers = [
  {
    id: 'user_001',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: '123 Main St, City, Country',
    registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending_approval',
    nationality: 'US',
    dateOfBirth: '1990-05-15',
    occupation: 'Software Engineer',
    monthlyIncome: 75000,
    documents: {
      nid: 'nid_001.pdf',
      passport: 'passport_001.pdf',
      utilityBill: 'utility_001.pdf'
    },
    riskScore: 25,
    creditScore: 720,
    verificationStatus: {
      email: true,
      phone: true,
      address: false,
      identity: true
    }
  },
  {
    id: 'user_002',
    name: 'Jane Smith',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1987654321',
    address: '456 Oak Ave, City, Country',
    registrationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending_approval',
    nationality: 'CA',
    dateOfBirth: '1985-08-22',
    occupation: 'Marketing Manager',
    monthlyIncome: 65000,
    documents: {
      nid: 'nid_002.pdf',
      drivingLicense: 'license_002.pdf',
      salarySlip: 'salary_002.pdf'
    },
    riskScore: 15,
    creditScore: 780,
    verificationStatus: {
      email: true,
      phone: false,
      address: true,
      identity: true
    }
  }
];

let approvedUsers = [];
let approvalHistory = [];

// Helper function to generate account number
const generateAccountNumber = () => {
  return `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Helper function to send email notification (mock)
const sendEmailNotification = async (email, type, data = {}) => {
  console.log(`📧 Email notification sent to ${email}:`, { type, data });
  // In production, integrate with email service like SendGrid, AWS SES, etc.
  return true;
};

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get all pending user registrations
app.get('/api/admin/users/pending', (req, res) => {
  console.log(`📋 Fetching pending users - Query:`, req.query);
  try {
    const { status = 'pending_approval', page = 1, limit = 10, search = '' } = req.query;
    
    let filteredUsers = pendingUsers;
    console.log(`📊 Total pending users in memory: ${pendingUsers.length}`);
    
    // Filter by status
    if (status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    console.log(`📊 After status filter (${status}): ${filteredUsers.length}`);
    
    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(search)
      );
      console.log(`📊 After search filter (${search}): ${filteredUsers.length}`);
    }
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    const response = {
      success: true,
      data: paginatedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredUsers.length / parseInt(limit)),
        totalUsers: filteredUsers.length,
        hasNext: endIndex < filteredUsers.length,
        hasPrev: startIndex > 0
      }
    };
    
    console.log(`✅ Returning ${paginatedUsers.length} users`);
    res.json(response);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending users',
      error: error.message
    });
  }
});

// Get specific user details
app.get('/api/admin/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = pendingUsers.find(u => u.id === id) || approvedUsers.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
});

// Approve user registration
app.post('/api/admin/users/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, adminId, adminName } = req.body;
    
    const userIndex = pendingUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = pendingUsers[userIndex];
    const accountNumber = generateAccountNumber();
    
    // Update user status and add account details
    const approvedUser = {
      ...user,
      status: 'approved',
      accountNumber,
      balance: 0,
      accounts: [{
        id: `SAVINGS_${Date.now()}`,
        type: 'savings',
        accountNumber,
        balance: 0,
        status: 'active',
        openedDate: new Date().toISOString()
      }],
      cards: [],
      approvedDate: new Date().toISOString(),
      approvedBy: adminId,
      notes: notes || ''
    };
    
    // Move user from pending to approved
    pendingUsers.splice(userIndex, 1);
    approvedUsers.push(approvedUser);
    
    // Add to approval history
    const historyEntry = {
      id: `ACT${Date.now()}`,
      userId: id,
      adminId: adminId,
      adminName: adminName || 'Admin User',
      action: 'approved',
      timestamp: new Date().toISOString(),
      notes: notes || ''
    };
    approvalHistory.unshift(historyEntry);
    
    // Send welcome email
    await sendEmailNotification(user.email, 'welcome', {
      name: user.name,
      accountNumber: accountNumber
    });
    
    console.log(`✅ User ${user.name} approved by ${adminName || 'Admin'}`);
    
    res.json({
      success: true,
      message: `User ${user.name} has been approved successfully`,
      data: {
        user: approvedUser,
        accountNumber: accountNumber
      }
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user',
      error: error.message
    });
  }
});

// Reject user registration
app.post('/api/admin/users/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes, adminId, adminName } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const userIndex = pendingUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = pendingUsers[userIndex];
    
    // Update user status
    const rejectedUser = {
      ...user,
      status: 'rejected',
      rejectedDate: new Date().toISOString(),
      rejectedBy: adminId,
      rejectionReason: reason,
      notes: notes || ''
    };
    
    // Update user in pending list (keep for record)
    pendingUsers[userIndex] = rejectedUser;
    
    // Add to approval history
    const historyEntry = {
      id: `ACT${Date.now()}`,
      userId: id,
      adminId: adminId,
      adminName: adminName || 'Admin User',
      action: 'rejected',
      timestamp: new Date().toISOString(),
      reason: reason,
      notes: notes || ''
    };
    approvalHistory.unshift(historyEntry);
    
    // Send rejection email
    await sendEmailNotification(user.email, 'rejection', {
      name: user.name,
      reason: reason
    });
    
    console.log(`❌ User ${user.name} rejected by ${adminName || 'Admin'}: ${reason}`);
    
    res.json({
      success: true,
      message: `User ${user.name} has been rejected`,
      data: {
        user: rejectedUser,
        reason: reason
      }
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user',
      error: error.message
    });
  }
});

// Update user status (for under review, requires documents, etc.)
app.put('/api/admin/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, adminId, adminName } = req.body;
    
    const validStatuses = ['pending_approval', 'under_review', 'requires_documents', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const userIndex = pendingUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user status
    pendingUsers[userIndex] = {
      ...pendingUsers[userIndex],
      status: status,
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString(),
      notes: notes || pendingUsers[userIndex].notes
    };
    
    // Add to approval history
    const historyEntry = {
      id: `ACT${Date.now()}`,
      userId: id,
      adminId: adminId,
      adminName: adminName || 'Admin User',
      action: status === 'under_review' ? 'under_review' : 'requested_documents',
      timestamp: new Date().toISOString(),
      notes: notes || ''
    };
    approvalHistory.unshift(historyEntry);
    
    console.log(`📝 User ${pendingUsers[userIndex].name} status updated to ${status} by ${adminName || 'Admin'}`);
    
    res.json({
      success: true,
      message: `User status updated to ${status.replace('_', ' ')}`,
      data: pendingUsers[userIndex]
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

// Get approval history
app.get('/api/admin/users/history', (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    
    let filteredHistory = approvalHistory;
    
    // Filter by user ID if provided
    if (userId) {
      filteredHistory = filteredHistory.filter(entry => entry.userId === userId);
    }
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = filteredHistory.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredHistory.length / parseInt(limit)),
        totalEntries: filteredHistory.length
      }
    });
  } catch (error) {
    console.error('Error fetching approval history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approval history',
      error: error.message
    });
  }
});

// Get dashboard statistics
app.get('/api/admin/dashboard/stats', (req, res) => {
  try {
    const stats = {
      totalPending: pendingUsers.filter(u => u.status === 'pending_approval').length,
      totalUnderReview: pendingUsers.filter(u => u.status === 'under_review').length,
      totalRequiresDocuments: pendingUsers.filter(u => u.status === 'requires_documents').length,
      totalApproved: approvedUsers.length,
      totalRejected: pendingUsers.filter(u => u.status === 'rejected').length,
      recentActivity: approvalHistory.slice(0, 5)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// Create new user (Admin only)
app.post('/api/admin/users/create', async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phone, 
      address, 
      accountType = 'savings', 
      initialBalance = 0, 
      password,
      adminId,
      adminName 
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fullName, email, phone, and address are required'
      });
    }

    // Check if email already exists in pending or approved users
    const emailExists = [...pendingUsers, ...approvedUsers].some(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Generate unique user ID and account number
    const userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const accountNumber = generateAccountNumber();

    // Create new user object
    const newUser = {
      id: userId,
      name: fullName,
      firstName: fullName.split(' ')[0],
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      email: email.toLowerCase(),
      phone,
      address,
      accountNumber,
      balance: parseFloat(initialBalance) || 0,
      accountType: accountType || 'savings',
      status: 'approved', // Admin-created users are automatically approved
      registrationDate: new Date().toISOString(),
      createdBy: 'admin',
      createdByAdmin: adminId,
      createdByAdminName: adminName || 'Admin User',
      nationality: 'Not specified',
      dateOfBirth: null,
      occupation: 'Not specified',
      monthlyIncome: null,
      documents: {},
      riskScore: 0,
      creditScore: null,
      verificationStatus: {
        email: true,
        phone: true,
        address: true,
        identity: true
      },
      accounts: [{
        id: `${accountType.toUpperCase()}_${Date.now()}`,
        type: accountType,
        accountNumber,
        balance: parseFloat(initialBalance) || 0,
        status: 'active',
        openedDate: new Date().toISOString()
      }],
      cards: [],
      approvedDate: new Date().toISOString(),
      approvedBy: adminId,
      notes: `User created by admin: ${adminName || 'Admin User'}`
    };

    // Add to approved users list
    approvedUsers.push(newUser);

    // Add to approval history
    const historyEntry = {
      id: `ACT${Date.now()}`,
      userId: userId,
      adminId: adminId,
      adminName: adminName || 'Admin User',
      action: 'created',
      timestamp: new Date().toISOString(),
      notes: `New user created by admin with initial balance: ৳${initialBalance}`
    };
    approvalHistory.unshift(historyEntry);

    // Send welcome email (mock)
    await sendEmailNotification(email, 'admin_created', {
      name: fullName,
      accountNumber: accountNumber,
      initialBalance: initialBalance
    });

    console.log(`✅ New user ${fullName} created by admin ${adminName || 'Admin'}`);

    res.status(201).json({
      success: true,
      message: `User ${fullName} has been created successfully`,
      data: {
        user: newUser,
        accountNumber: accountNumber
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "IB LTD API is working!",
    status: "success",
    timestamp: new Date().toISOString(),
    version: "12.0.0",
    endpoints: {
      pendingUsers: '/api/admin/users/pending',
      approveUser: '/api/admin/users/:id/approve',
      rejectUser: '/api/admin/users/:id/reject',
      approvalHistory: '/api/admin/approval-history',
      createUser: '/api/admin/users/create'
    }
  });
});

// Serve static files for admin panel
app.use('/admin', express.static('customer-portal/build'));

// Catch-all for admin routes to serve React app
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'customer-portal/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler - catch all routes that don't match
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found`
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 IB LTD API Server running on port ${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/`);
    console.log(`👥 Pending users: ${pendingUsers.length}`);
    console.log(`✅ Approved users: ${approvedUsers.length}`);
  });
}

module.exports = app;