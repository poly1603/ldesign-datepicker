/**
 * 键盘导航增强
 */

/**
 * 键盘快捷键配置
 */
export interface KeyboardShortcut {
  /** 快捷键组合 */
  keys: string[];

  /** 处理函数 */
  handler: (event: KeyboardEvent) => void;

  /** 描述 */
  description?: string;

  /** 是否阻止默认行为 */
  preventDefault?: boolean;

  /** 是否阻止冒泡 */
  stopPropagation?: boolean;
}

/**
 * 键盘导航方向
 */
export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'home' | 'end' | 'pageup' | 'pagedown';

/**
 * 键盘映射配置
 */
export interface KeyboardMapping {
  /** 向上导航 */
  up?: string[];

  /** 向下导航 */
  down?: string[];

  /** 向左导航 */
  left?: string[];

  /** 向右导航 */
  right?: string[];

  /** 跳到开始 */
  home?: string[];

  /** 跳到结束 */
  end?: string[];

  /** 上一页 */
  pageUp?: string[];

  /** 下一页 */
  pageDown?: string[];

  /** 确认/选择 */
  select?: string[];

  /** 取消/关闭 */
  cancel?: string[];

  /** 今天 */
  today?: string[];
}

/**
 * 默认键盘映射
 */
export const DEFAULT_KEYBOARD_MAPPING: Required<KeyboardMapping> = {
  up: ['ArrowUp'],
  down: ['ArrowDown'],
  left: ['ArrowLeft'],
  right: ['ArrowRight'],
  home: ['Home'],
  end: ['End'],
  pageUp: ['PageUp'],
  pageDown: ['PageDown'],
  select: ['Enter', ' '],
  cancel: ['Escape'],
  today: ['t', 'T'],
};

/**
 * 键盘快捷键管理器
 */
export class KeyboardShortcutManager {
  private shortcuts = new Map<string, KeyboardShortcut>();
  private mapping: Required<KeyboardMapping>;
  private enabled = true;

  constructor(mapping: KeyboardMapping = {}) {
    this.mapping = { ...DEFAULT_KEYBOARD_MAPPING, ...mapping };
  }

  /**
   * 注册快捷键
   */
  register(id: string, shortcut: KeyboardShortcut): void {
    this.shortcuts.set(id, shortcut);
  }

  /**
   * 取消注册快捷键
   */
  unregister(id: string): void {
    this.shortcuts.delete(id);
  }

  /**
   * 处理键盘事件
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.enabled) {
      return false;
    }

    const key = this.normalizeKey(event);

    for (const shortcut of this.shortcuts.values()) {
      if (this.matchesShortcut(key, event, shortcut)) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        if (shortcut.stopPropagation) {
          event.stopPropagation();
        }

        shortcut.handler(event);
        return true;
      }
    }

    return false;
  }

  /**
   * 检查是否匹配快捷键
   */
  private matchesShortcut(key: string, event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    return shortcut.keys.some((shortcutKey) => {
      const parts = shortcutKey.split('+').map((p) => p.trim().toLowerCase());

      const hasCtrl = parts.includes('ctrl') || parts.includes('control');
      const hasAlt = parts.includes('alt');
      const hasShift = parts.includes('shift');
      const hasMeta = parts.includes('meta') || parts.includes('cmd');

      const mainKey = parts.find((p) =>
        !['ctrl', 'control', 'alt', 'shift', 'meta', 'cmd'].includes(p)
      );

      return (
        (!hasCtrl || event.ctrlKey || event.metaKey) &&
        (!hasAlt || event.altKey) &&
        (!hasShift || event.shiftKey) &&
        (!hasMeta || event.metaKey) &&
        (!mainKey || key.toLowerCase() === mainKey.toLowerCase())
      );
    });
  }

  /**
   * 规范化按键
   */
  private normalizeKey(event: KeyboardEvent): string {
    // 处理特殊键
    if (event.key === ' ') return 'Space';
    if (event.key === 'Esc') return 'Escape';

    return event.key;
  }

