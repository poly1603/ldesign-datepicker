/**
 * @ldesign/datepicker-core
 * 框架无关的日期选择器核心逻辑
 * 
 * @version 1.0.0-optimized
 * @author LDesign Team
 * @license MIT
 */

// 核心导出
export * from './core/DatePickerCore';
export * from './state';
export * from './panels';

// 架构模块
export * from './architecture';

// 工具导出
export {
  // 性能工具
  rafThrottle,
  runWhenIdle,
  BatchUpdater,
  LRUCache,
  lazyLoad,
  PerformanceMonitor,
  benchmark,
  benchmarkAsync,
  throttle,
  debounce,
} from './utils/performance';

export {
  // 虚拟滚动
  calculateVirtualScroll,
  VirtualScroller,
  createVirtualScrollStyle,
} from './utils/virtual-scroll';

export {
  // 对象池
  ObjectPool,
  createDateCellPool,
  createMonthCellPool,
  createYearCellPool,
} from './utils/object-pool';

export {
  // 内存监控
  MemoryMonitor,
  getGlobalMemoryMonitor,
} from './utils/memory-monitor';

export {
  // 资源管理
  DisposableContainer,
  toDisposable,
  combineDisposables,
  safeDispose,
  safeDisposeAsync,
  using,
  disposeLater,
} from './utils/disposable';

export {
  // 弱引用缓存
  WeakCache,
  WeakValueCache,
  isWeakRefSupported,
  isFinalizationRegistrySupported,
} from './utils/weak-cache';

// 类型导出
export type {
  IDisposable,
  IAsyncDisposable,
} from './utils/disposable';

export type {
  VirtualScrollOptions,
  VirtualScrollResult,
} from './utils/virtual-scroll';

export type {
  IObjectPool,
  ObjectPoolOptions,
} from './utils/object-pool';

export type {
  MemoryUsage,
  MemoryMonitorOptions,
} from './utils/memory-monitor';

export type {
  StateSnapshot,
  StateChangeListener,
  StateManagerOptions,
} from './architecture/StateManager';

export type {
  MiddlewareContext,
  MiddlewareFunction,
  MiddlewareConfig,
} from './architecture/Middleware';

export type {
  Plugin,
  PluginMetadata,
} from './architecture/PluginSystem';

export type {
  Command,
} from './architecture/CommandPattern';

export type {
  DatePickerState,
  DatePickerConfig,
} from './core/DatePickerCore';

// 导入样式
import './styles/index.css';





