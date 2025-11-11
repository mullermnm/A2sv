import request from 'supertest';
import { Application } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import createApp from '../../src/app';
import User from '../../src/models/user.model';

/**
 * Integration Tests for User Registration (User Story 1)
 * Tests all acceptance criteria from requirements
 */
describe('POST /api/v1/auth/register - User Registration (User Story 1)', () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;

  // Setup: Start in-memory MongoDB and Express app before all tests
  beforeAll(async () => {
    // Set required environment variables for tests
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
    process.env.JWT_EXPIRES_IN = '7d';
    
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create Express app
    app = createApp();
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
   * Test: Successful Registration (201 Created)
   */
  describe('Success Cases', () => {
    it('should register a new user with valid credentials and return 201', async () => {
      const userData = {
        username: 'johndoe123',
        email: 'john@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');

      // Verify user data (password should NOT be in response)
      expect(response.body.data.user).toHaveProperty('username', userData.username);
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body.data.user).toHaveProperty('role', 'user');
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verify JWT token is returned
      expect(response.body.data.token).toBeTruthy();
      expect(typeof response.body.data.token).toBe('string');
    });

    it('should register user with explicit role=admin', async () => {
      const userData = {
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'AdminPass123!',
        role: 'admin',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.data.user.role).toBe('admin');
    });

    it('should default role to "user" when role is not provided', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.data.user.role).toBe('user');
    });

    it('should hash the password (not stored as plaintext)', async () => {
      const userData = {
        username: 'secureuser',
        email: 'secure@example.com',
        password: 'SecurePass123!',
      };

      await request(app).post('/api/v1/auth/register').send(userData).expect(201);

      // Verify password is hashed in database
      const user = await User.findOne({ email: userData.email }).select('+password');
      expect(user).toBeTruthy();
      expect(user!.password).not.toBe(userData.password);
      expect(user!.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash pattern
    });
  });

  /**
   * Test: Email Validation
   */
  describe('Email Validation (400 Bad Request)', () => {
    it('should reject invalid email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Test123!@#',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should reject email without domain', async () => {
      const userData = {
        username: 'testuser',
        email: 'user@',
        password: 'Test123!@#',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing email', async () => {
      const userData = {
        username: 'testuser',
        password: 'Test123!@#',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Email is required');
    });

    it('should reject duplicate email (400)', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'Test123!@#',
      };

      // Register first user
      await request(app).post('/api/v1/auth/register').send(userData).expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'user2',
          email: 'duplicate@example.com',
          password: 'Test123!@#',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  /**
   * Test: Username Validation (Alphanumeric only)
   */
  describe('Username Validation (400 Bad Request)', () => {
    it('should reject username with special characters', async () => {
      const userData = {
        username: 'user@123',
        email: 'user@example.com',
        password: 'Test123!@#',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0]).toContain('alphanumeric');
    });

    it('should reject username with spaces', async () => {
      const userData = {
        username: 'user name',
        email: 'user@example.com',
        password: 'Test123!@#',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing username', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'Test123!@#',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toContain('Username is required');
    });

    it('should accept valid alphanumeric username', async () => {
      const userData = {
        username: 'user123',
        email: 'valid@example.com',
        password: 'Test123!@#',
      };

      await request(app).post('/api/v1/auth/register').send(userData).expect(201);
    });

    it('should reject duplicate username (400)', async () => {
      const userData = {
        username: 'uniqueuser',
        email: 'user1@example.com',
        password: 'Test123!@#',
      };

      // Register first user
      await request(app).post('/api/v1/auth/register').send(userData).expect(201);

      // Try to register with same username
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'uniqueuser',
          email: 'user2@example.com',
          password: 'Test123!@#',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  /**
   * Test: Password Validation (8+ chars, uppercase, lowercase, number, special char)
   */
  describe('Password Validation (400 Bad Request)', () => {
    it('should reject password shorter than 8 characters', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Pass1!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('at least 8 characters');
    });

    it('should reject password without uppercase letter', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('uppercase');
    });

    it('should reject password without lowercase letter', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'PASSWORD123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('lowercase');
    });

    it('should reject password without number', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password!@#',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('number');
    });

    it('should reject password without special character', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors[0]).toContain('special character');
    });

    it('should reject missing password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toContain('Password is required');
    });

    it('should accept password meeting all requirements', async () => {
      const validPasswords = [
        'Password123!',
        'Test@1234abc',
        'MyP@ssw0rd',
        'Complex!Pass9',
      ];

      for (const password of validPasswords) {
        const userData = {
          username: `user${Math.random().toString(36).substring(7)}`,
          email: `${Math.random().toString(36).substring(7)}@example.com`,
          password,
        };

        await request(app).post('/api/v1/auth/register').send(userData).expect(201);
      }
    });
  });

  /**
   * Test: Response Format
   */
  describe('Response Format', () => {
    it('should never return password in response', async () => {
      const userData = {
        username: 'secureuser',
        email: 'secure@example.com',
        password: 'SecurePass123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain(userData.password);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return errors array for validation failures', async () => {
      const userData = {
        username: 'test',
        email: 'invalid',
        password: 'weak',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
});
