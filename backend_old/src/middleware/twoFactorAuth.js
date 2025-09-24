const TwoFactorAuth = require('../models/TwoFactorAuth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

// Rate limiting for 2FA attempts
const twoFactorRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many 2FA attempts, please try again later',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default key generator to avoid IPv6 issues
  keyGenerator: undefined,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

// Middleware to check if 2FA is required
const require2FA = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const twoFactorAuth = await TwoFactorAuth.findByUserId(req.user.id);
    
    // If 2FA is not set up, allow access but recommend setup
    if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
      req.twoFactorRequired = false;
      req.twoFactorRecommended = true;
      return next();
    }

    // Check if device is trusted
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    };

    if (twoFactorAuth.isTrustedDevice(deviceInfo)) {
      await twoFactorAuth.save();
      req.twoFactorRequired = false;
      req.twoFactorVerified = true;
      return next();
    }

    // Check if 2FA token is provided
    const twoFactorToken = req.headers['x-2fa-token'] || req.body.twoFactorToken;
    
    if (!twoFactorToken) {
      return res.status(200).json({
        requiresTwoFactor: true,
        availableMethods: getAvailableMethods(twoFactorAuth),
        message: 'Two-factor authentication required'
      });
    }

    // Verify 2FA token
    const isValid = await verify2FAToken(twoFactorAuth, twoFactorToken, req);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid two-factor authentication code',
        requiresTwoFactor: true,
        availableMethods: getAvailableMethods(twoFactorAuth)
      });
    }

    await twoFactorAuth.save();
    req.twoFactorRequired = true;
    req.twoFactorVerified = true;
    
    next();
  } catch (error) {
    console.error('2FA middleware error:', error);
    res.status(500).json({ error: 'Two-factor authentication error' });
  }
};

// Middleware to enforce 2FA for sensitive actions
const requireSensitive2FA = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const twoFactorAuth = await TwoFactorAuth.findByUserId(req.user.id);
    
    if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
      return res.status(403).json({
        error: 'Two-factor authentication must be enabled for this action',
        requiresSetup: true
      });
    }

    if (!twoFactorAuth.settings.requireForSensitiveActions) {
      return next();
    }

    // For sensitive actions, always require fresh 2FA (ignore trusted devices)
    const twoFactorToken = req.headers['x-2fa-token'] || req.body.twoFactorToken;
    
    if (!twoFactorToken) {
      return res.status(200).json({
        requiresTwoFactor: true,
        sensitiveAction: true,
        availableMethods: getAvailableMethods(twoFactorAuth),
        message: 'Two-factor authentication required for this sensitive action'
      });
    }

    const isValid = await verify2FAToken(twoFactorAuth, twoFactorToken, req);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid two-factor authentication code',
        requiresTwoFactor: true,
        sensitiveAction: true,
        availableMethods: getAvailableMethods(twoFactorAuth)
      });
    }

    await twoFactorAuth.save();
    next();
  } catch (error) {
    console.error('Sensitive 2FA middleware error:', error);
    res.status(500).json({ error: 'Two-factor authentication error' });
  }
};

// Helper function to get available 2FA methods
function getAvailableMethods(twoFactorAuth) {
  const methods = [];
  
  if (twoFactorAuth.methods.totp.enabled) {
    methods.push('totp');
  }
  
  if (twoFactorAuth.methods.sms.enabled) {
    methods.push('sms');
  }
  
  if (twoFactorAuth.methods.email.enabled) {
    methods.push('email');
  }
  
  // Always include backup codes if TOTP is enabled
  if (twoFactorAuth.methods.totp.enabled && 
      twoFactorAuth.methods.totp.backupCodes.some(code => !code.used)) {
    methods.push('backup_code');
  }
  
  return methods;
}

// Helper function to verify 2FA token
async function verify2FAToken(twoFactorAuth, token, req) {
  const tokenType = detectTokenType(token);
  
  switch (tokenType) {
    case 'totp':
      if (twoFactorAuth.methods.totp.enabled) {
        const isValid = twoFactorAuth.verifyTOTP(token);
        if (isValid) {
          twoFactorAuth.settings.lastMethodUsed = 'totp';
          return true;
        }
      }
      break;
      
    case 'backup_code':
      if (twoFactorAuth.methods.totp.enabled) {
        const isValid = twoFactorAuth.verifyBackupCode(token);
        if (isValid) {
          return true;
        }
      }
      break;
      
    case 'recovery_token':
      const isValid = twoFactorAuth.verifyRecoveryToken(token, req.ip);
      if (isValid) {
        return true;
      }
      break;
      
    default:
      // Could be SMS or email code - implement based on your SMS/email service
      return await verifyOTPCode(twoFactorAuth, token, req);
  }
  
  return false;
}

