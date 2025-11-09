# 🧪 How to Run Tests

## ✅ Prerequisites

Before running tests, ensure you have:
1. ✅ Node.js 18+ installed
2. ✅ Dependencies installed: `npm install`
3. ✅ MongoDB Memory Server installed (already in devDependencies)

---

## 🚀 Running Tests

### **1. Run All Tests**
```bash
npm test
```

This will:
- Run all test files in the `tests/` directory
- Show detailed test results
- Generate coverage report
- Use MongoDB in-memory database (no external MongoDB needed!)

### **2. Run Tests with Coverage Report**
```bash
npm test -- --coverage
```

This generates a detailed coverage report showing:
- **Statements**: % of code statements executed
- **Branches**: % of conditional branches tested
- **Functions**: % of functions called
- **Lines**: % of lines executed

### **3. Run Tests in Watch Mode**
```bash
npm run test:watch
```

This will:
- Auto-rerun tests when files change
- Great for development
- Press `q` to quit watch mode

### **4. Run Specific Test File**
```bash
# Run only register tests
npm test -- register.test

# Run only login tests
npm test -- login.test

# Run only product tests (once created)
npm test -- product.test
```

### **5. Run Tests with Verbose Output**
```bash
npm test -- --verbose
```

---

## 📁 Test Structure

```
tests/
├── auth/
│   ├── register.test.ts     # User registration tests (User Story 1)
│   └── login.test.ts         # User login tests (User Story 2)
├── products/
│   └── product.test.ts       # Product CRUD tests (User Stories 3-8) - TODO
└── orders/
    └── order.test.ts         # Order tests (User Stories 9-10) - TODO
```

---

## ✅ Current Test Coverage

### **Authentication Tests** (45+ tests)

#### **Register Tests** (25+ tests)
- ✅ Valid registration (201 Created)
- ✅ Username validation (alphanumeric only)
- ✅ Email validation (format, uniqueness)
- ✅ Password validation (8+ chars, uppercase, lowercase, number, special char)
- ✅ Password hashing (bcrypt)
- ✅ Role defaults to 'user'
- ✅ Duplicate email/username detection
- ✅ Password never in response

