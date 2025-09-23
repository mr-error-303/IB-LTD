const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  logout, 
  getMe, 
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect, rateLimit } = require('../middleware/auth');

// Apply rate limiting to auth routes (disabled in development)
const authRateLimit = process.env.NODE_ENV === 'development' 
  ? (req, res, next) => next() // Skip rate limiting in development
  : rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', authRateLimit, signup);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authRateLimit, login);

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, logout);

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @route   PATCH /api/auth/profile
// @access  Private
router.put('/profile', protect, updateProfile);
router.patch('/profile', protect, updateProfile);

// @desc    Refresh token (optional - for token refresh functionality)
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, (req, res) => {
  try {
    // Generate new token for the authenticated user
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    // Send token in cookie and response
    const options = {
      expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.status(200)
       .cookie('token', token, options)
       .json({
         success: true,
         message: 'Token refreshed successfully',
         token,
         user: {
           id: req.user.id,
           name: req.user.name,
           email: req.user.email,
           role: req.user.role
         }
       });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
});

// @desc    Validate token (check if token is still valid)
// @route   GET /api/auth/validate
// @access  Private
router.get('/validate', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/changepassword
// @access  Private
router.put('/changepassword', protect, changePassword);

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
router.post('/forgotpassword', authRateLimit, forgotPassword);

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
router.put('/resetpassword/:resettoken', authRateLimit, resetPassword);

module.exports = router;