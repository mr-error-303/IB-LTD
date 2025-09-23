const express = require('express');
const router = express.Router();
const TwoFactorAuth = require('../models/TwoFactorAuth');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rolePermission');
const { 
  validate2FASetup, 
  requireSensitive2FA, 
  twoFactorRateLimit,
  generateRecoveryToken 
} = require('../middleware/twoFactorAuth');
const QRCode = require('qrcode');

// Get 2FA status and settings
router.get('/status', protect, validate2FASetup, async (req, res) => {
  try {
    const twoFactorAuth = req.twoFactorAuth;
    
    const status = {
      isEnabled: twoFactorAuth.isEnabled,
      hasEnabledMethod: twoFactorAuth.hasEnabledMethod,
      methods: {
        totp: {
          enabled: twoFactorAuth.methods.totp.enabled,
          verifiedAt: twoFactorAuth.methods.totp.verifiedAt
        },
        sms: {
          enabled: twoFactorAuth.methods.sms.enabled,
          phoneNumber: twoFactorAuth.methods.sms.phoneNumber ? 
            twoFactorAuth.methods.sms.phoneNumber.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2') : null,
          verifiedAt: twoFactorAuth.methods.sms.verifiedAt
        },
        email: {
          enabled: twoFactorAuth.methods.email.enabled,
          emailAddress: twoFactorAuth.methods.email.emailAddress ?
            twoFactorAuth.methods.email.emailAddress.replace(/(.{2}).*(@.*)/, '$1***$2') : null,
          verifiedAt: twoFactorAuth.methods.email.verifiedAt
        }
      },
      trustedDevicesCount: twoFactorAuth.trustedDevices.filter(d => d.isActive && d.expiresAt > new Date()).length,
      backupCodesRemaining: twoFactorAuth.methods.totp.backupCodes.filter(code => !code.used).length,
      settings: twoFactorAuth.settings
    };

    res.json(status);
  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
});

// Setup TOTP (Time-based One-Time Password)
router.post('/setup/totp', protect, validate2FASetup, async (req, res) => {
  try {
    const twoFactorAuth = req.twoFactorAuth;
    const user = await User.findById(req.user.id);
    
    if (twoFactorAuth.methods.totp.enabled) {
      return res.status(400).json({ error: 'TOTP is already enabled' });
    }

    const totpData = twoFactorAuth.generateTOTPSecret(user.email);
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(totpData.qrCodeUrl);
    
    await twoFactorAuth.save();

    res.json({
      secret: totpData.secret,
      qrCode: qrCodeDataUrl,
      manualEntryKey: totpData.manualEntryKey,
      message: 'Scan the QR code with your authenticator app and verify with a code'
    });
  } catch (error) {
    console.error('TOTP setup error:', error);
    res.status(500).json({ error: 'Failed to setup TOTP' });
  }
});

// Verify and enable TOTP
router.post('/verify/totp', protect, validate2FASetup, twoFactorRateLimit, async (req, res) => {
  try {
    const { token } = req.body;
    const twoFactorAuth = req.twoFactorAuth;
    
    if (!token) {
      return res.status(400).json({ error: 'TOTP token required' });
    }

    if (twoFactorAuth.methods.totp.enabled) {
      return res.status(400).json({ error: 'TOTP is already enabled' });
    }

    const isValid = twoFactorAuth.verifyTOTP(token);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid TOTP token' });
    }

    twoFactorAuth.enableTOTP();
    await twoFactorAuth.save();

    // Generate backup codes
    const backupCodes = twoFactorAuth.methods.totp.backupCodes.map(code => code.code);

    res.json({
      message: 'TOTP enabled successfully',
      backupCodes,
      warning: 'Save these backup codes in a secure location. They can only be used once each.'
    });
  } catch (error) {
    console.error('TOTP verification error:', error);
    res.status(500).json({ error: 'Failed to verify TOTP' });
  }
});

// Disable TOTP
router.post('/disable/totp', protect, requireSensitive2FA, validate2FASetup, async (req, res) => {
  try {
    const twoFactorAuth = req.twoFactorAuth;
    
    if (!twoFactorAuth.methods.totp.enabled) {
      return res.status(400).json({ error: 'TOTP is not enabled' });
    }

    twoFactorAuth.disableTOTP();
    await twoFactorAuth.save();

    res.json({ message: 'TOTP disabled successfully' });
  } catch (error) {
    console.error('TOTP disable error:', error);
    res.status(500).json({ error: 'Failed to disable TOTP' });
  }
});

// Generate new backup codes
router.post('/backup-codes/regenerate', protect, requireSensitive2FA, validate2FASetup, async (req, res) => {
  try {
    const twoFactorAuth = req.twoFactorAuth;
    
    if (!twoFactorAuth.methods.totp.enabled) {
      return res.status(400).json({ error: 'TOTP must be enabled to generate backup codes' });
    }

    // Clear existing backup codes
    twoFactorAuth.methods.totp.backupCodes = [];
    
    // Generate new backup codes
    const backupCodes = twoFactorAuth.generateBackupCodes();
    await twoFactorAuth.save();

    res.json({
      backupCodes,
      message: 'New backup codes generated successfully',
      warning: 'Previous backup codes are now invalid. Save these new codes in a secure location.'
    });
  } catch (error) {
    console.error('Backup codes regeneration error:', error);
    res.status(500).json({ error: 'Failed to regenerate backup codes' });
  }
});

