/**
 * DOM 工具函数
 */

/**
 * 添加事件监听
 */
export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | Document | Window,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  element.addEventListener(event, handler as EventListener, options);
  return () => element.removeEventListener(event, handler as EventListener, options);
}

/**
 * 创建元素
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string | number | boolean | undefined>,
  children?: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === false) continue;
      if (value === true) {
        el.setAttribute(key, '');
      } else {
        el.setAttribute(key, String(value));
      }
    }
  }

  if (children) {
    for (const child of children) {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else {
        el.appendChild(child);
      }
    }
  }

  return el;
}

/**
 * 设置样式
 */
export function setStyles(
  element: HTMLElement,
  styles: Record<string, string | number>
): void {
  for (const [key, value] of Object.entries(styles)) {
    element.style.setProperty(
      key.replace(/([A-Z])/g, '-$1').toLowerCase(),
      typeof value === 'number' ? `${value}px` : value
    );
  }
}

/**
 * 添加类名
 */
export function addClass(element: HTMLElement, ...classNames: string[]): void {
  element.classList.add(...classNames.filter(Boolean));
}

/**
 * 移除类名
 */
export function removeClass(element: HTMLElement, ...classNames: string[]): void {
  element.classList.remove(...classNames.filter(Boolean));
}

/**
 * 切换类名
 */
export function toggleClass(element: HTMLElement, className: string, force?: boolean): void {
  element.classList.toggle(className, force);
}

/**
 * 是否包含类名
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * 查询元素
 */
export function query(selector: string, context: HTMLElement | Document = document): HTMLElement | null {
  return context.querySelector(selector);
}

/**
 * 查询所有元素
 */
export function queryAll(selector: string, context: HTMLElement | Document = document): HTMLElement[] {
  return Array.from(context.querySelectorAll(selector));
}

/**
 * 获取元素位置信息
 */
export function getRect(element: HTMLElement): DOMRect {
  return element.getBoundingClientRect();
}

/**
 * 获取视口尺寸
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

/**
 * 获取滚动位置
 */
export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  };
}

/**
 * 计算弹出层位置
 */
export function calculatePopupPosition(
  trigger: HTMLElement,
  popup: HTMLElement,
  options: {
    placement?: 'bottom' | 'top' | 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
    offset?: number;
  } = {}
): { top: number; left: number } {
  const { placement = 'bottom-start', offset = 4 } = options;
  const triggerRect = getRect(trigger);
  const popupRect = getRect(popup);
  const viewport = getViewportSize();
  const scroll = getScrollPosition();

  let top = 0;
  let left = 0;

  // 计算基础位置
  switch (placement) {
    case 'bottom':
      top = triggerRect.bottom + offset;
      left = triggerRect.left + (triggerRect.width - popupRect.width) / 2;
      break;
    case 'bottom-start':
      top = triggerRect.bottom + offset;
      left = triggerRect.left;
      break;
    case 'bottom-end':
      top = triggerRect.bottom + offset;
      left = triggerRect.right - popupRect.width;
      break;
    case 'top':
      top = triggerRect.top - popupRect.height - offset;
      left = triggerRect.left + (triggerRect.width - popupRect.width) / 2;
      break;
    case 'top-start':
      top = triggerRect.top - popupRect.height - offset;
      left = triggerRect.left;
      break;
    case 'top-end':
      top = triggerRect.top - popupRect.height - offset;
      left = triggerRect.right - popupRect.width;
      break;
  }

  // 边界检测和调整
  if (left < 0) left = 0;
  if (left + popupRect.width > viewport.width) {
    left = viewport.width - popupRect.width;
  }

  // 如果下方空间不够，尝试显示在上方
  if (placement.startsWith('bottom') && top + popupRect.height > viewport.height) {
    top = triggerRect.top - popupRect.height - offset;
  }

  // 如果上方空间不够，尝试显示在下方
  if (placement.startsWith('top') && top < 0) {
    top = triggerRect.bottom + offset;
  }

  return { top: top + scroll.y, left: left + scroll.x };
}

/**
 * 滚动到元素
 */
export function scrollToElement(
  container: HTMLElement,
  target: HTMLElement,
  options: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition } = {}
): void {
  const { behavior = 'smooth', block = 'nearest' } = options;
  target.scrollIntoView({ behavior, block });
}

/**
 * 滚动到指定位置
 */
export function scrollTo(
  container: HTMLElement,
  top: number,
  behavior: ScrollBehavior = 'smooth'
): void {
  container.scrollTo({ top, behavior });
}

/**
 * 是否点击在元素外部
 */
export function isClickOutside(event: MouseEvent, ...elements: (HTMLElement | null)[]): boolean {
  const target = event.target as HTMLElement;
  // 如果点击的 target 在任意一个元素内部，则不是外部点击
  return !elements.some(el => el && el.contains(target));
}

/**
 * 获取元素的滚动父元素
 */
export function getScrollParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;

  while (parent) {
    const style = getComputedStyle(parent);
    if (
      style.overflow === 'auto' ||
      style.overflow === 'scroll' ||
      style.overflowY === 'auto' ||
      style.overflowY === 'scroll'
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null;
}

/**
 * 防抖
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}
