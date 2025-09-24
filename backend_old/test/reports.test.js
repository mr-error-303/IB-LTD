const request = require('supertest');
const app = require('../test-server');
const { User, Account, Transaction, ActivityLog, AdminRole } = require('../src/models');

describe('Reporting Functionality', () => {
  let adminToken;
  let testAdmin;
  let testUser;
  let testTransaction;

  beforeAll(async () => {
    // Create test admin user
    testAdmin = await User.create({
      name: 'Report Admin',
      email: 'reportadmin@test.com',
      password: 'password123',
      role: 'admin',
      isActive: true,
      isVerified: true
    });

    // Create test user for transactions
    testUser = await User.create({
      name: 'Report Test User',
      email: 'reportuser@test.com',
      password: 'password123',
      role: 'user',
      isActive: true,
      isVerified: true,
      balance: 1000
    });

    // Create test account first
    const testAccount = await Account.create({
      userId: testUser._id,
      accountNumber: '1234567890',
      accountType: 'savings',
      balance: 1000,
      currency: 'USD',
      isActive: true
    });

    // Create test transaction
    testTransaction = await Transaction.create({
      userId: testUser._id,
      accountId: testAccount._id,
      type: 'deposit',
      amount: 500,
      status: 'completed',
      description: 'Test deposit for reporting',
      balanceBefore: 500,
      balanceAfter: 1000,
      createdBy: testAdmin._id
    });

    // Create test activity log
    await ActivityLog.create({
      adminId: testAdmin._id,
      adminName: testAdmin.name,
      adminEmail: testAdmin.email,
      action: 'balance_adjusted',
      category: 'balance_management',
      targetType: 'user',
      targetId: testUser._id,
      targetName: testUser.name,
      description: 'Test balance adjustment for reporting',
      details: {
        amount: 500,
        type: 'deposit',
        reason: 'Test deposit'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent'
    });

    // Login as admin to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'reportadmin@test.com',
        password: 'password123'
      });

    adminToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ 
      email: { $in: ['reportadmin@test.com', 'reportuser@test.com'] } 
    });
    await Transaction.deleteMany({ userId: testUser._id });
    await ActivityLog.deleteMany({ adminId: testAdmin._id });
  });

  describe('Activity Reports', () => {
    test('Should generate activity report successfully', async () => {
      const response = await request(app)
        .get('/api/admin/reports/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          format: 'json'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.report).toBeDefined();
      expect(response.body.data.report.summary).toBeDefined();
      expect(response.body.data.report.activities).toBeDefined();
      expect(Array.isArray(response.body.data.report.activities)).toBe(true);
    });

    test('Should generate activity report with filters', async () => {
      const response = await request(app)
        .get('/api/admin/reports/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          category: 'financial_operations',
          adminId: testAdmin._id,
          format: 'json'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.report.activities.length).toBeGreaterThanOrEqual(0);
    });

    test('Should export activity report as CSV', async () => {
      const response = await request(app)
        .get('/api/admin/reports/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          format: 'csv'
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    test('Should validate date range for activity reports', async () => {
      const response = await request(app)
        .get('/api/admin/reports/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // End before start
          format: 'json'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('End date must be after start date');
    });
  });

  describe('Financial Reports', () => {
    test('Should generate financial report successfully', async () => {
      const response = await request(app)
        .get('/api/admin/reports/financial')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          format: 'json'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.report).toBeDefined();
      expect(response.body.data.report.summary).toBeDefined();
      expect(response.body.data.report.transactions).toBeDefined();
      expect(response.body.data.report.summary.totalTransactions).toBeDefined();
      expect(response.body.data.report.summary.totalVolume).toBeDefined();
    });

    test('Should filter financial report by transaction type', async () => {
      const response = await request(app)
        .get('/api/admin/reports/financial')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          transactionType: 'deposit',
          format: 'json'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      if (response.body.data.report.transactions.length > 0) {
        expect(response.body.data.report.transactions[0].type).toBe('deposit');
      }
    });

    test('Should filter financial report by status', async () => {
      const response = await request(app)
        .get('/api/admin/reports/financial')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          status: 'completed',
          format: 'json'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      if (response.body.data.report.transactions.length > 0) {
        expect(response.body.data.report.transactions[0].status).toBe('completed');
      }
    });

    test('Should export financial report as Excel', async () => {
      const response = await request(app)
        .get('/api/admin/reports/financial')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          format: 'excel'
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    test('Should validate amount range for financial reports', async () => {
      const response = await request(app)
        .get('/api/admin/reports/financial')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          minAmount: 1000,
          maxAmount: 100, // Max less than min
          format: 'json'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Maximum amount must be greater than minimum amount');
    });
  });

  describe('Security Reports', () => {
    test('Should generate security report successfully', async () => {
      const response = await request(app)
        .get('/api/admin/reports/security')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          format: 'json'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.report).toBeDefined();
      expect(response.body.data.report.summary).toBeDefined();
      expect(response.body.data.report.securityEvents).toBeDefined();
      expect(response.body.data.report.summary.totalEvents).toBeDefined();
      expect(response.body.data.report.summary.criticalEvents).toBeDefined();
    });

    test('Should filter security report by severity', async () => {
      const response = await request(app)
        .get('/api/admin/reports/security')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          severity: 'high',
          format: 'json'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      if (response.body.data.report.securityEvents.length > 0) {
        expect(response.body.data.report.securityEvents[0].severity).toBe('high');
      }
    });

    test('Should filter security report by event type', async () => {
      const response = await request(app)
        .get('/api/admin/reports/security')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          eventType: 'failed_login',
          format: 'json'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      if (response.body.data.report.securityEvents.length > 0) {
        expect(response.body.data.report.securityEvents[0].eventType).toBe('failed_login');
      }
    });

    test('Should export security report as PDF', async () => {
      const response = await request(app)
        .get('/api/admin/reports/security')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          format: 'pdf'
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
    });
  });

  describe('Report Validation and Error Handling', () => {
    test('Should require valid date format', async () => {
      const response = await request(app)
        .get('/api/admin/reports/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: 'invalid-date',
          endDate: new Date().toISOString(),
          format: 'json'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid date format');
    });

    test('Should validate date range limits', async () => {
      const response = await request(app)
        .get('/api/admin/reports/financial')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), // More than 1 year ago
          endDate: new Date().toISOString(),
          format: 'json'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Date range cannot exceed 365 days');
    });

    test('Should validate supported export formats', async () => {
      const response = await request(app)
        .get('/api/admin/reports/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          format: 'unsupported'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unsupported export format');
    });

    test('Should handle missing required parameters', async () => {
      const response = await request(app)
        .get('/api/admin/reports/financial')
        .set('Authorization', `Bearer ${adminToken}`);
        // Missing startDate and endDate

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Start date and end date are required');
    });
  });

  describe('Report Security and Authorization', () => {
    test('Should require authentication for report access', async () => {
      const response = await request(app)
        .get('/api/admin/reports/activity');

      expect(response.status).toBe(401);
    });

    test('Should require proper permissions for report generation', async () => {
      // Create a user without report permissions
      const limitedUser = await User.create({
        name: 'Limited Report User',
        email: 'limitedreport@test.com',
        password: 'password123',
        role: 'user',
        isActive: true,
        isVerified: true
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'limitedreport@test.com',
          password: 'password123'
        });

      const limitedToken = loginResponse.body.token;

      const response = await request(app)
        .get('/api/admin/reports/financial')
        .set('Authorization', `Bearer ${limitedToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          format: 'json'
        });

      expect(response.status).toBe(403);

      // Clean up
      await User.deleteOne({ email: 'limitedreport@test.com' });
    });

    test('Should log report generation activities', async () => {
      await request(app)
        .get('/api/admin/reports/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          format: 'json'
        });

      // Check if activity was logged
      const activityLog = await ActivityLog.findOne({
        adminId: testAdmin._id,
        action: 'generate_report'
      });

      expect(activityLog).toBeTruthy();
      expect(activityLog.category).toBe('reporting');
      expect(activityLog.details.reportType).toBe('activity');
    });
  });

  describe('Report Performance and Limits', () => {
    test('Should handle large date ranges efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get('/api/admin/reports/financial')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          endDate: new Date().toISOString(),
          format: 'json'
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    test('Should implement pagination for large result sets', async () => {
      const response = await request(app)
        .get('/api/admin/reports/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          format: 'json',
          page: 1,
          limit: 50
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(50);
    });

    test('Should respect rate limiting for report generation', async () => {
      // Make multiple rapid requests
      const promises = Array(6).fill().map(() =>
        request(app)
          .get('/api/admin/reports/activity')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
            format: 'json'
          })
      );

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});