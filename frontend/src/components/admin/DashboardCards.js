import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  AccountBalance as BalanceIcon,
  Receipt as TransactionIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

const DashboardCards = ({ stats, loading = false, onCardClick }) => {
  const theme = useTheme();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number || 0);
  };

  const getChangeColor = (change) => {
    if (change > 0) return theme.palette.success.main;
    if (change < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUpIcon fontSize="small" />;
    if (change < 0) return <TrendingDownIcon fontSize="small" />;
    return null;
  };

  const cardData = [
    {
      title: 'Total Users',
      value: formatNumber(stats?.totalUsers || 0),
      change: stats?.userGrowth || 0,
      changeLabel: 'vs last month',
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    },
    {
      title: 'Active Users',
      value: formatNumber(stats?.activeUsers || 0),
      change: stats?.activeUserGrowth || 0,
      changeLabel: 'vs last week',
      icon: <CheckCircleIcon />,
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
    },
    {
      title: 'Total Balance',
      value: formatCurrency(stats?.totalBalance || 0),
      change: stats?.balanceChange || 0,
      changeLabel: 'vs yesterday',
      icon: <BalanceIcon />,
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
    },
    {
      title: 'Transactions Today',
      value: formatNumber(stats?.todayTransactions || 0),
      change: stats?.transactionGrowth || 0,
      changeLabel: 'vs yesterday',
      icon: <TransactionIcon />,
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
    },
    {
      title: 'Pending Transactions',
      value: formatNumber(stats?.pendingTransactions || 0),
      change: stats?.pendingChange || 0,
      changeLabel: 'vs last hour',
      icon: <ScheduleIcon />,
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    },
    {
      title: 'Security Alerts',
      value: formatNumber(stats?.securityAlerts || 0),
      change: stats?.alertChange || 0,
      changeLabel: 'vs last 24h',
      icon: <SecurityIcon />,
      color: stats?.securityAlerts > 0 ? theme.palette.error.main : theme.palette.success.main,
      gradient: stats?.securityAlerts > 0 
        ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
        : `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
    },
  ];

  const StatCard = ({ data, index }) => (
    <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'visible',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: onCardClick ? 'pointer' : 'default',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
        }}
        onClick={() => onCardClick && onCardClick(data.title)}
      >
        <CardContent sx={{ p: 3, pb: '16px !important' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: data.gradient,
                color: 'white',
                boxShadow: `0 4px 14px 0 ${data.color}40`,
              }}
            >
              {data.icon}
            </Avatar>
            <Tooltip title="More options">
              <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Title */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              mb: 1,
              fontSize: '0.875rem',
            }}
          >
            {data.title}
          </Typography>

          {/* Value */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: theme.palette.text.primary,
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
            }}
          >
            {loading ? (
              <Box sx={{ width: '80%', height: 28 }}>
                <LinearProgress />
              </Box>
            ) : (
              data.value
            )}
          </Typography>

          {/* Change indicator */}
          {!loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={getChangeIcon(data.change)}
                label={`${data.change > 0 ? '+' : ''}${data.change}%`}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: `${getChangeColor(data.change)}15`,
                  color: getChangeColor(data.change),
                  border: `1px solid ${getChangeColor(data.change)}30`,
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                {data.changeLabel}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cardData.map((data, index) => (
        <StatCard key={data.title} data={data} index={index} />
      ))}
    </Grid>
  );
};

// Additional component for system health cards
export const SystemHealthCards = ({ healthData, loading = false }) => {
  const theme = useTheme();

  const healthCards = [
    {
      title: 'System Status',
      status: healthData?.systemStatus || 'unknown',
      description: 'Overall system health',
      icon: <AnalyticsIcon />,
    },
    {
      title: 'Database',
      status: healthData?.databaseStatus || 'unknown',
      description: 'Database connectivity',
      icon: <BalanceIcon />,
    },
    {
      title: 'Security',
      status: healthData?.securityStatus || 'unknown',
      description: 'Security monitoring',
      icon: <SecurityIcon />,
    },
    {
      title: 'API Health',
      status: healthData?.apiStatus || 'unknown',
      description: 'API response time',
      icon: <CheckCircleIcon />,
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'good':
      case 'online':
        return theme.palette.success.main;
      case 'warning':
      case 'slow':
        return theme.palette.warning.main;
      case 'error':
      case 'offline':
      case 'critical':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'good':
      case 'online':
        return <CheckCircleIcon />;
      case 'warning':
      case 'slow':
        return <WarningIcon />;
      case 'error':
      case 'offline':
      case 'critical':
        return <WarningIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {healthCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={card.title}>
          <Card
            sx={{
              height: '100%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: `${getStatusColor(card.status)}15`,
                    color: getStatusColor(card.status),
                  }}
                >
                  {card.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.description}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {loading ? (
                  <LinearProgress sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                ) : (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: getStatusColor(card.status),
                      }}
                    >
                      {getStatusIcon(card.status)}
                    </Box>
                    <Chip
                      label={card.status.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(card.status)}15`,
                        color: getStatusColor(card.status),
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardCards;