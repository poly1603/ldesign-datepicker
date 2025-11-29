/**
 * 日期范围选择器
 * 用于选择日期范围
 */

import { RangePicker } from './base/RangePicker'
import { DateUtils } from '../utils/date'
import type { DateRangePickerOptions } from '../types/picker'

/**
 * 日期范围选择器类
 */
export class DateRangePicker extends RangePicker {
  private leftDate: Date
  private rightDate: Date
  private leftCalendarDates: Date[] = []
  private rightCalendarDates: Date[] = []

  declare protected options: DateRangePickerOptions

  /**
   * 构造函数
   */
  constructor(options: DateRangePickerOptions = {}) {
    super(options)

    // 初始化两个面板的日期
    const now = new Date()
    this.leftDate = this.startValue ? DateUtils.clone(this.startValue) : now
    this.rightDate = DateUtils.addMonths(this.leftDate, 1)

    // 生成日历数据
    this.updateCalendarDates()
  }

  /**
   * 规范化配置项
   */
  protected normalizeOptions(options: DateRangePickerOptions): DateRangePickerOptions {
    return {
      ...super.normalizeOptions(options),
      showWeekNumber: options.showWeekNumber || false,
      firstDayOfWeek: options.firstDayOfWeek ?? 1
    }
  }

  /**
   * 更新日历数据
   */
  private updateCalendarDates(): void {
    const firstDayOfWeek = this.options.firstDayOfWeek ?? 1
    this.leftCalendarDates = DateUtils.getCalendarDates(this.leftDate, firstDayOfWeek)
    this.rightCalendarDates = DateUtils.getCalendarDates(this.rightDate, firstDayOfWeek)
  }

  /**
   * 渲染 UI
   */
  protected render(): void {
    if (!this.container) return

    // 创建主容器
    const pickerEl = this.createElement('div', 'ldp-daterange-picker')

    // 添加禁用类
    if (this.options.disabled) {
      pickerEl.classList.add('ldp-daterange-picker--disabled')
    }

    // 创建面板容器（双面板）
    const panelsEl = this.createElement('div', 'ldp-daterange-picker__panels')

    // 左侧面板
    const leftPanelEl = this.createPanel('left')
    panelsEl.appendChild(leftPanelEl)

    // 右侧面板
    const rightPanelEl = this.createPanel('right')
    panelsEl.appendChild(rightPanelEl)

    pickerEl.appendChild(panelsEl)

    // 创建底部
    const footerEl = this.createFooter()
    pickerEl.appendChild(footerEl)

    this.container.appendChild(pickerEl)
  }

  /**
   * 创建面板
   */
  private createPanel(side: 'left' | 'right'): HTMLElement {
    const panelEl = this.createElement('div', `ldp-daterange-picker__panel ldp-daterange-picker__panel--${side}`)

    // 头部
    const headerEl = this.createPanelHeader(side)
    panelEl.appendChild(headerEl)

    // 星期头部
    const weekHeaderEl = this.createWeekHeader()
    panelEl.appendChild(weekHeaderEl)

    // 日历网格
    const gridEl = this.createCalendarGrid(side)
    panelEl.appendChild(gridEl)

    return panelEl
  }

  /**
   * 创建面板头部
   */
  private createPanelHeader(side: 'left' | 'right'): HTMLElement {
    const locale = this.getLocale()
    const headerEl = this.createElement('div', 'ldp-daterange-picker__header')
    const currentDate = side === 'left' ? this.leftDate : this.rightDate

    if (side === 'left') {
      // 左侧面板的导航按钮
      const prevYearBtn = this.createElement('button', 'ldp-daterange-picker__prev-year-btn', '«')
      prevYearBtn.title = locale?.buttons.prevYear || '上一年'
      prevYearBtn.onclick = () => this.gotoPrevYear()
      headerEl.appendChild(prevYearBtn)

      const prevMonthBtn = this.createElement('button', 'ldp-daterange-picker__prev-month-btn', '‹')
      prevMonthBtn.title = locale?.buttons.prevMonth || '上一月'
      prevMonthBtn.onclick = () => this.gotoPrevMonth()
      headerEl.appendChild(prevMonthBtn)
    }

    // 年月标题
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthName = locale?.months[month] || `${month + 1}月`
    const titleEl = this.createElement('div', 'ldp-daterange-picker__title', `${year}年 ${monthName}`)
    headerEl.appendChild(titleEl)

    if (side === 'right') {
      // 右侧面板的导航按钮
      const nextMonthBtn = this.createElement('button', 'ldp-daterange-picker__next-month-btn', '›')
      nextMonthBtn.title = locale?.buttons.nextMonth || '下一月'
      nextMonthBtn.onclick = () => this.gotoNextMonth()
      headerEl.appendChild(nextMonthBtn)

      const nextYearBtn = this.createElement('button', 'ldp-daterange-picker__next-year-btn', '»')
      nextYearBtn.title = locale?.buttons.nextYear || '下一年'
      nextYearBtn.onclick = () => this.gotoNextYear()
      headerEl.appendChild(nextYearBtn)
    }

    return headerEl
  }

