import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminSecurityProvider } from './context/AdminSecurityContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './components/common/NotificationSystem';
import { CurrencyProvider } from './context/CurrencyContext';
import LazyWrapper from './components/common/LazyWrapper';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import { 
  LazySecuritySettings,
  LazyAllUsers,
  LazyAdminSettings,
  LazyWithdraw,
  LazyBillPayment
} from './utils/performance';
import { preloadCriticalResources, addResourceHints } from './utils/bundleOptimization';
import CurrencySync from './components/CurrencySync';
import AddMoney from './pages/AddMoney';
import FundTransfer from './pages/FundTransfer';
import FundTransferTracking from './pages/FundTransferTracking';
import MobileTopup from './pages/MobileTopup';
import CashWithdraw from './pages/CashWithdraw';
import BuyTicket from './pages/BuyTicket';
import ReceiveRemittance from './pages/ReceiveRemittance';
import QuickPayPage from './pages/QuickPay';
import BankAccount from './pages/BankAccount';
import Cards from './pages/Cards';
import OpenAccount from './pages/OpenAccount';
import Statement from './pages/Statement';
import Location from './pages/Location';

// Keep frequently used components as regular imports for better initial load
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Account from './pages/Account';
import Beneficiaries from './pages/Beneficiaries';
import QRPayment from './pages/QRPayment';
import Deposit from './pages/Deposit';
import Investment from './pages/Investment';
import Loan from './pages/Loan';
import LoanServices from './pages/LoanServices';
import Insurance from './pages/Insurance';
import Services from './pages/Services';
import AccountManagement from './pages/AccountManagement';
import AccountOpening from './pages/AccountOpening';
import StatementManagement from './components/StatementManagement';
import QuickPay from './components/QuickPay';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminApproval from './pages/AdminApproval';
import AdminPanel from './pages/AdminPanel';
import AdminTransactions from './pages/AdminTransactions';
import AdminTransactionOversight from './pages/AdminTransactionOversight';
import FundTransferMonitoring from './pages/FundTransferMonitoring';
import BillPaymentOversight from './pages/BillPaymentOversight';
import MobileTopupControls from './pages/MobileTopupControls';
import CashWithdrawalManagement from './pages/CashWithdrawalManagement';
import AdminTransactionDashboard from './pages/admin/AdminTransactionDashboard';
import AuditTrailReporting from './pages/admin/AuditTrailReporting';
import ServiceConfigurationPanel from './components/ServiceConfigurationPanel';
import UserLimitsManagement from './components/UserLimitsManagement';
import RealTimeDashboard from './components/RealTimeDashboard';
import AlertSystem from './components/AlertSystem';
import SystemHealthMetrics from './components/SystemHealthMetrics';
import FraudDetectionAnalytics from './components/FraudDetectionAnalytics';
import SecurityPatternAnalysis from './components/SecurityPatternAnalysis';
import FinancialReports from './components/FinancialReports';
import OperationalReports from './components/OperationalReports';
import ReportExportSystem from './components/ReportExportSystem';
import ReportDashboard from './components/ReportDashboard';
import AdminUserManagement from './components/AdminUserManagement';
import AdminActivityLogging from './components/AdminActivityLogging';
import SessionManagement from './components/SessionManagement';
import SystemConfiguration from './components/SystemConfiguration';
import ServiceMonitoringDashboard from './components/ServiceMonitoringDashboard';
import UserActivityTracking from './components/UserActivityTracking';
import LoanManagementAdmin from './components/LoanManagementAdmin';
import TransactionApprovalDashboard from './components/TransactionApprovalDashboard';
import DatabaseManagement from './components/DatabaseManagement';
import APIManagement from './components/APIManagement';
import MaintenanceMode from './components/MaintenanceMode';
import AddMoneyAdmin from './components/AddMoneyAdmin';
import TicketBookingAdmin from './components/TicketBookingAdmin';
import InsuranceInvestmentAdmin from './components/InsuranceInvestmentAdmin';
import CardManagementAdmin from './components/CardManagementAdmin';
import BulkOperations from './components/BulkOperations';
import WorkflowAutomation from './components/WorkflowAutomation';
import AuditCompliance from './components/AuditCompliance';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSecurity from './pages/AdminSecurity';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import './index.css';
import './styles/notifications.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // For development/testing purposes, allow access if user data exists in localStorage
  const hasUserData = localStorage.getItem('bankingUser');
  
  return (isAuthenticated || hasUserData) ? <>{children}</> : <Navigate to="/login" />;
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check for admin authentication
  const adminUser = localStorage.getItem('adminUser');
  const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated');
  
  return (adminUser && isAdminAuthenticated === 'true') ? <>{children}</> : <Navigate to="/admin/login" />;
};

