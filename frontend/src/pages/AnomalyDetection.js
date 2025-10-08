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
  LinearProgress,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  NotificationsActive as AlertIcon,
  Computer as DeviceIcon,
  LocationOn as LocationIcon,
  Person as UserIcon,
  AccountBalance as TransactionIcon,
  Login as LoginIcon,
  CreditCard as PaymentIcon,
  PhoneAndroid as MobileIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Speed as SpeedIcon,
  Psychology as AIIcon,
  Analytics as AnalyticsIcon,
  Radar as RadarIcon,
  BugReport as BugIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AnomalyDetection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anomalies, setAnomalies] = useState([]);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    type: '',
    dateRange: '7d',
    confidence: '',
  });
  const [detectionSettings, setDetectionSettings] = useState({
    enabled: true,
    sensitivity: 'medium',
    autoBlock: false,
    realTimeMonitoring: true,
    mlEnabled: true,
    alertThreshold: 0.8,
  });
  const [anomalyTrends, setAnomalyTrends] = useState([]);
  const [detectionModels, setDetectionModels] = useState([]);

  // Fetch anomaly detection data
  const fetchAnomalies = async () => {
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

      const response = await axios.get('/api/admin/security/anomalies', { params });
      
      if (response.data.success) {
        setAnomalies(response.data.data.anomalies);
        setStats(response.data.data.stats);
        setAnomalyTrends(response.data.data.trends || []);
        setDetectionModels(response.data.data.models || []);
      }
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      setError('Failed to fetch anomaly detection data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (anomaly) => {
    setSelectedAnomaly(anomaly);
    setDetailsOpen(true);
  };

  const handleMarkAsReviewed = async (anomalyId) => {
    try {
      const response = await axios.patch(`/api/admin/security/anomalies/${anomalyId}/review`);
      if (response.data.success) {
        fetchAnomalies();
      }
    } catch (error) {
      console.error('Error marking anomaly as reviewed:', error);
      setError('Failed to mark anomaly as reviewed');
    }
  };

  const handleBlockAnomaly = async (anomalyId) => {
    try {
      const response = await axios.patch(`/api/admin/security/anomalies/${anomalyId}/block`);
      if (response.data.success) {
        fetchAnomalies();
      }
    } catch (error) {
      console.error('Error blocking anomaly:', error);
      setError('Failed to block anomaly');
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
    fetchAnomalies();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <ErrorIcon />;
      case 'high': return <WarningIcon />;
      case 'medium': return <SecurityIcon />;
      case 'low': return <ShieldIcon />;
      default: return <AlertIcon />;
    }
  };

  const getAnomalyTypeIcon = (type) => {
    switch (type) {
      case 'login': return <LoginIcon />;
      case 'transaction': return <TransactionIcon />;
      case 'payment': return <PaymentIcon />;
      case 'device': return <DeviceIcon />;
      case 'location': return <LocationIcon />;
      case 'user_behavior': return <UserIcon />;
      case 'network': return <RadarIcon />;
      case 'system': return <BugIcon />;
      default: return <FlagIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'investigating': return 'info';
      case 'blocked': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'error';
    if (confidence >= 0.7) return 'warning';
    if (confidence >= 0.5) return 'info';
    return 'success';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatConfidence = (confidence) => {
    return `${Math.round(confidence * 100)}%`;
  };

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
          Anomaly Detection
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
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            color="primary"
          >
            Settings
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Detection Status */}
      <Alert 
        severity={detectionSettings.enabled ? "success" : "warning"} 
        sx={{ mb: 3 }}
        icon={detectionSettings.enabled ? <CheckIcon /> : <CancelIcon />}
      >
        Anomaly Detection is {detectionSettings.enabled ? 'Active' : 'Inactive'} 
        {detectionSettings.enabled && detectionSettings.mlEnabled && ' with AI/ML Enhancement'}
      </Alert>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Anomalies
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.totalAnomalies || 0}
                  </Typography>
                </Box>
                <Badge badgeContent={stats.newAnomalies || 0} color="error">
                  <FlagIcon color="primary" sx={{ fontSize: 40 }} />
                </Badge>
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
                    High Risk
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {stats.highRiskAnomalies || 0}
                  </Typography>
                </Box>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
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
                    Auto Blocked
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {stats.autoBlocked || 0}
                  </Typography>
                </Box>
                <BlockIcon color="warning" sx={{ fontSize: 40 }} />
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
                    Detection Rate
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats.detectionRate || 0}%
                  </Typography>
                </Box>
                <AnalyticsIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Anomalies" />
          <Tab label="Trends" />
          <Tab label="Models" />
          <Tab label="Settings" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <>
          {/* Filters */}
          {filterOpen && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Filter Anomalies
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={filters.severity}
                      onChange={(e) => handleFilterChange('severity', e.target.value)}
                      label="Severity"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="investigating">Investigating</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                      <MenuItem value="blocked">Blocked</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="login">Login</MenuItem>
                      <MenuItem value="transaction">Transaction</MenuItem>
                      <MenuItem value="device">Device</MenuItem>
                      <MenuItem value="location">Location</MenuItem>
                      <MenuItem value="user_behavior">User Behavior</MenuItem>
                      <MenuItem value="network">Network</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Confidence</InputLabel>
                    <Select
                      value={filters.confidence}
                      onChange={(e) => handleFilterChange('confidence', e.target.value)}
                      label="Confidence"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="high">High (90%+)</MenuItem>
                      <MenuItem value="medium">Medium (70-89%)</MenuItem>
                      <MenuItem value="low">Low (&lt;70%)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      label="Date Range"
                    >
                      <MenuItem value="1d">Last 24 Hours</MenuItem>
                      <MenuItem value="7d">Last 7 Days</MenuItem>
                      <MenuItem value="30d">Last 30 Days</MenuItem>
                      <MenuItem value="90d">Last 90 Days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Anomalies Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Anomaly</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {anomalies.map((anomaly) => (
                    <TableRow key={anomaly.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getAnomalyTypeIcon(anomaly.type)}
                          <Box ml={2}>
                            <Typography variant="subtitle2">
                              {anomaly.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {anomaly.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={anomaly.type} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getSeverityIcon(anomaly.severity)}
                          label={anomaly.severity}
                          color={getSeverityColor(anomaly.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={anomaly.confidence * 100}
                            color={getConfidenceColor(anomaly.confidence)}
                            sx={{ width: 60, mr: 1 }}
                          />
                          <Typography variant="body2">
                            {formatConfidence(anomaly.confidence)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={anomaly.status}
                          color={getStatusColor(anomaly.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(anomaly.detectedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(anomaly)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          {anomaly.status === 'pending' && (
                            <Tooltip title="Mark as Reviewed">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleMarkAsReviewed(anomaly.id)}
                              >
                                <CheckIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {anomaly.status !== 'blocked' && (
                            <Tooltip title="Block">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleBlockAnomaly(anomaly.id)}
                              >
                                <BlockIcon />
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
              count={stats.totalAnomalies || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Anomaly Detection Trends
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={anomalyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="detected" stroke="#ff4444" strokeWidth={2} name="Detected" />
              <Line type="monotone" dataKey="blocked" stroke="#ffaa00" strokeWidth={2} name="Blocked" />
              <Line type="monotone" dataKey="resolved" stroke="#00aa44" strokeWidth={2} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detection Models
          </Typography>
          <Grid container spacing={3}>
            {detectionModels.map((model) => (
              <Grid item xs={12} md={6} key={model.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="h6">
                        {model.name}
                      </Typography>
                      <Chip
                        label={model.status}
                        color={model.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {model.description}
                    </Typography>
                    <Box mt={2}>
                      <Typography variant="body2" gutterBottom>
                        Accuracy: {model.accuracy}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={model.accuracy}
                        color="success"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" gutterBottom>
                        Last Updated: {formatDate(model.lastUpdated)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detection Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={detectionSettings.enabled}
                    onChange={(e) => setDetectionSettings(prev => ({
                      ...prev,
                      enabled: e.target.checked
                    }))}
                  />
                }
                label="Enable Anomaly Detection"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={detectionSettings.mlEnabled}
                    onChange={(e) => setDetectionSettings(prev => ({
                      ...prev,
                      mlEnabled: e.target.checked
                    }))}
                  />
                }
                label="Enable AI/ML Enhancement"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={detectionSettings.autoBlock}
                    onChange={(e) => setDetectionSettings(prev => ({
                      ...prev,
                      autoBlock: e.target.checked
                    }))}
                  />
                }
                label="Auto-block High Risk Anomalies"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={detectionSettings.realTimeMonitoring}
                    onChange={(e) => setDetectionSettings(prev => ({
                      ...prev,
                      realTimeMonitoring: e.target.checked
                    }))}
                  />
                }
                label="Real-time Monitoring"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Detection Sensitivity</InputLabel>
                <Select
                  value={detectionSettings.sensitivity}
                  onChange={(e) => setDetectionSettings(prev => ({
                    ...prev,
                    sensitivity: e.target.value
                  }))}
                  label="Detection Sensitivity"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alert Threshold"
                type="number"
                value={detectionSettings.alertThreshold}
                onChange={(e) => setDetectionSettings(prev => ({
                  ...prev,
                  alertThreshold: parseFloat(e.target.value)
                }))}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                helperText="Confidence threshold for alerts (0.0 - 1.0)"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Anomaly Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Anomaly Details
        </DialogTitle>
        <DialogContent>
          {selectedAnomaly && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Title
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedAnomaly.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Type
                  </Typography>
                  <Chip label={selectedAnomaly.type} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Severity
                  </Typography>
                  <Chip
                    icon={getSeverityIcon(selectedAnomaly.severity)}
                    label={selectedAnomaly.severity}
                    color={getSeverityColor(selectedAnomaly.severity)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Confidence Score
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <LinearProgress
                      variant="determinate"
                      value={selectedAnomaly.confidence * 100}
                      color={getConfidenceColor(selectedAnomaly.confidence)}
                      sx={{ width: 100, mr: 2 }}
                    />
                    <Typography variant="body2">
                      {formatConfidence(selectedAnomaly.confidence)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedAnomaly.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Detection Details
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedAnomaly.detectionData || {}, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Detected At
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedAnomaly.detectedAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedAnomaly.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
          {selectedAnomaly?.status === 'pending' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleMarkAsReviewed(selectedAnomaly.id);
                setDetailsOpen(false);
              }}
            >
              Mark as Reviewed
            </Button>
          )}
          {selectedAnomaly?.status !== 'blocked' && (
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleBlockAnomaly(selectedAnomaly.id);
                setDetailsOpen(false);
              }}
            >
              Block
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnomalyDetection;