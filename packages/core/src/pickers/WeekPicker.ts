/**
 * 星期选择器
 * 用于选择整周
 */

import { BasePicker } from './base/BasePicker'
import { DateUtils } from '../utils/date'
import type { WeekPickerOptions } from '../types/picker'

/**
 * 星期选择器类
 */
export class WeekPicker extends BasePicker {
  private currentDate: Date
  private calendarDates: Date[] = []

  declare protected options: WeekPickerOptions

  /**
   * 构造函数
   */
  constructor(options: WeekPickerOptions = {}) {
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
  protected normalizeOptions(options: WeekPickerOptions): WeekPickerOptions {
    return {
      ...super.normalizeOptions(options),
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
    const pickerEl = this.createElement('div', 'ldp-week-picker')

    // 添加禁用类
    if (this.options.disabled) {
      pickerEl.classList.add('ldp-week-picker--disabled')
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
    const headerEl = this.createElement('div', 'ldp-week-picker__header')

    // 上一年按钮
    const prevYearBtn = this.createElement('button', 'ldp-week-picker__prev-year-btn', '«')
    prevYearBtn.title = locale?.buttons.prevYear || '上一年'
    prevYearBtn.onclick = () => this.gotoPrevYear()
    headerEl.appendChild(prevYearBtn)

    // 上一月按钮
    const prevMonthBtn = this.createElement('button', 'ldp-week-picker__prev-month-btn', '‹')
    prevMonthBtn.title = locale?.buttons.prevMonth || '上一月'
    prevMonthBtn.onclick = () => this.gotoPrevMonth()
    headerEl.appendChild(prevMonthBtn)

    // 年份月份标题
    const titleEl = this.createElement('div', 'ldp-week-picker__title')

    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()
    const monthName = locale?.months[month] || `${month + 1}月`

    const yearSpan = this.createElement('span', 'ldp-week-picker__year', `${year}年`)
    titleEl.appendChild(yearSpan)

    const monthSpan = this.createElement('span', 'ldp-week-picker__month', monthName)
    titleEl.appendChild(monthSpan)

    headerEl.appendChild(titleEl)

    // 下一月按钮
    const nextMonthBtn = this.createElement('button', 'ldp-week-picker__next-month-btn', '›')
    nextMonthBtn.title = locale?.buttons.nextMonth || '下一月'
    nextMonthBtn.onclick = () => this.gotoNextMonth()
    headerEl.appendChild(nextMonthBtn)

    // 下一年按钮
    const nextYearBtn = this.createElement('button', 'ldp-week-picker__next-year-btn', '»')
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
    const weekHeaderEl = this.createElement('div', 'ldp-week-picker__week-header')

    // 周数列头
    const weekNumHeaderEl = this.createElement('div', 'ldp-week-picker__week-number-header', locale?.texts.weekNumber || '周')
    weekHeaderEl.appendChild(weekNumHeaderEl)

    // 获取周几的名称
    const weekdays = locale?.weekdaysMin || ['日', '一', '二', '三', '四', '五', '六']
    const firstDayOfWeek = this.options.firstDayOfWeek ?? 1

    // 按照 firstDayOfWeek 重新排列
    for (let i = 0; i < 7; i++) {
      const dayIndex = (firstDayOfWeek + i) % 7
      const dayEl = this.createElement('div', 'ldp-week-picker__week-day', weekdays[dayIndex])
      if (dayIndex === 0 || dayIndex === 6) {
        dayEl.classList.add('ldp-week-picker__week-day--weekend')
      }
      weekHeaderEl.appendChild(dayEl)
    }

    return weekHeaderEl
  }

  /**
   * 创建日历面板
   */
  private createPanel(): HTMLElement {
    const panelEl = this.createElement('div', 'ldp-week-picker__panel')

    // 按周分组渲染（6周）
    for (let week = 0; week < 6; week++) {
      const weekRowEl = this.createWeekRow(week)
      panelEl.appendChild(weekRowEl)
    }

    return panelEl
  }

  /**
   * 创建周行
   */
  private createWeekRow(weekIndex: number): HTMLElement {
    const weekRowEl = this.createElement('div', 'ldp-week-picker__week-row')
    const firstDayOfWeek = this.calendarDates[weekIndex * 7]!
    const weekNum = DateUtils.getWeekOfYear(firstDayOfWeek)

    // 判断当前周是否被选中
    const isSelected = this.isWeekSelected(firstDayOfWeek)
    const isCurrentWeek = this.isCurrentWeek(firstDayOfWeek)
    const isDisabled = this.isWeekDisabled(firstDayOfWeek)

    if (isSelected) {
      weekRowEl.classList.add('ldp-week-picker__week-row--selected')
    }
    if (isCurrentWeek) {
      weekRowEl.classList.add('ldp-week-picker__week-row--current')
    }
    if (isDisabled) {
      weekRowEl.classList.add('ldp-week-picker__week-row--disabled')
    }

    // 周数列
    const weekNumEl = this.createElement('div', 'ldp-week-picker__week-number', String(weekNum))
    weekRowEl.appendChild(weekNumEl)

    // 渲染每天
    for (let day = 0; day < 7; day++) {
      const date = this.calendarDates[weekIndex * 7 + day]!
      const dayEl = this.createDayCell(date)
      weekRowEl.appendChild(dayEl)
    }

    // 点击事件（整行可点击）
    if (!isDisabled) {
      weekRowEl.onclick = () => this.handleWeekSelect(firstDayOfWeek)
      weekRowEl.onmouseenter = () => {
        weekRowEl.classList.add('ldp-week-picker__week-row--hover')
      }
      weekRowEl.onmouseleave = () => {
        weekRowEl.classList.remove('ldp-week-picker__week-row--hover')
      }
    }

    return weekRowEl
  }

  /**
   * 创建日期单元格
   */
  private createDayCell(date: Date): HTMLElement {
    const cellEl = this.createElement('div', 'ldp-week-picker__cell', String(date.getDate()))

    // 是否是当前月份
    const isCurrentMonth = DateUtils.isSameMonth(date, this.currentDate)
    if (!isCurrentMonth) {
      cellEl.classList.add('ldp-week-picker__cell--other-month')
    }

    // 是否是今天
    if (DateUtils.isToday(date)) {
      cellEl.classList.add('ldp-week-picker__cell--today')
    }

    // 是否是周末
    if (DateUtils.isWeekend(date)) {
      cellEl.classList.add('ldp-week-picker__cell--weekend')
    }

    return cellEl
  }

  /**
   * 创建底部
   */
  private createFooter(): HTMLElement {
    const locale = this.getLocale()
    const footerEl = this.createElement('div', 'ldp-week-picker__footer')

    // 本周按钮
    if (this.options.showToday) {
      const todayBtn = this.createElement(
        'button',
        'ldp-week-picker__today-btn',
        locale?.shortcuts.thisWeek || '本周'
      )
      todayBtn.onclick = () => this.selectThisWeek()
      footerEl.appendChild(todayBtn)
    }

    // 确认按钮
    if (this.options.showConfirm) {
      const confirmBtn = this.createElement(
        'button',
        'ldp-week-picker__confirm-btn',
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
   * 处理周选择
   */
  private handleWeekSelect(date: Date): void {
    if (this.options.disabled || this.options.readonly) return
    if (this.isWeekDisabled(date)) return

    // 获取该周的第一天
    const firstDayOfWeek = this.options.firstDayOfWeek ?? 1
    const weekStart = DateUtils.startOfWeek(date, firstDayOfWeek)
    this.setValue(weekStart)

    // 如果不需要确认，直接关闭
    if (!this.options.showConfirm) {
      this.close()
    }
  }

  /**
   * 判断周是否被选中
   */
  private isWeekSelected(date: Date): boolean {
    if (!this.value) return false

    const firstDayOfWeek = this.options.firstDayOfWeek ?? 1
    const selectedWeekStart = DateUtils.startOfWeek(this.value, firstDayOfWeek)
    const dateWeekStart = DateUtils.startOfWeek(date, firstDayOfWeek)

    return DateUtils.isSameDay(selectedWeekStart, dateWeekStart)
  }

  /**
   * 判断是否是当前周
   */
  private isCurrentWeek(date: Date): boolean {
    const firstDayOfWeek = this.options.firstDayOfWeek ?? 1
    const todayWeekStart = DateUtils.startOfWeek(new Date(), firstDayOfWeek)
    const dateWeekStart = DateUtils.startOfWeek(date, firstDayOfWeek)

    return DateUtils.isSameDay(todayWeekStart, dateWeekStart)
  }

  /**
   * 判断周是否禁用
   */
  private isWeekDisabled(date: Date): boolean {
    if (!this.options.disabledDate) return false

    // 检查该周的第一天是否被禁用
    const firstDayOfWeek = this.options.firstDayOfWeek ?? 1
    const weekStart = DateUtils.startOfWeek(date, firstDayOfWeek)
    return this.options.disabledDate(weekStart)
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
   * 选择本周
   */
  private selectThisWeek(): void {
    const now = new Date()
    this.currentDate = now
    this.updateCalendarDates()

    const firstDayOfWeek = this.options.firstDayOfWeek ?? 1
    const weekStart = DateUtils.startOfWeek(now, firstDayOfWeek)
    this.setValue(weekStart)
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
   * 获取选中周的范围
   */
  getWeekRange(): [Date, Date] | null {
    if (!this.value) return null

    const firstDayOfWeek = this.options.firstDayOfWeek ?? 1
    return DateUtils.getWeekRange(this.value, firstDayOfWeek)
  }
}
