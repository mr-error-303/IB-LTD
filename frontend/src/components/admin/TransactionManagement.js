import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress,
  Checkbox,
  Fab,
  Badge,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as PendingIcon,
  CheckCircle as CompletedIcon,
  Error as FailedIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { adminAPI } from '../../services/api';

const TransactionManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    dateFrom: null,
    dateTo: null,
    amountMin: '',
    amountMax: '',
    userId: ''
  });

  // Dialog states
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [bulkAction, setBulkAction] = useState('');

  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTransaction, setMenuTransaction] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [page, rowsPerPage, filters, activeTab]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        tab: getTabFilter(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
        )
      });

      const response = await adminAPI.get(`/transactions?${params}`);
      if (response.data.success) {
        setTransactions(response.data.data.transactions);
        setTotalCount(response.data.data.total);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setMessage({ type: 'error', text: 'Failed to load transactions' });
      
      // Fallback sample data
      const sampleTransactions = [
        {
          id: 'TXN001',
          userId: 'user123',
          username: 'john_doe',
          type: 'deposit',
          amount: 1500.00,
          status: 'completed',
          description: 'Bank transfer deposit',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:35:00Z',
          reference: 'REF123456',
          fee: 5.00,
          currency: 'USD'
        },
        {
          id: 'TXN002',
          userId: 'user456',
          username: 'jane_smith',
          type: 'withdrawal',
          amount: 750.00,
          status: 'pending',
          description: 'ATM withdrawal request',
          createdAt: '2024-01-15T09:15:00Z',
          updatedAt: '2024-01-15T09:15:00Z',
          reference: 'REF789012',
          fee: 2.50,
          currency: 'USD'
        },
        {
          id: 'TXN003',
          userId: 'user789',
          username: 'bob_wilson',
          type: 'transfer',
          amount: 300.00,
          status: 'failed',
          description: 'Internal transfer',
          createdAt: '2024-01-15T08:45:00Z',
          updatedAt: '2024-01-15T08:50:00Z',
          reference: 'REF345678',
          fee: 1.00,
          currency: 'USD',
          failureReason: 'Insufficient funds'
        }
      ];
      setTransactions(sampleTransactions);
      setTotalCount(sampleTransactions.length);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.get('/transactions/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      // Fallback stats
      setStats({
        total: 1247,
        pending: 23,
        completed: 1198,
        failed: 26,
        totalAmount: 2847392.50,
        pendingAmount: 45230.75
      });
    }
  };

  const getTabFilter = () => {
    switch (activeTab) {
      case 1: return 'pending';
      case 2: return 'completed';
      case 3: return 'failed';
      default: return 'all';
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      status: '',
      dateFrom: null,
      dateTo: null,
      amountMin: '',
      amountMax: '',
      userId: ''
    });
  };

  const handleMenuOpen = (event, transaction) => {
    setAnchorEl(event.currentTarget);
    setMenuTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTransaction(null);
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setViewDialog(true);
    handleMenuClose();
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setEditDialog(true);
    handleMenuClose();
  };

  const handleTransactionAction = async (transactionId, action) => {
    try {
      const response = await adminAPI.put(`/transactions/${transactionId}/${action}`);
      if (response.data.success) {
        setMessage({ type: 'success', text: `Transaction ${action}d successfully` });
        fetchTransactions();
        fetchStats();
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to ${action} transaction` });
    }
    handleMenuClose();
  };

  const handleBulkAction = async () => {
    if (selectedTransactions.length === 0 || !bulkAction) return;

    try {
      const response = await adminAPI.put('/transactions/bulk-action', {
        transactionIds: selectedTransactions,
        action: bulkAction
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: `Bulk ${bulkAction} completed successfully` });
        setSelectedTransactions([]);
        fetchTransactions();
        fetchStats();
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to perform bulk ${bulkAction}` });
    }
    setBulkActionDialog(false);
  };

  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(t => t.id));
    }
  };

  const exportTransactions = async () => {
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
        ),
        format: 'csv'
      });

      const response = await adminAPI.get(`/transactions/export?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Transactions exported successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export transactions' });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit': return 'success';
      case 'withdrawal': return 'warning';
      case 'transfer': return 'info';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6">{stats.total.toLocaleString()}</Typography>
                <Typography color="text.secondary">Total Transactions</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PendingIcon color="warning" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6">{stats.pending.toLocaleString()}</Typography>
                <Typography color="text.secondary">Pending</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CompletedIcon color="success" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6">{stats.completed.toLocaleString()}</Typography>
                <Typography color="text.secondary">Completed</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FailedIcon color="error" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6">{stats.failed.toLocaleString()}</Typography>
                <Typography color="text.secondary">Failed</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFilters = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="deposit">Deposit</MenuItem>
                <MenuItem value="withdrawal">Withdrawal</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From Date"
                value={filters.dateFrom}
                onChange={(date) => handleFilterChange('dateFrom', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="To Date"
                value={filters.dateTo}
                onChange={(date) => handleFilterChange('dateTo', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{ height: '56px' }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderTransactionTable = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Transactions</Typography>
          <Box>
            {selectedTransactions.length > 0 && (
              <Button
                variant="outlined"
                onClick={() => setBulkActionDialog(true)}
                sx={{ mr: 1 }}
              >
                Bulk Actions ({selectedTransactions.length})
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={exportTransactions}
              sx={{ mr: 1 }}
            >
              Export
            </Button>
            <IconButton onClick={fetchTransactions}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                    indeterminate={selectedTransactions.length > 0 && selectedTransactions.length < transactions.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => handleSelectTransaction(transaction.id)}
                      />
                    </TableCell>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{transaction.username}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        color={getTypeColor(transaction.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, transaction)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </CardContent>
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Transaction Management
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </Alert>
        )}

        {renderStatsCards()}

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Transactions" />
            <Tab 
              label={
                <Badge badgeContent={stats.pending} color="warning">
                  Pending
                </Badge>
              } 
            />
            <Tab label="Completed" />
            <Tab label="Failed" />
          </Tabs>
        </Paper>

        {renderFilters()}
        {renderTransactionTable()}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleViewTransaction(menuTransaction)}>
            <ViewIcon sx={{ mr: 1 }} /> View Details
          </MenuItem>
          <MenuItem onClick={() => handleEditTransaction(menuTransaction)}>
            <EditIcon sx={{ mr: 1 }} /> Edit
          </MenuItem>
          {menuTransaction?.status === 'pending' && (
            <>
              <MenuItem onClick={() => handleTransactionAction(menuTransaction.id, 'approve')}>
                <ApproveIcon sx={{ mr: 1 }} /> Approve
              </MenuItem>
              <MenuItem onClick={() => handleTransactionAction(menuTransaction.id, 'reject')}>
                <RejectIcon sx={{ mr: 1 }} /> Reject
              </MenuItem>
            </>
          )}
        </Menu>

        {/* View Transaction Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogContent>
            {selectedTransaction && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Transaction ID</Typography>
                  <Typography>{selectedTransaction.id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">User</Typography>
                  <Typography>{selectedTransaction.username}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Chip label={selectedTransaction.type} color={getTypeColor(selectedTransaction.type)} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip label={selectedTransaction.status} color={getStatusColor(selectedTransaction.status)} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Amount</Typography>
                  <Typography>{formatCurrency(selectedTransaction.amount)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Fee</Typography>
                  <Typography>{formatCurrency(selectedTransaction.fee)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography>{selectedTransaction.description}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Created At</Typography>
                  <Typography>{new Date(selectedTransaction.createdAt).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Updated At</Typography>
                  <Typography>{new Date(selectedTransaction.updatedAt).toLocaleString()}</Typography>
                </Grid>
                {selectedTransaction.failureReason && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Failure Reason</Typography>
                    <Typography color="error">{selectedTransaction.failureReason}</Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Action Dialog */}
        <Dialog open={bulkActionDialog} onClose={() => setBulkActionDialog(false)}>
          <DialogTitle>Bulk Action</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Select an action to perform on {selectedTransactions.length} selected transactions:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <MenuItem value="approve">Approve</MenuItem>
                <MenuItem value="reject">Reject</MenuItem>
                <MenuItem value="delete">Delete</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkActionDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkAction} variant="contained" disabled={!bulkAction}>
              Execute
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TransactionManagement;