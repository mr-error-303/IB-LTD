const request = require('supertest');
const app = require('../test-server');
const { User, AdminRole, Permission, ActivityLog } = require('../src/models');

describe('Role Management Functionality', () => {
  let adminToken;
  let testAdmin;
  let testRole;
  let testPermission;
  let testUser;

  beforeAll(async () => {
    // Create test admin user
    testAdmin = await User.create({
      name: 'Test Admin',
      email: 'roleadmin@test.com',
      password: 'password123',
      role: 'admin',
      isActive: true,
      isVerified: true
    });

    // Create test permission
    testPermission = await Permission.create({
      name: 'test_permission',
      description: 'Test permission for role testing',
      category: 'testing',
      isActive: true,
      createdBy: testAdmin._id
    });

    // Create test user for role assignment
    testUser = await User.create({
      name: 'Test User',
      email: 'roleuser@test.com',
      password: 'password123',
      role: 'user',
      isActive: true,
      isVerified: true
    });

    // Login as admin to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'roleadmin@test.com',
        password: 'password123'
      });

    adminToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ 
      email: { $in: ['roleadmin@test.com', 'roleuser@test.com'] } 
    });
    await AdminRole.deleteMany({ name: /^Test/ });
    await Permission.deleteMany({ name: 'test_permission' });
    await ActivityLog.deleteMany({ adminId: testAdmin._id });
  });

  describe('Role CRUD Operations', () => {
    test('Should create a new role successfully', async () => {
      const roleData = {
        name: 'Test Role',
        description: 'A test role for testing purposes',
        level: 5,
        permissions: {
          user_management: {
            view_users: true,
            edit_users: false,
            delete_users: false
          },
          financial_operations: {
            view_transactions: true,
            adjust_balances: false
          }
        }
      };

      const response = await request(app)
        .post('/api/admin/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.role.name).toBe('Test Role');
      expect(response.body.data.role.level).toBe(5);

      testRole = response.body.data.role;
    });

    test('Should retrieve all roles with pagination', async () => {
      const response = await request(app)
        .get('/api/admin/roles?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.roles)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('Should retrieve a specific role by ID', async () => {
      const response = await request(app)
        .get(`/api/admin/roles/${testRole._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.role.name).toBe('Test Role');
    });

    test('Should update an existing role', async () => {
      const updateData = {
        name: 'Updated Test Role',
        description: 'Updated description',
        level: 6,
        permissions: {
          user_management: {
            view_users: true,
            edit_users: true,
            delete_users: false
          }
        }
      };

      const response = await request(app)
        .put(`/api/admin/roles/${testRole._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.role.name).toBe('Updated Test Role');
      expect(response.body.data.role.level).toBe(6);
    });

    test('Should get role statistics', async () => {
      const response = await request(app)
        .get('/api/admin/roles/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.roleDistribution).toBeDefined();
    });
  });

  describe('Role Assignment', () => {
    test('Should assign role to user successfully', async () => {
      const response = await request(app)
        .post(`/api/admin/roles/${testRole._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: testUser._id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('sub_admin');
      expect(response.body.data.user.adminRole).toBe('Updated Test Role');

      // Verify user was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.role).toBe('sub_admin');
      expect(updatedUser.adminRole.toString()).toBe(testRole._id);
    });

    test('Should revoke role from user successfully', async () => {
      const response = await request(app)
        .post('/api/admin/roles/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: testUser._id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('user');

      // Verify user was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.role).toBe('user');
      expect(updatedUser.adminRole).toBeUndefined();
    });
  });

  describe('Permission Management', () => {
    test('Should create a new permission successfully', async () => {
      const permissionData = {
        name: 'test_new_permission',
        description: 'A new test permission',
        category: 'testing',
        isActive: true
      };

      const response = await request(app)
        .post('/api/admin/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(permissionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.permission.name).toBe('test_new_permission');
    });

    test('Should retrieve all permissions', async () => {
      const response = await request(app)
        .get('/api/admin/permissions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.permissions)).toBe(true);
      expect(response.body.data.categories).toBeDefined();
    });

    test('Should get permission statistics', async () => {
      const response = await request(app)
        .get('/api/admin/permissions/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.categoryDistribution).toBeDefined();
    });

    test('Should update an existing permission', async () => {
      const updateData = {
        name: 'updated_test_permission',
        description: 'Updated test permission description',
        category: 'updated_testing'
      };

      const response = await request(app)
        .put(`/api/admin/permissions/${testPermission._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.permission.name).toBe('updated_test_permission');
    });
  });

  describe('Validation and Error Handling', () => {
    test('Should prevent creating role with duplicate name', async () => {
      const roleData = {
        name: 'Updated Test Role', // Same as existing role
        description: 'Duplicate name test',
        level: 3,
        permissions: {}
      };

      const response = await request(app)
        .post('/api/admin/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('Should validate required fields for role creation', async () => {
      const response = await request(app)
        .post('/api/admin/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing required fields
          description: 'Missing name and level'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Should validate role level range', async () => {
      const roleData = {
        name: 'Invalid Level Role',
        description: 'Testing invalid level',
        level: 15, // Invalid level (should be 1-10)
        permissions: {}
      };

      const response = await request(app)
        .post('/api/admin/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('level must be between 1 and 10');
    });

    test('Should prevent deleting role assigned to users', async () => {
      // First assign the role to a user
      await request(app)
        .post(`/api/admin/roles/${testRole._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: testUser._id });

      // Try to delete the role
      const response = await request(app)
        .delete(`/api/admin/roles/${testRole._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('assigned to');
    });

    test('Should handle non-existent role ID', async () => {
      const fakeRoleId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/admin/roles/${fakeRoleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('Security and Authorization', () => {
    test('Should require authentication for role operations', async () => {
      const response = await request(app)
        .get('/api/admin/roles');

      expect(response.status).toBe(401);
    });

    test('Should require proper permissions for role management', async () => {
      // Create a user without role management permissions
      const limitedUser = await User.create({
        name: 'Limited User',
        email: 'limited@test.com',
        password: 'password123',
        role: 'user',
        isActive: true,
        isVerified: true
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'limited@test.com',
          password: 'password123'
        });

      const limitedToken = loginResponse.body.token;

      const response = await request(app)
        .get('/api/admin/roles')
        .set('Authorization', `Bearer ${limitedToken}`);

      expect(response.status).toBe(403);

      // Clean up
      await User.deleteOne({ email: 'limited@test.com' });
    });

    test('Should log role management activities', async () => {
      const roleData = {
        name: 'Logging Test Role',
        description: 'Role for testing activity logging',
        level: 4,
        permissions: {}
      };

      await request(app)
        .post('/api/admin/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(roleData);

      // Check if activity was logged
      const activityLog = await ActivityLog.findOne({
        adminId: testAdmin._id,
        action: 'create_role'
      });

      expect(activityLog).toBeTruthy();
      expect(activityLog.category).toBe('role_management');
      expect(activityLog.details.roleName).toBe('Logging Test Role');
    });
  });

  describe('Search and Filtering', () => {
    test('Should search roles by name', async () => {
      const response = await request(app)
        .get('/api/admin/roles?search=Test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.roles.length).toBeGreaterThan(0);
      expect(response.body.data.roles[0].name).toContain('Test');
    });

    test('Should filter roles by level', async () => {
      const response = await request(app)
        .get('/api/admin/roles?level=6')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      if (response.body.data.roles.length > 0) {
        expect(response.body.data.roles[0].level).toBe(6);
      }
    });

    test('Should filter permissions by category', async () => {
      const response = await request(app)
        .get('/api/admin/permissions?category=testing')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      if (response.body.data.permissions.length > 0) {
        expect(response.body.data.permissions[0].category).toBe('testing');
      }
    });
  });

  afterAll(async () => {
    // Clean up the test role if it still exists
    if (testRole && testRole._id) {
      // First revoke any assignments
      await request(app)
        .post('/api/admin/roles/revoke')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: testUser._id });

      // Then delete the role
      await request(app)
        .delete(`/api/admin/roles/${testRole._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
  });
});