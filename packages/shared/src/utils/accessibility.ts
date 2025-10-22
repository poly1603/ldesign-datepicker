/**
 * 可访问性工具（WCAG 2.1 AAA）
 */

/**
 * ARIA 角色
 */
export type AriaRole =
  | 'dialog'
  | 'grid'
  | 'gridcell'
  | 'button'
  | 'textbox'
  | 'application'
  | 'navigation';

/**
 * ARIA 属性
 */
export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  'aria-activedescendant'?: string;
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  role?: AriaRole;
}

/**
 * 可访问性管理器
 */
export class AccessibilityManager {
  private element: HTMLElement | null = null;
  private announcer: HTMLElement | null = null;

  /**
   * 初始化
   */
  init(element: HTMLElement): void {
    this.element = element;
    this.createAnnouncer();
  }

  /**
   * 创建屏幕阅读器通知元素
   */
  private createAnnouncer(): void {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('role', 'status');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.style.position = 'absolute';
    this.announcer.style.left = '-10000px';
    this.announcer.style.width = '1px';
    this.announcer.style.height = '1px';
    this.announcer.style.overflow = 'hidden';

    document.body.appendChild(this.announcer);
  }

  /**
   * 宣布消息（屏幕阅读器）
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcer) return;

    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;

    // 清空消息（让屏幕阅读器可以重复宣布相同消息）
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 100);
  }

  /**
   * 设置 ARIA 属性
   */
  setAriaAttributes(element: HTMLElement, attributes: AriaAttributes): void {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        element.removeAttribute(key);
      } else if (typeof value === 'boolean') {
        element.setAttribute(key, String(value));
      } else {
        element.setAttribute(key, String(value));
      }
    });
  }

  /**
   * 设置焦点
   */
  setFocus(element: HTMLElement, options?: FocusOptions): void {
    element.focus(options);

    // 确保元素可见
    element.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    });
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.announcer) {
      document.body.removeChild(this.announcer);
      this.announcer = null;
    }

    this.element = null;
  }
}

/**
 * 颜色对比度计算
 */
export class ColorContrastCalculator {
  /**
   * 计算相对亮度
   */
  static getRelativeLuminance(color: string): number {
    const rgb = this.parseColor(color);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map((c) => {
      const normalized = c / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * 计算对比度
   */
  static getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getRelativeLuminance(color1);
    const lum2 = this.getRelativeLuminance(color2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * 检查是否符合 WCAG AA 标准
   */
  static meetsWCAG_AA(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }

  /**
   * 检查是否符合 WCAG AAA 标准
   */
  static meetsWCAG_AAA(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }

  /**
   * 解析颜色
   */
  private static parseColor(color: string): [number, number, number] | null {
    // RGB 格式
    const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]!), parseInt(rgbMatch[2]!), parseInt(rgbMatch[3]!)];
    }

    // HEX 格式
    const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hexMatch) {
      return [
        parseInt(hexMatch[1]!, 16),
        parseInt(hexMatch[2]!, 16),
        parseInt(hexMatch[3]!, 16),
      ];
    }

    // 简写 HEX 格式
    const shortHexMatch = color.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
    if (shortHexMatch) {
      return [
        parseInt(shortHexMatch[1]! + shortHexMatch[1]!, 16),
        parseInt(shortHexMatch[2]! + shortHexMatch[2]!, 16),
        parseInt(shortHexMatch[3]! + shortHexMatch[3]!, 16),
      ];
    }

    return null;
  }
}

/**
 * 可访问性工具函数
 */
export const A11yUtils = {
  /**
   * 生成唯一 ID
   */
  generateId(prefix = 'ldate'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * 创建描述文本
   */
  createDateDescription(date: Date, locale = 'zh-cn'): string {
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * 创建范围描述文本
   */
  createRangeDescription(start: Date, end: Date, locale = 'zh-cn'): string {
    const startText = this.createDateDescription(start, locale);
    const endText = this.createDateDescription(end, locale);
    return `从 ${startText} 到 ${endText}`;
  },

  /**
   * 创建键盘提示文本
   */
  createKeyboardHint(): string {
    return '使用方向键导航，Enter键选择，Escape键关闭';
  },

  /**
   * 设置焦点陷阱
   */
  setupFocusTrap(container: HTMLElement, onEscape?: () => void): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
      }

      if (event.key === 'Tab') {
        const focusableElements = container.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },
};
