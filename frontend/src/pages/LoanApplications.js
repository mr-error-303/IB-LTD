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
  LinearProgress
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
  CreditScore as CreditScoreIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const LoanApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [approvalData, setApprovalData] = useState({
    interestRate: '',
    loanTerm: '',
    monthlyEMI: '',
    processingFee: '',
    conditions: '',
    rejectionReason: '',
    requestedInfo: ''
  });

  // Sample loan applications data
  const sampleApplications = [
    {
      id: 'LA001',
      applicantName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      loanAmount: 50000,
      loanPurpose: 'Home Purchase',
      creditScore: 750,
      monthlyIncome: 8000,
      employmentType: 'Full-time',
      employer: 'Tech Corp Inc.',
      address: '123 Main St, City, State 12345',
      status: 'pending',
      applicationDate: '2024-01-15',
      documents: ['Income Certificate', 'Bank Statements', 'ID Proof', 'Property Documents'],
      riskLevel: 'low',
      loanTerm: 240, // months
      collateral: 'Property worth $75,000'
    },
    {
      id: 'LA002',
      applicantName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0124',
      loanAmount: 25000,
      loanPurpose: 'Business Expansion',
      creditScore: 680,
      monthlyIncome: 5500,
      employmentType: 'Self-employed',
      employer: 'Johnson Consulting',
      address: '456 Oak Ave, City, State 12346',
      status: 'under_review',
      applicationDate: '2024-01-14',
      documents: ['Business License', 'Tax Returns', 'Bank Statements', 'Business Plan'],
      riskLevel: 'medium',
      loanTerm: 60,
      collateral: 'Business assets worth $35,000'
    },
    {
      id: 'LA003',
      applicantName: 'Michael Brown',
      email: 'mike.brown@email.com',
      phone: '+1-555-0125',
      loanAmount: 15000,
      loanPurpose: 'Education',
      creditScore: 620,
      monthlyIncome: 3200,
      employmentType: 'Part-time',
      employer: 'Local Store',
      address: '789 Pine St, City, State 12347',
      status: 'pending',
      applicationDate: '2024-01-13',
      documents: ['Admission Letter', 'Income Proof', 'ID Proof'],
      riskLevel: 'high',
      loanTerm: 84,
      collateral: 'None'
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
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogType('');
    setApprovalData({
      interestRate: '',
      loanTerm: '',
      monthlyEMI: '',
      processingFee: '',
      conditions: '',
      rejectionReason: '',
      requestedInfo: ''
    });
  };

  const handleApproval = async () => {
    try {
      // Simulate API call for approval
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: 'approved' }
          : app
      );
      setApplications(updatedApplications);
      setSnackbar({
        open: true,
        message: 'Loan application approved successfully',
        severity: 'success'
      });
      handleDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to approve application',
        severity: 'error'
      });
    }
  };

  const handleRejection = async () => {
    try {
      // Simulate API call for rejection
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: 'rejected' }
          : app
      );
      setApplications(updatedApplications);
      setSnackbar({
        open: true,
        message: 'Loan application rejected',
        severity: 'info'
      });
      handleDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to reject application',
        severity: 'error'
      });
    }
  };

  const handleRequestInfo = async () => {
    try {
      // Simulate API call for requesting more info
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: 'info_requested' }
          : app
      );
      setApplications(updatedApplications);
      setSnackbar({
        open: true,
        message: 'Information request sent to applicant',
        severity: 'info'
      });
      handleDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send information request',
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

  const getCreditScoreColor = (score) => {
    if (score >= 750) return 'success';
    if (score >= 650) return 'warning';
    return 'error';
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedApplications = filteredApplications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading && applications.length === 0) {
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
          Loan Applications
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Applications
                    </Typography>
                    <Typography variant="h4" component="div">
                      {applications.length}
                    </Typography>
                  </Box>
                  <DocumentIcon color="primary" sx={{ fontSize: 40 }} />
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
                      Pending Review
                    </Typography>
                    <Typography variant="h4" component="div" color="warning.main">
                      {applications.filter(app => app.status === 'pending').length}
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
                      Approved
                    </Typography>
                    <Typography variant="h4" component="div" color="success.main">
                      {applications.filter(app => app.status === 'approved').length}
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
                      Total Amount
                    </Typography>
                    <Typography variant="h4" component="div">
                      ${applications.reduce((sum, app) => sum + app.loanAmount, 0).toLocaleString()}
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
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchApplications}
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

        {/* Applications Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Application ID</TableCell>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Loan Amount</TableCell>
                  <TableCell>Purpose</TableCell>
                  <TableCell>Credit Score</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
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
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ${application.loanAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {application.loanPurpose}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={application.creditScore}
                        color={getCreditScoreColor(application.creditScore)}
                        size="small"
                        icon={<CreditScoreIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={application.riskLevel.toUpperCase()}
                        color={getRiskColor(application.riskLevel)}
                        size="small"
                        variant="outlined"
                      />
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
            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
            Approve
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('reject')}>
            <CancelIcon fontSize="small" sx={{ mr: 1 }} />
            Reject
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen('request_info')}>
            <InfoIcon fontSize="small" sx={{ mr: 1 }} />
            Request Info
          </MenuItem>
        </Menu>

        {/* Application Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          maxWidth="md"
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
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Applicant Information
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
                          <Box display="flex" alignItems="center" gap={1}>
                            <WorkIcon fontSize="small" />
                            <Typography>{selectedApplication.employer} ({selectedApplication.employmentType})</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Loan Details
                        </Typography>
                        <Stack spacing={2}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Loan Amount:</Typography>
                            <Typography fontWeight="bold">${selectedApplication.loanAmount.toLocaleString()}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Purpose:</Typography>
                            <Typography>{selectedApplication.loanPurpose}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Credit Score:</Typography>
                            <Chip
                              label={selectedApplication.creditScore}
                              color={getCreditScoreColor(selectedApplication.creditScore)}
                              size="small"
                            />
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Monthly Income:</Typography>
                            <Typography>${selectedApplication.monthlyIncome.toLocaleString()}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Risk Level:</Typography>
                            <Chip
                              label={selectedApplication.riskLevel.toUpperCase()}
                              color={getRiskColor(selectedApplication.riskLevel)}
                              size="small"
                            />
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Collateral:</Typography>
                            <Typography>{selectedApplication.collateral}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                          Documents Submitted
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {selectedApplication.documents.map((doc, index) => (
                            <Chip
                              key={index}
                              label={doc}
                              icon={<DocumentIcon />}
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {dialogType === 'approve' && (
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Interest Rate (%)"
                          type="number"
                          value={approvalData.interestRate}
                          onChange={(e) => setApprovalData({...approvalData, interestRate: e.target.value})}
                          inputProps={{ step: 0.1, min: 0, max: 30 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Loan Term (months)"
                          type="number"
                          value={approvalData.loanTerm}
                          onChange={(e) => setApprovalData({...approvalData, loanTerm: e.target.value})}
                          inputProps={{ min: 1, max: 360 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Monthly EMI ($)"
                          type="number"
                          value={approvalData.monthlyEMI}
                          onChange={(e) => setApprovalData({...approvalData, monthlyEMI: e.target.value})}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Processing Fee ($)"
                          type="number"
                          value={approvalData.processingFee}
                          onChange={(e) => setApprovalData({...approvalData, processingFee: e.target.value})}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Terms and Conditions"
                          multiline
                          rows={4}
                          value={approvalData.conditions}
                          onChange={(e) => setApprovalData({...approvalData, conditions: e.target.value})}
                          placeholder="Enter any specific terms and conditions for this loan..."
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {dialogType === 'reject' && (
                  <Box>
                    <TextField
                      fullWidth
                      label="Rejection Reason"
                      multiline
                      rows={4}
                      value={approvalData.rejectionReason}
                      onChange={(e) => setApprovalData({...approvalData, rejectionReason: e.target.value})}
                      placeholder="Please provide a detailed reason for rejection..."
                      required
                    />
                  </Box>
                )}

                {dialogType === 'request_info' && (
                  <Box>
                    <TextField
                      fullWidth
                      label="Information Request"
                      multiline
                      rows={4}
                      value={approvalData.requestedInfo}
                      onChange={(e) => setApprovalData({...approvalData, requestedInfo: e.target.value})}
                      placeholder="Specify what additional information is needed from the applicant..."
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
              <Button onClick={handleApproval} variant="contained" color="success">
                Approve Loan
              </Button>
            )}
            {dialogType === 'reject' && (
              <Button onClick={handleRejection} variant="contained" color="error">
                Reject Application
              </Button>
            )}
            {dialogType === 'request_info' && (
              <Button onClick={handleRequestInfo} variant="contained" color="info">
                Send Request
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

export default LoanApplications;