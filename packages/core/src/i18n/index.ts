/**
 * 国际化（i18n）管理器
 */

import type { LocaleData, LocaleCode } from '../types/locale'

/**
 * 国际化管理器类
 */
export class I18n {
  private static instance: I18n
  private locales: Map<string, LocaleData> = new Map()
  private currentLocale: string = 'zh-CN'

  /**
   * 私有构造函数（单例模式）
   */
  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n()
    }
    return I18n.instance
  }

  /**
   * 注册语言包
   */
  register(locale: LocaleData): void {
    this.locales.set(locale.name, locale)
  }

  /**
   * 批量注册语言包
   */
  registerAll(locales: LocaleData[]): void {
    locales.forEach(locale => this.register(locale))
  }

  /**
   * 使用指定语言
   */
  use(name: LocaleCode): void {
    if (this.locales.has(name)) {
      this.currentLocale = name
    } else {
      console.warn(`[I18n] Locale "${name}" not found, using "${this.currentLocale}" instead`)
    }
  }

  /**
   * 获取当前语言包
   */
  getCurrentLocale(): LocaleData | undefined {
    return this.locales.get(this.currentLocale)
  }

  /**
   * 获取当前语言名称
   */
  getCurrentLocaleName(): string {
    return this.currentLocale
  }

  /**
   * 获取指定语言包
   */
  getLocale(name: string): LocaleData | undefined {
    return this.locales.get(name)
  }

  /**
   * 获取所有已注册的语言包
   */
  getAllLocales(): LocaleData[] {
    return Array.from(this.locales.values())
  }

  /**
   * 获取所有语言名称
   */
  getAllLocaleNames(): string[] {
    return Array.from(this.locales.keys())
  }

  /**
   * 检查语言包是否存在
   */
  hasLocale(name: string): boolean {
    return this.locales.has(name)
  }

  /**
   * 获取翻译文本（支持嵌套路径）
   * @param path 文本路径，如 'buttons.confirm'
   * @param params 替换参数
   */
  t(path: string, ...params: any[]): string {
    const locale = this.getCurrentLocale()
    if (!locale) {
      return path
    }

    const keys = path.split('.')
    let value: any = locale

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return path
      }
    }

    if (typeof value === 'string') {
      // 支持简单的参数替换 {0}, {1} 等
      return value.replace(/\{(\d+)\}/g, (match, index) => {
        const paramIndex = parseInt(index, 10)
        return params[paramIndex] !== undefined ? String(params[paramIndex]) : match
      })
    }

    return path
  }

  /**
   * 清除所有语言包
   */
  clear(): void {
    this.locales.clear()
  }

  /**
   * 移除指定语言包
   */
  remove(name: string): boolean {
    return this.locales.delete(name)
  }
}

/**
 * 导出默认实例
 */
export const i18n = I18n.getInstance()

/**
 * 便捷函数
 */
export const t = (path: string, ...params: any[]): string => {
  return i18n.t(path, ...params)
}

export const useLocale = (name: LocaleCode): void => {
  i18n.use(name)
}

export const registerLocale = (locale: LocaleData): void => {
  i18n.register(locale)
}

export const getCurrentLocale = (): LocaleData | undefined => {
  return i18n.getCurrentLocale()
}