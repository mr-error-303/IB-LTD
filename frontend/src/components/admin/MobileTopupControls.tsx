import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Search, 
  RefreshCw, 
  Phone, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Settings,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';





interface TopupTransaction {
  id: string;
  userId: string;
  userName: string;
  phoneNumber: string;
  operator: string;
  amount: number;
  status: 'completed' | 'failed' | 'pending' | 'refunded';
  timestamp: string;
  transactionId: string;
  failureReason?: string;
}

interface UserLimit {
  userId: string;
  userName: string;
  dailyLimit: number;
  monthlyLimit: number;
  currentDailyUsage: number;
  currentMonthlyUsage: number;
  lastTopup: string;
  status: 'active' | 'suspended';
}

interface RefundRequest {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  phoneNumber: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
}

const MobileTopupControls: React.FC = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOperator, setSelectedOperator] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for topup transactions
  const [transactions] = useState<TopupTransaction[]>([
    {
      id: '1',
      userId: 'user001',
      userName: 'John Doe',
      phoneNumber: '+8801712345678',
      operator: 'Grameenphone',
      amount: 100,
      status: 'completed',
      timestamp: '2024-01-15 14:30:00',
      transactionId: 'TXN001'
    },
    {
      id: '2',
      userId: 'user002',
      userName: 'Jane Smith',
      phoneNumber: '+8801812345679',
      operator: 'Robi',
      amount: 50,
      status: 'failed',
      timestamp: '2024-01-15 14:25:00',
      transactionId: 'TXN002',
      failureReason: 'Insufficient balance'
    },
    {
      id: '3',
      userId: 'user003',
      userName: 'Bob Johnson',
      phoneNumber: '+8801912345680',
      operator: 'Banglalink',
      amount: 200,
      status: 'pending',
      timestamp: '2024-01-15 14:20:00',
      transactionId: 'TXN003'
    },
    {
      id: '4',
      userId: 'user004',
      userName: 'Alice Brown',
      phoneNumber: '+8801612345681',
      operator: 'Airtel',
      amount: 75,
      status: 'refunded',
      timestamp: '2024-01-15 14:15:00',
      transactionId: 'TXN004'
    }
  ]);

  // Mock data for user limits
  const [userLimits] = useState<UserLimit[]>([
    {
      userId: 'user001',
      userName: 'John Doe',
      dailyLimit: 1000,
      monthlyLimit: 10000,
      currentDailyUsage: 300,
      currentMonthlyUsage: 2500,
      lastTopup: '2024-01-15 14:30:00',
      status: 'active'
    },
    {
      userId: 'user002',
      userName: 'Jane Smith',
      dailyLimit: 500,
      monthlyLimit: 5000,
      currentDailyUsage: 450,
      currentMonthlyUsage: 3200,
      lastTopup: '2024-01-15 14:25:00',
      status: 'active'
    },
    {
      userId: 'user003',
      userName: 'Bob Johnson',
      dailyLimit: 2000,
      monthlyLimit: 20000,
      currentDailyUsage: 0,
      currentMonthlyUsage: 1500,
      lastTopup: '2024-01-14 16:45:00',
      status: 'suspended'
    }
  ]);

  // Mock data for refund requests
  const [refundRequests] = useState<RefundRequest[]>([
    {
      id: '1',
      transactionId: 'TXN002',
      userId: 'user002',
      userName: 'Jane Smith',
      phoneNumber: '+8801812345679',
      amount: 50,
      reason: 'Transaction failed but amount deducted',
      status: 'pending',
      requestDate: '2024-01-15 15:00:00'
    },
    {
      id: '2',
      transactionId: 'TXN005',
      userId: 'user005',
      userName: 'Charlie Wilson',
      phoneNumber: '+8801712345682',
      amount: 100,
      reason: 'Wrong number recharged',
      status: 'approved',
      requestDate: '2024-01-14 10:30:00',
      processedDate: '2024-01-14 11:15:00',
      processedBy: 'admin001'
    }
  ]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Auto-refresh logic would go here
        console.log('Auto-refreshing topup data...');
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      refunded: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;
    
    return (
      <Badge className={`${config?.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.phoneNumber.includes(searchTerm) ||
                         transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
    const matchesOperator = selectedOperator === 'all' || transaction.operator === selectedOperator;
    
    return matchesSearch && matchesStatus && matchesOperator;
  });

  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === 'completed').length;
  const failedTransactions = transactions.filter(t => t.status === 'failed').length;
  const totalAmount = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mobile Top-up Controls</h1>
          <p className="text-gray-600 mt-1">Monitor and manage mobile recharge transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
              </div>
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{completedTransactions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedTransactions}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">৳{totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="transactions" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transaction Log</TabsTrigger>
          <TabsTrigger value="limits">User Limits</TabsTrigger>
          <TabsTrigger value="refunds">Refund Processing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Transaction Log Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recharge Transaction Log</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <select
                    value={selectedOperator}
                    onChange={(e) => setSelectedOperator(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Operators</option>
                    <option value="Grameenphone">Grameenphone</option>
                    <option value="Robi">Robi</option>
                    <option value="Banglalink">Banglalink</option>
                    <option value="Airtel">Airtel</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Transaction ID</th>
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Phone Number</th>
                      <th className="text-left p-3">Operator</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Timestamp</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">{transaction.transactionId}</td>
                        <td className="p-3">{transaction.userName}</td>
                        <td className="p-3 font-mono">{transaction.phoneNumber}</td>
                        <td className="p-3">{transaction.operator}</td>
                        <td className="p-3 font-semibold">৳{transaction.amount}</td>
                        <td className="p-3">{getStatusBadge(transaction.status)}</td>
                        <td className="p-3 text-sm text-gray-600">{transaction.timestamp}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">View</Button>
                            {transaction.status === 'failed' && (
                              <Button size="sm" variant="outline">Refund</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Limits Tab */}
        <TabsContent value="limits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Set Top-up Limits Per User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Daily Limit</th>
                      <th className="text-left p-3">Monthly Limit</th>
                      <th className="text-left p-3">Daily Usage</th>
                      <th className="text-left p-3">Monthly Usage</th>
                      <th className="text-left p-3">Last Top-up</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userLimits.map((user) => (
                      <tr key={user.userId} className="border-b hover:bg-gray-50">
                        <td className="p-3">{user.userName}</td>
                        <td className="p-3">৳{user.dailyLimit.toLocaleString()}</td>
                        <td className="p-3">৳{user.monthlyLimit.toLocaleString()}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span>৳{user.currentDailyUsage.toLocaleString()}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(user.currentDailyUsage / user.dailyLimit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span>৳{user.currentMonthlyUsage.toLocaleString()}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${(user.currentMonthlyUsage / user.monthlyLimit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{user.lastTopup}</td>
                        <td className="p-3">
                          <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant={user.status === 'active' ? 'destructive' : 'default'}
                            >
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refund Processing Tab */}
        <TabsContent value="refunds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Refund Processing for Failed Recharges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Request ID</th>
                      <th className="text-left p-3">Transaction ID</th>
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Phone Number</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Reason</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Request Date</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">REF{request.id}</td>
                        <td className="p-3 font-mono text-sm">{request.transactionId}</td>
                        <td className="p-3">{request.userName}</td>
                        <td className="p-3 font-mono">{request.phoneNumber}</td>
                        <td className="p-3 font-semibold">৳{request.amount}</td>
                        <td className="p-3 text-sm">{request.reason}</td>
                        <td className="p-3">{getStatusBadge(request.status)}</td>
                        <td className="p-3 text-sm text-gray-600">{request.requestDate}</td>
                        <td className="p-3">
                          {request.status === 'pending' ? (
                            <div className="flex gap-2">
                              <Button size="sm" variant="default">Approve</Button>
                              <Button size="sm" variant="destructive">Reject</Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline">View Details</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top-up Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Today's Recharges</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Week</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-semibold">5,678</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Success Rate</span>
                    <span className="font-semibold text-green-600">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Operator Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Grameenphone</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Robi</span>
                    <span className="font-semibold">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Banglalink</span>
                    <span className="font-semibold">18%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Airtel</span>
                    <span className="font-semibold">9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileTopupControls;


export default MobileTopupControls;

