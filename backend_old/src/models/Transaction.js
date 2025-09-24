const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Account ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['deposit', 'withdraw', 'transfer', 'bill_payment', 'mobile_recharge'],
      message: 'Transaction type must be deposit, withdraw, transfer, bill_payment, or mobile_recharge'
    },
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [0.01, 'Transaction amount must be greater than 0'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value > 0;
      },
      message: 'Amount must be a valid positive number'
    }
  },
  balanceBefore: {
    type: Number,
    required: [true, 'Balance before transaction is required'],
    min: [0, 'Balance before cannot be negative'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Balance before must be a valid non-negative number'
    }
  },
  balanceAfter: {
    type: Number,
    required: [true, 'Balance after transaction is required'],
    min: [0, 'Balance after cannot be negative'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Balance after must be a valid non-negative number'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  // For transfer transactions
  toAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: function() {
      return this.type === 'transfer';
    }
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.type === 'transfer';
    }
  },
  // For bill payment transactions
  billPaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BillPayment',
    required: function() {
      return this.type === 'bill_payment' || this.type === 'mobile_recharge';
    }
  },
  // Transaction status
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      message: 'Status must be pending, processing, completed, failed, cancelled, or refunded'
    },
    default: 'pending'
  },
  // Transaction reference number
  transactionRef: {
    type: String,
    unique: true,
    index: true
  },
  // Additional metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Optimized compound indexes for better query performance
transactionSchema.index({ userId: 1, createdAt: -1 }); // User transactions by date
transactionSchema.index({ accountId: 1, createdAt: -1 }); // Account transactions by date
transactionSchema.index({ type: 1, createdAt: -1 }); // Transactions by type and date
transactionSchema.index({ status: 1, createdAt: -1 }); // Transactions by status and date
transactionSchema.index({ transactionRef: 1 }); // Unique transaction reference lookup

// Additional indexes for common query patterns
transactionSchema.index({ userId: 1, type: 1 }); // User transactions by type
transactionSchema.index({ userId: 1, status: 1 }); // User transactions by status
transactionSchema.index({ status: 1, type: 1 }); // Status and type filtering
transactionSchema.index({ amount: 1 }); // Amount-based queries
transactionSchema.index({ createdAt: -1 }); // General date sorting

// Compound index for admin filtering
transactionSchema.index({ 
  status: 1, 
  type: 1, 
  createdAt: -1 
}); // Admin dashboard queries

// Text index for search functionality
transactionSchema.index({ 
  description: 'text', 
  transactionRef: 'text' 
}, {
  weights: { transactionRef: 10, description: 5 },
  name: 'transaction_text_index'
});

// Virtual to populate user information
transactionSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate account information
transactionSchema.virtual('account', {
  ref: 'Account',
  localField: 'accountId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate destination account for transfers
transactionSchema.virtual('toAccount', {
  ref: 'Account',
  localField: 'toAccountId',
  foreignField: '_id',
  justOne: true
});

// Instance method to format amount with currency
transactionSchema.methods.getFormattedAmount = function() {
  return `$${this.amount.toFixed(2)}`;
};

// Instance method to get transaction summary
transactionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.type,
    amount: this.getFormattedAmount(),
    description: this.description,
    status: this.status,
    date: this.createdAt,
    transactionRef: this.transactionRef
  };
};

// Static method to find transactions by user
transactionSchema.statics.findByUserId = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('account', 'accountNumber accountType')
    .populate('user', 'name email');
};

// Static method to find transactions by account
transactionSchema.statics.findByAccountId = function(accountId, limit = 50) {
  return this.find({ accountId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('account', 'accountNumber accountType')
    .populate('user', 'name email');
};

// Static method to get transaction statistics
transactionSchema.statics.getTransactionStats = function(userId, startDate, endDate) {
  const matchStage = { userId };
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

// Static method to generate unique transaction reference
transactionSchema.statics.generateTransactionRef = async function() {
  let transactionRef;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate transaction reference: TXN + timestamp + random 4 digits
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000);
    transactionRef = `TXN${timestamp}${random}`;
    
    // Check if transaction reference already exists
    const existingTransaction = await this.findOne({ transactionRef });
    if (!existingTransaction) {
      isUnique = true;
    }
  }
  
  return transactionRef;
};

// Pre-save hook to generate transaction reference
transactionSchema.pre('save', async function(next) {
  if (!this.transactionRef) {
    try {
      this.transactionRef = await this.constructor.generateTransactionRef();
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Pre-save hook to validate balance calculations
transactionSchema.pre('save', function(next) {
  const balanceDifference = this.balanceAfter - this.balanceBefore;
  
  switch (this.type) {
    case 'deposit':
      if (balanceDifference !== this.amount) {
        return next(new Error('Invalid balance calculation for deposit'));
      }
      break;
    case 'withdraw':
      if (balanceDifference !== -this.amount) {
        return next(new Error('Invalid balance calculation for withdrawal'));
      }
      break;
    case 'transfer':
      if (balanceDifference !== -this.amount) {
        return next(new Error('Invalid balance calculation for transfer'));
      }
      break;
  }
  
  next();
});

// Pre-save hook to validate user and account exist
transactionSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const Account = mongoose.model('Account');
    
    // Validate user exists
    const user = await User.findById(this.userId);
    if (!user) {
      return next(new Error('User does not exist'));
    }
    
    // Validate account exists and belongs to user
    const account = await Account.findById(this.accountId);
    if (!account) {
      return next(new Error('Account does not exist'));
    }
    
    if (account.userId.toString() !== this.userId.toString()) {
      return next(new Error('Account does not belong to the specified user'));
    }
    
    // For transfers, validate destination account
    if (this.type === 'transfer' && this.toAccountId) {
      const toAccount = await Account.findById(this.toAccountId);
      if (!toAccount) {
        return next(new Error('Destination account does not exist'));
      }
      this.toUserId = toAccount.userId;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);