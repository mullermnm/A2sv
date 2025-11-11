import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '@bootstrap/redis';

/**
 * Cache Middleware
 * Caches GET requests for improved performance
 * Automatically invalidates cache based on patterns
 */

/**
 * Generate deterministic cache key from request
 */
const generateCacheKey = (req: Request): string => {
  const baseUrl = req.baseUrl || '';
  const path = req.path;

  // Sort query parameters for deterministic keys
  const sortedQuery = Object.keys(req.query)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = req.query[key];
        return acc;
      },
      {} as Record<string, unknown>
    );

  const queryString = JSON.stringify(sortedQuery);
  return `cache:${baseUrl}${path}:${queryString}`;
};

/**
 * Cache middleware factory
 * @param ttl Time to live in seconds (default: 300 = 5 minutes)
 */
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    const redisClient = getRedisClient();

    // If Redis is not available, skip caching
    if (!redisClient || !redisClient.isOpen) {
      next();
      return;
    }

    try {
      const cacheKey = generateCacheKey(req);

      // Try to get cached response
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        // Return cached response
        res.json(JSON.parse(cachedData));
        return;
      }

      // Store original res.json method
      const originalJson = res.json.bind(res);

      // Override res.json to cache successful responses
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res.json = function (data: any) {
        // Only cache successful responses (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient
            .setEx(cacheKey, ttl, JSON.stringify(data))
            .catch((err) => console.error('Redis cache set error:', err));
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      // If caching fails, continue without caching
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Clear cache by pattern
 * @param pattern Redis key pattern (e.g., 'cache:/api/v1/products*')
 */
export const clearCache = async (pattern: string): Promise<void> => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) {
    return;
  }

  try {
    // Get all keys matching the pattern
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      // Delete all matching keys
      await redisClient.del(keys);
      console.log(`✅ Cleared ${keys.length} cache entries for pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Clear all product-related cache
 */
export const clearProductCache = async (): Promise<void> => {
  await clearCache('cache:*/products*');
};

/**
 * Clear all order-related cache
 */
export const clearOrderCache = async (): Promise<void> => {
  await clearCache('cache:*/orders*');
};

/**
 * Clear all cache
 */
export const clearAllCache = async (): Promise<void> => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.flushDb();
    console.log('✅ All cache cleared');
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};
