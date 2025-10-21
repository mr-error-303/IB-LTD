import http from 'http';
import url from 'url';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Mock bcrypt and jwt for demonstration (in production, use actual packages)
const bcrypt = {
  hash: async (password, saltRounds) => {
    // Simple hash simulation - in production use actual bcrypt
    return `$2b$${saltRounds}$${crypto.createHash('sha256').update(password).digest('hex')}`;
  },
  compare: async (password, hash) => {
    // Simple comparison - in production use actual bcrypt
    const expectedHash = await bcrypt.hash(password, 10);
    return hash.includes(crypto.createHash('sha256').update(password).digest('hex'));
  }
};

const jwt = {
  sign: (payload, secret, options) => {
    // Simple JWT simulation - in production use actual jsonwebtoken
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payloadStr = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + (options?.expiresIn || 86400000) })).toString('base64');
    const signature = crypto.createHmac('sha256', secret).update(`${header}.${payloadStr}`).digest('base64');
    return `${header}.${payloadStr}.${signature}`;
  },
  verify: (token, secret) => {
    try {
      const [header, payload, signature] = token.split('.');
      const expectedSignature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64');
      if (signature !== expectedSignature) throw new Error('Invalid signature');
      
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
      if (decodedPayload.exp < Date.now()) throw new Error('Token expired');
      
      return decodedPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};

const JWT_SECRET = 'your-secret-key-here'; // In production, use environment variable

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to parse multipart/form-data
function parseMultipartBody(req) {
  return new Promise((resolve, reject) => {
    const uploadFields = upload.fields([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'nidFrontPhoto', maxCount: 1 },
      { name: 'nidBackPhoto', maxCount: 1 }
    ]);
    
    uploadFields(req, {}, (err) => {
      if (err) {
        reject(err);
      } else {
        // Extract text fields and file paths
        const body = { ...req.body };
        
        // Add file paths to body
        if (req.files) {
          if (req.files.profilePhoto) {
            body.profilePhoto = req.files.profilePhoto[0].path;
          }
          if (req.files.nidFrontPhoto) {
            body.nidFrontPhoto = req.files.nidFrontPhoto[0].path;
          }
          if (req.files.nidBackPhoto) {
            body.nidBackPhoto = req.files.nidBackPhoto[0].path;
          }
        }
        
        resolve(body);
      }
    });
  });
}

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
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    password: 'password123', // Plain text for testing
    phone: '+1555123456',
    status: 'active',
    role: 'customer',
    balance: 45000.50, // Updated to reflect loan disbursement
    loanBalance: 30000, // Loan amount added to loan balance
    accountNumber: 'ACC1234567890123',
    joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    address: '789 Pine St, City, Country',
    dateOfBirth: '1988-03-10'
  },
  {
    id: 'approved_002',
    name: 'Bob Wilson',
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob.wilson@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // hashed 'password123'
    phone: '+1555987654',
    status: 'active',
    role: 'customer',
    balance: 8750.25,
    loanBalance: 0,
    accountNumber: 'ACC1234567890124',
    joinedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    address: '321 Oak Ave, City, Country',
    dateOfBirth: '1992-07-22'
  },
  {
    id: 'approved_003',
    name: 'Carol Davis',
    firstName: 'Carol',
    lastName: 'Davis',
    email: 'carol.davis@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // hashed 'password123'
    phone: '+1555456789',
    status: 'suspended',
    role: 'customer',
    balance: 2500.00,
    loanBalance: 0,
    accountNumber: 'ACC1234567890125',
    joinedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    address: '654 Elm St, City, Country',
    dateOfBirth: '1985-11-15'
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
    userId: 'approved_001',
    loanAmount: 30000,
    approvedAmount: 30000,
    interestRate: 8.5,
    loanTerm: 36,
    monthlyEMI: 945.21,
    processingFee: 600,
    status: 'active',
    approvalDate: '2024-01-10',
    disbursementStatus: 'disbursed',
    disbursementDate: '2024-01-12',
    installments: [
      {
        id: 'INST_001_1',
        installmentNumber: 1,
        dueDate: '2024-02-12',
        amount: 945.21,
        principalAmount: 732.71,
        interestAmount: 212.50,
        status: 'pending',
        paidDate: null,
        paidAmount: 0
      },
      {
        id: 'INST_001_2',
        installmentNumber: 2,
        dueDate: '2024-03-12',
        amount: 945.21,
        principalAmount: 737.90,
        interestAmount: 207.31,
        status: 'pending',
        paidDate: null,
        paidAmount: 0
      }
    ]
  }
];

// Loan disbursements storage
let loanDisbursements = [];

