import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  InputAdornment,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Phone as MobileIcon,
  QrCode as QrCodeIcon,
  Clear as ClearIcon,
  GetApp as ExportIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionType, setActionType] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    method: '',
    minAmount: '',
    maxAmount: '',
    startDate: null,
    endDate: null,
  });
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    failedTransactions: 0,
  });

  // Transaction types and their icons
  const transactionTypes = {
    deposit: { icon: <TrendingUpIcon />, color: 'success', label: 'Deposit' },
    withdrawal: { icon: <TrendingDownIcon />, color: 'error', label: 'Withdrawal' },
    transfer: { icon: <BankIcon />, color: 'primary', label: 'Transfer' },
    payment: { icon: <CardIcon />, color: 'info', label: 'Payment' },
  };

  // Payment methods and their icons
  const paymentMethods = {
    bank_transfer: { icon: <BankIcon />, label: 'Bank Transfer' },
    card: { icon: <CardIcon />, label: 'Card Payment' },
    mobile_wallet: { icon: <MobileIcon />, label: 'Mobile Wallet' },
    qr_payment: { icon: <QrCodeIcon />, label: 'QR Payment' },
  };

  // Transaction statuses
  const transactionStatuses = {
    pending: { color: 'warning', icon: <PendingIcon />, label: 'Pending' },
    completed: { color: 'success', icon: <SuccessIcon />, label: 'Completed' },
    failed: { color: 'error', icon: <ErrorIcon />, label: 'Failed' },
    cancelled: { color: 'default', icon: <BlockIcon />, label: 'Cancelled' },
    processing: { color: 'info', icon: <PendingIcon />, label: 'Processing' },
  };

  // Fetch transactions
  const fetchTransactions = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 20,
        ...filters,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get('/api/admin/transactions', { params });
      
      if (response.data.success) {
        setTransactions(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/transactions/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
    fetchStats();
  }, [page]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    setPage(1);
    fetchTransactions(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      status: '',
      method: '',
      minAmount: '',
      maxAmount: '',
      startDate: null,
      endDate: null,
    });
    setPage(1);
    fetchTransactions(1);
  };

  const handleRefresh = () => {
    fetchTransactions(page);
    fetchStats();
  };

  const handleExport = async () => {
    try {
      const params = {
        ...filters,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        export: true,
      };

      const response = await axios.get('/api/admin/transactions/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting transactions:', error);
      setError('Failed to export transactions');
    }
  };

  const handleMenuOpen = (event, transaction) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleViewDetails = () => {
    setDetailsOpen(true);
    handleMenuClose();
  };

  const handleAction = (type) => {
    setActionType(type);
    setActionOpen(true);
    handleMenuClose();
  };

  const handleActionSubmit = async () => {
    if (!selectedTransaction || !actionType) return;

    try {
      const response = await axios.post(`/api/admin/transactions/${selectedTransaction.id}/action`, {
        action: actionType,
        note: actionNote,
      });

      if (response.data.success) {
        fetchTransactions(page);
        fetchStats();
        setActionOpen(false);
        setActionNote('');
        setActionType('');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      setError('Failed to perform action');
    }
  };

  const getTransactionIcon = (type) => {
    return transactionTypes[type]?.icon || <BankIcon />;
  };

  const getTransactionColor = (type) => {
    return transactionTypes[type]?.color || 'default';
  };

  const getStatusIcon = (status) => {
    return transactionStatuses[status]?.icon || <PendingIcon />;
  };

  const getStatusColor = (status) => {
    return transactionStatuses[status]?.color || 'default';
  };

  const getMethodIcon = (method) => {
    return paymentMethods[method]?.icon || <BankIcon />;
  };

  const formatAmount = (amount, currency = 'BDT') => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (loading && transactions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Transaction Management
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Transactions
                    </Typography>
                    <Typography variant="h5" component="div">
                      {stats.totalTransactions}
                    </Typography>
                  </Box>
                  <BankIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Amount
                    </Typography>
                    <Typography variant="h6" component="div" color="success.main">
                      {formatAmount(stats.totalAmount)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Pending
                    </Typography>
                    <Typography variant="h5" component="div" color="warning.main">
                      {stats.pendingTransactions}
                    </Typography>
                  </Box>
                  <PendingIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Completed
                    </Typography>
                    <Typography variant="h5" component="div" color="success.main">
                      {stats.completedTransactions}
                    </Typography>
                  </Box>
                  <SuccessIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Failed
                    </Typography>
                    <Typography variant="h5" component="div" color="error.main">
                      {stats.failedTransactions}
                    </Typography>
                  </Box>
                  <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {Object.entries(transactionTypes).map(([key, type]) => (
                    <MenuItem key={key} value={key}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  {Object.entries(transactionStatuses).map(([key, status]) => (
                    <MenuItem key={key} value={key}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={1.5}>
              <TextField
                fullWidth
                label="Min Amount"
                type="number"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1.5}>
              <TextField
                fullWidth
                label="Max Amount"
                type="number"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  startIcon={<FilterIcon />}
                >
                  Filter
                </Button>
                <IconButton onClick={handleClearFilters} color="default">
                  <ClearIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Transactions Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
                        {transaction.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {getInitials(transaction.userName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {transaction.userName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {transaction.userEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getTransactionIcon(transaction.type)}
                        <Chip
                          label={transactionTypes[transaction.type]?.label || transaction.type}
                          color={getTransactionColor(transaction.type)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatAmount(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getMethodIcon(transaction.method)}
                        <Typography variant="body2">
                          {paymentMethods[transaction.method]?.label || transaction.method}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(transaction.status)}
                        <Chip
                          label={transactionStatuses[transaction.status]?.label || transaction.status}
                          color={getStatusColor(transaction.status)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTimestamp(transaction.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, transaction)}
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
          
          {/* Pagination */}
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewDetails}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          {selectedTransaction?.status === 'pending' && (
            <>
              <MenuItem onClick={() => handleAction('approve')}>
                <ListItemIcon>
                  <ApproveIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText>Approve</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleAction('reject')}>
                <ListItemIcon>
                  <RejectIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Reject</ListItemText>
              </MenuItem>
            </>
          )}
          <MenuItem onClick={() => handleAction('block')}>
            <ListItemIcon>
              <BlockIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Block Transaction</ListItemText>
          </MenuItem>
        </Menu>

        {/* Details Dialog */}
        <Dialog 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Transaction Details
          </DialogTitle>
          <DialogContent>
            {selectedTransaction && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Transaction ID
                    </Typography>
                    <Typography variant="body1" gutterBottom fontFamily="monospace">
                      {selectedTransaction.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      User
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedTransaction.userName} ({selectedTransaction.userEmail})
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {transactionTypes[selectedTransaction.type]?.label || selectedTransaction.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Amount
                    </Typography>
                    <Typography variant="body1" gutterBottom fontWeight={600}>
                      {formatAmount(selectedTransaction.amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {paymentMethods[selectedTransaction.method]?.label || selectedTransaction.method}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Status
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {transactionStatuses[selectedTransaction.status]?.label || selectedTransaction.status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Created At
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatTimestamp(selectedTransaction.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Reference
                    </Typography>
                    <Typography variant="body1" gutterBottom fontFamily="monospace">
                      {selectedTransaction.reference || 'N/A'}
                    </Typography>
                  </Grid>
                  {selectedTransaction.description && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Description
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedTransaction.description}
                      </Typography>
                    </Grid>
                  )}
                  {selectedTransaction.metadata && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Additional Information
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                          {JSON.stringify(selectedTransaction.metadata, null, 2)}
                        </pre>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Action Dialog */}
        <Dialog 
          open={actionOpen} 
          onClose={() => setActionOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {actionType === 'approve' && 'Approve Transaction'}
            {actionType === 'reject' && 'Reject Transaction'}
            {actionType === 'block' && 'Block Transaction'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to {actionType} this transaction?
              </Typography>
              <TextField
                fullWidth
                label="Note (Optional)"
                multiline
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionOpen(false)}>Cancel</Button>
            <Button
              onClick={handleActionSubmit}
              variant="contained"
              color={actionType === 'approve' ? 'success' : actionType === 'reject' ? 'error' : 'warning'}
            >
              {actionType === 'approve' && 'Approve'}
              {actionType === 'reject' && 'Reject'}
              {actionType === 'block' && 'Block'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AdminTransactions;