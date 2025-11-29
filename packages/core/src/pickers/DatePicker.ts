/**
 * 日期选择器
 * 用于选择具体日期
 */

import { BasePicker } from './base/BasePicker'
import { DateUtils } from '../utils/date'
import type { DatePickerOptions } from '../types/picker'

/**
 * 日期选择器类
 */
export class DatePicker extends BasePicker {
  private currentDate: Date
  private calendarDates: Date[] = []

  declare protected options: DatePickerOptions

  /**
   * 构造函数
   */
  constructor(options: DatePickerOptions = {}) {
    super(options)

    // 初始化当前显示的月份
    const now = new Date()
    this.currentDate = this.value ? DateUtils.clone(this.value) : now

    // 生成日历数据
    this.updateCalendarDates()
  }

  /**
   * 规范化配置项
   */
  protected normalizeOptions(options: DatePickerOptions): DatePickerOptions {
    return {
      ...super.normalizeOptions(options),
      showWeekNumber: options.showWeekNumber || false,
      firstDayOfWeek: options.firstDayOfWeek ?? 1 // 默认周一开始
    }
  }

  /**
   * 更新日历数据
   */
  private updateCalendarDates(): void {
    this.calendarDates = DateUtils.getCalendarDates(
      this.currentDate,
      this.options.firstDayOfWeek ?? 1
    )
  }

  /**
   * 渲染 UI
   */
  protected render(): void {
    if (!this.container) return

    // 创建主容器
    const pickerEl = this.createElement('div', 'ldp-date-picker')

    // 添加禁用类
    if (this.options.disabled) {
      pickerEl.classList.add('ldp-date-picker--disabled')
    }

    // 创建头部
    const headerEl = this.createHeader()
    pickerEl.appendChild(headerEl)

    // 创建星期头部
    const weekHeaderEl = this.createWeekHeader()
    pickerEl.appendChild(weekHeaderEl)

    // 创建日历面板
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
    const headerEl = this.createElement('div', 'ldp-date-picker__header')

    // 上一年按钮
    const prevYearBtn = this.createElement('button', 'ldp-date-picker__prev-year-btn', '«')
    prevYearBtn.title = locale?.buttons.prevYear || '上一年'
    prevYearBtn.onclick = () => this.gotoPrevYear()
    headerEl.appendChild(prevYearBtn)

    // 上一月按钮
    const prevMonthBtn = this.createElement('button', 'ldp-date-picker__prev-month-btn', '‹')
    prevMonthBtn.title = locale?.buttons.prevMonth || '上一月'
    prevMonthBtn.onclick = () => this.gotoPrevMonth()
    headerEl.appendChild(prevMonthBtn)

    // 年份月份标题
    const titleEl = this.createElement('div', 'ldp-date-picker__title')

    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()
    const monthName = locale?.months[month] || `${month + 1}月`

    const yearBtn = this.createElement('button', 'ldp-date-picker__year-btn', `${year}年`)
    yearBtn.onclick = () => this.emit('yearSelect')
    titleEl.appendChild(yearBtn)

    const monthBtn = this.createElement('button', 'ldp-date-picker__month-btn', monthName)
    monthBtn.onclick = () => this.emit('monthSelect')
    titleEl.appendChild(monthBtn)

    headerEl.appendChild(titleEl)

    // 下一月按钮
    const nextMonthBtn = this.createElement('button', 'ldp-date-picker__next-month-btn', '›')
    nextMonthBtn.title = locale?.buttons.nextMonth || '下一月'
    nextMonthBtn.onclick = () => this.gotoNextMonth()
    headerEl.appendChild(nextMonthBtn)

    // 下一年按钮
    const nextYearBtn = this.createElement('button', 'ldp-date-picker__next-year-btn', '»')
    nextYearBtn.title = locale?.buttons.nextYear || '下一年'
    nextYearBtn.onclick = () => this.gotoNextYear()
    headerEl.appendChild(nextYearBtn)

    return headerEl
  }

  /**
   * 创建星期头部
   */
  private createWeekHeader(): HTMLElement {
    const locale = this.getLocale()
    const weekHeaderEl = this.createElement('div', 'ldp-date-picker__week-header')

    // 如果显示周数，添加空列
    if (this.options.showWeekNumber) {
      const weekNumHeaderEl = this.createElement('div', 'ldp-date-picker__week-number-header', '')
      weekHeaderEl.appendChild(weekNumHeaderEl)
    }

    // 获取周几的名称
    const weekdays = locale?.weekdaysMin || ['日', '一', '二', '三', '四', '五', '六']
    const firstDayOfWeek = this.options.firstDayOfWeek ?? 1

    // 按照 firstDayOfWeek 重新排列
    for (let i = 0; i < 7; i++) {
      const dayIndex = (firstDayOfWeek + i) % 7
      const dayEl = this.createElement('div', 'ldp-date-picker__week-day', weekdays[dayIndex])
      if (dayIndex === 0 || dayIndex === 6) {
        dayEl.classList.add('ldp-date-picker__week-day--weekend')
      }
      weekHeaderEl.appendChild(dayEl)
    }

    return weekHeaderEl
  }

