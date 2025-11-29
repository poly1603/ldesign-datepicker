/**
 * 日期时间范围选择器
 * 左右布局双面板
 */

import { RangePicker } from './base/RangePicker'
import { DateUtils } from '../utils/date'
import type { DateTimeRangePickerOptions } from '../types/picker'

const ITEM_HEIGHT = 28

export class DateTimeRangePicker extends RangePicker {
  private leftDate: Date
  private rightDate: Date
  private leftCalendarDates: Date[] = []
  private rightCalendarDates: Date[] = []
  private startHours: number = 0
  private startMinutes: number = 0
  private endHours: number = 23
  private endMinutes: number = 59
  private timeColumns: Map<string, HTMLElement> = new Map()

  declare protected options: DateTimeRangePickerOptions

  constructor(options: DateTimeRangePickerOptions = {}) {
    super(options)

    const now = new Date()
    this.leftDate = this.startValue ? DateUtils.clone(this.startValue) : now
    this.rightDate = DateUtils.addMonths(this.leftDate, 1)

    if (this.startValue) {
      this.startHours = this.startValue.getHours()
      this.startMinutes = this.startValue.getMinutes()
    }
    if (this.endValue) {
      this.endHours = this.endValue.getHours()
      this.endMinutes = this.endValue.getMinutes()
    }

    this.updateCalendarDates()
  }

  protected normalizeOptions(options: DateTimeRangePickerOptions): DateTimeRangePickerOptions {
    return {
      ...super.normalizeOptions(options),
      precision: options.precision || 'minute'
    }
  }

  private updateCalendarDates(): void {
    this.leftCalendarDates = DateUtils.getCalendarDates(this.leftDate, 1)
    this.rightCalendarDates = DateUtils.getCalendarDates(this.rightDate, 1)
  }

  protected render(): void {
    if (!this.container) return

    const pickerEl = this.createElement('div', 'ldp-datetimerange-picker')
    if (this.options.disabled) {
      pickerEl.classList.add('ldp-datetimerange-picker--disabled')
    }

    // 主内容区
    const contentEl = this.createElement('div', 'ldp-datetimerange-picker__content')

    // 左面板：开始日期+时间
    const leftPanel = this.createPanel('start', this.leftDate, this.leftCalendarDates)
    contentEl.appendChild(leftPanel)

    // 分隔
    const divider = this.createElement('div', 'ldp-datetimerange-picker__divider')
    contentEl.appendChild(divider)

    // 右面板：结束日期+时间
    const rightPanel = this.createPanel('end', this.rightDate, this.rightCalendarDates)
    contentEl.appendChild(rightPanel)

    pickerEl.appendChild(contentEl)

    // 底部
    const footerEl = this.createFooter()
    pickerEl.appendChild(footerEl)

    this.container.appendChild(pickerEl)

    requestAnimationFrame(() => this.initTimeScrollPositions())
  }