  /**
   * 获取导航方向
   */
  getNavigationDirection(event: KeyboardEvent): NavigationDirection | null {
    const key = event.key;

    if (this.mapping.up.includes(key)) return 'up';
    if (this.mapping.down.includes(key)) return 'down';
    if (this.mapping.left.includes(key)) return 'left';
    if (this.mapping.right.includes(key)) return 'right';
    if (this.mapping.home.includes(key)) return 'home';
    if (this.mapping.end.includes(key)) return 'end';
    if (this.mapping.pageUp.includes(key)) return 'pageup';
    if (this.mapping.pageDown.includes(key)) return 'pagedown';

    return null;
  }

  /**
   * 启用快捷键
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * 禁用快捷键
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * 更新键盘映射
   */
  updateMapping(mapping: Partial<KeyboardMapping>): void {
    this.mapping = { ...this.mapping, ...mapping } as Required<KeyboardMapping>;
  }

  /**
   * 获取所有快捷键
   */
  getShortcuts(): Array<{ id: string; shortcut: KeyboardShortcut }> {
    return Array.from(this.shortcuts.entries()).map(([id, shortcut]) => ({
      id,
      shortcut,
    }));
  }

  /**
   * 清空所有快捷键
   */
  clear(): void {
    this.shortcuts.clear();
  }
}

/**
 * 焦点管理器
 */
export class FocusManager {
  private focusableElements: HTMLElement[] = [];
  private currentIndex = -1;
  private container: HTMLElement | null = null;

  /**
   * 设置容器
   */
  setContainer(container: HTMLElement): void {
    this.container = container;
    this.updateFocusableElements();
  }

  /**
   * 更新可聚焦元素列表
   */
  updateFocusableElements(): void {
    if (!this.container) {
      this.focusableElements = [];
      return;
    }

    const selector = [
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(selector)
    ) as HTMLElement[];

    // 按 tabindex 排序
    this.focusableElements.sort((a, b) => {
      const aIndex = parseInt(a.getAttribute('tabindex') || '0');
      const bIndex = parseInt(b.getAttribute('tabindex') || '0');
      return aIndex - bIndex;
    });
  }

  /**
   * 聚焦到第一个元素
   */
  focusFirst(): void {
    if (this.focusableElements.length > 0) {
      this.currentIndex = 0;
      this.focusableElements[0]?.focus();
    }
  }

  /**
   * 聚焦到最后一个元素
   */
  focusLast(): void {
    if (this.focusableElements.length > 0) {
      this.currentIndex = this.focusableElements.length - 1;
      this.focusableElements[this.currentIndex]?.focus();
    }
  }

  /**
   * 聚焦到下一个元素
   */
  focusNext(): boolean {
    if (this.currentIndex < this.focusableElements.length - 1) {
      this.currentIndex++;
      this.focusableElements[this.currentIndex]?.focus();
      return true;
    }
    return false;
  }

  /**
   * 聚焦到上一个元素
   */
  focusPrevious(): boolean {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.focusableElements[this.currentIndex]?.focus();
      return true;
    }
    return false;
  }

  /**
   * 循环聚焦（到达边界时循环）
   */
  focusNextCircular(): void {
    if (this.focusableElements.length === 0) return;

    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentIndex]?.focus();
  }

  /**
   * 循环聚焦（向前）
   */
  focusPreviousCircular(): void {
    if (this.focusableElements.length === 0) return;

    this.currentIndex = this.currentIndex - 1;
    if (this.currentIndex < 0) {
      this.currentIndex = this.focusableElements.length - 1;
    }
    this.focusableElements[this.currentIndex]?.focus();
  }

  /**
   * 聚焦陷阱（Tab 键处理）
   */
  handleTabKey(event: KeyboardEvent): void {
    if (this.focusableElements.length === 0) return;

    if (event.shiftKey) {
      if (!this.focusPrevious()) {
        event.preventDefault();
        this.focusLast();
      }
    } else {
      if (!this.focusNext()) {
        event.preventDefault();
        this.focusFirst();
      }
    }
  }

  /**
   * 获取当前聚焦元素
   */
  getCurrentElement(): HTMLElement | null {
    return this.focusableElements[this.currentIndex] || null;
  }

  /**
   * 清空
   */
  clear(): void {
    this.focusableElements = [];
    this.currentIndex = -1;
    this.container = null;
  }
}