// Get trusted devices
router.get('/trusted-devices', protect, validate2FASetup, async (req, res) => {
  try {
    const twoFactorAuth = req.twoFactorAuth;
    const now = new Date();
    
    const trustedDevices = twoFactorAuth.trustedDevices
      .filter(device => device.isActive && device.expiresAt > now)
      .map(device => ({
        id: device._id,
        deviceName: device.deviceName,
        location: device.location,
        addedAt: device.addedAt,
        lastUsed: device.lastUsed,
        expiresAt: device.expiresAt,
        isCurrent: device.deviceId === req.headers['user-agent'] + req.ip
      }));

    res.json({ trustedDevices });
  } catch (error) {
    console.error('Get trusted devices error:', error);
    res.status(500).json({ error: 'Failed to get trusted devices' });
  }
});

// Remove trusted device
router.delete('/trusted-devices/:deviceId', protect, validate2FASetup, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const twoFactorAuth = req.twoFactorAuth;
    
    const deviceIndex = twoFactorAuth.trustedDevices.findIndex(
      device => device._id.toString() === deviceId
    );
    
    if (deviceIndex === -1) {
      return res.status(404).json({ error: 'Trusted device not found' });
    }

    twoFactorAuth.trustedDevices[deviceIndex].isActive = false;
    await twoFactorAuth.save();

    res.json({ message: 'Trusted device removed successfully' });
  } catch (error) {
    console.error('Remove trusted device error:', error);
    res.status(500).json({ error: 'Failed to remove trusted device' });
  }
});

// Update 2FA settings
router.put('/settings', protect, requireSensitive2FA, validate2FASetup, async (req, res) => {
  try {
    const { requireForLogin, requireForSensitiveActions, trustDeviceDuration } = req.body;
    const twoFactorAuth = req.twoFactorAuth;
    
    if (typeof requireForLogin === 'boolean') {
      twoFactorAuth.settings.requireForLogin = requireForLogin;
    }
    
    if (typeof requireForSensitiveActions === 'boolean') {
      twoFactorAuth.settings.requireForSensitiveActions = requireForSensitiveActions;
    }
    
    if (typeof trustDeviceDuration === 'number' && trustDeviceDuration >= 1 && trustDeviceDuration <= 90) {
      twoFactorAuth.settings.trustDeviceDuration = trustDeviceDuration;
    }

    await twoFactorAuth.save();

    res.json({
      message: '2FA settings updated successfully',
      settings: twoFactorAuth.settings
    });
  } catch (error) {
    console.error('Update 2FA settings error:', error);
    res.status(500).json({ error: 'Failed to update 2FA settings' });
  }
});

// Admin: Generate recovery token for user
router.post('/admin/recovery-token', 
  protect, 
  requirePermission('role_management', 'create'),
  generateRecoveryToken,
  async (req, res) => {
    try {
      const { userId } = req.body;
      const recoveryToken = req.recoveryToken;
      
      const user = await User.findById(userId).select('email username');
      
      res.json({
        message: 'Recovery token generated successfully',
        recoveryToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username
        },
        expiresIn: '24 hours',
        warning: 'This token should be securely transmitted to the user and expires in 24 hours'
      });
    } catch (error) {
      console.error('Admin recovery token error:', error);
      res.status(500).json({ error: 'Failed to generate recovery token' });
    }
  }
);

// Admin: Get user 2FA status
router.get('/admin/user/:userId/status', 
  protect, 
  requirePermission('user_management', 'view'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select('email username');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const twoFactorAuth = await TwoFactorAuth.findByUserId(userId);
      
      if (!twoFactorAuth) {
        return res.json({
          user: { id: user._id, email: user.email, username: user.username },
          twoFactorEnabled: false,
          methods: { totp: false, sms: false, email: false }
        });
      }

      res.json({
        user: { id: user._id, email: user.email, username: user.username },
        twoFactorEnabled: twoFactorAuth.isEnabled,
        methods: {
          totp: twoFactorAuth.methods.totp.enabled,
          sms: twoFactorAuth.methods.sms.enabled,
          email: twoFactorAuth.methods.email.enabled
        },
        trustedDevicesCount: twoFactorAuth.trustedDevices.filter(d => d.isActive && d.expiresAt > new Date()).length,
        lastMethodUsed: twoFactorAuth.settings.lastMethodUsed,
        settings: twoFactorAuth.settings
      });
    } catch (error) {
      console.error('Admin get user 2FA status error:', error);
      res.status(500).json({ error: 'Failed to get user 2FA status' });
    }
  }
);

// Admin: Force disable user 2FA
router.post('/admin/user/:userId/disable', 
  protect, 
  requirePermission('user_management', 'edit'),
  requireSensitive2FA,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      
      const user = await User.findById(userId).select('email username');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const twoFactorAuth = await TwoFactorAuth.findByUserId(userId);
      
      if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
        return res.status(400).json({ error: 'User does not have 2FA enabled' });
      }

      // Disable all 2FA methods
      twoFactorAuth.isEnabled = false;
      twoFactorAuth.methods.totp.enabled = false;
      twoFactorAuth.methods.sms.enabled = false;
      twoFactorAuth.methods.email.enabled = false;
      
      // Clear sensitive data
      twoFactorAuth.methods.totp.secret = undefined;
      twoFactorAuth.methods.totp.backupCodes = [];
      twoFactorAuth.trustedDevices = [];
      twoFactorAuth.recoveryTokens = [];

      await twoFactorAuth.save();

      // Log the admin action
      console.log(`Admin ${req.user.id} disabled 2FA for user ${userId}. Reason: ${reason || 'Not provided'}`);

      res.json({
        message: 'User 2FA disabled successfully',
        user: { id: user._id, email: user.email, username: user.username },
        disabledBy: req.user.id,
        reason: reason || 'Not provided'
      });
    } catch (error) {
      console.error('Admin disable user 2FA error:', error);
      res.status(500).json({ error: 'Failed to disable user 2FA' });
    }
  }
);

module.exports = router;