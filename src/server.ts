import dotenv from 'dotenv';
import createApp from './app';
import { connectDatabase } from './bootstrap/database';
import { connectRedis } from './bootstrap/redis';

// Load environment variables
dotenv.config();

/**
 * Start the Express server
 */
const startServer = async (): Promise<void> => {
  try {
    // ===================
    // Initialize Database
    // ===================
    await connectDatabase();

    // ===================
    // Initialize Redis (Optional - won't crash if fails)
    // ===================
    try {
      await connectRedis();
    } catch (error) {
      console.warn('⚠️  Redis connection failed - continuing without cache');
    }

    // ===================
    // Create Express App
    // ===================
    const app = createApp();

    // ===================
    // Start Server
    // ===================
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 A2SV E-commerce API Server Started Successfully');
      console.log('='.repeat(60));
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
