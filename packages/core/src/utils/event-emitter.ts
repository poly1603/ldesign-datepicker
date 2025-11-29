/**
 * 事件发射器
 * 提供发布-订阅模式的事件系统
 */

/**
 * 事件处理函数类型
 */
export type EventHandler = (...args: any[]) => void

/**
 * 事件发射器类
 */
export class EventEmitter {
  private events: Map<string, EventHandler[]> = new Map()

  /**
   * 注册事件监听器
   */
  on(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(handler)
  }

  /**
   * 注册一次性事件监听器
   */
  once(event: string, handler: EventHandler): void {
    const onceHandler: EventHandler = (...args: any[]) => {
      handler(...args)
      this.off(event, onceHandler)
    }
    this.on(event, onceHandler)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, handler?: EventHandler): void {
    if (!this.events.has(event)) {
      return
    }

    if (!handler) {
      // 移除该事件的所有监听器
      this.events.delete(event)
      return
    }

    const handlers = this.events.get(event)!
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }

    // 如果没有监听器了，删除该事件
    if (handlers.length === 0) {
      this.events.delete(event)
    }
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): void {
    if (!this.events.has(event)) {
      return
    }

    const handlers = this.events.get(event)!
    // 复制数组以避免在执行过程中被修改
    handlers.slice().forEach(handler => {
      try {
        handler(...args)
      } catch (error) {
        console.error(`[EventEmitter] Error in event handler for "${event}":`, error)
      }
    })
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.length || 0
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys())
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }

  /**
   * 获取事件的所有监听器
   */
  listeners(event: string): EventHandler[] {
    return this.events.get(event)?.slice() || []
  }
}