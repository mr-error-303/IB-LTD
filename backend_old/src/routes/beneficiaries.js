const express = require('express');
const router = express.Router();
const {
  getBeneficiaries,
  getBeneficiaryById,
  addBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  verifyBeneficiary
} = require('../controllers/beneficiaryController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for beneficiary operations
const beneficiaryRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many beneficiary requests, please try again later'
  }
});

// Apply rate limiting and authentication to all routes
router.use(beneficiaryRateLimit);
router.use(protect);

// @route   GET /api/beneficiaries
// @desc    Get all beneficiaries for authenticated user
// @access  Private
router.get('/', getBeneficiaries);

// @route   GET /api/beneficiaries/:id
// @desc    Get beneficiary by ID
// @access  Private
router.get('/:id', getBeneficiaryById);

// @route   POST /api/beneficiaries
// @desc    Add new beneficiary
// @access  Private
router.post('/', addBeneficiary);

// @route   PUT /api/beneficiaries/:id
// @desc    Update beneficiary
// @access  Private
router.put('/:id', updateBeneficiary);

// @route   DELETE /api/beneficiaries/:id
// @desc    Delete beneficiary
// @access  Private
router.delete('/:id', deleteBeneficiary);

// @route   POST /api/beneficiaries/verify
// @desc    Verify beneficiary account details
// @access  Private
router.post('/verify', verifyBeneficiary);

module.exports = router;