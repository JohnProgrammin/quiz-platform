const Redis = require('ioredis');
require('dotenv').config();

/**
 * Redis Cache Service
 * Handles caching for sessions, quiz data, and frequently accessed resources
 *
 * Environment Variables:
 * - REDIS_URL: Redis connection URL from Upstash
 */

class CacheService {
  constructor() {
    this.isConnected = false;

    // Only try to connect if REDIS_URL is provided
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3, // Reduce retry attempts
          enableReadyCheck: false,
          enableOfflineQueue: false,
        });

        this.redis.on('error', (err) => {
          console.warn('⚠️ Redis error (cache disabled):', err.message);
          this.isConnected = false;
        });

        this.redis.on('connect', () => {
          console.log('✅ Redis connected');
          this.isConnected = true;
        });

        this.redis.on('ready', () => {
          console.log('✅ Redis ready');
          this.isConnected = true;
        });
      } catch (error) {
        console.warn('⚠️ Redis connection failed, cache disabled:', error.message);
        this.redis = null;
        this.isConnected = false;
      }
    } else {
      console.warn('⚠️ REDIS_URL not set - caching disabled (app will work without cache)');
      this.redis = null;
      this.isConnected = false;
    }
  }

  /**
   * Set a cache value with TTL (Time To Live)
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (automatically JSONified)
   * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
   */
  async set(key, value, ttl = 3600) {
    // If Redis is not connected, silently skip caching (app still works)
    if (!this.redis || !this.isConnected) {
      return true; // Return true so app continues normally
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.warn(`Cache set warning for key ${key}:`, error.message);
      return true; // Still return true - cache failure shouldn't crash app
    }
  }

  /**
   * Get a cached value
   * @param {string} key - Cache key
   * @returns {any} - Deserialized value or null if not found
   */
  async get(key) {
    // If Redis is not connected, return null (cache miss)
    if (!this.redis || !this.isConnected) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn(`Cache get warning for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Delete a cached value
   */
  async delete(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys) {
    try {
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache deleteMany error:', error);
      return false;
    }
  }

  /**
   * Increment a counter (used for rate limiting)
   */
  async increment(key, ttl = 3600) {
    try {
      const result = await this.redis.incr(key);
      if (result === 1) {
        // First time incrementing, set expiry
        await this.redis.expire(key, ttl);
      }
      return result;
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async getTTL(key) {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error(`Cache getTTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Clear all cache (careful in production!)
   */
  async flush() {
    try {
      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    try {
      await this.redis.disconnect();
      console.log('✅ Redis disconnected');
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }

  /**
   * Test Redis connection
   */
  async testConnection() {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('Redis connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
