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

let approvedUsers = [
  {
    id: 'approved_001',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1555123456',
    status: 'active',
    role: 'customer',
    balance: 15000.50,
    accountNumber: 'ACC1234567890123',
    joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'approved_002',
    name: 'Bob Wilson',
    email: 'bob.wilson@example.com',
    phone: '+1555987654',
    status: 'active',
    role: 'customer',
    balance: 8750.25,
    accountNumber: 'ACC1234567890124',
    joinedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'approved_003',
    name: 'Carol Davis',
    email: 'carol.davis@example.com',
    phone: '+1555456789',
    status: 'suspended',
    role: 'customer',
    balance: 2500.00,
    accountNumber: 'ACC1234567890125',
    joinedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];
let approvalHistory = [];

// Loan applications storage
let loanApplications = [
  {
    id: 'LA001',
    applicantName: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    age: 35,
    occupation: 'Software Engineer',
    monthlyIncome: 8500,
    loanAmount: 50000,
    loanPurpose: 'Home Purchase',
    loanTerm: 240,
    creditScore: 750,
    riskLevel: 'low',
    status: 'pending',
    applicationDate: '2024-01-15',
    documents: ['Income Certificate', 'Bank Statements', 'ID Proof', 'Property Documents'],
    address: '123 Main St, City, State 12345',
    employmentType: 'Full-time',
    employer: 'Tech Corp Inc.'
  },
  {
    id: 'LA002',
    applicantName: 'Jane Doe',
    email: 'jane.doe@email.com',
    phone: '+1-555-0124',
    age: 28,
    occupation: 'Marketing Manager',
    monthlyIncome: 6500,
    loanAmount: 25000,
    loanPurpose: 'Car Purchase',
    loanTerm: 60,
    creditScore: 680,
    riskLevel: 'medium',
    status: 'pending',
    applicationDate: '2024-01-16',
    documents: ['Income Certificate', 'Bank Statements', 'ID Proof'],
    address: '456 Oak Ave, City, State 67890',
    employmentType: 'Full-time',
    employer: 'Marketing Solutions Ltd.'
  }
];

// Approved loans storage
let approvedLoans = [
  {
    id: 'AL001',
    loanApplicationId: 'LA003',
    applicantName: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    loanAmount: 30000,
    approvedAmount: 30000,
    interestRate: 8.5,
    loanTerm: 36,
    monthlyEMI: 945.21,
    processingFee: 600,
    status: 'approved',
    approvalDate: '2024-01-10',
    disbursementStatus: 'pending',
    disbursementDate: null
  }
];

// Loan disbursements storage
let loanDisbursements = [];

// Helper function to generate account number
const generateAccountNumber = () => {
  return `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

import http from 'http';
import url from 'url';

function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const { url, method } = req;
  console.log(`🔍 API Request: ${method} ${url}`);
  
  // Route: GET /api/admin/users
  if (url.startsWith('/api/admin/users') && !url.includes('/pending') && !url.includes('/history') && method === 'GET') {
    console.log(`✅ Matched admin users route`);
    
    try {
      const urlObj = new URL(url, `http://${req.headers.host}`);
      const searchParams = urlObj.searchParams;
      
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 10;
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status');
      const role = searchParams.get('role');
      
      let filteredUsers = [...approvedUsers];
      
      // Apply search filter
      if (search) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.phone.includes(search)
        );
      }
      
      // Apply status filter
      if (status && status !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === status);
      }
      
      // Apply role filter
      if (role && role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }
      
      const totalUsers = filteredUsers.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: {
          users: paginatedUsers,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers: totalUsers,
            limit: limit
          }
        }
      }));
      return;
    } catch (error) {
      console.error('Error in admin users route:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Internal server error'
      }));
      return;
    }
  }
  
  // Route: GET /api/admin/users/pending
  if (url.startsWith('/api/admin/users/pending') && method === 'GET') {
    console.log(`✅ Matched pending users route`);
    console.log(`📊 Total pending users: ${pendingUsers.length}`);
    try {
      const urlParams = new URL(url, `http://${req.headers.host}`);
      const status = urlParams.searchParams.get('status') || 'pending_approval';
      const page = parseInt(urlParams.searchParams.get('page') || '1');
      const limit = parseInt(urlParams.searchParams.get('limit') || '10');
      const search = urlParams.searchParams.get('search') || '';
      
      let filteredUsers = pendingUsers;
      
      // Filter by status
      if (status !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === status);
      }
      
      // Search functionality
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.phone.includes(search)
        );
      }
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      return res.status(200).json({
        success: true,
        data: paginatedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredUsers.length / limit),
          totalUsers: filteredUsers.length,
          hasNext: endIndex < filteredUsers.length,
          hasPrev: startIndex > 0
        }
      });
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch pending users',
        error: error.message
      }));
  return;
    }
  }
  
  // Route: GET /api/admin/users/history
  if (url.startsWith('/api/admin/users/history') && method === 'GET') {
    res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
      success: true,
      history: approvalHistory
    }));
  return;
  }
  
  // Route: GET /api/admin/users/export
  if (url.startsWith('/api/admin/users/export') && method === 'GET') {
    console.log(`✅ Matched users export route`);
    try {
      // Return CSV data for export
      const csvHeader = 'Name,Email,Phone,Status,Role,Balance,Account Number,Joined Date\n';
      const csvData = approvedUsers.map(user => 
        `"${user.name}","${user.email}","${user.phone}","${user.status}","${user.role}","${user.balance}","${user.accountNumber}","${user.joinedDate}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users_export.csv"');
      
      res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv');
  res.end(csvHeader + csvData);
  return;
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to export users',
        error: error.message
      }));
  return;
    }
  }
  
  // Route: GET /api/admin/transactions
  if (url.startsWith('/api/admin/transactions') && method === 'GET') {
    console.log(`✅ Matched admin transactions route`);
    try {
      // Mock transaction data
      const transactions = [
        {
          id: 'txn_001',
          transactionId: 'TXN001234567',
          amount: 1500.00,
          type: 'credit',
          description: 'Salary deposit',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'approved_001',
          userName: 'Alice Johnson',
          status: 'completed'
        },
        {
          id: 'txn_002',
          transactionId: 'TXN001234568',
          amount: 250.00,
          type: 'debit',
          description: 'Online purchase',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'approved_002',
          userName: 'Bob Wilson',
          status: 'completed'
        },
        {
          id: 'txn_003',
          transactionId: 'TXN001234569',
          amount: 500.00,
          type: 'credit',
          description: 'Transfer received',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          userId: 'approved_003',
          userName: 'Carol Davis',
          status: 'pending'
        }
      ];
      
      res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: true,
        data: {
          transactions,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalTransactions: transactions.length
          }
        }
      }));
  return;
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch transactions',
        error: error.message
      }));
  return;
    }
  }
  
  // Route: POST /api/admin/users/:id/ban
  if (url.match(/\/api\/admin\/users\/[^\/]+\/ban$/) && method === 'POST') {
    try {
      const userId = url.split('/')[4];
      const userIndex = approvedUsers.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
          success: false,
          message: 'User not found'
        }));
  return;
      }
      
      approvedUsers[userIndex].status = 'banned';
      
      res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: true,
        message: 'User banned successfully'
      }));
  return;
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to ban user',
        error: error.message
      }));
  return;
    }
  }
  
  // Route: POST /api/admin/users/:id/unban
  if (url.match(/\/api\/admin\/users\/[^\/]+\/unban$/) && method === 'POST') {
    try {
      const userId = url.split('/')[4];
      const userIndex = approvedUsers.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
          success: false,
          message: 'User not found'
        }));
  return;
      }
      
      approvedUsers[userIndex].status = 'active';
      
      res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: true,
        message: 'User unbanned successfully'
      }));
  return;
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to unban user',
        error: error.message
      }));
  return;
    }
  }
  
  // Route: POST /api/admin/users/:id/reset-password
  if (url.match(/\/api\/admin\/users\/[^\/]+\/reset-password$/) && method === 'POST') {
    try {
      const userId = url.split('/')[4];
      const userIndex = approvedUsers.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
          success: false,
          message: 'User not found'
        }));
  return;
      }
      
      res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: true,
        message: 'Password reset email sent successfully'
      }));
  return;
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to reset password',
        error: error.message
      }));
  return;
    }
  }
  
  // Route: POST /api/admin/users/:id/balance/add
  if (url.match(/\/api\/admin\/users\/[^\/]+\/balance\/add$/) && method === 'POST') {
    try {
      const userId = url.split('/')[4];
      const userIndex = approvedUsers.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
          success: false,
          message: 'User not found'
        }));
  return;
      }
      
      const { amount } = req.body;
      approvedUsers[userIndex].balance += parseFloat(amount);
      
      res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: true,
        message: 'Balance added successfully',
        newBalance: approvedUsers[userIndex].balance
      }));
  return;
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to add balance',
        error: error.message
      }));
  return;
    }
  }
  
  // Route: POST /api/admin/users/:id/balance/deduct
  if (url.match(/\/api\/admin\/users\/[^\/]+\/balance\/deduct$/) && method === 'POST') {
    try {
      const userId = url.split('/')[4];
      const userIndex = approvedUsers.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
          success: false,
          message: 'User not found'
        }));
  return;
      }
      
      const { amount } = req.body;
      approvedUsers[userIndex].balance -= parseFloat(amount);
      
      res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: true,
        message: 'Balance deducted successfully',
        newBalance: approvedUsers[userIndex].balance
      }));
  return;
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to deduct balance',
        error: error.message
      }));
  return;
    }
  }
  
  // Route: POST /api/admin/users/:id/suspend
  if (url.match(/\/api\/admin\/users\/[^\/]+\/suspend$/) && method === 'POST') {
    try {
      const userId = url.split('/')[4];
      const userIndex = approvedUsers.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
          success: false,
          message: 'User not found'
        }));
  return;
      }
      
      approvedUsers[userIndex].status = 'suspended';
      
      res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: true,
        message: 'User suspended successfully'
      }));
  return;
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to suspend user',
        error: error.message
      }));
  return;
    }
  }
  
  // Route: DELETE /api/admin/users/:id
  if (url.match(/\/api\/admin\/users\/[^\/]+$/) && method === 'DELETE') {
    try {
      const userId = url.split('/')[4];
      const userIndex = approvedUsers.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
          success: false,
          message: 'User not found'
        }));
  return;
      }
      
      approvedUsers.splice(userIndex, 1);
      
      res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: true,
        message: 'User deleted successfully'
      }));
  return;
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      }));
  return;
    }
  }
  
  // Route: POST /api/admin/users/:id/approve
  if (url.match(/\/api\/admin\/users\/[^\/]+\/approve$/) && method === 'POST') {
    try {
      const userId = url.split('/')[4];
      const userIndex = pendingUsers.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
          success: false,
          message: 'User not found'
        }));
  return;
      }
      
      const user = pendingUsers[userIndex];
      const accountNumber = generateAccountNumber();
      
      // Move user to approved list
      const approvedUser = {
        ...user,
        status: 'approved',
        accountNumber,
        approvalDate: new Date().toISOString(),
        approvedBy: req.body?.approvedBy || 'Admin'
      };
      
      approvedUsers.push(approvedUser);
      pendingUsers.splice(userIndex, 1);
      
      // Add to history
      approvalHistory.push({
        id: `history_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action: 'approved',
        actionDate: new Date().toISOString(),
        actionBy: req.body?.approvedBy || 'Admin',
        accountNumber,
        notes: req.body?.notes || ''
      });
      
      res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: true,
        message: 'User approved successfully',
        user: approvedUser
      }));
  return;
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to approve user',
        error: error.message
      }));
  return;
    }
  }
  
  // Route: POST /api/admin/users/:id/reject
  if (url.match(/\/api\/admin\/users\/[^\/]+\/reject$/) && method === 'POST') {
    try {
      const userId = url.split('/')[4];
      const userIndex = pendingUsers.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
          success: false,
          message: 'User not found'
        }));
  return;
      }
      
      const user = pendingUsers[userIndex];
      
      // Remove user from pending list
      pendingUsers.splice(userIndex, 1);
      
      // Add to history
      approvalHistory.push({
        id: `history_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action: 'rejected',
        actionDate: new Date().toISOString(),
        actionBy: req.body?.rejectedBy || 'Admin',
        reason: req.body?.reason || 'No reason provided',
        notes: req.body?.notes || ''
      });
      
      res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: true,
        message: 'User rejected successfully'
      }));
  return;
    } catch (error) {
      res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
        success: false,
        message: 'Failed to reject user',
        error: error.message
      }));
  return;
    }
  }
  
  // Loan Applications endpoints
  if (req.method === 'GET' && req.url === '/api/admin/loans/applications') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      applications: loanApplications
    }));
    return;
  }

  // Approve loan application
  if (req.method === 'POST' && req.url.match(/^\/api\/admin\/loans\/applications\/(.+)\/approve$/)) {
    const applicationId = req.url.match(/^\/api\/admin\/loans\/applications\/(.+)\/approve$/)[1];
    
    try {
      const application = loanApplications.find(app => app.id === applicationId);
      if (!application) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Loan application not found'
        }));
        return;
      }

      // Update application status
      application.status = 'approved';
      application.approvalDate = new Date().toISOString();

      // Create approved loan record
      const approvedLoan = {
        id: `AL${String(approvedLoans.length + 1).padStart(3, '0')}`,
        loanApplicationId: applicationId,
        applicantName: application.applicantName,
        email: application.email,
        loanAmount: application.loanAmount,
        approvedAmount: req.body?.approvedAmount || application.loanAmount,
        interestRate: req.body?.interestRate || 8.5,
        loanTerm: application.loanTerm,
        monthlyEMI: calculateEMI(req.body?.approvedAmount || application.loanAmount, req.body?.interestRate || 8.5, application.loanTerm),
        processingFee: req.body?.processingFee || Math.round((req.body?.approvedAmount || application.loanAmount) * 0.02),
        status: 'approved',
        approvalDate: new Date().toISOString(),
        disbursementStatus: 'pending',
        disbursementDate: null
      };

      approvedLoans.push(approvedLoan);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Loan application approved successfully',
        approvedLoan
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to approve loan application',
        error: error.message
      }));
      return;
    }
  }

  // Reject loan application
  if (req.method === 'POST' && req.url.match(/^\/api\/admin\/loans\/applications\/(.+)\/reject$/)) {
    const applicationId = req.url.match(/^\/api\/admin\/loans\/applications\/(.+)\/reject$/)[1];
    
    try {
      const application = loanApplications.find(app => app.id === applicationId);
      if (!application) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Loan application not found'
        }));
        return;
      }

      // Update application status
      application.status = 'rejected';
      application.rejectionDate = new Date().toISOString();
      application.rejectionReason = req.body?.reason || 'Application does not meet criteria';

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Loan application rejected successfully'
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to reject loan application',
        error: error.message
      }));
      return;
    }
  }

  // Get approved loans
  if (req.method === 'GET' && req.url === '/api/admin/loans/approved') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      loans: approvedLoans
    }));
    return;
  }

  // Disburse loan
  if (req.method === 'POST' && req.url.match(/^\/api\/admin\/loans\/(.+)\/disburse$/)) {
    const loanId = req.url.match(/^\/api\/admin\/loans\/(.+)\/disburse$/)[1];
    
    try {
      const loan = approvedLoans.find(l => l.id === loanId);
      if (!loan) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Approved loan not found'
        }));
        return;
      }

      if (loan.disbursementStatus === 'disbursed') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Loan already disbursed'
        }));
        return;
      }

      // Update loan disbursement status
      loan.disbursementStatus = 'disbursed';
      loan.disbursementDate = new Date().toISOString();

      // Create disbursement record
      const disbursement = {
        id: `DIS${String(loanDisbursements.length + 1).padStart(3, '0')}`,
        loanId: loanId,
        applicantName: loan.applicantName,
        email: loan.email,
        amount: loan.approvedAmount,
        disbursementDate: new Date().toISOString(),
        disbursementMethod: req.body?.method || 'Bank Transfer',
        accountNumber: req.body?.accountNumber || 'XXXX-XXXX-XXXX',
        status: 'completed'
      };

      loanDisbursements.push(disbursement);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Loan disbursed successfully',
        disbursement
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to disburse loan',
        error: error.message
      }));
      return;
    }
  }

  // Get loan disbursements
  if (req.method === 'GET' && req.url === '/api/admin/loans/disbursements') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      disbursements: loanDisbursements
    }));
    return;
  }

  // Helper function to calculate EMI
  function calculateEMI(principal, annualRate, termInMonths) {
    const monthlyRate = annualRate / 100 / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) / 
                (Math.pow(1 + monthlyRate, termInMonths) - 1);
    return Math.round(emi * 100) / 100;
  }

  // Default response for unmatched routes
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    message: "IB LTD API is working!",
    status: "success",
    version: "12.0.0",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    platform: "Railway"
  }));
}

// Create and start the server
const PORT = process.env.PORT || 5000;
const server = http.createServer(handler);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});

export default handler;