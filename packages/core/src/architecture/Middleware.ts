/**
 * 中间件系统 - 处理状态变更的中间件机制
 */

/**
 * 中间件上下文
 */
export interface MiddlewareContext<T = any> {
  action: string;
  payload: any;
  currentState: Readonly<T>;
  metadata?: Record<string, any>;
}

/**
 * 中间件函数类型
 */
export type MiddlewareFunction<T = any> = (
  context: MiddlewareContext<T>,
  next: () => void
) => void | Promise<void>;

/**
 * 中间件配置
 */
export interface MiddlewareConfig {
  name?: string;
  priority?: number;
  enabled?: boolean;
}

/**
 * 中间件包装器
 */
interface MiddlewareWrapper<T = any> {
  middleware: MiddlewareFunction<T>;
  config: Required<MiddlewareConfig>;
}

/**
 * 中间件管理器
 */
export class MiddlewareManager<T = any> {
  private middlewares: MiddlewareWrapper<T>[] = [];
  private isRunning = false;

  /**
   * 注册中间件
   */
  use(middleware: MiddlewareFunction<T>, config: MiddlewareConfig = {}): () => void {
    const wrapper: MiddlewareWrapper<T> = {
      middleware,
      config: {
        name: config.name || `middleware_${this.middlewares.length}`,
        priority: config.priority ?? 0,
        enabled: config.enabled ?? true,
      },
    };

    this.middlewares.push(wrapper);
    this.sortMiddlewares();

    // 返回取消注册函数
    return () => {
      const index = this.middlewares.indexOf(wrapper);
      if (index > -1) {
        this.middlewares.splice(index, 1);
      }
    };
  }

  /**
   * 运行中间件链
   */
  async run(context: MiddlewareContext<T>): Promise<void> {
    if (this.isRunning) {
      throw new Error('[MiddlewareManager] Middleware is already running');
    }

    this.isRunning = true;

    try {
      await this.runChain(0, context);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 运行中间件链（递归）
   */
  private async runChain(index: number, context: MiddlewareContext<T>): Promise<void> {
    if (index >= this.middlewares.length) {
      return;
    }

    const wrapper = this.middlewares[index];
    if (!wrapper || !wrapper.config.enabled) {
      return this.runChain(index + 1, context);
    }

    let nextCalled = false;
    const next = () => {
      if (nextCalled) {
        throw new Error('[MiddlewareManager] next() called multiple times');
      }
      nextCalled = true;
      return this.runChain(index + 1, context);
    };

    try {
      await wrapper.middleware(context, next);

      // 如果中间件没有调用 next()，自动调用
      if (!nextCalled) {
        await next();
      }
    } catch (error) {
      console.error(`[MiddlewareManager] Error in middleware "${wrapper.config.name}":`, error);
      throw error;
    }
  }

  /**
   * 按优先级排序中间件
   */
  private sortMiddlewares(): void {
    this.middlewares.sort((a, b) => b.config.priority - a.config.priority);
  }

  /**
   * 启用中间件
   */
  enable(name: string): void {
    const wrapper = this.middlewares.find((m) => m.config.name === name);
    if (wrapper) {
      wrapper.config.enabled = true;
    }
  }

  /**
   * 禁用中间件
   */
  disable(name: string): void {
    const wrapper = this.middlewares.find((m) => m.config.name === name);
    if (wrapper) {
      wrapper.config.enabled = false;
    }
  }

  /**
   * 获取所有中间件
   */
  getMiddlewares(): Array<{ name: string; priority: number; enabled: boolean }> {
    return this.middlewares.map((m) => ({ ...m.config }));
  }

  /**
   * 清空所有中间件
   */
  clear(): void {
    this.middlewares = [];
  }
}

/**
 * 内置中间件：日志记录
 */
export function createLoggerMiddleware<T = any>(options: {
  logLevel?: 'info' | 'debug' | 'warn';
  filter?: (context: MiddlewareContext<T>) => boolean;
} = {}): MiddlewareFunction<T> {
  const { logLevel = 'info', filter } = options;

  return (context, next) => {
    if (filter && !filter(context)) {
      next();
      return;
    }

    const startTime = performance.now();

    console[logLevel](`[Middleware] ${context.action}`, {
      payload: context.payload,
      state: context.currentState,
    });

    next();

    const duration = performance.now() - startTime;
    console[logLevel](`[Middleware] ${context.action} completed in ${duration.toFixed(2)}ms`);
  };
}

/**
 * 内置中间件：性能监控
 */
export function createPerformanceMiddleware<T = any>(options: {
  threshold?: number; // 警告阈值（毫秒）
  onSlow?: (context: MiddlewareContext<T>, duration: number) => void;
} = {}): MiddlewareFunction<T> {
  const { threshold = 16, onSlow } = options;

  return (context, next) => {
    const startTime = performance.now();

    next();

    const duration = performance.now() - startTime;

    if (duration > threshold) {
      console.warn(`[Performance] Slow middleware execution: ${context.action} took ${duration.toFixed(2)}ms`);
      onSlow?.(context, duration);
    }
  };
}

/**
 * 内置中间件：状态验证
 */
export function createValidationMiddleware<T = any>(
  validator: (state: T, action: string) => boolean | string
): MiddlewareFunction<T> {
  return (context, next) => {
    const result = validator(context.currentState, context.action);

    if (result === false) {
      throw new Error(`[Validation] State validation failed for action: ${context.action}`);
    }

    if (typeof result === 'string') {
      throw new Error(`[Validation] ${result}`);
    }

    next();
  };
}

/**
 * 内置中间件：限流
 */
export function createThrottleMiddleware<T = any>(options: {
  wait: number;
  actions?: string[];
}): MiddlewareFunction<T> {
  const { wait, actions } = options;
  const lastExecution = new Map<string, number>();

  return (context, next) => {
    // 如果指定了特定 actions，只对这些 actions 进行限流
    if (actions && !actions.includes(context.action)) {
      next();
      return;
    }

    const now = Date.now();
    const lastTime = lastExecution.get(context.action) || 0;

    if (now - lastTime >= wait) {
      lastExecution.set(context.action, now);
      next();
    }
  };
}

/**
 * 内置中间件：防抖
 */
export function createDebounceMiddleware<T = any>(options: {
  wait: number;
  actions?: string[];
}): MiddlewareFunction<T> {
  const { wait, actions } = options;
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  return (context, next) => {
    // 如果指定了特定 actions，只对这些 actions 进行防抖
    if (actions && !actions.includes(context.action)) {
      next();
      return;
    }

    const existingTimer = timers.get(context.action);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      timers.delete(context.action);
      next();
    }, wait);

    timers.set(context.action, timer);
  };
}

