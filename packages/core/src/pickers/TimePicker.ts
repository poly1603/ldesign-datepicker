/**
 * 时间选择器
 * 滚轮选择器效果，选中项居中显示
 */

import { BasePicker } from './base/BasePicker'
import { DateUtils } from '../utils/date'
import type { TimePickerOptions } from '../types/picker'

const ITEM_HEIGHT = 40 // 每个选项的高度
const VISIBLE_ITEMS = 5 // 可见选项数量

/**
 * 时间选择器类
 */
export class TimePicker extends BasePicker {
  private hours: number = 0
  private minutes: number = 0
  private seconds: number = 0
  private columns: Map<string, HTMLElement> = new Map()

  declare protected options: TimePickerOptions

  constructor(options: TimePickerOptions = {}) {
    super(options)

    // 初始化时间
    if (this.value) {
      const date = new Date(this.value)
      this.hours = date.getHours()
      this.minutes = date.getMinutes()
      this.seconds = date.getSeconds()
    } else {
      const now = new Date()
      this.hours = now.getHours()
      this.minutes = now.getMinutes()
      this.seconds = now.getSeconds()
    }
  }

  protected normalizeOptions(options: TimePickerOptions): TimePickerOptions {
    return {
      ...super.normalizeOptions(options),
      precision: options.precision || 'second',
      use12Hours: options.use12Hours || false,
      hourStep: options.hourStep || 1,
      minuteStep: options.minuteStep || 1,
      secondStep: options.secondStep || 1
    }
  }

  protected render(): void {
    if (!this.container) return

    const pickerEl = this.createElement('div', 'ldp-time-picker')
    if (this.options.disabled) {
      pickerEl.classList.add('ldp-time-picker--disabled')
    }

    // 创建面板
    const panelEl = this.createPanel()
    pickerEl.appendChild(panelEl)

    // 创建底部
    const footerEl = this.createFooter()
    pickerEl.appendChild(footerEl)

    this.container.appendChild(pickerEl)

    // 初始化滚动位置
    requestAnimationFrame(() => this.initScrollPositions())
  }

  private createPanel(): HTMLElement {
    const panelEl = this.createElement('div', 'ldp-time-picker__panel')

    // 选中指示器（中间高亮区域）
    const indicator = this.createElement('div', 'ldp-time-picker__indicator')
    panelEl.appendChild(indicator)

    // 渐变遮罩
    const maskTop = this.createElement('div', 'ldp-time-picker__mask ldp-time-picker__mask--top')
    const maskBottom = this.createElement('div', 'ldp-time-picker__mask ldp-time-picker__mask--bottom')
    panelEl.appendChild(maskTop)
    panelEl.appendChild(maskBottom)

    // 时间列容器
    const columnsEl = this.createElement('div', 'ldp-time-picker__columns')

    // 小时列
    columnsEl.appendChild(this.createColumn('hours', this.getHoursList(), this.hours))

    // 分钟列
    if (this.shouldShowMinutes()) {
      columnsEl.appendChild(this.createColumn('minutes', this.getMinutesList(), this.minutes))
    }

    // 秒列
    if (this.shouldShowSeconds()) {
      columnsEl.appendChild(this.createColumn('seconds', this.getSecondsList(), this.seconds))
    }

    panelEl.appendChild(columnsEl)
    return panelEl
  }

  private createColumn(type: string, values: number[], selectedValue: number): HTMLElement {
    const columnEl = this.createElement('div', `ldp-time-picker__column`)
    const wrapperEl = this.createElement('div', 'ldp-time-picker__wrapper')

    // 上下留白（让第一个和最后一个能滚动到中间）
    const paddingItems = Math.floor(VISIBLE_ITEMS / 2)

    // 上部填充
    for (let i = 0; i < paddingItems; i++) {
      const padEl = this.createElement('div', 'ldp-time-picker__item ldp-time-picker__item--placeholder')
      wrapperEl.appendChild(padEl)
    }

    // 时间选项
    values.forEach((value, index) => {
      const itemEl = this.createElement('div', 'ldp-time-picker__item')
      itemEl.textContent = String(value).padStart(2, '0')
      itemEl.dataset.value = String(value)
      itemEl.dataset.index = String(index)

      if (value === selectedValue) {
        itemEl.classList.add('ldp-time-picker__item--selected')
      }

      if (this.isTimeDisabled(type, value)) {
        itemEl.classList.add('ldp-time-picker__item--disabled')
      } else {
        itemEl.onclick = () => this.scrollToValue(type, value)
      }

      wrapperEl.appendChild(itemEl)
    })

    // 下部填充
    for (let i = 0; i < paddingItems; i++) {
      const padEl = this.createElement('div', 'ldp-time-picker__item ldp-time-picker__item--placeholder')
      wrapperEl.appendChild(padEl)
    }

    columnEl.appendChild(wrapperEl)

    // 绑定滚轮事件
    columnEl.addEventListener('wheel', (e) => this.handleWheel(e, type, values), { passive: false })

    // 存储引用
    this.columns.set(type, wrapperEl)

    return columnEl
  }

