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
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
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
  Send as SendIcon,
  Print as PrintIcon,
  CloudDownload as CloudDownloadIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Gavel as GavelIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const LoanDisbursement = () => {
  const [approvedLoans, setApprovedLoans] = useState([]);
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
  const [disbursementData, setDisbursementData] = useState({
    disbursementDate: new Date(),
    bankAccount: '',
    processingFee: '',
    notes: ''
  });
  const [activeStep, setActiveStep] = useState(0);

  // Sample approved loans ready for disbursement
  const sampleApprovedLoans = [
    {
      id: 'LA001',
      applicantName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      loanAmount: 50000,
      approvedAmount: 50000,
      interestRate: 8.5,
      loanTerm: 240,
      monthlyEMI: 389.64,
      processingFee: 1000,
      loanPurpose: 'Home Purchase',
      approvalDate: '2024-01-20',
      status: 'approved',
      bankAccount: '****1234',
      creditScore: 750,
      riskLevel: 'low',
      disbursementStatus: 'pending',
      agreementGenerated: false,
      emiScheduleGenerated: false
    },
    {
      id: 'LA002',
      applicantName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0124',
      loanAmount: 25000,
      approvedAmount: 22000,
      interestRate: 12.0,
      loanTerm: 60,
      monthlyEMI: 489.58,
      processingFee: 500,
      loanPurpose: 'Business Expansion',
      approvalDate: '2024-01-19',
      status: 'approved',
      bankAccount: '****5678',
      creditScore: 680,
      riskLevel: 'medium',
      disbursementStatus: 'ready',
      agreementGenerated: true,
      emiScheduleGenerated: true
    },
    {
      id: 'LA003',
      applicantName: 'Michael Brown',
      email: 'mike.brown@email.com',
      phone: '+1-555-0125',
      loanAmount: 15000,
      approvedAmount: 12000,
      interestRate: 15.0,
      loanTerm: 84,
      monthlyEMI: 187.88,
      processingFee: 300,
      loanPurpose: 'Education',
      approvalDate: '2024-01-18',
      status: 'approved',
      bankAccount: '****9012',
      creditScore: 620,
      riskLevel: 'high',
      disbursementStatus: 'disbursed',
      agreementGenerated: true,
      emiScheduleGenerated: true,
      disbursementDate: '2024-01-21'
    }
  ];

  useEffect(() => {
    fetchApprovedLoans();
  }, []);

  const fetchApprovedLoans = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setApprovedLoans(sampleApprovedLoans);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError('Failed to fetch approved loans');
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
    setActiveStep(0);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogType('');
    setActiveStep(0);
    setDisbursementData({
      disbursementDate: new Date(),
      bankAccount: '',
      processingFee: '',
      notes: ''
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const generateEMISchedule = async () => {
    try {
      // Simulate EMI schedule generation
      const updatedLoans = approvedLoans.map(loan => 
        loan.id === selectedLoan.id 
          ? { ...loan, emiScheduleGenerated: true }
          : loan
      );
      setApprovedLoans(updatedLoans);
      setSnackbar({
        open: true,
        message: 'EMI schedule generated successfully',
        severity: 'success'
      });
      handleNext();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to generate EMI schedule',
        severity: 'error'
      });
    }
  };

  const generateLoanAgreement = async () => {
    try {
      // Simulate loan agreement generation
      const updatedLoans = approvedLoans.map(loan => 
        loan.id === selectedLoan.id 
          ? { ...loan, agreementGenerated: true }
          : loan
      );
      setApprovedLoans(updatedLoans);
      setSnackbar({
        open: true,
        message: 'Loan agreement generated successfully',
        severity: 'success'
      });
      handleNext();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to generate loan agreement',
        severity: 'error'
      });
    }
  };

  const processDisbursement = async () => {
    try {
      // Simulate disbursement processing
      const updatedLoans = approvedLoans.map(loan => 
        loan.id === selectedLoan.id 
          ? { 
              ...loan, 
              disbursementStatus: 'disbursed',
              disbursementDate: disbursementData.disbursementDate.toISOString().split('T')[0]
            }
          : loan
      );
      setApprovedLoans(updatedLoans);
      setSnackbar({
        open: true,
        message: 'Loan disbursed successfully',
        severity: 'success'
      });
      handleDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to disburse loan',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'ready': return 'info';
      case 'disbursed': return 'success';
      case 'failed': return 'error';
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

  const filteredLoans = approvedLoans.filter(loan => {
    const matchesSearch = loan.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.disbursementStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedLoans = filteredLoans.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const totalPendingDisbursement = approvedLoans.filter(loan => loan.disbursementStatus === 'pending').length;
  const totalReadyForDisbursement = approvedLoans.filter(loan => loan.disbursementStatus === 'ready').length;
  const totalDisbursed = approvedLoans.filter(loan => loan.disbursementStatus === 'disbursed').length;
  const totalDisbursementAmount = approvedLoans
    .filter(loan => loan.disbursementStatus === 'disbursed')
    .reduce((sum, loan) => sum + loan.approvedAmount, 0);

  const disbursementSteps = [
    'Generate EMI Schedule',
    'Generate Loan Agreement',
    'Process Disbursement'
  ];

  if (loading && approvedLoans.length === 0) {
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
          Loan Disbursement
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Disbursement Statistics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Pending Disbursement
                    </Typography>
                    <Typography variant="h4" component="div" color="warning.main">
                      {totalPendingDisbursement}
                    </Typography>
                  </Box>
                  <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
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
                      Ready to Disburse
                    </Typography>
                    <Typography variant="h4" component="div" color="info.main">
                      {totalReadyForDisbursement}
                    </Typography>
                  </Box>
                  <WalletIcon color="info" sx={{ fontSize: 40 }} />
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
                      Disbursed
                    </Typography>
                    <Typography variant="h4" component="div" color="success.main">
                      {totalDisbursed}
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
                      Total Disbursed
                    </Typography>
                    <Typography variant="h4" component="div">
                      ${totalDisbursementAmount.toLocaleString()}
                    </Typography>
                  </Box>
                  <MoneyIcon color="primary" sx={{ fontSize: 40 }} />
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
                placeholder="Search approved loans..."
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
                <InputLabel>Disbursement Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Disbursement Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="ready">Ready</MenuItem>
                  <MenuItem value="disbursed">Disbursed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchApprovedLoans}
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

        {/* Approved Loans Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Loan ID</TableCell>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Approved Amount</TableCell>
                  <TableCell>Interest Rate</TableCell>
                  <TableCell>Monthly EMI</TableCell>
                  <TableCell>Bank Account</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Approval Date</TableCell>
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
                          {loan.applicantName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {loan.applicantName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {loan.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        ${loan.approvedAmount.toLocaleString()}
                      </Typography>
                      {loan.loanAmount !== loan.approvedAmount && (
                        <Typography variant="caption" color="textSecondary">
                          (Requested: ${loan.loanAmount.toLocaleString()})
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {loan.interestRate}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ${loan.monthlyEMI.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {loan.bankAccount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={loan.disbursementStatus.toUpperCase()}
                        color={getStatusColor(loan.disbursementStatus)}
                        size="small"
                      />
                      <Box sx={{ mt: 0.5 }}>
                        {loan.emiScheduleGenerated && (
                          <Chip
                            label="EMI Schedule"
                            size="small"
                            variant="outlined"
                            color="success"
                            sx={{ mr: 0.5, fontSize: '0.7rem' }}
                          />
                        )}
                        {loan.agreementGenerated && (
                          <Chip
                            label="Agreement"
                            size="small"
                            variant="outlined"
                            color="success"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(loan.approvalDate).toLocaleDateString()}
                      </Typography>
                      {loan.disbursementDate && (
                        <Typography variant="caption" color="success.main">
                          Disbursed: {new Date(loan.disbursementDate).toLocaleDateString()}
                        </Typography>
                      )}
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
          <MenuItem onClick={() => handleDialogOpen('disburse')}>
            <SendIcon fontSize="small" sx={{ mr: 1 }} />
            Process Disbursement
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('emi_schedule')}>
            <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
            View EMI Schedule
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('agreement')}>
            <GavelIcon fontSize="small" sx={{ mr: 1 }} />
            View Agreement
          </MenuItem>
        </Menu>

        {/* Disbursement Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {dialogType === 'view' && 'Loan Details'}
            {dialogType === 'disburse' && 'Process Loan Disbursement'}
            {dialogType === 'emi_schedule' && 'EMI Schedule'}
            {dialogType === 'agreement' && 'Loan Agreement'}
          </DialogTitle>
          <DialogContent>
            {selectedLoan && (
              <>
                {dialogType === 'view' && (
                  <Box>
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
                            <Typography>Requested Amount:</Typography>
                            <Typography>${selectedLoan.loanAmount.toLocaleString()}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Approved Amount:</Typography>
                            <Typography color="success.main" fontWeight="bold">
                              ${selectedLoan.approvedAmount.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Interest Rate:</Typography>
                            <Typography>{selectedLoan.interestRate}%</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Loan Term:</Typography>
                            <Typography>{selectedLoan.loanTerm} months</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Monthly EMI:</Typography>
                            <Typography fontWeight="bold">${selectedLoan.monthlyEMI.toFixed(2)}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Processing Fee:</Typography>
                            <Typography>${selectedLoan.processingFee}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Applicant Information
                        </Typography>
                        <Stack spacing={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon fontSize="small" />
                            <Typography>{selectedLoan.applicantName}</Typography>
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
                            <BankIcon fontSize="small" />
                            <Typography>Account: {selectedLoan.bankAccount}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CreditScoreIcon fontSize="small" />
                            <Typography>Credit Score: {selectedLoan.creditScore}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <WorkIcon fontSize="small" />
                            <Typography>Purpose: {selectedLoan.loanPurpose}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {dialogType === 'disburse' && (
                  <Box>
                    <Stepper activeStep={activeStep} orientation="vertical">
                      <Step>
                        <StepLabel>Generate EMI Schedule</StepLabel>
                        <StepContent>
                          <Typography>
                            Generate the EMI payment schedule for the approved loan amount of ${selectedLoan.approvedAmount.toLocaleString()} 
                            with {selectedLoan.interestRate}% interest rate over {selectedLoan.loanTerm} months.
                          </Typography>
                          <Box sx={{ mb: 2, mt: 2 }}>
                            <Button
                              variant="contained"
                              onClick={generateEMISchedule}
                              sx={{ mt: 1, mr: 1 }}
                              disabled={selectedLoan.emiScheduleGenerated}
                            >
                              {selectedLoan.emiScheduleGenerated ? 'Schedule Generated' : 'Generate Schedule'}
                            </Button>
                            {selectedLoan.emiScheduleGenerated && (
                              <Button onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
                                Continue
                              </Button>
                            )}
                          </Box>
                        </StepContent>
                      </Step>
                      <Step>
                        <StepLabel>Generate Loan Agreement</StepLabel>
                        <StepContent>
                          <Typography>
                            Generate the legal loan agreement document with all terms and conditions 
                            for the borrower to sign.
                          </Typography>
                          <Box sx={{ mb: 2, mt: 2 }}>
                            <Button
                              variant="contained"
                              onClick={generateLoanAgreement}
                              sx={{ mt: 1, mr: 1 }}
                              disabled={selectedLoan.agreementGenerated}
                            >
                              {selectedLoan.agreementGenerated ? 'Agreement Generated' : 'Generate Agreement'}
                            </Button>
                            {selectedLoan.agreementGenerated && (
                              <>
                                <Button onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
                                  Continue
                                </Button>
                                <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                                  Back
                                </Button>
                              </>
                            )}
                          </Box>
                        </StepContent>
                      </Step>
                      <Step>
                        <StepLabel>Process Disbursement</StepLabel>
                        <StepContent>
                          <Typography gutterBottom>
                            Transfer the approved loan amount to the borrower's bank account.
                          </Typography>
                          <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} md={6}>
                              <DatePicker
                                label="Disbursement Date"
                                value={disbursementData.disbursementDate}
                                onChange={(newValue) => setDisbursementData({
                                  ...disbursementData,
                                  disbursementDate: newValue
                                })}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Bank Account"
                                value={disbursementData.bankAccount}
                                onChange={(e) => setDisbursementData({
                                  ...disbursementData,
                                  bankAccount: e.target.value
                                })}
                                placeholder={selectedLoan.bankAccount}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Disbursement Notes"
                                multiline
                                rows={3}
                                value={disbursementData.notes}
                                onChange={(e) => setDisbursementData({
                                  ...disbursementData,
                                  notes: e.target.value
                                })}
                                placeholder="Enter any notes for this disbursement..."
                              />
                            </Grid>
                          </Grid>
                          <Box sx={{ mb: 2, mt: 2 }}>
                            <Button
                              variant="contained"
                              onClick={processDisbursement}
                              sx={{ mt: 1, mr: 1 }}
                              color="success"
                            >
                              Disburse ${selectedLoan.approvedAmount.toLocaleString()}
                            </Button>
                            <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                              Back
                            </Button>
                          </Box>
                        </StepContent>
                      </Step>
                    </Stepper>
                  </Box>
                )}

                {dialogType === 'emi_schedule' && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      EMI Schedule for Loan ID: {selectedLoan.id} - ${selectedLoan.approvedAmount.toLocaleString()} 
                      at {selectedLoan.interestRate}% for {selectedLoan.loanTerm} months
                    </Alert>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>EMI No.</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>EMI Amount</TableCell>
                            <TableCell>Principal</TableCell>
                            <TableCell>Interest</TableCell>
                            <TableCell>Balance</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* Sample EMI schedule rows */}
                          {[1, 2, 3, 4, 5].map((emi) => (
                            <TableRow key={emi}>
                              <TableCell>{emi}</TableCell>
                              <TableCell>
                                {new Date(2024, 1 + emi, 15).toLocaleDateString()}
                              </TableCell>
                              <TableCell>${selectedLoan.monthlyEMI.toFixed(2)}</TableCell>
                              <TableCell>${(selectedLoan.monthlyEMI * 0.7).toFixed(2)}</TableCell>
                              <TableCell>${(selectedLoan.monthlyEMI * 0.3).toFixed(2)}</TableCell>
                              <TableCell>
                                ${(selectedLoan.approvedAmount - (emi * selectedLoan.monthlyEMI * 0.7)).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button variant="outlined" startIcon={<PrintIcon />}>
                        Print Schedule
                      </Button>
                      <Button variant="outlined" startIcon={<CloudDownloadIcon />}>
                        Download PDF
                      </Button>
                    </Box>
                  </Box>
                )}

                {dialogType === 'agreement' && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Loan Agreement for {selectedLoan.applicantName} - Loan ID: {selectedLoan.id}
                    </Alert>
                    <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                      <Typography variant="h6" gutterBottom align="center">
                        LOAN AGREEMENT
                      </Typography>
                      <Typography variant="body2" paragraph>
                        This Loan Agreement ("Agreement") is entered into between IB LTD ("Lender") 
                        and {selectedLoan.applicantName} ("Borrower") on {new Date().toLocaleDateString()}.
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Loan Details:</strong><br/>
                        • Loan Amount: ${selectedLoan.approvedAmount.toLocaleString()}<br/>
                        • Interest Rate: {selectedLoan.interestRate}% per annum<br/>
                        • Loan Term: {selectedLoan.loanTerm} months<br/>
                        • Monthly EMI: ${selectedLoan.monthlyEMI.toFixed(2)}<br/>
                        • Processing Fee: ${selectedLoan.processingFee}<br/>
                        • Purpose: {selectedLoan.loanPurpose}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Terms and Conditions:</strong><br/>
                        1. The borrower agrees to repay the loan in equal monthly installments.<br/>
                        2. Late payment charges will apply for overdue payments.<br/>
                        3. The lender reserves the right to recall the loan in case of default.<br/>
                        4. This agreement is governed by applicable banking laws.
                      </Typography>
                    </Paper>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button variant="outlined" startIcon={<PrintIcon />}>
                        Print Agreement
                      </Button>
                      <Button variant="outlined" startIcon={<CloudDownloadIcon />}>
                        Download PDF
                      </Button>
                      <Button variant="contained" startIcon={<SendIcon />}>
                        Send to Borrower
                      </Button>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Close</Button>
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

export default LoanDisbursement;