  /**
   * 创建星期头部
   */
  private createWeekHeader(): HTMLElement {
    const locale = this.getLocale()
    const weekHeaderEl = this.createElement('div', 'ldp-daterange-picker__week-header')

    // 如果显示周数，添加空列
    if (this.options.showWeekNumber) {
      const weekNumHeaderEl = this.createElement('div', 'ldp-daterange-picker__week-number-header', '')
      weekHeaderEl.appendChild(weekNumHeaderEl)
    }

    const weekdays = locale?.weekdaysMin || ['日', '一', '二', '三', '四', '五', '六']
    const firstDayOfWeek = this.options.firstDayOfWeek ?? 1

    for (let i = 0; i < 7; i++) {
      const dayIndex = (firstDayOfWeek + i) % 7
      const dayEl = this.createElement('div', 'ldp-daterange-picker__week-day', weekdays[dayIndex])
      if (dayIndex === 0 || dayIndex === 6) {
        dayEl.classList.add('ldp-daterange-picker__week-day--weekend')
      }
      weekHeaderEl.appendChild(dayEl)
    }

    return weekHeaderEl
  }

  /**
   * 创建日历网格
   */
  private createCalendarGrid(side: 'left' | 'right'): HTMLElement {
    const gridEl = this.createElement('div', 'ldp-daterange-picker__grid')
    const calendarDates = side === 'left' ? this.leftCalendarDates : this.rightCalendarDates
    const panelDate = side === 'left' ? this.leftDate : this.rightDate

    for (let week = 0; week < 6; week++) {
      const weekEl = this.createElement('div', 'ldp-daterange-picker__week')

      // 显示周数
      if (this.options.showWeekNumber) {
        const firstDayOfWeek = calendarDates[week * 7]!
        const weekNum = DateUtils.getWeekOfYear(firstDayOfWeek)
        const weekNumEl = this.createElement('div', 'ldp-daterange-picker__week-number', String(weekNum))
        weekEl.appendChild(weekNumEl)
      }

      for (let day = 0; day < 7; day++) {
        const date = calendarDates[week * 7 + day]!
        const dayEl = this.createDayCell(date, panelDate)
        weekEl.appendChild(dayEl)
      }

      gridEl.appendChild(weekEl)
    }

    return gridEl
  }

