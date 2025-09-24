/**
 * Caching configuration with Redis support and memory fallback
 * Provides efficient caching for database queries and API responses
 */
class CacheConfig {
  constructor() {
    this.cache = new Map(); // Memory fallback
    this.redis = null;
    this.isRedisAvailable = false;
    this.defaultTTL = 300; // 5 minutes default TTL
    this.maxMemoryEntries = 1000; // Maximum entries in memory cache
    
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection (optional)
   */
  async initializeRedis() {
    try {
      // Only try Redis if explicitly configured
      if (process.env.REDIS_URL || process.env.REDIS_HOST) {
        const redis = require('redis');
        
        const redisConfig = {
          url: process.env.REDIS_URL,
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD,
          db: process.env.REDIS_DB || 0,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          keepAlive: 30000,
          connectTimeout: 10000,
          commandTimeout: 5000
        };

        this.redis = redis.createClient(redisConfig);
        
        this.redis.on('connect', () => {
          console.log('📦 Redis cache connected');
          this.isRedisAvailable = true;
        });

        this.redis.on('error', (err) => {
          console.warn('⚠️  Redis cache error, falling back to memory cache:', err.message);
          this.isRedisAvailable = false;
        });

        this.redis.on('end', () => {
          console.log('📦 Redis cache disconnected');
          this.isRedisAvailable = false;
        });

        await this.redis.connect();
      } else {
        console.log('📦 Using memory cache (Redis not configured)');
      }
    } catch (error) {
      console.warn('⚠️  Redis initialization failed, using memory cache:', error.message);
      this.isRedisAvailable = false;
    }
  }

  /**
   * Set cache value with TTL
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (this.isRedisAvailable && this.redis) {
        await this.redis.setEx(key, ttl, serializedValue);
      } else {
        // Memory cache with TTL
        this.cleanupMemoryCache();
        this.cache.set(key, {
          value: serializedValue,
          expires: Date.now() + (ttl * 1000)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get cache value
   */
  async get(key) {
    try {
      if (this.isRedisAvailable && this.redis) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Memory cache
        const cached = this.cache.get(key);
        if (cached) {
          if (Date.now() < cached.expires) {
            return JSON.parse(cached.value);
          } else {
            this.cache.delete(key);
          }
        }
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete cache value
   */
  async del(key) {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(key);
      } else {
        this.cache.delete(key);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.flushDb();
      } else {
        this.cache.clear();
      }
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key) {
    try {
      if (this.isRedisAvailable && this.redis) {
        return await this.redis.exists(key) === 1;
      } else {
        const cached = this.cache.get(key);
        return cached && Date.now() < cached.expires;
      }
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Set cache with pattern-based invalidation
   */
  async setWithTags(key, value, tags = [], ttl = this.defaultTTL) {
    await this.set(key, value, ttl);
    
    // Store tag associations for invalidation
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      let taggedKeys = await this.get(tagKey) || [];
      if (!taggedKeys.includes(key)) {
        taggedKeys.push(key);
        await this.set(tagKey, taggedKeys, ttl * 2); // Tags live longer
      }
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTag(tag) {
    try {
      const tagKey = `tag:${tag}`;
      const taggedKeys = await this.get(tagKey) || [];
      
      for (const key of taggedKeys) {
        await this.del(key);
      }
      
      await this.del(tagKey);
      return true;
    } catch (error) {
      console.error('Cache tag invalidation error:', error);
      return false;
    }
  }

  /**
   * Cache wrapper for functions
   */
  async wrap(key, fn, ttl = this.defaultTTL, tags = []) {
    try {
      // Try to get from cache first
      let result = await this.get(key);
      
      if (result !== null) {
        return result;
      }

      // Execute function and cache result
      result = await fn();
      
      if (result !== null && result !== undefined) {
        if (tags.length > 0) {
          await this.setWithTags(key, result, tags, ttl);
        } else {
          await this.set(key, result, ttl);
        }
      }

      return result;
    } catch (error) {
      console.error('Cache wrap error:', error);
      // Return function result even if caching fails
      return await fn();
    }
  }

  /**
   * Cleanup expired entries in memory cache
   */
  cleanupMemoryCache() {
    if (this.cache.size > this.maxMemoryEntries) {
      const now = Date.now();
      const keysToDelete = [];
      
      for (const [key, cached] of this.cache.entries()) {
        if (now >= cached.expires) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => this.cache.delete(key));
      
      // If still too many entries, remove oldest
      if (this.cache.size > this.maxMemoryEntries) {
        const entries = Array.from(this.cache.entries());
        const toRemove = entries.slice(0, entries.length - this.maxMemoryEntries);
        toRemove.forEach(([key]) => this.cache.delete(key));
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const stats = {
        type: this.isRedisAvailable ? 'redis' : 'memory',
        connected: this.isRedisAvailable
      };

      if (this.isRedisAvailable && this.redis) {
        const info = await this.redis.info('memory');
        stats.memory = info;
      } else {
        stats.memoryEntries = this.cache.size;
        stats.maxMemoryEntries = this.maxMemoryEntries;
      }

      return stats;
    } catch (error) {
      console.error('Cache stats error:', error);
      return { error: error.message };
    }
  }

  /**
   * Generate cache key for database queries
   */
  generateQueryKey(model, query, options = {}) {
    const queryString = JSON.stringify({ model, query, options });
    return `query:${Buffer.from(queryString).toString('base64')}`;
  }

  /**
   * Generate cache key for user data
   */
  generateUserKey(userId, dataType = 'profile') {
    return `user:${userId}:${dataType}`;
  }

  /**
   * Generate cache key for admin data
   */
  generateAdminKey(adminId, dataType = 'dashboard') {
    return `admin:${adminId}:${dataType}`;
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    try {
      if (this.redis) {
        await this.redis.quit();
      }
      this.cache.clear();
      console.log('📦 Cache disconnected');
    } catch (error) {
      console.error('Cache disconnect error:', error);
    }
  }
}

module.exports = new CacheConfig();