import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminSecurity } from './AdminSecurityProvider';
import { adminAPI } from '../../services/api';
import './SystemStatistics.css';

const SystemStatistics = () => {
  const { user } = useAuth();
  const { performSecureOperation } = useAdminSecurity();
  const [statistics, setStatistics] = useState({
    users: {
      total: 0,
      active: 0,
      banned: 0,
      newThisMonth: 0,
      growthRate: 0
    },
    transactions: {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalTransfers: 0,
      depositAmount: 0,
      withdrawalAmount: 0,
      transferAmount: 0,
      netFlow: 0
    },
    system: {
      totalBalance: 0,
      pendingTransactions: 0,
      completedTransactions: 0,
      systemHealth: 'good'
    },
    growth: {
      userGrowth: [],
      transactionGrowth: [],
      revenueGrowth: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30'); // days
  const [refreshing, setRefreshing] = useState(false);

  // Fetch system statistics
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError('');

      await performSecureOperation('view_system_stats', async () => {
        const data = await adminAPI.getSystemStatistics(timeRange);
        setStatistics(data);
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  // Refresh statistics
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatistics();
    setRefreshing(false);
  };

  // Handle time range change
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatistics();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="system-statistics">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading system statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="system-statistics">
        <div className="error-container">
          <div className="error-message">
            <h3>Error Loading Statistics</h3>
            <p>{error}</p>
            <button onClick={fetchStatistics} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="system-statistics">
      {/* Header */}
      <div className="statistics-header">
        <div className="header-content">
          <h2>📊 System Statistics</h2>
          <p>Comprehensive overview of system performance and metrics</p>
        </div>
        <div className="header-actions">
          <div className="time-range-selector">
            <label>Time Range:</label>
            <select 
              value={timeRange} 
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="time-range-select"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <button 
            onClick={handleRefresh} 
            className={`btn btn-secondary ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            {refreshing ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="stats-section">
        <h3>👥 User Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <h4>{statistics.users.total.toLocaleString()}</h4>
              <p>Total Users</p>
              <div className="stat-change positive">
                +{statistics.users.newThisMonth} this month
              </div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h4>{statistics.users.active.toLocaleString()}</h4>
              <p>Active Users</p>
              <div className="stat-percentage">
                {((statistics.users.active / statistics.users.total) * 100).toFixed(1)}% of total
              </div>
            </div>
          </div>

          <div className="stat-card danger">
            <div className="stat-icon">🚫</div>
            <div className="stat-content">
              <h4>{statistics.users.banned.toLocaleString()}</h4>
              <p>Banned Users</p>
              <div className="stat-percentage">
                {((statistics.users.banned / statistics.users.total) * 100).toFixed(1)}% of total
              </div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h4>{statistics.users.growthRate > 0 ? '+' : ''}{statistics.users.growthRate.toFixed(1)}%</h4>
              <p>Growth Rate</p>
              <div className={`stat-change ${statistics.users.growthRate >= 0 ? 'positive' : 'negative'}`}>
                vs previous period
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Statistics */}
      <div className="stats-section">
        <h3>💰 Transaction Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card success">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <h4>{statistics.transactions.totalDeposits.toLocaleString()}</h4>
              <p>Total Deposits</p>
              <div className="stat-amount">
                ${statistics.transactions.depositAmount.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">💸</div>
            <div className="stat-content">
              <h4>{statistics.transactions.totalWithdrawals.toLocaleString()}</h4>
              <p>Total Withdrawals</p>
              <div className="stat-amount">
                ${statistics.transactions.withdrawalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <h4>{statistics.transactions.totalTransfers.toLocaleString()}</h4>
              <p>Total Transfers</p>
              <div className="stat-amount">
                ${statistics.transactions.transferAmount.toLocaleString()}
              </div>
            </div>
          </div>

          <div className={`stat-card ${statistics.transactions.netFlow >= 0 ? 'success' : 'danger'}`}>
            <div className="stat-icon">{statistics.transactions.netFlow >= 0 ? '📊' : '📉'}</div>
            <div className="stat-content">
              <h4>${Math.abs(statistics.transactions.netFlow).toLocaleString()}</h4>
              <p>Net Flow</p>
              <div className={`stat-change ${statistics.transactions.netFlow >= 0 ? 'positive' : 'negative'}`}>
                {statistics.transactions.netFlow >= 0 ? 'Positive' : 'Negative'} flow
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="stats-section">
        <h3>🔧 System Health</h3>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h4>${statistics.system.totalBalance.toLocaleString()}</h4>
              <p>Total System Balance</p>
              <div className="stat-change positive">
                Available funds
              </div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h4>{statistics.system.pendingTransactions.toLocaleString()}</h4>
              <p>Pending Transactions</p>
              <div className="stat-percentage">
                Awaiting approval
              </div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h4>{statistics.system.completedTransactions.toLocaleString()}</h4>
              <p>Completed Transactions</p>
              <div className="stat-percentage">
                Successfully processed
              </div>
            </div>
          </div>

          <div className={`stat-card ${
            statistics.system.systemHealth === 'good' ? 'success' : 
            statistics.system.systemHealth === 'warning' ? 'warning' : 'danger'
          }`}>
            <div className="stat-icon">
              {statistics.system.systemHealth === 'good' ? '💚' : 
               statistics.system.systemHealth === 'warning' ? '💛' : '❤️'}
            </div>
            <div className="stat-content">
              <h4>{statistics.system.systemHealth.toUpperCase()}</h4>
              <p>System Status</p>
              <div className="stat-change">
                All systems operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Charts Placeholder */}
      <div className="stats-section">
        <h3>📈 Growth Trends</h3>
        <div className="growth-charts">
          <div className="chart-placeholder">
            <div className="chart-icon">📊</div>
            <h4>User Growth</h4>
            <p>Interactive charts showing user registration trends over time</p>
            <div className="chart-data">
              <span>Peak: {Math.max(...(statistics.growth.userGrowth || [0]))} users/day</span>
            </div>
          </div>

          <div className="chart-placeholder">
            <div className="chart-icon">💹</div>
            <h4>Transaction Volume</h4>
            <p>Daily transaction volume and trends analysis</p>
            <div className="chart-data">
              <span>Peak: ${Math.max(...(statistics.growth.transactionGrowth || [0])).toLocaleString()}/day</span>
            </div>
          </div>

          <div className="chart-placeholder">
            <div className="chart-icon">💰</div>
            <h4>Revenue Growth</h4>
            <p>System revenue and fee collection over time</p>
            <div className="chart-data">
              <span>Peak: ${Math.max(...(statistics.growth.revenueGrowth || [0])).toLocaleString()}/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="stats-section">
        <h3>⚡ Quick Actions</h3>
        <div className="quick-actions">
          <button className="action-btn primary">
            📊 Generate Report
          </button>
          <button className="action-btn secondary">
            📤 Export Data
          </button>
          <button className="action-btn info">
            🔍 View Details
          </button>
          <button className="action-btn warning">
            ⚙️ System Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemStatistics;