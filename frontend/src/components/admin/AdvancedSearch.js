import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  FormControlLabel,
  Checkbox,
  DatePicker,
  Tabs,
  Tab,
  Badge,
  Menu,
  Autocomplete,
  Pagination,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Receipt as TransactionIcon,
  Assignment as LogIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { adminAPI } from '../../services/api';

const AdvancedSearch = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Button loading states for debouncing
  const [buttonLoading, setButtonLoading] = useState({});
  const [lastClickTime, setLastClickTime] = useState({});
  
  // Debounce function to prevent rapid clicks
  const debounce = (func, delay, key) => {
    const now = Date.now();
    if (lastClickTime[key] && now - lastClickTime[key] < delay) {
      return;
    }
    setLastClickTime(prev => ({ ...prev, [key]: now }));
    return func();
  };
  
  // Search results
  const [searchResults, setSearchResults] = useState({
    users: [],
    transactions: [],
    logs: []
  });
  
  const [pagination, setPagination] = useState({
    users: { page: 1, totalPages: 1, total: 0 },
    transactions: { page: 1, totalPages: 1, total: 0 },
    logs: { page: 1, totalPages: 1, total: 0 }
  });

  // Search filters
  const [filters, setFilters] = useState({
    users: {
      query: '',
      role: '',
      status: '',
      balanceMin: '',
      balanceMax: '',
      dateFrom: null,
      dateTo: null,
      isVerified: '',
      hasTransactions: ''
    },
    transactions: {
      query: '',
      type: '',
      status: '',
      amountMin: '',
      amountMax: '',
      dateFrom: null,
      dateTo: null,
      userId: '',
      method: ''
    },
    logs: {
      query: '',
      action: '',
      category: '',
      adminId: '',
      dateFrom: null,
      dateTo: null,
      targetType: ''
    }
  });

  // Saved searches
  const [savedSearches, setSavedSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [saveSearchDialog, setSaveSearchDialog] = useState(false);
  const [recentSearchDialog, setRecentSearchDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchDescription, setSearchDescription] = useState('');

  // Quick filters
  const [quickFilters, setQuickFilters] = useState({
    users: [
      { label: 'High Balance Users', filter: { balanceMin: '10000' } },
      { label: 'Unverified Users', filter: { isVerified: 'false' } },
      { label: 'Admin Users', filter: { role: 'admin' } },
      { label: 'Recent Signups', filter: { dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    ],
    transactions: [
      { label: 'Large Transactions', filter: { amountMin: '5000' } },
      { label: 'Pending Transactions', filter: { status: 'pending' } },
      { label: 'Failed Transactions', filter: { status: 'failed' } },
      { label: 'Today\'s Transactions', filter: { dateFrom: new Date() } }
    ],
    logs: [
      { label: 'User Actions', filter: { category: 'user_management' } },
      { label: 'Balance Changes', filter: { action: 'balance_adjustment' } },
      { label: 'Login Attempts', filter: { action: 'login_attempt' } },
      { label: 'Recent Activity', filter: { dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    ]
  });

  const tabLabels = ['Users', 'Transactions', 'Activity Logs'];
  const tabKeys = ['users', 'transactions', 'logs'];

  useEffect(() => {
    fetchSavedSearches();
    fetchRecentSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const response = await adminAPI.get('/search/saved');
      setSavedSearches(response.data.searches || []);
    } catch (err) {
      console.error('Failed to fetch saved searches:', err);
    }
  };

  const fetchRecentSearches = async () => {
    try {
      const response = await adminAPI.get('/search/recent');
      setRecentSearches(response.data.searches || []);
    } catch (err) {
      console.error('Failed to fetch recent searches:', err);
    }
  };

  // Enhanced search handler with debouncing
  const handleSearchWithDebounce = (tabIndex = activeTab, page = 1) => {
    const buttonKey = `search-${tabIndex}-${page}`;
    
    return debounce(() => {
      setButtonLoading(prev => ({ ...prev, [buttonKey]: true }));
      
      setTimeout(async () => {
        await handleSearch(tabIndex, page);
        setButtonLoading(prev => ({ ...prev, [buttonKey]: false }));
      }, 100);
    }, 300, buttonKey);
  };

  // Enhanced clear filters handler with debouncing
  const handleClearFiltersWithDebounce = () => {
    const buttonKey = 'clear-filters';
    
    return debounce(() => {
      setButtonLoading(prev => ({ ...prev, [buttonKey]: true }));
      
      setTimeout(() => {
        handleClearFilters();
        setButtonLoading(prev => ({ ...prev, [buttonKey]: false }));
      }, 100);
    }, 300, buttonKey);
  };

  const handleSearch = async (tabIndex = activeTab, page = 1) => {
    const tabKey = tabKeys[tabIndex];
    const currentFilters = filters[tabKey];
    
    // Remove empty filters
    const cleanFilters = Object.entries(currentFilters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (Object.keys(cleanFilters).length === 0) {
      setError('Please provide at least one search criteria');
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.post(`/search/${tabKey}`, {
        filters: cleanFilters,
        page,
        limit: 20
      });

      setSearchResults(prev => ({
        ...prev,
        [tabKey]: response.data.results || []
      }));

      setPagination(prev => ({
        ...prev,
        [tabKey]: {
          page: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
          total: response.data.total || 0
        }
      }));

      // Save to recent searches
      saveToRecentSearches(tabKey, cleanFilters);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const saveToRecentSearches = async (type, filters) => {
    try {
      await adminAPI.post('/search/recent', {
        type,
        filters,
        timestamp: new Date()
      });
      fetchRecentSearches();
    } catch (err) {
      console.error('Failed to save recent search:', err);
    }
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      setError('Please provide a name for the search');
      return;
    }

    const tabKey = tabKeys[activeTab];
    const currentFilters = filters[tabKey];

    try {
      await adminAPI.post('/search/save', {
        name: searchName,
        description: searchDescription,
        type: tabKey,
        filters: currentFilters
      });

      setSuccess('Search saved successfully');
      setSaveSearchDialog(false);
      setSearchName('');
      setSearchDescription('');
      fetchSavedSearches();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save search');
    }
  };

  const handleLoadSavedSearch = (savedSearch) => {
    const tabIndex = tabKeys.indexOf(savedSearch.type);
    if (tabIndex !== -1) {
      setActiveTab(tabIndex);
      setFilters(prev => ({
        ...prev,
        [savedSearch.type]: savedSearch.filters
      }));
      setTimeout(() => handleSearch(tabIndex), 100);
    }
  };

  const handleQuickFilter = (quickFilter) => {
    const tabKey = tabKeys[activeTab];
    setFilters(prev => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        ...quickFilter.filter
      }
    }));
    setTimeout(() => handleSearch(), 100);
  };

  const handleClearFilters = () => {
    const tabKey = tabKeys[activeTab];
    setFilters(prev => ({
      ...prev,
      [tabKey]: {
        query: '',
        dateFrom: null,
        dateTo: null,
        ...Object.keys(prev[tabKey]).reduce((acc, key) => {
          if (!['query', 'dateFrom', 'dateTo'].includes(key)) {
            acc[key] = '';
          }
          return acc;
        }, {})
      }
    }));
    setSearchResults(prev => ({
      ...prev,
      [tabKey]: []
    }));
  };

  const handleDeleteSavedSearch = async (searchId) => {
    try {
      await adminAPI.delete(`/search/saved/${searchId}`);
      setSuccess('Search deleted successfully');
      fetchSavedSearches();
    } catch (err) {
      setError('Failed to delete search');
    }
  };

  const handleExportResults = async () => {
    const tabKey = tabKeys[activeTab];
    const results = searchResults[tabKey];
    
    if (results.length === 0) {
      setError('No results to export');
      return;
    }

    try {
      const response = await adminAPI.post(`/search/export/${tabKey}`, {
        filters: filters[tabKey],
        format: 'csv'
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tabKey}-search-results-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Results exported successfully');
    } catch (err) {
      setError('Failed to export results');
    }
  };

  const renderUserFilters = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Search Users"
          value={filters.users.query}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            users: { ...prev.users, query: e.target.value }
          }))}
          placeholder="Name, email, or ID..."
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={filters.users.role}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              users: { ...prev.users, role: e.target.value }
            }))}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="sub_admin">Sub Admin</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.users.status}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              users: { ...prev.users, status: e.target.value }
            }))}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          type="number"
          label="Min Balance"
          value={filters.users.balanceMin}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            users: { ...prev.users, balanceMin: e.target.value }
          }))}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          type="number"
          label="Max Balance"
          value={filters.users.balanceMax}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            users: { ...prev.users, balanceMax: e.target.value }
          }))}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MuiDatePicker
            label="From Date"
            value={filters.users.dateFrom}
            onChange={(date) => setFilters(prev => ({
              ...prev,
              users: { ...prev.users, dateFrom: date }
            }))}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>
      </Grid>
      <Grid item xs={12} md={3}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MuiDatePicker
            label="To Date"
            value={filters.users.dateTo}
            onChange={(date) => setFilters(prev => ({
              ...prev,
              users: { ...prev.users, dateTo: date }
            }))}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>
      </Grid>
    </Grid>
  );

  const renderTransactionFilters = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Search Transactions"
          value={filters.transactions.query}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            transactions: { ...prev.transactions, query: e.target.value }
          }))}
          placeholder="Transaction ID, user, or description..."
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.transactions.type}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              transactions: { ...prev.transactions, type: e.target.value }
            }))}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="deposit">Deposit</MenuItem>
            <MenuItem value="withdrawal">Withdrawal</MenuItem>
            <MenuItem value="transfer">Transfer</MenuItem>
            <MenuItem value="fee">Fee</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.transactions.status}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              transactions: { ...prev.transactions, status: e.target.value }
            }))}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          type="number"
          label="Min Amount"
          value={filters.transactions.amountMin}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            transactions: { ...prev.transactions, amountMin: e.target.value }
          }))}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          type="number"
          label="Max Amount"
          value={filters.transactions.amountMax}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            transactions: { ...prev.transactions, amountMax: e.target.value }
          }))}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MuiDatePicker
            label="From Date"
            value={filters.transactions.dateFrom}
            onChange={(date) => setFilters(prev => ({
              ...prev,
              transactions: { ...prev.transactions, dateFrom: date }
            }))}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>
      </Grid>
      <Grid item xs={12} md={3}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MuiDatePicker
            label="To Date"
            value={filters.transactions.dateTo}
            onChange={(date) => setFilters(prev => ({
              ...prev,
              transactions: { ...prev.transactions, dateTo: date }
            }))}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>
      </Grid>
    </Grid>
  );

  const renderLogFilters = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Search Logs"
          value={filters.logs.query}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            logs: { ...prev.logs, query: e.target.value }
          }))}
          placeholder="Action, admin, or target..."
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel>Action</InputLabel>
          <Select
            value={filters.logs.action}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              logs: { ...prev.logs, action: e.target.value }
            }))}
          >
            <MenuItem value="">All Actions</MenuItem>
            <MenuItem value="login">Login</MenuItem>
            <MenuItem value="logout">Logout</MenuItem>
            <MenuItem value="user_create">User Create</MenuItem>
            <MenuItem value="user_update">User Update</MenuItem>
            <MenuItem value="balance_adjustment">Balance Adjustment</MenuItem>
            <MenuItem value="transaction_approve">Transaction Approve</MenuItem>
            <MenuItem value="transaction_reject">Transaction Reject</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={3}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.logs.category}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              logs: { ...prev.logs, category: e.target.value }
            }))}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="authentication">Authentication</MenuItem>
            <MenuItem value="user_management">User Management</MenuItem>
            <MenuItem value="transaction_management">Transaction Management</MenuItem>
            <MenuItem value="system">System</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={3}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MuiDatePicker
            label="From Date"
            value={filters.logs.dateFrom}
            onChange={(date) => setFilters(prev => ({
              ...prev,
              logs: { ...prev.logs, dateFrom: date }
            }))}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>
      </Grid>
      <Grid item xs={12} md={3}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MuiDatePicker
            label="To Date"
            value={filters.logs.dateTo}
            onChange={(date) => setFilters(prev => ({
              ...prev,
              logs: { ...prev.logs, dateTo: date }
            }))}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>
      </Grid>
    </Grid>
  );

  const renderResults = () => {
    const tabKey = tabKeys[activeTab];
    const results = searchResults[tabKey];
    const paginationInfo = pagination[tabKey];

    if (results.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No results found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search criteria
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" color="textSecondary">
            Showing {results.length} of {paginationInfo.total} results
          </Typography>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleExportResults}
            size="small"
          >
            Export Results
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {tabKey === 'users' && (
                  <>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                  </>
                )}
                {tabKey === 'transactions' && (
                  <>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </>
                )}
                {tabKey === 'logs' && (
                  <>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Details</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((item, index) => (
                <TableRow key={item._id || index}>
                  {tabKey === 'users' && (
                    <>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>
                        <Chip label={item.role} size="small" />
                      </TableCell>
                      <TableCell>${item.balance?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status || 'active'}
                          size="small"
                          color={item.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                    </>
                  )}
                  {tabKey === 'transactions' && (
                    <>
                      <TableCell>{item._id?.slice(-6)}</TableCell>
                      <TableCell>
                        <Chip label={item.type} size="small" />
                      </TableCell>
                      <TableCell>${item.amount?.toFixed(2)}</TableCell>
                      <TableCell>{item.userId?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          color={
                            item.status === 'completed' ? 'success' :
                            item.status === 'pending' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                    </>
                  )}
                  {tabKey === 'logs' && (
                    <>
                      <TableCell>
                        {new Date(item.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{item.action}</TableCell>
                      <TableCell>{item.adminId?.name || 'System'}</TableCell>
                      <TableCell>
                        <Chip label={item.category} size="small" />
                      </TableCell>
                      <TableCell>{item.targetType}</TableCell>
                      <TableCell>
                        <Tooltip title={item.details || 'No details'}>
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {paginationInfo.totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={paginationInfo.totalPages}
              page={paginationInfo.page}
              onChange={(e, page) => handleSearchWithDebounce(activeTab, page)}
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" display="flex" alignItems="center">
          <SearchIcon sx={{ mr: 1 }} />
          Advanced Search
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => setSaveSearchDialog(true)}
            sx={{ mr: 1 }}
          >
            Save Search
          </Button>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setRecentSearchDialog(true)}
          >
            Recent Searches
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          {/* Quick Filters */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Filters
              </Typography>
              <List dense>
                {quickFilters[tabKeys[activeTab]]?.map((filter, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleQuickFilter(filter)}
                  >
                    <ListItemIcon>
                      <FilterIcon />
                    </ListItemIcon>
                    <ListItemText primary={filter.label} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Saved Searches */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Saved Searches
              </Typography>
              <List dense>
                {savedSearches.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    No saved searches
                  </Typography>
                ) : (
                  savedSearches.map((search) => (
                    <ListItem key={search._id}>
                      <ListItemIcon>
                        <StarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={search.name}
                        secondary={search.description}
                        onClick={() => handleLoadSavedSearch(search)}
                        sx={{ cursor: 'pointer' }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSavedSearch(search._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>

          {/* Recent Searches */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Searches
              </Typography>
              <List dense>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleLoadSavedSearch(search)}
                  >
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={search.type}
                      secondary={new Date(search.timestamp).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              {/* Tabs */}
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 3 }}
              >
                {tabLabels.map((label, index) => (
                  <Tab
                    key={index}
                    label={
                      <Badge
                        badgeContent={searchResults[tabKeys[index]]?.length || 0}
                        color="primary"
                        showZero={false}
                      >
                        {label}
                      </Badge>
                    }
                  />
                ))}
              </Tabs>

              {/* Search Filters */}
              <Box sx={{ mb: 3 }}>
                {activeTab === 0 && renderUserFilters()}
                {activeTab === 1 && renderTransactionFilters()}
                {activeTab === 2 && renderLogFilters()}
              </Box>

              {/* Action Buttons */}
              <Box display="flex" gap={2} mb={3}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={() => handleSearchWithDebounce()}
                  disabled={loading || buttonLoading[`search-${activeTab}-1`]}
                >
                  {buttonLoading[`search-${activeTab}-1`] ? '⏳ Searching...' : loading ? 'Searching...' : 'Search'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFiltersWithDebounce}
                  disabled={buttonLoading['clear-filters']}
                >
                  {buttonLoading['clear-filters'] ? '⏳ Clearing...' : 'Clear Filters'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => handleSearchWithDebounce()}
                  disabled={loading || buttonLoading[`search-${activeTab}-1`]}
                >
                  {buttonLoading[`search-${activeTab}-1`] ? '⏳ Refreshing...' : loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </Box>

              {/* Loading */}
              {loading && <LinearProgress sx={{ mb: 2 }} />}

              {/* Results */}
              {renderResults()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Search Dialog */}
      <Dialog open={saveSearchDialog} onClose={() => setSaveSearchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Search</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search Name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter a name for this search..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (Optional)"
                value={searchDescription}
                onChange={(e) => setSearchDescription(e.target.value)}
                placeholder="Describe what this search is for..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveSearchDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSearch} variant="contained">
            Save Search
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recent Searches Dialog */}
      <Dialog 
        open={recentSearchDialog} 
        onClose={() => setRecentSearchDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Recent Searches</DialogTitle>
        <DialogContent>
          {recentSearches.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No recent searches found.
            </Typography>
          ) : (
            <List>
              {recentSearches.map((search, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <SearchIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={search.name || `Search ${index + 1}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {search.description || 'No description'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(search.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        onClick={() => {
                          // Load the search filters
                          if (search.filters) {
                            setFilters(search.filters);
                            setActiveTab(search.activeTab || 0);
                          }
                          setRecentSearchDialog(false);
                        }}
                      >
                        Load
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < recentSearches.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecentSearchDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedSearch;