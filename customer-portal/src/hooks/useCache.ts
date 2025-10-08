import { useState, useEffect, useCallback } from 'react';
import { cacheManager, withCache, persistentCache } from '../utils/cacheManager';

// Hook for memory cache
export const useCache = <T>(key: string, initialData?: T) => {
  const [data, setData] = useState<T | null>(() => {
    return cacheManager.get<T>(key) || initialData || null;
  });

  const updateCache = useCallback((newData: T, expiry?: number) => {
    cacheManager.set(key, newData, expiry);
    setData(newData);
  }, [key]);

  const clearCache = useCallback(() => {
    cacheManager.delete(key);
    setData(null);
  }, [key]);

  const refreshCache = useCallback(async (apiCall: () => Promise<T>, expiry?: number) => {
    try {
      const newData = await withCache(key, apiCall, expiry);
      setData(newData);
      return newData;
    } catch (error) {
      throw error;
    }
  }, [key]);

  return {
    data,
    updateCache,
    clearCache,
    refreshCache,
    hasCache: data !== null
  };
};

// Hook for persistent cache (localStorage)
export const usePersistentCache = <T>(key: string, initialData?: T) => {
  const [data, setData] = useState<T | null>(() => {
    return persistentCache.get<T>(key) || initialData || null;
  });

  const updateCache = useCallback((newData: T, expiry?: number) => {
    persistentCache.set(key, newData, expiry);
    setData(newData);
  }, [key]);

  const clearCache = useCallback(() => {
    persistentCache.delete(key);
    setData(null);
  }, [key]);

  return {
    data,
    updateCache,
    clearCache,
    hasCache: data !== null
  };
};

// Hook for API data with automatic caching
export const useCachedApi = <T>(
  key: string,
  apiCall: () => Promise<T>,
  options: {
    expiry?: number;
    refreshOnMount?: boolean;
    refreshInterval?: number;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { expiry, refreshOnMount = true, refreshInterval } = options;

  const fetchData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      if (!forceRefresh) {
        // Check cache first
        const cached = cacheManager.get<T>(key);
        if (cached) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      // Make API call
      const result = await withCache(key, apiCall, expiry);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, apiCall, expiry]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  const clearCache = useCallback(() => {
    cacheManager.delete(key);
    setData(null);
  }, [key]);

  useEffect(() => {
    if (refreshOnMount) {
      fetchData();
    }
  }, [fetchData, refreshOnMount]);

  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => {
        fetchData(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
    hasCache: data !== null
  };
};

// Hook for cache statistics
export const useCacheStats = () => {
  const [stats, setStats] = useState(cacheManager.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheManager.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stats;
};