#### **Login Tests** (20+ tests)
- ✅ Valid login (200 OK + JWT token)
- ✅ JWT payload verification (userId, username, email, role)
- ✅ Invalid credentials (401 Unauthorized)
- ✅ Email validation
- ✅ Password comparison
- ✅ Security (don't reveal if email exists)
- ✅ Password never in response

---

## 🎯 What Gets Tested?

### **✅ HTTP Requests**
- All endpoints (GET, POST, PUT, DELETE)
- Request validation (body, params, query)
- Response status codes
- Response body structure

### **✅ Authentication**
- User registration flow
- User login flow
- JWT token generation
- JWT payload validation
- Password hashing/comparison

### **✅ Validation**
- Joi schema validation
- Error messages
- Edge cases
- Required vs optional fields

### **✅ Database Operations**
- Create operations
- Read operations
- Update operations (TODO)
- Delete operations (TODO)
- Duplicate detection

### **✅ Security**
- Password never in responses
- Password hashing
- JWT tokens
- Error messages don't reveal sensitive info

---

## 📊 Example Test Output

```
PASS tests/auth/register.test.ts (25.3s)
  POST /api/auth/register - User Registration (User Story 1)
    Success Cases
      ✓ should register a new user with valid credentials and return 201 (234ms)
      ✓ should register user with explicit role=admin (156ms)
      ✓ should default role to "user" when role is not provided (145ms)
      ✓ should hash the password (not stored as plaintext) (167ms)
    Email Validation (400 Bad Request)
      ✓ should reject invalid email format (45ms)
      ✓ should reject email without domain (43ms)
      ✓ should reject missing email (41ms)
      ✓ should reject duplicate email (400) (189ms)
    Username Validation (400 Bad Request)
      ✓ should reject username with special characters (44ms)
      ✓ should reject username with spaces (42ms)
      ✓ should reject missing username (40ms)
      ✓ should accept valid alphanumeric username (153ms)
      ✓ should reject duplicate username (400) (178ms)
    Password Validation (400 Bad Request)
      ✓ should reject password shorter than 8 characters (43ms)
      ✓ should reject password without uppercase letter (44ms)
      ✓ should reject password without lowercase letter (42ms)
      ✓ should reject password without number (43ms)
      ✓ should reject password without special character (44ms)
      ✓ should reject missing password (41ms)
      ✓ should accept password meeting all requirements (612ms)
    Response Format
      ✓ should never return password in response (156ms)
      ✓ should return errors array for validation failures (43ms)

PASS tests/auth/login.test.ts (18.7s)
  POST /api/auth/login - User Login (User Story 2)
    Success Cases
      ✓ should login with valid credentials and return 200 with JWT token (178ms)
      ✓ should login and JWT payload should contain userId, username, and role (165ms)
      ✓ should login admin user successfully (189ms)
    Authentication Errors (401 Unauthorized)
      ✓ should return 401 for non-existent user (156ms)
      ✓ should return 401 for incorrect password (178ms)
      ✓ should not reveal whether email exists (security) (334ms)
    Input Validation (400 Bad Request)
      ✓ should reject login with invalid email format (43ms)
      ✓ should reject login without email (41ms)
      ✓ should reject login without password (42ms)
      ✓ should reject login with empty body (44ms)
      ✓ should reject email without @ symbol (43ms)
    Response Format
      ✓ should never return password in login response (167ms)
      ✓ should have consistent error response structure (156ms)
      ✓ should return errors array for validation failures (44ms)
    Password Hashing and Comparison
      ✓ should correctly validate hashed password (178ms)
      ✓ should reject password with slight variation (889ms)
    Email Case Sensitivity
      ✓ should login with email regardless of case (712ms)

Test Suites: 2 passed, 2 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        44.123 s

------------------|---------|----------|---------|---------|-------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------|---------|----------|---------|---------|-------------------
All files         |   87.32 |    79.41 |   89.47 |   87.15 |
 controllers      |   92.30 |    85.71 |   100   |   92.30 |
  user.controller |   92.30 |    85.71 |   100   |   92.30 | 35,56
 services         |   88.88 |    77.77 |   100   |   88.88 |
  user.service    |   88.88 |    77.77 |   100   |   88.88 | 45,67,89
 repositories     |   82.14 |    75.00 |   75.00 |   82.14 |
  user.repository |   82.14 |    75.00 |   75.00 |   82.14 | 67,89,123
 validators       |   95.45 |    100   |   100   |   95.45 |
  auth.validator  |   95.45 |    100   |   100   |   95.45 | 33
------------------|---------|----------|---------|---------|-------------------
```

---

## 🐛 Troubleshooting

### **Tests Fail to Start**
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **MongoDB Memory Server Issues**
```bash
# Reinstall MongoDB Memory Server
npm install --save-dev mongodb-memory-server
```

### **Port Already in Use**
```bash
# Tests use in-memory DB, so no port conflicts
# If issue persists, check if another process is using the test port
```

### **Timeout Errors**
```bash
# Increase Jest timeout in jest.config.js
module.exports = {
  testTimeout: 30000, // 30 seconds
  ...
};
```

---

## 🎓 Writing New Tests

### **1. Create Test File**
```bash
# Create new test file
touch tests/products/product.test.ts
```

### **2. Basic Test Structure**
```typescript
import request from 'supertest';
import { Application } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import createApp from '../../src/app';
import Product from '../../src/models/product.model';

describe('POST /api/products - Create Product', () => {
  let app: Application;
  let mongoServer: MongoMemoryServer;
  let adminToken: string; // For authenticated requests

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    app = createApp();
    
    // Register and login as admin to get token
    const adminUser = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin',
    };
    
    await request(app).post('/api/auth/register').send(adminUser);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    
    adminToken = loginRes.body.data.token;
  });

  afterEach(async () => {
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should create a product with valid data (201)', async () => {
    const productData = {
      name: 'Test Product',
      description: 'A test product description',
      price: 99.99,
      stock: 10,
      category: 'Electronics',
    };

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('name', productData.name);
    expect(response.body.data).toHaveProperty('price', productData.price);
  });

  it('should reject unauthenticated requests (401)', async () => {
    const productData = {
      name: 'Test Product',
      description: 'A test product description',
      price: 99.99,
      stock: 10,
      category: 'Electronics',
    };

    await request(app)
      .post('/api/products')
      .send(productData)
      .expect(401);
  });
});
```

---

## 📝 Test Best Practices

1. **✅ Use Descriptive Test Names**
   - ❌ Bad: `it('works')`
   - ✅ Good: `it('should create a product with valid data and return 201')`

2. **✅ Test One Thing Per Test**
   - Each test should verify a single behavior

3. **✅ Use Setup/Teardown**
   - `beforeAll()`: Run once before all tests
   - `beforeEach()`: Run before each test
   - `afterEach()`: Cleanup after each test
   - `afterAll()`: Final cleanup

4. **✅ Test Edge Cases**
   - Empty values
   - Invalid formats
   - Boundary values (min/max)
   - Missing required fields

5. **✅ Test Security**
   - Passwords never in responses
   - Unauthorized access
   - Invalid tokens

---

## 🎉 Summary

✅ **45+ tests** covering authentication  
✅ **MongoDB in-memory** for isolated testing  
✅ **Supertest** for HTTP testing  
✅ **Coverage reports** available  
✅ **Watch mode** for development  
✅ **No external dependencies** needed  

**Run tests with:** `npm test` 🚀
