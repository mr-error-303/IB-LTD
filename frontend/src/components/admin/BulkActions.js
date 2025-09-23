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
  Checkbox,
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
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControlLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import {
  AccountBalance as BalanceIcon,
  Download as DownloadIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  History as HistoryIcon,
  Group as GroupIcon,
  Receipt as TransactionIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const BulkActions = () => {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [balanceDialog, setBalanceDialog] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [transactionDialog, setTransactionDialog] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  
  // Form states
  const [balanceForm, setBalanceForm] = useState({
    operation: 'add',
    amount: '',
    reason: ''
  });
  
  const [exportForm, setExportForm] = useState({
    format: 'csv',
    fields: ['name', 'email', 'balance', 'status', 'createdAt'],
    includeTransactions: false
  });
  
  const [transactionForm, setTransactionForm] = useState({
    action: 'approve',
    reason: ''
  });
  
  // History and stats
  const [operationHistory, setOperationHistory] = useState([]);
  const [stats, setStats] = useState({
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    usersAffected: 0
  });

  const availableFields = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'balance', label: 'Balance' },
    { value: 'status', label: 'Status' },
    { value: 'role', label: 'Role' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'lastLogin', label: 'Last Login' },
    { value: 'isVerified', label: 'Verification Status' }
  ];

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
    fetchOperationHistory();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.get('/users?limit=100');
      setUsers(response.data.users || []);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await adminAPI.get('/transactions?status=pending&limit=100');
      setTransactions(response.data.transactions || []);
    } catch (err) {
      setError('Failed to fetch transactions');
    }
  };

  const fetchOperationHistory = async () => {
    try {
      const response = await adminAPI.get('/bulk/operations/history?limit=10');
      setOperationHistory(response.data.operations || []);
    } catch (err) {
      console.error('Failed to fetch operation history:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.get('/bulk/operations/stats');
      setStats(response.data.stats || stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleUserSelection = (userId, checked) => {
    setSelectedUsers(prev => 
      checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleTransactionSelection = (transactionId, checked) => {
    setSelectedTransactions(prev => 
      checked 
        ? [...prev, transactionId]
        : prev.filter(id => id !== transactionId)
    );
  };

  const handleSelectAllUsers = (checked) => {
    setSelectedUsers(checked ? users.map(user => user._id) : []);
  };

  const handleSelectAllTransactions = (checked) => {
    setSelectedTransactions(checked ? transactions.map(tx => tx._id) : []);
  };

  const handleBulkBalanceAdjustment = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (!balanceForm.amount || !balanceForm.reason) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setProcessing(true);
      const response = await adminAPI.post('/bulk/balance-adjustment', {
        userIds: selectedUsers,
        operation: balanceForm.operation,
        amount: parseFloat(balanceForm.amount),
        reason: balanceForm.reason
      });

      setSuccess(`Balance adjustment completed for ${response.data.processedCount} users`);
      setBalanceDialog(false);
      setSelectedUsers([]);
      setBalanceForm({ operation: 'add', amount: '', reason: '' });
      fetchUsers();
      fetchOperationHistory();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process balance adjustment');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkExport = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    try {
      setProcessing(true);
      const response = await adminAPI.post('/bulk/export-users', {
        userIds: selectedUsers,
        format: exportForm.format,
        fields: exportForm.fields,
        includeTransactions: exportForm.includeTransactions
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { 
        type: exportForm.format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.${exportForm.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`Exported data for ${selectedUsers.length} users`);
      setExportDialog(false);
      setSelectedUsers([]);
      fetchOperationHistory();
    } catch (err) {
      setError('Failed to export user data');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkTransactionActions = async () => {
    if (selectedTransactions.length === 0) {
      setError('Please select at least one transaction');
      return;
    }

    if (!transactionForm.reason) {
      setError('Please provide a reason for this action');
      return;
    }

    try {
      setProcessing(true);
      const response = await adminAPI.post('/bulk/transaction-actions', {
        transactionIds: selectedTransactions,
        action: transactionForm.action,
        reason: transactionForm.reason
      });

      setSuccess(`${transactionForm.action} completed for ${response.data.processedCount} transactions`);
      setTransactionDialog(false);
      setSelectedTransactions([]);
      setTransactionForm({ action: 'approve', reason: '' });
      fetchTransactions();
      fetchOperationHistory();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process transaction actions');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getOperationIcon = (type) => {
    switch (type) {
      case 'balance_adjustment':
        return <BalanceIcon color="primary" />;
      case 'user_export':
        return <DownloadIcon color="info" />;
      case 'transaction_actions':
        return <TransactionIcon color="success" />;
      default:
        return <EditIcon color="default" />;
    }
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

      {processing && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Processing bulk operation...
          </Typography>
        </Box>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" display="flex" alignItems="center">
          <GroupIcon sx={{ mr: 1 }} />
          Bulk Actions
        </Typography>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={() => setHistoryDialog(true)}
        >
          Operation History
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Operations
              </Typography>
              <Typography variant="h4">
                {stats.totalOperations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Successful
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.successfulOperations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Failed
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.failedOperations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Users Affected
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.usersAffected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* User Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">User Management</Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<BalanceIcon />}
                    onClick={() => setBalanceDialog(true)}
                    disabled={selectedUsers.length === 0}
                    sx={{ mr: 1 }}
                  >
                    Adjust Balance
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => setExportDialog(true)}
                    disabled={selectedUsers.length === 0}
                  >
                    Export Data
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUsers.length === users.length && users.length > 0}
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                      onChange={(e) => handleSelectAllUsers(e.target.checked)}
                    />
                  }
                  label={`Select All (${selectedUsers.length} selected)`}
                />
              </Box>

              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">Select</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Balance</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedUsers.includes(user._id)}
                              onChange={(e) => handleUserSelection(user._id, e.target.checked)}
                            />
                          </TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>${user.balance?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.status || 'active'}
                              size="small"
                              color={user.status === 'active' ? 'success' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Transaction Management</Typography>
                <Button
                  variant="outlined"
                  startIcon={<TransactionIcon />}
                  onClick={() => setTransactionDialog(true)}
                  disabled={selectedTransactions.length === 0}
                >
                  Process Transactions
                </Button>
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                      indeterminate={selectedTransactions.length > 0 && selectedTransactions.length < transactions.length}
                      onChange={(e) => handleSelectAllTransactions(e.target.checked)}
                    />
                  }
                  label={`Select All (${selectedTransactions.length} selected)`}
                />
              </Box>

              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">Select</TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>User</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No pending transactions
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedTransactions.includes(transaction._id)}
                              onChange={(e) => handleTransactionSelection(transaction._id, e.target.checked)}
                            />
                          </TableCell>
                          <TableCell>{transaction._id.slice(-6)}</TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.type}
                              size="small"
                              color={transaction.type === 'deposit' ? 'success' : 'warning'}
                            />
                          </TableCell>
                          <TableCell>${transaction.amount?.toFixed(2)}</TableCell>
                          <TableCell>{transaction.userId?.name || 'Unknown'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Balance Adjustment Dialog */}
      <Dialog open={balanceDialog} onClose={() => setBalanceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Balance Adjustment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  You are about to adjust balances for {selectedUsers.length} users. This action cannot be undone.
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Operation</InputLabel>
                <Select
                  value={balanceForm.operation}
                  onChange={(e) => setBalanceForm(prev => ({ ...prev, operation: e.target.value }))}
                >
                  <MenuItem value="add">Add to Balance</MenuItem>
                  <MenuItem value="deduct">Deduct from Balance</MenuItem>
                  <MenuItem value="set">Set Balance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Amount ($)"
                value={balanceForm.amount}
                onChange={(e) => setBalanceForm(prev => ({ ...prev, amount: e.target.value }))}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason (Required)"
                value={balanceForm.reason}
                onChange={(e) => setBalanceForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Provide a reason for this balance adjustment..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBalanceDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkBalanceAdjustment}
            variant="contained"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Apply Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export User Data</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Exporting data for {selectedUsers.length} selected users.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={exportForm.format}
                  onChange={(e) => setExportForm(prev => ({ ...prev, format: e.target.value }))}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Fields to Export:
              </Typography>
              {availableFields.map((field) => (
                <FormControlLabel
                  key={field.value}
                  control={
                    <Checkbox
                      checked={exportForm.fields.includes(field.value)}
                      onChange={(e) => {
                        const newFields = e.target.checked
                          ? [...exportForm.fields, field.value]
                          : exportForm.fields.filter(f => f !== field.value);
                        setExportForm(prev => ({ ...prev, fields: newFields }));
                      }}
                    />
                  }
                  label={field.label}
                />
              ))}
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportForm.includeTransactions}
                    onChange={(e) => setExportForm(prev => ({ ...prev, includeTransactions: e.target.checked }))}
                  />
                }
                label="Include Transaction History"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkExport}
            variant="contained"
            disabled={processing || exportForm.fields.length === 0}
          >
            {processing ? 'Exporting...' : 'Export Data'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Actions Dialog */}
      <Dialog open={transactionDialog} onClose={() => setTransactionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Transaction Actions</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  You are about to process {selectedTransactions.length} transactions.
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Action:
              </Typography>
              <RadioGroup
                value={transactionForm.action}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, action: e.target.value }))}
              >
                <FormControlLabel value="approve" control={<Radio />} label="Approve Transactions" />
                <FormControlLabel value="reject" control={<Radio />} label="Reject Transactions" />
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason (Required)"
                value={transactionForm.reason}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Provide a reason for this action..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkTransactionActions}
            variant="contained"
            disabled={processing}
            color={transactionForm.action === 'approve' ? 'success' : 'error'}
          >
            {processing ? 'Processing...' : `${transactionForm.action} Transactions`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Operation History Dialog */}
      <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Bulk Operation History</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Operation</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Items Processed</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operationHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No operation history found
                    </TableCell>
                  </TableRow>
                ) : (
                  operationHistory.map((operation) => (
                    <TableRow key={operation._id}>
                      <TableCell>{formatDate(operation.timestamp)}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getOperationIcon(operation.type)}
                          <Typography sx={{ ml: 1 }}>
                            {operation.type.replace('_', ' ')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{operation.adminId?.name || 'Unknown'}</TableCell>
                      <TableCell>{operation.itemsProcessed || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={operation.status}
                          size="small"
                          color={operation.status === 'completed' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={operation.details || 'No details available'}>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkActions;