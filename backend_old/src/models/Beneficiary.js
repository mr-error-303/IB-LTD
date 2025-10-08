const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Beneficiary name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true,
    minlength: [10, 'Account number must be at least 10 characters'],
    maxlength: [20, 'Account number cannot exceed 20 characters'],
    match: [/^[0-9]+$/, 'Account number must contain only numbers']
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true,
    maxlength: [100, 'Bank name cannot exceed 100 characters']
  },
  bankCode: {
    type: String,
    trim: true,
    maxlength: [10, 'Bank code cannot exceed 10 characters']
  },
  routingNumber: {
    type: String,
    trim: true,
    maxlength: [20, 'Routing number cannot exceed 20 characters']
  },
  transferType: {
    type: String,
    enum: {
      values: ['internal', 'npsb', 'beftn', 'mobile_wallet', 'international'],
      message: 'Transfer type must be internal, npsb, beftn, mobile_wallet, or international'
    },
    required: [true, 'Transfer type is required']
  },
  // For mobile wallet transfers
  mobileWalletType: {
    type: String,
    enum: {
      values: ['bkash', 'nagad', 'rocket', 'upay', 'mcash'],
      message: 'Mobile wallet type must be bkash, nagad, rocket, upay, or mcash'
    },
    required: function() {
      return this.transferType === 'mobile_wallet';
    }
  },
  mobileNumber: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Please enter a valid mobile number'],
    required: function() {
      return this.transferType === 'mobile_wallet';
    }
  },
  // For international transfers
  swiftCode: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [11, 'SWIFT code cannot exceed 11 characters'],
    required: function() {
      return this.transferType === 'international';
    }
  },
  country: {
    type: String,
    trim: true,
    maxlength: [50, 'Country name cannot exceed 50 characters'],
    required: function() {
      return this.transferType === 'international';
    }
  },
  currency: {
    type: String,
    default: 'BDT',
    uppercase: true,
    minlength: [3, 'Currency code must be 3 characters'],
    maxlength: [3, 'Currency code must be 3 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Verification status for security
  isVerified: {
    type: Boolean,
    default: false
  },
  // Additional notes
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Usage tracking
  lastUsed: {
    type: Date
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
beneficiarySchema.index({ userId: 1, isActive: 1 });
beneficiarySchema.index({ userId: 1, transferType: 1 });
beneficiarySchema.index({ accountNumber: 1, bankCode: 1 });

// Compound index to prevent duplicate beneficiaries
beneficiarySchema.index({ 
  userId: 1, 
  accountNumber: 1, 
  bankCode: 1, 
  transferType: 1 
}, { unique: true });

// Virtual to populate user information
beneficiarySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Instance method to get display name
beneficiarySchema.methods.getDisplayName = function() {
  return `${this.name} (${this.bankName})`;
};

// Instance method to get masked account number
beneficiarySchema.methods.getMaskedAccountNumber = function() {
  if (this.accountNumber.length <= 4) return this.accountNumber;
  const visibleDigits = this.accountNumber.slice(-4);
  const maskedPart = '*'.repeat(this.accountNumber.length - 4);
  return maskedPart + visibleDigits;
};

// Instance method to update usage
beneficiarySchema.methods.updateUsage = function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return this.save();
};

// Static method to find beneficiaries by user and type
beneficiarySchema.statics.findByUserAndType = function(userId, transferType) {
  return this.find({ 
    userId, 
    transferType, 
    isActive: true 
  }).sort({ usageCount: -1, lastUsed: -1 });
};

// Static method to find frequently used beneficiaries
beneficiarySchema.statics.findFrequentlyUsed = function(userId, limit = 5) {
  return this.find({ 
    userId, 
    isActive: true 
  })
  .sort({ usageCount: -1, lastUsed: -1 })
  .limit(limit);
};

// Pre-save middleware to validate mobile wallet requirements
beneficiarySchema.pre('save', function(next) {
  if (this.transferType === 'mobile_wallet') {
    if (!this.mobileWalletType || !this.mobileNumber) {
      return next(new Error('Mobile wallet type and mobile number are required for mobile wallet transfers'));
    }
  }
  
  if (this.transferType === 'international') {
    if (!this.swiftCode || !this.country) {
      return next(new Error('SWIFT code and country are required for international transfers'));
    }
  }
  
  next();
});

module.exports = mongoose.model('Beneficiary', beneficiarySchema);