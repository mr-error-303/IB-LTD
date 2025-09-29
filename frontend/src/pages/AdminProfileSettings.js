import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  Snackbar,
  InputAdornment,
  RadioGroup,
  Radio,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  Shield as ShieldIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    location: '',
    bio: '',
    avatar: '',
    timezone: '',
    language: 'en',
    theme: 'system',
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
    loginAlerts: true,
    twoFactorEnabled: false,
    sessionTimeout: 30,
    autoLogout: true,
    rememberMe: true,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [activityLogs, setActivityLogs] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileResponse, preferencesResponse, activityResponse, sessionsResponse] = await Promise.all([
        axios.get('/api/admin/profile'),
        axios.get('/api/admin/profile/preferences'),
        axios.get('/api/admin/profile/activity'),
        axios.get('/api/admin/profile/sessions')
      ]);

      if (profileResponse.data.success) {
        setProfileData(profileResponse.data.data);
      }

      if (preferencesResponse.data.success) {
        setPreferences(preferencesResponse.data.data);
      }

      if (activityResponse.data.success) {
        setActivityLogs(activityResponse.data.data);
      }

      if (sessionsResponse.data.success) {
        setSessions(sessionsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await axios.put('/api/admin/profile', profileData);
      
      if (response.data.success) {
        setSuccess('Profile updated successfully');
        setEditMode(false);
        updateUser(response.data.data);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const response = await axios.put('/api/admin/profile/preferences', preferences);
      
      if (response.data.success) {
        setSuccess('Preferences updated successfully');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      setSaving(true);
      const response = await axios.put('/api/admin/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (response.data.success) {
        setSuccess('Password changed successfully');
        setChangePasswordOpen(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setSaving(true);
      const response = await axios.post('/api/admin/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setProfileData(prev => ({ ...prev, avatar: response.data.data.avatar }));
        setSuccess('Avatar updated successfully');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    try {
      const response = await axios.delete(`/api/admin/profile/sessions/${sessionId}`);
      
      if (response.data.success) {
        setSuccess('Session terminated successfully');
        setSessions(prev => prev.filter(session => session.id !== sessionId));
      }
    } catch (error) {
      console.error('Error terminating session:', error);
      setError('Failed to terminate session');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get('/api/admin/profile/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'profile-data.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceIcon = (device) => {
    if (device.includes('Mobile')) return '📱';
    if (device.includes('Tablet')) return '📱';
    return '💻';
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Profile Settings
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportData}
          >
            Export Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchProfileData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Profile" icon={<PersonIcon />} />
          <Tab label="Preferences" icon={<SettingsIcon />} />
          <Tab label="Security" icon={<SecurityIcon />} />
          <Tab label="Activity" icon={<HistoryIcon />} />
          <Tab label="Sessions" icon={<ComputerIcon />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            {/* Profile Picture */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton
                        color="primary"
                        component="label"
                        sx={{
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'background.paper' }
                        }}
                      >
                        <PhotoIcon />
                        <input
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={handleAvatarUpload}
                        />
                      </IconButton>
                    }
                  >
                    <Avatar
                      src={profileData.avatar}
                      sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                    >
                      {profileData.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                  <Typography variant="h6" gutterBottom>
                    {profileData.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {profileData.position}
                  </Typography>
                  <Chip
                    label={user?.role || 'Admin'}
                    color="primary"
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Profile Information */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">
                      Personal Information
                    </Typography>
                    <Button
                      variant={editMode ? "outlined" : "contained"}
                      startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode ? 'Cancel' : 'Edit'}
                    </Button>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        value={profileData.department}
                        onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Position"
                        value={profileData.position}
                        onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!editMode}
                        multiline
                        rows={3}
                      />
                    </Grid>
                  </Grid>

                  {editMode && (
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                      <Button
                        variant="outlined"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        {saving ? <CircularProgress size={20} /> : 'Save Changes'}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={4}>
            {/* Display Preferences */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Display Preferences
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <LanguageIcon />
                      </ListItemIcon>
                      <ListItemText primary="Language" />
                      <ListItemSecondaryAction>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={profileData.language}
                            onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                          >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="es">Spanish</MenuItem>
                            <MenuItem value="fr">French</MenuItem>
                            <MenuItem value="de">German</MenuItem>
                          </Select>
                        </FormControl>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PaletteIcon />
                      </ListItemIcon>
                      <ListItemText primary="Theme" />
                      <ListItemSecondaryAction>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={profileData.theme}
                            onChange={(e) => setProfileData(prev => ({ ...prev, theme: e.target.value }))}
                          >
                            <MenuItem value="light">Light</MenuItem>
                            <MenuItem value="dark">Dark</MenuItem>
                            <MenuItem value="system">System</MenuItem>
                          </Select>
                        </FormControl>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon />
                      </ListItemIcon>
                      <ListItemText primary="Timezone" />
                      <ListItemSecondaryAction>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <Select
                            value={profileData.timezone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                          >
                            <MenuItem value="UTC">UTC</MenuItem>
                            <MenuItem value="America/New_York">Eastern Time</MenuItem>
                            <MenuItem value="America/Chicago">Central Time</MenuItem>
                            <MenuItem value="America/Denver">Mountain Time</MenuItem>
                            <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                          </Select>
                        </FormControl>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Notification Preferences */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notification Preferences
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText primary="Email Notifications" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={preferences.emailNotifications}
                          onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <NotificationIcon />
                      </ListItemIcon>
                      <ListItemText primary="Push Notifications" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={preferences.pushNotifications}
                          onChange={(e) => setPreferences(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText primary="SMS Notifications" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={preferences.smsNotifications}
                          onChange={(e) => setPreferences(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText primary="Security Alerts" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={preferences.securityAlerts}
                          onChange={(e) => setPreferences(prev => ({ ...prev, securityAlerts: e.target.checked }))}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                      variant="contained"
                      onClick={handleSavePreferences}
                      disabled={saving}
                    >
                      Save Preferences
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            {/* Password Security */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Password & Security
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <LockIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Password"
                        secondary="Last changed 30 days ago"
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setChangePasswordOpen(true)}
                        >
                          Change
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ShieldIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Two-Factor Authentication"
                        secondary={preferences.twoFactorEnabled ? "Enabled" : "Disabled"}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={preferences.twoFactorEnabled}
                          onChange={(e) => setPreferences(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon />
                      </ListItemIcon>
                      <ListItemText primary="Auto Logout" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={preferences.autoLogout}
                          onChange={(e) => setPreferences(prev => ({ ...prev, autoLogout: e.target.checked }))}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Account Actions */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Actions
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <DownloadIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Export Data"
                        secondary="Download your account data"
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleExportData}
                        >
                          Export
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DeleteIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Delete Account"
                        secondary="Permanently delete your account"
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setDeleteAccountOpen(true)}
                        >
                          Delete
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {activityLogs.map((log, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={log.action}
                      secondary={`${formatDate(log.timestamp)} • ${log.ipAddress}`}
                    />
                    <Chip
                      label={log.status}
                      color={log.status === 'success' ? 'success' : 'error'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Sessions
              </Typography>
              <List>
                {sessions.map((session) => (
                  <ListItem key={session.id} divider>
                    <ListItemIcon>
                      <span style={{ fontSize: '24px' }}>
                        {getDeviceIcon(session.device)}
                      </span>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${session.device} • ${session.browser}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {session.location} • {session.ipAddress}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Last active: {formatDate(session.lastActive)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {session.current ? (
                        <Chip label="Current" color="success" size="small" />
                      ) : (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          Terminate
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              margin="normal"
              error={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword}
              helperText={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? "Passwords do not match" : ""}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
          >
            {saving ? <CircularProgress size={20} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete your account? This will permanently remove all your data and cannot be reversed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // Handle account deletion
              setDeleteAccountOpen(false);
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProfileSettings;