const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    unique: true,
    trim: true,
    minlength: [10, 'Account number must be at least 10 characters'],
    maxlength: [20, 'Account number cannot exceed 20 characters'],
    match: [/^[0-9]+$/, 'Account number must contain only numbers']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Balance must be a valid positive number'
    }
  },
  accountType: {
    type: String,
    enum: {
      values: ['savings', 'checking', 'business'],
      message: 'Account type must be savings, checking, or business'
    },
    default: 'savings'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    minlength: [3, 'Currency code must be 3 characters'],
    maxlength: [3, 'Currency code must be 3 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
accountSchema.index({ accountNumber: 1 });
accountSchema.index({ userId: 1 });
accountSchema.index({ isActive: 1 });
accountSchema.index({ userId: 1, isActive: 1 });

// Virtual to populate user information
accountSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Instance method to format balance with currency
accountSchema.methods.getFormattedBalance = function() {
  return `${this.currency} ${this.balance.toFixed(2)}`;
};

// Instance method to check if account is active
accountSchema.methods.isAccountActive = function() {
  return this.isActive;
};

// Instance method to check if sufficient balance for withdrawal
accountSchema.methods.hasSufficientBalance = function(amount) {
  return this.balance >= amount;
};

// Static method to find accounts by user
accountSchema.statics.findByUserId = function(userId) {
  return this.find({ userId, isActive: true }).populate('user', 'name email');
};

// Static method to find account by account number
accountSchema.statics.findByAccountNumber = function(accountNumber) {
  return this.findOne({ accountNumber, isActive: true }).populate('user', 'name email');
};

// Static method to generate unique account number
accountSchema.statics.generateAccountNumber = async function() {
  let accountNumber;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate 12-digit account number
    accountNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    
    // Check if account number already exists
    const existingAccount = await this.findOne({ accountNumber });
    if (!existingAccount) {
      isUnique = true;
    }
  }
  
  return accountNumber;
};

// Pre-save hook to generate account number if not provided
accountSchema.pre('save', async function(next) {
  if (!this.accountNumber) {
    try {
      this.accountNumber = await this.constructor.generateAccountNumber();
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Pre-save hook to validate user exists
accountSchema.pre('save', async function(next) {
  if (this.isModified('userId')) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.userId);
      if (!user) {
        return next(new Error('User does not exist'));
      }
      if (!user.isActive) {
        return next(new Error('Cannot create account for inactive user'));
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Account', accountSchema);