  /**
   * 创建日历面板
   */
  private createPanel(): HTMLElement {
    const panelEl = this.createElement('div', 'ldp-date-picker__panel')

    // 按周分组渲染（6周 * 7天）
    for (let week = 0; week < 6; week++) {
      const weekEl = this.createElement('div', 'ldp-date-picker__week')

      // 显示周数
      if (this.options.showWeekNumber) {
        const firstDayOfWeek = this.calendarDates[week * 7]!
        const weekNum = DateUtils.getWeekOfYear(firstDayOfWeek)
        const weekNumEl = this.createElement('div', 'ldp-date-picker__week-number', String(weekNum))
        weekEl.appendChild(weekNumEl)
      }

      // 渲染每天
      for (let day = 0; day < 7; day++) {
        const date = this.calendarDates[week * 7 + day]!
        const dayEl = this.createDayCell(date)
        weekEl.appendChild(dayEl)
      }

      panelEl.appendChild(weekEl)
    }

    return panelEl
  }

  /**
   * 创建日期单元格
   */
  private createDayCell(date: Date): HTMLElement {
    const cellEl = this.createElement('div', 'ldp-date-picker__cell', String(date.getDate()))

    // 是否是当前月份
    const isCurrentMonth = DateUtils.isSameMonth(date, this.currentDate)
    if (!isCurrentMonth) {
      cellEl.classList.add('ldp-date-picker__cell--other-month')
    }

    // 是否是今天
    if (DateUtils.isToday(date)) {
      cellEl.classList.add('ldp-date-picker__cell--today')
    }

    // 是否是周末
    if (DateUtils.isWeekend(date)) {
      cellEl.classList.add('ldp-date-picker__cell--weekend')
    }

    // 是否被选中
    if (this.value && DateUtils.isSameDay(date, this.value)) {
      cellEl.classList.add('ldp-date-picker__cell--selected')
    }

    // 检查是否禁用
    if (this.isDateDisabled(date)) {
      cellEl.classList.add('ldp-date-picker__cell--disabled')
      return cellEl
    }

    // 点击事件
    cellEl.onclick = () => this.handleDateSelect(date)

    // 悬停效果
    cellEl.onmouseenter = () => {
      if (!this.isDateDisabled(date)) {
        cellEl.classList.add('ldp-date-picker__cell--hover')
        this.emit('hover', date)
      }
    }
    cellEl.onmouseleave = () => {
      cellEl.classList.remove('ldp-date-picker__cell--hover')
    }

    return cellEl
  }

  /**
   * 创建底部
   */
  private createFooter(): HTMLElement {
    const locale = this.getLocale()
    const footerEl = this.createElement('div', 'ldp-date-picker__footer')

    // 今天按钮
    if (this.options.showToday) {
      const todayBtn = this.createElement(
        'button',
        'ldp-date-picker__today-btn',
        locale?.buttons.today || '今天'
      )
      todayBtn.onclick = () => this.selectToday()
      footerEl.appendChild(todayBtn)
    }

    // 确认按钮
    if (this.options.showConfirm) {
      const confirmBtn = this.createElement(
        'button',
        'ldp-date-picker__confirm-btn',
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
   * 处理日期选择
   */
  private handleDateSelect(date: Date): void {
    if (this.options.disabled || this.options.readonly) return
    if (this.isDateDisabled(date)) return

    this.setValue(date)

    // 如果不需要确认，直接关闭
    if (!this.options.showConfirm) {
      this.close()
    }
  }

  /**
   * 判断日期是否禁用
   */
  private isDateDisabled(date: Date): boolean {
    if (!this.options.disabledDate) return false
    return this.options.disabledDate(date)
  }

  /**
   * 上一年
   */
  private gotoPrevYear(): void {
    this.currentDate = DateUtils.addYears(this.currentDate, -1)
    this.updateCalendarDates()
    this.update()
  }

  /**
   * 下一年
   */
  private gotoNextYear(): void {
    this.currentDate = DateUtils.addYears(this.currentDate, 1)
    this.updateCalendarDates()
    this.update()
  }

  /**
   * 上一月
   */
  private gotoPrevMonth(): void {
    this.currentDate = DateUtils.addMonths(this.currentDate, -1)
    this.updateCalendarDates()
    this.update()
  }

  /**
   * 下一月
   */
  private gotoNextMonth(): void {
    this.currentDate = DateUtils.addMonths(this.currentDate, 1)
    this.updateCalendarDates()
    this.update()
  }

  /**
   * 跳转到指定月份
   */
  gotoMonth(year: number, month: number): void {
    this.currentDate = new Date(year, month, 1)
    this.updateCalendarDates()
    this.update()
  }

  /**
   * 选择今天
   */
  private selectToday(): void {
    const now = new Date()
    this.currentDate = now
    this.updateCalendarDates()
    this.setValue(now)
  }

  /**
   * 设置值
   */
  setValue(value: any): void {
    const date = DateUtils.parse(value)
    if (!date) return

    super.setValue(date)
    this.currentDate = DateUtils.clone(date)
    this.updateCalendarDates()
  }

  /**
   * 获取当前显示的月份
   */
  getCurrentMonth(): { year: number; month: number } {
    return {
      year: this.currentDate.getFullYear(),
      month: this.currentDate.getMonth()
    }
  }
}
