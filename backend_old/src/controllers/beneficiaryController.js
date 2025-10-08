const { Beneficiary, User, Account } = require('../models');

// @desc    Get all beneficiaries for a user
// @route   GET /api/beneficiaries
// @access  Private
const getBeneficiaries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId: req.user.id };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { accountNumber: { $regex: req.query.search, $options: 'i' } },
        { bankName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const beneficiaries = await Beneficiary.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Beneficiary.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        beneficiaries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get beneficiaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching beneficiaries'
    });
  }
};

// @desc    Get beneficiary by ID
// @route   GET /api/beneficiaries/:id
// @access  Private
const getBeneficiaryById = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { beneficiary }
    });

  } catch (error) {
    console.error('Get beneficiary by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching beneficiary'
    });
  }
};

// @desc    Add new beneficiary
// @route   POST /api/beneficiaries
// @access  Private
const addBeneficiary = async (req, res) => {
  try {
    const { name, accountNumber, bankName, bankCode, email, phone, nickname } = req.body;

    // Validation
    if (!name || !accountNumber || !bankName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, account number, and bank name'
      });
    }

    // Check if beneficiary already exists for this user
    const existingBeneficiary = await Beneficiary.findOne({
      userId: req.user.id,
      accountNumber,
      bankName
    });

    if (existingBeneficiary) {
      return res.status(400).json({
        success: false,
        message: 'Beneficiary with this account number and bank already exists'
      });
    }

    // For internal transfers, verify the account exists
    if (bankName.toLowerCase().includes('ib ltd') || bankCode === 'IBLDT') {
      const targetAccount = await Account.findOne({ accountNumber });
      if (!targetAccount) {
        return res.status(404).json({
          success: false,
          message: 'Account not found in our system'
        });
      }

      // Get account holder details
      const accountHolder = await User.findById(targetAccount.userId);
      if (!accountHolder) {
        return res.status(404).json({
          success: false,
          message: 'Account holder not found'
        });
      }

      // Verify name matches (optional security check)
      if (name.toLowerCase() !== accountHolder.name.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'Account holder name does not match'
        });
      }
    }

    const beneficiaryData = {
      userId: req.user.id,
      name: name.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
      bankCode: bankCode?.trim(),
      email: email?.toLowerCase().trim(),
      phone: phone?.trim(),
      nickname: nickname?.trim(),
      isActive: true
    };

    const beneficiary = await Beneficiary.create(beneficiaryData);

    res.status(201).json({
      success: true,
      message: 'Beneficiary added successfully',
      data: { beneficiary }
    });

  } catch (error) {
    console.error('Add beneficiary error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while adding beneficiary'
    });
  }
};

// @desc    Update beneficiary
// @route   PUT /api/beneficiaries/:id
// @access  Private
const updateBeneficiary = async (req, res) => {
  try {
    const { name, email, phone, nickname, isActive } = req.body;

    const beneficiary = await Beneficiary.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary not found'
      });
    }

    // Build update object (don't allow changing account number or bank details)
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone) updateData.phone = phone.trim();
    if (nickname) updateData.nickname = nickname.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedBeneficiary = await Beneficiary.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Beneficiary updated successfully',
      data: { beneficiary: updatedBeneficiary }
    });

  } catch (error) {
    console.error('Update beneficiary error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating beneficiary'
    });
  }
};

// @desc    Delete beneficiary
// @route   DELETE /api/beneficiaries/:id
// @access  Private
const deleteBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary not found'
      });
    }

    await Beneficiary.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Beneficiary deleted successfully'
    });

  } catch (error) {
    console.error('Delete beneficiary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting beneficiary'
    });
  }
};

// @desc    Verify beneficiary account
// @route   POST /api/beneficiaries/verify
// @access  Private
const verifyBeneficiary = async (req, res) => {
  try {
    const { accountNumber, bankName, bankCode } = req.body;

    if (!accountNumber || !bankName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide account number and bank name'
      });
    }

    // For internal transfers, verify the account exists
    if (bankName.toLowerCase().includes('ib ltd') || bankCode === 'IBLDT') {
      const targetAccount = await Account.findOne({ accountNumber })
        .populate('userId', 'name email');

      if (!targetAccount) {
        return res.status(404).json({
          success: false,
          message: 'Account not found in our system'
        });
      }

      if (!targetAccount.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Target account is not active'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Account verified successfully',
        data: {
          accountNumber: targetAccount.accountNumber,
          accountHolderName: targetAccount.userId.name,
          bankName: 'IB LTD Bank',
          accountType: targetAccount.accountType
        }
      });
    }

    // For external banks, simulate verification (in real app, call external API)
    res.status(200).json({
      success: true,
      message: 'Account verification initiated. Please confirm account holder name.',
      data: {
        accountNumber,
        bankName,
        requiresNameConfirmation: true
      }
    });

  } catch (error) {
    console.error('Verify beneficiary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying beneficiary'
    });
  }
};

module.exports = {
  getBeneficiaries,
  getBeneficiaryById,
  addBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  verifyBeneficiary
};