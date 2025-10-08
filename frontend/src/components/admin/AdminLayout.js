import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
  Alert,
  Collapse,
  Switch,
  FormControlLabel,
} from '@mui/material';
import NotificationCenter from './NotificationCenter';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Receipt as TransactionIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings as AdminIcon,
  Shield as ShieldIcon,
  History as HistoryIcon,
  Group as GroupIcon,
  Warning as WarningIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const AdminLayout = ({ 
  children, 
  title = "Admin Dashboard",
  notifications = [],
  onClearNotifications,
  onRemoveNotification,
  connectionStatus = "Disconnected",
  isConnected = false,
  darkMode, 
  onToggleDarkMode 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [securityExpanded, setSecurityExpanded] = useState(false);
  const [managementExpanded, setManagementExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  // Navigation items
  const navigationItems = [
    {
      title: 'Overview',
      icon: <DashboardIcon />,
      path: '/admin',
      exact: true,
    },
    {
      title: 'User Management',
      icon: <PeopleIcon />,
      children: [
        { title: 'All Users', path: '/admin/users', icon: <GroupIcon /> },
        { title: 'Role Management', path: '/admin/roles', icon: <AdminIcon /> },
        { title: 'Activity Logs', path: '/admin/activity', icon: <HistoryIcon /> },
      ],
    },
    {
      title: 'Loan Management',
      icon: <AccountBalanceIcon />,
      children: [
        { title: 'Loan Applications', path: '/admin/loans/applications', icon: <AssignmentIcon /> },
        { title: 'Loan Approval', path: '/admin/loans/approval', icon: <CheckCircleIcon /> },
        { title: 'Loan Disbursement', path: '/admin/loans/disbursement', icon: <PaymentIcon /> },
        { title: 'Loan Portfolio', path: '/admin/loans/portfolio', icon: <AccountBalanceWalletIcon /> },
      ],
    },
    {
      title: 'Transactions',
      icon: <TransactionIcon />,
      path: '/admin/transactions',
    },
    {
      title: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/admin/analytics',
    },
    {
      title: 'Security',
      icon: <SecurityIcon />,
      children: [
        { title: 'Security Alerts', path: '/admin/security/alerts', icon: <WarningIcon /> },
        { title: 'Security Overview', path: '/admin/security', icon: <ShieldIcon /> },
        { title: 'Anomaly Detection', path: '/admin/security/anomalies', icon: <WarningIcon /> },
        { title: 'IP Whitelist', path: '/admin/security/ip-whitelist', icon: <SecurityIcon /> },
        { title: '2FA Management', path: '/admin/security/2fa', icon: <SecurityIcon /> },
      ],
    },
    {
      title: 'System Configuration',
      icon: <SettingsIcon />,
      path: '/admin/system-config',
    },
    {
      title: 'Notification Management',
      icon: <NotificationsIcon />,
      path: '/admin/notifications',
    },
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      children: [
        { title: 'Profile Settings', path: '/admin/settings/profile', icon: <AccountIcon /> },
        { title: 'Security Settings', path: '/admin/settings/security', icon: <SecurityIcon /> },
        { title: 'System Settings', path: '/admin/settings', icon: <SettingsIcon /> },
      ],
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout(() => {
      navigate('/login', { replace: true });
    });
    handleProfileMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const renderNavigationItem = (item, level = 0, keyPrefix = '') => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = item.title === 'User Management' ? managementExpanded : 
                     item.title === 'Security' ? securityExpanded : 
                     item.title === 'Settings' ? settingsExpanded : false;
    const isActive = item.path ? isActiveRoute(item.path, item.exact) : false;

    if (hasChildren) {
      return (
        <React.Fragment key={keyPrefix || item.title}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                if (item.title === 'User Management') {
                  setManagementExpanded(!managementExpanded);
                } else if (item.title === 'Security') {
                  setSecurityExpanded(!securityExpanded);
                } else if (item.title === 'Settings') {
                  setSettingsExpanded(!settingsExpanded);
                }
              }}
              sx={{
                pl: 2 + level * 2,
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.text.secondary,
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child, index) => renderNavigationItem(child, level + 1, `${item.title}-child-${index}`))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItem key={keyPrefix || item.title} disablePadding>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          sx={{
            pl: 2 + level * 2,
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            backgroundColor: isActive ? theme.palette.primary.main + '15' : 'transparent',
            borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
            '&:hover': {
              backgroundColor: isActive 
                ? theme.palette.primary.main + '25' 
                : theme.palette.action.hover,
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
              minWidth: 40,
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem',
            }}
          >
            IB
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
              IB LTD
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admin Dashboard
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: theme.palette.primary.main,
              fontSize: '0.875rem',
            }}
          >
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
              {user?.username || 'Admin'}
            </Typography>
            <Chip
              label={user?.role?.name || 'Administrator'}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {navigationItems.map((item, index) => renderNavigationItem(item, 0, `nav-item-${index}`))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={onToggleDarkMode}
              size="small"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {darkMode ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
              <Typography variant="caption">
                {darkMode ? 'Dark' : 'Light'} Mode
              </Typography>
            </Box>
          }
          sx={{ margin: 0 }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>

          <NotificationCenter
            notifications={notifications}
            onClearAll={onClearNotifications}
            onRemoveNotification={onRemoveNotification}
            connectionStatus={connectionStatus}
            isConnected={isConnected}
          />

          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={onToggleDarkMode}
                color="default"
              />
            }
            label={<DarkModeIcon />}
            sx={{ mr: 2, ml: 1 }}
          />

          {/* Profile Menu */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
      >
        <MenuItem onClick={() => navigate('/admin/profile')}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          Profile Settings
        </MenuItem>
        <MenuItem onClick={() => navigate('/admin/security/2fa')}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          Security Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;