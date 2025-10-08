import React, { useState, useEffect } from 'react';

// Interfaces
interface SecurityEvent {
  id: string;
  type: 'login_failure' | 'suspicious_activity' | 'data_breach_attempt' | 'privilege_escalation' | 'unusual_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
  ipAddress: string;
  userAgent: string;
  location: {
    country: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  timestamp: Date;
  description: string;
  details: Record<string, any>;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolution?: string;
}

interface SecurityPattern {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'access_control' | 'data_protection' | 'network_security';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  detectionRule: string;
  eventCount: number;
  lastDetected: Date;
  enabled: boolean;
  falsePositiveRate: number;
  accuracy: number;
}

interface ThreatIntelligence {
  id: string;
  threatType: 'malware' | 'phishing' | 'ddos' | 'brute_force' | 'insider_threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  indicators: string[];
  affectedSystems: string[];
  mitigationSteps: string[];
  timestamp: Date;
  status: 'active' | 'mitigated' | 'monitoring';
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  resolvedEvents: number;
  averageResolutionTime: number;
  topThreats: { type: string; count: number; trend: number }[];
  securityScore: number;
  complianceStatus: {
    gdpr: boolean;
    pci: boolean;
    sox: boolean;
    iso27001: boolean;
  };
}

const SecurityPatternAnalysis: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityPatterns, setSecurityPatterns] = useState<SecurityPattern[]>([]);
  const [threatIntelligence, setThreatIntelligence] = useState<ThreatIntelligence[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [selectedTab, setSelectedTab] = useState<'events' | 'patterns' | 'threats' | 'metrics'>('events');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    // Generate mock security events
    const generateSecurityEvents = (): SecurityEvent[] => 
      Array.from({ length: 25 }, (_, i) => {
        const eventTypes = ['login_failure', 'suspicious_activity', 'data_breach_attempt', 'privilege_escalation', 'unusual_access'];
        const severities = ['low', 'medium', 'high', 'critical'];
        const statuses = ['new', 'investigating', 'resolved', 'false_positive'];
        const countries = ['USA', 'Russia', 'China', 'Germany', 'Brazil', 'India'];
        const cities = ['New York', 'Moscow', 'Beijing', 'Berlin', 'São Paulo', 'Mumbai'];
        
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as any;
        const severity = severities[Math.floor(Math.random() * severities.length)] as any;
        const country = countries[Math.floor(Math.random() * countries.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        
        return {
          id: `event-${i + 1}`,
          type: eventType,
          severity,
          userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
          userName: Math.random() > 0.3 ? `User ${Math.floor(Math.random() * 1000)}` : undefined,
          ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: { country, city },
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
          description: `${eventType.replace('_', ' ')} detected from ${country}`,
          details: {
            attemptCount: Math.floor(Math.random() * 10) + 1,
            duration: Math.floor(Math.random() * 3600),
            affectedResources: [`resource-${Math.floor(Math.random() * 100)}`]
          },
          status: statuses[Math.floor(Math.random() * statuses.length)] as any,
          assignedTo: Math.random() > 0.5 ? 'Security Team' : undefined,
          resolution: Math.random() > 0.7 ? 'Blocked IP address and notified user' : undefined
        };
      });

    // Generate mock security patterns
    const generateSecurityPatterns = (): SecurityPattern[] => [
      {
        id: 'brute-force',
        name: 'Brute Force Attack',
        description: 'Multiple failed login attempts from same IP',
        category: 'authentication',
        riskLevel: 'high',
        detectionRule: 'Failed login attempts > 5 in 10 minutes',
        eventCount: 45,
        lastDetected: new Date(Date.now() - Math.random() * 86400000),
        enabled: true,
        falsePositiveRate: 2.1,
        accuracy: 94.5
      },
      {
        id: 'privilege-escalation',
        name: 'Privilege Escalation',
        description: 'Unauthorized access to admin functions',
        category: 'access_control',
        riskLevel: 'critical',
        detectionRule: 'Admin function access without proper role',
        eventCount: 12,
        lastDetected: new Date(Date.now() - Math.random() * 86400000),
        enabled: true,
        falsePositiveRate: 0.8,
        accuracy: 98.2
      },
      {
        id: 'data-exfiltration',
        name: 'Data Exfiltration',
        description: 'Unusual data download patterns',
        category: 'data_protection',
        riskLevel: 'critical',
        detectionRule: 'Large data downloads outside business hours',
        eventCount: 8,
        lastDetected: new Date(Date.now() - Math.random() * 86400000),
        enabled: true,
        falsePositiveRate: 5.2,
        accuracy: 89.7
      },
      {
        id: 'network-anomaly',
        name: 'Network Anomaly',
        description: 'Suspicious network traffic patterns',
        category: 'network_security',
        riskLevel: 'medium',
        detectionRule: 'Traffic volume > 3x baseline',
        eventCount: 67,
        lastDetected: new Date(Date.now() - Math.random() * 86400000),
        enabled: true,
        falsePositiveRate: 8.9,
        accuracy: 82.3
      },
      {
        id: 'session-hijacking',
        name: 'Session Hijacking',
        description: 'Session tokens used from multiple locations',
        category: 'authentication',
        riskLevel: 'high',
        detectionRule: 'Same session from different geolocations',
        eventCount: 23,
        lastDetected: new Date(Date.now() - Math.random() * 86400000),
        enabled: true,
        falsePositiveRate: 3.4,
        accuracy: 91.8
      }
    ];

    // Generate mock threat intelligence
    const generateThreatIntelligence = (): ThreatIntelligence[] => [
      {
        id: 'threat-1',
        threatType: 'malware',
        severity: 'critical',
        source: 'External Threat Feed',
        description: 'New banking trojan targeting financial institutions',
        indicators: ['malicious-domain.com', '192.168.1.100', 'trojan.exe'],
        affectedSystems: ['Web Application', 'Mobile App'],
        mitigationSteps: [
          'Block malicious domains',
          'Update antivirus signatures',
          'Monitor for suspicious file downloads'
        ],
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        status: 'active'
      },
      {
        id: 'threat-2',
        threatType: 'phishing',
        severity: 'high',
        source: 'Internal Security Team',
        description: 'Phishing campaign targeting customer credentials',
        indicators: ['fake-bank-site.com', 'phishing@email.com'],
        affectedSystems: ['Email System', 'Customer Portal'],
        mitigationSteps: [
          'Block phishing domains',
          'Send customer awareness notifications',
          'Implement additional email filtering'
        ],
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        status: 'mitigated'
      },
      {
        id: 'threat-3',
        threatType: 'ddos',
        severity: 'medium',
        source: 'Network Monitoring',
        description: 'Distributed denial of service attack pattern detected',
        indicators: ['Botnet IPs', 'High traffic volume'],
        affectedSystems: ['Web Servers', 'API Gateway'],
        mitigationSteps: [
          'Enable DDoS protection',
          'Scale infrastructure',
          'Block suspicious IP ranges'
        ],
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        status: 'monitoring'
      }
    ];

    // Generate mock security metrics
    const generateSecurityMetrics = (): SecurityMetrics => ({
      totalEvents: 1247,
      criticalEvents: 23,
      resolvedEvents: 1156,
      averageResolutionTime: 4.2,
      topThreats: [
        { type: 'Login Failures', count: 456, trend: -12 },
        { type: 'Suspicious Activity', count: 234, trend: 8 },
        { type: 'Data Breach Attempts', count: 89, trend: -5 },
        { type: 'Privilege Escalation', count: 45, trend: 15 }
      ],
      securityScore: 87,
      complianceStatus: {
        gdpr: true,
        pci: true,
        sox: false,
        iso27001: true
      }
    });

    setSecurityEvents(generateSecurityEvents());
    setSecurityPatterns(generateSecurityPatterns());
    setThreatIntelligence(generateThreatIntelligence());
    setSecurityMetrics(generateSecurityMetrics());
  }, [timeRange]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'investigating': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'false_positive': return 'text-gray-600 bg-gray-100';
      case 'active': return 'text-red-600 bg-red-100';
      case 'mitigated': return 'text-green-600 bg-green-100';
      case 'monitoring': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredEvents = securityEvents.filter(event => 
    filterSeverity === 'all' || event.severity === filterSeverity
  );

  const updateEventStatus = (eventId: string, newStatus: SecurityEvent['status']) => {
    setSecurityEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: newStatus } : event
    ));
  };

  const togglePattern = (patternId: string) => {
    setSecurityPatterns(prev => prev.map(pattern => 
      pattern.id === patternId ? { ...pattern, enabled: !pattern.enabled } : pattern
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security Pattern Analysis</h1>
              <p className="text-gray-600 mt-1">Advanced security monitoring and threat detection</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              {securityMetrics && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Security Score:</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    securityMetrics.securityScore >= 90 ? 'text-green-600 bg-green-100' :
                    securityMetrics.securityScore >= 70 ? 'text-yellow-600 bg-yellow-100' :
                    'text-red-600 bg-red-100'
                  }`}>
                    {securityMetrics.securityScore}/100
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'events', label: 'Security Events' },
                { id: 'patterns', label: 'Detection Patterns' },
                { id: 'threats', label: 'Threat Intelligence' },
                { id: 'metrics', label: 'Security Metrics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Security Events Tab */}
        {selectedTab === 'events' && (
          <div>
            {/* Filters */}
            <div className="mb-4 flex items-center space-x-4">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div className="text-sm text-gray-600">
                Showing {filteredEvents.length} of {securityEvents.length} events
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
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
                    {filteredEvents.slice(0, 15).map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {event.type.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">{event.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{event.location.city}, {event.location.country}</div>
                            <div className="text-sm text-gray-500">{event.ipAddress}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.timestamp.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </button>
                          {event.status === 'new' && (
                            <select
                              onChange={(e) => updateEventStatus(event.id, e.target.value as any)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                              defaultValue=""
                            >
                              <option value="" disabled>Update Status</option>
                              <option value="investigating">Investigating</option>
                              <option value="resolved">Resolved</option>
                              <option value="false_positive">False Positive</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Detection Patterns Tab */}
        {selectedTab === 'patterns' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {securityPatterns.map((pattern) => (
              <div key={pattern.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pattern.name}</h3>
                    <p className="text-sm text-gray-600">{pattern.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(pattern.riskLevel)}`}>
                      {pattern.riskLevel}
                    </div>
                    <button
                      onClick={() => togglePattern(pattern.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        pattern.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pattern.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{pattern.eventCount}</p>
                    <p className="text-xs text-gray-500">Events</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{pattern.accuracy}%</p>
                    <p className="text-xs text-gray-500">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{pattern.falsePositiveRate}%</p>
                    <p className="text-xs text-gray-500">False Positive</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900 capitalize">{pattern.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Detection Rule:</span>
                    <span className="text-gray-900 text-right">{pattern.detectionRule}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Detected:</span>
                    <span className="text-gray-900">{pattern.lastDetected.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Threat Intelligence Tab */}
        {selectedTab === 'threats' && (
          <div className="space-y-6">
            {threatIntelligence.map((threat) => (
              <div key={threat.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {threat.threatType.replace('_', ' ')} Threat
                    </h3>
                    <p className="text-sm text-gray-600">{threat.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(threat.status)}`}>
                      {threat.status}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Indicators</h4>
                    <ul className="space-y-1">
                      {threat.indicators.map((indicator, index) => (
                        <li key={index} className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Affected Systems</h4>
                    <ul className="space-y-1">
                      {threat.affectedSystems.map((system, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          <span className="w-1 h-1 bg-red-400 rounded-full inline-block mr-2"></span>
                          {system}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Mitigation Steps</h4>
                    <ul className="space-y-1">
                      {threat.mitigationSteps.map((step, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          <span className="w-1 h-1 bg-green-400 rounded-full inline-block mr-2"></span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Source: {threat.source} • {threat.timestamp.toLocaleString()}
                  </div>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Metrics Tab */}
        {selectedTab === 'metrics' && securityMetrics && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{securityMetrics.totalEvents.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Critical Events</p>
                    <p className="text-2xl font-bold text-red-600">{securityMetrics.criticalEvents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Resolved Events</p>
                    <p className="text-2xl font-bold text-green-600">{securityMetrics.resolvedEvents.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{((securityMetrics.resolvedEvents / securityMetrics.totalEvents) * 100).toFixed(1)}% resolution rate</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                    <p className="text-2xl font-bold text-blue-600">{securityMetrics.averageResolutionTime}h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Threats and Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Security Threats</h3>
                <div className="space-y-4">
                  {securityMetrics.topThreats.map((threat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{threat.type}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{threat.count}</span>
                            <span className={`text-xs ${threat.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {threat.trend > 0 ? '↑' : '↓'} {Math.abs(threat.trend)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(threat.count / Math.max(...securityMetrics.topThreats.map(t => t.count))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
                <div className="space-y-4">
                  {Object.entries(securityMetrics.complianceStatus).map(([standard, compliant]) => (
                    <div key={standard} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 uppercase">{standard}</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${compliant ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-medium ${compliant ? 'text-green-600' : 'text-red-600'}`}>
                          {compliant ? 'Compliant' : 'Non-Compliant'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Security Event Details</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Event Type</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedEvent.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Severity</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedEvent.severity)}`}>
                      {selectedEvent.severity}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">IP Address</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedEvent.ipAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm text-gray-900">{selectedEvent.location.city}, {selectedEvent.location.country}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-sm text-gray-900">{selectedEvent.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">User Agent</label>
                  <p className="text-sm text-gray-900 font-mono break-all">{selectedEvent.userAgent}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Event Details</label>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <pre className="text-xs text-gray-900">{JSON.stringify(selectedEvent.details, null, 2)}</pre>
                  </div>
                </div>

                {selectedEvent.resolution && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Resolution</label>
                    <p className="text-sm text-gray-900">{selectedEvent.resolution}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      updateEventStatus(selectedEvent.id, 'investigating');
                      setSelectedEvent(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Start Investigation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPatternAnalysis;