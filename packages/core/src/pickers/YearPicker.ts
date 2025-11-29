/**
 * 年份选择器
 * 用于选择年份
 */

import { BasePicker } from './base/BasePicker'
import { DateUtils } from '../utils/date'
import type { YearPickerOptions } from '../types/picker'

/**
 * 年份选择器类
 */
export class YearPicker extends BasePicker {
  private currentYear: number
  private panelYears: number[] = []

  declare protected options: YearPickerOptions

  /**
   * 构造函数
   */
  constructor(options: YearPickerOptions = {}) {
    super(options)

    // 初始化当前年份
    const now = new Date()
    this.currentYear = this.value ? new Date(this.value).getFullYear() : now.getFullYear()

    // 生成面板年份
    this.updatePanelYears()
  }

  /**
   * 规范化配置项
   */
  protected normalizeOptions(options: YearPickerOptions): YearPickerOptions {
    const defaultStartYear = new Date().getFullYear() - 50
    const defaultEndYear = new Date().getFullYear() + 50

    return {
      ...super.normalizeOptions(options),
      startYear: options.startYear || defaultStartYear,
      endYear: options.endYear || defaultEndYear
    }
  }

  /**
   * 更新面板年份（12年一页）
   */
  private updatePanelYears(): void {
    this.panelYears = DateUtils.getYearPanelYears(this.currentYear)
  }

  /**
   * 渲染 UI
   */
  protected render(): void {
    if (!this.container) return

    // 创建主容器
    const pickerEl = this.createElement('div', 'ldp-year-picker')

    // 添加禁用类
    if (this.options.disabled) {
      pickerEl.classList.add('ldp-year-picker--disabled')
    }

    // 创建头部
    const headerEl = this.createHeader()
    pickerEl.appendChild(headerEl)

    // 创建年份面板
    const panelEl = this.createPanel()
    pickerEl.appendChild(panelEl)

    // 创建底部（如果需要）
    if (this.options.showToday || this.options.showConfirm) {
      const footerEl = this.createFooter()
      pickerEl.appendChild(footerEl)
    }

    this.container.appendChild(pickerEl)
  }

  /**
   * 创建头部
   */
  private createHeader(): HTMLElement {
    const headerEl = this.createElement('div', 'ldp-year-picker__header')

    // 上一页按钮
    const prevBtn = this.createElement('button', 'ldp-year-picker__prev-btn', '«')
    prevBtn.onclick = () => this.gotoPrevPanel()
    headerEl.appendChild(prevBtn)

    // 年份范围标题
    const startYear = this.panelYears[0]
    const endYear = this.panelYears[this.panelYears.length - 1]
    const titleEl = this.createElement(
      'div',
      'ldp-year-picker__title',
      `${startYear} - ${endYear}`
    )
    headerEl.appendChild(titleEl)

    // 下一页按钮
    const nextBtn = this.createElement('button', 'ldp-year-picker__next-btn', '»')
    nextBtn.onclick = () => this.gotoNextPanel()
    headerEl.appendChild(nextBtn)

    return headerEl
  }

  /**
   * 创建年份面板
   */
  private createPanel(): HTMLElement {
    const panelEl = this.createElement('div', 'ldp-year-picker__panel')

    this.panelYears.forEach(year => {
      const yearEl = this.createYearCell(year)
      panelEl.appendChild(yearEl)
    })

    return panelEl
  }

  /**
   * 创建年份单元格
   */
  private createYearCell(year: number): HTMLElement {
    const cellEl = this.createElement('div', 'ldp-year-picker__cell', String(year))

    // 检查是否在有效范围内
    if (this.options.startYear && year < this.options.startYear) {
      cellEl.classList.add('ldp-year-picker__cell--out-of-range')
      return cellEl
    }

    if (this.options.endYear && year > this.options.endYear) {
      cellEl.classList.add('ldp-year-picker__cell--out-of-range')
      return cellEl
    }

    // 当前年份
    if (year === new Date().getFullYear()) {
      cellEl.classList.add('ldp-year-picker__cell--current')
    }

    // 选中的年份
    if (this.value && year === new Date(this.value).getFullYear()) {
      cellEl.classList.add('ldp-year-picker__cell--selected')
    }

    // 检查是否禁用
    if (this.isYearDisabled(year)) {
      cellEl.classList.add('ldp-year-picker__cell--disabled')
      return cellEl
    }

    // 点击事件
    cellEl.onclick = () => this.handleYearSelect(year)

    // 悬停效果
    cellEl.onmouseenter = () => {
      if (!this.isYearDisabled(year)) {
        cellEl.classList.add('ldp-year-picker__cell--hover')
      }
    }
    cellEl.onmouseleave = () => {
      cellEl.classList.remove('ldp-year-picker__cell--hover')
    }

    return cellEl
  }

  /**
   * 创建底部
   */
  private createFooter(): HTMLElement {
    const locale = this.getLocale()
    const footerEl = this.createElement('div', 'ldp-year-picker__footer')

    // 今年按钮
    if (this.options.showToday) {
      const todayBtn = this.createElement(
        'button',
        'ldp-year-picker__today-btn',
        locale?.buttons.today || '今年'
      )
      todayBtn.onclick = () => this.selectToday()
      footerEl.appendChild(todayBtn)
    }

    // 确认按钮
    if (this.options.showConfirm) {
      const confirmBtn = this.createElement(
        'button',
        'ldp-year-picker__confirm-btn',
        locale?.buttons.confirm || '确定'
      )
      confirmBtn.onclick = () => this.confirm()
      footerEl.appendChild(confirmBtn)
    }

    return footerEl
  }

  /**
   * 更新 UI
   */
  protected update(): void {
    if (!this.container) return

    this.container.innerHTML = ''
    this.render()
  }

  /**
   * 处理年份选择
   */
  private handleYearSelect(year: number): void {
    if (this.options.disabled || this.options.readonly) return
    if (this.isYearDisabled(year)) return

    // 创建日期（该年的1月1日）
    const date = new Date(year, 0, 1)
    this.setValue(date)

    // 如果不需要确认，直接关闭
    if (!this.options.showConfirm) {
      this.close()
    }
  }

  /**
   * 判断年份是否禁用
   */
  private isYearDisabled(year: number): boolean {
    if (!this.options.disabledDate) return false

    // 检查该年的1月1日是否被禁用
    const date = new Date(year, 0, 1)
    return this.options.disabledDate(date)
  }

  /**
   * 前一页
   */
  private gotoPrevPanel(): void {
    this.currentYear -= 12
    this.updatePanelYears()
    this.update()
  }

  /**
   * 下一页
   */
  private gotoNextPanel(): void {
    this.currentYear += 12
    this.updatePanelYears()
    this.update()
  }

  /**
   * 选择今年
   */
  private selectToday(): void {
    const now = new Date()
    this.currentYear = now.getFullYear()
    this.updatePanelYears()
    this.setValue(now)
  }

  /**
   * 设置值
   */
  setValue(value: any): void {
    const date = DateUtils.parse(value)
    if (!date) return

    super.setValue(date)
    this.currentYear = date.getFullYear()
    this.updatePanelYears()
  }
}