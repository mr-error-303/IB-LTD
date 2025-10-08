import { useEffect, useRef, useState, useCallback } from 'react';
import { debounce, throttle, getMemoryUsage } from '../utils/performance';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: any;
  componentMountTime: number;
}

export const usePerformance = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const mountTimeRef = useRef<number>(Date.now());
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    
    const updateMetrics = () => {
      setMetrics({
        renderTime: performance.now(),
        memoryUsage: getMemoryUsage(),
        componentMountTime: mountTime
      });
    };

    updateMetrics();

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} mounted in ${mountTime}ms`);
    }
  }, [componentName]);

  const trackRender = useCallback(() => {
    renderCountRef.current += 1;
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCountRef.current} times`);
    }
  }, [componentName]);

  return {
    metrics,
    trackRender,
    renderCount: renderCountRef.current
  };
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const throttledCallback = useRef(throttle(callback, delay));

  useEffect(() => {
    throttledCallback.current = throttle(callback, delay);
  }, [callback, delay]);

  return throttledCallback.current as T;
};

export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
};

export const useImagePreloader = (imageSources: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const imagePromises = imageSources.map((src) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(src);
        img.src = src;
      });
    });

    Promise.allSettled(imagePromises).then((results) => {
      if (isMounted) {
        const loaded = new Set<string>();
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            loaded.add(imageSources[index]);
          }
        });
        setLoadedImages(loaded);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [imageSources]);

  return { loadedImages, isLoading };
};