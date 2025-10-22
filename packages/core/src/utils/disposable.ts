/**
 * 资源管理 - Disposable 模式
 */

/**
 * 可释放资源接口
 */
export interface IDisposable {
  /**
   * 释放资源
   */
  dispose(): void;
}

/**
 * 异步可释放资源接口
 */
export interface IAsyncDisposable {
  /**
   * 异步释放资源
   */
  disposeAsync(): Promise<void>;
}

/**
 * 资源容器
 * 
 * @remarks
 * 用于管理多个可释放资源，确保在适当时机释放所有资源
 * 
 * @example
 * ```ts
 * const container = new DisposableContainer();
 * 
 * const subscription = emitter.on('event', handler);
 * container.add({
 *   dispose: () => subscription(),
 * });
 * 
 * const timer = setInterval(() => {}, 1000);
 * container.add({
 *   dispose: () => clearInterval(timer),
 * });
 * 
 * // 释放所有资源
 * container.dispose();
 * ```
 */
export class DisposableContainer implements IDisposable {
  private disposables: IDisposable[] = [];
  private isDisposed = false;

  /**
   * 添加可释放资源
   */
  add(disposable: IDisposable): void {
    if (this.isDisposed) {
      console.warn('[DisposableContainer] Container is already disposed');
      disposable.dispose();
      return;
    }

    this.disposables.push(disposable);
  }

  /**
   * 添加多个可释放资源
   */
  addMany(...disposables: IDisposable[]): void {
    disposables.forEach((d) => this.add(d));
  }

  /**
   * 移除可释放资源（不会释放）
   */
  remove(disposable: IDisposable): boolean {
    const index = this.disposables.indexOf(disposable);
    if (index > -1) {
      this.disposables.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 释放所有资源
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    // 逆序释放（后进先出）
    for (let i = this.disposables.length - 1; i >= 0; i--) {
      try {
        this.disposables[i]?.dispose();
      } catch (error) {
        console.error('[DisposableContainer] Error disposing resource:', error);
      }
    }

    this.disposables = [];
  }

  /**
   * 是否已释放
   */
  get disposed(): boolean {
    return this.isDisposed;
  }

  /**
   * 资源数量
   */
  get count(): number {
    return this.disposables.length;
  }
}

/**
 * 创建可释放资源
 */
export function toDisposable(fn: () => void): IDisposable {
  return {
    dispose: fn,
  };
}

/**
 * 组合多个可释放资源
 */
export function combineDisposables(...disposables: IDisposable[]): IDisposable {
  return {
    dispose: () => {
      disposables.forEach((d) => {
        try {
          d.dispose();
        } catch (error) {
          console.error('[combineDisposables] Error disposing resource:', error);
        }
      });
    },
  };
}

/**
 * 安全释放资源（捕获错误）
 */
export function safeDispose(disposable: IDisposable | null | undefined): void {
  if (!disposable) {
    return;
  }

  try {
    disposable.dispose();
  } catch (error) {
    console.error('[safeDispose] Error disposing resource:', error);
  }
}

/**
 * 异步安全释放资源
 */
export async function safeDisposeAsync(
  disposable: IAsyncDisposable | null | undefined
): Promise<void> {
  if (!disposable) {
    return;
  }

  try {
    await disposable.disposeAsync();
  } catch (error) {
    console.error('[safeDisposeAsync] Error disposing resource:', error);
  }
}

/**
 * 使用资源（自动释放）
 * 
 * @example
 * ```ts
 * await using(createResource(), async (resource) => {
 *   // use resource
 * });
 * // resource is automatically disposed
 * ```
 */
export async function using<T extends IDisposable, R>(
  resource: T,
  fn: (resource: T) => Promise<R>
): Promise<R> {
  try {
    return await fn(resource);
  } finally {
    safeDispose(resource);
  }
}

/**
 * 延迟释放（在微任务队列中释放）
 */
export function disposeLater(disposable: IDisposable): void {
  queueMicrotask(() => {
    safeDispose(disposable);
  });
}

