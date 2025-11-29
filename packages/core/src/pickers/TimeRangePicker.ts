/**
 * 时间范围选择器
 * 滚轮选择器效果
 */

import { RangePicker } from './base/RangePicker'
import type { TimeRangePickerOptions } from '../types/picker'

const ITEM_HEIGHT = 32

export class TimeRangePicker extends RangePicker {
  private startHours: number = 0
  private startMinutes: number = 0
  private startSeconds: number = 0
  private endHours: number = 23
  private endMinutes: number = 59
  private endSeconds: number = 0
  private columns: Map<string, HTMLElement> = new Map()

  declare protected options: TimeRangePickerOptions

  constructor(options: TimeRangePickerOptions = {}) {
    super(options)

    const now = new Date()
    if (this.startValue) {
      this.startHours = this.startValue.getHours()
      this.startMinutes = this.startValue.getMinutes()
      this.startSeconds = this.startValue.getSeconds()
    } else {
      this.startHours = now.getHours()
      this.startMinutes = now.getMinutes()
    }

    if (this.endValue) {
      this.endHours = this.endValue.getHours()
      this.endMinutes = this.endValue.getMinutes()
      this.endSeconds = this.endValue.getSeconds()
    }
  }

  protected normalizeOptions(options: TimeRangePickerOptions): TimeRangePickerOptions {
    return {
      ...super.normalizeOptions(options),
      precision: options.precision || 'minute',
      use12Hours: options.use12Hours || false
    }
  }

  protected render(): void {
    if (!this.container) return

    const pickerEl = this.createElement('div', 'ldp-timerange-picker')
    if (this.options.disabled) {
      pickerEl.classList.add('ldp-timerange-picker--disabled')
    }

    // 双面板
    const panelsEl = this.createElement('div', 'ldp-timerange-picker__panels')
    panelsEl.appendChild(this.createTimePanel('start'))

    const arrowEl = this.createElement('div', 'ldp-timerange-picker__arrow', '→')
    panelsEl.appendChild(arrowEl)

    panelsEl.appendChild(this.createTimePanel('end'))
    pickerEl.appendChild(panelsEl)

    // 底部
    const footerEl = this.createFooter()
    pickerEl.appendChild(footerEl)

    this.container.appendChild(pickerEl)

    requestAnimationFrame(() => this.initScrollPositions())
  }

  private createTimePanel(type: 'start' | 'end'): HTMLElement {
    const locale = this.getLocale()
    const panelEl = this.createElement('div', `ldp-timerange-picker__panel ldp-timerange-picker__panel--${type}`)

    // 标题
    const titleEl = this.createElement('div', 'ldp-timerange-picker__title')
    titleEl.textContent = type === 'start' ? (locale?.texts.startTime || '开始时间') : (locale?.texts.endTime || '结束时间')
    panelEl.appendChild(titleEl)

    // 时间显示
    const displayEl = this.createElement('div', 'ldp-timerange-picker__display')
    displayEl.textContent = this.getFormattedTime(type)
    displayEl.dataset.type = type
    panelEl.appendChild(displayEl)

    // 时间滚轮
    const wheelEl = this.createElement('div', 'ldp-timerange-picker__wheel')

    const indicator = this.createElement('div', 'ldp-timerange-picker__indicator')
    wheelEl.appendChild(indicator)

    const maskTop = this.createElement('div', 'ldp-timerange-picker__mask ldp-timerange-picker__mask--top')
    const maskBottom = this.createElement('div', 'ldp-timerange-picker__mask ldp-timerange-picker__mask--bottom')
    wheelEl.appendChild(maskTop)
    wheelEl.appendChild(maskBottom)

    const columnsEl = this.createElement('div', 'ldp-timerange-picker__columns')

    const hours = type === 'start' ? this.startHours : this.endHours
    const minutes = type === 'start' ? this.startMinutes : this.endMinutes
    const seconds = type === 'start' ? this.startSeconds : this.endSeconds

    columnsEl.appendChild(this.createColumn(`${type}-hours`, this.getHoursList(), hours))
    if (this.shouldShowMinutes()) {
      columnsEl.appendChild(this.createColumn(`${type}-minutes`, this.getMinutesList(), minutes))
    }
    if (this.shouldShowSeconds()) {
      columnsEl.appendChild(this.createColumn(`${type}-seconds`, this.getSecondsList(), seconds))
    }

    wheelEl.appendChild(columnsEl)
    panelEl.appendChild(wheelEl)

    return panelEl
  }

  private createColumn(key: string, values: number[], selectedValue: number): HTMLElement {
    const columnEl = this.createElement('div', 'ldp-timerange-picker__column')
    const wrapperEl = this.createElement('div', 'ldp-timerange-picker__wrapper')

    for (let i = 0; i < 2; i++) {
      wrapperEl.appendChild(this.createElement('div', 'ldp-timerange-picker__item ldp-timerange-picker__item--placeholder'))
    }

    values.forEach((value) => {
      const itemEl = this.createElement('div', 'ldp-timerange-picker__item')
      itemEl.textContent = String(value).padStart(2, '0')
      itemEl.dataset.value = String(value)
      if (value === selectedValue) {
        itemEl.classList.add('ldp-timerange-picker__item--selected')
      }
      itemEl.onclick = () => this.scrollToValue(key, value)
      wrapperEl.appendChild(itemEl)
    })

    for (let i = 0; i < 2; i++) {
      wrapperEl.appendChild(this.createElement('div', 'ldp-timerange-picker__item ldp-timerange-picker__item--placeholder'))
    }

    columnEl.appendChild(wrapperEl)
    columnEl.addEventListener('wheel', (e) => this.handleWheel(e, key, values), { passive: false })
    this.columns.set(key, wrapperEl)

    return columnEl
  }

  private createFooter(): HTMLElement {
    const locale = this.getLocale()
    const footerEl = this.createElement('div', 'ldp-timerange-picker__footer')

    const buttonsEl = this.createElement('div', 'ldp-timerange-picker__buttons')

    if (this.options.clearable !== false) {
      const clearBtn = this.createElement('button', 'ldp-timerange-picker__clear-btn', locale?.buttons.clear || '清除')
      clearBtn.onclick = () => this.clear()
      buttonsEl.appendChild(clearBtn)
    }

    const confirmBtn = this.createElement('button', 'ldp-timerange-picker__confirm-btn', locale?.buttons.confirm || '确定')
    confirmBtn.onclick = () => this.confirm()
    buttonsEl.appendChild(confirmBtn)

    footerEl.appendChild(buttonsEl)
    return footerEl
  }

  private initScrollPositions(): void {
    this.scrollToValue('start-hours', this.startHours, false)
    this.scrollToValue('end-hours', this.endHours, false)
    if (this.shouldShowMinutes()) {
      this.scrollToValue('start-minutes', this.startMinutes, false)
      this.scrollToValue('end-minutes', this.endMinutes, false)
    }
    if (this.shouldShowSeconds()) {
      this.scrollToValue('start-seconds', this.startSeconds, false)
      this.scrollToValue('end-seconds', this.endSeconds, false)
    }
  }

  private scrollToValue(key: string, value: number, animate = true): void {
    const wrapper = this.columns.get(key)
    if (!wrapper) return

    const [type, field] = key.split('-')
    const values = field === 'hours' ? this.getHoursList() :
      field === 'minutes' ? this.getMinutesList() : this.getSecondsList()
    const index = values.indexOf(value)
    if (index === -1) return

    const scrollTop = index * ITEM_HEIGHT
    wrapper.style.transition = animate ? 'transform 0.2s ease-out' : 'none'
    wrapper.style.transform = `translateY(-${scrollTop}px)`

    wrapper.querySelectorAll('.ldp-timerange-picker__item').forEach(item => {
      item.classList.remove('ldp-timerange-picker__item--selected')
      if ((item as HTMLElement).dataset.value === String(value)) {
        item.classList.add('ldp-timerange-picker__item--selected')
      }
    })

    // 更新值
    if (type === 'start') {
      if (field === 'hours') this.startHours = value
      else if (field === 'minutes') this.startMinutes = value
      else if (field === 'seconds') this.startSeconds = value
    } else {
      if (field === 'hours') this.endHours = value
      else if (field === 'minutes') this.endMinutes = value
      else if (field === 'seconds') this.endSeconds = value
    }

    this.updateDisplays()
    this.updateValues()
  }

  private handleWheel(e: WheelEvent, key: string, values: number[]): void {
    e.preventDefault()
    if (this.options.disabled || this.options.readonly) return

    const [type, field] = key.split('-')
    let currentValue: number
    if (type === 'start') {
      currentValue = field === 'hours' ? this.startHours : field === 'minutes' ? this.startMinutes : this.startSeconds
    } else {
      currentValue = field === 'hours' ? this.endHours : field === 'minutes' ? this.endMinutes : this.endSeconds
    }

    const currentIndex = values.indexOf(currentValue)
    let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1)
    newIndex = Math.max(0, Math.min(values.length - 1, newIndex))

    const newValue = values[newIndex]
    if (newIndex !== currentIndex && newValue !== undefined) {
      this.scrollToValue(key, newValue)
    }
  }

  private updateDisplays(): void {
    const startDisplay = this.container?.querySelector('[data-type="start"]')
    const endDisplay = this.container?.querySelector('[data-type="end"]')
    if (startDisplay) startDisplay.textContent = this.getFormattedTime('start')
    if (endDisplay) endDisplay.textContent = this.getFormattedTime('end')
  }

  private updateValues(): void {
    const startDate = new Date()
    startDate.setHours(this.startHours, this.startMinutes, this.startSeconds, 0)
    this.startValue = startDate

    const endDate = new Date()
    endDate.setHours(this.endHours, this.endMinutes, this.endSeconds, 0)
    this.endValue = endDate

    this.value = [this.startValue, this.endValue]
    this.emit('change', this.value)
  }

  private getFormattedTime(type: 'start' | 'end'): string {
    const h = type === 'start' ? this.startHours : this.endHours
    const m = type === 'start' ? this.startMinutes : this.endMinutes
    const s = type === 'start' ? this.startSeconds : this.endSeconds

    const hStr = String(h).padStart(2, '0')
    const mStr = String(m).padStart(2, '0')
    const sStr = String(s).padStart(2, '0')

    if (this.shouldShowSeconds()) return `${hStr}:${mStr}:${sStr}`
    return `${hStr}:${mStr}`
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

  protected update(): void {
    if (!this.container) return
    this.columns.clear()
    this.container.innerHTML = ''
    this.render()
  }
}
