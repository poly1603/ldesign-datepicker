/**
 * @ldesign/datepicker-shared
 * 共享工具和类型定义
 * 
 * @version 1.0.0-optimized
 * @author LDesign Team
 * @license MIT
 */

// 类型导出
export * from './types';

// 工具导出
export * from './utils';

// 语言包导出
export * from './locales';

// 常量导出
export * from './constants';

// 验证器导出
export * from './validators';

// 国际化导出
export {
  loadLocale,
  setLocale,
  getLocale,
  getLoadedLocale,
  preloadLocales,
  clearLocaleCache,
  getSupportedLocales,
  isLocaleSupported,
} from './i18n/loader';

export {
  isRTL,
  getTextDirection,
  applyRTLStyles,
  createRTLCSSVariables,
  RTLUtils,
} from './i18n/rtl-support';

// 相对日期导出
export {
  calculateRelativeDate,
  parseNaturalLanguageDate,
  formatRelativeDate,
  RELATIVE_DATE_SHORTCUTS,
  createRelativeDateShortcuts,
} from './utils/relative-date';

export type {
  RelativeDateUnit,
  RelativeDateConfig,
  RelativeDateDescriptor,
} from './utils/relative-date';

// 键盘导航导出
export {
  KeyboardShortcutManager,
  FocusManager,
  DEFAULT_KEYBOARD_MAPPING,
} from './utils/keyboard';

export type {
  KeyboardShortcut,
  NavigationDirection,
  KeyboardMapping,
} from './utils/keyboard';

// 事件发射器导出 (增强版)
export {
  EventEmitter,
} from './utils/event-emitter';

export type {
  EventListenerOptions,
} from './utils/event-emitter';