  private createFooter(): HTMLElement {
    const locale = this.getLocale()
    const footerEl = this.createElement('div', 'ldp-time-picker__footer')

    if (this.options.showNow) {
      const nowBtn = this.createElement('button', 'ldp-time-picker__now-btn', locale?.buttons.now || '此刻')
      nowBtn.onclick = () => this.selectNow()
      footerEl.appendChild(nowBtn)
    }

    if (this.options.showConfirm !== false) {
      const confirmBtn = this.createElement('button', 'ldp-time-picker__confirm-btn', locale?.buttons.confirm || '确定')
      confirmBtn.onclick = () => this.confirm()
      footerEl.appendChild(confirmBtn)
    }

    return footerEl
  }

  private initScrollPositions(): void {
    this.scrollToValue('hours', this.hours, false)
    if (this.shouldShowMinutes()) {
      this.scrollToValue('minutes', this.minutes, false)
    }
    if (this.shouldShowSeconds()) {
      this.scrollToValue('seconds', this.seconds, false)
    }
  }

  private scrollToValue(type: string, value: number, animate = true): void {
    const wrapper = this.columns.get(type)
    if (!wrapper) return

    const values = type === 'hours' ? this.getHoursList() :
      type === 'minutes' ? this.getMinutesList() : this.getSecondsList()
    const index = values.indexOf(value)
    if (index === -1) return

    const scrollTop = index * ITEM_HEIGHT

    if (animate) {
      wrapper.style.transition = 'transform 0.3s ease-out'
    } else {
      wrapper.style.transition = 'none'
    }

    wrapper.style.transform = `translateY(-${scrollTop}px)`

    // 更新选中状态
    this.updateSelection(type, value)

    // 更新值
    if (type === 'hours') this.hours = value
    else if (type === 'minutes') this.minutes = value
    else if (type === 'seconds') this.seconds = value

    this.updateValue()
  }

  private updateSelection(type: string, value: number): void {
    const wrapper = this.columns.get(type)
    if (!wrapper) return

    wrapper.querySelectorAll('.ldp-time-picker__item').forEach(item => {
      item.classList.remove('ldp-time-picker__item--selected')
      if ((item as HTMLElement).dataset.value === String(value)) {
        item.classList.add('ldp-time-picker__item--selected')
      }
    })
  }

  private handleWheel(e: WheelEvent, type: string, values: number[]): void {
    e.preventDefault()
    if (this.options.disabled || this.options.readonly) return

    const currentValue = type === 'hours' ? this.hours :
      type === 'minutes' ? this.minutes : this.seconds
    const currentIndex = values.indexOf(currentValue)

    let newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1)
    newIndex = Math.max(0, Math.min(values.length - 1, newIndex))

    const newValue = values[newIndex]
    if (newIndex !== currentIndex && newValue !== undefined && !this.isTimeDisabled(type, newValue)) {
      this.scrollToValue(type, newValue)
    }
  }

  protected update(): void {
    if (!this.container) return
    this.columns.clear()
    this.container.innerHTML = ''
    this.render()
  }

  private updateValue(): void {
    const date = new Date()
    date.setHours(this.hours, this.minutes, this.seconds, 0)
    this.value = date
    this.emit('change', date)
  }

  private getHoursList(): number[] {
    const step = this.options.hourStep || 1
    const hours: number[] = []
    for (let h = 0; h < 24; h += step) {
      hours.push(h)
    }
    return hours
  }

  private getMinutesList(): number[] {
    const step = this.options.minuteStep || 1
    const minutes: number[] = []
    for (let m = 0; m < 60; m += step) {
      minutes.push(m)
    }
    return minutes
  }

  private getSecondsList(): number[] {
    const step = this.options.secondStep || 1
    const seconds: number[] = []
    for (let s = 0; s < 60; s += step) {
      seconds.push(s)
    }
    return seconds
  }

  private shouldShowMinutes(): boolean {
    const precision = this.options.precision || 'second'
    return precision === 'minute' || precision === 'second'
  }

  private shouldShowSeconds(): boolean {
    const precision = this.options.precision || 'second'
    return precision === 'second'
  }

  private isTimeDisabled(type: string, value: number): boolean {
    if (type === 'hours' && this.options.disabledHours) {
      return this.options.disabledHours().includes(value)
    }
    if (type === 'minutes' && this.options.disabledMinutes) {
      return this.options.disabledMinutes(this.hours).includes(value)
    }
    if (type === 'seconds' && this.options.disabledSeconds) {
      return this.options.disabledSeconds(this.hours, this.minutes).includes(value)
    }
    return false
  }

  private selectNow(): void {
    const now = new Date()
    this.hours = now.getHours()
    this.minutes = now.getMinutes()
    this.seconds = now.getSeconds()
    this.initScrollPositions()
    this.updateValue()
  }

  setValue(value: any): void {
    const date = DateUtils.parse(value)
    if (!date) return
    this.hours = date.getHours()
    this.minutes = date.getMinutes()
    this.seconds = date.getSeconds()
    super.setValue(date)
  }

  getFormattedTime(): string {
    const h = String(this.hours).padStart(2, '0')
    const m = String(this.minutes).padStart(2, '0')
    const s = String(this.seconds).padStart(2, '0')
    const precision = this.options.precision || 'second'
    if (precision === 'hour') return h
    if (precision === 'minute') return `${h}:${m}`
    return `${h}:${m}:${s}`
  }

  setTime(hours: number, minutes: number, seconds: number = 0): void {
    this.hours = Math.max(0, Math.min(23, hours))
    this.minutes = Math.max(0, Math.min(59, minutes))
    this.seconds = Math.max(0, Math.min(59, seconds))
    this.initScrollPositions()
    this.updateValue()
  }
}
