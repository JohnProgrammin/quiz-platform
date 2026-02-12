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
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.redis.on('error', (err) => console.error('Redis error:', err));
    this.redis.on('connect', () => console.log('✅ Redis connected'));
  }

  /**
   * Set a cache value with TTL (Time To Live)
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (automatically JSONified)
   * @param {number} ttl - Time to live in seconds (default: 3600 = 1 hour)
   */
  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get a cached value
   * @param {string} key - Cache key
   * @returns {any} - Deserialized value or null if not found
   */
  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
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
