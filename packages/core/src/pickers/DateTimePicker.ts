/**
 * 日期时间选择器
 * 左右布局：左边日期选择，右边时间选择
 */

import { BasePicker } from './base/BasePicker'
import { DateUtils } from '../utils/date'
import type { DateTimePickerOptions } from '../types/picker'

const ITEM_HEIGHT = 32

export class DateTimePicker extends BasePicker {
  private currentDate: Date
  private calendarDates: Date[] = []
  private hours: number = 0
  private minutes: number = 0
  private seconds: number = 0
  private timeColumns: Map<string, HTMLElement> = new Map()

  declare protected options: DateTimePickerOptions

  constructor(options: DateTimePickerOptions = {}) {
    super(options)

    const now = new Date()
    if (this.value) {
      const date = new Date(this.value)
      this.currentDate = DateUtils.clone(date)
      this.hours = date.getHours()
      this.minutes = date.getMinutes()
      this.seconds = date.getSeconds()
    } else {
      this.currentDate = now
      this.hours = now.getHours()
      this.minutes = now.getMinutes()
      this.seconds = now.getSeconds()
    }

    this.updateCalendarDates()
  }

  protected normalizeOptions(options: DateTimePickerOptions): DateTimePickerOptions {
    return {
      ...super.normalizeOptions(options),
      precision: options.precision || 'minute',
      timeOptions: options.timeOptions || {}
    }
  }

  private updateCalendarDates(): void {
    this.calendarDates = DateUtils.getCalendarDates(this.currentDate, 1)
  }

  protected render(): void {
    if (!this.container) return

    const pickerEl = this.createElement('div', 'ldp-datetime-picker')
    if (this.options.disabled) {
      pickerEl.classList.add('ldp-datetime-picker--disabled')
    }

    // 主内容区：左日期 + 右时间
    const contentEl = this.createElement('div', 'ldp-datetime-picker__content')

    // 左侧：日期面板
    const leftEl = this.createElement('div', 'ldp-datetime-picker__left')
    leftEl.appendChild(this.createDateHeader())
    leftEl.appendChild(this.createDatePanel())
    contentEl.appendChild(leftEl)

    // 分隔线
    const divider = this.createElement('div', 'ldp-datetime-picker__divider')
    contentEl.appendChild(divider)

    // 右侧：时间面板
    const rightEl = this.createElement('div', 'ldp-datetime-picker__right')
    rightEl.appendChild(this.createTimePanel())
    contentEl.appendChild(rightEl)

    pickerEl.appendChild(contentEl)

    // 底部
    const footerEl = this.createFooter()
    pickerEl.appendChild(footerEl)

    this.container.appendChild(pickerEl)

    // 初始化时间滚动位置
    requestAnimationFrame(() => this.initTimeScrollPositions())
  }

  private createDateHeader(): HTMLElement {
    const locale = this.getLocale()
    const headerEl = this.createElement('div', 'ldp-datetime-picker__date-header')

    const prevBtn = this.createElement('button', 'ldp-datetime-picker__nav-btn', '‹')
    prevBtn.onclick = () => this.gotoPrevMonth()
    headerEl.appendChild(prevBtn)

    const year = this.currentDate.getFullYear()
    const month = this.currentDate.getMonth()
    const monthName = locale?.monthsShort?.[month] || `${month + 1}月`
    const titleEl = this.createElement('span', 'ldp-datetime-picker__date-title', `${year}年 ${monthName}`)
    headerEl.appendChild(titleEl)

    const nextBtn = this.createElement('button', 'ldp-datetime-picker__nav-btn', '›')
    nextBtn.onclick = () => this.gotoNextMonth()
    headerEl.appendChild(nextBtn)

    return headerEl
  }

  private createDatePanel(): HTMLElement {
    const locale = this.getLocale()
    const panelEl = this.createElement('div', 'ldp-datetime-picker__date-panel')

    // 星期头部
    const weekHeaderEl = this.createElement('div', 'ldp-datetime-picker__week-header')
    const weekdays = locale?.weekdaysMin || ['日', '一', '二', '三', '四', '五', '六']
    for (let i = 0; i < 7; i++) {
      const dayIndex = (1 + i) % 7
      const dayEl = this.createElement('div', 'ldp-datetime-picker__week-day', weekdays[dayIndex])
      weekHeaderEl.appendChild(dayEl)
    }
    panelEl.appendChild(weekHeaderEl)

    // 日历网格
    const gridEl = this.createElement('div', 'ldp-datetime-picker__grid')
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const date = this.calendarDates[week * 7 + day]
        if (date) {
          gridEl.appendChild(this.createDayCell(date))
        }
      }
    }
    panelEl.appendChild(gridEl)

    return panelEl
  }

  private createDayCell(date: Date): HTMLElement {
    const cellEl = this.createElement('div', 'ldp-datetime-picker__cell', String(date.getDate()))

    if (!DateUtils.isSameMonth(date, this.currentDate)) {
      cellEl.classList.add('ldp-datetime-picker__cell--other-month')
    }
    if (DateUtils.isToday(date)) {
      cellEl.classList.add('ldp-datetime-picker__cell--today')
    }
    if (this.value && DateUtils.isSameDay(date, this.value)) {
      cellEl.classList.add('ldp-datetime-picker__cell--selected')
    }
    if (this.isDateDisabled(date)) {
      cellEl.classList.add('ldp-datetime-picker__cell--disabled')
      return cellEl
    }

    cellEl.onclick = () => this.handleDateSelect(date)
    return cellEl
  }

  private createTimePanel(): HTMLElement {
    const panelEl = this.createElement('div', 'ldp-datetime-picker__time-panel')

    // 时间显示
    const displayEl = this.createElement('div', 'ldp-datetime-picker__time-display')
    displayEl.textContent = this.getFormattedTime()
    panelEl.appendChild(displayEl)

    // 时间滚轮
    const wheelEl = this.createElement('div', 'ldp-datetime-picker__time-wheel')

    // 指示器
    const indicator = this.createElement('div', 'ldp-datetime-picker__time-indicator')
    wheelEl.appendChild(indicator)

    // 遮罩
    const maskTop = this.createElement('div', 'ldp-datetime-picker__time-mask ldp-datetime-picker__time-mask--top')
    const maskBottom = this.createElement('div', 'ldp-datetime-picker__time-mask ldp-datetime-picker__time-mask--bottom')
    wheelEl.appendChild(maskTop)
    wheelEl.appendChild(maskBottom)

    // 时间列
    const columnsEl = this.createElement('div', 'ldp-datetime-picker__time-columns')
    columnsEl.appendChild(this.createTimeColumn('hours', this.getHoursList(), this.hours))
    if (this.shouldShowMinutes()) {
      columnsEl.appendChild(this.createTimeColumn('minutes', this.getMinutesList(), this.minutes))
    }
    if (this.shouldShowSeconds()) {
      columnsEl.appendChild(this.createTimeColumn('seconds', this.getSecondsList(), this.seconds))
    }
    wheelEl.appendChild(columnsEl)

    panelEl.appendChild(wheelEl)
    return panelEl
  }

  private createTimeColumn(type: string, values: number[], selectedValue: number): HTMLElement {
    const columnEl = this.createElement('div', 'ldp-datetime-picker__time-column')
    const wrapperEl = this.createElement('div', 'ldp-datetime-picker__time-wrapper')

    // 填充项（让第一个和最后一个能滚到中间）
    for (let i = 0; i < 2; i++) {
      wrapperEl.appendChild(this.createElement('div', 'ldp-datetime-picker__time-item ldp-datetime-picker__time-item--placeholder'))
    }

    values.forEach((value) => {
      const itemEl = this.createElement('div', 'ldp-datetime-picker__time-item')
      itemEl.textContent = String(value).padStart(2, '0')
      itemEl.dataset.value = String(value)
      if (value === selectedValue) {
        itemEl.classList.add('ldp-datetime-picker__time-item--selected')
      }
      itemEl.onclick = () => this.scrollTimeToValue(type, value)
      wrapperEl.appendChild(itemEl)
    })

    for (let i = 0; i < 2; i++) {
      wrapperEl.appendChild(this.createElement('div', 'ldp-datetime-picker__time-item ldp-datetime-picker__time-item--placeholder'))
    }

    columnEl.appendChild(wrapperEl)
    columnEl.addEventListener('wheel', (e) => this.handleTimeWheel(e, type, values), { passive: false })
    this.timeColumns.set(type, wrapperEl)

    return columnEl
  }

  private createFooter(): HTMLElement {
    const locale = this.getLocale()
    const footerEl = this.createElement('div', 'ldp-datetime-picker__footer')

    const nowBtn = this.createElement('button', 'ldp-datetime-picker__now-btn', locale?.buttons.now || '此刻')
    nowBtn.onclick = () => this.selectNow()
    footerEl.appendChild(nowBtn)

    const confirmBtn = this.createElement('button', 'ldp-datetime-picker__confirm-btn', locale?.buttons.confirm || '确定')
    confirmBtn.onclick = () => this.confirm()
    footerEl.appendChild(confirmBtn)

    return footerEl
  }

  private initTimeScrollPositions(): void {
    this.scrollTimeToValue('hours', this.hours, false)
    if (this.shouldShowMinutes()) {
      this.scrollTimeToValue('minutes', this.minutes, false)
    }
    if (this.shouldShowSeconds()) {
      this.scrollTimeToValue('seconds', this.seconds, false)
    }
  }

  private scrollTimeToValue(type: string, value: number, animate = true): void {
    const wrapper = this.timeColumns.get(type)
    if (!wrapper) return

    const values = type === 'hours' ? this.getHoursList() :
      type === 'minutes' ? this.getMinutesList() : this.getSecondsList()
    const index = values.indexOf(value)
    if (index === -1) return

    const scrollTop = index * ITEM_HEIGHT
    wrapper.style.transition = animate ? 'transform 0.2s ease-out' : 'none'
    wrapper.style.transform = `translateY(-${scrollTop}px)`

    // 更新选中状态
    wrapper.querySelectorAll('.ldp-datetime-picker__time-item').forEach(item => {
      item.classList.remove('ldp-datetime-picker__time-item--selected')
      if ((item as HTMLElement).dataset.value === String(value)) {
        item.classList.add('ldp-datetime-picker__time-item--selected')
      }
    })

    // 更新值
    if (type === 'hours') this.hours = value
    else if (type === 'minutes') this.minutes = value
    else if (type === 'seconds') this.seconds = value

    this.updateTimeDisplay()
    this.updateValue()
  }

  private handleTimeWheel(e: WheelEvent, type: string, values: number[]): void {
    e.preventDefault()
    if (this.options.disabled || this.options.readonly) return

    const currentValue = type === 'hours' ? this.hours : type === 'minutes' ? this.minutes : this.seconds
    const currentIndex = values.indexOf(currentValue)
    let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1)
    newIndex = Math.max(0, Math.min(values.length - 1, newIndex))

    const newValue = values[newIndex]
    if (newIndex !== currentIndex && newValue !== undefined) {
      this.scrollTimeToValue(type, newValue)
    }
  }

  private updateTimeDisplay(): void {
    const display = this.container?.querySelector('.ldp-datetime-picker__time-display')
    if (display) {
      display.textContent = this.getFormattedTime()
    }
  }

  protected update(): void {
    if (!this.container) return
    this.timeColumns.clear()
    this.container.innerHTML = ''
    this.render()
  }

  private handleDateSelect(date: Date): void {
    if (this.options.disabled || this.options.readonly) return
    if (this.isDateDisabled(date)) return

    const newDate = DateUtils.setTime(date, this.hours, this.minutes, this.seconds)
    this.currentDate = DateUtils.clone(date)
    this.value = newDate
    this.emit('change', newDate)
    this.update()
  }

  private updateValue(): void {
    const date = DateUtils.setTime(this.currentDate, this.hours, this.minutes, this.seconds)
    this.value = date
    this.emit('change', date)
  }

  private isDateDisabled(date: Date): boolean {
    return this.options.disabledDate?.(date) || false
  }

  private gotoPrevMonth(): void {
    this.currentDate = DateUtils.addMonths(this.currentDate, -1)
    this.updateCalendarDates()
    this.update()
  }

  private gotoNextMonth(): void {
    this.currentDate = DateUtils.addMonths(this.currentDate, 1)
    this.updateCalendarDates()
    this.update()
  }

  private selectNow(): void {
    const now = new Date()
    this.currentDate = now
    this.hours = now.getHours()
    this.minutes = now.getMinutes()
    this.seconds = now.getSeconds()
    this.value = now
    this.updateCalendarDates()
    this.emit('change', now)
    this.update()
  }

  private getHoursList(): number[] {
    const hours: number[] = []
    for (let h = 0; h < 24; h++) hours.push(h)
    return hours
  }

  private getMinutesList(): number[] {
    const minutes: number[] = []
    for (let m = 0; m < 60; m++) minutes.push(m)
    return minutes
  }

  private getSecondsList(): number[] {
    const seconds: number[] = []
    for (let s = 0; s < 60; s++) seconds.push(s)
    return seconds
  }

  private shouldShowMinutes(): boolean {
    const precision = this.options.precision || 'minute'
    return precision === 'minute' || precision === 'second'
  }

  private shouldShowSeconds(): boolean {
    return (this.options.precision || 'minute') === 'second'
  }

  private getFormattedTime(): string {
    const h = String(this.hours).padStart(2, '0')
    const m = String(this.minutes).padStart(2, '0')
    const s = String(this.seconds).padStart(2, '0')
    if (this.shouldShowSeconds()) return `${h}:${m}:${s}`
    return `${h}:${m}`
  }

  setValue(value: any): void {
    const date = DateUtils.parse(value)
    if (!date) return
    this.currentDate = DateUtils.clone(date)
    this.hours = date.getHours()
    this.minutes = date.getMinutes()
    this.seconds = date.getSeconds()
    this.updateCalendarDates()
    super.setValue(date)
  }
}
