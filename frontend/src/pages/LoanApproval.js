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
  Rating,
  Slider
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
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  QuestionMark as RequestInfoIcon,
  FilePresent as FileIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  DirectionsCar as CarIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';

const LoanApproval = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [approvalData, setApprovalData] = useState({
    approvedAmount: '',
    interestRate: '',
    loanTerm: '',
    processingFee: '',
    conditions: '',
    rejectionReason: '',
    requestedInfo: ''
  });

  // Sample loan applications
  const sampleApplications = [
    {
      id: 'LA001',
      applicantName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      age: 35,
      occupation: 'Software Engineer',
      monthlyIncome: 8500,
      loanAmount: 50000,
      loanPurpose: 'Home Purchase',
      loanTerm: 240,
      creditScore: 750,
      riskLevel: 'low',
      status: 'pending',
      applicationDate: '2024-01-15',
      documents: ['ID Proof', 'Income Certificate', 'Bank Statements', 'Property Documents'],
      employmentHistory: '5 years at TechCorp',
      existingLoans: 1,
      totalDebt: 15000,
      collateral: 'Property worth $75,000',
      guarantor: 'Available',
      bankAccount: '****1234',
      address: '123 Main St, City, State',
      maritalStatus: 'Married',
      dependents: 2
    },
    {
      id: 'LA002',
      applicantName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0124',
      age: 28,
      occupation: 'Business Owner',
      monthlyIncome: 6200,
      loanAmount: 25000,
      loanPurpose: 'Business Expansion',
      loanTerm: 60,
      creditScore: 680,
      riskLevel: 'medium',
      status: 'pending',
      applicationDate: '2024-01-14',
      documents: ['ID Proof', 'Business License', 'Tax Returns', 'Financial Statements'],
      employmentHistory: '3 years business owner',
      existingLoans: 0,
      totalDebt: 5000,
      collateral: 'Business assets worth $30,000',
      guarantor: 'Not available',
      bankAccount: '****5678',
      address: '456 Business Ave, City, State',
      maritalStatus: 'Single',
      dependents: 0
    },
    {
      id: 'LA003',
      applicantName: 'Michael Brown',
      email: 'mike.brown@email.com',
      phone: '+1-555-0125',
      age: 22,
      occupation: 'Student',
      monthlyIncome: 2500,
      loanAmount: 15000,
      loanPurpose: 'Education',
      loanTerm: 84,
      creditScore: 620,
      riskLevel: 'high',
      status: 'pending',
      applicationDate: '2024-01-13',
      documents: ['ID Proof', 'Student ID', 'Admission Letter', 'Parent Income Proof'],
      employmentHistory: 'Part-time job 1 year',
      existingLoans: 0,
      totalDebt: 2000,
      collateral: 'None',
      guarantor: 'Parent as guarantor',
      bankAccount: '****9012',
      address: '789 College St, City, State',
      maritalStatus: 'Single',
      dependents: 0
    },
    {
      id: 'LA004',
      applicantName: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1-555-0126',
      age: 42,
      occupation: 'Doctor',
      monthlyIncome: 12000,
      loanAmount: 80000,
      loanPurpose: 'Medical Equipment',
      loanTerm: 120,
      creditScore: 820,
      riskLevel: 'low',
      status: 'under_review',
      applicationDate: '2024-01-12',
      documents: ['ID Proof', 'Medical License', 'Income Certificate', 'Clinic Registration'],
      employmentHistory: '15 years medical practice',
      existingLoans: 2,
      totalDebt: 45000,
      collateral: 'Clinic property worth $150,000',
      guarantor: 'Not required',
      bankAccount: '****3456',
      address: '321 Medical Center, City, State',
      maritalStatus: 'Married',
      dependents: 3
    }
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setApplications(sampleApplications);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError('Failed to fetch loan applications');
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

  const handleMenuOpen = (event, application) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApplication(null);
  };

  const handleDialogOpen = (type) => {
    setDialogType(type);
    setDialogOpen(true);
    if (type === 'approve' && selectedApplication) {
      setApprovalData({
        ...approvalData,
        approvedAmount: selectedApplication.loanAmount.toString(),
        interestRate: getRecommendedInterestRate(selectedApplication.creditScore).toString(),
        loanTerm: selectedApplication.loanTerm.toString(),
        processingFee: Math.round(selectedApplication.loanAmount * 0.02).toString()
      });
    }
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogType('');
    setApprovalData({
      approvedAmount: '',
      interestRate: '',
      loanTerm: '',
      processingFee: '',
      conditions: '',
      rejectionReason: '',
      requestedInfo: ''
    });
  };

  const getRecommendedInterestRate = (creditScore) => {
    if (creditScore >= 750) return 8.5;
    if (creditScore >= 700) return 10.0;
    if (creditScore >= 650) return 12.5;
    return 15.0;
  };

  const handleApprove = async () => {
    try {
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: 'approved' }
          : app
      );
      setApplications(updatedApplications);
      setSnackbar({
        open: true,
        message: `Loan application ${selectedApplication.id} approved successfully`,
        severity: 'success'
      });
      handleDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to approve loan application',
        severity: 'error'
      });
    }
  };

  const handleReject = async () => {
    try {
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: 'rejected' }
          : app
      );
      setApplications(updatedApplications);
      setSnackbar({
        open: true,
        message: `Loan application ${selectedApplication.id} rejected`,
        severity: 'info'
      });
      handleDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to reject loan application',
        severity: 'error'
      });
    }
  };

  const handleRequestInfo = async () => {
    try {
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: 'info_requested' }
          : app
      );
      setApplications(updatedApplications);
      setSnackbar({
        open: true,
        message: `Information requested for application ${selectedApplication.id}`,
        severity: 'info'
      });
      handleDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to request information',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'under_review': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'info_requested': return 'secondary';
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

  const getPurposeIcon = (purpose) => {
    switch (purpose.toLowerCase()) {
      case 'home purchase': return <HomeIcon />;
      case 'business expansion': return <BusinessIcon />;
      case 'education': return <SchoolIcon />;
      case 'car loan': return <CarIcon />;
      case 'medical equipment': return <MedicalIcon />;
      default: return <MoneyIcon />;
    }
  };

  const calculateDebtToIncomeRatio = (totalDebt, monthlyIncome) => {
    return ((totalDebt / (monthlyIncome * 12)) * 100).toFixed(1);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || app.riskLevel === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const paginatedApplications = filteredApplications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const totalPending = applications.filter(app => app.status === 'pending').length;
  const totalUnderReview = applications.filter(app => app.status === 'under_review').length;
  const totalApproved = applications.filter(app => app.status === 'approved').length;
  const totalRejected = applications.filter(app => app.status === 'rejected').length;

  if (loading && applications.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Loan Application Approval
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Application Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pending Review
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {totalPending}
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
                    Under Review
                  </Typography>
                  <Typography variant="h4" component="div" color="info.main">
                    {totalUnderReview}
                  </Typography>
                </Box>
                <AssessmentIcon color="info" sx={{ fontSize: 40 }} />
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
                    Approved
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {totalApproved}
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
                    Rejected
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {totalRejected}
                  </Typography>
                </Box>
                <CancelIcon color="error" sx={{ fontSize: 40 }} />
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
              placeholder="Search applications..."
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
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="info_requested">Info Requested</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={riskFilter}
                label="Risk Level"
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <MenuItem value="all">All Risk</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchApplications}
              fullWidth
            >
              Refresh
            </Button>
          </Grid>
          <Grid item xs={12} md={1}>
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

      {/* Applications Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Application ID</TableCell>
                <TableCell>Applicant</TableCell>
                <TableCell>Loan Details</TableCell>
                <TableCell>Credit Score</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Application Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedApplications.map((application) => (
                <TableRow key={application.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {application.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {application.applicantName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {application.applicantName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {application.email}
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                          {application.occupation}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      {getPurposeIcon(application.loanPurpose)}
                      <Typography variant="body2" fontWeight="medium">
                        ${application.loanAmount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {application.loanPurpose}
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                      {application.loanTerm} months
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {application.creditScore}
                      </Typography>
                      {application.creditScore >= 750 ? (
                        <TrendingUpIcon color="success" fontSize="small" />
                      ) : application.creditScore >= 650 ? (
                        <TrendingUpIcon color="warning" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="error" fontSize="small" />
                      )}
                    </Box>
                    <Rating
                      value={Math.min(5, Math.max(1, Math.floor(application.creditScore / 150)))}
                      readOnly
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={application.riskLevel.toUpperCase()}
                      color={getRiskColor(application.riskLevel)}
                      size="small"
                    />
                    <Typography variant="caption" display="block" color="textSecondary">
                      DTI: {calculateDebtToIncomeRatio(application.totalDebt, application.monthlyIncome)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={application.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(application.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(application.applicationDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, application)}
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
          count={filteredApplications.length}
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
        <MenuItem onClick={() => handleDialogOpen('approve')}>
          <ApproveIcon fontSize="small" sx={{ mr: 1 }} />
          Approve
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('reject')}>
          <RejectIcon fontSize="small" sx={{ mr: 1 }} />
          Reject
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('request_info')}>
          <RequestInfoIcon fontSize="small" sx={{ mr: 1 }} />
          Request Info
        </MenuItem>
      </Menu>

      {/* Application Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'view' && 'Application Details'}
          {dialogType === 'approve' && 'Approve Loan Application'}
          {dialogType === 'reject' && 'Reject Loan Application'}
          {dialogType === 'request_info' && 'Request Additional Information'}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <>
              {dialogType === 'view' && (
                <Box>
                  <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="Personal Info" />
                    <Tab label="Financial Info" />
                    <Tab label="Loan Details" />
                    <Tab label="Documents" />
                  </Tabs>

                  {tabValue === 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>
                            Personal Information
                          </Typography>
                          <Stack spacing={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PersonIcon fontSize="small" />
                              <Typography>{selectedApplication.applicantName}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <EmailIcon fontSize="small" />
                              <Typography>{selectedApplication.email}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PhoneIcon fontSize="small" />
                              <Typography>{selectedApplication.phone}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <HomeIcon fontSize="small" />
                              <Typography>{selectedApplication.address}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Age:</Typography>
                              <Typography>{selectedApplication.age} years</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Marital Status:</Typography>
                              <Typography>{selectedApplication.maritalStatus}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Dependents:</Typography>
                              <Typography>{selectedApplication.dependents}</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>
                            Employment Information
                          </Typography>
                          <Stack spacing={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <WorkIcon fontSize="small" />
                              <Typography>{selectedApplication.occupation}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Monthly Income:</Typography>
                              <Typography fontWeight="bold" color="success.main">
                                ${selectedApplication.monthlyIncome.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Employment History:</Typography>
                              <Typography>{selectedApplication.employmentHistory}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Bank Account:</Typography>
                              <Typography>{selectedApplication.bankAccount}</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {tabValue === 1 && (
                    <Box sx={{ mt: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>
                            Credit Information
                          </Typography>
                          <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography>Credit Score:</Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="h5" fontWeight="bold">
                                  {selectedApplication.creditScore}
                                </Typography>
                                <Chip
                                  label={selectedApplication.riskLevel.toUpperCase()}
                                  color={getRiskColor(selectedApplication.riskLevel)}
                                  size="small"
                                />
                              </Box>
                            </Box>
                            <Box>
                              <Typography gutterBottom>Credit Score Rating</Typography>
                              <Rating
                                value={Math.min(5, Math.max(1, Math.floor(selectedApplication.creditScore / 150)))}
                                readOnly
                              />
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Existing Loans:</Typography>
                              <Typography>{selectedApplication.existingLoans}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Total Debt:</Typography>
                              <Typography>${selectedApplication.totalDebt.toLocaleString()}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Debt-to-Income Ratio:</Typography>
                              <Typography>
                                {calculateDebtToIncomeRatio(selectedApplication.totalDebt, selectedApplication.monthlyIncome)}%
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>
                            Security Information
                          </Typography>
                          <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Collateral:</Typography>
                              <Typography>{selectedApplication.collateral}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Guarantor:</Typography>
                              <Typography>{selectedApplication.guarantor}</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {tabValue === 2 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Loan Request Details
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Loan Amount:</Typography>
                              <Typography variant="h6" color="primary.main">
                                ${selectedApplication.loanAmount.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Loan Purpose:</Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                {getPurposeIcon(selectedApplication.loanPurpose)}
                                <Typography>{selectedApplication.loanPurpose}</Typography>
                              </Box>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Loan Term:</Typography>
                              <Typography>{selectedApplication.loanTerm} months</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Recommended Interest Rate:</Typography>
                              <Typography color="warning.main">
                                {getRecommendedInterestRate(selectedApplication.creditScore)}%
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={2}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Application Date:</Typography>
                              <Typography>
                                {new Date(selectedApplication.applicationDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Processing Fee (2%):</Typography>
                              <Typography>
                                ${Math.round(selectedApplication.loanAmount * 0.02).toLocaleString()}
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                              <Typography>Estimated Monthly EMI:</Typography>
                              <Typography fontWeight="bold">
                                ${((selectedApplication.loanAmount * (getRecommendedInterestRate(selectedApplication.creditScore) / 100 / 12)) / (1 - Math.pow(1 + (getRecommendedInterestRate(selectedApplication.creditScore) / 100 / 12), -selectedApplication.loanTerm))).toFixed(2)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {tabValue === 3 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Supporting Documents
                      </Typography>
                      <List>
                        {selectedApplication.documents.map((doc, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={doc}
                              secondary="Verified"
                            />
                            <ListItemSecondaryAction>
                              <IconButton edge="end">
                                <ViewIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}

              {dialogType === 'approve' && (
                <Box>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Approving loan application for {selectedApplication.applicantName}
                  </Alert>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Approved Amount"
                        type="number"
                        value={approvalData.approvedAmount}
                        onChange={(e) => setApprovalData({
                          ...approvalData,
                          approvedAmount: e.target.value
                        })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Interest Rate"
                        type="number"
                        value={approvalData.interestRate}
                        onChange={(e) => setApprovalData({
                          ...approvalData,
                          interestRate: e.target.value
                        })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Loan Term"
                        type="number"
                        value={approvalData.loanTerm}
                        onChange={(e) => setApprovalData({
                          ...approvalData,
                          loanTerm: e.target.value
                        })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">months</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Processing Fee"
                        type="number"
                        value={approvalData.processingFee}
                        onChange={(e) => setApprovalData({
                          ...approvalData,
                          processingFee: e.target.value
                        })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Approval Conditions"
                        multiline
                        rows={4}
                        value={approvalData.conditions}
                        onChange={(e) => setApprovalData({
                          ...approvalData,
                          conditions: e.target.value
                        })}
                        placeholder="Enter any conditions for loan approval..."
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {dialogType === 'reject' && (
                <Box>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    Rejecting loan application for {selectedApplication.applicantName}
                  </Alert>
                  <TextField
                    fullWidth
                    label="Rejection Reason"
                    multiline
                    rows={6}
                    value={approvalData.rejectionReason}
                    onChange={(e) => setApprovalData({
                      ...approvalData,
                      rejectionReason: e.target.value
                    })}
                    placeholder="Please provide detailed reason for rejection..."
                    required
                  />
                </Box>
              )}

              {dialogType === 'request_info' && (
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Requesting additional information from {selectedApplication.applicantName}
                  </Alert>
                  <TextField
                    fullWidth
                    label="Information Required"
                    multiline
                    rows={6}
                    value={approvalData.requestedInfo}
                    onChange={(e) => setApprovalData({
                      ...approvalData,
                      requestedInfo: e.target.value
                    })}
                    placeholder="Specify what additional information is needed..."
                    required
                  />
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          {dialogType === 'approve' && (
            <Button
              onClick={handleApprove}
              variant="contained"
              color="success"
              startIcon={<ApproveIcon />}
            >
              Approve Loan
            </Button>
          )}
          {dialogType === 'reject' && (
            <Button
              onClick={handleReject}
              variant="contained"
              color="error"
              startIcon={<RejectIcon />}
              disabled={!approvalData.rejectionReason.trim()}
            >
              Reject Application
            </Button>
          )}
          {dialogType === 'request_info' && (
            <Button
              onClick={handleRequestInfo}
              variant="contained"
              color="info"
              startIcon={<RequestInfoIcon />}
              disabled={!approvalData.requestedInfo.trim()}
            >
              Request Information
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
  );
};

export default LoanApproval;