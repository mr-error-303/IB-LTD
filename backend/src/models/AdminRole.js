const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Role name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Role description is required'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  level: {
    type: Number,
    required: [true, 'Role level is required'],
    min: [1, 'Role level must be at least 1'],
    max: [10, 'Role level cannot exceed 10']
  },
  permissions: {
    // User Management
    users: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      approve: { type: Boolean, default: false },
      ban: { type: Boolean, default: false },
      export: { type: Boolean, default: false }
    },
    // Transaction Management
    transactions: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      approve: { type: Boolean, default: false },
      reject: { type: Boolean, default: false },
      export: { type: Boolean, default: false }
    },
    // Balance Management
    balance: {
      view: { type: Boolean, default: false },
      adjust: { type: Boolean, default: false },
      bulk_adjust: { type: Boolean, default: false }
    },
    // Reports & Analytics
    reports: {
      view: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
      financial: { type: Boolean, default: false },
      user_analytics: { type: Boolean, default: false }
    },
    // System Management
    system: {
      settings: { type: Boolean, default: false },
      logs: { type: Boolean, default: false },
      alerts: { type: Boolean, default: false },
      backup: { type: Boolean, default: false }
    },
    // Role Management
    roles: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      assign: { type: Boolean, default: false }
    },
    // Activity Logs
    activity_logs: {
      view: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    }
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
  }
}, {
  timestamps: true
});

// Index for better query performance
adminRoleSchema.index({ name: 1 });
adminRoleSchema.index({ level: 1 });
adminRoleSchema.index({ isActive: 1 });

// Virtual for permission count
adminRoleSchema.virtual('permissionCount').get(function() {
  let count = 0;
  const permissions = this.permissions;
  
  Object.keys(permissions).forEach(category => {
    Object.keys(permissions[category]).forEach(permission => {
      if (permissions[category][permission]) count++;
    });
  });
  
  return count;
});

// Method to check if role has specific permission
adminRoleSchema.methods.hasPermission = function(category, permission) {
  return this.permissions[category] && this.permissions[category][permission];
};

// Method to get all granted permissions
adminRoleSchema.methods.getGrantedPermissions = function() {
  const granted = [];
  const permissions = this.permissions;
  
  Object.keys(permissions).forEach(category => {
    Object.keys(permissions[category]).forEach(permission => {
      if (permissions[category][permission]) {
        granted.push(`${category}.${permission}`);
      }
    });
  });
  
  return granted;
};

// Static method to find roles by level
adminRoleSchema.statics.findByLevel = function(level) {
  return this.find({ level, isActive: true });
};

// Static method to find roles with specific permission
adminRoleSchema.statics.findWithPermission = function(category, permission) {
  const query = {};
  query[`permissions.${category}.${permission}`] = true;
  query.isActive = true;
  return this.find(query);
};

// Pre-save middleware to update updatedBy
adminRoleSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.constructor.currentUser;
  }
  next();
});

module.exports = mongoose.model('AdminRole', adminRoleSchema);