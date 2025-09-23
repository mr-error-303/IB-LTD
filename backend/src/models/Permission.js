const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    enum: [
      'user_management',
      'financial_operations',
      'system_administration',
      'reporting',
      'security',
      'content_management',
      'api_access',
      'testing'
    ]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
permissionSchema.index({ name: 1 });
permissionSchema.index({ category: 1 });
permissionSchema.index({ isActive: 1 });
permissionSchema.index({ createdBy: 1 });
permissionSchema.index({ createdAt: -1 });

// Virtual for usage count (would need to be calculated from roles)
permissionSchema.virtual('usageCount').get(function() {
  // This would typically be calculated by counting roles that use this permission
  return 0;
});

// Instance method to check if permission is system-critical
permissionSchema.methods.isCritical = function() {
  const criticalPermissions = [
    'system_administration.full_access',
    'user_management.delete_users',
    'financial_operations.adjust_balances'
  ];
  return criticalPermissions.includes(`${this.category}.${this.name}`);
};

// Static method to find permissions by category
permissionSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Static method to get all categories
permissionSchema.statics.getCategories = function() {
  return this.distinct('category');
};

// Pre-save middleware
permissionSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.replace(/\s+/g, '_').toLowerCase();
  }
  next();
});

// Pre-remove middleware to prevent deletion of critical permissions
permissionSchema.pre('remove', function(next) {
  if (this.isCritical()) {
    const error = new Error('Cannot delete critical system permission');
    error.status = 400;
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Permission', permissionSchema);