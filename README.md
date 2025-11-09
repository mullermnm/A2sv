# A2SV E-commerce REST API

Enterprise-grade TypeScript REST API for an e-commerce platform built with Express.js, MongoDB, and Redis.

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

- ✅ Clean architecture with layered structure
- ✅ TypeScript with strict mode and path aliases
- ✅ Swagger/OpenAPI documentation
- ✅ MongoDB with Mongoose ODM
- ✅ Redis caching support
- ✅ Security middleware (Helmet, CORS)
- ✅ Request compression
- ✅ Environment-based configuration
- ✅ Jest testing setup
- ✅ ESLint + Prettier for code quality

## 📁 Project Structure

```
ecommerce-backend/
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
│   ├── controllers/           # Route handlers (empty - Phase 2)
│   ├── services/              # Business logic (empty - Phase 2)
│   ├── repositories/          # Data access layer (empty - Phase 2)
│   ├── routes/                # Route definitions (empty - Phase 2)
│   ├── middlewares/           # Custom middleware (empty - Phase 2)
│   ├── helpers/               # Utility functions (empty - Phase 2)
│   ├── interfaces/            # TypeScript interfaces (empty - Phase 2)
│   └── types/                 # Type definitions (empty - Phase 2)
├── tests/                     # Test files
├── uploads/                   # File uploads directory
├── .env                       # Environment variables
├── .env.dev                   # Development environment
├── tsconfig.json              # TypeScript configuration
├── jest.config.js             # Jest configuration
├── .eslintrc.js               # ESLint configuration
├── .prettierrc                # Prettier configuration
└── package.json               # Project manifest
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or remote)
- Redis (optional, for caching)
- npm or yarn

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
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/a2sv_ecommerce

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12

# CORS
CORS_ORIGIN=*
```

### Step 4: Start MongoDB and Redis

**MongoDB:**
```bash
# Using MongoDB Community Edition
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Redis (optional):**
```bash
# Using Redis locally
redis-server

# Or using Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

### Step 5: Run the application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Ping**: [http://localhost:5000/api/ping](http://localhost:5000/api/ping)

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

## 🎯 Phase 1 Complete

✅ Project scaffolding and setup complete
- Clean folder structure
- TypeScript configuration with strict mode
- Express app with security middleware
- MongoDB and Redis connection setup
- Swagger documentation
- Code quality tools (ESLint, Prettier)
- Jest testing configuration
- Environment configuration

## 🚧 Next Steps (Phase 2)

- [ ] Implement User authentication (register, login)
- [ ] Create Product CRUD operations
- [ ] Implement Order management
- [ ] Add JWT middleware
- [ ] Create validation middleware
- [ ] Add unit and integration tests
- [ ] Implement Redis caching
- [ ] Add rate limiting

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/a2sv_ecommerce` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Secret key for JWT | `required` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds | `12` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**A2SV Backend Developer**

---

**Note**: This is Phase 1 of the project. Business logic and actual endpoints will be implemented in subsequent phases.
