import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis connection (Optional - for caching bonus feature)
 * To use Redis: Install Redis server and run it locally
 * Windows: Download from https://github.com/microsoftarchive/redis/releases
 * Mac: brew install redis && brew services start redis
 * Linux: sudo apt-get install redis-server && sudo systemctl start redis
 */
export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        connectTimeout: 2000, // 2 second timeout
        reconnectStrategy: () => false, // Don't retry connection
      },
    });

    // Suppress error logs - Redis is optional
    redisClient.on('error', () => {
      // Silent - Redis is optional for caching
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    await redisClient.connect();
  } catch (error) {
    // Silently fail - Redis is optional
    redisClient = null;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => redisClient;

/**
 * Disconnect from Redis
 */
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      redisClient = null;
      console.log('🔌 Redis disconnected');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from Redis:', error);
  }
};
