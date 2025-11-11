/**
 * MongoDB Replica Set Setup Script
 * Run this script to initialize MongoDB replica set for local development
 * 
 * Usage:
 *   mongosh < setup-replica-set.js
 */

// Check if replica set is already initialized
try {
  const status = rs.status();
  print('✅ Replica set already initialized');
  print('Replica set name:', status.set);
  print('Members:', status.members.length);
} catch (error) {
  // Replica set not initialized, let's initialize it
  print('🔧 Initializing MongoDB replica set...');
  
  const result = rs.initiate({
    _id: 'rs0',
    members: [
      { _id: 0, host: 'localhost:27017' }
    ]
  });
  
  if (result.ok === 1) {
    print('✅ Replica set initialized successfully!');
    print('');
    print('Configuration:');
    print('  - Replica Set Name: rs0');
    print('  - Member: localhost:27017');
    print('');
    print('⏳ Waiting for replica set to stabilize...');
    
    // Wait a bit for the replica set to stabilize
    sleep(2000);
    
    // Check status
    const newStatus = rs.status();
    print('');
    print('Current Status:');
    print('  - State:', newStatus.members[0].stateStr);
    print('');
    print('🎉 MongoDB is now ready for transactions!');
    print('');
    print('Next steps:');
    print('  1. Update your connection string to include replicaSet=rs0');
    print('  2. Restart your application');
    print('  3. Transactions will now work!');
  } else {
    print('❌ Failed to initialize replica set');
    print('Error:', result);
  }
}
