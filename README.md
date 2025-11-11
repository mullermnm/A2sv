# A2SV E-commerce REST API

Enterprise-grade TypeScript REST API for an e-commerce platform built with Express.js, MongoDB, and Redis.

[![Tests](https://img.shields.io/badge/tests-105%20passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)]()
[![API](https://img.shields.io/badge/API-REST-orange)]()

## 🚀 Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript (Strict Mode)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Cache**: Redis
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Code Quality**: ESLint + Prettier
- **CI/CD**: GitHub Actions (planned)

## 📋 Features

### Core Architecture
- ✅ Clean layered architecture (Routes → Controller → Service → Repository → Model)
- ✅ TypeScript with strict mode and path aliases
- ✅ Base classes for controllers, services, and repositories
- ✅ Comprehensive error handling and validation
- ✅ MongoDB transactions support

### API Features
- ✅ User authentication (JWT-based)
- ✅ Product management (CRUD operations)
- ✅ Order management with stock tracking
- ✅ Advanced filtering and search
- ✅ Pagination and sorting
- ✅ Soft delete for products
- ✅ Role-based access control (User/Admin)

### Advanced Filtering
- ✅ Product search by name (case-insensitive)
- ✅ Price range filtering
- ✅ Category filtering
- ✅ Stock range filtering
- ✅ Status filtering (active/deleted)
- ✅ Order status filtering
- ✅ Date range filtering for orders

### Infrastructure
- ✅ Docker & Docker Compose setup
- ✅ Production-grade multi-stage Dockerfile
- ✅ MongoDB replica set for transactions
- ✅ Redis caching with automatic invalidation
- ✅ Rate limiting (API and admin endpoints)
- ✅ File upload with Multer (product images)
- ✅ Health checks for all services
- ✅ Non-root container execution
- ✅ Sentry error tracking integration
- ✅ Winston structured logging

### Developer Experience
- ✅ Swagger/OpenAPI documentation
- ✅ 105+ passing tests (Jest + Supertest)
- ✅ Hot reload in development
- ✅ ESLint + Prettier for code quality
- ✅ CI/CD ready
- ✅ Comprehensive documentation

## 📁 Project Structure

```
A2sv/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # Entry point
│   ├── bootstrap/             # Initialization modules
│   │   ├── database.ts        # MongoDB connection
│   │   ├── redis.ts           # Redis connection
│   │   ├── routes.ts          # Route aggregator
│   │   └── dbSeeder.ts        # Database seeder
│   ├── config/                # Configuration
│   │   ├── default.json       # App config
│   │   └── index.ts           # Config loader
│   ├── docs/                  # Swagger documentation
│   │   └── swagger.yaml       # OpenAPI specification
│   ├── controllers/           # Route handlers
│   │   ├── BaseController.ts  # Base controller class
│   │   ├── user.controller.ts # User authentication
│   │   ├── product.controller.ts # Product management
│   │   └── order.controller.ts # Order management
│   ├── services/              # Business logic
│   │   ├── BaseService.ts     # Base service class
│   │   ├── user.service.ts    # User logic
│   │   ├── product.service.ts # Product logic
│   │   └── order.service.ts   # Order logic with transactions
│   ├── repositories/          # Data access layer
│   │   ├── BaseRepository.ts  # Base repository class
│   │   ├── user.repository.ts # User data access
│   │   ├── product.repository.ts # Product data access
│   │   └── order.repository.ts # Order data access
│   ├── models/                # Mongoose schemas
│   │   ├── user.model.ts      # User schema
│   │   ├── product.model.ts   # Product schema
│   │   └── order.model.ts     # Order schema
│   ├── routes/                # Route definitions
│   │   ├── auth.routes.ts     # Authentication routes
│   │   ├── product.routes.ts  # Product routes
│   │   └── order.routes.ts    # Order routes
│   ├── middlewares/           # Custom middleware
│   │   ├── auth.middleware.ts # JWT authentication
│   │   ├── cache.middleware.ts # Redis caching
│   │   ├── error.middleware.ts # Error handling
│   │   └── rateLimiter.middleware.ts # Rate limiting
│   ├── validators/            # Request validation
│   │   ├── middleware.ts      # Joi validation middleware
│   │   ├── user.validator.ts  # User validation schemas
│   │   ├── product.validator.ts # Product validation schemas
│   │   └── order.validator.ts # Order validation schemas
│   ├── helpers/               # Utility functions
│   │   ├── responses/         # Response helpers
│   │   └── multer.helper.ts   # File upload configuration
│   ├── utils/                 # Utility modules
│   │   └── logger.ts          # Winston logger
│   └── types/                 # Type definitions
│       └── index.ts           # Type exports and interfaces
├── tests/                     # Test files (105 tests)
│   ├── auth/                  # Authentication tests
│   ├── products/              # Product tests
│   └── orders/                # Order tests
├── uploads/                   # File uploads directory
├── Dockerfile                 # Production Docker image
├── Dockerfile.dev             # Development Docker image
├── docker-compose.yml         # Docker services
├── docker-compose.dev.yml     # Development overrides
├── .dockerignore              # Docker ignore rules
├── .env                       # Environment variables
├── .env.example               # Environment template
├── tsconfig.json              # TypeScript configuration
├── jest.config.js             # Jest configuration
├── .eslintrc.js               # ESLint configuration
├── .prettierrc                # Prettier configuration
├── DOCKER_GUIDE.md            # Docker documentation
└── package.json               # Project manifest
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v20 or higher)
- MongoDB (running locally or remote)
- Redis (for caching)
- npm or yarn
- Docker & Docker Compose (optional, for containerized setup)

### Step 1: Clone the repository

```bash
git clone <repository-url>
cd a2sv-ecommerce-backend
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
# With replica set for transactions support
MONGODB_URI=mongodb://localhost:27017/a2sv_ecommerce?replicaSet=rs0&directConnection=true

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=10

# CORS
CORS_ORIGIN=*

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

```

### Step 4: ⚠️ CRITICAL - Setup MongoDB Replica Set for Transactions

**Why?** This API uses MongoDB transactions for atomic operations (order placement, product updates). Transactions **require** a replica set, even for local development.

**⚠️ IMPORTANT:** If you have local MongoDB service running, you MUST stop it first (they conflict on port 27017).

**Choose ONE setup method:**

#### Option 1: Docker (Recommended - 2 minutes)

**Run as Administrator in PowerShell:**

```powershell
# 1. Stop local MongoDB if running
Stop-Service MongoDB

# 2. Start MongoDB with replica set using Docker
docker-compose up -d mongo mongo-init

# 3. Wait for initialization
Start-Sleep -Seconds 15

# 4. Verify replica set
docker exec -it a2sv-mongodb mongosh --eval "rs.status()"
```

You should see `"stateStr": "PRIMARY"` in the output.

#### Option 2: PowerShell Script (3 minutes)

```powershell
# Run as Administrator
.\setup-mongodb-replicaset.ps1

# Verify
mongosh --eval "rs.status()"
```

#### Option 3: Manual Setup (5 minutes)

1. Edit MongoDB config: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`
2. Add at the end:
   ```yaml
   replication:
     replSetName: "rs0"
   ```
3. Restart MongoDB:
   ```powershell
   net stop MongoDB
   net start MongoDB
   ```
4. Initialize replica set:
   ```powershell
   mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
   ```

**✅ Your `.env` is already configured with:**
```env
MONGODB_URI=mongodb://localhost:27017/a2sv_ecommerce?replicaSet=rs0&directConnection=true
```

**Redis (optional):**
```bash
# Using Redis locally
redis-server

# Or using Docker (if not using docker-compose)
docker run -d -p 6379:6379 --name redis redis:alpine
```

### Step 6: Run the application

#### Option A: Local Development

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

#### Option B: Docker Development

**Start all services with Docker:**
```bash
# Production mode
docker compose up -d

# Development mode with hot reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

## 🧪 Testing

```bash
# Run all tests (105 tests)
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm test -- --testPathPattern=products
npm test -- --testPathPattern=orders
npm test -- --testPathPattern=auth
```

**Test Coverage:**
- ✅ Authentication (Register, Login)
- ✅ Products (CRUD, Search, Filtering)
- ✅ Orders (Place Order, Order History, Order Details)
- ✅ Pagination & Sorting
- ✅ Error Handling
- ✅ Security (JWT, Role-based access)

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

### Available Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

#### Products (Public)
- `GET /api/v1/products` - List products (with filtering)
- `GET /api/v1/products/:id` - Get product details

#### Products (Admin Only)
- `POST /api/v1/products` - Create product (with optional image upload)
- `PUT /api/v1/products/:id` - Update product (with optional image upload)
- `DELETE /api/v1/products/:id` - Delete product (soft delete)

#### Orders (Authenticated)
- `POST /api/v1/orders` - Place new order
- `GET /api/v1/orders` - Get order history (with filtering)
- `GET /api/v1/orders/:id` - Get order details

#### Orders (Admin Only)
- `PATCH /api/v1/orders/:id/status` - Update order status

### Advanced Filtering

**Product Filters:**
```bash
# Search by name
GET /api/v1/products?search=laptop

# Price range
GET /api/v1/products?minPrice=100&maxPrice=500

# Category
GET /api/v1/products?category=electronics

# Stock range
GET /api/v1/products?minStock=10&maxStock=100

# In stock only
GET /api/v1/products?inStock=true

# Combined filters
GET /api/v1/products?category=electronics&maxPrice=500&inStock=true&page=1&limit=20
```

**Order Filters:**
```bash
# By status
GET /api/v1/orders?status=pending

# Price range
GET /api/v1/orders?minPrice=100&maxPrice=500

# Date range
GET /api/v1/orders?startDate=2024-01-01&endDate=2024-12-31

# Combined
GET /api/v1/orders?status=delivered&minPrice=500&sort=-totalPrice
```

### File Upload (Product Images)

The API supports optional image uploads for products using **Multer** with local disk storage.

**Features:**
- ✅ Optional single image per product
- ✅ Supported formats: JPEG, PNG, GIF, WebP, PDF
- ✅ Maximum file size: 5MB
- ✅ UUID-based filenames for uniqueness
- ✅ Images stored in `uploads/products/` directory
- ✅ Automatic path transformation to API-accessible URLs
- ✅ Static file serving at `/api/uploads/products/`

**Creating a product with image (cURL):**
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Wireless Headphones" \
  -F "description=High-quality wireless headphones" \
  -F "price=99.99" \
  -F "stock=50" \
  -F "category=Electronics" \
  -F "productImage=@/path/to/image.jpg"
```

**Response includes image URL:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Wireless Headphones",
    "productImage": "/api/uploads/products/abc123-uuid.jpg",
    ...
  }
}
```

**Accessing uploaded images:**
```bash
# Direct browser access
http://localhost:5000/api/uploads/products/abc123-uuid.jpg

# Or via cURL
curl http://localhost:5000/api/uploads/products/abc123-uuid.jpg --output image.jpg
```

**Implementation Details:**
- **Multer Helper**: `src/helpers/multer.helper.ts` handles file upload configuration
- **Storage**: Files saved to `uploads/products/` with UUID filenames
- **Path Transformation**: Automatically converts local paths to API URLs
- **Validation**: File type and size validation at middleware level
- **Static Serving**: Configured in `src/app.ts` for public access

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run Jest tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

### Docker Scripts

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start all services (backend, mongo, redis) |
| `docker compose down` | Stop all services |
| `docker compose logs -f` | View service logs |
| `docker compose ps` | Check service status |
| `docker compose build` | Rebuild images |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` | Start development environment |

## ✅ Project Status

### Completed Features

#### Phase 1: Project Setup ✅
- ✅ Clean folder structure
- ✅ TypeScript configuration with strict mode
- ✅ Express app with security middleware
- ✅ MongoDB and Redis connection setup
- ✅ Swagger documentation
- ✅ Code quality tools (ESLint, Prettier)
- ✅ Jest testing configuration
- ✅ Environment configuration

#### Phase 2: Core Features ✅
- ✅ User authentication (Register, Login)
- ✅ Product CRUD operations
- ✅ Order management with transactions
- ✅ JWT authentication middleware
- ✅ Request validation middleware
- ✅ Role-based access control
- ✅ 105+ integration tests
- ✅ Soft delete functionality

#### Phase 3: Advanced Features ✅
- ✅ Advanced filtering (6 product filters, 3 order filters)
- ✅ Pagination and sorting
- ✅ Search functionality
- ✅ MongoDB transactions for orders
- ✅ Stock management
- ✅ Base classes for reusability
- ✅ Comprehensive error handling
- ✅ Redis caching with automatic invalidation
- ✅ Rate limiting (100 req/15min API, 20 req/5min admin)
- ✅ File upload for product images (Multer + local storage)
- ✅ API versioning (v1)
- ✅ Order status update endpoint (admin)
- ✅ Sentry error tracking
- ✅ Winston structured logging

#### Phase 4: DevOps ✅
- ✅ Docker setup (multi-stage builds)
- ✅ Docker Compose configuration
- ✅ Development and production environments
- ✅ Health checks
- ✅ Non-root container execution
- ✅ MongoDB replica set for transactions
- ✅ Resource limits and security

### 🚧 Upcoming Enhancements

- [ ] Cloudinary integration for image hosting
- [ ] Multiple images per product
- [ ] Image optimization and thumbnails
- [ ] Email notifications
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Inventory management
- [ ] Reporting and analytics
- [ ] WebSocket for real-time updates

## 📝 Environment Variables

### Required Variables

| Variable | Description | Default |
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/a2sv_ecommerce` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Secret key for JWT | `required` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds | `12` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |

## 📖 Additional Documentation

- **[Docker Guide](DOCKER_GUIDE.md)** - Complete Docker setup and deployment guide

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality Standards

- ✅ All tests must pass (105+ tests)
- ✅ TypeScript strict mode compliance
- ✅ ESLint with no errors
- ✅ Prettier formatting
- ✅ Follow layered architecture pattern
- ✅ Add tests for new features

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**A2SV Backend Developer**

## 🎉 Quick Start

```bash
# Clone repository
git clone <repository-url>
cd A2sv

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start with Docker (recommended)
docker compose up -d

# Or start locally
npm run dev

# Run tests
npm test

# Access API
curl http://localhost:5000/health

# View API documentation
open http://localhost:5000/api-docs
```

---

**🚀 Production-ready enterprise e-commerce API with Docker support!**
