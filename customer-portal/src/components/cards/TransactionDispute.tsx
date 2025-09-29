import React, { useState } from 'react';
import { 
  CreditCardIcon, 
  ExclamationTriangleIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  cardNumber: string;
  cardType: 'virtual' | 'physical';
  amount: number;
  currency: string;
  merchant: string;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'disputed';
  category: string;
  location: string;
}

interface DisputeCase {
  id: string;
  transactionId: string;
  cardNumber: string;
  amount: number;
  merchant: string;
  disputeReason: string;
  status: 'submitted' | 'under_review' | 'resolved' | 'rejected';
  submittedDate: string;
  expectedResolution: string;
  description: string;
  attachments: string[];
}

const TransactionDispute: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'disputes'>('transactions');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [disputeForm, setDisputeForm] = useState({
    reason: '',
    description: '',
    attachments: [] as File[]
  });

  // Mock data for recent transactions
  const [transactions] = useState<Transaction[]>([
    {
      id: 'txn_001',
      cardNumber: '**** **** **** 1234',
      cardType: 'physical',
      amount: 250.00,
      currency: 'USD',
      merchant: 'Amazon.com',
      date: '2024-01-15',
      time: '14:30',
      status: 'completed',
      category: 'Online Shopping',
      location: 'Online'
    },
    {
      id: 'txn_002',
      cardNumber: '**** **** **** 5678',
      cardType: 'virtual',
      amount: 89.99,
      currency: 'USD',
      merchant: 'Netflix',
      date: '2024-01-14',
      time: '09:15',
      status: 'completed',
      category: 'Entertainment',
      location: 'Online'
    },
    {
      id: 'txn_003',
      cardNumber: '**** **** **** 1234',
      cardType: 'physical',
      amount: 1200.00,
      currency: 'USD',
      merchant: 'Unknown Merchant',
      date: '2024-01-13',
      time: '23:45',
      status: 'disputed',
      category: 'Unknown',
      location: 'New York, NY'
    },
    {
      id: 'txn_004',
      cardNumber: '**** **** **** 9012',
      cardType: 'physical',
      amount: 45.50,
      currency: 'USD',
      merchant: 'Starbucks',
      date: '2024-01-12',
      time: '08:20',
      status: 'completed',
      category: 'Food & Dining',
      location: 'San Francisco, CA'
    }
  ]);

  // Mock data for dispute cases
  const [disputeCases] = useState<DisputeCase[]>([
    {
      id: 'disp_001',
      transactionId: 'txn_003',
      cardNumber: '**** **** **** 1234',
      amount: 1200.00,
      merchant: 'Unknown Merchant',
      disputeReason: 'Unauthorized Transaction',
      status: 'under_review',
      submittedDate: '2024-01-14',
      expectedResolution: '2024-01-28',
      description: 'I did not authorize this transaction. My card was in my possession at the time.',
      attachments: ['police_report.pdf', 'bank_statement.pdf']
    },
    {
      id: 'disp_002',
      transactionId: 'txn_005',
      cardNumber: '**** **** **** 5678',
      amount: 299.99,
      merchant: 'Tech Store',
      disputeReason: 'Item Not Received',
      status: 'resolved',
      submittedDate: '2024-01-10',
      expectedResolution: '2024-01-24',
      description: 'Ordered a laptop but never received the item. Merchant is not responding.',
      attachments: ['order_confirmation.pdf']
    }
  ]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.cardNumber.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDisputeSubmit = () => {
    if (!selectedTransaction || !disputeForm.reason || !disputeForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    // Mock API call
    console.log('Submitting dispute:', {
      transactionId: selectedTransaction.id,
      reason: disputeForm.reason,
      description: disputeForm.description,
      attachments: disputeForm.attachments
    });

    alert('Dispute submitted successfully! You will receive updates via email.');
    setShowDisputeModal(false);
    setSelectedTransaction(null);
    setDisputeForm({ reason: '', description: '', attachments: [] });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'disputed': return 'text-red-600 bg-red-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'under_review': return 'text-orange-600 bg-orange-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'disputed': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'under_review': return <ClockIcon className="w-4 h-4" />;
      case 'resolved': return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejected': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction Dispute</h2>
          <p className="text-gray-600">Report unauthorized transactions and track dispute cases</p>
        </div>
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">Report suspicious activity immediately</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recent Transactions
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'disputes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Disputes ({disputeCases.length})
          </button>
        </nav>
      </div>

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.merchant}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.date} at {transaction.time}
                          </div>
                          <div className="text-xs text-gray-400">
                            {transaction.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCardIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">{transaction.cardNumber}</div>
                            <div className="text-xs text-gray-500 capitalize">{transaction.cardType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.currency} {transaction.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">{transaction.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              // Show transaction details modal
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {transaction.status !== 'disputed' && (
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowDisputeModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <ExclamationTriangleIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {disputeCases.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No disputes</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't submitted any transaction disputes yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {disputeCases.map((dispute) => (
                <div key={dispute.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          Dispute #{dispute.id}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                          {getStatusIcon(dispute.status)}
                          <span className="ml-1 capitalize">{dispute.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Transaction:</span> {dispute.transactionId}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Card:</span> {dispute.cardNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Amount:</span> USD {dispute.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Merchant:</span> {dispute.merchant}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Reason:</span> {dispute.disputeReason}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Submitted:</span> {dispute.submittedDate}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Expected Resolution:</span> {dispute.expectedResolution}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Attachments:</span> {dispute.attachments.length} files
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Description:</span>
                        </p>
                        <p className="text-sm text-gray-800 mt-1">{dispute.description}</p>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                         <EyeIcon className="w-4 h-4" />
                       </button>
                       <button className="text-green-600 hover:text-green-900">
                         <ChatBubbleLeftRightIcon className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Report Transaction Dispute</h3>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Merchant:</span>
                    <span className="ml-2 font-medium">{selectedTransaction.merchant}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-2 font-medium">{selectedTransaction.currency} {selectedTransaction.amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">{selectedTransaction.date} {selectedTransaction.time}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Card:</span>
                    <span className="ml-2 font-medium">{selectedTransaction.cardNumber}</span>
                  </div>
                </div>
              </div>

              {/* Dispute Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dispute Reason *
                  </label>
                  <select
                    value={disputeForm.reason}
                    onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a reason</option>
                    <option value="unauthorized">Unauthorized Transaction</option>
                    <option value="duplicate">Duplicate Charge</option>
                    <option value="not_received">Item/Service Not Received</option>
                    <option value="defective">Defective Item/Service</option>
                    <option value="cancelled">Cancelled Transaction</option>
                    <option value="incorrect_amount">Incorrect Amount</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={disputeForm.description}
                    onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                    rows={4}
                    placeholder="Please provide detailed information about the dispute..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Upload receipts, emails, or other supporting documents
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setDisputeForm({ ...disputeForm, attachments: files });
                      }}
                      className="mt-2 text-sm text-gray-500"
                    />
                  </div>
                  {disputeForm.attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Selected files:</p>
                      <ul className="text-sm text-gray-800">
                        {disputeForm.attachments.map((file, index) => (
                          <li key={index}>• {file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisputeSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Submit Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDispute;