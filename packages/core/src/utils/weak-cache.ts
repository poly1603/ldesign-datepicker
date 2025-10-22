/**
 * 弱引用缓存
 */

/**
 * 弱引用缓存
 * 
 * @remarks
 * 使用 WeakMap 实现的缓存，当键对象被垃圾回收时，缓存项也会自动清除
 * 
 * @example
 * ```ts
 * const cache = new WeakCache<Date, DateCell[][]>();
 * 
 * const date = new Date();
 * cache.set(date, generateCells(date));
 * 
 * // 当 date 不再被引用时，缓存会自动清除
 * ```
 */
export class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, V>();

  /**
   * 设置缓存
   */
  set(key: K, value: V): void {
    this.cache.set(key, value);
  }

  /**
   * 获取缓存
   */
  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  /**
   * 检查是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 获取或设置（如果不存在）
   */
  getOrSet(key: K, factory: () => V): V {
    if (this.has(key)) {
      return this.get(key)!;
    }

    const value = factory();
    this.set(key, value);
    return value;
  }
}

/**
 * 弱引用值缓存（使用 WeakRef）
 * 
 * @remarks
 * 缓存的值可以被垃圾回收，适合缓存大对象
 */
export class WeakValueCache<K, V extends object> {
  private cache = new Map<K, WeakRef<V>>();
  private registry: FinalizationRegistry<K>;

  constructor() {
    // 创建终结器注册表，当值被回收时清除缓存键
    this.registry = new FinalizationRegistry((key: K) => {
      this.cache.delete(key);
    });
  }

  /**
   * 设置缓存
   */
  set(key: K, value: V): void {
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
    this.registry.register(value, key);
  }

  /**
   * 获取缓存
   */
  get(key: K): V | undefined {
    const ref = this.cache.get(key);
    if (!ref) {
      return undefined;
    }

    const value = ref.deref();
    if (!value) {
      // 值已被回收，清除缓存
      this.cache.delete(key);
      return undefined;
    }

    return value;
  }

  /**
   * 检查是否存在（并且未被回收）
   */
  has(key: K): boolean {
    const value = this.get(key);
    return value !== undefined;
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取或设置
   */
  getOrSet(key: K, factory: () => V): V {
    const existing = this.get(key);
    if (existing) {
      return existing;
    }

    const value = factory();
    this.set(key, value);
    return value;
  }

  /**
   * 获取缓存大小（包括已回收的）
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 清理已回收的缓存项
   */
  cleanup(): void {
    for (const [key, ref] of this.cache.entries()) {
      if (!ref.deref()) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * 检查是否支持 WeakRef
 */
export function isWeakRefSupported(): boolean {
  return typeof WeakRef !== 'undefined';
}

/**
 * 检查是否支持 FinalizationRegistry
 */
export function isFinalizationRegistrySupported(): boolean {
  return typeof FinalizationRegistry !== 'undefined';
}

