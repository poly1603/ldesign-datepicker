/**
 * 对象池 - 复用对象减少内存分配
 */

/**
 * 对象池接口
 */
export interface IObjectPool<T> {
  /**
   * 获取对象
   */
  acquire(): T;

  /**
   * 归还对象
   */
  release(obj: T): void;

  /**
   * 清空池
   */
  clear(): void;

  /**
   * 获取池大小
   */
  size(): number;
}

/**
 * 对象池配置
 */
export interface ObjectPoolOptions<T> {
  /** 对象创建函数 */
  create: () => T;

  /** 对象重置函数（归还时调用） */
  reset?: (obj: T) => void;

  /** 对象销毁函数（清空池时调用） */
  destroy?: (obj: T) => void;

  /** 初始大小 */
  initialSize?: number;

  /** 最大大小 */
  maxSize?: number;

  /** 是否在获取时自动扩容 */
  autoExpand?: boolean;
}

/**
 * 通用对象池
 * 
 * @example
 * ```ts
 * const dateCell Pool = new ObjectPool<DateCell>({
 *   create: () => ({
 *     date: new Date(),
 *     text: '',
 *     type: 'normal',
 *     disabled: false,
 *     selected: false,
 *     inRange: false,
 *     rangeStart: false,
 *     rangeEnd: false,
 *   }),
 *   reset: (cell) => {
 *     cell.selected = false;
 *     cell.inRange = false;
 *     cell.disabled = false;
 *   },
 *   initialSize: 50,
 *   maxSize: 200,
 * });
 * 
 * // 使用
 * const cell = dateCellPool.acquire();
 * // ... use cell
 * dateCellPool.release(cell);
 * ```
 */
export class ObjectPool<T> implements IObjectPool<T> {
  private pool: T[] = [];
  private options: Required<ObjectPoolOptions<T>>;
  private createdCount = 0;

  constructor(options: ObjectPoolOptions<T>) {
    this.options = {
      create: options.create,
      reset: options.reset ?? (() => { }),
      destroy: options.destroy ?? (() => { }),
      initialSize: options.initialSize ?? 0,
      maxSize: options.maxSize ?? 1000,
      autoExpand: options.autoExpand ?? true,
    };

    // 预创建对象
    for (let i = 0; i < this.options.initialSize; i++) {
      this.pool.push(this.createObject());
    }
  }

  /**
   * 获取对象
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }

    if (this.options.autoExpand) {
      if (this.createdCount < this.options.maxSize) {
        return this.createObject();
      } else {
        console.warn(`[ObjectPool] Max pool size reached (${this.options.maxSize})`);
      }
    }

    // 如果池空且不允许扩容，创建临时对象
    return this.createObject();
  }

  /**
   * 归还对象
   */
  release(obj: T): void {
    // 重置对象
    this.options.reset(obj);

    // 如果池未满，归还到池中
    if (this.pool.length < this.options.maxSize) {
      this.pool.push(obj);
    } else {
      // 池已满，销毁对象
      this.options.destroy(obj);
    }
  }

  /**
   * 批量归还
   */
  releaseMany(objects: T[]): void {
    objects.forEach((obj) => this.release(obj));
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool.forEach((obj) => this.options.destroy(obj));
    this.pool = [];
    this.createdCount = 0;
  }

  /**
   * 获取池大小
   */
  size(): number {
    return this.pool.length;
  }

  /**
   * 获取已创建对象总数
   */
  getTotalCreated(): number {
    return this.createdCount;
  }

  /**
   * 创建新对象
   */
  private createObject(): T {
    this.createdCount++;
    return this.options.create();
  }

  /**
   * 预热池（创建指定数量的对象）
   */
  warmup(count: number): void {
    const toCreate = Math.min(count - this.pool.length, this.options.maxSize - this.pool.length);

    for (let i = 0; i < toCreate; i++) {
      this.pool.push(this.createObject());
    }
  }

  /**
   * 收缩池（释放多余的对象）
   */
  shrink(targetSize: number): void {
    while (this.pool.length > targetSize) {
      const obj = this.pool.pop();
      if (obj) {
        this.options.destroy(obj);
      }
    }
  }
}

/**
 * 创建DateCell对象池
 */
export function createDateCellPool(initialSize = 50, maxSize = 200): ObjectPool<any> {
  return new ObjectPool({
    create: () => ({
      date: new Date(),
      text: '',
      type: 'normal',
      disabled: false,
      selected: false,
      inRange: false,
      rangeStart: false,
      rangeEnd: false,
      customClass: undefined,
      metadata: undefined,
    }),
    reset: (cell) => {
      cell.selected = false;
      cell.inRange = false;
      cell.disabled = false;
      cell.rangeStart = false;
      cell.rangeEnd = false;
      cell.type = 'normal';
      cell.customClass = undefined;
      cell.metadata = undefined;
    },
    initialSize,
    maxSize,
  });
}

/**
 * 创建MonthCell对象池
 */
export function createMonthCellPool(initialSize = 12, maxSize = 50): ObjectPool<any> {
  return new ObjectPool({
    create: () => ({
      month: 0,
      text: '',
      disabled: false,
      selected: false,
      inRange: false,
      rangeStart: false,
      rangeEnd: false,
      customClass: undefined,
    }),
    reset: (cell) => {
      cell.selected = false;
      cell.inRange = false;
      cell.disabled = false;
      cell.rangeStart = false;
      cell.rangeEnd = false;
      cell.customClass = undefined;
    },
    initialSize,
    maxSize,
  });
}

/**
 * 创建YearCell对象池
 */
export function createYearCellPool(initialSize = 12, maxSize = 50): ObjectPool<any> {
  return new ObjectPool({
    create: () => ({
      year: 0,
      text: '',
      disabled: false,
      selected: false,
      inRange: false,
      rangeStart: false,
      rangeEnd: false,
      customClass: undefined,
    }),
    reset: (cell) => {
      cell.selected = false;
      cell.inRange = false;
      cell.disabled = false;
      cell.rangeStart = false;
      cell.rangeEnd = false;
      cell.customClass = undefined;
    },
    initialSize,
    maxSize,
  });
}