// Helper function to detect token type
function detectTokenType(token) {
  // TOTP tokens are typically 6 digits
  if (/^\d{6}$/.test(token)) {
    return 'totp';
  }
  
  // Backup codes are typically 8 character hex strings
  if (/^[A-F0-9]{8}$/i.test(token)) {
    return 'backup_code';
  }
  
  // Recovery tokens are longer hex strings
  if (/^[a-f0-9]{64}$/i.test(token)) {
    return 'recovery_token';
  }
  
  // Default to OTP (SMS/Email)
  return 'otp';
}

// Helper function to verify OTP codes (SMS/Email)
async function verifyOTPCode(twoFactorAuth, code, req) {
  // This would integrate with your SMS/Email service
  // For now, return false as these methods need external services
  
  // Example implementation:
  // if (twoFactorAuth.methods.sms.enabled) {
  //   const isValid = await verifySMSCode(twoFactorAuth.methods.sms.phoneNumber, code);
  //   if (isValid) {
  //     twoFactorAuth.settings.lastMethodUsed = 'sms';
  //     return true;
  //   }
  // }
  
  // if (twoFactorAuth.methods.email.enabled) {
  //   const isValid = await verifyEmailCode(twoFactorAuth.methods.email.emailAddress, code);
  //   if (isValid) {
  //     twoFactorAuth.settings.lastMethodUsed = 'email';
  //     return true;
  //   }
  // }
  
  return false;
}

// Middleware to add device to trusted list
const trustDevice = async (req, res, next) => {
  try {
    if (!req.user || !req.twoFactorVerified) {
      return next();
    }

    const trustDeviceRequested = req.body.trustDevice || req.headers['x-trust-device'];
    
    if (!trustDeviceRequested) {
      return next();
    }

    const twoFactorAuth = await TwoFactorAuth.findByUserId(req.user.id);
    
    if (twoFactorAuth) {
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        deviceName: req.body.deviceName || 'Unknown Device',
        location: req.body.location || {}
      };
      
      const deviceId = twoFactorAuth.addTrustedDevice(deviceInfo);
      await twoFactorAuth.save();
      
      req.trustedDeviceId = deviceId;
    }

    next();
  } catch (error) {
    console.error('Trust device middleware error:', error);
    next(); // Continue even if trust device fails
  }
};

// Middleware to generate temporary 2FA bypass token for account recovery
const generateRecoveryToken = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Verify admin permissions for recovery token generation
    if (!req.user || !req.user.role || req.user.role.level < 9) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const twoFactorAuth = await TwoFactorAuth.findByUserId(userId);
    
    if (!twoFactorAuth) {
      return res.status(404).json({ error: 'Two-factor authentication not found' });
    }

    const recoveryToken = twoFactorAuth.generateRecoveryToken(req.ip);
    await twoFactorAuth.save();

    req.recoveryToken = recoveryToken;
    next();
  } catch (error) {
    console.error('Recovery token generation error:', error);
    res.status(500).json({ error: 'Failed to generate recovery token' });
  }
};

// Middleware to validate 2FA setup completion
const validate2FASetup = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const twoFactorAuth = await TwoFactorAuth.findByUserId(req.user.id);
    
    if (!twoFactorAuth) {
      // Create default 2FA settings
      const newTwoFactorAuth = await TwoFactorAuth.createForUser(req.user.id);
      req.twoFactorAuth = newTwoFactorAuth;
    } else {
      req.twoFactorAuth = twoFactorAuth;
    }

    next();
  } catch (error) {
    console.error('2FA setup validation error:', error);
    res.status(500).json({ error: 'Two-factor authentication setup error' });
  }
};

module.exports = {
  require2FA,
  requireSensitive2FA,
  trustDevice,
  generateRecoveryToken,
  validate2FASetup,
  twoFactorRateLimit
};