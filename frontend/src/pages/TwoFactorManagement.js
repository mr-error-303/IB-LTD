import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Avatar,
  Snackbar,
  FormGroup,
  Checkbox,
  Slider,
  RadioGroup,
  Radio,
  FormLabel,
} from '@mui/material';
import {
  Security as SecurityIcon,
  PhoneAndroid as PhoneIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  QrCode as QrCodeIcon,
  Key as KeyIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  VpnKey as VpnKeyIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  NotificationsActive as NotificationIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TwoFactorManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [settings, setSettings] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    method: '',
    role: '',
    dateRange: '30d',
  });
  const [globalSettings, setGlobalSettings] = useState({
    enforce2FA: false,
    allowedMethods: ['app', 'sms', 'email'],
    backupCodesEnabled: true,
    sessionTimeout: 30,
    maxFailedAttempts: 3,
    lockoutDuration: 15,
    requireForAdmin: true,
    gracePeriod: 7,
    rememberDevice: true,
    deviceTrustDuration: 30,
  });

  // Fetch 2FA data
  const fetch2FAData = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const [usersResponse, settingsResponse] = await Promise.all([
        axios.get('/api/admin/security/2fa/users', { params }),
        axios.get('/api/admin/security/2fa/settings')
      ]);
      
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data.users);
        setStats(usersResponse.data.data.stats);
      }

      if (settingsResponse.data.success) {
        setSettings(settingsResponse.data.data);
        setGlobalSettings(settingsResponse.data.data.settings);
      }
    } catch (error) {
      console.error('Error fetching 2FA data:', error);
      setError('Failed to fetch 2FA data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch2FAData();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleToggle2FA = async (userId, enable) => {
    try {
      const response = await axios.patch(`/api/admin/security/2fa/users/${userId}/toggle`, {
        enabled: enable
      });
      
      if (response.data.success) {
        setSuccess(`2FA ${enable ? 'enabled' : 'disabled'} for user successfully`);
        fetch2FAData();
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      setError('Failed to update 2FA status');
    }
  };

  const handleReset2FA = async (userId) => {
    try {
      const response = await axios.post(`/api/admin/security/2fa/users/${userId}/reset`);
      
      if (response.data.success) {
        setSuccess('2FA reset successfully. User will need to set up 2FA again.');
        fetch2FAData();
      }
    } catch (error) {
      console.error('Error resetting 2FA:', error);
      setError('Failed to reset 2FA');
    }
  };

  const handleGenerateBackupCodes = async (userId) => {
    try {
      const response = await axios.post(`/api/admin/security/2fa/users/${userId}/backup-codes`);
      
      if (response.data.success) {
        setSuccess('New backup codes generated successfully');
        // You might want to show the codes in a dialog
      }
    } catch (error) {
      console.error('Error generating backup codes:', error);
      setError('Failed to generate backup codes');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await axios.put('/api/admin/security/2fa/settings', {
        settings: globalSettings
      });
      
      if (response.data.success) {
        setSuccess('2FA settings updated successfully');
        setSettingsDialogOpen(false);
        fetch2FAData();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    }
  };

  const handleExportBackup = async () => {
    try {
      const response = await axios.get('/api/admin/security/2fa/backup', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '2fa-backup.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting backup:', error);
      setError('Failed to export backup');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(0);
  };

  const handleRefresh = () => {
    fetch2FAData();
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'app': return <PhoneIcon />;
      case 'sms': return <SmsIcon />;
      case 'email': return <EmailIcon />;
      case 'backup': return <KeyIcon />;
      default: return <SecurityIcon />;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'app': return 'success';
      case 'sms': return 'warning';
      case 'email': return 'info';
      case 'backup': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (enabled, verified) => {
    if (!enabled) return 'error';
    if (!verified) return 'warning';
    return 'success';
  };

  const getStatusLabel = (enabled, verified) => {
    if (!enabled) return 'Disabled';
    if (!verified) return 'Pending';
    return 'Active';
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'Never';
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
          2FA Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<BackupIcon />}
            onClick={() => setBackupDialogOpen(true)}
          >
            Backup
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsDialogOpen(true)}
          >
            Settings
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.totalUsers || 0}
                  </Typography>
                </Box>
                <PersonIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    2FA Enabled
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats.enabled2FA || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.totalUsers ? Math.round((stats.enabled2FA / stats.totalUsers) * 100) : 0}%
                  </Typography>
                </Box>
                <CheckIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pending Setup
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {stats.pendingSetup || 0}
                  </Typography>
                </Box>
                <WarningIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    App Method
                  </Typography>
                  <Typography variant="h4" component="div" color="info.main">
                    {stats.appMethod || 0}
                  </Typography>
                </Box>
                <PhoneIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      {filterOpen && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filter Users
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>2FA Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="2FA Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                  <MenuItem value="pending">Pending Setup</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Method</InputLabel>
                <Select
                  value={filters.method}
                  onChange={(e) => handleFilterChange('method', e.target.value)}
                  label="Method"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="app">Authenticator App</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  label="Role"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="moderator">Moderator</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>2FA Status</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Last Used</TableCell>
                <TableCell>Backup Codes</TableCell>
                <TableCell>Setup Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2 }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(user.twoFactorEnabled, user.twoFactorVerified)}
                      color={getStatusColor(user.twoFactorEnabled, user.twoFactorVerified)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.twoFactorMethod && (
                      <Box display="flex" alignItems="center">
                        {getMethodIcon(user.twoFactorMethod)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {user.twoFactorMethod.toUpperCase()}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(user.lastTwoFactorUsed)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2">
                        {user.backupCodesRemaining || 0} remaining
                      </Typography>
                      {user.backupCodesRemaining < 3 && (
                        <WarningIcon color="warning" sx={{ ml: 1, fontSize: 16 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(user.twoFactorSetupAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewUser(user)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}>
                        <IconButton
                          size="small"
                          color={user.twoFactorEnabled ? "warning" : "success"}
                          onClick={() => handleToggle2FA(user.id, !user.twoFactorEnabled)}
                        >
                          {user.twoFactorEnabled ? <LockIcon /> : <UnlockIcon />}
                        </IconButton>
                      </Tooltip>
                      {user.twoFactorEnabled && (
                        <Tooltip title="Reset 2FA">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReset2FA(user.id)}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {user.twoFactorEnabled && (
                        <Tooltip title="Generate Backup Codes">
                          <IconButton
                            size="small"
                            onClick={() => handleGenerateBackupCodes(user.id)}
                          >
                            <KeyIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={stats.totalUsers || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* User Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          2FA Details - {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      User Information
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Email"
                          secondary={selectedUser.email}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Role"
                          secondary={selectedUser.role}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="2FA Status"
                          secondary={getStatusLabel(selectedUser.twoFactorEnabled, selectedUser.twoFactorVerified)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Method"
                          secondary={selectedUser.twoFactorMethod || 'Not set'}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Security Details
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Setup Date"
                          secondary={formatDate(selectedUser.twoFactorSetupAt)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Last Used"
                          secondary={formatDate(selectedUser.lastTwoFactorUsed)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Backup Codes"
                          secondary={`${selectedUser.backupCodesRemaining || 0} remaining`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Failed Attempts"
                          secondary={selectedUser.failedAttempts || 0}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>2FA Global Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="General" />
              <Tab label="Security" />
              <Tab label="Methods" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={globalSettings.enforce2FA}
                        onChange={(e) => setGlobalSettings(prev => ({
                          ...prev,
                          enforce2FA: e.target.checked
                        }))}
                      />
                    }
                    label="Enforce 2FA for all users"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={globalSettings.requireForAdmin}
                        onChange={(e) => setGlobalSettings(prev => ({
                          ...prev,
                          requireForAdmin: e.target.checked
                        }))}
                      />
                    }
                    label="Require 2FA for admin users"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Grace Period (days)</Typography>
                  <Slider
                    value={globalSettings.gracePeriod}
                    onChange={(e, value) => setGlobalSettings(prev => ({
                      ...prev,
                      gracePeriod: value
                    }))}
                    min={0}
                    max={30}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Session Timeout (minutes)</Typography>
                  <Slider
                    value={globalSettings.sessionTimeout}
                    onChange={(e, value) => setGlobalSettings(prev => ({
                      ...prev,
                      sessionTimeout: value
                    }))}
                    min={5}
                    max={120}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Max Failed Attempts</Typography>
                  <Slider
                    value={globalSettings.maxFailedAttempts}
                    onChange={(e, value) => setGlobalSettings(prev => ({
                      ...prev,
                      maxFailedAttempts: value
                    }))}
                    min={1}
                    max={10}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Lockout Duration (minutes)</Typography>
                  <Slider
                    value={globalSettings.lockoutDuration}
                    onChange={(e, value) => setGlobalSettings(prev => ({
                      ...prev,
                      lockoutDuration: value
                    }))}
                    min={5}
                    max={60}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={globalSettings.rememberDevice}
                        onChange={(e) => setGlobalSettings(prev => ({
                          ...prev,
                          rememberDevice: e.target.checked
                        }))}
                      />
                    }
                    label="Allow users to remember trusted devices"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Device Trust Duration (days)</Typography>
                  <Slider
                    value={globalSettings.deviceTrustDuration}
                    onChange={(e, value) => setGlobalSettings(prev => ({
                      ...prev,
                      deviceTrustDuration: value
                    }))}
                    min={1}
                    max={90}
                    marks
                    valueLabelDisplay="auto"
                    disabled={!globalSettings.rememberDevice}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Allowed 2FA Methods
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={globalSettings.allowedMethods.includes('app')}
                          onChange={(e) => {
                            const methods = e.target.checked
                              ? [...globalSettings.allowedMethods, 'app']
                              : globalSettings.allowedMethods.filter(m => m !== 'app');
                            setGlobalSettings(prev => ({ ...prev, allowedMethods: methods }));
                          }}
                        />
                      }
                      label="Authenticator App (TOTP)"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={globalSettings.allowedMethods.includes('sms')}
                          onChange={(e) => {
                            const methods = e.target.checked
                              ? [...globalSettings.allowedMethods, 'sms']
                              : globalSettings.allowedMethods.filter(m => m !== 'sms');
                            setGlobalSettings(prev => ({ ...prev, allowedMethods: methods }));
                          }}
                        />
                      }
                      label="SMS"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={globalSettings.allowedMethods.includes('email')}
                          onChange={(e) => {
                            const methods = e.target.checked
                              ? [...globalSettings.allowedMethods, 'email']
                              : globalSettings.allowedMethods.filter(m => m !== 'email');
                            setGlobalSettings(prev => ({ ...prev, allowedMethods: methods }));
                          }}
                        />
                      }
                      label="Email"
                    />
                  </FormGroup>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={globalSettings.backupCodesEnabled}
                        onChange={(e) => setGlobalSettings(prev => ({
                          ...prev,
                          backupCodesEnabled: e.target.checked
                        }))}
                      />
                    }
                    label="Enable backup codes"
                  />
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog
        open={backupDialogOpen}
        onClose={() => setBackupDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>2FA Backup & Recovery</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Create a backup of all 2FA settings and recovery codes.
            </Typography>
            <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
              This backup contains sensitive security information. Store it securely.
            </Alert>
            <List>
              <ListItem>
                <ListItemIcon>
                  <BackupIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Export 2FA Settings"
                  secondary="Download all 2FA configurations"
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleExportBackup}
                  >
                    Export
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>
            Close
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

export default TwoFactorManagement;