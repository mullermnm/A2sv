import request from 'supertest';
import { Application } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import createApp from '../../src/app';
import User from '../../src/models/user.model';
import Product from '../../src/models/product.model';

/**
 * Integration Tests for Product Management (User Stories 3-8)
 * Tests all product CRUD operations and access control
 */
describe('Product Management Tests', () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;
  let adminToken: string;
  let userToken: string;
  let adminUserId: string;

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

    // Create admin user and get token
    const adminResponse = await request(app).post('/api/v1/auth/register').send({
      username: 'adminuser',
      email: 'admin@test.com',
      password: 'Admin123!@#',
      role: 'admin',
    });
    adminToken = adminResponse.body.data.token;
    adminUserId = adminResponse.body.data.user._id;

    // Create regular user and get token
    const userResponse = await request(app).post('/api/v1/auth/register').send({
      username: 'regularuser',
      email: 'user@test.com',
      password: 'User123!@#',
    });
    userToken = userResponse.body.data.token;
  });

  // Cleanup: Clear products after each test
  afterEach(async () => {
    await Product.deleteMany({});
  });

  // Teardown: Close connections after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  /**
   * Test: Create Product (User Story 3) - Admin Only
   */
  describe('POST /api/v1/products - Create Product (User Story 3)', () => {
    describe('Success Cases', () => {
      it('should create a new product with valid data and admin token (201)', async () => {
        const productData = {
          name: 'Test Product',
          description: 'This is a test product description',
          price: 99.99,
          stock: 50,
          category: 'electronics',
        };

        const response = await request(app)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(productData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('_id');
        expect(response.body.data.name).toBe(productData.name);
        expect(response.body.data.price).toBe(productData.price);
        expect(response.body.data.stock).toBe(productData.stock);
        expect(response.body.data.category).toBe(productData.category);
      });

      it('should auto-assign userId from authenticated admin', async () => {
        const productData = {
          name: 'Test Product',
          description: 'Test description',
          price: 50,
          stock: 10,
          category: 'books',
        };

        const response = await request(app)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(productData)
          .expect(201);

        expect(response.body.data.userId).toBeDefined();
        expect(response.body.data.userId).toBe(adminUserId);
      });
    });

    describe('Authorization Tests (401/403)', () => {
      it('should reject request without authentication token (401)', async () => {
        const productData = {
          name: 'Test Product',
          description: 'Test description',
          price: 50,
          stock: 10,
          category: 'books',
        };

        await request(app).post('/api/v1/products').send(productData).expect(401);
      });

      it('should reject request from regular user (403)', async () => {
        const productData = {
          name: 'Test Product',
          description: 'Test description',
          price: 50,
          stock: 10,
          category: 'books',
        };

        await request(app)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${userToken}`)
          .send(productData)
          .expect(403);
      });
    });

    describe('Validation Tests (400 Bad Request)', () => {
      it('should reject product with missing name', async () => {
        const productData = {
          description: 'Test description',
          price: 50,
          stock: 10,
          category: 'books',
        };

        const response = await request(app)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(productData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
      });

      it('should reject product with negative price', async () => {
        const productData = {
          name: 'Test Product',
          description: 'Test description',
          price: -10,
          stock: 10,
          category: 'books',
        };

        const response = await request(app)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(productData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
      });

      it('should reject product with negative stock', async () => {
        const productData = {
          name: 'Test Product',
          description: 'Test description',
          price: 50,
          stock: -5,
          category: 'books',
        };

        const response = await request(app)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(productData)
          .expect(400);

        expect(response.body.errors).toBeDefined();
      });
    });

    describe('File Upload Tests', () => {
      const testImagePath = path.join(__dirname, '..', 'fixtures', 'test-image.png');

      // Create a test image if it doesn't exist
      beforeAll(() => {
        const fixturesDir = path.join(__dirname, '..', 'fixtures');
        if (!fs.existsSync(fixturesDir)) {
          fs.mkdirSync(fixturesDir, { recursive: true });
        }
        if (!fs.existsSync(testImagePath)) {
          // Create a minimal 1x1 PNG image (Base64 encoded)
          const pngBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
          );
          fs.writeFileSync(testImagePath, pngBuffer);
        }
      });

      it('should create product with image upload (multipart/form-data)', async () => {
        const response = await request(app)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('name', 'Product with Image')
          .field('description', 'This product has an image')
          .field('price', '149.99')
          .field('stock', '25')
          .field('category', 'Electronics')
          .attach('productImage', testImagePath)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('productImage');
        expect(response.body.data.productImage).toMatch(/^\/api\/uploads\/products\//);
      });

      it('should create product without image (image is optional)', async () => {
        const productData = {
          name: 'Product without Image',
          description: 'This product has no image',
          price: 79.99,
          stock: 15,
          category: 'Books',
        };

        const response = await request(app)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(productData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.productImage).toBeUndefined();
      });

      it('should reject file larger than 5MB', async () => {
        // Create a large buffer (> 5MB)
        const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB
        const largePath = path.join(__dirname, '..', 'fixtures', 'large-file.png');
        fs.writeFileSync(largePath, largeFile);

        const response = await request(app)
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('name', 'Product with Large Image')
          .field('description', 'This should fail')
          .field('price', '99.99')
          .field('stock', '10')
          .field('category', 'Electronics')
          .attach('productImage', largePath);

        // Cleanup
        fs.unlinkSync(largePath);

        // Should reject with 400 or 413
        expect([400, 413]).toContain(response.status);
      });
    });
  });

  /**
   * Test: Update Product (User Story 4) - Admin Only
   */
  describe('PUT /api/v1/products/:id - Update Product (User Story 4)', () => {
    let productId: string;

    beforeEach(async () => {
      // Create a product before each test
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Original Product',
          description: 'Original description',
          price: 100,
          stock: 20,
          category: 'electronics',
        });
      productId = response.body.data._id;
    });

    describe('Success Cases', () => {
      it('should update product with valid data (200)', async () => {
        const updateData = {
          name: 'Updated Product',
          price: 150,
        };

        const response = await request(app)
          .put(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updateData.name);
        expect(response.body.data.price).toBe(updateData.price);
        // Original values should remain
        expect(response.body.data.category).toBe('electronics');
      });

      it('should support partial updates', async () => {
        const updateData = {
          stock: 50,
        };

        const response = await request(app)
          .put(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.data.stock).toBe(updateData.stock);
        expect(response.body.data.name).toBe('Original Product');
      });
    });

    describe('Error Cases', () => {
      it('should return 404 for non-existent product', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const updateData = { name: 'Updated' };

        await request(app)
          .put(`/api/v1/products/${fakeId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(404);
      });

      it('should reject request from regular user (403)', async () => {
        const updateData = { name: 'Updated' };

        await request(app)
          .put(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData)
          .expect(403);
      });

      it('should reject request without authentication (401)', async () => {
        const updateData = { name: 'Updated' };

        await request(app)
          .put(`/api/v1/products/${productId}`)
          .send(updateData)
          .expect(401);
      });
    });
  });

  /**
   * Test: Get Products with Pagination and Search (User Stories 5 & 6) - Public
   */
  describe('GET /api/v1/products - Get Products List (User Stories 5 & 6)', () => {
    beforeEach(async () => {
      // Create multiple products for pagination/search tests
      await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Laptop Computer',
          description: 'High performance laptop',
          price: 1200,
          stock: 10,
          category: 'electronics',
        });

      await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Wireless Mouse',
          description: 'Ergonomic mouse',
          price: 25,
          stock: 50,
          category: 'electronics',
        });

      await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Programming Book',
          description: 'Learn TypeScript',
          price: 40,
          stock: 30,
          category: 'books',
        });
    });

    describe('Success Cases - Public Access', () => {
      it('should return all products without authentication (200)', async () => {
        const response = await request(app).get('/api/v1/products').expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should return paginated results', async () => {
        const response = await request(app)
          .get('/api/v1/products')
          .query({ page: 1, limit: 2 })
          .expect(200);

        expect(response.body.data.length).toBeLessThanOrEqual(2);
        expect(response.body).toHaveProperty('totalPages');
        expect(response.body).toHaveProperty('pageNumber');
        expect(response.body).toHaveProperty('pageSize');
      });

      it('should search products by name (case-insensitive)', async () => {
        const response = await request(app)
          .get('/api/v1/products')
          .query({ search: 'laptop' })
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0].name.toLowerCase()).toContain('laptop');
      });

      it('should search products with partial match', async () => {
        const response = await request(app)
          .get('/api/v1/products')
          .query({ search: 'Mou' })
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0].name).toContain('Mouse');
      });

      it('should return empty array for non-matching search', async () => {
        const response = await request(app)
          .get('/api/v1/products')
          .query({ search: 'NonExistentProduct' })
          .expect(200);

        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(0);
      });
    });

    describe('Pagination Details', () => {
      it('should include correct pagination metadata', async () => {
        const response = await request(app)
          .get('/api/v1/products')
          .query({ page: 1, limit: 2 })
          .expect(200);

        expect(response.body.pageNumber).toBe(1);
        expect(response.body.pageSize).toBe(2);
        expect(response.body.totalPages).toBeGreaterThan(0);
        expect(response.body.totalSize).toBeGreaterThan(0);
      });
    });
  });

  /**
   * Test: Get Product Details (User Story 7) - Public
   */
  describe('GET /api/v1/products/:id - Get Product Details (User Story 7)', () => {
    let productId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          description: 'Test description',
          price: 100,
          stock: 20,
          category: 'electronics',
        });
      productId = response.body.data._id;
    });

    describe('Success Cases', () => {
      it('should return product details without authentication (200)', async () => {
        const response = await request(app)
          .get(`/api/v1/products/${productId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBe(productId);
        expect(response.body.data.name).toBe('Test Product');
        expect(response.body.data.price).toBe(100);
      });

      it('should return complete product information', async () => {
        const response = await request(app)
          .get(`/api/v1/products/${productId}`)
          .expect(200);

        expect(response.body.data).toHaveProperty('name');
        expect(response.body.data).toHaveProperty('description');
        expect(response.body.data).toHaveProperty('price');
        expect(response.body.data).toHaveProperty('stock');
        expect(response.body.data).toHaveProperty('category');
        expect(response.body.data).toHaveProperty('userId');
      });
    });

    describe('Error Cases', () => {
      it('should return 404 for non-existent product', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        await request(app).get(`/api/v1/products/${fakeId}`).expect(404);
      });

      it('should return 400 for invalid product ID format', async () => {
        await request(app).get('/api/v1/products/invalid-id').expect(400);
      });
    });
  });

  /**
   * Test: Delete Product (User Story 8) - Admin Only
   */
  describe('DELETE /api/v1/products/:id - Delete Product (User Story 8)', () => {
    let productId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Product to Delete',
          description: 'Will be deleted',
          price: 50,
          stock: 10,
          category: 'test',
        });
      productId = response.body.data._id;
    });

    describe('Success Cases', () => {
      it('should delete product with admin token (200)', async () => {
        const response = await request(app)
          .delete(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify product is deleted
        await request(app).get(`/api/v1/products/${productId}`).expect(404);
      });
    });

    describe('Authorization Tests', () => {
      it('should reject request from regular user (403)', async () => {
        await request(app)
          .delete(`/api/v1/products/${productId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should reject request without authentication (401)', async () => {
        await request(app).delete(`/api/v1/products/${productId}`).expect(401);
      });
    });

    describe('Error Cases', () => {
      it('should return 404 for non-existent product', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        await request(app)
          .delete(`/api/v1/products/${fakeId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should return 404 for invalid product ID format', async () => {
        await request(app)
          .delete('/api/v1/products/invalid-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });
    });
  });

  /**
   * Test: Response Format Consistency
   */
  describe('Response Format Consistency', () => {
    it('should have consistent success response format', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 50,
          stock: 10,
          category: 'test',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.success).toBe(true);
    });

    it('should have consistent error response format', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test',
          description: 'Test',
          price: -50, // Invalid price
          stock: 10,
          category: 'test',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.success).toBe(false);
    });
  });
});
