/**
 * 状态调试器
 */

import type { StateSnapshot } from '@ldesign/datepicker-core';

/**
 * 调试器配置
 */
export interface DebuggerConfig {
  /** 是否启用 */
  enabled?: boolean;

  /** 最大日志数量 */
  maxLogs?: number;

  /** 是否记录性能 */
  trackPerformance?: boolean;

  /** 是否记录内存 */
  trackMemory?: boolean;
}

/**
 * 调试日志
 */
export interface DebugLog {
  timestamp: number;
  action: string;
  state: any;
  duration?: number;
  memory?: number;
}

/**
 * 状态调试器
 */
export class StateDebugger {
  private logs: DebugLog[] = [];
  private config: Required<DebuggerConfig>;
  private performanceMarks = new Map<string, number>();

  constructor(config: DebuggerConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      maxLogs: config.maxLogs ?? 1000,
      trackPerformance: config.trackPerformance ?? true,
      trackMemory: config.trackMemory ?? true,
    };
  }

  /**
   * 记录状态变更
   */
  log(action: string, state: any): void {
    if (!this.config.enabled) return;

    const log: DebugLog = {
      timestamp: Date.now(),
      action,
      state: this.cloneForLogging(state),
    };

    // 记录性能
    if (this.config.trackPerformance) {
      const mark = this.performanceMarks.get(action);
      if (mark) {
        log.duration = Date.now() - mark;
        this.performanceMarks.delete(action);
      } else {
        this.performanceMarks.set(action, Date.now());
      }
    }

    // 记录内存
    if (this.config.trackMemory && 'memory' in performance) {
      log.memory = (performance as any).memory.usedJSHeapSize;
    }

    this.logs.push(log);

    // 限制日志数量
    if (this.logs.length > this.config.maxLogs) {
      this.logs.shift();
    }

    // 输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.group(`[StateDebugger] ${action}`);
      console.log('State:', state);
      if (log.duration) {
        console.log(`Duration: ${log.duration.toFixed(2)}ms`);
      }
      if (log.memory) {
        console.log(`Memory: ${(log.memory / 1024 / 1024).toFixed(2)}MB`);
      }
      console.groupEnd();
    }
  }

  /**
   * 获取所有日志
   */
  getLogs(): DebugLog[] {
    return [...this.logs];
  }

  /**
   * 获取日志统计
   */
  getStats() {
    const actionStats = new Map<string, { count: number; totalDuration: number }>();

    this.logs.forEach((log) => {
      const stats = actionStats.get(log.action) || { count: 0, totalDuration: 0 };
      stats.count++;
      if (log.duration) {
        stats.totalDuration += log.duration;
      }
      actionStats.set(log.action, stats);
    });

    const result: Record<string, any> = {};

    actionStats.forEach((stats, action) => {
      result[action] = {
        count: stats.count,
        avgDuration: stats.totalDuration / stats.count,
        totalDuration: stats.totalDuration,
      };
    });

    return result;
  }

  /**
   * 导出日志
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 导入日志
   */
  importLogs(json: string): void {
    try {
      const logs = JSON.parse(json);
      if (Array.isArray(logs)) {
        this.logs = logs;
      }
    } catch (error) {
      console.error('[StateDebugger] Failed to import logs:', error);
    }
  }

  /**
   * 清空日志
   */
  clear(): void {
    this.logs = [];
    this.performanceMarks.clear();
  }

  /**
   * 克隆用于日志
   */
  private cloneForLogging(obj: any): any {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return String(obj);
    }
  }
}

/**
 * 全局调试器实例
 */
let globalDebugger: StateDebugger | null = null;

/**
 * 获取全局调试器
 */
export function getGlobalDebugger(): StateDebugger {
  if (!globalDebugger) {
    globalDebugger = new StateDebugger();
  }
  return globalDebugger;
}

/**
 * 启用调试模式
 */
export function enableDebugMode(): void {
  const debugger = getGlobalDebugger();
  (window as any).__LDATE_DEBUGGER__ = debugger;
  console.log('[DatePicker] Debug mode enabled. Access via window.__LDATE_DEBUGGER__');
}

/**
 * 禁用调试模式
 */
export function disableDebugMode(): void {
  if ((window as any).__LDATE_DEBUGGER__) {
    delete (window as any).__LDATE_DEBUGGER__;
  }
}

