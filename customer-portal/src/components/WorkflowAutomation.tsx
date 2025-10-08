import React, { useState, useEffect } from 'react';
import { Settings, Play, Pause, Edit, Trash2, Plus, Clock, AlertTriangle, CheckCircle, Users, Mail, Bell, Calendar, Filter, Search } from 'lucide-react';

// Interfaces
interface AutoApprovalRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    field: string;
    operator: string;
    value: string | number;
  }[];
  actions: {
    type: string;
    value: string;
  }[];
  isActive: boolean;
  priority: number;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface EscalationProcedure {
  id: string;
  name: string;
  description: string;
  triggerConditions: {
    type: 'time_based' | 'amount_based' | 'risk_based' | 'manual';
    threshold: string | number;
    timeframe?: string;
  };
  escalationLevels: {
    level: number;
    assignTo: string;
    timeLimit: string;
    actions: string[];
  }[];
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  taskType: 'report_generation' | 'data_cleanup' | 'notification' | 'backup' | 'maintenance';
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string;
    days?: string[];
    customCron?: string;
  };
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  createdAt: string;
  runCount: number;
}

interface WorkflowExecution {
  id: string;
  workflowType: 'auto_approval' | 'escalation' | 'scheduled_task';
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: string;
  details: string;
  affectedItems: number;
  errors?: string[];
}

// Mock Data
const mockAutoApprovalRules: AutoApprovalRule[] = [
  {
    id: '1',
    name: 'Small Deposit Auto-Approval',
    description: 'Automatically approve deposits under $1000 from verified accounts',
    conditions: [
      { field: 'amount', operator: '<', value: 1000 },
      { field: 'account_verified', operator: '=', value: 'true' },
      { field: 'transaction_type', operator: '=', value: 'deposit' }
    ],
    actions: [
      { type: 'approve', value: 'auto' },
      { type: 'notify', value: 'user' }
    ],
    isActive: true,
    priority: 1,
    createdAt: '2024-01-10',
    lastTriggered: '2024-01-15 14:30',
    triggerCount: 245
  },
  {
    id: '2',
    name: 'Premium User Fast Track',
    description: 'Fast-track approvals for premium and VIP users',
    conditions: [
      { field: 'user_tier', operator: 'in', value: 'premium,vip' },
      { field: 'amount', operator: '<', value: 5000 }
    ],
    actions: [
      { type: 'approve', value: 'auto' },
      { type: 'priority', value: 'high' }
    ],
    isActive: true,
    priority: 2,
    createdAt: '2024-01-08',
    lastTriggered: '2024-01-15 16:45',
    triggerCount: 89
  },
  {
    id: '3',
    name: 'Low Risk Transaction Approval',
    description: 'Auto-approve transactions with low risk scores',
    conditions: [
      { field: 'risk_score', operator: '<', value: 30 },
      { field: 'user_history', operator: '>', value: 6 }
    ],
    actions: [
      { type: 'approve', value: 'auto' },
      { type: 'log', value: 'audit_trail' }
    ],
    isActive: false,
    priority: 3,
    createdAt: '2024-01-05',
    triggerCount: 156
  }
];

const mockEscalationProcedures: EscalationProcedure[] = [
  {
    id: '1',
    name: 'High-Value Transaction Escalation',
    description: 'Escalation procedure for transactions over $10,000',
    triggerConditions: {
      type: 'amount_based',
      threshold: 10000
    },
    escalationLevels: [
      {
        level: 1,
        assignTo: 'Senior Analyst',
        timeLimit: '2 hours',
        actions: ['review', 'verify_identity', 'check_source_of_funds']
      },
      {
        level: 2,
        assignTo: 'Manager',
        timeLimit: '4 hours',
        actions: ['detailed_review', 'compliance_check', 'risk_assessment']
      },
      {
        level: 3,
        assignTo: 'Director',
        timeLimit: '24 hours',
        actions: ['final_approval', 'regulatory_filing', 'documentation']
      }
    ],
    isActive: true,
    createdAt: '2024-01-12',
    lastUsed: '2024-01-15 11:20',
    usageCount: 23
  },
  {
    id: '2',
    name: 'Fraud Alert Escalation',
    description: 'Immediate escalation for suspected fraudulent activities',
    triggerConditions: {
      type: 'risk_based',
      threshold: 80
    },
    escalationLevels: [
      {
        level: 1,
        assignTo: 'Fraud Team',
        timeLimit: '30 minutes',
        actions: ['immediate_review', 'account_freeze', 'contact_user']
      },
      {
        level: 2,
        assignTo: 'Security Manager',
        timeLimit: '1 hour',
        actions: ['investigation', 'evidence_collection', 'law_enforcement_contact']
      }
    ],
    isActive: true,
    createdAt: '2024-01-10',
    lastUsed: '2024-01-14 09:15',
    usageCount: 7
  },
  {
    id: '3',
    name: 'Overdue Review Escalation',
    description: 'Escalation for reviews pending beyond SLA',
    triggerConditions: {
      type: 'time_based',
      threshold: 24,
      timeframe: 'hours'
    },
    escalationLevels: [
      {
        level: 1,
        assignTo: 'Team Lead',
        timeLimit: '2 hours',
        actions: ['reassign', 'priority_boost', 'notify_stakeholders']
      },
      {
        level: 2,
        assignTo: 'Department Manager',
        timeLimit: '4 hours',
        actions: ['resource_allocation', 'process_review', 'client_communication']
      }
    ],
    isActive: true,
    createdAt: '2024-01-08',
    usageCount: 45
  }
];

