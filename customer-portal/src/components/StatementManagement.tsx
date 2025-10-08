import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Calendar, 
  Clock,
  Filter,
  Search,
  Eye,
  Printer,
  Mail,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

interface StatementData {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  balance: number;
}

const StatementManagement: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStatement, setGeneratedStatement] = useState<StatementData[] | null>(null);

  // Mock statement data
  const mockStatementData: StatementData[] = [
    { id: '1', date: '2024-01-15', description: 'ATM Withdrawal', amount: -5000, type: 'debit', balance: 125000 },
    { id: '2', date: '2024-01-14', description: 'Salary Deposit', amount: 50000, type: 'credit', balance: 130000 },
    { id: '3', date: '2024-01-13', description: 'Electricity Bill', amount: -2500, type: 'debit', balance: 80000 },
    { id: '4', date: '2024-01-12', description: 'Mobile Recharge', amount: -500, type: 'debit', balance: 82500 },
    { id: '5', date: '2024-01-11', description: 'Online Transfer', amount: -10000, type: 'debit', balance: 83000 },
    { id: '6', date: '2024-01-10', description: 'Check Deposit', amount: 25000, type: 'credit', balance: 93000 },
    { id: '7', date: '2024-01-09', description: 'Gas Bill', amount: -1200, type: 'debit', balance: 68000 },
    { id: '8', date: '2024-01-08', description: 'Internet Bill', amount: -1500, type: 'debit', balance: 69200 },
    { id: '9', date: '2024-01-07', description: 'Bank Transfer', amount: 15000, type: 'credit', balance: 70700 },
    { id: '10', date: '2024-01-06', description: 'Online Shopping', amount: -3500, type: 'debit', balance: 55700 },
  ];

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setGeneratedStatement(null);
    
    if (option === 'mini') {
      // Generate mini statement (last 5 transactions)
      setIsGenerating(true);
      setTimeout(() => {
        setGeneratedStatement(mockStatementData.slice(0, 5));
        setIsGenerating(false);
      }, 1500);
    } else if (option === 'full') {
      // Generate full statement (all transactions)
      setIsGenerating(true);
      setTimeout(() => {
        setGeneratedStatement(mockStatementData);
        setIsGenerating(false);
      }, 2000);
    }
  };

  const handleCustomPeriod = () => {
    if (dateRange.from && dateRange.to) {
      setIsGenerating(true);
      setTimeout(() => {
        // Filter data based on date range (mock implementation)
        setGeneratedStatement(mockStatementData.slice(0, 7));
        setIsGenerating(false);
      }, 1800);
    }
  };

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Mock PDF download
      const blob = new Blob(['Mock PDF Content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Account Statements</h1>
            <p className="text-white/70">Choose your preferred statement option</p>
          </div>

          {!selectedOption ? (
            /* Statement Options */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mini Statement */}
              <div 
                onClick={() => handleOptionSelect('mini')}
                className="group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl mx-auto mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Mini Statement</h3>
                    <p className="text-white/70 mb-4">Last 5 transactions</p>
                    <div className="flex items-center justify-center text-white/60">
                      <span className="text-sm">Quick & Fast</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Statement */}
              <div 
                onClick={() => handleOptionSelect('full')}
                className="group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-2xl mx-auto mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Full Statement</h3>
                    <p className="text-white/70 mb-4">Complete transaction history</p>
                    <div className="flex items-center justify-center text-white/60">
                      <span className="text-sm">Comprehensive</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Period */}
              <div 
                onClick={() => handleOptionSelect('custom')}
                className="group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl mx-auto mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Custom Period</h3>
                    <p className="text-white/70 mb-4">Select date range</p>
                    <div className="flex items-center justify-center text-white/60">
                      <span className="text-sm">Flexible</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Download PDF */}
              <div 
                onClick={() => handleOptionSelect('download')}
                className="group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-2xl mx-auto mb-4 w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Download className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Download PDF</h3>
                    <p className="text-white/70 mb-4">Get PDF statement</p>
                    <div className="flex items-center justify-center text-white/60">
                      <span className="text-sm">Downloadable</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Selected Option Content */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {selectedOption === 'mini' && 'Mini Statement'}
                  {selectedOption === 'full' && 'Full Statement'}
                  {selectedOption === 'custom' && 'Custom Period Statement'}
                  {selectedOption === 'download' && 'Download PDF Statement'}
                </h2>
                <button
                  onClick={() => setSelectedOption(null)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Back to Options
                </button>
              </div>

              {selectedOption === 'custom' && !generatedStatement && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Select Date Range</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">From Date</label>
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">To Date</label>
                      <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCustomPeriod}
                    disabled={!dateRange.from || !dateRange.to}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Statement
                  </button>
                </div>
              )}

              {selectedOption === 'download' && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                  <Download className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-4">Download PDF Statement</h3>
                  <p className="text-white/70 mb-6">Generate and download your account statement as PDF</p>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-8 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                </div>
              )}

              {isGenerating && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white/70">Generating your statement...</p>
                </div>
              )}

              {generatedStatement && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Statement Details</h3>
                    <div className="flex space-x-2">
                      <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <Printer className="w-5 h-5 text-white" />
                      </button>
                      <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <Mail className="w-5 h-5 text-white" />
                      </button>
                      <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <Download className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 px-4 text-white/70 font-medium">Date</th>
                          <th className="text-left py-3 px-4 text-white/70 font-medium">Description</th>
                          <th className="text-right py-3 px-4 text-white/70 font-medium">Amount</th>
                          <th className="text-right py-3 px-4 text-white/70 font-medium">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedStatement.map((transaction) => (
                          <tr key={transaction.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="py-3 px-4 text-white/90">{transaction.date}</td>
                            <td className="py-3 px-4 text-white/90">{transaction.description}</td>
                            <td className={`py-3 px-4 text-right font-medium ${
                              transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </td>
                            <td className="py-3 px-4 text-right text-white/90 font-medium">
                              {formatCurrency(transaction.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex items-center justify-center">
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>Statement generated successfully</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatementManagement;