/**
 * 基础选择器抽象类
 * 所有选择器的基类，提供通用功能
 */

import { EventEmitter } from '../../utils/event-emitter'
import { i18n } from '../../i18n'
import { themeManager } from '../../theme'
import type { BasePickerOptions } from '../../types/picker'
import type { LocaleData } from '../../types/locale'
import type { ThemeData } from '../../types/theme'

/**
 * 基础选择器抽象类
 */
export abstract class BasePicker extends EventEmitter {
  protected options: BasePickerOptions
  protected container: HTMLElement | null = null
  protected value: any = null
  protected visible: boolean = false
  protected mounted: boolean = false

  /**
   * 构造函数
   */
  constructor(options: BasePickerOptions = {}) {
    super()
    this.options = this.normalizeOptions(options)
    this.initialize()
  }

  /**
   * 规范化配置项
   */
  protected normalizeOptions(options: BasePickerOptions): BasePickerOptions {
    return {
      locale: options.locale || 'zh-CN',
      theme: options.theme || 'light',
      disabled: options.disabled || false,
      readonly: options.readonly || false,
      clearable: options.clearable !== false,
      size: options.size || 'medium',
      placement: options.placement || 'bottom-start',
      showToday: options.showToday !== false,
      showNow: options.showNow !== false,
      showConfirm: options.showConfirm !== false,
      zIndex: options.zIndex || 2000,
      ...options
    }
  }

  /**
   * 初始化
   */
  protected initialize(): void {
    // 设置语言
    if (this.options.locale && i18n.hasLocale(this.options.locale)) {
      i18n.use(this.options.locale)
    }

    // 设置主题
    if (this.options.theme && themeManager.hasTheme(this.options.theme)) {
      themeManager.use(this.options.theme)
    }

    // 绑定事件处理器
    this.bindEvents()
  }

  /**
   * 绑定事件处理器
   */
  protected bindEvents(): void {
    // 值变化事件
    if (this.options.onChange) {
      this.on('change', this.options.onChange)
    }

    // 清除事件
    if (this.options.onClear) {
      this.on('clear', this.options.onClear)
    }

    // 打开事件
    if (this.options.onOpen) {
      this.on('open', this.options.onOpen)
    }

    // 关闭事件
    if (this.options.onClose) {
      this.on('close', this.options.onClose)
    }

    // 确认事件
    if (this.options.onConfirm) {
      this.on('confirm', this.options.onConfirm)
    }
  }

  /**
   * 挂载到 DOM 元素
   */
  mount(container: HTMLElement): void {
    if (this.mounted) {
      console.warn('[BasePicker] Already mounted')
      return
    }

    this.container = container
    this.render()
    this.mounted = true
    this.afterMount()
  }

  /**
   * 挂载后的钩子
   */
  protected afterMount(): void {
    // 子类可以重写此方法
  }

  /**
   * 卸载
   */
  destroy(): void {
    if (!this.mounted) {
      return
    }

    this.beforeDestroy()
    this.removeAllListeners()

    if (this.container) {
      this.container.innerHTML = ''
      this.container = null
    }

    this.mounted = false
  }

  /**
   * 销毁前的钩子
   */
  protected beforeDestroy(): void {
    // 子类可以重写此方法
  }

  /**
   * 渲染 UI（抽象方法，由子类实现）
   */
  protected abstract render(): void

  /**
   * 更新 UI
   */
  protected abstract update(): void

  /**
   * 获取值
   */
  getValue(): any {
    return this.value
  }

  /**
   * 设置值
   */
  setValue(value: any): void {
    if (this.options.readonly || this.options.disabled) {
      return
    }

    this.value = value
    this.update()
    this.emit('change', value)
  }

  /**
   * 清除值
   */
  clear(): void {
    if (this.options.readonly || this.options.disabled) {
      return
    }

    this.value = null
    this.update()
    this.emit('clear')
    this.emit('change', null)
  }

  /**
   * 打开选择器
   */
  open(): void {
    if (this.options.disabled || this.visible) {
      return
    }

    this.visible = true
    this.update()
    this.emit('open')
  }

  /**
   * 关闭选择器
   */
  close(): void {
    if (!this.visible) {
      return
    }

    this.visible = false
    this.update()
    this.emit('close')
  }

  /**
   * 切换显示状态
   */
  toggle(): void {
    if (this.visible) {
      this.close()
    } else {
      this.open()
    }
  }

  /**
   * 确认选择
   */
  confirm(): void {
    this.emit('confirm', this.value)
    this.close()
  }

  /**
   * 启用选择器
   */
  enable(): void {
    this.options.disabled = false
    this.update()
  }

  /**
   * 禁用选择器
   */
  disable(): void {
    this.options.disabled = true
    this.close()
    this.update()
  }

  /**
   * 判断是否禁用
   */
  isDisabled(): boolean {
    return this.options.disabled || false
  }

  /**
   * 判断是否只读
   */
  isReadonly(): boolean {
    return this.options.readonly || false
  }

  /**
   * 判断是否可见
   */
  isVisible(): boolean {
    return this.visible
  }

  /**
   * 获取当前语言包
   */
  protected getLocale(): LocaleData | undefined {
    return i18n.getCurrentLocale()
  }

  /**
   * 获取当前主题
   */
  protected getTheme(): ThemeData | undefined {
    return themeManager.getCurrentTheme()
  }

  /**
   * 获取配置项
   */
  getOptions(): BasePickerOptions {
    return { ...this.options }
  }

  /**
   * 更新配置项
   */
  setOptions(options: Partial<BasePickerOptions>): void {
    this.options = { ...this.options, ...options }
    this.update()
  }

  /**
   * 创建 DOM 元素的辅助方法
   */
  protected createElement(
    tag: string,
    className?: string,
    textContent?: string
  ): HTMLElement {
    const element = document.createElement(tag)
    if (className) {
      element.className = className
    }
    if (textContent) {
      element.textContent = textContent
    }
    return element
  }

  /**
   * 添加事件监听器的辅助方法
   */
  protected addDOMListener(
    element: HTMLElement,
    event: string,
    handler: EventListener
  ): void {
    element.addEventListener(event, handler)
  }

  /**
   * 移除事件监听器的辅助方法
   */
  protected removeDOMListener(
    element: HTMLElement,
    event: string,
    handler: EventListener
  ): void {
    element.removeEventListener(event, handler)
  }
}