import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis connection
 */
export const connectRedis = async (): Promise<RedisClientType> => {
  try {
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }

    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    client.on('error', (error) => {
      console.error('❌ Redis client error:', error);
    });

    client.on('connect', () => {
      console.log('🔄 Redis client connecting...');
    });

    client.on('ready', () => {
      console.log('✅ Redis connected successfully');
    });

    await client.connect();
    redisClient = client;

    return client;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    console.warn('⚠️  Application will continue without Redis cache');
    // Don't exit - app can work without cache
    throw error;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

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
