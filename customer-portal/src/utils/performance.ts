import { lazy } from 'react';

// Lazy loading for page components
export const LazySecuritySettings = lazy(() => import('../pages/SecuritySettings'));
export const LazyAllUsers = lazy(() => import('../pages/AllUsers'));

export const LazyAdminSettings = lazy(() => import('../pages/AdminSettings'));
export const LazyWithdraw = lazy(() => import('../pages/Withdraw'));
export const LazyBillPayment = lazy(() => import('../pages/BillPayment'));



// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };
  }
  return null;
};

// Bundle size optimization utilities
export const preloadRoute = (routeImport: () => Promise<any>) => {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = routeImport.toString();
  document.head.appendChild(link);
};

// Image optimization
export const optimizeImage = (src: string, width?: number, height?: number) => {
  const img = new Image();
  img.src = src;
  
  if (width) img.width = width;
  if (height) img.height = height;
  
  // Add loading="lazy" for images below the fold
  img.loading = 'lazy';
  
  return img;
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling utility for large lists
export const calculateVisibleItems = (
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  totalItems: number
) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, totalItems);
  
  return {
    startIndex: Math.max(0, startIndex),
    endIndex,
    visibleCount
  };
};