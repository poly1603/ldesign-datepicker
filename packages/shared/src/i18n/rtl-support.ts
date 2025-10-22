/**
 * RTL（从右到左）语言支持
 */

/**
 * RTL 语言列表
 */
const RTL_LOCALES = ['ar', 'ar-sa', 'he', 'he-il', 'fa', 'fa-ir', 'ur', 'ur-pk'];

/**
 * 检查是否为 RTL 语言
 */
export function isRTL(locale: string): boolean {
  const normalizedLocale = locale.toLowerCase();

  // 精确匹配
  if (RTL_LOCALES.includes(normalizedLocale)) {
    return true;
  }

  // 前缀匹配（如 ar-SA -> ar）
  const prefix = normalizedLocale.split('-')[0];
  return RTL_LOCALES.some((rtlLocale) => rtlLocale.startsWith(prefix || ''));
}

/**
 * 获取文本方向
 */
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * 应用 RTL 样式
 */
export function applyRTLStyles(element: HTMLElement, locale: string): void {
  const direction = getTextDirection(locale);
  element.setAttribute('dir', direction);

  if (direction === 'rtl') {
    element.classList.add('ldate-rtl');
  } else {
    element.classList.remove('ldate-rtl');
  }
}

/**
 * 创建 RTL CSS 变量
 */
export function createRTLCSSVariables(locale: string): Record<string, string> {
  const isRtl = isRTL(locale);

  return {
    '--ldate-direction': isRtl ? 'rtl' : 'ltr',
    '--ldate-text-align': isRtl ? 'right' : 'left',
    '--ldate-flex-direction': isRtl ? 'row-reverse' : 'row',
    '--ldate-margin-start': isRtl ? '0' : 'auto',
    '--ldate-margin-end': isRtl ? 'auto' : '0',
  };
}

/**
 * RTL 感知的样式工具
 */
export const RTLUtils = {
  /**
   * 获取开始位置属性名
   */
  getStartProperty(property: 'margin' | 'padding' | 'border'): string {
    return `${property}-inline-start`;
  },

  /**
   * 获取结束位置属性名
   */
  getEndProperty(property: 'margin' | 'padding' | 'border'): string {
    return `${property}-inline-end`;
  },

  /**
   * 根据 RTL 调整数值
   */
  adjustValue(value: number, locale: string): number {
    return isRTL(locale) ? -value : value;
  },

  /**
   * 根据 RTL 调整位置
   */
  adjustPosition(position: 'left' | 'right', locale: string): 'left' | 'right' {
    if (!isRTL(locale)) {
      return position;
    }
    return position === 'left' ? 'right' : 'left';
  },
};

