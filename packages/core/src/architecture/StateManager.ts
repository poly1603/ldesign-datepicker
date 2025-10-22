/**
 * 状态管理器 - 实现不可变状态更新和观察者模式
 */

import { EventEmitter } from '@ldesign/datepicker-shared';

/**
 * 状态快照接口
 */
export interface StateSnapshot<T = any> {
  timestamp: number;
  state: T;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * 状态变更监听器
 */
export type StateChangeListener<T = any> = (
  newState: Readonly<T>,
  oldState: Readonly<T>,
  action?: string
) => void;

/**
 * 状态管理器选项
 */
export interface StateManagerOptions<T = any> {
  initialState: T;
  maxHistory?: number;
  enableTimeTravel?: boolean;
  immutable?: boolean;
  debug?: boolean;
}

/**
 * 不可变状态管理器
 * 支持状态快照、时间旅行调试、状态订阅
 */
export class StateManager<T = any> {
  private currentState: T;
  private history: StateSnapshot<T>[] = [];
  private historyIndex = -1;
  private emitter: EventEmitter;
  private options: Required<StateManagerOptions<T>>;
  private listeners = new Set<StateChangeListener<T>>();

  constructor(options: StateManagerOptions<T>) {
    this.options = {
      maxHistory: options.maxHistory ?? 50,
      enableTimeTravel: options.enableTimeTravel ?? false,
      immutable: options.immutable ?? true,
      debug: options.debug ?? false,
      initialState: options.initialState,
    };

    this.currentState = this.options.immutable
      ? this.deepFreeze(this.cloneDeep(options.initialState))
      : options.initialState;

    this.emitter = new EventEmitter();

    if (this.options.enableTimeTravel) {
      this.addSnapshot('@@INIT', this.currentState);
    }
  }

  /**
   * 获取当前状态（只读）
   */
  getState(): Readonly<T> {
    return this.currentState;
  }

  /**
   * 设置状态
   */
  setState(updater: Partial<T> | ((state: T) => T), action = '@@UPDATE'): void {
    const oldState = this.currentState;
    let newState: T;

    if (typeof updater === 'function') {
      newState = updater(this.cloneDeep(oldState));
    } else {
      newState = { ...this.cloneDeep(oldState), ...updater };
    }

    if (this.options.immutable) {
      newState = this.deepFreeze(newState);
    }

    this.currentState = newState;

    // 添加到历史记录
    if (this.options.enableTimeTravel) {
      this.addSnapshot(action, newState);
    }

    // 通知监听器
    this.notifyListeners(newState, oldState, action);

    // 调试模式
    if (this.options.debug) {
      console.log(`[StateManager] ${action}`, {
        oldState,
        newState,
        diff: this.getStateDiff(oldState, newState),
      });
    }

    // 触发事件
    this.emitter.emit('change', newState, oldState, action);
  }

  /**
   * 订阅状态变更
   */
  subscribe(listener: StateChangeListener<T>): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 事件订阅（兼容旧的 EventEmitter 模式）
   */
  on(event: string, handler: (...args: any[]) => void): () => void {
    return this.emitter.on(event, handler);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(newState: T, oldState: T, action?: string): void {
    this.listeners.forEach((listener) => {
      try {
        listener(newState, oldState, action);
      } catch (error) {
        console.error('[StateManager] Listener error:', error);
      }
    });
  }

  /**
   * 添加状态快照
   */
  private addSnapshot(action: string, state: T): void {
    // 如果当前不在历史记录的末尾，删除后续记录
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    const snapshot: StateSnapshot<T> = {
      timestamp: Date.now(),
      state: this.cloneDeep(state),
      action,
    };

    this.history.push(snapshot);
    this.historyIndex = this.history.length - 1;

    // 限制历史记录大小
    if (this.history.length > this.options.maxHistory) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * 撤销到上一个状态
   */
  undo(): boolean {
    if (!this.options.enableTimeTravel) {
      console.warn('[StateManager] Time travel is not enabled');
      return false;
    }

    if (this.historyIndex > 0) {
      this.historyIndex--;
      const snapshot = this.history[this.historyIndex];
      if (snapshot) {
        this.currentState = this.options.immutable
          ? this.deepFreeze(this.cloneDeep(snapshot.state))
          : snapshot.state;
        this.notifyListeners(this.currentState, this.currentState, '@@UNDO');
        return true;
      }
    }
    return false;
  }

  /**
   * 重做到下一个状态
   */
  redo(): boolean {
    if (!this.options.enableTimeTravel) {
      console.warn('[StateManager] Time travel is not enabled');
      return false;
    }

    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const snapshot = this.history[this.historyIndex];
      if (snapshot) {
        this.currentState = this.options.immutable
          ? this.deepFreeze(this.cloneDeep(snapshot.state))
          : snapshot.state;
        this.notifyListeners(this.currentState, this.currentState, '@@REDO');
        return true;
      }
    }
    return false;
  }

  /**
   * 跳转到指定历史记录
   */
  jumpToSnapshot(index: number): boolean {
    if (!this.options.enableTimeTravel) {
      console.warn('[StateManager] Time travel is not enabled');
      return false;
    }

    if (index >= 0 && index < this.history.length) {
      this.historyIndex = index;
      const snapshot = this.history[index];
      if (snapshot) {
        this.currentState = this.options.immutable
          ? this.deepFreeze(this.cloneDeep(snapshot.state))
          : snapshot.state;
        this.notifyListeners(this.currentState, this.currentState, '@@JUMP');
        return true;
      }
    }
    return false;
  }

  /**
   * 获取历史记录
   */
  getHistory(): StateSnapshot<T>[] {
    return [...this.history];
  }

  /**
   * 获取当前历史索引
   */
  getHistoryIndex(): number {
    return this.historyIndex;
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * 获取状态差异（用于调试）
   */
  private getStateDiff(oldState: T, newState: T): Record<string, any> {
    const diff: Record<string, any> = {};

    const compare = (obj1: any, obj2: any, path = ''): void => {
      const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

      keys.forEach((key) => {
        const fullPath = path ? `${path}.${key}` : key;
        const val1 = obj1?.[key];
        const val2 = obj2?.[key];

        if (val1 !== val2) {
          if (typeof val1 === 'object' && typeof val2 === 'object' && val1 && val2) {
            compare(val1, val2, fullPath);
          } else {
            diff[fullPath] = { from: val1, to: val2 };
          }
        }
      });
    };

    compare(oldState, newState);
    return diff;
  }

  /**
   * 深度克隆
   */
  private cloneDeep<U>(obj: U): U {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any;
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.cloneDeep(item)) as any;
    }

    if (obj instanceof Map) {
      const cloned = new Map();
      obj.forEach((value, key) => {
        cloned.set(key, this.cloneDeep(value));
      });
      return cloned as any;
    }

    if (obj instanceof Set) {
      const cloned = new Set();
      obj.forEach((value) => {
        cloned.add(this.cloneDeep(value));
      });
      return cloned as any;
    }

    const cloned = {} as U;
    Object.keys(obj).forEach((key) => {
      (cloned as any)[key] = this.cloneDeep((obj as any)[key]);
    });

    return cloned;
  }

  /**
   * 深度冻结对象
   */
  private deepFreeze<U>(obj: U): U {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    Object.freeze(obj);

    Object.keys(obj).forEach((key) => {
      const value = (obj as any)[key];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    });

    return obj;
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.listeners.clear();
    this.emitter.clear();
    this.history = [];
    this.historyIndex = -1;
  }
}

