const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Strict rate limiting for admin auth routes
const adminAuthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many admin login attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Apply rate limiting to all admin auth routes
router.use(adminAuthRateLimit);

/**
 * @route   POST /api/auth/admin/login
 * @desc    Admin login with optional 2FA
 * @access  Public
 */
router.post('/login', async (req, res) => {
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

    // Development mode mock admin
    if (process.env.NODE_ENV === 'development' && email === 'admin@ibltd.com' && password === 'admin123') {
      const mockAdmin = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Admin User',
        email: 'admin@ibltd.com',
        role: 'admin',
        isActive: true,
        twoFactorEnabled: false,
        createdAt: new Date()
      };

      const token = jwt.sign(
        { userId: mockAdmin._id, role: mockAdmin.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '24h' }
      );

      // Set cookie
      const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      };

      return res
        .status(200)
        .cookie('token', token, options)
        .json({
          success: true,
          token,
          user: mockAdmin,
          requiresTwoFactor: false
        });
    }

    // Find admin user by email
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: 'admin'
    }).select('+password +twoFactorSecret');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Check if account is locked
    if (user.isLocked && user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Admin account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      if (user.incLoginAttempts) {
        await user.incLoginAttempts();
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // Generate temporary token for 2FA verification
      const tempToken = jwt.sign(
        { userId: user._id, temp: true },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        tempToken,
        message: 'Please provide your two-factor authentication code'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = undefined;
      user.lockUntil = undefined;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Set cookie
    const options = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res
      .status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled
        }
      });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});

/**
 * @route   POST /api/auth/admin/verify-2fa
 * @desc    Verify 2FA code for admin login
 * @access  Private (temp token)
 */
router.post('/verify-2fa', async (req, res) => {
  try {
    const { twoFactorCode } = req.body;
    
    if (!twoFactorCode) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication code is required'
      });
    }

    // Get temp token from header
    let tempToken = req.headers.authorization;
    if (tempToken && tempToken.startsWith('Bearer ')) {
      tempToken = tempToken.substring(7);
    }

    if (!tempToken) {
      return res.status(401).json({
        success: false,
        message: 'Temporary token required'
      });
    }

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    
    if (!decoded.temp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid temporary token'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId).select('+twoFactorSecret');
    
    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin user'
      });
    }

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorCode,
      window: 2 // Allow 2 time steps (60 seconds) of variance
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid two-factor authentication code'
      });
    }

    // Reset login attempts on successful 2FA
    if (user.loginAttempts > 0) {
      user.loginAttempts = undefined;
      user.lockUntil = undefined;
      await user.save();
    }

    // Generate final JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Set cookie
    const options = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res
      .status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled
        }
      });

  } catch (error) {
    console.error('2FA verification error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired temporary token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during 2FA verification'
    });
  }
});

/**
 * @route   POST /api/auth/admin/setup-2fa
 * @desc    Setup 2FA for admin user
 * @access  Private/Admin
 */
router.post('/setup-2fa', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `IB LTD Admin (${user.email})`,
      issuer: 'IB LTD Banking'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret to user (but don't enable 2FA yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.status(200).json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during 2FA setup'
    });
  }
});

/**
 * @route   POST /api/auth/admin/enable-2fa
 * @desc    Enable 2FA for admin user after verification
 * @access  Private/Admin
 */
router.post('/enable-2fa', protect, async (req, res) => {
  try {
    const { twoFactorCode } = req.body;
    
    if (!twoFactorCode) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication code is required'
      });
    }

    const user = await User.findById(req.user.id).select('+twoFactorSecret');
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'Please setup 2FA first'
      });
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorCode,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid two-factor authentication code'
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });

  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while enabling 2FA'
    });
  }
});

/**
 * @route   POST /api/auth/admin/disable-2fa
 * @desc    Disable 2FA for admin user
 * @access  Private/Admin
 */
router.post('/disable-2fa', protect, async (req, res) => {
  try {
    const { password, twoFactorCode } = req.body;
    
    if (!password || !twoFactorCode) {
      return res.status(400).json({
        success: false,
        message: 'Password and 2FA code are required'
      });
    }

    const user = await User.findById(req.user.id).select('+password +twoFactorSecret');
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorCode,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid two-factor authentication code'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while disabling 2FA'
    });
  }
});

/**
 * @route   POST /api/auth/admin/logout
 * @desc    Admin logout with session cleanup
 * @access  Private/Admin
 */
router.post('/logout', protect, async (req, res) => {
  try {
    // Clear cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Admin logged out successfully'
    });

  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

module.exports = router;