  /**
   * 创建日期单元格
   */
  private createDayCell(date: Date, panelDate: Date): HTMLElement {
    const cellEl = this.createElement('div', 'ldp-daterange-picker__cell', String(date.getDate()))

    // 是否是当前月份
    if (!DateUtils.isSameMonth(date, panelDate)) {
      cellEl.classList.add('ldp-daterange-picker__cell--other-month')
    }

    // 是否是今天
    if (DateUtils.isToday(date)) {
      cellEl.classList.add('ldp-daterange-picker__cell--today')
    }

    // 是否是周末
    if (DateUtils.isWeekend(date)) {
      cellEl.classList.add('ldp-daterange-picker__cell--weekend')
    }

    // 是否是范围开始
    if (this.isRangeStart(date)) {
      cellEl.classList.add('ldp-daterange-picker__cell--start')
    }

    // 是否是范围结束
    if (this.isRangeEnd(date)) {
      cellEl.classList.add('ldp-daterange-picker__cell--end')
    }

    // 是否在范围内
    if (this.isInRange(date)) {
      cellEl.classList.add('ldp-daterange-picker__cell--in-range')
    }

    // 是否在悬停范围内
    if (this.isInHoverRange(date)) {
      cellEl.classList.add('ldp-daterange-picker__cell--in-hover-range')
    }

    // 检查是否禁用
    if (this.isDateDisabled(date)) {
      cellEl.classList.add('ldp-daterange-picker__cell--disabled')
      return cellEl
    }

    // 点击事件
    cellEl.onclick = () => this.handleDateSelect(date)

    // 悬停事件 - 只有在选择中状态才显示hover效果
    cellEl.onmouseenter = () => {
      if (!this.isDateDisabled(date) && this.selecting) {
        cellEl.classList.add('ldp-daterange-picker__cell--hover')
        this.handleDateHover(date)
      }
    }
    cellEl.onmouseleave = () => {
      cellEl.classList.remove('ldp-daterange-picker__cell--hover')
    }

    return cellEl
  }

  /**
   * 创建底部
   */
  private createFooter(): HTMLElement {
    const locale = this.getLocale()
    const footerEl = this.createElement('div', 'ldp-daterange-picker__footer')

    // 显示范围信息
    const infoEl = this.createElement('div', 'ldp-daterange-picker__info')
    if (this.startValue && this.endValue) {
      const days = this.getRangeDays()
      infoEl.textContent = `已选择 ${days} 天`
    } else if (this.selecting && this.startValue) {
      infoEl.textContent = locale?.texts.selectDate || '请选择结束日期'
    }
    footerEl.appendChild(infoEl)

    // 按钮组
    const buttonsEl = this.createElement('div', 'ldp-daterange-picker__buttons')

    // 清除按钮
    if (this.options.clearable !== false) {
      const clearBtn = this.createElement(
        'button',
        'ldp-daterange-picker__clear-btn',
        locale?.buttons.clear || '清除'
      )
      clearBtn.onclick = () => this.clear()
      buttonsEl.appendChild(clearBtn)
    }

    // 确认按钮
    const confirmBtn = this.createElement(
      'button',
      'ldp-daterange-picker__confirm-btn',
      locale?.buttons.confirm || '确定'
    )
    confirmBtn.onclick = () => this.confirm()
    buttonsEl.appendChild(confirmBtn)

    footerEl.appendChild(buttonsEl)

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
    this.leftDate = DateUtils.addYears(this.leftDate, -1)
    this.rightDate = DateUtils.addYears(this.rightDate, -1)
    this.updateCalendarDates()
    this.update()
  }

  /**
   * 下一年
   */
  private gotoNextYear(): void {
    this.leftDate = DateUtils.addYears(this.leftDate, 1)
    this.rightDate = DateUtils.addYears(this.rightDate, 1)
    this.updateCalendarDates()
    this.update()
  }

  /**
   * 上一月
   */
  private gotoPrevMonth(): void {
    this.leftDate = DateUtils.addMonths(this.leftDate, -1)
    this.rightDate = DateUtils.addMonths(this.rightDate, -1)
    this.updateCalendarDates()
    this.update()
  }

  /**
   * 下一月
   */
  private gotoNextMonth(): void {
    this.leftDate = DateUtils.addMonths(this.leftDate, 1)
    this.rightDate = DateUtils.addMonths(this.rightDate, 1)
    this.updateCalendarDates()
    this.update()
  }

  /**
   * 跳转到指定月份
   */
  gotoMonth(year: number, month: number): void {
    this.leftDate = new Date(year, month, 1)
    this.rightDate = DateUtils.addMonths(this.leftDate, 1)
    this.updateCalendarDates()
    this.update()
  }

  /**
   * 设置值
   */
  setValue(value: [Date | null, Date | null]): void {
    super.setValue(value)

    // 更新面板显示的日期
    if (this.startValue) {
      this.leftDate = DateUtils.clone(this.startValue)
      this.rightDate = DateUtils.addMonths(this.leftDate, 1)
      this.updateCalendarDates()
    }
  }
}
