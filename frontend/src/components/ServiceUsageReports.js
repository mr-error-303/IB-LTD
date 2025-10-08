import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';

const ServiceUsageReports = () => {
  const [usageData, setUsageData] = useState({
    serviceMetrics: [],
    hourlyUsage: [],
    serviceRevenue: {},
    userSatisfaction: {},
    peakTimes: []
  });
  const [selectedService, setSelectedService] = useState('all');
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);

  const services = [
    { id: 'transfer', name: 'Money Transfer', icon: '💸' },
    { id: 'payment', name: 'Bill Payment', icon: '💳' },
    { id: 'balance', name: 'Balance Inquiry', icon: '💰' },
    { id: 'loan', name: 'Loan Services', icon: '🏦' },
    { id: 'investment', name: 'Investment', icon: '📈' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️' }
  ];

  useEffect(() => {
    const fetchUsageData = () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockData = generateMockUsageData(timeRange);
        setUsageData(mockData);
        setLoading(false);
      }, 800);
    };

    fetchUsageData();
  }, [timeRange, selectedService]);

  const generateMockUsageData = (range) => {
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 90;
    const serviceMetrics = [];
    const hourlyUsage = [];
    
    // Generate service metrics
    services.forEach(service => {
      serviceMetrics.push({
        service: service.name,
        id: service.id,
        icon: service.icon,
        totalUsage: Math.floor(Math.random() * 10000) + 1000,
        uniqueUsers: Math.floor(Math.random() * 5000) + 500,
        avgSessionTime: Math.floor(Math.random() * 300) + 60, // seconds
        successRate: Math.floor(Math.random() * 20) + 80, // 80-100%
        revenue: Math.floor(Math.random() * 50000) + 10000,
        growth: (Math.random() * 40) - 20 // -20% to +20%
      });
    });

    // Generate hourly usage for 24 hours
    for (let hour = 0; hour < 24; hour++) {
      const baseUsage = Math.sin((hour - 6) * Math.PI / 12) * 500 + 800;
      hourlyUsage.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        usage: Math.max(100, Math.floor(baseUsage + (Math.random() * 200 - 100)))
      });
    }

    return {
      serviceMetrics,
      hourlyUsage,
      serviceRevenue: {
        transfer: Math.floor(Math.random() * 100000) + 50000,
        payment: Math.floor(Math.random() * 80000) + 40000,
        balance: Math.floor(Math.random() * 20000) + 5000,
        loan: Math.floor(Math.random() * 150000) + 75000,
        investment: Math.floor(Math.random() * 200000) + 100000,
        insurance: Math.floor(Math.random() * 60000) + 30000
      },
      userSatisfaction: {
        transfer: 4.5,
        payment: 4.2,
        balance: 4.8,
        loan: 4.1,
        investment: 4.3,
        insurance: 4.0
      },
      peakTimes: [
        { time: '9:00 AM', usage: 85 },
        { time: '1:00 PM', usage: 72 },
        { time: '7:00 PM', usage: 68 }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    }
  };

  const serviceUsageData = {
    labels: usageData.serviceMetrics.map(service => service.service),
    datasets: [
      {
        label: 'Total Usage',
        data: usageData.serviceMetrics.map(service => service.totalUsage),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const hourlyUsageData = {
    labels: usageData.hourlyUsage.map(hour => hour.hour),
    datasets: [
      {
        label: 'Hourly Usage',
        data: usageData.hourlyUsage.map(hour => hour.usage),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const revenuePerServiceData = {
    labels: Object.keys(usageData.serviceRevenue).map(key => 
      services.find(s => s.id === key)?.name || key
    ),
    datasets: [
      {
        data: Object.values(usageData.serviceRevenue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const satisfactionData = {
    labels: Object.keys(usageData.userSatisfaction).map(key => 
      services.find(s => s.id === key)?.name || key
    ),
    datasets: [
      {
        label: 'User Satisfaction',
        data: Object.values(usageData.userSatisfaction),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(16, 185, 129, 1)'
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Service Usage Reports</h2>
        <div className="flex gap-4">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Services</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </div>

      {/* Service Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usageData.serviceMetrics.slice(0, 6).map((service, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{service.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{service.service}</h3>
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                service.growth >= 0 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
              }`}>
                {service.growth >= 0 ? '+' : ''}{service.growth.toFixed(1)}%
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Usage</span>
                <span className="text-sm font-medium text-gray-900">{service.totalUsage.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unique Users</span>
                <span className="text-sm font-medium text-gray-900">{service.uniqueUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-green-600">{service.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="text-sm font-medium text-blue-600">${service.revenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Usage Distribution</h3>
          <div className="h-64">
            <Bar data={serviceUsageData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue per Service</h3>
          <div className="h-64">
            <Doughnut data={revenuePerServiceData} options={{...chartOptions, scales: undefined}} />
          </div>
        </div>
      </div>

      {/* Hourly Usage Pattern */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">24-Hour Usage Pattern</h3>
        <div className="h-64">
          <Line data={hourlyUsageData} options={chartOptions} />
        </div>
      </div>

      {/* User Satisfaction & Peak Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Satisfaction Ratings</h3>
          <div className="h-64">
            <Radar data={satisfactionData} options={{
              ...chartOptions,
              scales: {
                r: {
                  beginAtZero: true,
                  max: 5,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Usage Times</h3>
          <div className="space-y-4">
            {usageData.peakTimes.map((peak, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">{peak.time}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${peak.usage}%`}}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{peak.usage}%</span>
                </div>
              </div>
            ))}
            
            {/* Additional metrics */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-700 mb-4">Service Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {Math.round(usageData.serviceMetrics.reduce((sum, s) => sum + s.avgSessionTime, 0) / usageData.serviceMetrics.length)}s
                  </div>
                  <div className="text-sm text-gray-600">Avg Session Time</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {Math.round(usageData.serviceMetrics.reduce((sum, s) => sum + s.successRate, 0) / usageData.serviceMetrics.length)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Service Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Service Analytics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usageData.serviceMetrics.map((service, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{service.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{service.service}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.totalUsage.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.uniqueUsers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {service.successRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${service.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.growth >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.growth >= 0 ? '+' : ''}{service.growth.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="mr-2">{usageData.userSatisfaction[service.id]?.toFixed(1) || 'N/A'}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < Math.floor(usageData.userSatisfaction[service.id] || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceUsageReports;