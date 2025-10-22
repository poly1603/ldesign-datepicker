/**
 * 性能工具测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LRUCache, PerformanceMonitor, benchmark, throttle, debounce } from '../utils/performance';

describe('LRUCache', () => {
  let cache: LRUCache<string, number>;

  beforeEach(() => {
    cache = new LRUCache<string, number>(3);
  });

  it('应该正确存储和获取值', () => {
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
  });

  it('应该在达到最大容量时删除最久未使用的项', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // 应该删除 'a'

    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('d')).toBe(4);
  });

  it('访问项应该更新其使用顺序', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    cache.get('a'); // 访问 'a'，使其变为最近使用

    cache.set('d', 4); // 应该删除 'b'

    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  it('应该计算命中率', () => {
    cache.set('a', 1);
    cache.set('b', 2);

    cache.get('a'); // 命中
    cache.get('a'); // 命中
    cache.get('c'); // 未命中

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(2 / 3);
  });

  it('getOrSet 应该正确工作', () => {
    let factoryCalled = false;

    const value = cache.getOrSet('key', () => {
      factoryCalled = true;
      return 42;
    });

    expect(value).toBe(42);
    expect(factoryCalled).toBe(true);

    // 第二次调用不应该执行 factory
    factoryCalled = false;
    const value2 = cache.getOrSet('key', () => {
      factoryCalled = true;
      return 100;
    });

    expect(value2).toBe(42);
    expect(factoryCalled).toBe(false);
  });
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  it('应该记录和测量性能', () => {
    monitor.mark('start');

    // 模拟一些工作
    for (let i = 0; i < 1000; i++) {
      Math.sqrt(i);
    }

    monitor.mark('end');
    const duration = monitor.measure('test', 'start', 'end');

    expect(duration).toBeGreaterThan(0);
  });

  it('应该收集统计信息', () => {
    for (let i = 0; i < 5; i++) {
      monitor.mark(`start${i}`);
      monitor.mark(`end${i}`);
      monitor.measure('operation', `start${i}`, `end${i}`);
    }

    const stats = monitor.getStats('operation');
    expect(stats).toBeTruthy();
    expect(stats!.count).toBe(5);
    expect(stats!.avg).toBeGreaterThanOrEqual(0);
  });
});

describe('benchmark', () => {
  it('应该测试函数性能', () => {
    const result = benchmark(() => {
      let sum = 0;
      for (let i = 0; i < 100; i++) {
        sum += i;
      }
    }, 100);

    expect(result.totalTime).toBeGreaterThan(0);
    expect(result.averageTime).toBeGreaterThan(0);
    expect(result.opsPerSecond).toBeGreaterThan(0);
  });
});

describe('throttle', () => {
  it('应该限制函数调用频率', async () => {
    let callCount = 0;
    const fn = throttle(() => {
      callCount++;
    }, 100);

    fn();
    fn();
    fn();

    expect(callCount).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, 150));

    fn();
    expect(callCount).toBe(2);
  });

  it('应该支持取消', () => {
    let callCount = 0;
    const fn = throttle(() => {
      callCount++;
    }, 100);

    fn();
    fn.cancel();

    expect(callCount).toBe(1);
  });
});

describe('debounce', () => {
  it('应该延迟执行函数', async () => {
    let callCount = 0;
    const fn = debounce(() => {
      callCount++;
    }, 100);

    fn();
    expect(callCount).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(callCount).toBe(1);
  });

  it('应该在等待期间重置定时器', async () => {
    let callCount = 0;
    const fn = debounce(() => {
      callCount++;
    }, 100);

    fn();
    await new Promise((resolve) => setTimeout(resolve, 50));
    fn();
    await new Promise((resolve) => setTimeout(resolve, 50));
    fn();

    expect(callCount).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(callCount).toBe(1);
  });

  it('应该支持立即执行', () => {
    let callCount = 0;
    const fn = debounce(() => {
      callCount++;
    }, 100);

    fn();
    fn.flush();

    expect(callCount).toBe(1);
  });
});

