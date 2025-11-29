/**
 * 月份选择器
 * 用于选择月份
 */

import { BasePicker } from './base/BasePicker'
import { DateUtils } from '../utils/date'
import type { MonthPickerOptions } from '../types/picker'

/**
 * 月份选择器类
 */
export class MonthPicker extends BasePicker {
  private currentYear: number

  declare protected options: MonthPickerOptions

  /**
   * 构造函数
   */
  constructor(options: MonthPickerOptions = {}) {
    super(options)

    // 初始化当前年份
    const now = new Date()
    this.currentYear = this.value ? new Date(this.value).getFullYear() : now.getFullYear()
  }

  /**
   * 渲染 UI
   */
  protected render(): void {
    if (!this.container) return

    // 创建主容器
    const pickerEl = this.createElement('div', 'ldp-month-picker')

    // 添加禁用类
    if (this.options.disabled) {
      pickerEl.classList.add('ldp-month-picker--disabled')
    }

    // 创建头部
    const headerEl = this.createHeader()
    pickerEl.appendChild(headerEl)

    // 创建月份面板
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
    const locale = this.getLocale()
    const headerEl = this.createElement('div', 'ldp-month-picker__header')

    // 上一年按钮
    const prevBtn = this.createElement('button', 'ldp-month-picker__prev-btn', '«')
    prevBtn.title = locale?.buttons.prevYear || '上一年'
    prevBtn.onclick = () => this.gotoPrevYear()
    headerEl.appendChild(prevBtn)

    // 年份标题
    const titleEl = this.createElement(
      'div',
      'ldp-month-picker__title',
      `${this.currentYear}年`
    )
    headerEl.appendChild(titleEl)

    // 下一年按钮
    const nextBtn = this.createElement('button', 'ldp-month-picker__next-btn', '»')
    nextBtn.title = locale?.buttons.nextYear || '下一年'
    nextBtn.onclick = () => this.gotoNextYear()
    headerEl.appendChild(nextBtn)

    return headerEl
  }

  /**
   * 创建月份面板
   */
  private createPanel(): HTMLElement {
    const panelEl = this.createElement('div', 'ldp-month-picker__panel')

    // 渲染 12 个月份（3行4列）
    for (let month = 0; month < 12; month++) {
      const monthEl = this.createMonthCell(month)
      panelEl.appendChild(monthEl)
    }

    return panelEl
  }

  /**
   * 创建月份单元格
   */
  private createMonthCell(month: number): HTMLElement {
    const locale = this.getLocale()
    const monthName = locale?.monthsShort[month] || `${month + 1}月`
    const cellEl = this.createElement('div', 'ldp-month-picker__cell', monthName)

    // 当前月份
    const now = new Date()
    if (this.currentYear === now.getFullYear() && month === now.getMonth()) {
      cellEl.classList.add('ldp-month-picker__cell--current')
    }

    // 选中的月份
    if (this.value) {
      const selectedDate = new Date(this.value)
      if (
        this.currentYear === selectedDate.getFullYear() &&
        month === selectedDate.getMonth()
      ) {
        cellEl.classList.add('ldp-month-picker__cell--selected')
      }
    }

    // 检查是否禁用
    if (this.isMonthDisabled(month)) {
      cellEl.classList.add('ldp-month-picker__cell--disabled')
      return cellEl
    }

    // 点击事件
    cellEl.onclick = () => this.handleMonthSelect(month)

    // 悬停效果
    cellEl.onmouseenter = () => {
      if (!this.isMonthDisabled(month)) {
        cellEl.classList.add('ldp-month-picker__cell--hover')
      }
    }
    cellEl.onmouseleave = () => {
      cellEl.classList.remove('ldp-month-picker__cell--hover')
    }

    return cellEl
  }

  /**
   * 创建底部
   */
  private createFooter(): HTMLElement {
    const locale = this.getLocale()
    const footerEl = this.createElement('div', 'ldp-month-picker__footer')

    // 本月按钮
    if (this.options.showToday) {
      const todayBtn = this.createElement(
        'button',
        'ldp-month-picker__today-btn',
        locale?.shortcuts.thisMonth || '本月'
      )
      todayBtn.onclick = () => this.selectThisMonth()
      footerEl.appendChild(todayBtn)
    }

    // 确认按钮
    if (this.options.showConfirm) {
      const confirmBtn = this.createElement(
        'button',
        'ldp-month-picker__confirm-btn',
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
   * 处理月份选择
   */
  private handleMonthSelect(month: number): void {
    if (this.options.disabled || this.options.readonly) return
    if (this.isMonthDisabled(month)) return

    // 创建日期（该月的1日）
    const date = new Date(this.currentYear, month, 1)
    this.setValue(date)

    // 如果不需要确认，直接关闭
    if (!this.options.showConfirm) {
      this.close()
    }
  }

  /**
   * 判断月份是否禁用
   */
  private isMonthDisabled(month: number): boolean {
    if (!this.options.disabledDate) return false

    // 检查该月的1日是否被禁用
    const date = new Date(this.currentYear, month, 1)
    return this.options.disabledDate(date)
  }

  /**
   * 上一年
   */
  private gotoPrevYear(): void {
    this.currentYear -= 1
    this.update()
  }

  /**
   * 下一年
   */
  private gotoNextYear(): void {
    this.currentYear += 1
    this.update()
  }

  /**
   * 选择本月
   */
  private selectThisMonth(): void {
    const now = new Date()
    this.currentYear = now.getFullYear()
    this.setValue(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  /**
   * 设置值
   */
  setValue(value: any): void {
    const date = DateUtils.parse(value)
    if (!date) return

    super.setValue(date)
    this.currentYear = date.getFullYear()
  }

  /**
   * 跳转到指定年份
   */
  gotoYear(year: number): void {
    this.currentYear = year
    this.update()
  }

  /**
   * 获取当前显示的年份
   */
  getCurrentYear(): number {
    return this.currentYear
  }
}
