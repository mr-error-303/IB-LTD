import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [roleDialog, setRoleDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Form states
  const [roleForm, setRoleForm] = useState({
    name: '',
    level: 1,
    permissions: {
      user_management: [],
      transaction_management: [],
      financial_operations: [],
      system_monitoring: [],
      content_management: [],
      security_operations: []
    }
  });
  
  const [assignForm, setAssignForm] = useState({
    userId: '',
    roleId: '',
    email: '',
    name: ''
  });

  // Permission definitions
  const permissionCategories = {
    user_management: [
      'view_users', 'create_users', 'edit_users', 'delete_users', 
      'ban_users', 'unban_users', 'manage_balances'
    ],
    transaction_management: [
      'view_transactions', 'approve_transactions', 'reject_transactions',
      'create_transactions', 'edit_transactions', 'delete_transactions'
    ],
    financial_operations: [
      'view_financial_reports', 'export_financial_data', 'manage_fees',
      'process_withdrawals', 'process_deposits'
    ],
    system_monitoring: [
      'view_logs', 'view_alerts', 'manage_alerts', 'view_statistics',
      'export_data', 'manage_system'
    ],
    content_management: [
      'manage_announcements', 'manage_notifications', 'manage_settings'
    ],
    security_operations: [
      'manage_roles', 'view_security_logs', 'manage_permissions',
      'force_logout', 'manage_sessions'
    ]
  };

  useEffect(() => {
    fetchRoles();
    fetchSubAdmins();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await adminAPI.get('/roles');
      setRoles(response.data.roles || []);
    } catch (err) {
      setError('Failed to fetch roles');
    }
  };

  const fetchSubAdmins = async () => {
    try {
      const response = await adminAPI.get('/users?role=sub_admin');
      setSubAdmins(response.data.users || []);
    } catch (err) {
      setError('Failed to fetch sub-admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      await adminAPI.post('/roles', roleForm);
      setSuccess('Role created successfully');
      setRoleDialog(false);
      resetRoleForm();
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create role');
    }
  };

  const handleUpdateRole = async () => {
    try {
      await adminAPI.put(`/roles/${selectedRole._id}`, roleForm);
      setSuccess('Role updated successfully');
      setRoleDialog(false);
      resetRoleForm();
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await adminAPI.delete(`/roles/${roleId}`);
        setSuccess('Role deleted successfully');
        fetchRoles();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete role');
      }
    }
  };

  const handleAssignRole = async () => {
    try {
      await adminAPI.post('/roles/assign', assignForm);
      setSuccess('Role assigned successfully');
      setAssignDialog(false);
      resetAssignForm();
      fetchSubAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign role');
    }
  };

  const handleRevokeRole = async (userId) => {
    if (window.confirm('Are you sure you want to revoke this role?')) {
      try {
        await adminAPI.post('/roles/revoke', { userId });
        setSuccess('Role revoked successfully');
        fetchSubAdmins();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to revoke role');
      }
    }
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      level: 1,
      permissions: {
        user_management: [],
        transaction_management: [],
        financial_operations: [],
        system_monitoring: [],
        content_management: [],
        security_operations: []
      }
    });
    setSelectedRole(null);
  };

  const resetAssignForm = () => {
    setAssignForm({
      userId: '',
      roleId: '',
      email: '',
      name: ''
    });
  };

  const openRoleDialog = (role = null) => {
    if (role) {
      setSelectedRole(role);
      setRoleForm({
        name: role.name,
        level: role.level,
        permissions: role.permissions
      });
    } else {
      resetRoleForm();
    }
    setRoleDialog(true);
  };

  const handlePermissionChange = (category, permission, checked) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: checked
          ? [...prev.permissions[category], permission]
          : prev.permissions[category].filter(p => p !== permission)
      }
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading role management...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Roles Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" display="flex" alignItems="center">
                  <SecurityIcon sx={{ mr: 1 }} />
                  Admin Roles
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => openRoleDialog()}
                >
                  Create Role
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Role Name</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>Permissions</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role._id}>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>{role.level}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${Object.values(role.permissions).flat().length} permissions`}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit Role">
                            <IconButton onClick={() => openRoleDialog(role)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Role">
                            <IconButton onClick={() => handleDeleteRole(role._id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sub-Admins Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" display="flex" alignItems="center">
                  <GroupIcon sx={{ mr: 1 }} />
                  Sub-Admins
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AdminIcon />}
                  onClick={() => setAssignDialog(true)}
                >
                  Assign Role
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subAdmins.map((admin) => (
                      <TableRow key={admin._id}>
                        <TableCell>{admin.name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={admin.adminRole?.name || 'No Role'}
                            size="small"
                            color={admin.adminRole ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Revoke Role">
                            <IconButton onClick={() => handleRevokeRole(admin._id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Role Creation/Edit Dialog */}
      <Dialog open={roleDialog} onClose={() => setRoleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role Name"
                value={roleForm.name}
                onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Role Level"
                value={roleForm.level}
                onChange={(e) => setRoleForm(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Permissions</Typography>
              {Object.entries(permissionCategories).map(([category, permissions]) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', mb: 1 }}>
                    {category.replace('_', ' ')}
                  </Typography>
                  <FormGroup row>
                    {permissions.map((permission) => (
                      <FormControlLabel
                        key={permission}
                        control={
                          <Checkbox
                            checked={roleForm.permissions[category]?.includes(permission) || false}
                            onChange={(e) => handlePermissionChange(category, permission, e.target.checked)}
                          />
                        }
                        label={permission.replace('_', ' ')}
                      />
                    ))}
                  </FormGroup>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog(false)}>Cancel</Button>
          <Button 
            onClick={selectedRole ? handleUpdateRole : handleCreateRole}
            variant="contained"
          >
            {selectedRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Assignment Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Role to User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User Email"
                value={assignForm.email}
                onChange={(e) => setAssignForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User Name"
                value={assignForm.name}
                onChange={(e) => setAssignForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Role</InputLabel>
                <Select
                  value={assignForm.roleId}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, roleId: e.target.value }))}
                >
                  {roles.map((role) => (
                    <MenuItem key={role._id} value={role._id}>
                      {role.name} (Level {role.level})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignRole} variant="contained">
            Assign Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;