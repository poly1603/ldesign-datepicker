/**
 * 性能优化工具（增强版）
 */

/**
 * 请求动画帧节流
 */
export function rafThrottle<T extends (...args: any[]) => any>(fn: T): T {
  let rafId: number | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (rafId !== null) return;

    rafId = requestAnimationFrame(() => {
      fn.apply(this, args);
      rafId = null;
    });
  } as T;
}

/**
 * 空闲时执行
 */
export function runWhenIdle(callback: () => void, timeout = 2000): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * 批处理更新
 */
export class BatchUpdater {
  private updates: Set<() => void> = new Set();
  private rafId: number | null = null;
  private isScheduled = false;

  add(update: () => void): void {
    this.updates.add(update);
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.isScheduled) return;

    this.isScheduled = true;
    this.rafId = requestAnimationFrame(() => {
      this.flush();
    });
  }

  private flush(): void {
    const updates = Array.from(this.updates);
    this.updates.clear();
    this.rafId = null;
    this.isScheduled = false;

    updates.forEach((update) => {
      try {
        update();
      } catch (error) {
        console.error('[BatchUpdater] Error executing update:', error);
      }
    });
  }

  /**
   * 立即执行所有挂起的更新
   */
  flushSync(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.flush();
  }

  /**
   * 取消所有挂起的更新
   */
  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.updates.clear();
    this.isScheduled = false;
  }
}

/**
 * LRU 缓存（增强版）
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.hits++;
      // 移到最后（最近使用）
      this.cache.delete(key);
      this.cache.set(key, value);
    } else {
      this.misses++;
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项（第一个）
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 获取或设置（如果不存在）
   */
  getOrSet(key: K, factory: () => V): V {
    if (this.has(key)) {
      return this.get(key)!;
    }

    const value = factory();
    this.set(key, value);
    return value;
  }

  /**
   * 获取缓存命中率
   */
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
    };
  }

  /**
   * 获取所有键
   */
  keys(): K[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取所有值
   */
  values(): V[] {
    return Array.from(this.cache.values());
  }
}

/**
 * 懒加载
 */
export function lazyLoad<T>(loader: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null;

  return () => {
    if (!promise) {
      promise = loader();
    }
    return promise;
  };
}

/**
 * 性能监控（增强版）
 */
export class PerformanceMonitor {
  private marks = new Map<string, number>();
  private measurements = new Map<string, number[]>();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (start === undefined) return 0;

    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (end === undefined) return 0;

    const duration = end - start;

    // 记录测量结果
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * 获取测量统计
   */
  getStats(name: string) {
    const durations = this.measurements.get(name) || [];
    if (durations.length === 0) {
      return null;
    }

    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const sorted = [...durations].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0;

    return {
      count: durations.length,
      avg,
      min,
      max,
      median,
      total: sum,
    };
  }

  /**
   * 获取所有统计
   */
  getAllStats() {
    const stats: Record<string, any> = {};

    for (const name of this.measurements.keys()) {
      stats[name] = this.getStats(name);
    }

    return stats;
  }

  clear(): void {
    this.marks.clear();
    this.measurements.clear();
  }
}

/**
 * 简单的性能测试
 */
export function benchmark(fn: () => void, iterations = 1000): {
  totalTime: number;
  averageTime: number;
  opsPerSecond: number;
} {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    fn();
  }

  const totalTime = performance.now() - start;
  const averageTime = totalTime / iterations;
  const opsPerSecond = 1000 / averageTime;

  return {
    totalTime,
    averageTime,
    opsPerSecond,
  };
}

/**
 * 异步性能测试
 */
export async function benchmarkAsync(
  fn: () => Promise<void>,
  iterations = 100
): Promise<{
  totalTime: number;
  averageTime: number;
  opsPerSecond: number;
}> {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    await fn();
  }

  const totalTime = performance.now() - start;
  const averageTime = totalTime / iterations;
  const opsPerSecond = 1000 / averageTime;

  return {
    totalTime,
    averageTime,
    opsPerSecond,
  };
}

/**
 * 创建节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastExecuted = 0;

  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastExecuted);

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastExecuted = now;
      fn.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastExecuted = Date.now();
        timeout = null;
        fn.apply(this, args);
      }, remaining);
    }
  } as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return throttled;
}

/**
 * 创建防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): T & { cancel: () => void; flush: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      if (lastArgs) {
        fn.apply(lastThis, lastArgs);
      }
    }, wait);
  } as T & { cancel: () => void; flush: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (lastArgs) {
      fn.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  };

  return debounced;
}




