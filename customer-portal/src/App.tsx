import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminSecurityProvider } from './context/AdminSecurityContext';
import { ThemeProvider } from './contexts/ThemeContext';
import SecuritySettings from './pages/SecuritySettings';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Cards from './pages/Cards';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Account from './pages/Account';
import Beneficiaries from './pages/Beneficiaries';
import BillPayment from './pages/BillPayment';
import QRPayment from './pages/QRPayment';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Investment from './pages/Investment';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AllUsers from './pages/AllUsers';
import AdminTransactions from './pages/AdminTransactions';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSecurity from './pages/AdminSecurity';
import AdminSettings from './pages/AdminSettings';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import './index.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // For development/testing purposes, allow access if user data exists in localStorage
  const hasUserData = localStorage.getItem('bankingUser');
  
  return (isAuthenticated || hasUserData) ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <AdminSecurityProvider>
            <Router>
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
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
                  path="/transfer"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Transfer />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cards"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Cards />
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
                        <BillPayment />
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
                      <Withdraw />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/security" element={
                  <ProtectedRoute>
                    <Layout>
                      <SecuritySettings />
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
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AllUsers />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/transactions"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminTransactions />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminAnalytics />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/security"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminSecurity />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminSettings />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              </Routes>
            </div>
          </Router>
        </AdminSecurityProvider>
      </LanguageProvider>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
