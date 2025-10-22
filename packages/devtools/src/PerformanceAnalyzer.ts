/**
 * 性能分析器
 */

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 首次渲染时间 */
  firstRenderTime: number;

  /** 平均渲染时间 */
  avgRenderTime: number;

  /** 最慢渲染时间 */
  slowestRenderTime: number;

  /** 渲染次数 */
  renderCount: number;

  /** 事件处理平均时间 */
  avgEventTime: number;

  /** 内存使用 */
  memoryUsage: {
    current: number;
    peak: number;
    avg: number;
  };
}

/**
 * 性能记录
 */
export interface PerformanceRecord {
  type: 'render' | 'event' | 'update';
  name: string;
  duration: number;
  timestamp: number;
  memory?: number;
}

/**
 * 性能分析器
 */
export class PerformanceAnalyzer {
  private records: PerformanceRecord[] = [];
  private maxRecords: number;

  constructor(maxRecords = 1000) {
    this.maxRecords = maxRecords;
  }

  /**
   * 记录性能
   */
  record(record: PerformanceRecord): void {
    this.records.push(record);

    if (this.records.length > this.maxRecords) {
      this.records.shift();
    }
  }

  /**
   * 开始测量
   */
  startMeasure(name: string, type: PerformanceRecord['type']): () => void {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return () => {
      const duration = performance.now() - startTime;
      const memory = this.getMemoryUsage();

      this.record({
        type,
        name,
        duration,
        timestamp: Date.now(),
        memory: memory ? memory - (startMemory || 0) : undefined,
      });
    };
  }

  /**
   * 获取指标
   */
  getMetrics(): PerformanceMetrics {
    const renderRecords = this.records.filter((r) => r.type === 'render');
    const eventRecords = this.records.filter((r) => r.type === 'event');
    const memoryRecords = this.records.filter((r) => r.memory !== undefined);

    return {
      firstRenderTime: renderRecords[0]?.duration || 0,
      avgRenderTime: this.average(renderRecords.map((r) => r.duration)),
      slowestRenderTime: Math.max(...renderRecords.map((r) => r.duration), 0),
      renderCount: renderRecords.length,
      avgEventTime: this.average(eventRecords.map((r) => r.duration)),
      memoryUsage: {
        current: this.getMemoryUsage() || 0,
        peak: Math.max(...memoryRecords.map((r) => r.memory!), 0),
        avg: this.average(memoryRecords.map((r) => r.memory!)),
      },
    };
  }

  /**
   * 获取慢操作（超过阈值）
   */
  getSlowOperations(threshold = 16): PerformanceRecord[] {
    return this.records.filter((r) => r.duration > threshold);
  }

  /**
   * 获取性能报告
   */
  getReport(): string {
    const metrics = this.getMetrics();
    const slowOps = this.getSlowOperations();

    return `
DatePicker 性能报告
==================

渲染性能:
- 首次渲染: ${metrics.firstRenderTime.toFixed(2)}ms
- 平均渲染: ${metrics.avgRenderTime.toFixed(2)}ms
- 最慢渲染: ${metrics.slowestRenderTime.toFixed(2)}ms
- 渲染次数: ${metrics.renderCount}

事件处理:
- 平均耗时: ${metrics.avgEventTime.toFixed(2)}ms

内存使用:
- 当前: ${(metrics.memoryUsage.current / 1024 / 1024).toFixed(2)}MB
- 峰值: ${(metrics.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB
- 平均: ${(metrics.memoryUsage.avg / 1024 / 1024).toFixed(2)}MB

慢操作 (>16ms):
${slowOps.map((op) => `- ${op.name}: ${op.duration.toFixed(2)}ms`).join('\n')}
    `.trim();
  }

  /**
   * 导出数据
   */
  export(): string {
    return JSON.stringify({
      metrics: this.getMetrics(),
      records: this.records,
    }, null, 2);
  }

  /**
   * 清空记录
   */
  clear(): void {
    this.records = [];
  }

  /**
   * 计算平均值
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * 获取内存使用
   */
  private getMemoryUsage(): number | null {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return null;
  }
}

/**
 * 全局性能分析器
 */
let globalAnalyzer: PerformanceAnalyzer | null = null;

/**
 * 获取全局性能分析器
 */
export function getGlobalAnalyzer(): PerformanceAnalyzer {
  if (!globalAnalyzer) {
    globalAnalyzer = new PerformanceAnalyzer();
  }
  return globalAnalyzer;
}

