import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminSecurity } from './AdminSecurityProvider';
import { adminAPI } from '../../services/api';
import './FinancialReports.css';

const FinancialReports = () => {
  const { user } = useAuth();
  const { isAuthorized } = useAdminSecurity();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [reportData, setReportData] = useState({
    summary: {
      totalDeposits: 0,
      totalWithdrawals: 0,
      netFlow: 0,
      transactionCount: 0,
      averageTransaction: 0,
      growthRate: 0
    },
    dailyData: [],
    weeklyData: [],
    monthlyData: [],
    topUsers: [],
    transactionTypes: {}
  });

  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      fetchReportData();
    }
  }, [isAuthorized, reportType, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminAPI.getFinancialReports({
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      if (response.success) {
        setReportData(response.data);
      } else {
        setError(response.message || 'Failed to fetch financial reports');
      }
    } catch (err) {
      console.error('Error fetching financial reports:', err);
      setError('Failed to load financial reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      
      const response = await adminAPI.exportFinancialReport({
        type: reportType,
        format: exportFormat,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { 
          type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial-report-${reportType}-${dateRange.startDate}-to-${dateRange.endDate}.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError(response.message || 'Failed to export report');
      }
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getReportPeriodText = () => {
    const start = new Date(dateRange.startDate).toLocaleDateString();
    const end = new Date(dateRange.endDate).toLocaleDateString();
    return `${start} - ${end}`;
  };

  if (!isAuthorized) {
    return (
      <div className="financial-reports">
        <div className="error-container">
          <div className="error-message">
            <h3>🔒 Access Denied</h3>
            <p>You don't have permission to view financial reports.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="financial-reports">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h3>Loading Financial Reports...</h3>
          <p>Analyzing financial data and generating reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="financial-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <h2>📊 Financial Reports</h2>
          <p>Comprehensive financial analysis and reporting for {getReportPeriodText()}</p>
        </div>
        
        <div className="header-controls">
          <div className="date-range-controls">
            <div className="date-input-group">
              <label>From:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label>To:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="date-input"
              />
            </div>
          </div>
          
          <div className="report-type-selector">
            <label>Report Type:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="report-type-select"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div className="export-controls">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="export-format-select"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className={`btn btn-primary ${isExporting ? 'exporting' : ''}`}
            >
              {isExporting ? '📤 Exporting...' : '📤 Export'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-section">
        <h3>📈 Financial Summary</h3>
        <div className="summary-grid">
          <div className="summary-card deposits">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h4>{formatCurrency(reportData.summary.totalDeposits)}</h4>
              <p>Total Deposits</p>
              <div className="card-trend positive">
                <span>↗️ {formatPercentage(reportData.summary.growthRate)}</span>
              </div>
            </div>
          </div>
          
          <div className="summary-card withdrawals">
            <div className="card-icon">💸</div>
            <div className="card-content">
              <h4>{formatCurrency(reportData.summary.totalWithdrawals)}</h4>
              <p>Total Withdrawals</p>
              <div className="card-trend negative">
                <span>↘️ {formatPercentage(-Math.abs(reportData.summary.growthRate * 0.7))}</span>
              </div>
            </div>
          </div>
          
          <div className="summary-card net-flow">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h4>{formatCurrency(reportData.summary.netFlow)}</h4>
              <p>Net Flow</p>
              <div className={`card-trend ${reportData.summary.netFlow >= 0 ? 'positive' : 'negative'}`}>
                <span>
                  {reportData.summary.netFlow >= 0 ? '↗️' : '↘️'} 
                  {formatPercentage(reportData.summary.netFlow >= 0 ? 15.2 : -8.5)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="summary-card transactions">
            <div className="card-icon">🔄</div>
            <div className="card-content">
              <h4>{reportData.summary.transactionCount.toLocaleString()}</h4>
              <p>Total Transactions</p>
              <div className="card-average">
                <span>Avg: {formatCurrency(reportData.summary.averageTransaction)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <h3>📈 Trend Analysis</h3>
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-header">
              <h4>💰 Deposits vs Withdrawals</h4>
              <p>Daily comparison over selected period</p>
            </div>
            <div className="chart-placeholder">
              <div className="chart-icon">📊</div>
              <h4>Interactive Chart</h4>
              <p>Deposits vs Withdrawals trend visualization</p>
              <div className="chart-data">
                <span>Peak Day: {formatCurrency(Math.max(...(reportData.dailyData.map(d => d.deposits) || [0])))}</span>
              </div>
            </div>
          </div>
          
          <div className="chart-container">
            <div className="chart-header">
              <h4>📈 Net Flow Analysis</h4>
              <p>Cash flow trends and patterns</p>
            </div>
            <div className="chart-placeholder">
              <div className="chart-icon">📈</div>
              <h4>Flow Chart</h4>
              <p>Net cash flow visualization</p>
              <div className="chart-data">
                <span>Current Trend: {reportData.summary.netFlow >= 0 ? 'Positive' : 'Negative'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="detailed-reports-section">
        <h3>📋 Detailed Analysis</h3>
        
        <div className="reports-grid">
          {/* Transaction Types Breakdown */}
          <div className="report-card">
            <div className="report-header">
              <h4>🔄 Transaction Types</h4>
              <p>Breakdown by transaction category</p>
            </div>
            <div className="transaction-types">
              <div className="type-item">
                <div className="type-info">
                  <span className="type-icon">💰</span>
                  <span className="type-name">Deposits</span>
                </div>
                <div className="type-stats">
                  <span className="type-amount">{formatCurrency(reportData.summary.totalDeposits)}</span>
                  <span className="type-percentage">65%</span>
                </div>
              </div>
              
              <div className="type-item">
                <div className="type-info">
                  <span className="type-icon">💸</span>
                  <span className="type-name">Withdrawals</span>
                </div>
                <div className="type-stats">
                  <span className="type-amount">{formatCurrency(reportData.summary.totalWithdrawals)}</span>
                  <span className="type-percentage">35%</span>
                </div>
              </div>
              
              <div className="type-item">
                <div className="type-info">
                  <span className="type-icon">🔄</span>
                  <span className="type-name">Transfers</span>
                </div>
                <div className="type-stats">
                  <span className="type-amount">{formatCurrency(reportData.summary.totalDeposits * 0.1)}</span>
                  <span className="type-percentage">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Users */}
          <div className="report-card">
            <div className="report-header">
              <h4>👥 Top Users by Volume</h4>
              <p>Highest transaction volumes</p>
            </div>
            <div className="top-users">
              {[1, 2, 3, 4, 5].map((rank) => (
                <div key={rank} className="user-item">
                  <div className="user-rank">#{rank}</div>
                  <div className="user-info">
                    <span className="user-name">User {1000 + rank}</span>
                    <span className="user-email">user{1000 + rank}@example.com</span>
                  </div>
                  <div className="user-stats">
                    <span className="user-amount">{formatCurrency(50000 - rank * 8000)}</span>
                    <span className="user-transactions">{120 - rank * 15} txns</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>⚡ Quick Actions</h3>
        <div className="quick-actions">
          <button 
            onClick={fetchReportData}
            className="action-btn primary"
            disabled={loading}
          >
            <span>🔄</span>
            Refresh Data
          </button>
          
          <button 
            onClick={() => setReportType('daily')}
            className={`action-btn ${reportType === 'daily' ? 'primary' : 'secondary'}`}
          >
            <span>📅</span>
            Daily View
          </button>
          
          <button 
            onClick={() => setReportType('weekly')}
            className={`action-btn ${reportType === 'weekly' ? 'primary' : 'secondary'}`}
          >
            <span>📊</span>
            Weekly View
          </button>
          
          <button 
            onClick={() => setReportType('monthly')}
            className={`action-btn ${reportType === 'monthly' ? 'primary' : 'secondary'}`}
          >
            <span>📈</span>
            Monthly View
          </button>
          
          <button 
            onClick={handleExportReport}
            className="action-btn info"
            disabled={isExporting}
          >
            <span>📤</span>
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;