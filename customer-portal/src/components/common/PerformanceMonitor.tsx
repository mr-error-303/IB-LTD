import React, { useEffect, useState } from 'react';
import { measurePerformance, getMemoryUsage } from '../../utils/performance';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  loadTime: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showMetrics?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  showMetrics = false 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    loadTime: 0
  });

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();

    // Measure initial load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    // Monitor memory usage
    const memoryInfo = getMemoryUsage();
    const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / (1024 * 1024) : 0;

    // Measure render time
    const renderTime = performance.now() - startTime;

    setMetrics({
      renderTime,
      memoryUsage,
      loadTime
    });

    // Set up performance observer
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure') {
            console.log(`Performance measure: ${entry.name} - ${entry.duration}ms`);
          }
        });
      });
      observer.observe({ entryTypes: ['measure'] });

      return () => observer.disconnect();
    }
  }, [enabled]);

  // Performance warning thresholds
  useEffect(() => {
    if (!enabled) return;

    if (metrics.renderTime > 100) {
      console.warn(`Slow render detected: ${metrics.renderTime}ms`);
    }

    if (metrics.memoryUsage > 50) {
      console.warn(`High memory usage: ${metrics.memoryUsage}MB`);
    }

    if (metrics.loadTime > 3000) {
      console.warn(`Slow page load: ${metrics.loadTime}ms`);
    }
  }, [metrics, enabled]);

  if (!enabled || !showMetrics) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
      <div>Memory: {metrics.memoryUsage.toFixed(2)}MB</div>
      <div>Load: {metrics.loadTime}ms</div>
    </div>
  );
};

export default PerformanceMonitor;