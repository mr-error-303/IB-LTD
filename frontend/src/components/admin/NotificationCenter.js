import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Clear as ClearIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = ({ 
  notifications = [], 
  onClearAll, 
  onRemoveNotification,
  connectionStatus,
  isConnected 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type, severity) => {
    switch (type) {
      case 'security':
        return <SecurityIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'error';
      case 'medium':
      case 'warning':
        return 'warning';
      case 'low':
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Tooltip title={`Notifications (${isConnected ? 'Connected' : 'Disconnected'})`}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                minWidth: '18px',
                height: '18px'
              }
            }}
          >
            <NotificationsIcon />
          </Badge>
          {!isConnected && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'error.main',
                border: '1px solid white'
              }}
            />
          )}
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1,
            boxShadow: 3,
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="h2">
              Notifications
            </Typography>
            {notifications.length > 0 && (
              <Button
                size="small"
                startIcon={<ClearAllIcon />}
                onClick={onClearAll}
                color="primary"
              >
                Clear All
              </Button>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size="small"
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              {connectionStatus}
            </Typography>
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id || index}>
                <ListItem
                  sx={{
                    alignItems: 'flex-start',
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected'
                    }
                  }}
                >
                  <ListItemIcon sx={{ mt: 1 }}>
                    {getNotificationIcon(notification.type, notification.severity)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="body2" sx={{ fontWeight: notification.read ? 'normal' : 'medium' }}>
                          {notification.message}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => onRemoveNotification(notification.id)}
                          sx={{ ml: 1, mt: -0.5 }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            size="small"
                            label={notification.severity || 'info'}
                            color={getSeverityColor(notification.severity)}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {notification.timestamp ? 
                              formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true }) :
                              'Just now'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {!isConnected && (
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Alert severity="warning" size="small">
              Real-time notifications are currently unavailable. Please refresh the page to reconnect.
            </Alert>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationCenter;