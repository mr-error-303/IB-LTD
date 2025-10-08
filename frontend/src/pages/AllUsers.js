import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Badge,
  Collapse,
  Stack
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountBalance as BalanceIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  AccountBalanceWallet as WalletIcon,
  Settings as SettingsIcon,
  Block as RestrictIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  MonetizationOn as MoneyIcon,
  CreditCard as CardIcon,
  Transfer as TransferIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  VpnKey as ResetPasswordIcon,
  AccountCircle as AccountIcon,
  AttachMoney as AddMoneyIcon,
  RemoveCircle as DeductMoneyIcon,
  Timeline as LimitsIcon,
  Warning as SuspendIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AllUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    pending: 0
  });

  // Form state for various operations
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    accountType: 'savings',
    initialBalance: '',
    password: '',
    amount: '',
    reason: '',
    limit: '',
    service: '',
    suspensionDays: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Transaction history for selected user
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [serviceRestrictions, setServiceRestrictions] = useState([]);

  // Fetch users data with enhanced search
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        searchType: searchType,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        role: filterRole !== 'all' ? filterRole : undefined,
      };

      if (dateFrom) params.dateFrom = dateFrom.toISOString();
      if (dateTo) params.dateTo = dateTo.toISOString();

      const response = await axios.get('/api/admin/users', { params });

      if (response.data.success) {
        setUsers(response.data.data.users || []);
        setTotalUsers(response.data.data.pagination?.totalUsers || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/users/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch transaction history for selected user
  const fetchTransactionHistory = async (userId) => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}/transactions`);
      if (response.data.success) {
        setTransactionHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  // Fetch service restrictions for selected user
  const fetchServiceRestrictions = async (userId) => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}/restrictions`);
      if (response.data.success) {
        setServiceRestrictions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching service restrictions:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page, rowsPerPage, searchTerm, searchType, filterStatus, filterRole, dateFrom, dateTo]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleDialogOpen = (type) => {
    setDialogType(type);
    setDialogOpen(true);
    handleMenuClose();
    
    // Pre-populate form data for edit operations
    if (type === 'edit' && selectedUser) {
      setFormData({
        ...formData,
        fullName: selectedUser.username || '',
        email: selectedUser.email || '',
        phone: selectedUser.phone || '',
        address: selectedUser.address || ''
      });
    }

    // Fetch additional data for specific dialog types
    if (selectedUser) {
      if (type === 'history') {
        fetchTransactionHistory(selectedUser.id);
      } else if (type === 'restrictions') {
        fetchServiceRestrictions(selectedUser.id);
      }
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogType('');
    setSelectedUser(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      accountType: 'savings',
      initialBalance: '',
      password: '',
      amount: '',
      reason: '',
      limit: '',
      service: '',
      suspensionDays: ''
    });
    setFormErrors({});
    setTransactionHistory([]);
    setServiceRestrictions([]);
  };

  const handleFormChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (dialogType === 'add' || dialogType === 'edit') {
      if (!formData.fullName.trim()) {
        errors.fullName = 'Full name is required';
      }
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
      }
    }

    if (dialogType === 'balance' && !formData.amount) {
      errors.amount = 'Amount is required';
    }

    if (dialogType === 'limits' && !formData.limit) {
      errors.limit = 'Limit amount is required';
    }

    if (dialogType === 'restrict' && !formData.service) {
      errors.service = 'Service selection is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserAction = async (action) => {
    if (!selectedUser) return;

    try {
      let endpoint = '';
      let method = 'POST';
      let data = {};
      
      switch (action) {
        case 'block':
          endpoint = `/api/admin/users/${selectedUser.id}/ban`;
          break;
        case 'unblock':
          endpoint = `/api/admin/users/${selectedUser.id}/unban`;
          break;
        case 'delete':
          endpoint = `/api/admin/users/${selectedUser.id}`;
          method = 'DELETE';
          break;
        case 'reset-password':
          endpoint = `/api/admin/users/${selectedUser.id}/reset-password`;
          break;
        case 'add-balance':
          endpoint = `/api/admin/users/${selectedUser.id}/balance/add`;
          data = { amount: parseFloat(formData.amount), reason: formData.reason };
          break;
        case 'deduct-balance':
          endpoint = `/api/admin/users/${selectedUser.id}/balance/deduct`;
          data = { amount: parseFloat(formData.amount), reason: formData.reason };
          break;
        case 'set-limits':
          endpoint = `/api/admin/users/${selectedUser.id}/limits`;
          data = { limit: parseFloat(formData.limit) };
          break;
        case 'restrict-service':
          endpoint = `/api/admin/users/${selectedUser.id}/restrictions`;
          data = { service: formData.service, limit: formData.limit };
          break;
        case 'suspend':
          endpoint = `/api/admin/users/${selectedUser.id}/suspend`;
          data = { days: parseInt(formData.suspensionDays) };
          break;
        default:
          return;
      }

      const response = await axios[method.toLowerCase()](endpoint, data);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message || `User ${action} successful`,
          severity: 'success'
        });
        fetchUsers();
        fetchStats();
        handleDialogClose();
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || `Failed to ${action} user`,
        severity: 'error'
      });
    }
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await axios.post('/api/admin/users/create', {
        ...formData,
        adminId: user?.id,
        adminName: user?.name || user?.username
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `User ${formData.fullName} created successfully! Account Number: ${response.data.data.accountNumber}`,
          severity: 'success'
        });
        handleDialogClose();
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create user',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await axios.put(`/api/admin/users/${selectedUser.id}`, formData);

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
        handleDialogClose();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update user',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users/export', {
        responseType: 'blob',
        params: {
          search: searchTerm,
          searchType: searchType,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          role: filterRole !== 'all' ? filterRole : undefined,
          dateFrom: dateFrom?.toISOString(),
          dateTo: dateTo?.toISOString()
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbar({
        open: true,
        message: 'Users exported successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting users:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export users',
        severity: 'error'
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchType('all');
    setFilterStatus('all');
    setFilterRole('all');
    setDateFrom(null);
    setDateTo(null);
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'blocked': return 'error';
      case 'pending': return 'warning';
      case 'suspended': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance || 0);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          User Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Users
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stats.total}
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
                      Active Users
                    </Typography>
                    <Typography variant="h4" component="div" color="success.main">
                      {stats.active}
                    </Typography>
                  </Box>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
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
                      Blocked Users
                    </Typography>
                    <Typography variant="h4" component="div" color="error.main">
                      {stats.blocked}
                    </Typography>
                  </Box>
                  <BlockIcon color="error" sx={{ fontSize: 40 }} />
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
                      Pending Users
                    </Typography>
                    <Typography variant="h4" component="div" color="warning.main">
                      {stats.pending}
                    </Typography>
                  </Box>
                  <CalendarIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced Search and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Search By</InputLabel>
                <Select
                  value={searchType}
                  label="Search By"
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <MenuItem value="all">All Fields</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="account">Account Number</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filterRole}
                  label="Role"
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          <Collapse in={showAdvancedFilters}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Registration Date From"
                  value={dateFrom}
                  onChange={setDateFrom}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Registration Date To"
                  value={dateTo}
                  onChange={setDateTo}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" gap={1} alignItems="center" height="100%">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleDialogOpen('add')}
                  >
                    Add User
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportUsers}
                  >
                    Export
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                      fetchUsers();
                      fetchStats();
                    }}
                  >
                    Refresh
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </Paper>

        {/* Users Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {user.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {user.username}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        {user.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon fontSize="small" color="action" />
                        {user.phone || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status || 'Active'}
                        color={getStatusColor(user.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role || 'User'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BalanceIcon fontSize="small" color="action" />
                        {formatBalance(user.balance)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatDate(user.createdAt || new Date())}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Enhanced Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleDialogOpen('edit')}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit User
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('history')}>
            <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
            Transaction History
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleDialogOpen('balance')}>
            <WalletIcon fontSize="small" sx={{ mr: 1 }} />
            Manage Balance
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('limits')}>
            <LimitsIcon fontSize="small" sx={{ mr: 1 }} />
            Set Limits
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('restrictions')}>
            <RestrictIcon fontSize="small" sx={{ mr: 1 }} />
            Service Restrictions
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleUserAction('reset-password')}>
            <ResetPasswordIcon fontSize="small" sx={{ mr: 1 }} />
            Reset Password
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('block')}>
            <BlockIcon fontSize="small" sx={{ mr: 1 }} />
            {selectedUser?.status === 'blocked' ? 'Unblock' : 'Block'} User
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('suspend')}>
            <SuspendIcon fontSize="small" sx={{ mr: 1 }} />
            Suspend User
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('delete')} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete User
          </MenuItem>
        </Menu>

        {/* Enhanced Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleDialogClose}
          maxWidth={dialogType === 'history' || dialogType === 'restrictions' ? 'lg' : 'md'}
          fullWidth
        >
          <DialogTitle>
            {dialogType === 'add' && 'Add New User'}
            {dialogType === 'edit' && 'Edit User'}
            {dialogType === 'delete' && 'Delete User'}
            {dialogType === 'block' && (selectedUser?.status === 'blocked' ? 'Unblock User' : 'Block User')}
            {dialogType === 'balance' && 'Manage Balance'}
            {dialogType === 'limits' && 'Set Account Limits'}
            {dialogType === 'restrictions' && 'Service Restrictions'}
            {dialogType === 'suspend' && 'Suspend User'}
            {dialogType === 'history' && 'Transaction History'}
          </DialogTitle>
          <DialogContent>
            {/* Add/Edit User Form */}
            {(dialogType === 'add' || dialogType === 'edit') && (
              <Box sx={{ minWidth: 400, pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.fullName}
                      onChange={handleFormChange('fullName')}
                      error={!!formErrors.fullName}
                      helperText={formErrors.fullName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange('email')}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.phone}
                      onChange={handleFormChange('phone')}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={2}
                      value={formData.address}
                      onChange={handleFormChange('address')}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                    />
                  </Grid>
                  {dialogType === 'add' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Account Type</InputLabel>
                          <Select
                            value={formData.accountType}
                            onChange={handleFormChange('accountType')}
                            label="Account Type"
                          >
                            <MenuItem value="savings">Savings</MenuItem>
                            <MenuItem value="current">Current</MenuItem>
                            <MenuItem value="business">Business</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Initial Balance"
                          type="number"
                          value={formData.initialBalance}
                          onChange={handleFormChange('initialBalance')}
                          error={!!formErrors.initialBalance}
                          helperText={formErrors.initialBalance}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Password (Optional)"
                          type="password"
                          value={formData.password}
                          onChange={handleFormChange('password')}
                          helperText="Leave empty to generate automatic password"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}

            {/* Balance Management */}
            {dialogType === 'balance' && (
              <Box sx={{ pt: 2 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
                  <Tab label="Add Funds" />
                  <Tab label="Deduct Funds" />
                </Tabs>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleFormChange('amount')}
                      error={!!formErrors.amount}
                      helperText={formErrors.amount}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Reason"
                      multiline
                      rows={3}
                      value={formData.reason}
                      onChange={handleFormChange('reason')}
                      placeholder="Enter reason for balance adjustment..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Account Limits */}
            {dialogType === 'limits' && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Daily Transaction Limit"
                      type="number"
                      value={formData.limit}
                      onChange={handleFormChange('limit')}
                      error={!!formErrors.limit}
                      helperText={formErrors.limit}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Service Restrictions */}
            {dialogType === 'restrictions' && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Service</InputLabel>
                      <Select
                        value={formData.service}
                        onChange={handleFormChange('service')}
                        label="Service"
                        error={!!formErrors.service}
                      >
                        <MenuItem value="transfer">Money Transfer</MenuItem>
                        <MenuItem value="payment">Bill Payment</MenuItem>
                        <MenuItem value="investment">Investment</MenuItem>
                        <MenuItem value="loan">Loan Services</MenuItem>
                        <MenuItem value="card">Card Services</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Custom Limit (Optional)"
                      type="number"
                      value={formData.limit}
                      onChange={handleFormChange('limit')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
                
                {/* Current Restrictions */}
                {serviceRestrictions.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>Current Restrictions</Typography>
                    <List>
                      {serviceRestrictions.map((restriction, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={restriction.service}
                            secondary={restriction.limit ? `Limit: $${restriction.limit}` : 'Blocked'}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" size="small">
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}

            {/* Suspend User */}
            {dialogType === 'suspend' && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Suspension Days"
                      type="number"
                      value={formData.suspensionDays}
                      onChange={handleFormChange('suspensionDays')}
                      helperText="Enter number of days to suspend the user"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Reason"
                      multiline
                      rows={3}
                      value={formData.reason}
                      onChange={handleFormChange('reason')}
                      placeholder="Enter reason for suspension..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Transaction History */}
            {dialogType === 'history' && (
              <Box sx={{ pt: 2 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactionHistory.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.type} 
                              size="small" 
                              color={transaction.type === 'credit' ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>{formatBalance(transaction.amount)}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.status} 
                              size="small" 
                              color={transaction.status === 'completed' ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Confirmation Messages */}
            {(dialogType === 'delete' || dialogType === 'block') && (
              <Typography>
                {dialogType === 'delete' && `Are you sure you want to delete ${selectedUser?.username}? This action cannot be undone.`}
                {dialogType === 'block' && selectedUser?.status === 'blocked' && `Are you sure you want to unblock ${selectedUser?.username}?`}
                {dialogType === 'block' && selectedUser?.status !== 'blocked' && `Are you sure you want to block ${selectedUser?.username}?`}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            {dialogType === 'add' && (
              <Button
                onClick={handleCreateUser}
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
              >
                {submitting ? 'Creating...' : 'Create User'}
              </Button>
            )}
            {dialogType === 'edit' && (
              <Button
                onClick={handleUpdateUser}
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : <EditIcon />}
              >
                {submitting ? 'Updating...' : 'Update User'}
              </Button>
            )}
            {dialogType === 'balance' && (
              <Button
                onClick={() => handleUserAction(tabValue === 0 ? 'add-balance' : 'deduct-balance')}
                variant="contained"
                color={tabValue === 0 ? 'success' : 'error'}
              >
                {tabValue === 0 ? 'Add Funds' : 'Deduct Funds'}
              </Button>
            )}
            {dialogType === 'limits' && (
              <Button
                onClick={() => handleUserAction('set-limits')}
                variant="contained"
              >
                Set Limits
              </Button>
            )}
            {dialogType === 'restrictions' && (
              <Button
                onClick={() => handleUserAction('restrict-service')}
                variant="contained"
              >
                Apply Restriction
              </Button>
            )}
            {dialogType === 'suspend' && (
              <Button
                onClick={() => handleUserAction('suspend')}
                variant="contained"
                color="warning"
              >
                Suspend User
              </Button>
            )}
            {(dialogType === 'delete' || dialogType === 'block') && (
              <Button
                onClick={() => handleUserAction(dialogType === 'block' ? (selectedUser?.status === 'blocked' ? 'unblock' : 'block') : 'delete')}
                color={dialogType === 'delete' ? 'error' : 'primary'}
                variant="contained"
              >
                {dialogType === 'delete' && 'Delete'}
                {dialogType === 'block' && (selectedUser?.status === 'blocked' ? 'Unblock' : 'Block')}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default AllUsers;