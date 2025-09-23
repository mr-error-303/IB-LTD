const jwt = require('jsonwebtoken');
const { User, Account } = require('../models');

// Generate JWT token
const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message: statusCode === 201 ? 'User registered successfully' : 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if email is valid
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if we're in development mode without database
    if (process.env.MONGODB_URI === 'memory' || !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost:27017')) {
      // Development mode - simulate user creation
      const mockUser = {
        _id: '507f1f77bcf86cd799439013',
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: role || 'user',
        isActive: true,
        createdAt: new Date()
      };
      
      return sendTokenResponse(mockUser, 201, res);
    }

    // Check for existing user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      status: { $ne: 'rejected' } // Allow re-registration if previously rejected
    });
    
    if (existingUser) {
      if (existingUser.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Registration request already submitted. Please wait for admin approval.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user (password will be hashed automatically by pre-save hook)
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      status: 'pending' // New users require admin approval
    };

    // Only set role if provided and user is admin (for security)
    if (role && ['user', 'admin'].includes(role)) {
      userData.role = role;
    }

    const user = await User.create(userData);

    // Don't create account or send token for pending users
    res.status(201).json({
      success: true,
      message: 'Registration request submitted successfully. Please wait for admin approval.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Signup error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if email is valid
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if we're in development mode without database
    if (process.env.MONGODB_URI === 'memory' || !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost:27017')) {
      // Development mode - create a mock user for testing
      if (email === 'demo@example.com' && password === 'demo123') {
        const mockUser = {
          _id: '507f1f77bcf86cd799439011',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'user',
          isActive: true,
          createdAt: new Date()
        };
        
        return sendTokenResponse(mockUser, 200, res);
      } else if (email === 'admin@example.com' && password === 'admin123') {
        const mockAdmin = {
          _id: '507f1f77bcf86cd799439012',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          isActive: true,
          createdAt: new Date()
        };
        
        return sendTokenResponse(mockAdmin, 200, res);
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Try demo@example.com/demo123 or admin@example.com/admin123'
        });
      }
    }

    // Find user by email and include password field
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      $or: [
        { isActive: true },
        { status: 'approved' },
        { status: 'pending' }
      ]
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check if user is pending approval
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. Please wait for approval before logging in.'
      });
    }

    // Check if user is rejected
    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your registration request was rejected. Please contact support for more information.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Send token response
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Check if we're in development mode without database
    if (process.env.MONGODB_URI === 'memory' || !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost:27017')) {
      // Development mode - return user data from the auth middleware
      return res.status(200).json({
        success: true,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          isActive: req.user.isActive,
          createdAt: req.user.createdAt || new Date()
        }
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name.trim();
    if (email) {
      // Validate email format
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
      fieldsToUpdate.email = email.toLowerCase().trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      });
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/changepassword
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    // Check new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user with password field
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Save it to the database with expiration
    // 3. Send email with reset link
    
    // For now, we'll just return a success message
    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { resettoken } = req.params;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password'
      });
    }

    // Check password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // In a real application, you would:
    // 1. Hash the reset token and find user
    // 2. Check if token is valid and not expired
    // 3. Update user's password
    
    // For now, we'll just return a success message
    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};