// Helper function to generate account number
const generateAccountNumber = () => {
  return `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Admin users for authentication
const adminUsers = [
  {
    id: 'admin_001',
    email: 'admin@iblimited.com',
    password: 'admin123', // In production, this should be hashed
    name: 'Admin User',
    role: 'super_admin',
    permissions: ['all']
  }
];

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  
  // Check for at least one uppercase letter, one lowercase letter, and one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber;
};

// Admin authentication middleware
function verifyAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify admin role
    if (!decoded.role || !['admin', 'super_admin'].includes(decoded.role)) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

// Check if route requires admin authentication
function isAdminRoute(url) {
  return url.startsWith('/api/admin/') && !url.includes('/api/admin/auth/login');
}

// Helper function to parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function handler(req, res) {
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
  
  // Admin route protection middleware
  if (isAdminRoute(url)) {
    const adminUser = verifyAdminToken(req);
    if (!adminUser) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Unauthorized: Admin access required',
        error: 'ADMIN_AUTH_REQUIRED'
      }));
      return;
    }
    // Attach admin user to request for use in routes
    req.adminUser = adminUser;
  }
  
  // Route: GET /api/auth/check-email - Check email uniqueness
  if (url.startsWith('/api/auth/check-email') && method === 'GET') {
    try {
      const urlParams = new URL(url, `http://${req.headers.host}`);
      const email = urlParams.searchParams.get('email');
      
      if (!email) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Email parameter is required'
        }));
        return;
      }
      
      // Check if email exists in pending or approved users
      const emailExists = pendingUsers.some(user => user.email === email) || 
                         approvedUsers.some(user => user.email === email);
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        available: !emailExists
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to check email availability'
      }));
      return;
    }
  }

  // Route: POST /api/auth/register
  if (url === '/api/auth/register' && method === 'POST') {
    console.log(`✅ Matched user registration route`);
    
    try {
      // Check if request is multipart/form-data (for file uploads)
      const contentType = req.headers['content-type'] || '';
      let body;
      
      if (contentType.includes('multipart/form-data')) {
        body = await parseMultipartBody(req);
      } else {
        body = await parseBody(req);
      }
      
      console.log('📝 Registration request body:', body);
      
      const { 
        fullName,
        firstName, 
        lastName, 
        email, 
        password, 
        confirmPassword, 
        phoneNumber,
        phone,
        dateOfBirth, 
        address,
        nationalId,
        username,
        securityQuestion,
        securityAnswer,
        profilePhoto,
        nidFrontPhoto,
        nidBackPhoto,
        nationality,
        occupation,
        monthlyIncome,
        agreeToTerms
      } = body;
      
      // Function to generate account number - IB-{8 random digits}
      const generateAccountNumber = () => {
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000); // 8 random digits
        return `IB-${randomDigits}`;
      };
      
      // Validation
      const errors = [];
      
      // Full name validation
      if (!fullName || fullName.trim().length < 2) {
        errors.push('Full name is required and must be at least 2 characters');
      }
      
      if (!validateEmail(email)) {
        errors.push('Please enter a valid email address');
      }
      
      if (!validatePassword(password)) {
        errors.push('Password must be at least 8 characters long and contain uppercase, lowercase, and number');
      }
      
      // Phone validation - must be exactly 11 digits
      const phoneToValidate = phone || phoneNumber;
      if (!phoneToValidate) {
        errors.push('Phone number is required');
      } else {
        const cleanPhone = phoneToValidate.replace(/\D/g, '');
        if (cleanPhone.length !== 11) {
          errors.push('Phone number must be exactly 11 digits');
        }
      }
      
      // Username validation
      if (!username || username.trim().length < 3) {
        errors.push('Username is required and must be at least 3 characters');
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
      }
      
      // Check email uniqueness
      const existingUser = [...pendingUsers, ...approvedUsers].find(user => user.email === email);
      if (existingUser) {
        errors.push('An account with this email already exists');
      }
      
      // Check phone uniqueness
      const phoneToCheck = phoneNumber || phone;
      const existingPhone = [...pendingUsers, ...approvedUsers].find(user => 
        user.phone === phoneToCheck || user.phoneNumber === phoneToCheck
      );
      if (existingPhone) {
        errors.push('An account with this phone number already exists');
      }
      
      // Check username uniqueness (if provided)
      if (username) {
        const existingUsername = [...pendingUsers, ...approvedUsers].find(user => user.username === username);
        if (existingUsername) {
          errors.push('This username is already taken');
        }
      }
      
      // Check national ID uniqueness (if provided)
      if (nationalId) {
        const existingNationalId = [...pendingUsers, ...approvedUsers].find(user => user.nationalId === nationalId);
        if (existingNationalId) {
          errors.push('An account with this National ID already exists');
        }
      }
      
      if (errors.length > 0) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Validation failed',
          errors: errors
        }));
        return;
      }
      
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate unique account number
        const accountNumber = generateAccountNumber();
        
        // Create new user
        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          accountNumber: accountNumber,
          name: fullName,
          fullName: fullName,
          email,
          password: hashedPassword,
          phone: phoneToValidate,
          phoneNumber: phoneToValidate,
          username: username,
          registrationDate: new Date().toISOString(),
          status: 'pending_approval',
          role: 'customer',
          balance: 0,
          verificationStatus: {
            email: false,
            phone: false,
            address: false,
            identity: false
          },
          riskScore: Math.floor(Math.random() * 50) + 10, // Random risk score for demo
          creditScore: Math.floor(Math.random() * 300) + 500 // Random credit score for demo
        };
        
        // Add to pending users
        pendingUsers.push(newUser);
        
        const userName = fullName;
        console.log(`✅ New user registered: ${userName} (${email}) - Account: ${accountNumber}`);
        console.log(`📊 Total pending users: ${pendingUsers.length}`);
        
        // Simulate real-time notification to admin (in a real app, this would use WebSockets or Server-Sent Events)
        console.log(`🔔 Admin notification: New user registration - ${userName}`);
        
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          message: `Registration submitted. Your account number: ${accountNumber}`,
          user: {
            id: newUser.id,
            accountNumber: accountNumber,
            name: userName,
            email: email,
            status: 'pending_approval'
          }
        }));
        return;
      } catch (hashError) {
        console.error('Password hashing error:', hashError);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Failed to process registration'
        }));
        return;
      }
    } catch (parseError) {
      console.error('Body parsing error:', parseError);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Invalid request body'
      }));
      return;
    }
  }
  
  // Route: POST /api/auth/login
  if (url === '/api/auth/login' && method === 'POST') {
    console.log(`✅ Matched user login route`);
    
    try {
      const body = await parseBody(req);
      console.log(`🔍 Parsed body:`, body);
      const { email, username, accountNumber, password } = body;
      
      // Accept either email, username, or accountNumber as login identifier
      const loginIdentifier = email || username || accountNumber;
      
      // Validation
      if (!loginIdentifier || !password) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Username/Email/Account Number and password are required'
        }));
        return;
      }
      
      // Find user in approved users by email, username, or account number
      const user = approvedUsers.find(u => 
        u.email === loginIdentifier || 
        u.name === loginIdentifier || 
        u.accountNumber === loginIdentifier
      );
      console.log(`🔍 Found user:`, user ? 'Yes' : 'No');
      
      if (!user) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid email or password'
        }));
        return;
      }
      
      // Check account status
      if (user.status === 'suspended') {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Your account has been suspended. Please contact support.'
        }));
        return;
      }
      
      if (user.status === 'banned') {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Your account has been banned. Please contact support.'
        }));
        return;
      }
      
      if (user.status !== 'active') {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Your account is not active. Please contact support.'
        }));
        return;
      }
      
      // Verify password
      console.log(`🔍 Comparing password for user: ${email}`);
      console.log(`🔍 Stored password: ${user.password}`);
      console.log(`🔍 Input password: ${password}`);
      
      // For testing - use plain text comparison temporarily
      const passwordMatch = password === user.password;
      console.log(`🔍 Password match result: ${passwordMatch}`);
      
      if (!passwordMatch) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid email or password'
        }));
        return;
      }
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      
      // Check if this is the user's first login (password change required)
      const isFirstLogin = user.isFirstLogin || false;
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        }, 
        JWT_SECRET, 
        { expiresIn: 86400000 } // 24 hours
      );
      
      console.log(`✅ User logged in: ${loginIdentifier}`);
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Login successful',
        token: token,
        isFirstLogin: isFirstLogin,
        user: {
          id: user.id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          balance: user.balance,
          loanBalance: user.loanBalance || 0,
          accountNumber: user.accountNumber,
          lastLogin: user.lastLogin
        }
      }));

      } catch (error) {
      console.error('Login error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Login failed. Please try again.',
        error: error.message
      }));
    }
    return;
  }

  // Route: POST /api/admin/auth/login
  if (url === '/api/admin/auth/login' && method === 'POST') {
    console.log(`✅ Matched admin login route`);
    
    parseBody(req).then(body => {
      const { email, password } = body;
      
      // Find admin user
      const admin = adminUsers.find(user => user.email === email && user.password === password);
      
      if (admin) {
        // Generate JWT token with admin role
        const token = jwt.sign(
          {
            id: admin.id,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          message: 'Admin login successful',
          token: token,
          user: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            permissions: admin.permissions
          }
        }));
      } else {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid admin credentials'
        }));
      }
    }).catch(error => {
      console.error('Error parsing request body:', error);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Invalid request body'
      }));
    });
    return;
  }
  
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
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: paginatedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredUsers.length / limit),
          totalUsers: filteredUsers.length,
          hasNext: endIndex < filteredUsers.length,
          hasPrev: startIndex > 0
        }
      }));
      return;
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
        status: 'active',
        accountNumber,
        balance: 0,
        approvalDate: new Date().toISOString(),
        approvedBy: 'Admin'
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
        actionBy: 'Admin',
        accountNumber,
        notes: ''
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
        actionBy: 'Admin',
        reason: 'No reason provided',
        notes: ''
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

  // Route: GET /api/admin/dashboard/stats - Get dashboard statistics
  if (url === '/api/admin/dashboard/stats' && method === 'GET') {
    try {
      const totalUsers = approvedUsers.length;
      const activeUsers = approvedUsers.filter(user => user.status === 'active').length;
      const pendingApprovals = pendingUsers.length;
      const securityAlerts = 3; // Mock data
      
      // Calculate transaction stats (mock data for now)
      const totalTransactions = 15420;
      const totalAmount = 2450000;
      const pendingTransactions = 23;
      
      // Loan statistics
      const totalLoanApplications = loanApplications.length;
      const pendingLoanApplications = loanApplications.filter(loan => loan.status === 'pending').length;
      const approvedLoans = approvedLoans.length;
      const totalLoanAmount = approvedLoans.reduce((sum, loan) => sum + loan.approvedAmount, 0);
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          totalTransactions,
          totalAmount,
          pendingTransactions,
          securityAlerts,
          pendingApprovals,
          systemHealth: 'excellent',
          totalLoanApplications,
          pendingLoanApplications,
          approvedLoans: approvedLoans.length,
          totalLoanAmount
        }
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch dashboard stats'
      }));
      return;
    }
  }

  // Route: GET /api/admin/dashboard/activities - Get recent user activities
  if (url === '/api/admin/dashboard/activities' && method === 'GET') {
    try {
      // Mock recent activities
      const activities = [
        {
          id: 'ACT001',
          userId: 'USER001',
          userName: 'John Doe',
          userEmail: 'john.doe@email.com',
          action: 'Login',
          details: 'Successful login from mobile app',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          ipAddress: '192.168.1.100',
          status: 'success'
        },
        {
          id: 'ACT002',
          userId: 'USER002',
          userName: 'Jane Smith',
          userEmail: 'jane.smith@email.com',
          action: 'Transfer',
          details: 'Initiated transfer of ৳25,000',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          ipAddress: '192.168.1.101',
          status: 'pending'
        },
        {
          id: 'ACT003',
          userId: 'USER003',
          userName: 'Bob Johnson',
          userEmail: 'bob.johnson@email.com',
          action: 'Failed Login',
          details: 'Multiple failed login attempts',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          ipAddress: '192.168.1.102',
          status: 'failed'
        }
      ];
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: activities
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch activities'
      }));
      return;
    }
  }

  // Route: GET /api/admin/transactions/pending - Get pending transactions
  if (url === '/api/admin/transactions/pending' && method === 'GET') {
    try {
      // Mock pending transactions
      const pendingTransactions = [
        {
          id: 'TXN001',
          userId: 'USER002',
          userName: 'Jane Smith',
          type: 'transfer',
          amount: 25000,
          description: 'Transfer to savings account',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'pending_approval'
        },
        {
          id: 'TXN002',
          userId: 'USER004',
          userName: 'Alice Brown',
          type: 'withdrawal',
          amount: 50000,
          description: 'ATM withdrawal',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'pending_approval'
        }
      ];
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: pendingTransactions
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch pending transactions'
      }));
      return;
    }
  }

  // Route: POST /api/admin/transactions/:id/approve - Approve transaction
  if (url.match(/\/api\/admin\/transactions\/[^\/]+\/approve$/) && method === 'POST') {
    try {
      const transactionId = url.split('/')[4];
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Transaction approved successfully'
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to approve transaction'
      }));
      return;
    }
  }

  // Route: POST /api/admin/transactions/:id/reject - Reject transaction
  if (url.match(/\/api\/admin\/transactions\/[^\/]+\/reject$/) && method === 'POST') {
    try {
      const transactionId = url.split('/')[4];
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Transaction rejected successfully'
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to reject transaction'
      }));
      return;
    }
  }

  // Route: PUT /api/admin/users/:id - Update user information
  if (url.match(/\/api\/admin\/users\/[^\/]+$/) && method === 'PUT') {
    try {
      const userId = url.split('/')[4];
      const body = await parseBody(req);
      
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
      
      // Update user data
      approvedUsers[userIndex] = { ...approvedUsers[userIndex], ...body };
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'User updated successfully',
        user: approvedUsers[userIndex]
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to update user'
      }));
      return;
    }
  }

  // Route: POST /api/admin/users/:id/suspend - Suspend user account
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
        message: 'Failed to suspend user'
      }));
      return;
    }
  }

  // Route: POST /api/admin/users/:id/activate - Activate user account
  if (url.match(/\/api\/admin\/users\/[^\/]+\/activate$/) && method === 'POST') {
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
        message: 'User activated successfully'
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to activate user'
      }));
      return;
    }
  }

  // Route: POST /api/admin/users/:id/reset-password - Reset user password
  if (url.match(/\/api\/admin\/users\/[^\/]+\/reset-password$/) && method === 'POST') {
    try {
      const userId = url.split('/')[4];
      const body = await parseBody(req);
      const { newPassword, sendEmail = true } = body;
      
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
      
      // Generate temporary password if not provided
      const tempPassword = newPassword || Math.random().toString(36).slice(-8);
      
      // Update user password (in real app, this would be hashed)
      approvedUsers[userIndex].password = tempPassword;
      approvedUsers[userIndex].passwordResetRequired = true;
      approvedUsers[userIndex].passwordResetAt = new Date().toISOString();
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Password reset successfully',
        tempPassword: tempPassword,
        emailSent: sendEmail
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to reset password'
      }));
      return;
    }
  }

  // Route: PUT /api/admin/users/:id/balance - Update user balance
  if (url.match(/\/api\/admin\/users\/[^\/]+\/balance$/) && method === 'PUT') {
    try {
      const userId = url.split('/')[4];
      const body = await parseBody(req);
      const { amount, operation, reason } = body; // operation: 'add', 'subtract', 'set'
      
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
      
      const user = approvedUsers[userIndex];
      const currentBalance = user.balance || 0;
      let newBalance = currentBalance;
      
      switch (operation) {
        case 'add':
          newBalance = currentBalance + amount;
          break;
        case 'subtract':
          newBalance = Math.max(0, currentBalance - amount); // Prevent negative balance
          break;
        case 'set':
          newBalance = Math.max(0, amount);
          break;
        default:
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid operation. Use add, subtract, or set'
          }));
          return;
      }
      
      // Update user balance
      approvedUsers[userIndex].balance = newBalance;
      approvedUsers[userIndex].lastBalanceUpdate = new Date().toISOString();
      
      // Log balance change
      const balanceLog = {
        id: Date.now().toString(),
        userId: userId,
        adminId: 'admin-001',
        operation: operation,
        previousBalance: currentBalance,
        newBalance: newBalance,
        amount: amount,
        reason: reason || 'Admin balance adjustment',
        timestamp: new Date().toISOString()
      };
      
      // Store balance history (in real app, this would be in a database)
      if (!global.balanceHistory) {
        global.balanceHistory = [];
      }
      global.balanceHistory.push(balanceLog);
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Balance updated successfully',
        previousBalance: currentBalance,
        newBalance: newBalance,
        operation: operation
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to update balance'
      }));
      return;
    }
  }

  // Route: GET /api/admin/users/:id/balance-history - Get user balance history
  if (url.match(/\/api\/admin\/users\/[^\/]+\/balance-history$/) && method === 'GET') {
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
      
      const userBalanceHistory = (global.balanceHistory || []).filter(log => log.userId === userId);
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: {
          userId: userId,
          currentBalance: approvedUsers[userIndex].balance || 0,
          history: userBalanceHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        }
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to get balance history'
      }));
      return;
    }
  }

  // Route: GET /api/admin/transactions - Get all transactions for monitoring
  if (url.startsWith('/api/admin/transactions') && !url.includes('/pending') && method === 'GET') {
    try {
      const urlObj = new URL(url, `http://${req.headers.host}`);
      const searchParams = urlObj.searchParams;
      
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 20;
      const status = searchParams.get('status');
      const type = searchParams.get('type');
      const channel = searchParams.get('channel');
      const riskLevel = searchParams.get('riskLevel');
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      const amountFrom = searchParams.get('amountFrom');
      const amountTo = searchParams.get('amountTo');
      const search = searchParams.get('search');

      // Mock transaction data
      let transactions = [];
      const types = ['deposit', 'withdrawal', 'transfer', 'payment', 'fee'];
      const statuses = ['completed', 'pending', 'failed', 'flagged', 'under_review'];
      const channels = ['online', 'mobile', 'atm', 'branch', 'api'];
      
      for (let i = 0; i < 200; i++) {
        const txType = types[Math.floor(Math.random() * types.length)];
        const txStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const amount = Math.floor(Math.random() * 1000000) + 100;
        const riskScore = Math.floor(Math.random() * 100);
        
        transactions.push({
          id: `TXN${String(i + 1).padStart(6, '0')}`,
          userId: `USER${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`,
          userName: `User ${Math.floor(Math.random() * 1000) + 1}`,
          userEmail: `user${Math.floor(Math.random() * 1000) + 1}@example.com`,
          type: txType,
          amount,
          currency: 'BDT',
          description: getTransactionDescription(txType),
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: txStatus,
          channel: channels[Math.floor(Math.random() * channels.length)],
          reference: `REF${Date.now()}${i}`,
          fees: Math.floor(amount * 0.01),
          balanceBefore: Math.floor(Math.random() * 500000),
          balanceAfter: Math.floor(Math.random() * 500000),
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          deviceInfo: 'Chrome/Windows',
          location: 'Dhaka, Bangladesh',
          riskScore,
          flaggedReasons: riskScore > 70 ? ['High amount', 'Unusual time'] : undefined,
          recipientName: txType === 'transfer' ? `Recipient ${Math.floor(Math.random() * 100)}` : undefined,
          recipientAccount: txType === 'transfer' ? `ACC${Math.floor(Math.random() * 100000)}` : undefined
        });
      }

      function getTransactionDescription(type) {
        switch (type) {
          case 'deposit': return 'Account Deposit';
          case 'withdrawal': return 'Cash Withdrawal';
          case 'transfer': return 'Fund Transfer';
          case 'payment': return 'Bill Payment';
          case 'fee': return 'Service Fee';
          default: return 'Transaction';
        }
      }

      // Apply filters
      let filteredTransactions = transactions;

      if (status && status !== 'all') {
        filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
      }

      if (type && type !== 'all') {
        filteredTransactions = filteredTransactions.filter(tx => tx.type === type);
      }

      if (channel && channel !== 'all') {
        filteredTransactions = filteredTransactions.filter(tx => tx.channel === channel);
      }

      if (riskLevel && riskLevel !== 'all') {
        filteredTransactions = filteredTransactions.filter(tx => {
          if (riskLevel === 'low') return tx.riskScore < 30;
          if (riskLevel === 'medium') return tx.riskScore >= 30 && tx.riskScore < 70;
          if (riskLevel === 'high') return tx.riskScore >= 70;
          return true;
        });
      }

      if (dateFrom) {
        filteredTransactions = filteredTransactions.filter(tx => 
          new Date(tx.timestamp) >= new Date(dateFrom)
        );
      }

      if (dateTo) {
        filteredTransactions = filteredTransactions.filter(tx => 
          new Date(tx.timestamp) <= new Date(dateTo + 'T23:59:59')
        );
      }

      if (amountFrom) {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.amount >= parseFloat(amountFrom)
        );
      }

      if (amountTo) {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.amount <= parseFloat(amountTo)
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredTransactions = filteredTransactions.filter(tx =>
          tx.id.toLowerCase().includes(searchLower) ||
          tx.userName.toLowerCase().includes(searchLower) ||
          tx.userEmail.toLowerCase().includes(searchLower) ||
          tx.description.toLowerCase().includes(searchLower) ||
          tx.reference.toLowerCase().includes(searchLower) ||
          (tx.recipientName && tx.recipientName.toLowerCase().includes(searchLower))
        );
      }

      // Sort by timestamp (newest first)
      filteredTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: {
          transactions: paginatedTransactions,
          totalCount: filteredTransactions.length,
          totalPages: Math.ceil(filteredTransactions.length / limit),
          currentPage: page,
          hasMore: endIndex < filteredTransactions.length
        }
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch transactions'
      }));
      return;
    }
  }

  // Route: GET /api/admin/transaction-limits - Get transaction limits
  if (url === '/api/admin/transaction-limits' && method === 'GET') {
    try {
      const limits = [
        {
          id: 'LIMIT001',
          type: 'daily',
          category: 'withdrawal',
          amount: 100000,
          userType: 'individual',
          isActive: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'LIMIT002',
          type: 'per_transaction',
          category: 'transfer',
          amount: 500000,
          userType: 'all',
          isActive: true,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'LIMIT003',
          type: 'monthly',
          category: 'deposit',
          amount: 2000000,
          userType: 'business',
          isActive: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: { limits }
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch transaction limits'
      }));
      return;
    }
  }

  // Route: POST /api/admin/transaction-limits - Create transaction limit
  if (url === '/api/admin/transaction-limits' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const { type, category, amount, count, timeWindow, userType } = body;

      if (!type || !category || !amount || !userType) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Missing required fields'
        }));
        return;
      }

      const newLimit = {
        id: `LIMIT${Date.now()}`,
        type,
        category,
        amount: parseFloat(amount),
        count: count ? parseInt(count) : undefined,
        timeWindow: timeWindow ? parseInt(timeWindow) : undefined,
        userType,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Transaction limit created successfully',
        data: { limit: newLimit }
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to create transaction limit'
      }));
      return;
    }
  }

  // Route: GET /api/admin/fraud-rules - Get fraud detection rules
  if (url === '/api/admin/fraud-rules' && method === 'GET') {
    try {
      const rules = [
        {
          id: 'FRAUD001',
          name: 'High Amount Alert',
          description: 'Flag transactions above 1M BDT',
          type: 'amount_threshold',
          parameters: { threshold: 1000000 },
          severity: 'high',
          isActive: true,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'FRAUD002',
          name: 'Velocity Check',
          description: 'Flag more than 10 transactions in 1 hour',
          type: 'velocity',
          parameters: { maxCount: 10, timeWindow: 60 },
          severity: 'medium',
          isActive: true,
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'FRAUD003',
          name: 'Unusual Location',
          description: 'Flag transactions from unusual locations',
          type: 'location',
          parameters: { locations: ['Unknown', 'Foreign'] },
          severity: 'medium',
          isActive: true,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: { rules }
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch fraud rules'
      }));
      return;
    }
  }

  // Route: GET /api/admin/transaction-analytics - Get transaction analytics
  if (url.startsWith('/api/admin/transaction-analytics') && method === 'GET') {
    try {
      const urlObj = new URL(url, `http://${req.headers.host}`);
      const period = urlObj.searchParams.get('period') || '7d';

      const analytics = {
        period,
        totalTransactions: 15420,
        totalAmount: 125000000,
        averageAmount: 8105,
        transactionsByType: {
          deposit: 4200,
          withdrawal: 3800,
          transfer: 5100,
          payment: 2100,
          fee: 220
        },
        transactionsByStatus: {
          completed: 14100,
          pending: 850,
          failed: 320,
          flagged: 120,
          under_review: 30
        },
        transactionsByChannel: {
          online: 6200,
          mobile: 7800,
          atm: 1200,
          branch: 180,
          api: 40
        },
        riskDistribution: {
          low: 12500,
          medium: 2600,
          high: 320
        },
        fraudAlerts: {
          total: 450,
          resolved: 420,
          pending: 30
        },
        trends: {
          dailyVolume: [
            { date: '2024-01-01', count: 2100, amount: 18500000 },
            { date: '2024-01-02', count: 2200, amount: 19200000 },
            { date: '2024-01-03', count: 2050, amount: 17800000 },
            { date: '2024-01-04', count: 2300, amount: 20100000 },
            { date: '2024-01-05', count: 2180, amount: 18900000 },
            { date: '2024-01-06', count: 2290, amount: 19800000 },
            { date: '2024-01-07', count: 2300, amount: 20700000 }
          ]
        }
      };

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: { analytics }
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch transaction analytics'
      }));
      return;
    }
  }

  // ============= LOAN MANAGEMENT ENDPOINTS =============

  // Route: GET /api/admin/loans - Get all loan applications with filtering and pagination
  if (url.startsWith('/api/admin/loans') && method === 'GET' && !url.includes('/emi-schedule') && !url.includes('/analytics')) {
    try {
      const urlObj = new URL(url, `http://${req.headers.host}`);
      const page = parseInt(urlObj.searchParams.get('page')) || 1;
      const limit = parseInt(urlObj.searchParams.get('limit')) || 10;
      const status = urlObj.searchParams.get('status');
      const riskLevel = urlObj.searchParams.get('riskLevel');
      const search = urlObj.searchParams.get('search');
      const sortBy = urlObj.searchParams.get('sortBy') || 'applicationDate';
      const sortOrder = urlObj.searchParams.get('sortOrder') || 'desc';

      // Mock loan applications data
      let loanApplications = [
        {
          id: 'LOAN001',
          applicantName: 'John Doe',
          applicantEmail: 'john.doe@email.com',
          applicantPhone: '+8801712345678',
          amount: 500000,
          purpose: 'Business Expansion',
          repaymentPeriod: 24,
          status: 'pending',
          applicationDate: '2024-01-15T10:30:00Z',
          creditScore: 750,
          monthlyIncome: 80000,
          employmentType: 'Self-employed',
          employmentDuration: 36,
          existingLoans: 1,
          lastUpdated: '2024-01-15T10:30:00Z',
          documents: {
            idProof: true,
            incomeProof: true,
            addressProof: true,
            bankStatement: false
          },
          riskLevel: 'low'
        },
        {
          id: 'LOAN002',
          applicantName: 'Jane Smith',
          applicantEmail: 'jane.smith@email.com',
          applicantPhone: '+8801787654321',
          amount: 300000,
          purpose: 'Home Renovation',
          repaymentPeriod: 18,
          status: 'active',
          applicationDate: '2024-01-10T14:20:00Z',
          creditScore: 680,
          monthlyIncome: 60000,
          employmentType: 'Salaried',
          employmentDuration: 48,
          existingLoans: 0,
          lastUpdated: '2024-01-20T09:15:00Z',
          documents: {
            idProof: true,
            incomeProof: true,
            addressProof: true,
            bankStatement: true
          },
          riskLevel: 'medium',
          interestRate: 12,
          approvedAmount: 280000,
          disbursementDate: '2024-01-20T09:15:00Z',
          emiAmount: 17500,
          totalEMIs: 18,
          paidEMIs: 2,
          nextEMIDate: '2024-03-20T00:00:00Z'
        },
        {
          id: 'LOAN003',
          applicantName: 'Mike Johnson',
          applicantEmail: 'mike.johnson@email.com',
          applicantPhone: '+8801798765432',
          amount: 150000,
          purpose: 'Education',
          repaymentPeriod: 12,
          status: 'defaulted',
          applicationDate: '2023-12-01T11:45:00Z',
          creditScore: 580,
          monthlyIncome: 35000,
          employmentType: 'Salaried',
          employmentDuration: 24,
          existingLoans: 2,
          lastUpdated: '2024-01-25T16:30:00Z',
          documents: {
            idProof: true,
            incomeProof: false,
            addressProof: true,
            bankStatement: true
          },
          riskLevel: 'high',
          interestRate: 15,
          approvedAmount: 120000,
          disbursementDate: '2023-12-05T10:00:00Z',
          emiAmount: 11200,
          totalEMIs: 12,
          paidEMIs: 8,
          overdueAmount: 44800,
          defaultDate: '2024-01-25T16:30:00Z'
        },
        {
          id: 'LOAN004',
          applicantName: 'Sarah Wilson',
          applicantEmail: 'sarah.wilson@email.com',
          applicantPhone: '+8801756789012',
          amount: 750000,
          purpose: 'Property Purchase',
          repaymentPeriod: 36,
          status: 'approved',
          applicationDate: '2024-01-18T16:45:00Z',
          creditScore: 720,
          monthlyIncome: 95000,
          employmentType: 'Salaried',
          employmentDuration: 60,
          existingLoans: 0,
          lastUpdated: '2024-01-22T11:30:00Z',
          documents: {
            idProof: true,
            incomeProof: true,
            addressProof: true,
            bankStatement: true
          },
          riskLevel: 'low',
          interestRate: 11.5,
          approvedAmount: 700000,
          adminComments: 'Excellent credit profile, approved for reduced amount'
        },
        {
          id: 'LOAN005',
          applicantName: 'David Brown',
          applicantEmail: 'david.brown@email.com',
          applicantPhone: '+8801723456789',
          amount: 200000,
          purpose: 'Medical Emergency',
          repaymentPeriod: 15,
          status: 'completed',
          applicationDate: '2023-10-15T09:20:00Z',
          creditScore: 690,
          monthlyIncome: 55000,
          employmentType: 'Self-employed',
          employmentDuration: 30,
          existingLoans: 1,
          lastUpdated: '2024-01-15T14:20:00Z',
          documents: {
            idProof: true,
            incomeProof: true,
            addressProof: true,
            bankStatement: true
          },
          riskLevel: 'medium',
          interestRate: 13,
          approvedAmount: 180000,
          disbursementDate: '2023-10-20T10:00:00Z',
          emiAmount: 13500,
          totalEMIs: 15,
          paidEMIs: 15
        }
      ];

      // Apply filters
      if (status && status !== 'all') {
        loanApplications = loanApplications.filter(loan => loan.status === status);
      }

      if (riskLevel && riskLevel !== 'all') {
        loanApplications = loanApplications.filter(loan => loan.riskLevel === riskLevel);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        loanApplications = loanApplications.filter(loan =>
          loan.applicantName.toLowerCase().includes(searchLower) ||
          loan.applicantEmail.toLowerCase().includes(searchLower) ||
          loan.id.toLowerCase().includes(searchLower) ||
          loan.purpose.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      loanApplications.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLoans = loanApplications.slice(startIndex, endIndex);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: paginatedLoans,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(loanApplications.length / limit),
          totalItems: loanApplications.length,
          itemsPerPage: limit
        }
      }));
      return;
    } catch (error) {
      console.error('Error fetching loan applications:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch loan applications'
      }));
      return;
    }
  }

  // Route: POST /api/admin/loans/:id/approve - Approve loan application
  if (url.match(/^\/api\/admin\/loans\/[^\/]+\/approve$/) && method === 'POST') {
    try {
      const loanId = url.split('/')[4];
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const { approvedAmount, interestRate, repaymentPeriod, comments } = JSON.parse(body);

          if (!approvedAmount || !interestRate || !repaymentPeriod) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Missing required approval data'
            }));
            return;
          }

          // Find the loan application
          const loanApplication = loanApplications.find(loan => loan.id === loanId);
          if (!loanApplication) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Loan application not found'
            }));
            return;
          }

          // Find the user by email
          const user = approvedUsers.find(u => u.email === loanApplication.email);
          if (!user) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'User not found in approved users'
            }));
            return;
          }

          // Calculate EMI amount
          const emiAmount = calculateEMI(approvedAmount, interestRate, repaymentPeriod);

          // Generate installment schedule
          const installments = [];
          const currentDate = new Date();
          for (let i = 1; i <= repaymentPeriod; i++) {
            const dueDate = new Date(currentDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            
            // Calculate principal and interest portions
            const interestAmount = (approvedAmount * interestRate / 100) / 12;
            const principalAmount = emiAmount - interestAmount;
            
            installments.push({
              id: `INST_${Date.now()}_${i}`,
              installmentNumber: i,
              dueDate: dueDate.toISOString().split('T')[0],
              amount: emiAmount,
              principalAmount: Math.round(principalAmount * 100) / 100,
              interestAmount: Math.round(interestAmount * 100) / 100,
              status: 'pending',
              paidDate: null,
              paidAmount: 0
            });
          }

          // Create approved loan record
          const approvedLoan = {
            id: `AL${Date.now()}`,
            loanApplicationId: loanId,
            applicantName: loanApplication.applicantName,
            email: loanApplication.email,
            userId: user.id,
            loanAmount: loanApplication.loanAmount,
            approvedAmount: approvedAmount,
            interestRate: interestRate,
            loanTerm: repaymentPeriod,
            monthlyEMI: emiAmount,
            processingFee: Math.round(approvedAmount * 0.02), // 2% processing fee
            status: 'active',
            approvalDate: new Date().toISOString().split('T')[0],
            disbursementStatus: 'disbursed',
            disbursementDate: new Date().toISOString().split('T')[0],
            installments: installments
          };

          // Add to approved loans
          approvedLoans.push(approvedLoan);

          // Update user balance and loan balance
          user.balance += approvedAmount;
          user.loanBalance += approvedAmount;

          // Create loan disbursement transaction
          const disbursementTransaction = {
            id: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
            userId: user.id,
            userName: user.fullName || user.name,
            userEmail: user.email,
            type: 'credit',
            amount: approvedAmount,
            currency: 'BDT',
            description: `Loan Disbursement - ${loanApplication.loanPurpose || 'Personal Loan'}`,
            timestamp: new Date().toISOString(),
            status: 'completed',
            channel: 'admin',
            reference: `LOAN_${approvedLoan.id}`,
            fees: 0,
            balanceBefore: user.balance - approvedAmount,
            balanceAfter: user.balance,
            ipAddress: '127.0.0.1',
            deviceInfo: 'Admin Panel',
            location: 'Admin Dashboard',
            riskScore: 0,
            loanId: approvedLoan.id,
            loanApplicationId: loanId
          };

          // Add transaction to the transactions array
          transactions.push(disbursementTransaction);

          // Update loan application status
          loanApplication.status = 'approved';

          console.log(`Loan application ${loanId} approved and disbursed to user ${user.id}`);
          console.log('Approval details:', { approvedAmount, interestRate, repaymentPeriod, comments });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: 'Loan application approved and funds disbursed successfully',
            data: {
              id: loanId,
              approvedLoanId: approvedLoan.id,
              status: 'approved',
              approvedAmount,
              interestRate,
              repaymentPeriod,
              emiAmount,
              adminComments: comments,
              approvedAt: new Date().toISOString(),
              disbursedTo: user.email,
              newBalance: user.balance
            }
          }));
        } catch (parseError) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid JSON data'
          }));
        }
      });
      return;
    } catch (error) {
      console.error('Error approving loan application:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to approve loan application'
      }));
      return;
    }
  }

  // Route: POST /api/admin/loans/:id/reject - Reject loan application
  if (url.match(/^\/api\/admin\/loans\/[^\/]+\/reject$/) && method === 'POST') {
    try {
      const loanId = url.split('/')[4];
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const { reason } = JSON.parse(body);

          if (!reason) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Rejection reason is required'
            }));
            return;
          }

          console.log(`Loan application ${loanId} rejected`);
          console.log('Rejection reason:', reason);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: 'Loan application rejected successfully',
            data: {
              id: loanId,
              status: 'rejected',
              rejectionReason: reason,
              rejectedAt: new Date().toISOString()
            }
          }));
        } catch (parseError) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid JSON data'
          }));
        }
      });
      return;
    } catch (error) {
      console.error('Error rejecting loan application:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to reject loan application'
      }));
      return;
    }
  }

  // Route: POST /api/admin/loans/:id/disburse - Disburse approved loan
  if (url.match(/^\/api\/admin\/loans\/[^\/]+\/disburse$/) && method === 'POST') {
    try {
      const loanId = url.split('/')[4];
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const { disbursementDate, bankAccount, comments } = JSON.parse(body);

          if (!disbursementDate || !bankAccount) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Disbursement date and bank account are required'
            }));
            return;
          }

          console.log(`Loan ${loanId} disbursed`);
          console.log('Disbursement details:', { disbursementDate, bankAccount, comments });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: 'Loan disbursed successfully',
            data: {
              id: loanId,
              status: 'active',
              disbursementDate,
              bankAccount,
              disbursementComments: comments,
              disbursedAt: new Date().toISOString()
            }
          }));
        } catch (parseError) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid JSON data'
          }));
        }
      });
      return;
    } catch (error) {
      console.error('Error disbursing loan:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to disburse loan'
      }));
      return;
    }
  }

  // Route: GET /api/admin/loans/:id/emi-schedule - Get loan EMI schedule
  if (url.match(/^\/api\/admin\/loans\/[^\/]+\/emi-schedule$/) && method === 'GET') {
    try {
      const loanId = url.split('/')[4];

      // Mock EMI schedule data
      const emiSchedule = Array.from({ length: 12 }, (_, index) => ({
        emiNumber: index + 1,
        dueDate: new Date(2024, index, 20).toISOString(),
        amount: 11200,
        principal: 10000 - (index * 50),
        interest: 1200 - (index * 50),
        status: index < 8 ? 'paid' : index === 8 ? 'overdue' : 'pending',
        paidAmount: index < 8 ? 11200 : index === 8 ? 5600 : 0,
        paidDate: index < 8 ? new Date(2024, index, 18).toISOString() : null
      }));

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: emiSchedule
      }));
      return;
    } catch (error) {
      console.error('Error fetching EMI schedule:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch EMI schedule'
      }));
      return;
    }
  }

  // Route: GET /api/admin/loan-analytics - Get loan analytics and statistics
  if (url.startsWith('/api/admin/loan-analytics') && method === 'GET') {
    try {
      const analytics = {
        totalApplications: 156,
        pendingApplications: 23,
        approvedLoans: 89,
        activeLoans: 67,
        completedLoans: 45,
        defaultedLoans: 12,
        totalDisbursed: 45600000,
        totalCollected: 38200000,
        overdueAmount: 2800000,
        averageLoanAmount: 425000,
        averageRepaymentPeriod: 18,
        collectionRate: 83.8,
        defaultRate: 7.7,
        monthlyTrends: [
          { month: '2023-08', applications: 12, approvals: 8, disbursements: 6 },
          { month: '2023-09', applications: 15, approvals: 11, disbursements: 9 },
          { month: '2023-10', applications: 18, approvals: 13, disbursements: 11 },
          { month: '2023-11', applications: 14, approvals: 10, disbursements: 8 },
          { month: '2023-12', applications: 16, approvals: 12, disbursements: 10 },
          { month: '2024-01', applications: 21, approvals: 15, disbursements: 12 }
        ],
        riskDistribution: [
          { risk: 'low', count: 45, percentage: 28.8 },
          { risk: 'medium', count: 78, percentage: 50.0 },
          { risk: 'high', count: 33, percentage: 21.2 }
        ],
        purposeBreakdown: [
          { purpose: 'Business', count: 42, percentage: 26.9 },
          { purpose: 'Personal', count: 38, percentage: 24.4 },
          { purpose: 'Education', count: 28, percentage: 17.9 },
          { purpose: 'Medical', count: 25, percentage: 16.0 },
          { purpose: 'Property', count: 23, percentage: 14.7 }
        ]
      };

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: analytics
      }));
      return;
    } catch (error) {
      console.error('Error fetching loan analytics:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch loan analytics'
      }));
      return;
    }
  }

  // Helper function to calculate EMI
  function calculateEMI(principal, annualRate, termInMonths) {
    const monthlyRate = annualRate / 100 / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) / 
                (Math.pow(1 + monthlyRate, termInMonths) - 1);
    return Math.round(emi * 100) / 100;
  }

  // Helper function to verify user token
  function verifyUserToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Route: POST /api/user/loans/apply - Apply for a loan
  if (url === '/api/user/loans/apply' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { loanAmount, loanPurpose, loanTerm, monthlyIncome, employmentStatus, creditScore } = JSON.parse(body);

        // Verify user token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Authorization token required'
          }));
          return;
        }

        const token = authHeader.split(' ')[1];
        try {
          const userToken = jwt.verify(token, JWT_SECRET);
          
          // Find the user
          const user = approvedUsers.find(u => u.id === userToken.userId);
          if (!user) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'User not found'
            }));
            return;
          }

        // Generate application ID
        const applicationId = `LA${String(loanApplications.length + 1).padStart(3, '0')}`;

        // Determine risk level based on credit score
        let riskLevel = 'high';
        if (creditScore >= 750) riskLevel = 'low';
        else if (creditScore >= 650) riskLevel = 'medium';

        // Create loan application
        const loanApplication = {
          id: applicationId,
          applicantName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone,
          age: 30, // Default age, could be added to user profile
          occupation: 'Customer', // Default occupation
          monthlyIncome,
          loanAmount,
          loanPurpose,
          loanTerm,
          creditScore,
          riskLevel,
          status: 'pending',
          applicationDate: new Date().toISOString().split('T')[0],
          documents: ['Application Form'],
          address: 'Customer Address', // Default address
          employmentType: employmentStatus,
          employer: 'Customer Employer'
        };

        loanApplications.push(loanApplication);

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          message: 'Loan application submitted successfully',
          data: {
            applicationId: applicationId,
            status: 'pending',
            submissionDate: loanApplication.applicationDate
          }
        }));

        } catch (tokenError) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid or expired token'
          }));
          return;
        }

      } catch (error) {
        console.error('Error submitting loan application:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Failed to submit loan application'
        }));
      }
    });
    return;
  }

  // Route: GET /api/user/loans - Get user's loans
  if (url === '/api/user/loans' && method === 'GET') {
    try {
      const userToken = verifyUserToken(req);
      if (!userToken) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Unauthorized access'
        }));
        return;
      }

      // Find user's loans
      const userLoans = approvedLoans.filter(loan => loan.userId === userToken.userId);
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        data: userLoans
      }));
      return;
    } catch (error) {
      console.error('Error fetching user loans:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch loans'
      }));
      return;
    }
  }

  // Route: POST /api/user/loans/:loanId/pay-installment - Pay loan installment
  if (url.startsWith('/api/user/loans/') && url.endsWith('/pay-installment') && method === 'POST') {
    try {
      const userToken = verifyUserToken(req);
      if (!userToken) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Unauthorized access'
        }));
        return;
      }

      const loanId = url.split('/')[4]; // Extract loan ID from URL
      const body = await parseBody(req);
      const { installmentId } = body;

      // Find the loan
      const loan = approvedLoans.find(l => l.id === loanId && l.userId === userToken.userId);
      if (!loan) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Loan not found'
        }));
        return;
      }

      // Find the installment
      const installment = loan.installments.find(inst => inst.id === installmentId);
      if (!installment) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Installment not found'
        }));
        return;
      }

      if (installment.status === 'paid') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Installment already paid'
        }));
        return;
      }

      // Find the user
      const user = approvedUsers.find(u => u.id === userToken.userId);
      if (!user) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'User not found'
        }));
        return;
      }

      // Check if user has sufficient balance
      if (user.balance < installment.amount) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Insufficient balance'
        }));
        return;
      }

      // Process payment
      user.balance -= installment.amount;
      user.loanBalance -= installment.principalAmount;
      installment.status = 'paid';
      installment.paidDate = new Date().toISOString();

      // Check if all installments are paid
      const allPaid = loan.installments.every(inst => inst.status === 'paid');
      if (allPaid) {
        loan.status = 'completed';
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Installment paid successfully',
        data: {
          newBalance: user.balance,
          newLoanBalance: user.loanBalance,
          installment: installment,
          loanStatus: loan.status
        }
      }));
      return;
    } catch (error) {
      console.error('Error processing installment payment:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to process payment'
      }));
      return;
    }
  }

  // Route: POST /api/user/change-password - User password change
  if (url === '/api/user/change-password' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Current password and new password are required'
        }));
        return;
      }

      // Verify JWT token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Authorization token required'
        }));
        return;
      }

      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (tokenError) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid or expired token'
        }));
        return;
      }

      // Find user
      const userIndex = approvedUsers.findIndex(user => user.id === decoded.userId);
      if (userIndex === -1) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'User not found'
        }));
        return;
      }

      const user = approvedUsers[userIndex];

      // Verify current password
      if (user.password !== currentPassword) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Current password is incorrect'
        }));
        return;
      }

      // Update password
      approvedUsers[userIndex].password = newPassword;
      approvedUsers[userIndex].passwordResetRequired = false;
      approvedUsers[userIndex].lastPasswordChange = new Date().toISOString();

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Password changed successfully'
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to change password'
      }));
      return;
    }
  }

  // Route: GET /api/admin/pending-users - Get pending user registrations
  if (url === '/api/admin/pending-users' && method === 'GET') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Authorization token required'
        }));
        return;
      }

      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (tokenError) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid or expired token'
        }));
        return;
      }

      // Check if user is admin
      const adminUser = adminUsers.find(admin => admin.id === decoded.userId);
      if (!adminUser) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Admin access required'
        }));
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(pendingUsers));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to fetch pending users'
      }));
      return;
    }
  }

  // Route: POST /api/admin/approve-user - Approve pending user registration
  if (url === '/api/admin/approve-user' && method === 'POST') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Authorization token required'
        }));
        return;
      }

      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (tokenError) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid or expired token'
        }));
        return;
      }

      // Check if user is admin
      const adminUser = adminUsers.find(admin => admin.id === decoded.userId);
      if (!adminUser) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Admin access required'
        }));
        return;
      }

      const { accountNumber } = JSON.parse(body);
      
      // Find pending user
      const pendingUserIndex = pendingUsers.findIndex(user => user.accountNumber === accountNumber);
      if (pendingUserIndex === -1) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Pending user not found'
        }));
        return;
      }

      const pendingUser = pendingUsers[pendingUserIndex];
      
      // Move to approved users
      const approvedUser = {
        ...pendingUser,
        id: approvedUsers.length + 1,
        status: 'active',
        balance: 0,
        approvedAt: new Date().toISOString(),
        approvedBy: adminUser.username
      };
      
      approvedUsers.push(approvedUser);
      pendingUsers.splice(pendingUserIndex, 1);

      console.log(`✅ User ${pendingUser.fullName} approved by admin ${adminUser.username}`);

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
        message: 'Failed to approve user'
      }));
      return;
    }
  }

  // Route: POST /api/admin/reject-user - Reject pending user registration
  if (url === '/api/admin/reject-user' && method === 'POST') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Authorization token required'
        }));
        return;
      }

      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (tokenError) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid or expired token'
        }));
        return;
      }

      // Check if user is admin
      const adminUser = adminUsers.find(admin => admin.id === decoded.userId);
      if (!adminUser) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Admin access required'
        }));
        return;
      }

      const { accountNumber, reason } = JSON.parse(body);
      
      // Find pending user
      const pendingUserIndex = pendingUsers.findIndex(user => user.accountNumber === accountNumber);
      if (pendingUserIndex === -1) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Pending user not found'
        }));
        return;
      }

      const pendingUser = pendingUsers[pendingUserIndex];
      
      // Log rejection
      console.log(`❌ User ${pendingUser.fullName} rejected by admin ${adminUser.username}. Reason: ${reason}`);
      
      // Remove from pending users
      pendingUsers.splice(pendingUserIndex, 1);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'User rejected successfully',
        reason: reason
      }));
      return;
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Failed to reject user'
      }));
      return;
    }
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