const App: React.FC = () => {
  useEffect(() => {
    // Initialize performance optimizations
    preloadCriticalResources();
    addResourceHints();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <AdminSecurityProvider>
            <NotificationProvider>
              <CurrencyProvider>
                <CurrencySync />
                <Router>
                <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                  <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Transactions />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Account />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/beneficiaries"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Beneficiaries />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bill-payment"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <LazyWrapper>
                          <LazyBillPayment />
                        </LazyWrapper>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route path="/qr-payment" element={
                  <ProtectedRoute>
                    <Layout>
                      <QRPayment />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/deposit" element={
                  <ProtectedRoute>
                    <Layout>
                      <Deposit />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/withdraw" element={
                  <ProtectedRoute>
                    <Layout>
                      <LazyWrapper>
                        <LazyWithdraw />
                      </LazyWrapper>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/security" element={
                  <ProtectedRoute>
                    <Layout>
                      <LazyWrapper>
                        <LazySecuritySettings />
                      </LazyWrapper>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/investment" element={
                  <ProtectedRoute>
                    <Layout>
                      <Investment />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/loan" element={
                  <ProtectedRoute>
                    <Layout>
                      <Loan />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/loan-services" element={
                  <ProtectedRoute>
                    <Layout>
                      <LoanServices />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/add-money" element={
                  <ProtectedRoute>
                    <Layout>
                      <AddMoney />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/fund-transfer" element={
                  <ProtectedRoute>
                    <Layout>
                      <FundTransfer />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/fund-transfer-tracking" element={
                  <ProtectedRoute>
                    <Layout>
                      <FundTransferTracking />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/mobile-topup" element={
                  <ProtectedRoute>
                    <Layout>
                      <MobileTopup />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/cash-withdraw" element={
                  <ProtectedRoute>
                    <Layout>
                      <CashWithdraw />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/buy-ticket" element={
                  <ProtectedRoute>
                    <Layout>
                      <BuyTicket />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/receive-remittance" element={
                  <ProtectedRoute>
                    <Layout>
                      <ReceiveRemittance />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/quick-pay" element={
                  <ProtectedRoute>
                    <Layout>
                      <QuickPayPage />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/bank-account" element={
                  <ProtectedRoute>
                    <Layout>
                      <BankAccount />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/cards" element={
                  <ProtectedRoute>
                    <Layout>
                      <Cards />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/open-account" element={
                  <ProtectedRoute>
                    <Layout>
                      <OpenAccount />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/statement" element={
                  <ProtectedRoute>
                    <Layout>
                      <Statement />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/location" element={
                  <ProtectedRoute>
                    <Layout>
                      <Location />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/insurance" element={
                  <ProtectedRoute>
                    <Layout>
                      <Insurance />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/services" element={
                  <ProtectedRoute>
                    <Layout>
                      <Services />
                    </Layout>
                  </ProtectedRoute>
                } />



                <Route path="/account-management" element={
                  <ProtectedRoute>
                    <Layout>
                      <AccountManagement />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/account-opening" element={
                  <ProtectedRoute>
                    <Layout>
                      <AccountOpening />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/statement-management" element={
                  <ProtectedRoute>
                    <Layout>
                      <StatementManagement />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/quick-pay" element={
                  <ProtectedRoute>
                    <Layout>
                      <QuickPay />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/location" element={
                  <ProtectedRoute>
                    <Layout>
                      <Location />
                    </Layout>
                  </ProtectedRoute>
                } />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/approval"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminApproval />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <LazyWrapper>
                        <LazyAllUsers />
                      </LazyWrapper>
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/transactions"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminTransactions />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/oversight"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminTransactionOversight />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/fund-transfer-monitoring"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <FundTransferMonitoring />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/bill-payment-oversight"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <BillPaymentOversight />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/mobile-topup-controls"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <MobileTopupControls />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/cash-withdrawal-management"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <CashWithdrawalManagement />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/transaction-dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminTransactionDashboard />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-trail"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AuditTrailReporting />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/service-configuration"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <ServiceConfigurationPanel />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/user-limits"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <UserLimitsManagement />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/real-time-dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <RealTimeDashboard />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/alert-system"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AlertSystem />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/service-monitoring"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <ServiceMonitoringDashboard />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/user-activity-tracking"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <UserActivityTracking />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/loan-management"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <LoanManagementAdmin />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/system-health"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <SystemHealthMetrics />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/fraud-detection"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <FraudDetectionAnalytics />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/security-analysis"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <SecurityPatternAnalysis />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/reports-dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <ReportDashboard />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/financial-reports"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <FinancialReports />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/operational-reports"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <OperationalReports />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/report-export-system"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <ReportExportSystem />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/user-management"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminUserManagement />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/activity-logging"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminActivityLogging />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/session-management"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <SessionManagement />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/system-configuration"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <SystemConfiguration />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/database-management"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <DatabaseManagement />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/api-management"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <APIManagement />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/maintenance-mode"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <MaintenanceMode />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/add-money-service"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AddMoneyAdmin />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/ticket-booking-service"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <TicketBookingAdmin />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/insurance-investment-service"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <InsuranceInvestmentAdmin />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/card-management-service"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <CardManagementAdmin />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/bulk-operations"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <BulkOperations />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/workflow-automation"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <WorkflowAutomation />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-compliance"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AuditCompliance />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminAnalytics />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/security"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminSecurity />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <LazyWrapper>
                        <LazyAdminSettings />
                      </LazyWrapper>
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/transaction-approval"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <TransactionApprovalDashboard />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/panel"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout>
                      <AdminPanel />
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
              </Routes>
            </div>
          </Router>
        </CurrencyProvider>
        </NotificationProvider>
      </AdminSecurityProvider>
    </LanguageProvider>
  </AuthProvider>
  </ThemeProvider>
  );
};

export default App;
