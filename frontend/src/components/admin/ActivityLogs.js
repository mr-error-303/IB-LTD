import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Pagination,
  IconButton,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  History as HistoryIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { adminAPI } from '../../services/api';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    adminId: '',
    action: '',
    category: '',
    startDate: null,
    endDate: null,
    targetType: '',
    targetId: ''
  });
  
  // Dialog states
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [statsDialog, setStatsDialog] = useState(false);

  const actionCategories = [
    'user_management',
    'transaction_management', 
    'financial_operations',
    'system_monitoring',
    'content_management',
    'security_operations',
    'bulk_operations'
  ];

  const targetTypes = [
    'User',
    'Transaction', 
    'AdminRole',
    'System',
    'Alert',
    'BulkOperation'
  ];

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value !== '' && value !== null
          )
        )
      });

      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }

      const response = await adminAPI.get(`/activity-logs?${params}`);
      setLogs(response.data.logs || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalLogs(response.data.totalLogs || 0);
    } catch (err) {
      setError('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.get('/activity-logs/stats/summary');
      setStats(response.data.stats || {});
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value !== '' && value !== null
          )
        )
      });

      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }

      const response = await adminAPI.get(`/activity-logs/export/csv?${params}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Activity logs exported successfully');
    } catch (err) {
      setError('Failed to export activity logs');
    }
  };

  const handleCleanup = async () => {
    if (window.confirm('Are you sure you want to cleanup old logs? This action cannot be undone.')) {
      try {
        await adminAPI.delete('/activity-logs/cleanup');
        setSuccess('Old logs cleaned up successfully');
        fetchLogs();
        fetchStats();
      } catch (err) {
        setError('Failed to cleanup old logs');
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      adminId: '',
      action: '',
      category: '',
      startDate: null,
      endDate: null,
      targetType: '',
      targetId: ''
    });
    setPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (category) => {
    const colors = {
      user_management: 'primary',
      transaction_management: 'success',
      financial_operations: 'warning',
      system_monitoring: 'info',
      content_management: 'secondary',
      security_operations: 'error',
      bulk_operations: 'default'
    };
    return colors[category] || 'default';
  };

  const viewLogDetails = (log) => {
    setSelectedLog(log);
    setDetailDialog(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            <HistoryIcon sx={{ mr: 1 }} />
            Activity Logs
            <Badge badgeContent={totalLogs} color="primary" sx={{ ml: 2 }} />
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<AnalyticsIcon />}
              onClick={() => setStatsDialog(true)}
              sx={{ mr: 1 }}
            >
              Statistics
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{ mr: 1 }}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleCleanup}
            >
              Cleanup Old Logs
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography display="flex" alignItems="center">
              <FilterIcon sx={{ mr: 1 }} />
              Filters
              {Object.values(filters).some(v => v !== '' && v !== null) && (
                <Chip label="Active" size="small" color="primary" sx={{ ml: 1 }} />
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Admin ID"
                  value={filters.adminId}
                  onChange={(e) => setFilters(prev => ({ ...prev, adminId: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Action"
                  value={filters.action}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {actionCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.replace('_', ' ').toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Target Type</InputLabel>
                  <Select
                    value={filters.targetType}
                    onChange={(e) => setFilters(prev => ({ ...prev, targetType: e.target.value }))}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {targetTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Target ID"
                  value={filters.targetId}
                  onChange={(e) => setFilters(prev => ({ ...prev, targetId: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  sx={{ height: '56px' }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Logs Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Loading activity logs...
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>{formatDate(log.timestamp)}</TableCell>
                        <TableCell>
                          {log.adminId?.name || log.adminId?.email || 'Unknown'}
                        </TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.category.replace('_', ' ')}
                            size="small"
                            color={getActionColor(log.category)}
                          />
                        </TableCell>
                        <TableCell>
                          {log.targetType} {log.targetId && `(${log.targetId.slice(-6)})`}
                        </TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton onClick={() => viewLogDetails(log)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Log Detail Dialog */}
        <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Activity Log Details</DialogTitle>
          <DialogContent>
            {selectedLog && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Timestamp</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formatDate(selectedLog.timestamp)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Admin</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedLog.adminId?.name || selectedLog.adminId?.email || 'Unknown'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Action</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedLog.action}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Category</Typography>
                  <Chip
                    label={selectedLog.category.replace('_', ' ')}
                    size="small"
                    color={getActionColor(selectedLog.category)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Target Type</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedLog.targetType}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Target ID</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedLog.targetId || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">IP Address</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedLog.ipAddress}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">User Agent</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedLog.userAgent || 'N/A'}
                  </Typography>
                </Grid>
                {selectedLog.details && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Details</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Statistics Dialog */}
        <Dialog open={statsDialog} onClose={() => setStatsDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Activity Statistics</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total Logs</Typography>
                    <Typography variant="h4" color="primary">
                      {stats.totalLogs || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Active Admins</Typography>
                    <Typography variant="h4" color="success.main">
                      {stats.activeAdmins || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Actions by Category</Typography>
                    {stats.actionsByCategory && Object.entries(stats.actionsByCategory).map(([category, count]) => (
                      <Box key={category} display="flex" justifyContent="space-between" mb={1}>
                        <Typography>{category.replace('_', ' ')}</Typography>
                        <Chip label={count} size="small" />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ActivityLogs;