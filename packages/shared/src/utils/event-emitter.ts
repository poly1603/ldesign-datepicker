/**
 * 增强的事件发射器
 * 支持优先级、异步事件、批量处理、节流防抖
 */

type EventHandler = (...args: any[]) => void;
type AsyncEventHandler = (...args: any[]) => Promise<void>;

/**
 * 事件监听器配置
 */
export interface EventListenerOptions {
  /** 优先级（数字越大优先级越高） */
  priority?: number;

  /** 是否只执行一次 */
  once?: boolean;

  /** 节流时间（毫秒） */
  throttle?: number;

  /** 防抖时间（毫秒） */
  debounce?: number;
}

/**
 * 事件监听器包装器
 */
interface EventListenerWrapper {
  handler: EventHandler;
  options: Required<EventListenerOptions>;
  lastExecuted?: number;
  debounceTimer?: ReturnType<typeof setTimeout>;
}

/**
 * 增强的事件发射器
 */
export class EventEmitter {
  private events: Map<string, EventListenerWrapper[]> = new Map();
  private batchMode = false;
  private batchQueue: Array<{ event: string; args: any[] }> = [];

  /**
   * 订阅事件
   */
  on(event: string, handler: EventHandler, options: EventListenerOptions = {}): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const wrapper: EventListenerWrapper = {
      handler,
      options: {
        priority: options.priority ?? 0,
        once: options.once ?? false,
        throttle: options.throttle ?? 0,
        debounce: options.debounce ?? 0,
      },
    };

    const listeners = this.events.get(event)!;
    listeners.push(wrapper);

    // 按优先级排序（高优先级在前）
    listeners.sort((a, b) => b.options.priority - a.options.priority);

    // 返回取消订阅函数
    return () => this.off(event, handler);
  }

  /**
   * 取消订阅
   */
  off(event: string, handler: EventHandler): void {
    const listeners = this.events.get(event);
    if (!listeners) {
      return;
    }

    const index = listeners.findIndex((l) => l.handler === handler);
    if (index > -1) {
      // 清理防抖定时器
      const wrapper = listeners[index];
      if (wrapper?.debounceTimer) {
        clearTimeout(wrapper.debounceTimer);
      }

      listeners.splice(index, 1);

      if (listeners.length === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): void {
    if (this.batchMode) {
      this.batchQueue.push({ event, args });
      return;
    }

    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) {
      return;
    }

    // 复制监听器列表（防止在执行过程中修改）
    const listenersToExecute = [...listeners];

    for (let i = 0; i < listenersToExecute.length; i++) {
      const wrapper = listenersToExecute[i];
      if (!wrapper) continue;

      // 处理节流
      if (wrapper.options.throttle > 0) {
        const now = Date.now();
        if (wrapper.lastExecuted && now - wrapper.lastExecuted < wrapper.options.throttle) {
          continue;
        }
        wrapper.lastExecuted = now;
      }

      // 处理防抖
      if (wrapper.options.debounce > 0) {
        if (wrapper.debounceTimer) {
          clearTimeout(wrapper.debounceTimer);
        }

        wrapper.debounceTimer = setTimeout(() => {
          this.executeHandler(wrapper, args);
          wrapper.debounceTimer = undefined;
        }, wrapper.options.debounce);

        continue;
      }

      this.executeHandler(wrapper, args);

      // 处理 once
      if (wrapper.options.once) {
        this.off(event, wrapper.handler);
      }
    }
  }

  /**
   * 异步触发事件
   */
  async emitAsync(event: string, ...args: any[]): Promise<void> {
    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) {
      return;
    }

    // 按优先级顺序执行
    for (const wrapper of listeners) {
      try {
        await Promise.resolve(wrapper.handler(...args));

        if (wrapper.options.once) {
          this.off(event, wrapper.handler);
        }
      } catch (error) {
        console.error(`[EventEmitter] Error in async handler for event "${event}":`, error);
      }
    }
  }

  /**
   * 执行处理器（带错误处理）
   */
  private executeHandler(wrapper: EventListenerWrapper, args: any[]): void {
    try {
      wrapper.handler(...args);
    } catch (error) {
      console.error('[EventEmitter] Error in event handler:', error);
    }
  }

  /**
   * 订阅一次
   */
  once(event: string, handler: EventHandler, options: EventListenerOptions = {}): void {
    this.on(event, handler, { ...options, once: true });
  }

  /**
   * 开始批量模式
   */
  startBatch(): void {
    this.batchMode = true;
    this.batchQueue = [];
  }

  /**
   * 结束批量模式并执行所有批量事件
   */
  endBatch(): void {
    this.batchMode = false;

    const queue = [...this.batchQueue];
    this.batchQueue = [];

    // 使用 requestAnimationFrame 批量执行
    requestAnimationFrame(() => {
      queue.forEach(({ event, args }) => {
        this.emit(event, ...args);
      });
    });
  }

  /**
   * 等待事件（返回 Promise）
   */
  waitFor(event: string, timeout?: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined;

      const handler = (...args: any[]) => {
        if (timer) clearTimeout(timer);
        resolve(args);
      };

      this.once(event, handler);

      if (timeout) {
        timer = setTimeout(() => {
          this.off(event, handler);
          reject(new Error(`Event "${event}" timeout after ${timeout}ms`));
        }, timeout);
      }
    });
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.length ?? 0;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * 清空事件监听器
   */
  clear(event?: string): void {
    if (event) {
      // 清理该事件的所有防抖定时器
      const listeners = this.events.get(event);
      if (listeners) {
        listeners.forEach((wrapper) => {
          if (wrapper.debounceTimer) {
            clearTimeout(wrapper.debounceTimer);
          }
        });
      }
      this.events.delete(event);
    } else {
      // 清理所有防抖定时器
      this.events.forEach((listeners) => {
        listeners.forEach((wrapper) => {
          if (wrapper.debounceTimer) {
            clearTimeout(wrapper.debounceTimer);
          }
        });
      });
      this.events.clear();
    }
  }
}





