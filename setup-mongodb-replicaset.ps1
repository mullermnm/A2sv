# MongoDB Replica Set Setup Script for Windows
# This script configures your local MongoDB instance as a replica set
# to enable transaction support

Write-Host "🔧 MongoDB Replica Set Setup for Local Development" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is installed
try {
    $mongoVersion = & mongod --version 2>&1 | Select-String "db version"
    Write-Host "✅ MongoDB detected: $mongoVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB not found. Please install MongoDB first." -ForegroundColor Red
    Write-Host "   Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Setup Steps:" -ForegroundColor Cyan
Write-Host "  1. Stop MongoDB service if running" -ForegroundColor White
Write-Host "  2. Configure MongoDB with replica set" -ForegroundColor White
Write-Host "  3. Restart MongoDB service" -ForegroundColor White
Write-Host "  4. Initialize replica set" -ForegroundColor White
Write-Host ""

# Step 1: Stop MongoDB service
Write-Host "Step 1: Stopping MongoDB service..." -ForegroundColor Yellow
try {
    Stop-Service -Name MongoDB -ErrorAction SilentlyContinue
    Write-Host "✅ MongoDB service stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MongoDB service was not running or couldn't be stopped" -ForegroundColor Yellow
}

# Step 2: Update MongoDB configuration
Write-Host ""
Write-Host "Step 2: Updating MongoDB configuration..." -ForegroundColor Yellow
$mongoConfig = @"
# mongod.conf - MongoDB Configuration File

# Where and how to store data.
storage:
  dbPath: C:\Program Files\MongoDB\Server\7.0\data
  journal:
    enabled: true

# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1,localhost

# Replica Set Configuration
replication:
  replSetName: "rs0"
"@

$configPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
try {
    # Backup existing config
    if (Test-Path $configPath) {
        Copy-Item $configPath "$configPath.backup" -Force
        Write-Host "✅ Backed up existing config to $configPath.backup" -ForegroundColor Green
    }
    
    # Write new config
    $mongoConfig | Out-File -FilePath $configPath -Encoding UTF8 -Force
    Write-Host "✅ MongoDB configuration updated" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update MongoDB configuration" -ForegroundColor Red
    Write-Host "   Please run this script as Administrator" -ForegroundColor Yellow
    exit 1
}

# Step 3: Start MongoDB service
Write-Host ""
Write-Host "Step 3: Starting MongoDB service..." -ForegroundColor Yellow
try {
    Start-Service -Name MongoDB
    Start-Sleep -Seconds 5
    Write-Host "✅ MongoDB service started" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start MongoDB service" -ForegroundColor Red
    Write-Host "   Try running: net start MongoDB" -ForegroundColor Yellow
    exit 1
}

# Step 4: Initialize replica set
Write-Host ""
Write-Host "Step 4: Initializing replica set..." -ForegroundColor Yellow
Write-Host "   This may take a few seconds..." -ForegroundColor Gray

try {
    & mongosh --quiet --eval "load('setup-replica-set.js')"
    Write-Host ""
    Write-Host "✅ Replica set initialized successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to initialize replica set" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "✅ MongoDB Replica Set Setup Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Your .env file has been updated" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. Transactions will now work!" -ForegroundColor White
Write-Host ""
Write-Host "To verify, run: mongosh --eval 'rs.status()'" -ForegroundColor Yellow
Write-Host ""
