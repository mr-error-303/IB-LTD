// Bundle optimization utilities
import { lazy } from 'react';

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/static/css/critical.css';
  document.head.appendChild(criticalCSS);

  // Preload critical fonts
  const font = document.createElement('link');
  font.rel = 'preload';
  font.as = 'font';
  font.type = 'font/woff2';
  font.href = '/static/fonts/main.woff2';
  font.crossOrigin = 'anonymous';
  document.head.appendChild(font);
};

// Code splitting utilities
export const createAsyncComponent = (importFunc: () => Promise<any>) => {
  return lazy(importFunc);
};

// Resource hints
export const addResourceHints = () => {
  // DNS prefetch for external resources
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = '//api.example.com';
  document.head.appendChild(dnsPrefetch);

  // Preconnect to critical third-party origins
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect);
};

// Bundle analysis helper
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available in production build');
    return;
  }

  // Performance observer for resource timing
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          // Check if transferSize property exists before accessing it
        const size = 'transferSize' in entry ? (entry as any).transferSize : 'unknown';
        console.log(`Resource: ${entry.name}, Size: ${size} bytes`);
        }
      });
    });
    observer.observe({ entryTypes: ['resource'] });
  }
};

// Tree shaking helper - mark unused exports
export const markUnusedExports = () => {
  if (process.env.NODE_ENV === 'development') {
    // In development, warn about potentially unused exports
    console.warn('Check for unused exports in production build');
  }
};

// Dynamic import with error handling
export const dynamicImport = async (importFunc: () => Promise<any>) => {
  try {
    const module = await importFunc();
    return module;
  } catch (error) {
    console.error('Failed to load module:', error);
    // Return a fallback component or throw
    throw new Error('Module loading failed');
  }
};

// Webpack chunk optimization
export const optimizeChunks = () => {
  // This would be configured in webpack.config.js
  return {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  };
};