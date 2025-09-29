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
  Tabs,
  Tab,
  Avatar,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Public as PublicIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Computer as ComputerIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  VpnLock as VpnIcon,
  Router as RouterIcon,
  Dns as DnsIcon,
  Language as LanguageIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  PlayArrow as EnableIcon,
  Pause as DisableIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const IPWhitelist = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ipAddresses, setIpAddresses] = useState([]);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIP, setSelectedIP] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    location: '',
    dateRange: '30d',
  });
  const [formData, setFormData] = useState({
    ipAddress: '',
    description: '',
    type: 'user',
    location: '',
    expiresAt: '',
    isActive: true,
  });
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkData, setBulkData] = useState('');

  // Fetch IP whitelist data
  const fetchIPAddresses = async () => {
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

      const response = await axios.get('/api/admin/security/ip-whitelist', { params });
      
      if (response.data.success) {
        setIpAddresses(response.data.data.ipAddresses);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching IP addresses:', error);
      setError('Failed to fetch IP whitelist data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPAddresses();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddNew = () => {
    setSelectedIP(null);
    setFormData({
      ipAddress: '',
      description: '',
      type: 'user',
      location: '',
      expiresAt: '',
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (ip) => {
    setSelectedIP(ip);
    setFormData({
      ipAddress: ip.ipAddress,
      description: ip.description || '',
      type: ip.type || 'user',
      location: ip.location || '',
      expiresAt: ip.expiresAt ? new Date(ip.expiresAt).toISOString().split('T')[0] : '',
      isActive: ip.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = (ip) => {
    setSelectedIP(ip);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      let response;
      if (selectedIP) {
        response = await axios.put(`/api/admin/security/ip-whitelist/${selectedIP.id}`, data);
      } else {
        response = await axios.post('/api/admin/security/ip-whitelist', data);
      }

      if (response.data.success) {
        setSuccess(selectedIP ? 'IP address updated successfully' : 'IP address added successfully');
        setDialogOpen(false);
        fetchIPAddresses();
      }
    } catch (error) {
      console.error('Error saving IP address:', error);
      setError(error.response?.data?.message || 'Failed to save IP address');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(`/api/admin/security/ip-whitelist/${selectedIP.id}`);
      if (response.data.success) {
        setSuccess('IP address deleted successfully');
        setDeleteDialogOpen(false);
        fetchIPAddresses();
      }
    } catch (error) {
      console.error('Error deleting IP address:', error);
      setError('Failed to delete IP address');
    }
  };

  const handleToggleStatus = async (ip) => {
    try {
      const response = await axios.patch(`/api/admin/security/ip-whitelist/${ip.id}/toggle`);
      if (response.data.success) {
        setSuccess(`IP address ${ip.isActive ? 'disabled' : 'enabled'} successfully`);
        fetchIPAddresses();
      }
    } catch (error) {
      console.error('Error toggling IP status:', error);
      setError('Failed to update IP status');
    }
  };

  const handleBulkImport = async () => {
    try {
      const ips = bulkData.split('\n').filter(line => line.trim());
      const response = await axios.post('/api/admin/security/ip-whitelist/bulk', { ips });
      
      if (response.data.success) {
        setSuccess(`Successfully imported ${response.data.data.imported} IP addresses`);
        setBulkImportOpen(false);
        setBulkData('');
        fetchIPAddresses();
      }
    } catch (error) {
      console.error('Error importing IPs:', error);
      setError('Failed to import IP addresses');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/admin/security/ip-whitelist/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ip-whitelist.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
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
    fetchIPAddresses();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'user': return <PersonIcon />;
      case 'admin': return <SecurityIcon />;
      case 'system': return <ComputerIcon />;
      case 'office': return <BusinessIcon />;
      case 'home': return <HomeIcon />;
      case 'vpn': return <VpnIcon />;
      case 'server': return <RouterIcon />;
      default: return <PublicIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'admin': return 'error';
      case 'system': return 'warning';
      case 'office': return 'info';
      case 'vpn': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive, expiresAt) => {
    if (!isActive) return 'error';
    if (expiresAt && new Date(expiresAt) < new Date()) return 'warning';
    return 'success';
  };

  const getStatusLabel = (isActive, expiresAt) => {
    if (!isActive) return 'Disabled';
    if (expiresAt && new Date(expiresAt) < new Date()) return 'Expired';
    return 'Active';
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'Never';
  };

  const isValidIP = (ip) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/;
    return ipRegex.test(ip);
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
          IP Whitelist Management
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
            startIcon={<UploadIcon />}
            onClick={() => setBulkImportOpen(true)}
          >
            Bulk Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
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
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Add IP
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total IPs
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.totalIPs || 0}
                  </Typography>
                </Box>
                <PublicIcon color="primary" sx={{ fontSize: 40 }} />
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
                    Active IPs
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats.activeIPs || 0}
                  </Typography>
                </Box>
                <CheckIcon color="success" sx={{ fontSize: 40 }} />
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
                    Expired IPs
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {stats.expiredIPs || 0}
                  </Typography>
                </Box>
                <WarningIcon color="warning" sx={{ fontSize: 40 }} />
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
                    Admin IPs
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {stats.adminIPs || 0}
                  </Typography>
                </Box>
                <SecurityIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      {filterOpen && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filter IP Addresses
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="office">Office</MenuItem>
                  <MenuItem value="home">Home</MenuItem>
                  <MenuItem value="vpn">VPN</MenuItem>
                  <MenuItem value="server">Server</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* IP Addresses Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>IP Address</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Added</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ipAddresses.map((ip) => (
                <TableRow key={ip.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getTypeIcon(ip.type)}
                      </Avatar>
                      <Typography variant="subtitle2" fontFamily="monospace">
                        {ip.ipAddress}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ip.type}
                      color={getTypeColor(ip.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {ip.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        {ip.location || 'Unknown'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(ip.isActive, ip.expiresAt)}
                      color={getStatusColor(ip.isActive, ip.expiresAt)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(ip.expiresAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(ip.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(ip)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={ip.isActive ? "Disable" : "Enable"}>
                        <IconButton
                          size="small"
                          color={ip.isActive ? "warning" : "success"}
                          onClick={() => handleToggleStatus(ip)}
                        >
                          {ip.isActive ? <DisableIcon /> : <EnableIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(ip)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
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
          count={stats.totalIPs || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedIP ? 'Edit IP Address' : 'Add IP Address'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="IP Address"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, ipAddress: e.target.value }))}
                  placeholder="192.168.1.1 or 192.168.1.0/24"
                  error={formData.ipAddress && !isValidIP(formData.ipAddress)}
                  helperText={formData.ipAddress && !isValidIP(formData.ipAddress) ? "Invalid IP address format" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    label="Type"
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="office">Office</MenuItem>
                    <MenuItem value="home">Home</MenuItem>
                    <MenuItem value="vpn">VPN</MenuItem>
                    <MenuItem value="server">Server</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., New York Office"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expires At"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave empty for no expiration"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.ipAddress || !isValidIP(formData.ipAddress)}
          >
            {selectedIP ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the IP address "{selectedIP?.ipAddress}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog
        open={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bulk Import IP Addresses</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Enter IP addresses, one per line. Supports both individual IPs and CIDR notation.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder="192.168.1.1&#10;10.0.0.0/24&#10;172.16.1.100"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkImportOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkImport}
            disabled={!bulkData.trim()}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IPWhitelist;