import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import DataTable from './DataTable';
import { 
  Visibility as ViewIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AccountBalance as BalanceIcon
} from '@mui/icons-material';
import './UserList.css';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    isActive: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 0, // 0-based indexing for DataTable
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Fetch users with current filters
  const fetchUsers = async (page = 0) => { // 0-based for internal use
    try {
      setLoading(true);
      const params = {
        page: page + 1, // Convert to 1-based for API
        limit: itemsPerPage,
        ...filters
      };
      
      const response = await adminAPI.getAllUsers(params);
      
      if (response.success) {
        setUsers(response.data.users);
        setPagination({
          ...response.data.pagination,
          currentPage: page // Keep 0-based internally
        });
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 0 })); // Reset to first page
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(0); // Reset to first page
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      role: '',
      isActive: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, currentPage: 0 })); // Reset to first page
  };

  // DataTable pagination handlers
  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    fetchUsers(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setItemsPerPage(newRowsPerPage);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchUsers(0);
  };

  // DataTable columns configuration
  const userColumns = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 170,
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.name}</div>
          {row.phone && <div style={{ fontSize: '0.75rem', color: '#666' }}>{row.phone}</div>}
        </div>
      )
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200
    },
    {
      id: 'role',
      label: 'Role',
      minWidth: 100,
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          backgroundColor: value === 'admin' ? '#fecaca' : '#dbeafe',
          color: value === 'admin' ? '#dc2626' : '#1e40af'
        }}>
          {value}
        </span>
      )
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'capitalize',
          backgroundColor: value === 'approved' ? '#dcfce7' : value === 'pending' ? '#fef3c7' : '#fecaca',
          color: value === 'approved' ? '#166534' : value === 'pending' ? '#92400e' : '#dc2626'
        }}>
          {value}
        </span>
      )
    },
    {
      id: 'balance',
      label: 'Balance',
      minWidth: 150,
      render: (value, row) => (
        row.accountNumber ? (
          <div>
            <div style={{ fontWeight: 600, color: '#059669' }}>
              ${row.balance?.toFixed(2) || '0.00'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'monospace' }}>
              {row.accountNumber}
            </div>
          </div>
        ) : (
          <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No Account</span>
        )
      )
    },
    {
      id: 'isActive',
      label: 'Active',
      minWidth: 100,
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: value ? '#dcfce7' : '#fecaca',
          color: value ? '#166534' : '#dc2626'
        }}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 120,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  // DataTable actions
  const userActions = [
    {
      label: 'View Details',
      icon: <ViewIcon />,
      onClick: (row) => navigate(`/admin/users/${row.id}`)
    },
    {
      label: 'Edit',
      icon: <EditIcon />,
      onClick: (row) => {
        // Handle edit user
        console.log('Edit user:', row);
      }
    },
    {
      label: 'Delete',
      icon: <DeleteIcon />,
      onClick: (row) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
          // Handle delete user
          console.log('Delete user:', row);
        }
      },
      color: 'error'
    }
  ];

  // Load users on component mount and filter changes
  useEffect(() => {
    fetchUsers(pagination.currentPage);
  }, [filters]);

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <button className="btn btn-secondary">Export Users</button>
          <button className="btn btn-primary">Add New User</button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </div>
        </form>

        <div className="filter-controls">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
            className="filter-select"
          >
            <option value="">All Users</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy, sortOrder }));
            }}
            className="filter-select"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="balance-desc">Highest Balance</option>
            <option value="balance-asc">Lowest Balance</option>
          </select>

          <button 
            onClick={clearFilters}
            className="btn btn-outline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Users DataTable */}
      <DataTable
        title="Users"
        data={users}
        columns={userColumns}
        loading={loading}
        error={error}
        serverSide={true}
        page={pagination.currentPage}
        rowsPerPage={itemsPerPage}
        totalCount={pagination.totalUsers}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        actions={userActions}
        selectable={true}
        searchable={false} // We handle search through filters
        sortable={false} // We handle sorting through filters
        dense={true}
        stickyHeader={true}
        maxHeight={600}
      />
    </div>
  );
};

export default UserList;