const mockScheduledTasks: ScheduledTask[] = [
  {
    id: '1',
    name: 'Daily Transaction Report',
    description: 'Generate and send daily transaction summary report',
    taskType: 'report_generation',
    schedule: {
      frequency: 'daily',
      time: '08:00'
    },
    isActive: true,
    lastRun: '2024-01-15 08:00',
    nextRun: '2024-01-16 08:00',
    status: 'completed',
    createdAt: '2024-01-01',
    runCount: 15
  },
  {
    id: '2',
    name: 'Weekly User Cleanup',
    description: 'Clean up inactive user sessions and temporary data',
    taskType: 'data_cleanup',
    schedule: {
      frequency: 'weekly',
      time: '02:00',
      days: ['Sunday']
    },
    isActive: true,
    lastRun: '2024-01-14 02:00',
    nextRun: '2024-01-21 02:00',
    status: 'completed',
    createdAt: '2024-01-01',
    runCount: 3
  },
  {
    id: '3',
    name: 'Monthly Compliance Report',
    description: 'Generate monthly regulatory compliance report',
    taskType: 'report_generation',
    schedule: {
      frequency: 'monthly',
      time: '06:00'
    },
    isActive: true,
    lastRun: '2024-01-01 06:00',
    nextRun: '2024-02-01 06:00',
    status: 'completed',
    createdAt: '2023-12-01',
    runCount: 2
  },
  {
    id: '4',
    name: 'System Health Check',
    description: 'Automated system health monitoring and alerts',
    taskType: 'maintenance',
    schedule: {
      frequency: 'daily',
      time: '00:00'
    },
    isActive: true,
    lastRun: '2024-01-15 00:00',
    nextRun: '2024-01-16 00:00',
    status: 'running',
    createdAt: '2024-01-01',
    runCount: 15
  },
  {
    id: '5',
    name: 'Backup Database',
    description: 'Daily database backup to secure storage',
    taskType: 'backup',
    schedule: {
      frequency: 'daily',
      time: '03:00'
    },
    isActive: false,
    lastRun: '2024-01-14 03:00',
    nextRun: '2024-01-16 03:00',
    status: 'failed',
    createdAt: '2024-01-01',
    runCount: 14
  }
];

const mockWorkflowExecutions: WorkflowExecution[] = [
  {
    id: '1',
    workflowType: 'auto_approval',
    workflowName: 'Small Deposit Auto-Approval',
    status: 'completed',
    startedAt: '2024-01-15 14:30:15',
    completedAt: '2024-01-15 14:30:18',
    duration: '3s',
    details: 'Processed 15 deposit transactions',
    affectedItems: 15
  },
  {
    id: '2',
    workflowType: 'escalation',
    workflowName: 'High-Value Transaction Escalation',
    status: 'running',
    startedAt: '2024-01-15 16:45:22',
    details: 'Transaction $25,000 escalated to Manager level',
    affectedItems: 1
  },
  {
    id: '3',
    workflowType: 'scheduled_task',
    workflowName: 'Daily Transaction Report',
    status: 'completed',
    startedAt: '2024-01-15 08:00:00',
    completedAt: '2024-01-15 08:02:45',
    duration: '2m 45s',
    details: 'Generated report with 1,247 transactions',
    affectedItems: 1247
  },
  {
    id: '4',
    workflowType: 'scheduled_task',
    workflowName: 'Backup Database',
    status: 'failed',
    startedAt: '2024-01-15 03:00:00',
    completedAt: '2024-01-15 03:15:30',
    duration: '15m 30s',
    details: 'Backup failed due to storage space',
    affectedItems: 0,
    errors: ['Insufficient storage space', 'Connection timeout to backup server']
  }
];

const WorkflowAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('auto-approval');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutoApprovalRule | null>(null);
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationProcedure | null>(null);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'running': case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': case 'cancelled': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 bg-red-100';
      case 2: return 'text-yellow-600 bg-yellow-100';
      case 3: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    console.log(`Toggling rule ${ruleId} status`);
  };

  const toggleEscalationStatus = (escalationId: string) => {
    console.log(`Toggling escalation ${escalationId} status`);
  };

  const toggleTaskStatus = (taskId: string) => {
    console.log(`Toggling task ${taskId} status`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Automation</h1>
        <p className="text-gray-600">Manage auto-approval rules, escalation procedures, and scheduled tasks</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-blue-600">{mockAutoApprovalRules.filter(r => r.isActive).length}</p>
            </div>
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Escalation Procedures</p>
              <p className="text-2xl font-bold text-orange-600">{mockEscalationProcedures.filter(e => e.isActive).length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled Tasks</p>
              <p className="text-2xl font-bold text-green-600">{mockScheduledTasks.filter(t => t.isActive).length}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running Workflows</p>
              <p className="text-2xl font-bold text-purple-600">{mockWorkflowExecutions.filter(w => w.status === 'running').length}</p>
            </div>
            <Play className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'auto-approval', name: 'Auto-Approval Rules', icon: CheckCircle },
              { id: 'escalation', name: 'Escalation Procedures', icon: AlertTriangle },
              { id: 'scheduled-tasks', name: 'Scheduled Tasks', icon: Calendar },
              { id: 'execution-history', name: 'Execution History', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Auto-Approval Rules Tab */}
          {activeTab === 'auto-approval' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search rules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Rules</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowRuleModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Rule</span>
                </button>
              </div>

              <div className="space-y-4">
                {mockAutoApprovalRules.map((rule) => (
                  <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rule.isActive ? 'active' : 'inactive')}`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(rule.priority)}`}>
                            Priority {rule.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{rule.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Conditions:</span>
                            <ul className="mt-1 space-y-1">
                              {rule.conditions.map((condition, index) => (
                                <li key={index} className="text-gray-600">
                                  {condition.field} {condition.operator} {condition.value}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Actions:</span>
                            <ul className="mt-1 space-y-1">
                              {rule.actions.map((action, index) => (
                                <li key={index} className="text-gray-600">
                                  {action.type}: {action.value}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Statistics:</span>
                            <div className="mt-1 space-y-1 text-gray-600">
                              <div>Triggered: {rule.triggerCount} times</div>
                              <div>Last: {rule.lastTriggered || 'Never'}</div>
                              <div>Created: {rule.createdAt}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className={`p-2 rounded-md ${rule.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setSelectedRule(rule)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escalation Procedures Tab */}
          {activeTab === 'escalation' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Escalation Procedures</h3>
                <button
                  onClick={() => setShowEscalationModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Procedure</span>
                </button>
              </div>

              <div className="space-y-4">
                {mockEscalationProcedures.map((procedure) => (
                  <div key={procedure.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{procedure.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(procedure.isActive ? 'active' : 'inactive')}`}>
                            {procedure.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{procedure.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Trigger Conditions</h4>
                            <div className="bg-gray-50 rounded-md p-3">
                              <div className="text-sm text-gray-600">
                                <div>Type: {procedure.triggerConditions.type.replace('_', ' ')}</div>
                                <div>Threshold: {procedure.triggerConditions.threshold}</div>
                                {procedure.triggerConditions.timeframe && (
                                  <div>Timeframe: {procedure.triggerConditions.timeframe}</div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Escalation Levels</h4>
                            <div className="space-y-2">
                              {procedure.escalationLevels.map((level) => (
                                <div key={level.level} className="bg-gray-50 rounded-md p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="text-sm">
                                      <div className="font-medium">Level {level.level}: {level.assignTo}</div>
                                      <div className="text-gray-600">Time Limit: {level.timeLimit}</div>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-500">Actions:</div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {level.actions.map((action, index) => (
                                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                          {action.replace('_', ' ')}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                          <div>Usage Count: {procedure.usageCount}</div>
                          <div>Last Used: {procedure.lastUsed || 'Never'}</div>
                          <div>Created: {procedure.createdAt}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleEscalationStatus(procedure.id)}
                          className={`p-2 rounded-md ${procedure.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          {procedure.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setSelectedEscalation(procedure)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Tasks Tab */}
          {activeTab === 'scheduled-tasks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Scheduled Tasks</h3>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockScheduledTasks.map((task) => (
                  <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.isActive ? 'active' : 'inactive')}`}>
                            {task.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`p-2 rounded-md ${task.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          {task.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Type:</span>
                          <div className="text-gray-600">{task.taskType.replace('_', ' ')}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Frequency:</span>
                          <div className="text-gray-600">{task.schedule.frequency}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Time:</span>
                          <div className="text-gray-600">{task.schedule.time}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Run Count:</span>
                          <div className="text-gray-600">{task.runCount}</div>
                        </div>
                      </div>
                      
                      {task.schedule.days && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Days:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.schedule.days.map((day) => (
                              <span key={day} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Last Run:</span>
                          <div className="text-gray-600">{task.lastRun || 'Never'}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Next Run:</span>
                          <div className="text-gray-600">{task.nextRun}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution History Tab */}
          {activeTab === 'execution-history' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Workflow Execution History</h3>
              
              <div className="space-y-4">
                {mockWorkflowExecutions.map((execution) => (
                  <div key={execution.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          execution.status === 'completed' ? 'bg-green-100' :
                          execution.status === 'running' ? 'bg-yellow-100' :
                          execution.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {execution.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {execution.status === 'running' && <Clock className="h-5 w-5 text-yellow-600" />}
                          {execution.status === 'failed' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{execution.workflowName}</h4>
                          <p className="text-sm text-gray-500">
                            {execution.workflowType.replace('_', ' ')} • Started: {execution.startedAt}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{execution.affectedItems}</p>
                        <p className="text-sm text-gray-500">Affected Items</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{execution.duration || 'Running...'}</p>
                        <p className="text-sm text-gray-500">Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{execution.completedAt ? 'Yes' : 'No'}</p>
                        <p className="text-sm text-gray-500">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{execution.errors?.length || 0}</p>
                        <p className="text-sm text-gray-500">Errors</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-md p-3 mb-4">
                      <p className="text-sm text-gray-700">{execution.details}</p>
                    </div>

                    {execution.errors && execution.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <h5 className="text-sm font-medium text-red-600 mb-2">Errors</h5>
                        {execution.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-700">{error}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Auto-Approval Rule</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter rule name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="1">High (1)</option>
                    <option value="2">Medium (2)</option>
                    <option value="3">Low (3)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe what this rule does..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conditions</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <select className="flex-1 px-3 py-2 border border-gray-300 rounded-md">
                      <option>amount</option>
                      <option>user_tier</option>
                      <option>risk_score</option>
                      <option>transaction_type</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md">
                      <option>=</option>
                      <option>&lt;</option>
                      <option>&gt;</option>
                      <option>in</option>
                    </select>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Value..."
                    />
                    <button className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Plus className="h-4 w-4" />
                    <span>Add Condition</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <select className="flex-1 px-3 py-2 border border-gray-300 rounded-md">
                      <option>approve</option>
                      <option>reject</option>
                      <option>notify</option>
                      <option>escalate</option>
                    </select>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Value..."
                    />
                    <button className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Plus className="h-4 w-4" />
                    <span>Add Action</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Escalation Modal */}
      {showEscalationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Escalation Procedure</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Procedure Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter procedure name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe when this escalation should trigger..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="amount_based">Amount Based</option>
                    <option value="time_based">Time Based</option>
                    <option value="risk_based">Risk Based</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter threshold value..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEscalationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEscalationModal(false)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Create Procedure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Scheduled Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter task name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe what this task does..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="report_generation">Report Generation</option>
                    <option value="data_cleanup">Data Cleanup</option>
                    <option value="notification">Notification</option>
                    <option value="backup">Backup</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Execution Time</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowAutomation;