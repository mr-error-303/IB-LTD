const request = require('supertest');
const app = require('../test-server');
const { User, Transaction, ActivityLog } = require('../src/models');

describe('Balance Control Functionality', () => {
  let adminToken;
  let testUser;
  let testAdmin;

  beforeAll(async () => {
    // Create test admin user
    testAdmin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      isActive: true,
      isVerified: true
    });

    // Create test regular user
    testUser = await User.create({
      name: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user',
      balance: 1000,
      isActive: true,
      isVerified: true
    });

    // Login as admin to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });

    adminToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $in: ['admin@test.com', 'user@test.com'] } });
    await Transaction.deleteMany({ userId: testUser._id });
    await ActivityLog.deleteMany({ adminId: testAdmin._id });
  });

  describe('Balance Adjustment', () => {
    test('Should successfully adjust user balance with proper logging', async () => {
      const adjustmentData = {
        amount: 500,
        type: 'credit',
        reason: 'Test credit adjustment',
        category: 'manual_adjustment'
      };

      const response = await request(app)
        .post(`/api/admin/users/${testUser._id}/adjust-balance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adjustmentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.newBalance).toBe(1500);

      // Verify user balance was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.balance).toBe(1500);

      // Verify transaction was created
      const transaction = await Transaction.findOne({ 
        userId: testUser._id,
        type: 'balance_adjustment'
      });
      expect(transaction).toBeTruthy();
      expect(transaction.amount).toBe(500);
      expect(transaction.reason).toBe('Test credit adjustment');
    });

    test('Should handle debit adjustment correctly', async () => {
      const adjustmentData = {
        amount: 200,
        type: 'debit',
        reason: 'Test debit adjustment',
        category: 'penalty'
      };

      const response = await request(app)
        .post(`/api/admin/users/${testUser._id}/adjust-balance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adjustmentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.newBalance).toBe(1300);

      // Verify user balance was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.balance).toBe(1300);
    });

    test('Should prevent negative balance if not allowed', async () => {
      const adjustmentData = {
        amount: 2000,
        type: 'debit',
        reason: 'Large debit test',
        category: 'manual_adjustment'
      };

      const response = await request(app)
        .post(`/api/admin/users/${testUser._id}/adjust-balance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adjustmentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient balance');
    });

    test('Should require proper authorization', async () => {
      const adjustmentData = {
        amount: 100,
        type: 'credit',
        reason: 'Unauthorized test',
        category: 'manual_adjustment'
      };

      const response = await request(app)
        .post(`/api/admin/users/${testUser._id}/adjust-balance`)
        .send(adjustmentData);

      expect(response.status).toBe(401);
    });

    test('Should validate required fields', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${testUser._id}/adjust-balance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 100
          // Missing type, reason, category
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Balance History', () => {
    test('Should retrieve user balance history', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${testUser._id}/balance-history`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.transactions)).toBe(true);
      expect(response.body.data.transactions.length).toBeGreaterThan(0);
    });

    test('Should support pagination for balance history', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${testUser._id}/balance-history?page=1&limit=5`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    test('Should filter balance history by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await request(app)
        .get(`/api/admin/users/${testUser._id}/balance-history`)
        .query({
          startDate: yesterday.toISOString(),
          endDate: today.toISOString()
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Balance History Export', () => {
    test('Should export balance history in JSON format', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${testUser._id}/balance-history/export?format=json`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
    });

    test('Should export balance history in CSV format', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${testUser._id}/balance-history/export?format=csv`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
    });

    test('Should require proper authorization for export', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${testUser._id}/balance-history/export`);

      expect(response.status).toBe(401);
    });
  });

  describe('Security and Rate Limiting', () => {
    test('Should apply rate limiting to balance adjustments', async () => {
      const adjustmentData = {
        amount: 10,
        type: 'credit',
        reason: 'Rate limit test',
        category: 'manual_adjustment'
      };

      // Make multiple rapid requests
      const promises = Array(6).fill().map(() =>
        request(app)
          .post(`/api/admin/users/${testUser._id}/adjust-balance`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(adjustmentData)
      );

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('Should log admin actions for balance adjustments', async () => {
      const adjustmentData = {
        amount: 25,
        type: 'credit',
        reason: 'Logging test',
        category: 'manual_adjustment'
      };

      await request(app)
        .post(`/api/admin/users/${testUser._id}/adjust-balance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adjustmentData);

      // Check if activity was logged
      const activityLog = await ActivityLog.findOne({
        adminId: testAdmin._id,
        action: 'adjust_user_balance'
      });

      expect(activityLog).toBeTruthy();
      expect(activityLog.category).toBe('financial_operations');
      expect(activityLog.details.amount).toBe(25);
      expect(activityLog.details.type).toBe('credit');
    });
  });

  describe('Error Handling', () => {
    test('Should handle invalid user ID', async () => {
      const adjustmentData = {
        amount: 100,
        type: 'credit',
        reason: 'Invalid user test',
        category: 'manual_adjustment'
      };

      const response = await request(app)
        .post('/api/admin/users/invalid-id/adjust-balance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adjustmentData);

      expect(response.status).toBe(400);
    });

    test('Should handle non-existent user', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const adjustmentData = {
        amount: 100,
        type: 'credit',
        reason: 'Non-existent user test',
        category: 'manual_adjustment'
      };

      const response = await request(app)
        .post(`/api/admin/users/${fakeUserId}/adjust-balance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adjustmentData);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('User not found');
    });

    test('Should handle invalid adjustment amounts', async () => {
      const invalidAmounts = [-100, 0, 'invalid', null];

      for (const amount of invalidAmounts) {
        const response = await request(app)
          .post(`/api/admin/users/${testUser._id}/adjust-balance`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            amount,
            type: 'credit',
            reason: 'Invalid amount test',
            category: 'manual_adjustment'
          });

        expect(response.status).toBe(400);
      }
    });
  });
});