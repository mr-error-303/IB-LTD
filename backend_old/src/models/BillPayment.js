const mongoose = require('mongoose');

const billPaymentSchema = new mongoose.Schema({
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
  billType: {
    type: String,
    enum: {
      values: [
        'electricity', 'gas', 'water', 'internet', 'mobile_postpaid', 
        'mobile_prepaid', 'tv_cable', 'insurance', 'loan_payment', 
        'credit_card', 'education', 'government_tax', 'other'
      ],
      message: 'Invalid bill type'
    },
    required: [true, 'Bill type is required']
  },
  provider: {
    type: String,
    required: [true, 'Service provider is required'],
    trim: true,
    maxlength: [100, 'Provider name cannot exceed 100 characters']
  },
  // Customer/Account details with the service provider
  customerNumber: {
    type: String,
    required: [true, 'Customer number is required'],
    trim: true,
    maxlength: [50, 'Customer number cannot exceed 50 characters']
  },
  customerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  // Bill details
  billNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Bill number cannot exceed 50 characters']
  },
  billMonth: {
    type: String,
    trim: true,
    maxlength: [20, 'Bill month cannot exceed 20 characters']
  },
  dueDate: {
    type: Date
  },
  amount: {
    type: Number,
    required: [true, 'Bill amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value > 0;
      },
      message: 'Amount must be a valid positive number'
    }
  },
  // Late fee if applicable
  lateFee: {
    type: Number,
    default: 0,
    min: [0, 'Late fee cannot be negative']
  },
  // Service charge
  serviceCharge: {
    type: Number,
    default: 0,
    min: [0, 'Service charge cannot be negative']
  },
  // Total amount (amount + lateFee + serviceCharge)
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0.01, 'Total amount must be greater than 0']
  },
  // Payment status
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      message: 'Invalid payment status'
    },
    default: 'pending'
  },
  // Transaction reference
  transactionRef: {
    type: String,
    unique: true,
    index: true
  },
  // Provider transaction reference
  providerRef: {
    type: String,
    trim: true,
    maxlength: [100, 'Provider reference cannot exceed 100 characters']
  },
  // Payment method
  paymentMethod: {
    type: String,
    enum: {
      values: ['account_balance', 'card', 'mobile_banking'],
      message: 'Invalid payment method'
    },
    default: 'account_balance'
  },
  // Scheduled payment
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduledDate: {
    type: Date
  },
  // Recurring payment
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: {
      values: ['monthly', 'quarterly', 'yearly'],
      message: 'Invalid recurring frequency'
    }
  },
  nextDueDate: {
    type: Date
  },
  // Auto-pay settings
  isAutoPay: {
    type: Boolean,
    default: false
  },
  // Additional details
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String
  },
  // Processing details
  processedAt: {
    type: Date
  },
  failureReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Failure reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
billPaymentSchema.index({ userId: 1, createdAt: -1 });
billPaymentSchema.index({ accountId: 1, createdAt: -1 });
billPaymentSchema.index({ billType: 1, provider: 1 });
billPaymentSchema.index({ status: 1, createdAt: -1 });
billPaymentSchema.index({ customerNumber: 1, provider: 1 });
billPaymentSchema.index({ dueDate: 1, isAutoPay: 1 });
billPaymentSchema.index({ isScheduled: 1, scheduledDate: 1 });

// Virtual to populate user information
billPaymentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate account information
billPaymentSchema.virtual('account', {
  ref: 'Account',
  localField: 'accountId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to calculate total amount
billPaymentSchema.pre('save', function(next) {
  this.totalAmount = this.amount + (this.lateFee || 0) + (this.serviceCharge || 0);
  next();
});

// Instance method to format amount with currency
billPaymentSchema.methods.getFormattedAmount = function() {
  return `BDT ${this.totalAmount.toFixed(2)}`;
};

// Instance method to check if payment is overdue
billPaymentSchema.methods.isOverdue = function() {
  if (!this.dueDate) return false;
  return new Date() > this.dueDate && this.status === 'pending';
};

// Instance method to get payment summary
billPaymentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    billType: this.billType,
    provider: this.provider,
    customerNumber: this.customerNumber,
    amount: this.getFormattedAmount(),
    status: this.status,
    dueDate: this.dueDate,
    isOverdue: this.isOverdue(),
    createdAt: this.createdAt
  };
};

// Static method to find bills by user and status
billPaymentSchema.statics.findByUserAndStatus = function(userId, status) {
  return this.find({ userId, status })
    .populate('account', 'accountNumber balance')
    .sort({ createdAt: -1 });
};

// Static method to find overdue bills
billPaymentSchema.statics.findOverdueBills = function(userId) {
  return this.find({
    userId,
    status: 'pending',
    dueDate: { $lt: new Date() }
  }).sort({ dueDate: 1 });
};

// Static method to find upcoming bills
billPaymentSchema.statics.findUpcomingBills = function(userId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    userId,
    status: 'pending',
    dueDate: { 
      $gte: new Date(),
      $lte: futureDate 
    }
  }).sort({ dueDate: 1 });
};

// Static method to find recurring bills due for processing
billPaymentSchema.statics.findRecurringBillsDue = function() {
  return this.find({
    isRecurring: true,
    isAutoPay: true,
    nextDueDate: { $lte: new Date() },
    status: { $ne: 'cancelled' }
  });
};

module.exports = mongoose.model('BillPayment', billPaymentSchema);