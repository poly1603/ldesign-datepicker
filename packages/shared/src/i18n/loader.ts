/**
 * 语言包按需加载器
 */

import type { Locale } from '../types';

/**
 * 语言包加载器映射
 */
const LOCALE_LOADERS: Record<string, () => Promise<{ default: Locale }>> = {
  'zh-cn': () => import('../locales/zh-cn').then((m) => ({ default: m.zhCN })),
  'en-us': () => import('../locales/en-us').then((m) => ({ default: m.enUS })),
  'ja-jp': () => import('../locales/ja-jp').then((m) => ({ default: m.jaJP })),
  'ko-kr': () => import('../locales/ko-kr').then((m) => ({ default: m.koKR })),
  'de-de': () => import('../locales/de-de').then((m) => ({ default: m.deDE })),
  'fr-fr': () => import('../locales/fr-fr').then((m) => ({ default: m.frFR })),
  'es-es': () => import('../locales/es-es').then((m) => ({ default: m.esES })),
  'it-it': () => import('../locales/it-it').then((m) => ({ default: m.itIT })),
  'pt-br': () => import('../locales/pt-br').then((m) => ({ default: m.ptBR })),
  'ar-sa': () => import('../locales/ar-sa').then((m) => ({ default: m.arSA })),
};

/**
 * 已加载的语言包缓存
 */
const localeCache = new Map<string, Locale>();

/**
 * 当前语言
 */
let currentLocale: string = 'zh-cn';

/**
 * 加载语言包
 */
export async function loadLocale(locale: string): Promise<Locale> {
  const normalizedLocale = locale.toLowerCase();

  // 检查缓存
  if (localeCache.has(normalizedLocale)) {
    return localeCache.get(normalizedLocale)!;
  }

  // 检查是否支持该语言
  const loader = LOCALE_LOADERS[normalizedLocale];
  if (!loader) {
    console.warn(`[I18n] Locale "${locale}" is not supported, falling back to zh-cn`);
    return loadLocale('zh-cn');
  }

  try {
    const module = await loader();
    const localeData = module.default;

    // 缓存
    localeCache.set(normalizedLocale, localeData);

    return localeData;
  } catch (error) {
    console.error(`[I18n] Failed to load locale "${locale}":`, error);

    // 回退到默认语言
    if (normalizedLocale !== 'zh-cn') {
      return loadLocale('zh-cn');
    }

    throw error;
  }
}

/**
 * 设置当前语言
 */
export function setLocale(locale: string): void {
  currentLocale = locale.toLowerCase();
}

/**
 * 获取当前语言
 */
export function getLocale(): string {
  return currentLocale;
}

/**
 * 获取已加载的语言包
 */
export function getLoadedLocale(locale: string): Locale | undefined {
  return localeCache.get(locale.toLowerCase());
}

/**
 * 预加载多个语言包
 */
export async function preloadLocales(locales: string[]): Promise<void> {
  await Promise.all(locales.map((locale) => loadLocale(locale)));
}

/**
 * 清空语言包缓存
 */
export function clearLocaleCache(): void {
  localeCache.clear();
}

/**
 * 获取支持的语言列表
 */
export function getSupportedLocales(): string[] {
  return Object.keys(LOCALE_LOADERS);
}

/**
 * 检查是否支持某个语言
 */
export function isLocaleSupported(locale: string): boolean {
  return locale.toLowerCase() in LOCALE_LOADERS;
}

