import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Shield as ShieldIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const RoleManagement = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [],
    isActive: true
  });
  const [stats, setStats] = useState({
    totalRoles: 0,
    activeRoles: 0,
    totalUsers: 0
  });

  // Available permissions
  const availablePermissions = [
    { id: 'user_management', name: 'User Management', description: 'Create, edit, delete users' },
    { id: 'user_view', name: 'View Users', description: 'View user information' },
    { id: 'transaction_management', name: 'Transaction Management', description: 'Manage transactions' },
    { id: 'transaction_view', name: 'View Transactions', description: 'View transaction history' },
    { id: 'role_management', name: 'Role Management', description: 'Manage user roles' },
    { id: 'system_monitoring', name: 'System Monitoring', description: 'Monitor system activities' },
    { id: 'security_management', name: 'Security Management', description: 'Manage security settings' },
    { id: 'financial_operations', name: 'Financial Operations', description: 'Handle financial operations' },
    { id: 'reporting', name: 'Reporting', description: 'Generate and view reports' },
    { id: 'system_config', name: 'System Configuration', description: 'Configure system settings' },
    { id: 'user_export', name: 'Export Users', description: 'Export user data' },
    { id: 'transaction_export', name: 'Export Transactions', description: 'Export transaction data' },
    { id: 'activity_logs', name: 'Activity Logs', description: 'View activity logs' },
    { id: 'bulk_operations', name: 'Bulk Operations', description: 'Perform bulk operations' },
  ];

  // Fetch roles data
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/roles');
      
      if (response.data.success) {
        setRoles(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to fetch roles data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch role statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/roles/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchStats();
  }, []);

  const handleMenuOpen = (event, role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleDialogOpen = (type, role = null) => {
    setDialogType(type);
    setDialogOpen(true);
    
    if (role) {
      setSelectedRole(role);
      setRoleForm({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || [],
        isActive: role.isActive !== false
      });
    } else {
      setRoleForm({
        name: '',
        description: '',
        permissions: [],
        isActive: true
      });
    }
    
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogType('');
    setSelectedRole(null);
    setRoleForm({
      name: '',
      description: '',
      permissions: [],
      isActive: true
    });
  };

  const handleFormChange = (field, value) => {
    setRoleForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (permissionId, checked) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const handleSaveRole = async () => {
    try {
      const endpoint = selectedRole 
        ? `/api/admin/roles/${selectedRole.id}`
        : '/api/admin/roles';
      
      const method = selectedRole ? 'PUT' : 'POST';
      
      const response = await axios[method.toLowerCase()](endpoint, roleForm);
      
      if (response.data.success) {
        fetchRoles();
        fetchStats();
        handleDialogClose();
      }
    } catch (error) {
      console.error('Error saving role:', error);
      setError('Failed to save role');
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      const response = await axios.delete(`/api/admin/roles/${selectedRole.id}`);
      
      if (response.data.success) {
        fetchRoles();
        fetchStats();
        handleDialogClose();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      setError('Failed to delete role');
    }
  };

  const getRoleIcon = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return <AdminIcon color="error" />;
      case 'manager':
        return <SecurityIcon color="warning" />;
      case 'user':
        return <PeopleIcon color="primary" />;
      default:
        return <ShieldIcon color="action" />;
    }
  };

  const getPermissionsByCategory = () => {
    const categories = {
      'User Management': availablePermissions.filter(p => p.id.includes('user')),
      'Transaction Management': availablePermissions.filter(p => p.id.includes('transaction')),
      'Security & Monitoring': availablePermissions.filter(p => 
        p.id.includes('security') || p.id.includes('monitoring') || p.id.includes('activity')
      ),
      'System & Configuration': availablePermissions.filter(p => 
        p.id.includes('system') || p.id.includes('config') || p.id.includes('role')
      ),
      'Operations & Reporting': availablePermissions.filter(p => 
        p.id.includes('reporting') || p.id.includes('export') || p.id.includes('bulk') || p.id.includes('financial')
      ),
    };
    return categories;
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
          Role Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen('add')}
        >
          Create Role
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Roles
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.totalRoles}
                  </Typography>
                </Box>
                <AssignmentIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Active Roles
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats.activeRoles}
                  </Typography>
                </Box>
                <CheckIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.totalUsers}
                  </Typography>
                </Box>
                <PeopleIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Roles Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      {getRoleIcon(role.name)}
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {role.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {role.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {role.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {(role.permissions || []).slice(0, 3).map((permission) => (
                        <Chip
                          key={permission}
                          label={permission.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {(role.permissions || []).length > 3 && (
                        <Chip
                          label={`+${(role.permissions || []).length - 3} more`}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {role.userCount || 0} users
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={role.isActive !== false ? 'Active' : 'Inactive'}
                      color={role.isActive !== false ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, role)}
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
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDialogOpen('edit', selectedRole)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Role
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('delete')} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Role
        </MenuItem>
      </Menu>

      {/* Role Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'add' && 'Create New Role'}
          {dialogType === 'edit' && 'Edit Role'}
          {dialogType === 'delete' && 'Delete Role'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <Typography>
              Are you sure you want to delete the role "{selectedRole?.name}"? 
              This action cannot be undone and will affect {selectedRole?.userCount || 0} users.
            </Typography>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Role Name"
                    value={roleForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={roleForm.isActive}
                        onChange={(e) => handleFormChange('isActive', e.target.checked)}
                      />
                    }
                    label="Active Role"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={roleForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Permissions
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                    <Box key={category} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {category}
                      </Typography>
                      <FormGroup>
                        <Grid container spacing={1}>
                          {permissions.map((permission) => (
                            <Grid item xs={12} sm={6} key={permission.id}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={roleForm.permissions.includes(permission.id)}
                                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                      {permission.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {permission.description}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </FormGroup>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          {dialogType === 'delete' ? (
            <Button
              onClick={handleDeleteRole}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          ) : (
            <Button
              onClick={handleSaveRole}
              variant="contained"
              disabled={!roleForm.name.trim()}
            >
              {dialogType === 'add' ? 'Create' : 'Save'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;