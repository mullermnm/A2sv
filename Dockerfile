# ================================
# STAGE 1: Builder
# ================================
FROM node:20-alpine AS builder

# Set build-time arguments
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
# Copying these first allows Docker to cache this layer
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
# Use npm ci for clean, reproducible installs
# Do NOT use --production flag here as we need devDependencies to build
RUN npm ci --no-audit --no-fund --include=dev

# Copy application source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Remove devDependencies to reduce size
RUN npm prune --production

# ================================
# STAGE 2: Production Runtime
# ================================
FROM node:20-alpine AS runtime

# Install dumb-init for proper signal handling
# dumb-init ensures graceful shutdown on SIGTERM
RUN apk add --no-cache dumb-init

# Set runtime environment
ENV NODE_ENV=production \
    PORT=5000 \
    # Improve Node.js performance
    NODE_OPTIONS="--max-old-space-size=2048"

# Create non-root user for security
# Running as root is a security risk
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./

# Copy production node_modules from builder stage
COPY --chown=nodejs:nodejs --from=builder /app/node_modules ./node_modules

# Copy compiled JavaScript from builder stage
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist

# Copy any additional necessary files (if needed)
# COPY --chown=nodejs:nodejs --from=builder /app/public ./public

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE ${PORT}

# Health check - adjust the path if your health endpoint is different
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${PORT}/health', (r) => {if (r.statusCode !== 200) throw new Error('Health check failed')})"

# Use dumb-init to handle signals properly
# This ensures graceful shutdown on SIGTERM
ENTRYPOINT ["dumb-init", "--"]

# Start the application
# Adjust the entry point based on your dist structure
CMD ["node", "dist/app.js"]
