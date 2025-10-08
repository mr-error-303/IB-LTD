import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, userAPI } from '../../services/api';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    department: user?.department || 'Administration',
    position: user?.position || 'Administrator',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    systemUpdates: false,
    marketingEmails: false,
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });

  // Activity logs state
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Edit mode states
  const [editingProfile, setEditingProfile] = useState(false);
  const [avatarDialog, setAvatarDialog] = useState(false);

  useEffect(() => {
    fetchUserPreferences();
    if (activeTab === 3) {
      fetchActivityLogs();
    }
  }, [activeTab]);

  const fetchUserPreferences = async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.success) {
        setPreferences({ ...preferences, ...response.data });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchActivityLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await adminAPI.get('/activity-logs');
      if (response.success) {
        setActivityLogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setMessage({ type: 'error', text: 'Failed to load activity logs' });
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await adminAPI.put('/user/profile', profileData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setEditingProfile(false);
        updateUser(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setSaving(true);
    try {
      const response = await adminAPI.put('/auth/changepassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await adminAPI.put('/user/profile', preferences);
      if (response.success) {
        setMessage({ type: 'success', text: 'Preferences saved successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderProfileTab = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={profileData.avatar}
            sx={{ width: 80, height: 80, mr: 2 }}
          >
            {profileData.firstName?.charAt(0) || profileData.username?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{profileData.firstName} {profileData.lastName}</Typography>
            <Typography color="text.secondary">{profileData.position}</Typography>
            <Button
              startIcon={<PhotoCameraIcon />}
              onClick={() => setAvatarDialog(true)}
              size="small"
              sx={{ mt: 1 }}
            >
              Change Photo
            </Button>
          </Box>
          <IconButton
            onClick={() => setEditingProfile(!editingProfile)}
            color={editingProfile ? "secondary" : "primary"}
          >
            {editingProfile ? <CancelIcon /> : <EditIcon />}
          </IconButton>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Username"
              value={profileData.username}
              onChange={(e) => handleProfileChange('username', e.target.value)}
              disabled={!editingProfile}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              disabled={!editingProfile}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name"
              value={profileData.firstName}
              onChange={(e) => handleProfileChange('firstName', e.target.value)}
              disabled={!editingProfile}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={profileData.lastName}
              onChange={(e) => handleProfileChange('lastName', e.target.value)}
              disabled={!editingProfile}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              disabled={!editingProfile}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!editingProfile}>
              <InputLabel>Department</InputLabel>
              <Select
                value={profileData.department}
                onChange={(e) => handleProfileChange('department', e.target.value)}
              >
                <MenuItem value="Administration">Administration</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Security">Security</MenuItem>
                <MenuItem value="Operations">Operations</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={profileData.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              disabled={!editingProfile}
            />
          </Grid>
        </Grid>

        {editingProfile && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? <CircularProgress size={20} /> : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setEditingProfile(false)}
            >
              Cancel
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderSecurityTab = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>Change Password</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={changePassword}
          disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
          sx={{ mt: 3 }}
        >
          {saving ? <CircularProgress size={20} /> : 'Change Password'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderPreferencesTab = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>Notification Preferences</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications}
                  onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                />
              }
              label="Email Notifications"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.pushNotifications}
                  onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                />
              }
              label="Push Notifications"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.securityAlerts}
                  onChange={(e) => handlePreferenceChange('securityAlerts', e.target.checked)}
                />
              }
              label="Security Alerts"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.systemUpdates}
                  onChange={(e) => handlePreferenceChange('systemUpdates', e.target.checked)}
                />
              }
              label="System Updates"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 3 }}>Display Preferences</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="auto">Auto</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="EST">Eastern Time</MenuItem>
                <MenuItem value="PST">Pacific Time</MenuItem>
                <MenuItem value="GMT">Greenwich Mean Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Date Format</InputLabel>
              <Select
                value={preferences.dateFormat}
                onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
              >
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={savePreferences}
          disabled={saving}
          sx={{ mt: 3 }}
        >
          {saving ? <CircularProgress size={20} /> : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderActivityTab = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>Recent Activity</Typography>
        
        {loadingLogs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {activityLogs.length > 0 ? (
              activityLogs.map((log, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={log.action}
                    secondary={`${log.timestamp} - ${log.ipAddress}`}
                  />
                  <Chip
                    label={log.category}
                    size="small"
                    color={log.severity === 'high' ? 'error' : 'default'}
                  />
                </ListItem>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No recent activity found
              </Typography>
            )}
          </List>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Profile Settings
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<NotificationsIcon />} label="Preferences" />
          <Tab icon={<HistoryIcon />} label="Activity" />
        </Tabs>
      </Paper>

      {activeTab === 0 && renderProfileTab()}
      {activeTab === 1 && renderSecurityTab()}
      {activeTab === 2 && renderPreferencesTab()}
      {activeTab === 3 && renderActivityTab()}

      {/* Avatar Upload Dialog */}
      <Dialog open={avatarDialog} onClose={() => setAvatarDialog(false)}>
        <DialogTitle>Change Profile Photo</DialogTitle>
        <DialogContent>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleAvatarUpload}
          />
          <label htmlFor="avatar-upload">
            <Button variant="contained" component="span" fullWidth>
              Choose Photo
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileSettings;