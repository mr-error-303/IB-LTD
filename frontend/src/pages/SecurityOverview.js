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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Badge,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Block as BlockIcon,
  VpnLock as VpnIcon,
  Computer as DeviceIcon,
  LocationOn as LocationIcon,
  Person as UserIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  NotificationsActive as AlertIcon,
  PhoneAndroid as MobileIcon,
  Laptop as LaptopIcon,
  Tablet as TabletIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SecurityOverview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [securityData, setSecurityData] = useState({});
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch security overview data
  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/security/overview', {
        params: { timeRange }
      });
      
      if (response.data.success) {
        setSecurityData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      setError('Failed to fetch security overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, [timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSecurityData();
    setRefreshing(false);
  };

  const getSecurityScore = () => {
    const { securityScore = 0 } = securityData;
    return Math.round(securityScore);
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const {
    securityScore = 0,
    threatLevel = 'low',
    activeThreats = 0,
    blockedAttempts = 0,
    secureConnections = 0,
    vulnerabilities = 0,
    recentAlerts = [],
    securityTrends = [],
    threatDistribution = [],
    deviceSecurity = [],
    loginAttempts = [],
    topThreats = [],
    securityEvents = [],
    systemHealth = {},
  } = securityData;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Security Overview
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="1d">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Security Score and Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Security Score
              </Typography>
              <Box position="relative" display="inline-flex" mb={2}>
                <CircularProgress
                  variant="determinate"
                  value={getSecurityScore()}
                  size={120}
                  thickness={4}
                  color={getSecurityScoreColor(getSecurityScore())}
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography variant="h4" component="div" color="text.secondary">
                    {getSecurityScore()}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Overall system security health
              </Typography>
              <Chip
                label={`Threat Level: ${threatLevel.toUpperCase()}`}
                color={getThreatLevelColor(threatLevel)}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Active Threats
                      </Typography>
                      <Typography variant="h4" component="div" color="error.main">
                        {activeThreats}
                      </Typography>
                    </Box>
                    <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Blocked Attempts
                      </Typography>
                      <Typography variant="h4" component="div" color="warning.main">
                        {formatNumber(blockedAttempts)}
                      </Typography>
                    </Box>
                    <BlockIcon color="warning" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Secure Connections
                      </Typography>
                      <Typography variant="h4" component="div" color="success.main">
                        {formatNumber(secureConnections)}
                      </Typography>
                    </Box>
                    <LockIcon color="success" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Vulnerabilities
                      </Typography>
                      <Typography variant="h4" component="div" color="info.main">
                        {vulnerabilities}
                      </Typography>
                    </Box>
                    <WarningIcon color="info" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Security Trends Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={securityTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="threats" stroke="#ff4444" strokeWidth={2} />
                <Line type="monotone" dataKey="blocked" stroke="#ffaa00" strokeWidth={2} />
                <Line type="monotone" dataKey="secure" stroke="#00aa44" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Threat Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={threatDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {threatDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Security Events and System Health */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Security Events
            </Typography>
            <List>
              {securityEvents.slice(0, 5).map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem>
                    <ListItemIcon>
                      {event.type === 'threat' && <ErrorIcon color="error" />}
                      {event.type === 'block' && <BlockIcon color="warning" />}
                      {event.type === 'secure' && <CheckIcon color="success" />}
                      {event.type === 'login' && <LoginIcon color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {event.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(event.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={event.severity}
                        color={getThreatLevelColor(event.severity)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < securityEvents.slice(0, 5).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Firewall Status</Typography>
                <Chip
                  label={systemHealth.firewall ? 'Active' : 'Inactive'}
                  color={systemHealth.firewall ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.firewall ? 100 : 0}
                color={systemHealth.firewall ? 'success' : 'error'}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Antivirus Protection</Typography>
                <Typography variant="body2">{systemHealth.antivirusScore || 0}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.antivirusScore || 0}
                color={systemHealth.antivirusScore > 80 ? 'success' : 'warning'}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">SSL/TLS Security</Typography>
                <Typography variant="body2">{systemHealth.sslScore || 0}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.sslScore || 0}
                color={systemHealth.sslScore > 90 ? 'success' : 'warning'}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Database Security</Typography>
                <Typography variant="body2">{systemHealth.databaseScore || 0}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.databaseScore || 0}
                color={systemHealth.databaseScore > 85 ? 'success' : 'warning'}
              />
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Access Control</Typography>
                <Typography variant="body2">{systemHealth.accessControlScore || 0}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemHealth.accessControlScore || 0}
                color={systemHealth.accessControlScore > 90 ? 'success' : 'warning'}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Threats and Device Security */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Security Threats
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Threat</TableCell>
                    <TableCell>Count</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topThreats.map((threat) => (
                    <TableRow key={threat.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <ErrorIcon color="error" sx={{ mr: 1, fontSize: 16 }} />
                          {threat.name}
                        </Box>
                      </TableCell>
                      <TableCell>{threat.count}</TableCell>
                      <TableCell>
                        <Chip
                          label={threat.severity}
                          color={getThreatLevelColor(threat.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={threat.status}
                          color={threat.status === 'blocked' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Device Security Status
            </Typography>
            <List>
              {deviceSecurity.map((device, index) => (
                <React.Fragment key={device.id}>
                  <ListItem>
                    <ListItemIcon>
                      {device.type === 'mobile' && <MobileIcon />}
                      {device.type === 'laptop' && <LaptopIcon />}
                      {device.type === 'tablet' && <TabletIcon />}
                      {device.type === 'desktop' && <DeviceIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={device.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {device.os} • Last seen: {new Date(device.lastSeen).toLocaleDateString()}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={device.securityScore}
                            color={device.securityScore > 80 ? 'success' : 'warning'}
                            sx={{ mt: 1, width: '100px' }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={device.status}
                        color={device.status === 'secure' ? 'success' : 'warning'}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < deviceSecurity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecurityOverview;