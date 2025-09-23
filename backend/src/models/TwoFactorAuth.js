const mongoose = require('mongoose');
const crypto = require('crypto');
const speakeasy = require('speakeasy');

const twoFactorAuthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  isEnabled: {
    type: Boolean,
    default: false
  },
  methods: {
    totp: {
      enabled: { type: Boolean, default: false },
      secret: { type: String }, // Base32 encoded secret
      backupCodes: [{ 
        code: String,
        used: { type: Boolean, default: false },
        usedAt: Date
      }],
      qrCodeUrl: String,
      verifiedAt: Date
    },
    sms: {
      enabled: { type: Boolean, default: false },
      phoneNumber: String,
      verifiedAt: Date,
      lastSentAt: Date,
      attempts: { type: Number, default: 0 },
      lockedUntil: Date
    },
    email: {
      enabled: { type: Boolean, default: false },
      emailAddress: String,
      verifiedAt: Date,
      lastSentAt: Date,
      attempts: { type: Number, default: 0 },
      lockedUntil: Date
    }
  },
  trustedDevices: [{
    deviceId: { type: String, required: true },
    deviceName: String,
    userAgent: String,
    ipAddress: String,
    location: {
      country: String,
      city: String
    },
    addedAt: { type: Date, default: Date.now },
    lastUsed: Date,
    expiresAt: Date,
    isActive: { type: Boolean, default: true }
  }],
  recoveryTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    used: { type: Boolean, default: false },
    usedAt: Date,
    ipAddress: String
  }],
  settings: {
    requireForLogin: { type: Boolean, default: true },
    requireForSensitiveActions: { type: Boolean, default: true },
    trustDeviceDuration: { type: Number, default: 30 }, // days
    backupCodesGenerated: { type: Date },
    lastMethodUsed: {
      type: String,
      enum: ['totp', 'sms', 'email', 'backup_code', 'recovery_token']
    }
  }
}, {
  timestamps: true
});

// Indexes
twoFactorAuthSchema.index({ userId: 1 });
twoFactorAuthSchema.index({ 'trustedDevices.deviceId': 1 });
twoFactorAuthSchema.index({ 'recoveryTokens.token': 1 });

// Virtual to check if any method is enabled
twoFactorAuthSchema.virtual('hasEnabledMethod').get(function() {
  return this.methods.totp.enabled || 
         this.methods.sms.enabled || 
         this.methods.email.enabled;
});

// Method to generate TOTP secret
twoFactorAuthSchema.methods.generateTOTPSecret = function(userEmail, serviceName = 'IB LTD Admin') {
  const secret = speakeasy.generateSecret({
    name: userEmail,
    issuer: serviceName,
    length: 32
  });
  
  this.methods.totp.secret = secret.base32;
  this.methods.totp.qrCodeUrl = secret.otpauth_url;
  
  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url,
    manualEntryKey: secret.base32
  };
};

// Method to verify TOTP token
twoFactorAuthSchema.methods.verifyTOTP = function(token) {
  if (!this.methods.totp.enabled || !this.methods.totp.secret) {
    return false;
  }
  
  return speakeasy.totp.verify({
    secret: this.methods.totp.secret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps (60 seconds) of drift
  });
};

// Method to generate backup codes
twoFactorAuthSchema.methods.generateBackupCodes = function(count = 10) {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
    
    this.methods.totp.backupCodes.push({
      code: code,
      used: false
    });
  }
  
  this.settings.backupCodesGenerated = new Date();
  return codes;
};

// Method to verify backup code
twoFactorAuthSchema.methods.verifyBackupCode = function(code) {
  const backupCode = this.methods.totp.backupCodes.find(
    bc => bc.code === code.toUpperCase() && !bc.used
  );
  
  if (backupCode) {
    backupCode.used = true;
    backupCode.usedAt = new Date();
    this.settings.lastMethodUsed = 'backup_code';
    return true;
  }
  
  return false;
};

// Method to add trusted device
twoFactorAuthSchema.methods.addTrustedDevice = function(deviceInfo) {
  const deviceId = crypto.createHash('sha256')
    .update(deviceInfo.userAgent + deviceInfo.ipAddress)
    .digest('hex');
  
  // Remove existing device with same ID
  this.trustedDevices = this.trustedDevices.filter(
    device => device.deviceId !== deviceId
  );
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + this.settings.trustDeviceDuration);
  
  this.trustedDevices.push({
    deviceId,
    deviceName: deviceInfo.deviceName || 'Unknown Device',
    userAgent: deviceInfo.userAgent,
    ipAddress: deviceInfo.ipAddress,
    location: deviceInfo.location,
    expiresAt,
    lastUsed: new Date()
  });
  
  return deviceId;
};

// Method to check if device is trusted
twoFactorAuthSchema.methods.isTrustedDevice = function(deviceInfo) {
  const deviceId = crypto.createHash('sha256')
    .update(deviceInfo.userAgent + deviceInfo.ipAddress)
    .digest('hex');
  
  const device = this.trustedDevices.find(
    d => d.deviceId === deviceId && 
         d.isActive && 
         d.expiresAt > new Date()
  );
  
  if (device) {
    device.lastUsed = new Date();
    return true;
  }
  
  return false;
};

// Method to generate recovery token
twoFactorAuthSchema.methods.generateRecoveryToken = function(ipAddress) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry
  
  this.recoveryTokens.push({
    token,
    expiresAt,
    ipAddress
  });
  
  return token;
};

// Method to verify recovery token
twoFactorAuthSchema.methods.verifyRecoveryToken = function(token, ipAddress) {
  const recoveryToken = this.recoveryTokens.find(
    rt => rt.token === token && 
          !rt.used && 
          rt.expiresAt > new Date() &&
          rt.ipAddress === ipAddress
  );
  
  if (recoveryToken) {
    recoveryToken.used = true;
    recoveryToken.usedAt = new Date();
    this.settings.lastMethodUsed = 'recovery_token';
    return true;
  }
  
  return false;
};

// Method to enable TOTP
twoFactorAuthSchema.methods.enableTOTP = function() {
  this.methods.totp.enabled = true;
  this.methods.totp.verifiedAt = new Date();
  this.isEnabled = true;
  
  // Generate backup codes if not already generated
  if (this.methods.totp.backupCodes.length === 0) {
    this.generateBackupCodes();
  }
};

// Method to disable TOTP
twoFactorAuthSchema.methods.disableTOTP = function() {
  this.methods.totp.enabled = false;
  this.methods.totp.secret = undefined;
  this.methods.totp.qrCodeUrl = undefined;
  this.methods.totp.backupCodes = [];
  
  // Disable 2FA if no other methods are enabled
  if (!this.methods.sms.enabled && !this.methods.email.enabled) {
    this.isEnabled = false;
  }
};

// Method to clean up expired data
twoFactorAuthSchema.methods.cleanup = function() {
  const now = new Date();
  
  // Remove expired trusted devices
  this.trustedDevices = this.trustedDevices.filter(
    device => device.expiresAt > now
  );
  
  // Remove expired recovery tokens
  this.recoveryTokens = this.recoveryTokens.filter(
    token => token.expiresAt > now
  );
};

// Static method to find by user ID
twoFactorAuthSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId });
};

// Static method to create default 2FA settings for user
twoFactorAuthSchema.statics.createForUser = function(userId) {
  return this.create({
    userId,
    isEnabled: false,
    methods: {
      totp: { enabled: false },
      sms: { enabled: false },
      email: { enabled: false }
    },
    trustedDevices: [],
    recoveryTokens: [],
    settings: {
      requireForLogin: true,
      requireForSensitiveActions: true,
      trustDeviceDuration: 30
    }
  });
};

// Pre-save middleware to cleanup expired data
twoFactorAuthSchema.pre('save', function(next) {
  this.cleanup();
  next();
});

module.exports = mongoose.model('TwoFactorAuth', twoFactorAuthSchema);