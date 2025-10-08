import React, { useState } from 'react';
import { Search, Filter, X, Calendar, DollarSign } from 'lucide-react';
import { LoanStatus } from '../types';

interface LoanFiltersProps {
  onFilterChange: (filters: LoanFilterOptions) => void;
  totalLoans: number;
  filteredCount: number;
}

export interface LoanFilterOptions {
  searchTerm: string;
  status: LoanStatus | 'all';
  loanType: string;
  amountRange: {
    min: number;
    max: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

const LoanFilters: React.FC<LoanFiltersProps> = ({
  onFilterChange,
  totalLoans,
  filteredCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<LoanFilterOptions>({
    searchTerm: '',
    status: 'all',
    loanType: 'all',
    amountRange: { min: 0, max: 10000000 },
    dateRange: { start: '', end: '' }
  });

  const handleFilterUpdate = (newFilters: Partial<LoanFilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const defaultFilters: LoanFilterOptions = {
      searchTerm: '',
      status: 'all',
      loanType: 'all',
      amountRange: { min: 0, max: 10000000 },
      dateRange: { start: '', end: '' }
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.status !== 'all' || 
    filters.loanType !== 'all' ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.amountRange.min > 0 ||
    filters.amountRange.max < 10000000;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Filter Loans</h3>
              <p className="text-sm text-gray-600">
                Showing {filteredCount} of {totalLoans} loans
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by loan ID, type, or amount..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterUpdate({ searchTerm: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterUpdate({ status: e.target.value as LoanStatus | 'all' })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Loan Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Type
            </label>
            <select
              value={filters.loanType}
              onChange={(e) => handleFilterUpdate({ loanType: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="personal">Personal Loan</option>
              <option value="home">Home Loan</option>
              <option value="car">Car Loan</option>
              <option value="education">Education Loan</option>
              <option value="business">Business Loan</option>
            </select>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Amount Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min Amount"
                  value={filters.amountRange.min || ''}
                  onChange={(e) => handleFilterUpdate({
                    amountRange: { ...filters.amountRange, min: Number(e.target.value) || 0 }
                  })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max Amount"
                  value={filters.amountRange.max === 10000000 ? '' : filters.amountRange.max}
                  onChange={(e) => handleFilterUpdate({
                    amountRange: { ...filters.amountRange, max: Number(e.target.value) || 10000000 }
                  })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Application Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleFilterUpdate({
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterUpdate({
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {filters.searchTerm && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Search: "{filters.searchTerm}"
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize">
                    Status: {filters.status}
                  </span>
                )}
                {filters.loanType !== 'all' && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm capitalize">
                    Type: {filters.loanType}
                  </span>
                )}
                {(filters.amountRange.min > 0 || filters.amountRange.max < 10000000) && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    Amount: ₹{filters.amountRange.min.toLocaleString()} - ₹{filters.amountRange.max.toLocaleString()}
                  </span>
                )}
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    Date: {filters.dateRange.start || 'Start'} to {filters.dateRange.end || 'End'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoanFilters;