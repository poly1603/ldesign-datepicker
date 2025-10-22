/**
 * 移动端适配器
 */

import { TouchGestureManager } from './TouchGesture';

/**
 * 移动设备检测
 */
export class MobileDetector {
  /**
   * 检查是否为移动设备
   */
  static isMobile(): boolean {
    if (typeof navigator === 'undefined') return false;

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * 检查是否为平板
   */
  static isTablet(): boolean {
    if (typeof navigator === 'undefined') return false;

    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  }

  /**
   * 检查是否为触摸设备
   */
  static isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;

    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }

  /**
   * 获取设备类型
   */
  static getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    if (this.isTablet()) return 'tablet';
    if (this.isMobile()) return 'mobile';
    return 'desktop';
  }

  /**
   * 获取屏幕方向
   */
  static getOrientation(): 'portrait' | 'landscape' {
    if (typeof window === 'undefined') return 'portrait';

    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  /**
   * 检查是否支持触摸
   */
  static supportsTouch(): boolean {
    return this.isTouchDevice();
  }
}

/**
 * 移动端配置
 */
export interface MobileConfig {
  /** 是否启用触摸手势 */
  enableGestures?: boolean;

  /** 是否自动调整大小 */
  autoResize?: boolean;

  /** 最小单元格大小（移动端） */
  minCellSize?: number;

  /** 是否显示虚拟键盘 */
  showVirtualKeyboard?: boolean;

  /** 虚拟键盘配置 */
  virtualKeyboardOptions?: {
    position?: 'top' | 'bottom';
    height?: number;
  };
}

/**
 * 移动端适配器
 */
export class MobileAdapter {
  private element: HTMLElement | null = null;
  private gestureManager: TouchGestureManager | null = null;
  private config: Required<MobileConfig>;
  private resizeObserver: ResizeObserver | null = null;

  constructor(config: MobileConfig = {}) {
    this.config = {
      enableGestures: config.enableGestures ?? true,
      autoResize: config.autoResize ?? true,
      minCellSize: config.minCellSize ?? 44, // iOS 推荐最小触摸目标
      showVirtualKeyboard: config.showVirtualKeyboard ?? false,
      virtualKeyboardOptions: config.virtualKeyboardOptions ?? {
        position: 'bottom',
        height: 260,
      },
    };
  }

  /**
   * 初始化
   */
  init(element: HTMLElement): void {
    this.element = element;

    // 应用移动端样式
    this.applyMobileStyles();

    // 启用触摸手势
    if (this.config.enableGestures && MobileDetector.isTouchDevice()) {
      this.initGestures();
    }

    // 自动调整大小
    if (this.config.autoResize) {
      this.initResize();
    }
  }

  /**
   * 应用移动端样式
   */
  private applyMobileStyles(): void {
    if (!this.element) return;

    const deviceType = MobileDetector.getDeviceType();
    this.element.classList.add(`ldate-${deviceType}`);

    // 设置最小触摸目标大小
    this.element.style.setProperty('--ldate-cell-size', `${this.config.minCellSize}px`);

    // 禁用文本选择
    this.element.style.userSelect = 'none';
    this.element.style.webkitUserSelect = 'none';

    // 禁用点击高亮
    this.element.style.webkitTapHighlightColor = 'transparent';
  }

  /**
   * 初始化手势
   */
  private initGestures(): void {
    if (!this.element) return;

    this.gestureManager = new TouchGestureManager({
      swipeThreshold: this.config.minCellSize,
      preventDefault: true,
    });

    this.gestureManager.bind(this.element);

    // 监听滑动手势
    this.gestureManager.on('swipeleft', () => {
      this.element?.dispatchEvent(new CustomEvent('navigate', { detail: 'next' }));
    });

    this.gestureManager.on('swiperight', () => {
      this.element?.dispatchEvent(new CustomEvent('navigate', { detail: 'prev' }));
    });

    this.gestureManager.on('tap', (event) => {
      // 处理点击
      const target = document.elementFromPoint(event.endPoint.x, event.endPoint.y);
      if (target) {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
  }

  /**
   * 初始化自动调整大小
   */
  private initResize(): void {
    if (!this.element) return;

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });

      this.resizeObserver.observe(this.element);
    } else {
      // 降级方案
      window.addEventListener('resize', this.handleResize);
      window.addEventListener('orientationchange', this.handleResize);
    }
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize = (): void => {
    if (!this.element) return;

    const orientation = MobileDetector.getOrientation();
    this.element.setAttribute('data-orientation', orientation);

    // 调整单元格大小
    const width = this.element.clientWidth;
    const cellSize = Math.max(
      Math.floor(width / 7) - 8, // 7列，减去间距
      this.config.minCellSize
    );

    this.element.style.setProperty('--ldate-cell-size', `${cellSize}px`);
  };

  /**
   * 显示虚拟键盘
   */
  showVirtualKeyboard(): void {
    // 虚拟键盘逻辑（可扩展）
    console.log('[MobileAdapter] Show virtual keyboard');
  }

  /**
   * 隐藏虚拟键盘
   */
  hideVirtualKeyboard(): void {
    // 虚拟键盘逻辑（可扩展）
    console.log('[MobileAdapter] Hide virtual keyboard');
  }

  /**
   * 获取手势管理器
   */
  getGestureManager(): TouchGestureManager | null {
    return this.gestureManager;
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.gestureManager) {
      this.gestureManager.destroy();
      this.gestureManager = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    } else {
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('orientationchange', this.handleResize);
    }

    this.element = null;
  }
}

/**
 * 移动端工具函数
 */
export const MobileUtils = {
  /**
   * 禁用页面滚动
   */
  disableScroll(): void {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  },

  /**
   * 启用页面滚动
   */
  enableScroll(): void {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  },

  /**
   * 安全区域适配
   */
  applySafeAreaInsets(element: HTMLElement): void {
    element.style.paddingTop = 'env(safe-area-inset-top)';
    element.style.paddingBottom = 'env(safe-area-inset-bottom)';
    element.style.paddingLeft = 'env(safe-area-inset-left)';
    element.style.paddingRight = 'env(safe-area-inset-right)';
  },

  /**
   * 获取视口高度（考虑虚拟键盘）
   */
  getViewportHeight(): number {
    return window.visualViewport?.height ?? window.innerHeight;
  },
};

