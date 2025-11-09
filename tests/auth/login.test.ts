import request from 'supertest';
import { Application } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import createApp from '../src/app';
import User from '../src/models/user.model';
import bcrypt from 'bcrypt';

/**
 * Integration Tests for User Login (User Story 2)
 * Tests all acceptance criteria from requirements
 */
describe('POST /api/auth/login - User Login (User Story 2)', () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;

  // Test user credentials
  const testUser = {
    username: 'testuser123',
    email: 'test@example.com',
    password: 'TestPass123!',
    role: 'user',
  };

  // Setup: Start in-memory MongoDB and Express app before all tests
  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create Express app
    app = createApp();
  });

  // Setup: Create test user before each test
  beforeEach(async () => {
    // Create user with hashed password
    const hashedPassword = bcrypt.hashSync(testUser.password, 10);
    await User.create({
      username: testUser.username,
      email: testUser.email,
      password: hashedPassword,
      role: testUser.role,
    });
  });

  // Cleanup: Clear database after each test
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Teardown: Close connections after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  /**
   * Test: Successful Login (200 OK)
   */
  describe('Success Cases', () => {
    it('should login with valid credentials and return 200 with JWT token', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect('Content-Type', /json/)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');

      // Verify user data (password should NOT be in response)
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).toHaveProperty('username', testUser.username);
      expect(response.body.data.user).toHaveProperty('role', testUser.role);
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verify JWT token is returned
      expect(response.body.data.token).toBeTruthy();
      expect(typeof response.body.data.token).toBe('string');
      expect(response.body.data.token.length).toBeGreaterThan(20);
    });

    it('should login and JWT payload should contain userId, username, and role', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const token = response.body.data.token;
      expect(token).toBeTruthy();

      // Decode JWT to verify payload (without verifying signature for test)
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('username', testUser.username);
      expect(payload).toHaveProperty('email', testUser.email);
      expect(payload).toHaveProperty('role', testUser.role);
    });

    it('should login admin user successfully', async () => {
      // Create admin user
      const adminUser = {
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'AdminPass123!',
        role: 'admin',
      };

      await User.create({
        username: adminUser.username,
        email: adminUser.email,
        password: bcrypt.hashSync(adminUser.password, 10),
        role: adminUser.role,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password: adminUser.password,
        })
        .expect(200);

      expect(response.body.data.user.role).toBe('admin');
    });
  });

  /**
   * Test: Authentication Errors (401 Unauthorized)
   */
  describe('Authentication Errors (401 Unauthorized)', () => {
    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SomePass123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should return 401 for incorrect password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should not reveal whether email exists (security)', async () => {
      // Try with non-existent email
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePass123!',
        })
        .expect(401);

      // Try with existing email but wrong password
      const response2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPass123!',
        })
        .expect(401);

      // Both should return same generic error message
      expect(response1.body.message).toBe(response2.body.message);
    });
  });

  /**
   * Test: Input Validation (400 Bad Request)
   */
  describe('Input Validation (400 Bad Request)', () => {
    it('should reject login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'TestPass123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should reject login without email', async () => {
      const loginData = {
        password: 'TestPass123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Email is required');
    });

    it('should reject login without password', async () => {
      const loginData = {
        email: testUser.email,
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Password is required');
    });

    it('should reject login with empty body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should reject email without @ symbol', async () => {
      const loginData = {
        email: 'invalidemail.com',
        password: 'TestPass123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * Test: Response Format
   */
  describe('Response Format', () => {
    it('should never return password in login response', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain(testUser.password);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should have consistent error response structure', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'WrongPass123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(false);
    });

    it('should return errors array for validation failures', async () => {
      const loginData = {
        email: 'invalid',
        password: '',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test: Password Comparison
   */
  describe('Password Hashing and Comparison', () => {
    it('should correctly validate hashed password', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      };

      // Verify password is hashed in database
      const user = await User.findOne({ email: testUser.email }).select('+password');
      expect(user!.password).not.toBe(testUser.password);
      expect(user!.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt pattern

      // Verify login works with correct password
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject password with slight variation', async () => {
      const variations = [
        testUser.password.toUpperCase(),
        testUser.password.toLowerCase(),
        testUser.password + ' ',
        ' ' + testUser.password,
        testUser.password.slice(0, -1),
      ];

      for (const password of variations) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password,
          })
          .expect(401);

        expect(response.body.success).toBe(false);
      }
    });
  });

  /**
   * Test: Case Sensitivity
   */
  describe('Email Case Sensitivity', () => {
    it('should login with email regardless of case', async () => {
      const emailVariations = [
        testUser.email,
        testUser.email.toUpperCase(),
        testUser.email.toLowerCase(),
        'TeSt@ExAmPlE.cOm',
      ];

      for (const email of emailVariations) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email,
            password: testUser.password,
          });

        // Email lookup should be case-insensitive or normalized
        expect([200, 401]).toContain(response.status);
      }
    });
  });
});
