import request from 'supertest';
import { Application } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import createApp from '../../src/app';
import User from '../../src/models/user.model';
import Product from '../../src/models/product.model';
import Order from '../../src/models/order.model';

/**
 * Integration Tests for Order Management (User Stories 9-10)
 * Tests order placement with transactions and order history retrieval
 */
describe('Order Management Tests', () => {
  let app: Application;
  let mongoServer: MongoMemoryReplSet;
  let adminToken: string;
  let userToken: string;
  let userId: string;
  let productId1: string;
  let productId2: string;

  // Setup: Start in-memory MongoDB and Express app before all tests
  beforeAll(async () => {
    jest.setTimeout(120000); // 2 minutes for replica set initialization
    // Set required environment variables for tests
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
    process.env.JWT_EXPIRES_IN = '7d';

    // Start in-memory MongoDB Replica Set for transaction support
    mongoServer = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create Express app
    app = createApp();

    // Create admin user and get token
    const adminResponse = await request(app).post('/api/auth/register').send({
      username: 'adminuser',
      email: 'admin@test.com',
      password: 'Admin123!@#',
      role: 'admin',
    });
    adminToken = adminResponse.body.data.token;

    // Create regular user and get token
    const userResponse = await request(app).post('/api/auth/register').send({
      username: 'regularuser',
      email: 'user@test.com',
      password: 'User123!@#',
    });
    userToken = userResponse.body.data.token;
    userId = userResponse.body.data.user._id;

    // Create test products
    const product1Response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product 1',
        description: 'First test product',
        price: 100,
        stock: 50,
        category: 'electronics',
      });
    productId1 = product1Response.body.data._id;

    const product2Response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product 2',
        description: 'Second test product',
        price: 200,
        stock: 30,
        category: 'electronics',
      });
    productId2 = product2Response.body.data._id;
  });

  // Ensure clean state before each test
  beforeEach(async () => {
    // Clear all orders
    await Order.deleteMany({});
    // Reset product stock to original values
    await Product.findByIdAndUpdate(productId1, { $set: { stock: 50 } });
    await Product.findByIdAndUpdate(productId2, { $set: { stock: 30 } });
  });

  // Cleanup after each test
  afterEach(async () => {
    await Order.deleteMany({});
  });

  // Teardown: Close connections after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  /**
   * Test: Place Order (User Story 9) - POST /api/orders
   */
  describe('POST /api/orders - Place Order (User Story 9)', () => {
    describe('Success Cases', () => {
      it('should place order with single product (201)', async () => {
        const orderData = {
          products: [
            {
              productId: productId1,
              quantity: 2,
            },
          ],
          description: 'Test order',
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('_id');
        expect(response.body.data.products).toHaveLength(1);
        expect(response.body.data.products[0].quantity).toBe(2);
        expect(response.body.data.totalPrice).toBe(200); // 100 * 2
        expect(response.body.data.status).toBe('pending');
      });

      it('should place order with multiple products (201)', async () => {
        const orderData = {
          products: [
            { productId: productId1, quantity: 1 },
            { productId: productId2, quantity: 2 },
          ],
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.products).toHaveLength(2);
        expect(response.body.data.totalPrice).toBe(500); // (100 * 1) + (200 * 2)
      });

      it('should calculate total price on backend', async () => {
        const orderData = {
          products: [
            { productId: productId1, quantity: 2 },
          ],
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(201);

        // Total should be calculated from database prices (100 * 2 = 200)
        expect(response.body.data.totalPrice).toBe(200);
      });

      it('should update product stock after order placement', async () => {
        const orderData = {
          products: [
            { productId: productId1, quantity: 5 },
          ],
        };

        await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(201);

        // Verify stock was updated
        const productResponse = await request(app)
          .get(`/api/products/${productId1}`)
          .expect(200);

        expect(productResponse.body.data.stock).toBe(45); // 50 - 5
      });

      it('should associate order with authenticated user', async () => {
        const orderData = {
          products: [{ productId: productId1, quantity: 1 }],
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(201);

        expect(response.body.data.userId).toBe(userId);
      });

      it('should allow order without description', async () => {
        const orderData = {
          products: [{ productId: productId1, quantity: 1 }],
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(201);

        expect(response.body.success).toBe(true);
      });
    });

    describe('Stock Validation (400 Bad Request)', () => {
      it('should reject order if insufficient stock', async () => {
        const orderData = {
          products: [
            { productId: productId1, quantity: 100 }, // More than available (50)
          ],
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Insufficient stock');
      });

      it('should not update stock if order fails', async () => {
        const orderData = {
          products: [
            { productId: productId1, quantity: 5 },
            { productId: productId2, quantity: 50 }, // Exceeds stock (30)
          ],
        };

        await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(400);

        // Verify stock was NOT updated for product1 (transaction rollback)
        const product1Response = await request(app)
          .get(`/api/products/${productId1}`)
          .expect(200);

        expect(product1Response.body.data.stock).toBe(50); // Original stock
      });
    });

    describe('Product Validation (400/404)', () => {
      it('should reject order with non-existent product (404)', async () => {
        const fakeProductId = new mongoose.Types.ObjectId().toString();
        const orderData = {
          products: [{ productId: fakeProductId, quantity: 1 }],
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('not found');
      });

      it('should reject order with invalid product ID', async () => {
        const orderData = {
          products: [{ productId: 'invalid-id', quantity: 1 }],
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid product ID');
      });
    });

    describe('Request Validation (400 Bad Request)', () => {
      it('should reject order without products array', async () => {
        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Products array is required');
      });

      it('should reject order with empty products array', async () => {
        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ products: [] })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('at least one product');
      });

      it('should reject order with missing productId', async () => {
        const orderData = {
          products: [{ quantity: 2 }],
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should reject order with missing quantity', async () => {
        const orderData = {
          products: [{ productId: productId1 }],
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should reject order with quantity less than 1', async () => {
        const orderData = {
          products: [{ productId: productId1, quantity: 0 }],
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should reject order with negative quantity', async () => {
        const orderData = {
          products: [{ productId: productId1, quantity: -1 }],
        };

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .send(orderData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('Authentication (401)', () => {
      it('should reject order without authentication', async () => {
        const orderData = {
          products: [{ productId: productId1, quantity: 1 }],
        };

        await request(app).post('/api/orders').send(orderData).expect(401);
      });

      it('should reject order with invalid token', async () => {
        const orderData = {
          products: [{ productId: productId1, quantity: 1 }],
        };

        await request(app)
          .post('/api/orders')
          .set('Authorization', 'Bearer invalid-token')
          .send(orderData)
          .expect(401);
      });
    });
  });

  /**
   * Test: Get Order History (User Story 10) - GET /api/orders
   */
  describe('GET /api/orders - Get Order History (User Story 10)', () => {
    beforeEach(async () => {
      // Create some orders for the user
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          products: [{ productId: productId1, quantity: 1 }],
        });

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          products: [{ productId: productId2, quantity: 2 }],
        });
    });

    describe('Success Cases', () => {
      it('should return user order history (200)', async () => {
        const response = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should only return orders for authenticated user', async () => {
        // Create order with admin user
        await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            products: [{ productId: productId1, quantity: 1 }],
          });

        // Regular user should only see their orders
        const response = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        // Verify all orders belong to the user
        response.body.data.forEach((order: any) => {
          expect(order.userId).toBe(userId);
        });
      });

      it('should return orders sorted by creation date (newest first)', async () => {
        const response = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        const orders = response.body.data;
        if (orders.length > 1) {
          const firstOrderDate = new Date(orders[0].createdAt);
          const secondOrderDate = new Date(orders[1].createdAt);
          expect(firstOrderDate.getTime()).toBeGreaterThanOrEqual(secondOrderDate.getTime());
        }
      });

      it('should include order details in response', async () => {
        const response = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        const order = response.body.data[0];
        expect(order).toHaveProperty('_id');
        expect(order).toHaveProperty('userId');
        expect(order).toHaveProperty('products');
        expect(order).toHaveProperty('totalPrice');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('createdAt');
      });
    });

    describe('Pagination', () => {
      it('should support pagination with page and limit', async () => {
        const response = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .query({ page: 1, limit: 1 })
          .expect(200);

        expect(response.body.data.length).toBeLessThanOrEqual(1);
        expect(response.body).toHaveProperty('pageNumber');
        expect(response.body).toHaveProperty('pageSize');
        expect(response.body).toHaveProperty('totalPages');
        expect(response.body).toHaveProperty('totalSize');
      });

      it('should return correct pagination metadata', async () => {
        const response = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body.pageNumber).toBe(1);
        expect(response.body.pageSize).toBe(10);
        expect(response.body.totalSize).toBeGreaterThan(0);
      });

      it('should default to page 1 and limit 10', async () => {
        const response = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.pageNumber).toBe(1);
        expect(response.body.pageSize).toBe(10);
      });
    });

    describe('Authentication (401)', () => {
      it('should reject request without authentication', async () => {
        await request(app).get('/api/orders').expect(401);
      });

      it('should reject request with invalid token', async () => {
        await request(app)
          .get('/api/orders')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });

    describe('Empty Order History', () => {
      it('should return empty array if user has no orders', async () => {
        // Create new user with no orders
        const newUserResponse = await request(app).post('/api/auth/register').send({
          username: 'newuser',
          email: 'newuser@test.com',
          password: 'NewUser123!@#',
        });

        const response = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${newUserResponse.body.data.token}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(0);
      });
    });
  });

  /**
   * Test: Get Single Order by ID - GET /api/orders/:id
   */
  describe('GET /api/orders/:id - Get Single Order Details', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create an order
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          products: [{ productId: productId1, quantity: 1 }],
          description: 'Test order',
        });
      orderId = response.body.data._id;
    });

    describe('Success Cases', () => {
      it('should return order details (200)', async () => {
        const response = await request(app)
          .get(`/api/orders/${orderId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBe(orderId);
        expect(response.body.data).toHaveProperty('products');
        expect(response.body.data).toHaveProperty('totalPrice');
      });

      it('should include complete order information', async () => {
        const response = await request(app)
          .get(`/api/orders/${orderId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        const order = response.body.data;
        expect(order).toHaveProperty('userId');
        expect(order).toHaveProperty('products');
        expect(order).toHaveProperty('totalPrice');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('description');
        expect(order).toHaveProperty('createdAt');
        expect(order).toHaveProperty('updatedAt');
      });
    });

    describe('Security - User Isolation', () => {
      it('should not allow user to access another user order (404)', async () => {
        // Try to access the order with admin token (different user)
        await request(app)
          .get(`/api/orders/${orderId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });
    });

    describe('Error Cases', () => {
      it('should return 404 for non-existent order', async () => {
        const fakeOrderId = new mongoose.Types.ObjectId().toString();

        await request(app)
          .get(`/api/orders/${fakeOrderId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(404);
      });

      it('should return 400 for invalid order ID', async () => {
        await request(app)
          .get('/api/orders/invalid-id')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(400);
      });
    });

    describe('Authentication (401)', () => {
      it('should reject request without authentication', async () => {
        await request(app).get(`/api/orders/${orderId}`).expect(401);
      });
    });
  });

  /**
   * Test: Response Format Consistency
   */
  describe('Response Format Consistency', () => {
    it('should have consistent success response format for place order', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          products: [{ productId: productId1, quantity: 1 }],
        })
        .expect(201);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.success).toBe(true);
    });

    it('should have consistent error response format', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          products: [], // Invalid: empty array
        })
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(false);
    });

    it('should have consistent paginated response format', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pageNumber');
      expect(response.body).toHaveProperty('pageSize');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('totalSize');
    });
  });
});
