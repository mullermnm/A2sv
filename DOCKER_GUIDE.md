# 🐳 Docker Deployment Guide

Complete guide for running the A2SV E-Commerce Backend with Docker.

---

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Docker Commands](#docker-commands)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose V2 installed
- 4GB RAM available
- 10GB disk space available

**Install Docker:**
```bash
# Windows/Mac: Download Docker Desktop from docker.com
# Linux:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

---

## 🚀 Quick Start

### 1. Clone & Configure

```bash
git clone <repository-url>
cd A2sv

# Copy environment file
cp .env.example .env

# Edit .env and add your secrets
nano .env
```

### 2. Start All Services

```bash
# Build and start all services (backend, mongo, redis)
docker compose up -d

# View logs
docker compose logs -f
```

### 3. Verify Installation

```bash
# Check service health
docker compose ps

# Test API
curl http://localhost:5000/health
```

---

## 🛠️ Development Setup

### Start Development Environment

The development setup includes:
- **Live reload** with nodemon
- **Source code mounting** for instant changes
- **Debug logging** enabled
- **Development dependencies** installed

```bash
# Start development environment
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or use the shorthand
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Development Features

**Hot Reload:**
- Changes to `src/` files automatically restart the server
- No need to rebuild the container

**Debugging:**
```bash
# View logs
docker compose logs -f backend

# Access container shell
docker compose exec backend sh

# Run npm commands
docker compose exec backend npm run test
```

---

## 🏭 Production Setup

### Build Production Image

```bash
# Build optimized production image
docker compose build --no-cache

# Start production services
docker compose up -d
```

### Production Features

✅ **Multi-stage build** - Minimal image size  
✅ **Non-root user** - Enhanced security  
✅ **Health checks** - Auto-restart on failure  
✅ **Resource limits** - 1 CPU, 1GB RAM  
✅ **Persistent volumes** - Data survives restarts  
✅ **Replica set** - MongoDB transactions support  

---

## 📝 Docker Commands

### Service Management

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart a service
docker compose restart backend

# View service status
docker compose ps

# View service logs
docker compose logs -f backend
docker compose logs -f mongo
docker compose logs -f redis
```

### Container Management

```bash
# Access container shell
docker compose exec backend sh
docker compose exec mongo mongosh

# Run commands in container
docker compose exec backend npm run test
docker compose exec backend node dist/scripts/seed.js

# Copy files
docker compose cp backend:/app/logs ./local-logs
```

### Image Management

```bash
# Build images
docker compose build

# Build without cache
docker compose build --no-cache

# Pull latest images
docker compose pull

# View images
docker images

# Remove unused images
docker image prune -a
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect a2sv_mongo-data

# Remove all volumes (⚠️ deletes data)
docker compose down -v

# Backup MongoDB data
docker compose exec mongo mongodump --out /data/backup
docker compose cp mongo:/data/backup ./mongo-backup
```

---

## 🔐 Environment Variables

### Required Variables

Create `.env` file with these required variables:

```env
# Application
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb://admin:admin123@mongo:27017/a2sv_ecommerce?authSource=admin&replicaSet=rs0
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password_here
MONGO_DATABASE=a2sv_ecommerce

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRATION=1h

# Security
BCRYPT_ROUNDS=10

# Pagination
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

### Development Variables

For development, add to `.env.dev`:

```env
NODE_ENV=development
DEBUG=*
LOG_LEVEL=debug
```

---

## 🏥 Health Checks

### Service Health

All services include health checks:

**Backend API:**
- Endpoint: `http://localhost:5000/health`
- Interval: 30s
- Timeout: 3s
- Retries: 3

**MongoDB:**
```bash
# Check MongoDB health
docker compose exec mongo mongosh --eval "db.runCommand('ping').ok"
```

**Redis:**
```bash
# Check Redis health
docker compose exec redis redis-cli -a redis123 ping
```

### Monitoring Health

```bash
# View health status
docker compose ps

# Continuous monitoring
watch -n 5 'docker compose ps'
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
PORT=5001
```

#### 2. MongoDB Connection Failed

```bash
# Check MongoDB is running
docker compose ps mongo

# View MongoDB logs
docker compose logs mongo

# Restart MongoDB
docker compose restart mongo

# Initialize replica set manually
docker compose exec mongo mongosh -u admin -p admin123 --eval "rs.initiate()"
```

#### 3. Container Won't Start

```bash
# View detailed logs
docker compose logs --tail=100 backend

# Check for errors
docker compose events

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up
```

#### 4. Out of Disk Space

```bash
# Clean up Docker resources
docker system prune -a --volumes

# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Check disk usage
docker system df
```

#### 5. Slow Build Times

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker compose build

# Cache node_modules
# Already configured in Dockerfile multi-stage build
```

### Debug Mode

```bash
# Run with debug output
docker compose --verbose up

# Check container resource usage
docker stats

# Inspect container
docker compose exec backend env
docker compose exec backend ps aux
```

---

## 📊 Resource Management

### View Resource Usage

```bash
# Real-time stats
docker stats

# Container resource limits
docker compose config
```

### Adjust Resources

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'      # Increase CPU limit
          memory: 2G     # Increase memory limit
```

---

## 🔒 Security Best Practices

✅ **Non-root user** - App runs as user `nodejs` (UID 1001)  
✅ **Secrets management** - Use `.env` files (never commit)  
✅ **Network isolation** - Services on private network  
✅ **Health checks** - Auto-restart unhealthy containers  
✅ **Read-only filesystem** - Immutable runtime  
✅ **Resource limits** - Prevent resource exhaustion  

### Production Hardening

```yaml
# Add to docker-compose.yml
services:
  backend:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
```

---

## 📦 Deployment Workflows

### Development Workflow

```bash
# 1. Make code changes in src/
# 2. Container automatically reloads (if using dev compose)
# 3. Test changes
curl http://localhost:5000/api/v1/products

# 4. View logs
docker compose logs -f backend
```

### Production Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild images
docker compose build --no-cache

# 3. Stop old containers
docker compose down

# 4. Start new containers
docker compose up -d

# 5. Verify deployment
docker compose ps
curl http://localhost:5000/health

# 6. View logs
docker compose logs -f
```

---

## 🔄 Backup & Restore

### Backup MongoDB

```bash
# Create backup
docker compose exec mongo mongodump --uri="mongodb://admin:admin123@localhost:27017/a2sv_ecommerce?authSource=admin" --out=/data/backup

# Copy to host
docker compose cp mongo:/data/backup ./backup-$(date +%Y%m%d)

# Compress
tar -czf mongodb-backup-$(date +%Y%m%d).tar.gz backup-*
```

### Restore MongoDB

```bash
# Copy backup to container
docker compose cp ./backup mongo:/data/restore

# Restore
docker compose exec mongo mongorestore --uri="mongodb://admin:admin123@localhost:27017/a2sv_ecommerce?authSource=admin" /data/restore/a2sv_ecommerce
```

---

## 🎯 Next Steps

- [x] Basic Docker setup complete
- [ ] Set up CI/CD pipeline
- [ ] Configure reverse proxy (Nginx)
- [ ] Add SSL certificates
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation
- [ ] Add automated backups

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [MongoDB Docker Documentation](https://hub.docker.com/_/mongo)

---

## 🆘 Getting Help

If you encounter issues:

1. Check this guide's [Troubleshooting](#troubleshooting) section
2. View container logs: `docker compose logs -f`
3. Check service status: `docker compose ps`
4. Review environment variables: `.env` file
5. Open an issue on GitHub

---

**Happy Dockerizing! 🚀**
