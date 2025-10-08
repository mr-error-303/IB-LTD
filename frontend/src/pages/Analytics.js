import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  AccountBalance as TransactionIcon,
  AttachMoney as RevenueIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
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
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [analytics, setAnalytics] = useState({
    overview: {},
    transactions: [],
    users: [],
    revenue: [],
    topUsers: [],
    recentActivities: [],
    systemHealth: {},
  });

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {
        range: dateRange,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get('/api/admin/analytics', { params });
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, startDate, endDate]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range !== 'custom') {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleExport = async () => {
    try {
      const params = {
        range: dateRange,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        export: true,
      };

      const response = await axios.get('/api/admin/analytics/export', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('Failed to export report');
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value) => {
    return value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.secondary';
  };

  const getGrowthIcon = (value) => {
    return value > 0 ? <TrendingUpIcon /> : value < 0 ? <TrendingDownIcon /> : null;
  };

  if (loading) {
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
            Analytics Dashboard
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                label="Date Range"
              >
                <MenuItem value="1d">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
                <MenuItem value="1y">Last Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
            
            {dateRange === 'custom' && (
              <>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  renderInput={(params) => <TextField {...params} size="small" />}
                />
              </>
            )}
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
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

        {/* Overview Cards */}
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
                      {analytics.overview.totalUsers || 0}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      {getGrowthIcon(analytics.overview.userGrowth)}
                      <Typography 
                        variant="body2" 
                        color={getGrowthColor(analytics.overview.userGrowth)}
                        sx={{ ml: 0.5 }}
                      >
                        {formatPercentage(analytics.overview.userGrowth || 0)}
                      </Typography>
                    </Box>
                  </Box>
                  <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
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
                      Total Transactions
                    </Typography>
                    <Typography variant="h4" component="div">
                      {analytics.overview.totalTransactions || 0}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      {getGrowthIcon(analytics.overview.transactionGrowth)}
                      <Typography 
                        variant="body2" 
                        color={getGrowthColor(analytics.overview.transactionGrowth)}
                        sx={{ ml: 0.5 }}
                      >
                        {formatPercentage(analytics.overview.transactionGrowth || 0)}
                      </Typography>
                    </Box>
                  </Box>
                  <TransactionIcon color="info" sx={{ fontSize: 40 }} />
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
                      Total Revenue
                    </Typography>
                    <Typography variant="h5" component="div">
                      {formatAmount(analytics.overview.totalRevenue || 0)}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      {getGrowthIcon(analytics.overview.revenueGrowth)}
                      <Typography 
                        variant="body2" 
                        color={getGrowthColor(analytics.overview.revenueGrowth)}
                        sx={{ ml: 0.5 }}
                      >
                        {formatPercentage(analytics.overview.revenueGrowth || 0)}
                      </Typography>
                    </Box>
                  </Box>
                  <RevenueIcon color="success" sx={{ fontSize: 40 }} />
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
                      System Health
                    </Typography>
                    <Typography variant="h4" component="div" color="success.main">
                      {analytics.overview.systemHealth || 99}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      All systems operational
                    </Typography>
                  </Box>
                  <SecurityIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Transaction Trends */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <TimelineIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Transaction Trends</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.transactions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Transactions']} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Transaction Status Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <PieChartIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Transaction Status</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: analytics.overview.completedTransactions || 0, color: '#00C49F' },
                      { name: 'Pending', value: analytics.overview.pendingTransactions || 0, color: '#FFBB28' },
                      { name: 'Failed', value: analytics.overview.failedTransactions || 0, color: '#FF8042' },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Completed', value: analytics.overview.completedTransactions || 0, color: '#00C49F' },
                      { name: 'Pending', value: analytics.overview.pendingTransactions || 0, color: '#FFBB28' },
                      { name: 'Failed', value: analytics.overview.failedTransactions || 0, color: '#FF8042' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Revenue Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <BarChartIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Revenue Overview</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatAmount(value), 'Revenue']} />
                  <Bar dataKey="amount" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* User Growth */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <ShowChartIcon sx={{ mr: 1 }} />
                <Typography variant="h6">User Growth</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.users}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    dot={{ fill: '#0088FE' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Information */}
        <Grid container spacing={3}>
          {/* Top Users */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Active Users
              </Typography>
              <List>
                {(analytics.topUsers || []).slice(0, 5).map((user, index) => (
                  <ListItem key={user.id} divider>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                        {user.name?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={user.name}
                      secondary={`${user.transactionCount} transactions • ${formatAmount(user.totalAmount)}`}
                    />
                    <Chip 
                      label={`#${index + 1}`} 
                      size="small" 
                      color={index === 0 ? 'primary' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {(analytics.recentActivities || []).slice(0, 5).map((activity, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      {activity.type === 'success' && <SuccessIcon color="success" />}
                      {activity.type === 'warning' && <WarningIcon color="warning" />}
                      {activity.type === 'error' && <ErrorIcon color="error" />}
                      {activity.type === 'info' && <PendingIcon color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.message}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* System Performance */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Performance Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Server Response Time
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {analytics.systemHealth?.responseTime || 120}ms
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={85} 
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Database Performance
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {analytics.systemHealth?.dbPerformance || 92}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={92} 
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      API Success Rate
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {analytics.systemHealth?.apiSuccessRate || 99.5}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={99.5} 
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Error Rate
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {analytics.systemHealth?.errorRate || 0.5}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={0.5} 
                      color="error"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default Analytics;