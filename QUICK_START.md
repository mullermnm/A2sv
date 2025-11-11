# 🚀 Quick Start - MongoDB Replica Set Setup

## The Error You're Seeing

```
Error: Transaction numbers are only allowed on a replica set member or mongos
```

**Why?** MongoDB transactions require a replica set, even for local development.

---

## ⚡ Choose ONE Method

### Method 1: Docker (Easiest - 2 minutes)

```powershell
# 1. Stop local MongoDB
Stop-Service MongoDB

# 2. Start with Docker
docker-compose up -d mongo mongo-init

# 3. Wait 15 seconds for initialization
Start-Sleep -Seconds 15

# 4. Start your app
npm run dev
```

✅ **Done!** Transactions now work!

---

### Method 2: PowerShell Script (3 minutes)

```powershell
# Run as Administrator
.\setup-mongodb-replicaset.ps1
```

Then:
```powershell
npm run dev
```

✅ **Done!** Transactions now work!

---

### Method 3: Manual Setup (5 minutes)

1. **Edit MongoDB config** (as Administrator):
   ```
   C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg
   ```

2. **Add these lines at the end:**
   ```yaml
   replication:
     replSetName: "rs0"
   ```

3. **Restart MongoDB:**
   ```powershell
   net stop MongoDB
   net start MongoDB
   ```

4. **Initialize replica set:**
   ```powershell
   mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
   ```

5. **Start your app:**
   ```powershell
   npm run dev
   ```

✅ **Done!** Transactions now work!

---

## ✅ Verification

```powershell
# Check replica set status
mongosh --eval "rs.status()"
```

You should see:
```json
{
  "set": "rs0",
  "members": [
    {
      "stateStr": "PRIMARY"  ← You should see this
    }
  ]
}
```

---

## 🧪 Test It

Try creating an order or updating a product - no more transaction errors!

---

## ❓ Still Having Issues?

See full documentation: [MONGODB_REPLICA_SET_SETUP.md](./MONGODB_REPLICA_SET_SETUP.md)

---

## 📋 What's Changed

Your `.env` file now uses:
```env
MONGODB_URI=mongodb://localhost:27017/a2sv_ecommerce?replicaSet=rs0&directConnection=true
```

This tells MongoDB to use the replica set for transactions.

---

## 🎯 Summary

**Before:** ❌ Transactions failed (standalone MongoDB)  
**After:** ✅ Transactions work (replica set enabled)

**Benefits:**
- ✅ Atomic operations (all-or-nothing)
- ✅ Data consistency guaranteed
- ✅ Same as production environment
- ✅ Order creation & product updates are safe

---

**Choose your method and you'll be running in under 5 minutes!** 🚀
