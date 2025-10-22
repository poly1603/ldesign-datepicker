/**
 * 触摸手势处理
 */

/**
 * 手势类型
 */
export type GestureType = 'tap' | 'doubletap' | 'swipeleft' | 'swiperight' | 'swipeup' | 'swipedown' | 'pinch' | 'rotate';

/**
 * 触摸点信息
 */
export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * 手势事件
 */
export interface GestureEvent {
  type: GestureType;
  startPoint: TouchPoint;
  endPoint: TouchPoint;
  deltaX: number;
  deltaY: number;
  distance: number;
  duration: number;
  velocity: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

/**
 * 手势配置
 */
export interface GestureConfig {
  /** 滑动距离阈值（像素） */
  swipeThreshold?: number;

  /** 滑动速度阈值（像素/毫秒） */
  swipeVelocityThreshold?: number;

  /** 双击时间间隔（毫秒） */
  doubleTapInterval?: number;

  /** 长按时间（毫秒） */
  longPressTime?: number;

  /** 是否阻止默认行为 */
  preventDefault?: boolean;
}

/**
 * 触摸手势管理器
 */
export class TouchGestureManager {
  private element: HTMLElement | null = null;
  private config: Required<GestureConfig>;
  private handlers = new Map<GestureType, Set<(event: GestureEvent) => void>>();

  private startPoint: TouchPoint | null = null;
  private lastTapTime = 0;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GestureConfig = {}) {
    this.config = {
      swipeThreshold: config.swipeThreshold ?? 50,
      swipeVelocityThreshold: config.swipeVelocityThreshold ?? 0.3,
      doubleTapInterval: config.doubleTapInterval ?? 300,
      longPressTime: config.longPressTime ?? 500,
      preventDefault: config.preventDefault ?? true,
    };
  }

  /**
   * 绑定元素
   */
  bind(element: HTMLElement): void {
    this.element = element;

    element.addEventListener('touchstart', this.handleTouchStart, { passive: !this.config.preventDefault });
    element.addEventListener('touchmove', this.handleTouchMove, { passive: !this.config.preventDefault });
    element.addEventListener('touchend', this.handleTouchEnd, { passive: !this.config.preventDefault });
    element.addEventListener('touchcancel', this.handleTouchCancel);
  }

  /**
   * 解绑元素
   */
  unbind(): void {
    if (!this.element) return;

    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);

    this.element = null;
  }

  /**
   * 监听手势
   */
  on(gesture: GestureType, handler: (event: GestureEvent) => void): () => void {
    if (!this.handlers.has(gesture)) {
      this.handlers.set(gesture, new Set());
    }

    this.handlers.get(gesture)!.add(handler);

    return () => {
      const handlers = this.handlers.get(gesture);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * 触发手势事件
   */
  private emit(gestureEvent: GestureEvent): void {
    const handlers = this.handlers.get(gestureEvent.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(gestureEvent);
        } catch (error) {
          console.error('[TouchGesture] Handler error:', error);
        }
      });
    }
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart = (event: TouchEvent): void => {
    if (this.config.preventDefault) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    if (!touch) return;

    this.startPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    // 开始长按计时
    this.longPressTimer = setTimeout(() => {
      // 触发长按事件（可扩展）
      this.longPressTimer = null;
    }, this.config.longPressTime);
  };

  /**
   * 处理触摸移动
   */
  private handleTouchMove = (event: TouchEvent): void => {
    if (this.config.preventDefault) {
      event.preventDefault();
    }

    // 取消长按
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  };

  /**
   * 处理触摸结束
   */
  private handleTouchEnd = (event: TouchEvent): void => {
    if (this.config.preventDefault) {
      event.preventDefault();
    }

    // 取消长按
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (!this.startPoint) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const endPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    const deltaX = endPoint.x - this.startPoint.x;
    const deltaY = endPoint.y - this.startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = endPoint.timestamp - this.startPoint.timestamp;
    const velocity = duration > 0 ? distance / duration : 0;

    // 检测手势类型
    if (distance < 10) {
      // 点击
      this.detectTap(this.startPoint, endPoint);
    } else if (velocity > this.config.swipeVelocityThreshold || distance > this.config.swipeThreshold) {
      // 滑动
      this.detectSwipe(this.startPoint, endPoint, deltaX, deltaY, distance, duration, velocity);
    }

    this.startPoint = null;
  };

  /**
   * 处理触摸取消
   */
  private handleTouchCancel = (): void => {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    this.startPoint = null;
  };

  /**
   * 检测点击
   */
  private detectTap(startPoint: TouchPoint, endPoint: TouchPoint): void {
    const now = Date.now();
    const isDoubleTap = now - this.lastTapTime < this.config.doubleTapInterval;

    const gestureEvent: GestureEvent = {
      type: isDoubleTap ? 'doubletap' : 'tap',
      startPoint,
      endPoint,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      duration: endPoint.timestamp - startPoint.timestamp,
      velocity: 0,
    };

    this.emit(gestureEvent);

    this.lastTapTime = now;
  }

  /**
   * 检测滑动
   */
  private detectSwipe(
    startPoint: TouchPoint,
    endPoint: TouchPoint,
    deltaX: number,
    deltaY: number,
    distance: number,
    duration: number,
    velocity: number
  ): void {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    let type: GestureType;
    let direction: 'left' | 'right' | 'up' | 'down';

    if (absDeltaX > absDeltaY) {
      // 水平滑动
      if (deltaX > 0) {
        type = 'swiperight';
        direction = 'right';
      } else {
        type = 'swipeleft';
        direction = 'left';
      }
    } else {
      // 垂直滑动
      if (deltaY > 0) {
        type = 'swipedown';
        direction = 'down';
      } else {
        type = 'swipeup';
        direction = 'up';
      }
    }

    const gestureEvent: GestureEvent = {
      type,
      startPoint,
      endPoint,
      deltaX,
      deltaY,
      distance,
      duration,
      velocity,
      direction,
    };

    this.emit(gestureEvent);
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.unbind();
    this.handlers.clear();

    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
}

