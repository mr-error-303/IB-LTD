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
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Description as DocumentIcon,
  Schedule as ScheduleIcon,
  AccountBalance as BankIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  CreditScore as CreditScoreIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  MonetizationOn as MonetizationOnIcon,
  ErrorOutline as ErrorOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const LoanPortfolio = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [modificationData, setModificationData] = useState({
    newInterestRate: '',
    newTerm: '',
    newEMI: '',
    reason: '',
    settlementAmount: ''
  });

  // Sample active loans data
  const sampleLoans = [
    {
      id: 'LN001',
      loanId: 'LA001',
      borrowerName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      loanAmount: 50000,
      disbursedAmount: 50000,
      outstandingAmount: 42500,
      interestRate: 8.5,
      loanTerm: 240,
      remainingTerm: 210,
      monthlyEMI: 389.64,
      nextEMIDate: '2024-02-15',
      status: 'active',
      disbursementDate: '2024-01-15',
      loanPurpose: 'Home Purchase',
      paymentHistory: [
        { date: '2024-01-15', amount: 389.64, type: 'EMI', status: 'paid' },
        { date: '2024-01-15', amount: 389.64, type: 'EMI', status: 'paid' },
        { date: '2024-01-15', amount: 389.64, type: 'EMI', status: 'overdue' }
      ],
      riskLevel: 'low',
      defaultDays: 0,
      totalPaid: 7500,
      collateral: 'Property worth $75,000'
    },
    {
      id: 'LN002',
      loanId: 'LA002',
      borrowerName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0124',
      loanAmount: 25000,
      disbursedAmount: 25000,
      outstandingAmount: 18750,
      interestRate: 12.0,
      loanTerm: 60,
      remainingTerm: 45,
      monthlyEMI: 556.11,
      nextEMIDate: '2024-02-14',
      status: 'active',
      disbursementDate: '2024-01-14',
      loanPurpose: 'Business Expansion',
      paymentHistory: [
        { date: '2024-01-14', amount: 556.11, type: 'EMI', status: 'paid' },
        { date: '2024-01-14', amount: 556.11, type: 'EMI', status: 'paid' }
      ],
      riskLevel: 'medium',
      defaultDays: 0,
      totalPaid: 6250,
      collateral: 'Business assets worth $35,000'
    },
    {
      id: 'LN003',
      loanId: 'LA003',
      borrowerName: 'Michael Brown',
      email: 'mike.brown@email.com',
      phone: '+1-555-0125',
      loanAmount: 15000,
      disbursedAmount: 15000,
      outstandingAmount: 13200,
      interestRate: 15.0,
      loanTerm: 84,
      remainingTerm: 74,
      monthlyEMI: 234.85,
      nextEMIDate: '2024-02-10',
      status: 'overdue',
      disbursementDate: '2024-01-13',
      loanPurpose: 'Education',
      paymentHistory: [
        { date: '2024-01-13', amount: 234.85, type: 'EMI', status: 'paid' },
        { date: '2024-01-13', amount: 234.85, type: 'EMI', status: 'overdue' }
      ],
      riskLevel: 'high',
      defaultDays: 15,
      totalPaid: 1800,
      collateral: 'None'
    }
  ];

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoans(sampleLoans);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError('Failed to fetch loan portfolio');
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, loan) => {
    setAnchorEl(event.currentTarget);
    setSelectedLoan(loan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLoan(null);
  };

  const handleDialogOpen = (type) => {
    setDialogType(type);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogType('');
    setModificationData({
      newInterestRate: '',
      newTerm: '',
      newEMI: '',
      reason: '',
      settlementAmount: ''
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLoanModification = async () => {
    try {
      // Simulate API call for loan modification
      const updatedLoans = loans.map(loan => 
        loan.id === selectedLoan.id 
          ? { 
              ...loan, 
              interestRate: parseFloat(modificationData.newInterestRate) || loan.interestRate,
              loanTerm: parseInt(modificationData.newTerm) || loan.loanTerm,
              monthlyEMI: parseFloat(modificationData.newEMI) || loan.monthlyEMI
            }
          : loan
      );
      setLoans(updatedLoans);
      setSnackbar({
        open: true,
        message: 'Loan modified successfully',
        severity: 'success'
      });
      handleDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to modify loan',
        severity: 'error'
      });
    }
  };

  const handleEarlySettlement = async () => {
    try {
      // Simulate API call for early settlement
      const updatedLoans = loans.map(loan => 
        loan.id === selectedLoan.id 
          ? { ...loan, status: 'settled', outstandingAmount: 0 }
          : loan
      );
      setLoans(updatedLoans);
      setSnackbar({
        open: true,
        message: 'Loan settled successfully',
        severity: 'success'
      });
      handleDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to settle loan',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'overdue': return 'error';
      case 'settled': return 'info';
      case 'defaulted': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const calculateProgress = (loan) => {
    return ((loan.loanTerm - loan.remainingTerm) / loan.loanTerm) * 100;
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedLoans = filteredLoans.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const totalPortfolioValue = loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
  const totalOverdue = loans.filter(loan => loan.status === 'overdue').length;
  const totalActive = loans.filter(loan => loan.status === 'active').length;
  const averageInterestRate = loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length;

  if (loading && loans.length === 0) {
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
          Loan Portfolio
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Portfolio Statistics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Portfolio Value
                    </Typography>
                    <Typography variant="h4" component="div">
                      ${totalPortfolioValue.toLocaleString()}
                    </Typography>
                  </Box>
                  <BankIcon color="primary" sx={{ fontSize: 40 }} />
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
                      Active Loans
                    </Typography>
                    <Typography variant="h4" component="div" color="success.main">
                      {totalActive}
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
                      Overdue Loans
                    </Typography>
                    <Typography variant="h4" component="div" color="error.main">
                      {totalOverdue}
                    </Typography>
                  </Box>
                  <WarningIcon color="error" sx={{ fontSize: 40 }} />
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
                      Avg Interest Rate
                    </Typography>
                    <Typography variant="h4" component="div">
                      {averageInterestRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="settled">Settled</MenuItem>
                  <MenuItem value="defaulted">Defaulted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchLoans}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                fullWidth
              >
                Export
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Loans Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Loan ID</TableCell>
                  <TableCell>Borrower</TableCell>
                  <TableCell>Loan Amount</TableCell>
                  <TableCell>Outstanding</TableCell>
                  <TableCell>EMI</TableCell>
                  <TableCell>Next Due</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Risk</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLoans.map((loan) => (
                  <TableRow key={loan.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {loan.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {loan.borrowerName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {loan.borrowerName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {loan.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ${loan.loanAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="error.main">
                        ${loan.outstandingAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${loan.monthlyEMI.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(loan.nextEMIDate).toLocaleDateString()}
                      </Typography>
                      {loan.defaultDays > 0 && (
                        <Typography variant="caption" color="error.main">
                          {loan.defaultDays} days overdue
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100px' }}>
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(loan)}
                          color={loan.status === 'overdue' ? 'error' : 'primary'}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {calculateProgress(loan).toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={loan.status.toUpperCase()}
                        color={getStatusColor(loan.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={loan.riskLevel.toUpperCase()}
                        color={getRiskColor(loan.riskLevel)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, loan)}
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
            count={filteredLoans.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleDialogOpen('view')}>
            <ViewIcon fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('modify')}>
            <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
            Modify Loan
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('payment_history')}>
            <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
            Payment History
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('early_settlement')}>
            <MonetizationOnIcon fontSize="small" sx={{ mr: 1 }} />
            Early Settlement
          </MenuItem>
        </Menu>

        {/* Loan Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {dialogType === 'view' && 'Loan Details'}
            {dialogType === 'modify' && 'Modify Loan Terms'}
            {dialogType === 'payment_history' && 'Payment History'}
            {dialogType === 'early_settlement' && 'Early Settlement'}
          </DialogTitle>
          <DialogContent>
            {selectedLoan && (
              <>
                {dialogType === 'view' && (
                  <Box>
                    <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                      <Tab label="Loan Details" />
                      <Tab label="Borrower Info" />
                      <Tab label="Payment Schedule" />
                    </Tabs>

                    {tabValue === 0 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>
                            Loan Information
                          </Typography>
                          <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Loan ID:</Typography>
                              <Typography fontWeight="bold">{selectedLoan.id}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Original Amount:</Typography>
                              <Typography>${selectedLoan.loanAmount.toLocaleString()}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Outstanding:</Typography>
                              <Typography color="error.main" fontWeight="bold">
                                ${selectedLoan.outstandingAmount.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Interest Rate:</Typography>
                              <Typography>{selectedLoan.interestRate}%</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Monthly EMI:</Typography>
                              <Typography>${selectedLoan.monthlyEMI.toFixed(2)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Remaining Term:</Typography>
                              <Typography>{selectedLoan.remainingTerm} months</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>
                            Status & Progress
                          </Typography>
                          <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Status:</Typography>
                              <Chip
                                label={selectedLoan.status.toUpperCase()}
                                color={getStatusColor(selectedLoan.status)}
                                size="small"
                              />
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Risk Level:</Typography>
                              <Chip
                                label={selectedLoan.riskLevel.toUpperCase()}
                                color={getRiskColor(selectedLoan.riskLevel)}
                                size="small"
                              />
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Next EMI Date:</Typography>
                              <Typography>{new Date(selectedLoan.nextEMIDate).toLocaleDateString()}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Total Paid:</Typography>
                              <Typography color="success.main">
                                ${selectedLoan.totalPaid.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography gutterBottom>Loan Progress:</Typography>
                              <LinearProgress
                                variant="determinate"
                                value={calculateProgress(selectedLoan)}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                              <Typography variant="caption" color="textSecondary">
                                {calculateProgress(selectedLoan).toFixed(1)}% completed
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    )}

                    {tabValue === 1 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="h6" gutterBottom>
                            Borrower Information
                          </Typography>
                          <Stack spacing={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PersonIcon fontSize="small" />
                              <Typography>{selectedLoan.borrowerName}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <EmailIcon fontSize="small" />
                              <Typography>{selectedLoan.email}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PhoneIcon fontSize="small" />
                              <Typography>{selectedLoan.phone}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <WorkIcon fontSize="small" />
                              <Typography>Loan Purpose: {selectedLoan.loanPurpose}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <BankIcon fontSize="small" />
                              <Typography>Collateral: {selectedLoan.collateral}</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    )}

                    {tabValue === 2 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Payment Schedule
                        </Typography>
                        <Timeline>
                          {selectedLoan.paymentHistory.map((payment, index) => (
                            <TimelineItem key={index}>
                              <TimelineOppositeContent color="textSecondary">
                                {new Date(payment.date).toLocaleDateString()}
                              </TimelineOppositeContent>
                              <TimelineSeparator>
                                <TimelineDot color={payment.status === 'paid' ? 'success' : 'error'}>
                                  {payment.status === 'paid' ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
                                </TimelineDot>
                                {index < selectedLoan.paymentHistory.length - 1 && <TimelineConnector />}
                              </TimelineSeparator>
                              <TimelineContent>
                                <Typography variant="body2" fontWeight="medium">
                                  {payment.type} - ${payment.amount}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Status: {payment.status.toUpperCase()}
                                </Typography>
                              </TimelineContent>
                            </TimelineItem>
                          ))}
                        </Timeline>
                      </Box>
                    )}
                  </Box>
                )}

                {dialogType === 'modify' && (
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="New Interest Rate (%)"
                          type="number"
                          value={modificationData.newInterestRate}
                          onChange={(e) => setModificationData({...modificationData, newInterestRate: e.target.value})}
                          inputProps={{ step: 0.1, min: 0, max: 30 }}
                          placeholder={selectedLoan.interestRate.toString()}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="New Loan Term (months)"
                          type="number"
                          value={modificationData.newTerm}
                          onChange={(e) => setModificationData({...modificationData, newTerm: e.target.value})}
                          inputProps={{ min: 1, max: 360 }}
                          placeholder={selectedLoan.loanTerm.toString()}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="New Monthly EMI ($)"
                          type="number"
                          value={modificationData.newEMI}
                          onChange={(e) => setModificationData({...modificationData, newEMI: e.target.value})}
                          inputProps={{ min: 0 }}
                          placeholder={selectedLoan.monthlyEMI.toFixed(2)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Reason for Modification"
                          multiline
                          rows={3}
                          value={modificationData.reason}
                          onChange={(e) => setModificationData({...modificationData, reason: e.target.value})}
                          placeholder="Enter reason for loan modification..."
                          required
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {dialogType === 'payment_history' && (
                  <Box>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedLoan.paymentHistory.map((payment, index) => (
                            <TableRow key={index}>
                              <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                              <TableCell>{payment.type}</TableCell>
                              <TableCell>${payment.amount}</TableCell>
                              <TableCell>
                                <Chip
                                  label={payment.status.toUpperCase()}
                                  color={payment.status === 'paid' ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {dialogType === 'early_settlement' && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Early settlement will close this loan account. The borrower will pay the settlement amount instead of remaining EMIs.
                    </Alert>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Settlement Amount ($)"
                          type="number"
                          value={modificationData.settlementAmount}
                          onChange={(e) => setModificationData({...modificationData, settlementAmount: e.target.value})}
                          inputProps={{ min: 0 }}
                          placeholder={selectedLoan.outstandingAmount.toString()}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Outstanding Amount: ${selectedLoan.outstandingAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Remaining EMIs: {selectedLoan.remainingTerm}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Settlement Reason"
                          multiline
                          rows={3}
                          value={modificationData.reason}
                          onChange={(e) => setModificationData({...modificationData, reason: e.target.value})}
                          placeholder="Enter reason for early settlement..."
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            {dialogType === 'modify' && (
              <Button onClick={handleLoanModification} variant="contained" color="primary">
                Modify Loan
              </Button>
            )}
            {dialogType === 'early_settlement' && (
              <Button onClick={handleEarlySettlement} variant="contained" color="success">
                Process Settlement
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
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

export default LoanPortfolio;