  private createPanel(type: 'start' | 'end', panelDate: Date, calendarDates: Date[]): HTMLElement {
    const locale = this.getLocale()
    const panelEl = this.createElement('div', `ldp-datetimerange-picker__panel ldp-datetimerange-picker__panel--${type}`)

    // 标题
    const titleEl = this.createElement('div', 'ldp-datetimerange-picker__panel-title')
    titleEl.textContent = type === 'start' ? '开始' : '结束'
    panelEl.appendChild(titleEl)

    // 日期头部
    const headerEl = this.createElement('div', 'ldp-datetimerange-picker__header')

    if (type === 'start') {
      const prevBtn = this.createElement('button', 'ldp-datetimerange-picker__nav-btn', '‹')
      prevBtn.onclick = () => this.gotoPrevMonth()
      headerEl.appendChild(prevBtn)
    }

    const year = panelDate.getFullYear()
    const month = panelDate.getMonth()
    const monthName = locale?.monthsShort?.[month] || `${month + 1}月`
    const dateTitleEl = this.createElement('span', 'ldp-datetimerange-picker__date-title', `${year}年 ${monthName}`)
    headerEl.appendChild(dateTitleEl)

    if (type === 'end') {
      const nextBtn = this.createElement('button', 'ldp-datetimerange-picker__nav-btn', '›')
      nextBtn.onclick = () => this.gotoNextMonth()
      headerEl.appendChild(nextBtn)
    }

    panelEl.appendChild(headerEl)

    // 星期头部
    const weekHeaderEl = this.createElement('div', 'ldp-datetimerange-picker__week-header')
    const weekdays = locale?.weekdaysMin || ['日', '一', '二', '三', '四', '五', '六']
    for (let i = 0; i < 7; i++) {
      const dayIndex = (1 + i) % 7
      weekHeaderEl.appendChild(this.createElement('div', 'ldp-datetimerange-picker__week-day', weekdays[dayIndex]))
    }
    panelEl.appendChild(weekHeaderEl)

    // 日历网格
    const gridEl = this.createElement('div', 'ldp-datetimerange-picker__grid')
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const date = calendarDates[week * 7 + day]
        if (date) {
          gridEl.appendChild(this.createDayCell(date, panelDate))
        }
      }
    }
    panelEl.appendChild(gridEl)

    // 时间选择
    const timeEl = this.createTimeSelector(type)
    panelEl.appendChild(timeEl)

    return panelEl
  }

  private createDayCell(date: Date, panelDate: Date): HTMLElement {
    const cellEl = this.createElement('div', 'ldp-datetimerange-picker__cell', String(date.getDate()))

    if (!DateUtils.isSameMonth(date, panelDate)) {
      cellEl.classList.add('ldp-datetimerange-picker__cell--other-month')
    }
    if (DateUtils.isToday(date)) {
      cellEl.classList.add('ldp-datetimerange-picker__cell--today')
    }
    if (this.isRangeStart(date)) {
      cellEl.classList.add('ldp-datetimerange-picker__cell--start')
    }
    if (this.isRangeEnd(date)) {
      cellEl.classList.add('ldp-datetimerange-picker__cell--end')
    }
    if (this.isInRange(date)) {
      cellEl.classList.add('ldp-datetimerange-picker__cell--in-range')
    }
    if (this.isInHoverRange(date)) {
      cellEl.classList.add('ldp-datetimerange-picker__cell--in-hover-range')
    }
    if (this.isDateDisabled(date)) {
      cellEl.classList.add('ldp-datetimerange-picker__cell--disabled')
      return cellEl
    }

    cellEl.onclick = () => this.handleDateSelect(date)
    cellEl.onmouseenter = () => {
      if (this.selecting) {
        cellEl.classList.add('ldp-datetimerange-picker__cell--hover')
        this.handleDateHover(date)
      }
    }
    cellEl.onmouseleave = () => {
      cellEl.classList.remove('ldp-datetimerange-picker__cell--hover')
    }

    return cellEl
  }

  private createTimeSelector(type: 'start' | 'end'): HTMLElement {
    const timeEl = this.createElement('div', 'ldp-datetimerange-picker__time')

    const hours = type === 'start' ? this.startHours : this.endHours
    const minutes = type === 'start' ? this.startMinutes : this.endMinutes

    // 时间显示
    const displayEl = this.createElement('div', 'ldp-datetimerange-picker__time-display')
    displayEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    displayEl.dataset.type = type
    timeEl.appendChild(displayEl)

    // 滚轮容器
    const wheelEl = this.createElement('div', 'ldp-datetimerange-picker__time-wheel')

    const indicator = this.createElement('div', 'ldp-datetimerange-picker__time-indicator')
    wheelEl.appendChild(indicator)

    const columnsEl = this.createElement('div', 'ldp-datetimerange-picker__time-columns')
    columnsEl.appendChild(this.createTimeColumn(`${type}-hours`, this.getHoursList(), hours))
    columnsEl.appendChild(this.createTimeColumn(`${type}-minutes`, this.getMinutesList(), minutes))
    wheelEl.appendChild(columnsEl)

    timeEl.appendChild(wheelEl)
    return timeEl
  }

  private createTimeColumn(key: string, values: number[], selectedValue: number): HTMLElement {
    const columnEl = this.createElement('div', 'ldp-datetimerange-picker__time-column')
    const wrapperEl = this.createElement('div', 'ldp-datetimerange-picker__time-wrapper')

    for (let i = 0; i < 2; i++) {
      wrapperEl.appendChild(this.createElement('div', 'ldp-datetimerange-picker__time-item ldp-datetimerange-picker__time-item--placeholder'))
    }

    values.forEach((value) => {
      const itemEl = this.createElement('div', 'ldp-datetimerange-picker__time-item')
      itemEl.textContent = String(value).padStart(2, '0')
      itemEl.dataset.value = String(value)
      if (value === selectedValue) {
        itemEl.classList.add('ldp-datetimerange-picker__time-item--selected')
      }
      itemEl.onclick = () => this.scrollTimeToValue(key, value)
      wrapperEl.appendChild(itemEl)
    })

    for (let i = 0; i < 2; i++) {
      wrapperEl.appendChild(this.createElement('div', 'ldp-datetimerange-picker__time-item ldp-datetimerange-picker__time-item--placeholder'))
    }

    columnEl.appendChild(wrapperEl)
    columnEl.addEventListener('wheel', (e) => this.handleTimeWheel(e, key, values), { passive: false })
    this.timeColumns.set(key, wrapperEl)

    return columnEl
  }

  private createFooter(): HTMLElement {
    const locale = this.getLocale()
    const footerEl = this.createElement('div', 'ldp-datetimerange-picker__footer')

    const infoEl = this.createElement('div', 'ldp-datetimerange-picker__info')
    if (this.startValue && this.endValue) {
      const days = this.getRangeDays()
      infoEl.textContent = `已选择 ${days} 天`
    } else if (this.selecting && this.startValue) {
      infoEl.textContent = '请选择结束日期时间'
    }
    footerEl.appendChild(infoEl)

    const buttonsEl = this.createElement('div', 'ldp-datetimerange-picker__buttons')

    if (this.options.clearable !== false) {
      const clearBtn = this.createElement('button', 'ldp-datetimerange-picker__clear-btn', locale?.buttons.clear || '清除')
      clearBtn.onclick = () => this.clear()
      buttonsEl.appendChild(clearBtn)
    }

    const confirmBtn = this.createElement('button', 'ldp-datetimerange-picker__confirm-btn', locale?.buttons.confirm || '确定')
    confirmBtn.onclick = () => this.confirm()
    buttonsEl.appendChild(confirmBtn)

    footerEl.appendChild(buttonsEl)
    return footerEl
  }

  private initTimeScrollPositions(): void {
    this.scrollTimeToValue('start-hours', this.startHours, false)
    this.scrollTimeToValue('start-minutes', this.startMinutes, false)
    this.scrollTimeToValue('end-hours', this.endHours, false)
    this.scrollTimeToValue('end-minutes', this.endMinutes, false)
  }

  private scrollTimeToValue(key: string, value: number, animate = true): void {
    const wrapper = this.timeColumns.get(key)
    if (!wrapper) return

    const [type, field] = key.split('-')
    const values = field === 'hours' ? this.getHoursList() : this.getMinutesList()
    const index = values.indexOf(value)
    if (index === -1) return

    const scrollTop = index * ITEM_HEIGHT
    wrapper.style.transition = animate ? 'transform 0.2s ease-out' : 'none'
    wrapper.style.transform = `translateY(-${scrollTop}px)`

    wrapper.querySelectorAll('.ldp-datetimerange-picker__time-item').forEach(item => {
      item.classList.remove('ldp-datetimerange-picker__time-item--selected')
      if ((item as HTMLElement).dataset.value === String(value)) {
        item.classList.add('ldp-datetimerange-picker__time-item--selected')
      }
    })

    if (type === 'start') {
      if (field === 'hours') this.startHours = value
      else if (field === 'minutes') this.startMinutes = value
    } else {
      if (field === 'hours') this.endHours = value
      else if (field === 'minutes') this.endMinutes = value
    }

    this.updateTimeDisplays()
    this.updateDateTimeValues()
  }

  private handleTimeWheel(e: WheelEvent, key: string, values: number[]): void {
    e.preventDefault()
    if (this.options.disabled || this.options.readonly) return

    const [type, field] = key.split('-')
    let currentValue: number
    if (type === 'start') {
      currentValue = field === 'hours' ? this.startHours : this.startMinutes
    } else {
      currentValue = field === 'hours' ? this.endHours : this.endMinutes
    }

    const currentIndex = values.indexOf(currentValue)
    let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1)
    newIndex = Math.max(0, Math.min(values.length - 1, newIndex))

    const newValue = values[newIndex]
    if (newIndex !== currentIndex && newValue !== undefined) {
      this.scrollTimeToValue(key, newValue)
    }
  }

  private updateTimeDisplays(): void {
    const startDisplay = this.container?.querySelector('[data-type="start"]')
    const endDisplay = this.container?.querySelector('[data-type="end"]')
    if (startDisplay) {
      startDisplay.textContent = `${String(this.startHours).padStart(2, '0')}:${String(this.startMinutes).padStart(2, '0')}`
    }
    if (endDisplay) {
      endDisplay.textContent = `${String(this.endHours).padStart(2, '0')}:${String(this.endMinutes).padStart(2, '0')}`
    }
  }

  private updateDateTimeValues(): void {
    if (this.startValue) {
      this.startValue = DateUtils.setTime(this.startValue, this.startHours, this.startMinutes, 0)
    }
    if (this.endValue) {
      this.endValue = DateUtils.setTime(this.endValue, this.endHours, this.endMinutes, 0)
    }
    this.value = [this.startValue, this.endValue]
    this.emit('change', this.value)
  }

  private isDateDisabled(date: Date): boolean {
    return this.options.disabledDate?.(date) || false
  }

  private gotoPrevMonth(): void {
    this.leftDate = DateUtils.addMonths(this.leftDate, -1)
    this.rightDate = DateUtils.addMonths(this.rightDate, -1)
    this.updateCalendarDates()
    this.update()
  }

  private gotoNextMonth(): void {
    this.leftDate = DateUtils.addMonths(this.leftDate, 1)
    this.rightDate = DateUtils.addMonths(this.rightDate, 1)
    this.updateCalendarDates()
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

  protected update(): void {
    if (!this.container) return
    this.timeColumns.clear()
    this.container.innerHTML = ''
    this.render()
  }

  setValue(value: [Date | null, Date | null]): void {
    super.setValue(value)
    if (this.startValue) {
      this.leftDate = DateUtils.clone(this.startValue)
      this.rightDate = DateUtils.addMonths(this.leftDate, 1)
      this.startHours = this.startValue.getHours()
      this.startMinutes = this.startValue.getMinutes()
      this.updateCalendarDates()
    }
    if (this.endValue) {
      this.endHours = this.endValue.getHours()
      this.endMinutes = this.endValue.getMinutes()
    }
  }
}
