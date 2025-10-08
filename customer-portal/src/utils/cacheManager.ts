// Cache management utilities for improved performance
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // Set cache item with optional expiry
  set<T>(key: string, data: T, expiry?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: expiry || this.DEFAULT_EXPIRY
    };
    this.cache.set(key, item);
  }

  // Get cache item if not expired
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // Check if cache has valid item
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Clear specific cache item
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Clear expired items
  clearExpired(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, item] of entries) {
      if (item.expiry && now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Get cache statistics
  getStats(): { totalSize: number; itemCount: number } {
    let totalSize = 0;
    const values = Array.from(this.cache.values());
    for (const item of values) {
      totalSize += JSON.stringify(item.data).length;
    }
    return {
      totalSize,
      itemCount: this.cache.size
    };
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Cache keys constants
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  ACCOUNT_BALANCE: 'account_balance',
  TRANSACTIONS: 'transactions',
  BENEFICIARIES: 'beneficiaries',
  CARDS: 'cards',
  SECURITY_SETTINGS: 'security_settings',
  ADMIN_USERS: 'admin_users',
  ADMIN_ANALYTICS: 'admin_analytics'
} as const;

// API response caching wrapper
export const withCache = async <T>(
  key: string,
  apiCall: () => Promise<T>,
  expiry?: number
): Promise<T> => {
  // Check cache first
  const cached = cacheManager.get<T>(key);
  if (cached) {
    return cached;
  }

  // Make API call and cache result
  try {
    const data = await apiCall();
    cacheManager.set(key, data, expiry);
    return data;
  } catch (error) {
    // Don't cache errors
    throw error;
  }
};

// Local storage cache for persistent data
export const persistentCache = {
  set<T>(key: string, data: T, expiry?: number): void {
    const item = {
      data,
      timestamp: Date.now(),
      expiry: expiry || 24 * 60 * 60 * 1000 // 24 hours default
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
  },

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (!stored) return null;

      const item = JSON.parse(stored);
      const now = Date.now();
      
      if (now - item.timestamp > item.expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return item.data;
    } catch {
      return null;
    }
  },

  delete(key: string): void {
    localStorage.removeItem(`cache_${key}`);
  },

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Initialize cache cleanup interval
setInterval(() => {
  cacheManager.clearExpired();
}, 60000); // Clean every minute