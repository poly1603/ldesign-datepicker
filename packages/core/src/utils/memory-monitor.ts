/**
 * 内存监控工具
 */

/**
 * 内存使用情况
 */
export interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

/**
 * 内存监控选项
 */
export interface MemoryMonitorOptions {
  /** 采样间隔（毫秒） */
  sampleInterval?: number;

  /** 最大样本数 */
  maxSamples?: number;

  /** 警告阈值（MB） */
  warningThreshold?: number;

  /** 回调函数 */
  onWarning?: (usage: MemoryUsage) => void;
}

/**
 * 内存监控器
 * 
 * @remarks
 * 用于监控和记录内存使用情况，帮助发现内存泄漏
 * 
 * @example
 * ```ts
 * const monitor = new MemoryMonitor({
 *   sampleInterval: 1000,
 *   warningThreshold: 100, // 100MB
 *   onWarning: (usage) => {
 *     console.warn('Memory usage is high:', usage);
 *   },
 * });
 * 
 * monitor.start();
 * // ... do some work
 * monitor.stop();
 * console.log(monitor.getReport());
 * ```
 */
export class MemoryMonitor {
  private options: Required<MemoryMonitorOptions>;
  private samples: MemoryUsage[] = [];
  private timerId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  constructor(options: MemoryMonitorOptions = {}) {
    this.options = {
      sampleInterval: options.sampleInterval ?? 1000,
      maxSamples: options.maxSamples ?? 100,
      warningThreshold: options.warningThreshold ?? 100 * 1024 * 1024, // 100MB
      onWarning: options.onWarning ?? (() => { }),
    };
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[MemoryMonitor] Already running');
      return;
    }

    if (!this.isPerformanceMemoryAvailable()) {
      console.warn('[MemoryMonitor] performance.memory is not available');
      return;
    }

    this.isRunning = true;
    this.sample(); // 立即采样一次

    this.timerId = setInterval(() => {
      this.sample();
    }, this.options.sampleInterval);
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.isRunning = false;
  }

  /**
   * 采样
   */
  private sample(): void {
    if (!this.isPerformanceMemoryAvailable()) {
      return;
    }

    const memory = (performance as any).memory;
    const usage: MemoryUsage = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };

    this.samples.push(usage);

    // 限制样本数量
    if (this.samples.length > this.options.maxSamples) {
      this.samples.shift();
    }

    // 检查是否超过警告阈值
    if (usage.usedJSHeapSize > this.options.warningThreshold) {
      this.options.onWarning(usage);
    }
  }

  /**
   * 获取当前内存使用情况
   */
  getCurrentUsage(): MemoryUsage | null {
    if (!this.isPerformanceMemoryAvailable()) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };
  }

  /**
   * 获取所有样本
   */
  getSamples(): MemoryUsage[] {
    return [...this.samples];
  }

  /**
   * 获取内存使用报告
   */
  getReport(): {
    samples: number;
    avgUsage: number;
    maxUsage: number;
    minUsage: number;
    currentUsage: number | null;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (this.samples.length === 0) {
      return {
        samples: 0,
        avgUsage: 0,
        maxUsage: 0,
        minUsage: 0,
        currentUsage: this.getCurrentUsage()?.usedJSHeapSize ?? null,
        trend: 'stable',
      };
    }

    const usages = this.samples.map((s) => s.usedJSHeapSize);
    const avgUsage = usages.reduce((sum, u) => sum + u, 0) / usages.length;
    const maxUsage = Math.max(...usages);
    const minUsage = Math.min(...usages);

    // 计算趋势（比较前半部分和后半部分的平均值）
    const mid = Math.floor(this.samples.length / 2);
    const firstHalf = usages.slice(0, mid);
    const secondHalf = usages.slice(mid);
    const firstAvg = firstHalf.reduce((sum, u) => sum + u, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, u) => sum + u, 0) / secondHalf.length;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const diff = secondAvg - firstAvg;
    const threshold = avgUsage * 0.1; // 10% 变化视为趋势

    if (diff > threshold) {
      trend = 'increasing';
    } else if (diff < -threshold) {
      trend = 'decreasing';
    }

    return {
      samples: this.samples.length,
      avgUsage,
      maxUsage,
      minUsage,
      currentUsage: this.getCurrentUsage()?.usedJSHeapSize ?? null,
      trend,
    };
  }

  /**
   * 清空样本
   */
  clear(): void {
    this.samples = [];
  }

  /**
   * 检查 performance.memory 是否可用
   */
  private isPerformanceMemoryAvailable(): boolean {
    return typeof performance !== 'undefined' && 'memory' in performance;
  }

  /**
   * 格式化字节数
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

/**
 * 全局内存监控实例
 */
let globalMonitor: MemoryMonitor | null = null;

/**
 * 获取全局内存监控实例
 */
export function getGlobalMemoryMonitor(): MemoryMonitor {
  if (!globalMonitor) {
    globalMonitor = new MemoryMonitor();
  }
  return globalMonitor;
}

