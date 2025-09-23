const { User, Account } = require('../models');
const nodemailer = require('nodemailer');

// Configure email transporter (you'll need to set up your email service)
const transporter = nodemailer.createTransport({
  // Configure based on your email service
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Get all pending signup requests
 * @route GET /api/admin/signup-requests
 * @access Private/Admin
 */
const getPendingSignupRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Build search query
    const searchQuery = {
      status: 'pending'
    };
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get pending requests with pagination
    const requests = await User.find(searchQuery)
      .select('name email createdAt phone address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalRequests = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalRequests / limit);
    
    res.status(200).json({
      success: true,
      message: 'Pending signup requests retrieved successfully',
      data: {
        requests: requests.map(request => ({
          id: request._id,
          name: request.name,
          email: request.email,
          phone: request.phone,
          address: request.address,
          createdAt: request.createdAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRequests,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get pending signup requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching signup requests'
    });
  }
};

/**
 * Approve a signup request
 * @route POST /api/admin/signup-requests/:id/approve
 * @access Private/Admin
 */
const approveSignupRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    // Find the pending user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Signup request not found'
      });
    }
    
    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }
    
    // Update user status to approved
    await User.findByIdAndUpdate(id, {
      status: 'approved',
      isActive: true,
      isVerified: true,
      approvedBy: adminId,
      approvedAt: new Date()
    });
    
    // Create bank account for the approved user
    try {
      await Account.create({
        userId: user._id,
        balance: 0,
        accountType: 'savings'
      });
    } catch (accountError) {
      console.error('Error creating account for approved user:', accountError);
    }
    
    // Send approval email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@ibltd.com',
        to: user.email,
        subject: 'Account Approved - IB LTD Banking',
        html: `
          <h2>Welcome to IB LTD Banking!</h2>
          <p>Dear ${user.name},</p>
          <p>Your account registration has been approved. You can now log in to your account and start using our banking services.</p>
          <p>Login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">IB LTD Banking</a></p>
          <p>Best regards,<br>IB LTD Banking Team</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Signup request approved successfully'
    });
    
  } catch (error) {
    console.error('Approve signup request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving signup request'
    });
  }
};

/**
 * Reject a signup request
 * @route POST /api/admin/signup-requests/:id/reject
 * @access Private/Admin
 */
const rejectSignupRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    // Find the pending user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Signup request not found'
      });
    }
    
    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }
    
    // Update user status to rejected
    await User.findByIdAndUpdate(id, {
      status: 'rejected',
      rejectionReason: reason.trim(),
      approvedBy: adminId,
      approvedAt: new Date()
    });
    
    // Send rejection email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@ibltd.com',
        to: user.email,
        subject: 'Account Registration Update - IB LTD Banking',
        html: `
          <h2>Account Registration Update</h2>
          <p>Dear ${user.name},</p>
          <p>We regret to inform you that your account registration request has been declined.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>If you have any questions or would like to reapply, please contact our support team.</p>
          <p>Best regards,<br>IB LTD Banking Team</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Signup request rejected successfully'
    });
    
  } catch (error) {
    console.error('Reject signup request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting signup request'
    });
  }
};

/**
 * Get signup request statistics
 * @route GET /api/admin/signup-requests/stats
 * @access Private/Admin
 */
const getSignupRequestStats = async (req, res) => {
  try {
    const totalPending = await User.countDocuments({ status: 'pending' });
    const totalApproved = await User.countDocuments({ status: 'approved' });
    const totalRejected = await User.countDocuments({ status: 'rejected' });
    
    // Get recent requests (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRequests = await User.countDocuments({
      status: 'pending',
      createdAt: { $gte: sevenDaysAgo }
    });
    
    res.status(200).json({
      success: true,
      message: 'Signup request statistics retrieved successfully',
      data: {
        totalPending,
        totalApproved,
        totalRejected,
        recentRequests
      }
    });
    
  } catch (error) {
    console.error('Get signup request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

module.exports = {
  getPendingSignupRequests,
  approveSignupRequest,
  rejectSignupRequest,
  getSignupRequestStats
};