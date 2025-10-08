import React from 'react';
import TransactionApprovalDashboard from './TransactionApprovalDashboard';

// Mock providers to wrap the dashboard component
const MockProviders = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};

// Test wrapper component
const TestTransactionDashboard = () => {
  return (
    <MockProviders>
      <div className="min-h-screen bg-gray-50">
        <TransactionApprovalDashboard />
      </div>
    </MockProviders>
  );
};

export default TestTransactionDashboard;