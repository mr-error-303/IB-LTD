import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as BalanceIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AllUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    pending: 0
  });

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          role: filterRole !== 'all' ? filterRole : undefined,
        }
      });

      if (response.data.success) {
        setUsers(response.data.data.users || []);
        setTotalUsers(response.data.data.pagination?.totalUsers || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/users/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page, rowsPerPage, searchTerm, filterStatus, filterRole]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleDialogOpen = (type) => {
    setDialogType(type);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogType('');
    setSelectedUser(null);
  };

  const handleUserAction = async (action) => {
    if (!selectedUser) return;

    try {
      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'block':
          endpoint = `/api/admin/users/${selectedUser.id}/ban`;
          break;
        case 'unblock':
          endpoint = `/api/admin/users/${selectedUser.id}/unban`;
          break;
        case 'delete':
          endpoint = `/api/admin/users/${selectedUser.id}`;
          method = 'DELETE';
          break;
        default:
          return;
      }

      const response = await axios[method.toLowerCase()](endpoint);
      
      if (response.data.success) {
        fetchUsers();
        fetchStats();
        handleDialogClose();
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      setError(`Failed to ${action} user`);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'blocked': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance || 0);
  };

  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        User Management
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
                    Total Users
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.total}
                  </Typography>
                </Box>
                <PersonIcon color="primary" sx={{ fontSize: 40 }} />
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
                    Active Users
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats.active}
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
                    Blocked Users
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {stats.blocked}
                  </Typography>
                </Box>
                <BlockIcon color="error" sx={{ fontSize: 40 }} />
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
                    Pending Users
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {stats.pending}
                  </Typography>
                </Box>
                <CalendarIcon color="warning" sx={{ fontSize: 40 }} />
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filterRole}
                label="Role"
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleDialogOpen('add')}
              >
                Add User
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {/* Export functionality */}}
              >
                Export
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {user.username?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {user.username}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="action" />
                      {user.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      {user.phone || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status || 'Active'}
                      color={getStatusColor(user.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role || 'User'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BalanceIcon fontSize="small" color="action" />
                      {formatBalance(user.balance)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {formatDate(user.createdAt || new Date())}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, user)}
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
          count={totalUsers}
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
        <MenuItem onClick={() => handleDialogOpen('edit')}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('block')}>
          <BlockIcon fontSize="small" sx={{ mr: 1 }} />
          {selectedUser?.status === 'blocked' ? 'Unblock' : 'Block'} User
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('delete')} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {dialogType === 'delete' && 'Delete User'}
          {dialogType === 'block' && (selectedUser?.status === 'blocked' ? 'Unblock User' : 'Block User')}
          {dialogType === 'edit' && 'Edit User'}
          {dialogType === 'add' && 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {dialogType === 'delete' && `Are you sure you want to delete ${selectedUser?.username}? This action cannot be undone.`}
            {dialogType === 'block' && selectedUser?.status === 'blocked' && `Are you sure you want to unblock ${selectedUser?.username}?`}
            {dialogType === 'block' && selectedUser?.status !== 'blocked' && `Are you sure you want to block ${selectedUser?.username}?`}
            {dialogType === 'edit' && 'Edit user functionality will be implemented here.'}
            {dialogType === 'add' && 'Add new user functionality will be implemented here.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          {(dialogType === 'delete' || dialogType === 'block') && (
            <Button
              onClick={() => handleUserAction(dialogType === 'block' ? (selectedUser?.status === 'blocked' ? 'unblock' : 'block') : 'delete')}
              color={dialogType === 'delete' ? 'error' : 'primary'}
              variant="contained"
            >
              {dialogType === 'delete' && 'Delete'}
              {dialogType === 'block' && (selectedUser?.status === 'blocked' ? 'Unblock' : 'Block')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllUsers;