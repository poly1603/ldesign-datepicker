/**
 * 主题管理系统
 */

import type { ThemeData, ThemeName, ThemeConfig } from '../types/theme'
import { lightTheme } from './light'
import { darkTheme } from './dark'

/**
 * 主题管理器类
 */
export class ThemeManager {
  private static instance: ThemeManager
  private themes: Map<string, ThemeData> = new Map()
  private currentTheme: ThemeName = 'light'
  private customTheme: Partial<ThemeData> = {}

  /**
   * 私有构造函数（单例模式）
   */
  private constructor() {
    // 注册默认主题
    this.register(lightTheme)
    this.register(darkTheme)
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  /**
   * 注册主题
   */
  register(theme: ThemeData): void {
    this.themes.set(theme.name, theme)
  }

  /**
   * 批量注册主题
   */
  registerAll(themes: ThemeData[]): void {
    themes.forEach(theme => this.register(theme))
  }

  /**
   * 使用指定主题
   */
  use(name: ThemeName): void {
    if (this.themes.has(name)) {
      this.currentTheme = name
      this.applyTheme()
    } else {
      console.warn(`[ThemeManager] Theme "${name}" not found`)
    }
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeData | undefined {
    const theme = this.themes.get(this.currentTheme)
    if (!theme) return undefined

    // 合并自定义主题
    return this.mergeTheme(theme, this.customTheme)
  }

  /**
   * 获取当前主题名称
   */
  getCurrentThemeName(): ThemeName {
    return this.currentTheme
  }

  /**
   * 获取指定主题
   */
  getTheme(name: string): ThemeData | undefined {
    return this.themes.get(name)
  }

  /**
   * 获取所有主题
   */
  getAllThemes(): ThemeData[] {
    return Array.from(this.themes.values())
  }

  /**
   * 获取所有主题名称
   */
  getAllThemeNames(): string[] {
    return Array.from(this.themes.keys())
  }

  /**
   * 检查主题是否存在
   */
  hasTheme(name: string): boolean {
    return this.themes.has(name)
  }

  /**
   * 自定义主题（覆盖当前主题的部分配置）
   */
  customize(config: ThemeConfig): void {
    this.customTheme = this.deepMerge(this.customTheme, config)
    this.applyTheme()
  }

  /**
   * 清除自定义主题配置
   */
  clearCustomize(): void {
    this.customTheme = {}
    this.applyTheme()
  }

  /**
   * 应用主题到 DOM
   */
  private applyTheme(): void {
    const theme = this.getCurrentTheme()
    if (!theme) return

    const root = document.documentElement

    // 应用颜色
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--ldp-color-${this.kebabCase(key)}`, value)
    })

    // 应用阴影
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--ldp-shadow-${key}`, value)
    })

    // 应用圆角
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--ldp-radius-${key}`, value)
    })

    // 应用间距
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--ldp-spacing-${key}`, value)
    })

    // 应用动画
    Object.entries(theme.animation).forEach(([key, value]) => {
      root.style.setProperty(`--ldp-animation-${this.kebabCase(key)}`, value)
    })

    // 应用字体
    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--ldp-font-${this.kebabCase(key)}`, String(value))
    })

    // 设置主题属性
    root.setAttribute('data-ldp-theme', theme.name)
  }

  /**
   * 合并主题配置
   */
  private mergeTheme(base: ThemeData, custom: Partial<ThemeData>): ThemeData {
    return this.deepMerge(base, custom) as ThemeData
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target }

    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    })

    return result
  }

  /**
   * 转换为 kebab-case
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  /**
   * 移除主题
   */
  remove(name: string): boolean {
    if (name === this.currentTheme) {
      console.warn(`[ThemeManager] Cannot remove current theme "${name}"`)
      return false
    }
    return this.themes.delete(name)
  }

  /**
   * 清除所有主题
   */
  clear(): void {
    this.themes.clear()
  }
}

/**
 * 导出默认实例
 */
export const themeManager = ThemeManager.getInstance()

/**
 * 便捷函数
 */
export const useTheme = (name: ThemeName): void => {
  themeManager.use(name)
}

export const customizeTheme = (config: ThemeConfig): void => {
  themeManager.customize(config)
}

export const getCurrentTheme = (): ThemeData | undefined => {
  return themeManager.getCurrentTheme()
}

export const registerTheme = (theme: ThemeData): void => {
  themeManager.register(theme)
}