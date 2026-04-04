import config from './index';
import logger from '../utils/logger';

let redis: any = null;
let redisAvailable = false;

// In-memory cache fallback
const memoryCache: Map<string, { value: string; expiry?: number }> = new Map();

try {
  const Redis = require('ioredis');
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    retryStrategy: (times: number) => {
      if (times > 3) {
        logger.warn('Redis connection failed after 3 retries — using in-memory cache');
        return null; // stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    enableReadyCheck: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
    lazyConnect: true,
  });

  redis.on('error', (err: Error) => {
    if (redisAvailable) {
      logger.warn('Redis disconnected — falling back to in-memory cache');
    }
    redisAvailable = false;
  });

  redis.on('connect', () => {
    redisAvailable = true;
    logger.info('Connected to Redis');
  });

  // Try to connect, but don't fail if Redis is unavailable
  redis.connect().catch(() => {
    logger.warn('Redis not available — using in-memory cache fallback');
    redisAvailable = false;
  });
} catch (err) {
  logger.warn('Could not initialize Redis — using in-memory cache fallback');
}

export const isRedisAvailable = () => redisAvailable;

export const cacheGet = async (key: string): Promise<string | null> => {
  if (redis && redisAvailable) {
    try {
      return await redis.get(key);
    } catch {
      // fall through to memory cache
    }
  }
  const entry = memoryCache.get(key);
  if (entry) {
    if (entry.expiry && Date.now() > entry.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value;
  }
  return null;
};

export const cacheSet = async (key: string, value: string, expiresIn?: number): Promise<void> => {
  if (redis && redisAvailable) {
    try {
      if (expiresIn) {
        await redis.setex(key, expiresIn, value);
      } else {
        await redis.set(key, value);
      }
      return;
    } catch {
      // fall through to memory cache
    }
  }
  memoryCache.set(key, {
    value,
    expiry: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
  });
};

export const cacheDel = async (key: string): Promise<void> => {
  if (redis && redisAvailable) {
    try {
      await redis.del(key);
    } catch {
      // fall through
    }
  }
  memoryCache.delete(key);
};

export const cacheIncrBy = async (key: string, amount: number): Promise<number> => {
  if (redis && redisAvailable) {
    try {
      return await redis.incrby(key, amount);
    } catch {
      // fall through
    }
  }
  const entry = memoryCache.get(key);
  const current = entry ? parseInt(entry.value, 10) || 0 : 0;
  const newVal = current + amount;
  memoryCache.set(key, { value: String(newVal) });
  return newVal;
};

export default redis || {};
