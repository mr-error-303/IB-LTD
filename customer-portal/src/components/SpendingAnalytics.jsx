import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Car, 
  Home, 
  Utensils, 
  Gamepad2, 
  Heart, 
  GraduationCap,
  Plane,
  Filter,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { formatCurrency, convertCurrency } from '../utils/currency';

const SpendingAnalytics = ({ transactions = [], selectedCurrency = 'BDT' }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Category icons and colors
  const categoryConfig = {
    shopping: { icon: ShoppingCart, color: '#8B5CF6', name: 'Shopping' },
    transport: { icon: Car, color: '#06B6D4', name: 'Transport' },
    utilities: { icon: Home, color: '#10B981', name: 'Utilities' },
    food: { icon: Utensils, color: '#F59E0B', name: 'Food & Dining' },
    entertainment: { icon: Gamepad2, color: '#EF4444', name: 'Entertainment' },
    healthcare: { icon: Heart, color: '#EC4899', name: 'Healthcare' },
    education: { icon: GraduationCap, color: '#6366F1', name: 'Education' },
    travel: { icon: Plane, color: '#14B8A6', name: 'Travel' }
  };

  // Process transactions for analytics
  const processTransactions = () => {
    const now = new Date();
    let filteredTransactions = transactions.filter(t => t.type === 'debit');

    // Filter by time range
    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= weekAgo);
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= monthAgo);
    } else if (timeRange === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= yearAgo);
    }

    return filteredTransactions;
  };

  // Calculate spending by category
  const getSpendingByCategory = () => {
    const processed = processTransactions();
    const categoryTotals = {};

    processed.forEach(transaction => {
      const category = transaction.category || 'other';
      const amount = convertCurrency(transaction.amount, 'BDT', selectedCurrency);
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      name: categoryConfig[category]?.name || category,
      color: categoryConfig[category]?.color || '#64748B'
    })).sort((a, b) => b.amount - a.amount);
  };

  // Calculate daily spending trend
  const getDailySpending = () => {
    const processed = processTransactions();
    const dailyTotals = {};

    processed.forEach(transaction => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      const amount = convertCurrency(transaction.amount, 'BDT', selectedCurrency);
      dailyTotals[date] = (dailyTotals[date] || 0) + amount;
    });

    return Object.entries(dailyTotals)
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14); // Last 14 days
  };

  const categoryData = getSpendingByCategory();
  const dailyData = getDailySpending();
  const totalSpending = categoryData.reduce((sum, item) => sum + item.amount, 0);

  // Calculate spending insights
  const getSpendingInsights = () => {
    const insights = [];
    
    if (categoryData.length > 0) {
      const topCategory = categoryData[0];
      const percentage = ((topCategory.amount / totalSpending) * 100).toFixed(1);
      insights.push({
        type: 'category',
        title: 'Top Spending Category',
        description: `${topCategory.name} accounts for ${percentage}% of your spending`,
        amount: topCategory.amount,
        trend: 'neutral'
      });
    }

    if (dailyData.length >= 2) {
      const recent = dailyData.slice(-3).reduce((sum, day) => sum + day.amount, 0) / 3;
      const previous = dailyData.slice(-6, -3).reduce((sum, day) => sum + day.amount, 0) / 3;
      const change = ((recent - previous) / previous) * 100;
      
      insights.push({
        type: 'trend',
        title: 'Spending Trend',
        description: `${Math.abs(change).toFixed(1)}% ${change > 0 ? 'increase' : 'decrease'} vs last period`,
        amount: recent,
        trend: change > 0 ? 'up' : 'down'
      });
    }

    return insights;
  };

  const insights = getSpendingInsights();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-xl">
          <p className="text-white/90 font-medium">{label}</p>
          <p className="text-accent-400 font-semibold">
            {formatCurrency(payload[0].value, selectedCurrency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white/90">Spending Analytics</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
          >
            <Filter className="w-4 h-4 text-white/70" />
            <span className="text-white/70">Filters</span>
            <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-white/70" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        )}

        {/* Spending Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-xl p-4 border border-accent-500/30">
            <h3 className="text-white/70 text-sm font-medium mb-2">Total Spending</h3>
            <p className="text-2xl font-bold text-white/90">
              {formatCurrency(totalSpending, selectedCurrency)}
            </p>
            <p className="text-accent-400 text-sm mt-1">This {timeRange}</p>
          </div>

          {insights.map((insight, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white/70 text-sm font-medium">{insight.title}</h3>
                {insight.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-error-400" />
                ) : insight.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-success-400" />
                ) : null}
              </div>
              <p className="text-white/90 text-sm mb-1">{insight.description}</p>
              {insight.amount && (
                <p className="text-lg font-semibold text-white/90">
                  {formatCurrency(insight.amount, selectedCurrency)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white/90 mb-6">Spending by Category</h3>
          
          {categoryData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {categoryData.slice(0, 5).map((category, index) => {
                  const IconComponent = categoryConfig[category.category]?.icon || ShoppingCart;
                  const percentage = ((category.amount / totalSpending) * 100).toFixed(1);
                  
                  return (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-white/90 font-medium text-sm">{category.name}</p>
                          <p className="text-white/60 text-xs">{percentage}% of total</p>
                        </div>
                      </div>
                      <p className="text-white/90 font-semibold">
                        {formatCurrency(category.amount, selectedCurrency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">No spending data available</p>
            </div>
          )}
        </div>

        {/* Daily Spending Trend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white/90 mb-6">Daily Spending Trend</h3>
          
          {dailyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#ffffff60"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#ffffff60"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value, selectedCurrency, true)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fill="url(#spendingGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">No trend data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalytics;