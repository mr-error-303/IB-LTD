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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  AccountBalance as TransactionIcon,
  Settings as SettingsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    level: '',
    user: '',
    startDate: null,
    endDate: null,
  });
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    errorLogs: 0,
    warningLogs: 0,
  });

  // Activity types and their icons
  const activityTypes = {
    login: { icon: <LoginIcon />, color: 'success', label: 'Login' },
    logout: { icon: <LogoutIcon />, color: 'info', label: 'Logout' },
    transaction: { icon: <TransactionIcon />, color: 'primary', label: 'Transaction' },
    user_management: { icon: <PersonIcon />, color: 'warning', label: 'User Management' },
    security: { icon: <SecurityIcon />, color: 'error', label: 'Security' },
    settings: { icon: <SettingsIcon />, color: 'default', label: 'Settings' },
    system: { icon: <InfoIcon />, color: 'info', label: 'System' },
  };

  // Log levels and their colors
  const logLevels = {
    info: { color: 'info', icon: <InfoIcon /> },
    warning: { color: 'warning', icon: <WarningIcon /> },
    error: { color: 'error', icon: <ErrorIcon /> },
    success: { color: 'success', icon: <SuccessIcon /> },
  };

  // Fetch activity logs
  const fetchLogs = async (pageNum = 1) => {
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

      const response = await axios.get('/api/admin/activity-logs', { params });
      
      if (response.data.success) {
        setLogs(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/activity-logs/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchLogs(page);
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
    fetchLogs(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      level: '',
      user: '',
      startDate: null,
      endDate: null,
    });
    setPage(1);
    fetchLogs(1);
  };

  const handleRefresh = () => {
    fetchLogs(page);
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

      const response = await axios.get('/api/admin/activity-logs/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting logs:', error);
      setError('Failed to export logs');
    }
  };

  const handleMenuOpen = (event, log) => {
    setAnchorEl(event.currentTarget);
    setSelectedLog(log);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLog(null);
  };

  const handleViewDetails = () => {
    setDetailsOpen(true);
    handleMenuClose();
  };

  const getActivityIcon = (type) => {
    return activityTypes[type]?.icon || <InfoIcon />;
  };

  const getActivityColor = (type) => {
    return activityTypes[type]?.color || 'default';
  };

  const getLevelIcon = (level) => {
    return logLevels[level]?.icon || <InfoIcon />;
  };

  const getLevelColor = (level) => {
    return logLevels[level]?.color || 'default';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (loading && logs.length === 0) {
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
            Activity Logs
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
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Logs
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stats.totalLogs}
                    </Typography>
                  </Box>
                  <InfoIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Today's Logs
                    </Typography>
                    <Typography variant="h4" component="div" color="success.main">
                      {stats.todayLogs}
                    </Typography>
                  </Box>
                  <SuccessIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Errors
                    </Typography>
                    <Typography variant="h4" component="div" color="error.main">
                      {stats.errorLogs}
                    </Typography>
                  </Box>
                  <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Warnings
                    </Typography>
                    <Typography variant="h4" component="div" color="warning.main">
                      {stats.warningLogs}
                    </Typography>
                  </Box>
                  <WarningIcon color="warning" sx={{ fontSize: 40 }} />
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
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {Object.entries(activityTypes).map(([key, type]) => (
                    <MenuItem key={key} value={key}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  label="Level"
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                </Select>
              </FormControl>
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

        {/* Logs Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTimestamp(log.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {getInitials(log.userName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {log.userName || 'System'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {log.userRole}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getActivityIcon(log.type)}
                        <Chip
                          label={activityTypes[log.type]?.label || log.type}
                          color={getActivityColor(log.type)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getLevelIcon(log.level)}
                        <Chip
                          label={log.level?.toUpperCase()}
                          color={getLevelColor(log.level)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {log.ipAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {log.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, log)}
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
        </Menu>

        {/* Details Dialog */}
        <Dialog 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Activity Log Details
          </DialogTitle>
          <DialogContent>
            {selectedLog && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Timestamp
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatTimestamp(selectedLog.timestamp)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      User
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedLog.userName || 'System'} ({selectedLog.userRole})
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Activity Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {activityTypes[selectedLog.type]?.label || selectedLog.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Level
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedLog.level?.toUpperCase()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      IP Address
                    </Typography>
                    <Typography variant="body1" gutterBottom fontFamily="monospace">
                      {selectedLog.ipAddress}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      User Agent
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedLog.userAgent || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Description
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedLog.description}
                    </Typography>
                  </Grid>
                  {selectedLog.metadata && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Additional Data
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                          {JSON.stringify(selectedLog.metadata, null, 2)}
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
      </Box>
    </LocalizationProvider>
  );
};

export default ActivityLogs;