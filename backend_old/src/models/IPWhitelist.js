const mongoose = require('mongoose');

const ipWhitelistSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    unique: true,
    validate: {
      validator: function(v) {
        // IPv4 validation
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        // IPv6 validation (basic)
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        // CIDR notation validation
        const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
        
        return ipv4Regex.test(v) || ipv6Regex.test(v) || cidrRegex.test(v);
      },
      message: 'Invalid IP address format'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null // null means no expiration
  },
  lastUsed: {
    type: Date,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
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

// Indexes for better query performance
ipWhitelistSchema.index({ ipAddress: 1 });
ipWhitelistSchema.index({ adminId: 1 });
ipWhitelistSchema.index({ isActive: 1 });
ipWhitelistSchema.index({ expiresAt: 1 });

// Virtual to check if IP is expired
ipWhitelistSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Method to check if IP matches (supports CIDR notation)
ipWhitelistSchema.methods.matchesIP = function(clientIP) {
  const whitelistIP = this.ipAddress;
  
  // Exact match
  if (whitelistIP === clientIP) {
    return true;
  }
  
  // CIDR notation check
  if (whitelistIP.includes('/')) {
    return this.isIPInCIDR(clientIP, whitelistIP);
  }
  
  return false;
};

// Helper method to check if IP is in CIDR range
ipWhitelistSchema.methods.isIPInCIDR = function(ip, cidr) {
  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - bits) - 1);
  
  const ipToNumber = (ip) => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  };
  
  return (ipToNumber(ip) & mask) === (ipToNumber(range) & mask);
};

// Method to update usage statistics
ipWhitelistSchema.methods.recordUsage = function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return this.save();
};

// Static method to find active IPs for admin
ipWhitelistSchema.statics.findActiveForAdmin = function(adminId) {
  return this.find({
    adminId,
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Static method to check if IP is whitelisted for any admin
ipWhitelistSchema.statics.isIPWhitelisted = async function(clientIP) {
  const whitelistEntries = await this.find({
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
  
  for (const entry of whitelistEntries) {
    if (entry.matchesIP(clientIP)) {
      // Record usage
      await entry.recordUsage();
      return {
        isWhitelisted: true,
        entry: entry
      };
    }
  }
  
  return {
    isWhitelisted: false,
    entry: null
  };
};

// Pre-save middleware to update updatedBy
ipWhitelistSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.constructor.currentUser;
  }
  next();
});

module.exports = mongoose.model('IPWhitelist', ipWhitelistSchema);