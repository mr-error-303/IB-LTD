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
  MapPin, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Settings,
  TrendingUp,
  Clock,
  Building,
  Shield
} from 'lucide-react';

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  withdrawalType: 'atm' | 'agent';
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestTime: string;
  approvedBy?: string;
  approvedTime?: string;
  agentId?: string;
  atmId?: string;
  reason?: string;
}

interface LocationLimit {
  id: string;
  location: string;
  type: 'atm' | 'agent' | 'area';
  dailyLimit: number;
  currentUsage: number;
  status: 'active' | 'restricted' | 'blocked';
  restrictions: string[];
}

interface AgentATMLimit {
  id: string;
  name: string;
  type: 'atm' | 'agent';
  location: string;
  dailyLimit: number;
  currentUsage: number;
  transactionLimit: number;
  status: 'active' | 'maintenance' | 'blocked';
  lastTransaction: string;
}

interface SuspiciousActivity {
  id: string;
  userId: string;
  userName: string;
  activityType: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
  location: string;
  status: 'investigating' | 'resolved' | 'escalated';
}

const CashWithdrawalManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Mock data for withdrawal requests
  const [withdrawalRequests] = useState<WithdrawalRequest[]>([
    {
      id: '1',
      userId: 'user001',
      userName: 'John Doe',
      amount: 75000,
      withdrawalType: 'atm',
      location: 'Dhanmondi ATM - 01',
      coordinates: { lat: 23.7465, lng: 90.3765 },
      status: 'pending',
      requestTime: '2024-01-15 14:30:00',
      atmId: 'ATM001'
    },
    {
      id: '2',
      userId: 'user002',
      userName: 'Jane Smith',
      amount: 25000,
      withdrawalType: 'agent',
      location: 'Gulshan Agent Point',
      coordinates: { lat: 23.7808, lng: 90.4176 },
      status: 'approved',
      requestTime: '2024-01-15 14:25:00',
      approvedBy: 'admin001',
      approvedTime: '2024-01-15 14:35:00',
      agentId: 'AGT001'
    },
    {
      id: '3',
      userId: 'user003',
      userName: 'Bob Johnson',
      amount: 150000,
      withdrawalType: 'atm',
      location: 'Uttara ATM - 03',
      coordinates: { lat: 23.8759, lng: 90.3795 },
      status: 'rejected',
      requestTime: '2024-01-15 14:20:00',
      reason: 'Exceeds daily limit'
    },
    {
      id: '4',
      userId: 'user004',
      userName: 'Alice Brown',
      amount: 50000,
      withdrawalType: 'agent',
      location: 'Banani Agent Point',
      coordinates: { lat: 23.7936, lng: 90.4066 },
      status: 'completed',
      requestTime: '2024-01-15 14:15:00',
      approvedBy: 'admin002',
      approvedTime: '2024-01-15 14:25:00',
      agentId: 'AGT002'
    }
  ]);

  // Mock data for location limits
  const [locationLimits] = useState<LocationLimit[]>([
    {
      id: '1',
      location: 'Dhanmondi Area',
      type: 'area',
      dailyLimit: 5000000,
      currentUsage: 2500000,
      status: 'active',
      restrictions: []
    },
    {
      id: '2',
      location: 'Gulshan Area',
      type: 'area',
      dailyLimit: 8000000,
      currentUsage: 6200000,
      status: 'restricted',
      restrictions: ['High traffic area', 'Additional verification required']
    },
    {
      id: '3',
      location: 'Old Dhaka Area',
      type: 'area',
      dailyLimit: 3000000,
      currentUsage: 2800000,
      status: 'blocked',
      restrictions: ['Security concerns', 'Temporary suspension']
    }
  ]);

  // Mock data for agent/ATM limits
  const [agentATMLimits] = useState<AgentATMLimit[]>([
    {
      id: '1',
      name: 'Dhanmondi ATM - 01',
      type: 'atm',
      location: 'Dhanmondi, Dhaka',
      dailyLimit: 2000000,
      currentUsage: 850000,
      transactionLimit: 100000,
      status: 'active',
      lastTransaction: '2024-01-15 14:30:00'
    },
    {
      id: '2',
      name: 'Gulshan Agent Point',
      type: 'agent',
      location: 'Gulshan, Dhaka',
      dailyLimit: 1500000,
      currentUsage: 1200000,
      transactionLimit: 75000,
      status: 'active',
      lastTransaction: '2024-01-15 14:25:00'
    },
    {
      id: '3',
      name: 'Uttara ATM - 03',
      type: 'atm',
      location: 'Uttara, Dhaka',
      dailyLimit: 2500000,
      currentUsage: 0,
      transactionLimit: 100000,
      status: 'maintenance',
      lastTransaction: '2024-01-14 18:45:00'
    }
  ]);

  // Mock data for suspicious activities
  const [suspiciousActivities] = useState<SuspiciousActivity[]>([
    {
      id: '1',
      userId: 'user005',
      userName: 'Charlie Wilson',
      activityType: 'Multiple Location Withdrawals',
      description: 'Attempted withdrawals from 3 different locations within 30 minutes',
      riskLevel: 'high',
      timestamp: '2024-01-15 14:00:00',
      location: 'Multiple locations',
      status: 'investigating'
    },
    {
      id: '2',
      userId: 'user006',
      userName: 'Diana Prince',
      activityType: 'Large Amount Withdrawal',
      description: 'Withdrawal request for ৳200,000 - exceeds normal pattern',
      riskLevel: 'medium',
      timestamp: '2024-01-15 13:45:00',
      location: 'Banani ATM',
      status: 'resolved'
    }
  ]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Auto-refresh logic would go here
        console.log('Auto-refreshing withdrawal data...');
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
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

  const getRiskBadge = (riskLevel: string) => {
    const riskConfig = {
      low: { color: 'bg-green-100 text-green-800' },
      medium: { color: 'bg-yellow-100 text-yellow-800' },
      high: { color: 'bg-red-100 text-red-800' }
    };
    
    const config = riskConfig[riskLevel as keyof typeof riskConfig];
    
    return (
      <Badge className={`${config?.color} flex items-center gap-1`}>
        <AlertTriangle className="w-3 h-3" />
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
      </Badge>
    );
  };

  const filteredRequests = withdrawalRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    const matchesType = selectedType === 'all' || request.withdrawalType === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRequests = withdrawalRequests.length;
  const pendingRequests = withdrawalRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = withdrawalRequests.filter(r => r.status === 'approved').length;
  const totalAmount = withdrawalRequests
    .filter(r => r.status === 'completed' || r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleApproval = (request: WithdrawalRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Withdrawal Management</h1>
          <p className="text-gray-600 mt-1">Monitor and approve cash withdrawal requests</p>
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
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">{approvedRequests}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
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
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="requests">Withdrawal Requests</TabsTrigger>
          <TabsTrigger value="limits">ATM/Agent Limits</TabsTrigger>
          <TabsTrigger value="locations">Location Restrictions</TabsTrigger>
          <TabsTrigger value="suspicious">Suspicious Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Withdrawal Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Withdrawal Request Approval System</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search requests..."
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
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Types</option>
                    <option value="atm">ATM</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Request ID</th>
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Location</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Request Time</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">WD{request.id.padStart(6, '0')}</td>
                        <td className="p-3">{request.userName}</td>
                        <td className="p-3 font-semibold">৳{request.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge className={request.withdrawalType === 'atm' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                            {request.withdrawalType.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {request.location}
                          </div>
                        </td>
                        <td className="p-3">{getStatusBadge(request.status)}</td>
                        <td className="p-3 text-sm text-gray-600">{request.requestTime}</td>
                        <td className="p-3">
                          {request.status === 'pending' ? (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleApproval(request, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleApproval(request, 'reject')}
                              >
                                Reject
                              </Button>
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

        {/* ATM/Agent Limits Tab */}
        <TabsContent value="limits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Set ATM/Agent Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Location</th>
                      <th className="text-left p-3">Daily Limit</th>
                      <th className="text-left p-3">Current Usage</th>
                      <th className="text-left p-3">Transaction Limit</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Last Transaction</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentATMLimits.map((limit) => (
                      <tr key={limit.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{limit.name}</td>
                        <td className="p-3">
                          <Badge className={limit.type === 'atm' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                            {limit.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3">{limit.location}</td>
                        <td className="p-3">৳{limit.dailyLimit.toLocaleString()}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span>৳{limit.currentUsage.toLocaleString()}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(limit.currentUsage / limit.dailyLimit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">৳{limit.transactionLimit.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge className={
                            limit.status === 'active' ? 'bg-green-100 text-green-800' :
                            limit.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {limit.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{limit.lastTransaction}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant={limit.status === 'active' ? 'destructive' : 'default'}
                            >
                              {limit.status === 'active' ? 'Block' : 'Activate'}
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

        {/* Location Restrictions Tab */}
        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location-based Restrictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Location</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Daily Limit</th>
                      <th className="text-left p-3">Current Usage</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Restrictions</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationLimits.map((location) => (
                      <tr key={location.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{location.location}</td>
                        <td className="p-3">
                          <Badge className="bg-gray-100 text-gray-800">
                            {location.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3">৳{location.dailyLimit.toLocaleString()}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span>৳{location.currentUsage.toLocaleString()}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${(location.currentUsage / location.dailyLimit) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={
                            location.status === 'active' ? 'bg-green-100 text-green-800' :
                            location.status === 'restricted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {location.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {location.restrictions.length > 0 ? (
                            <div className="space-y-1">
                              {location.restrictions.map((restriction, index) => (
                                <div key={index} className="text-sm text-gray-600">
                                  • {restriction}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No restrictions</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant={location.status === 'blocked' ? 'default' : 'destructive'}
                            >
                              {location.status === 'blocked' ? 'Unblock' : 'Block'}
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

        {/* Suspicious Activity Tab */}
        <TabsContent value="suspicious" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Suspicious Activity Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Activity Type</th>
                      <th className="text-left p-3">Description</th>
                      <th className="text-left p-3">Risk Level</th>
                      <th className="text-left p-3">Location</th>
                      <th className="text-left p-3">Timestamp</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspiciousActivities.map((activity) => (
                      <tr key={activity.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{activity.userName}</td>
                        <td className="p-3">{activity.activityType}</td>
                        <td className="p-3 text-sm">{activity.description}</td>
                        <td className="p-3">{getRiskBadge(activity.riskLevel)}</td>
                        <td className="p-3">{activity.location}</td>
                        <td className="p-3 text-sm text-gray-600">{activity.timestamp}</td>
                        <td className="p-3">
                          <Badge className={
                            activity.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                            activity.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {activity.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Investigate</Button>
                            {activity.status === 'investigating' && (
                              <Button size="sm" variant="destructive">Block User</Button>
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Withdrawal Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Today's Withdrawals</span>
                    <span className="font-semibold">42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Week</span>
                    <span className="font-semibold">298</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-semibold">1,256</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Approval Rate</span>
                    <span className="font-semibold text-green-600">87.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  ATM vs Agent Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>ATM Withdrawals</span>
                    <span className="font-semibold">68%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Agent Withdrawals</span>
                    <span className="font-semibold">32%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Peak Hours</span>
                    <span className="font-semibold">2-4 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Amount</span>
                    <span className="font-semibold">৳45,250</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              {selectedRequest.status === 'pending' ? 'Approve/Reject' : 'View'} Withdrawal Request
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">User:</span> {selectedRequest.userName}
              </div>
              <div>
                <span className="font-medium">Amount:</span> ৳{selectedRequest.amount.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Location:</span> {selectedRequest.location}
              </div>
              <div>
                <span className="font-medium">Type:</span> {selectedRequest.withdrawalType.toUpperCase()}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowApprovalModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              {selectedRequest.status === 'pending' && (
                <>
                  <Button variant="destructive" className="flex-1">
                    Reject
                  </Button>
                  <Button variant="default" className="flex-1">
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashWithdrawalManagement;