/**
 * 月份范围选择器
 */

import { RangePicker } from './base/RangePicker'
import type { MonthRangePickerOptions } from '../types/picker'

export class MonthRangePicker extends RangePicker {
  private currentYear: number

  declare protected options: MonthRangePickerOptions

  constructor(options: MonthRangePickerOptions = {}) {
    super(options)
    this.currentYear = new Date().getFullYear()
  }

  protected normalizeOptions(options: MonthRangePickerOptions): MonthRangePickerOptions {
    return {
      ...super.normalizeOptions(options),
      yearRange: options.yearRange || [1900, 2100]
    }
  }

  protected render(): void {
    if (!this.container) return

    const pickerEl = this.createElement('div', 'ldp-monthrange-picker')
    if (this.options.disabled) {
      pickerEl.classList.add('ldp-monthrange-picker--disabled')
    }

    // 双面板
    const panelsEl = this.createElement('div', 'ldp-monthrange-picker__panels')
    panelsEl.appendChild(this.createPanel(this.currentYear))
    panelsEl.appendChild(this.createPanel(this.currentYear + 1))
    pickerEl.appendChild(panelsEl)

    // 底部
    const footerEl = this.createFooter()
    pickerEl.appendChild(footerEl)

    this.container.appendChild(pickerEl)
  }

  private createPanel(year: number): HTMLElement {
    const locale = this.getLocale()
    const panelEl = this.createElement('div', 'ldp-monthrange-picker__panel')

    // 头部
    const headerEl = this.createElement('div', 'ldp-monthrange-picker__header')

    if (year === this.currentYear) {
      const prevBtn = this.createElement('button', 'ldp-monthrange-picker__nav-btn', '‹')
      prevBtn.onclick = () => this.gotoPrevYear()
      headerEl.appendChild(prevBtn)
    }

    const titleEl = this.createElement('span', 'ldp-monthrange-picker__title', `${year}年`)
    headerEl.appendChild(titleEl)

    if (year === this.currentYear + 1) {
      const nextBtn = this.createElement('button', 'ldp-monthrange-picker__nav-btn', '›')
      nextBtn.onclick = () => this.gotoNextYear()
      headerEl.appendChild(nextBtn)
    }
    panelEl.appendChild(headerEl)

    // 月份网格
    const gridEl = this.createElement('div', 'ldp-monthrange-picker__grid')
    const months = locale?.monthsShort || ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

    for (let m = 0; m < 12; m++) {
      const monthEl = this.createMonthCell(year, m, months[m] || `${m + 1}月`)
      gridEl.appendChild(monthEl)
    }
    panelEl.appendChild(gridEl)

    return panelEl
  }

  private createMonthCell(year: number, month: number, label: string): HTMLElement {
    const cellEl = this.createElement('div', 'ldp-monthrange-picker__cell', label)
    const monthDate = new Date(year, month, 1)
    const now = new Date()

    // 当前月
    if (year === now.getFullYear() && month === now.getMonth()) {
      cellEl.classList.add('ldp-monthrange-picker__cell--current')
    }

    // 范围开始
    if (this.startValue &&
      this.startValue.getFullYear() === year &&
      this.startValue.getMonth() === month) {
      cellEl.classList.add('ldp-monthrange-picker__cell--start')
    }

    // 范围结束
    if (this.endValue &&
      this.endValue.getFullYear() === year &&
      this.endValue.getMonth() === month) {
      cellEl.classList.add('ldp-monthrange-picker__cell--end')
    }

    // 在范围内
    if (this.isMonthInRange(year, month)) {
      cellEl.classList.add('ldp-monthrange-picker__cell--in-range')
    }

    // 悬停范围
    if (this.isMonthInHoverRange(year, month)) {
      cellEl.classList.add('ldp-monthrange-picker__cell--in-hover-range')
    }

    // 禁用检查
    if (this.isMonthDisabled(year, month)) {
      cellEl.classList.add('ldp-monthrange-picker__cell--disabled')
      return cellEl
    }

    cellEl.onclick = () => this.handleDateSelect(monthDate)

    cellEl.onmouseenter = () => {
      if (this.selecting) {
        cellEl.classList.add('ldp-monthrange-picker__cell--hover')
        this.handleDateHover(monthDate)
      }
    }
    cellEl.onmouseleave = () => {
      cellEl.classList.remove('ldp-monthrange-picker__cell--hover')
    }

    return cellEl
  }

  private createFooter(): HTMLElement {
    const locale = this.getLocale()
    const footerEl = this.createElement('div', 'ldp-monthrange-picker__footer')

    const infoEl = this.createElement('div', 'ldp-monthrange-picker__info')
    if (this.startValue && this.endValue) {
      const months = this.getMonthCount()
      infoEl.textContent = `已选择 ${months} 个月`
    } else if (this.selecting && this.startValue) {
      infoEl.textContent = '请选择结束月份'
    }
    footerEl.appendChild(infoEl)

    const buttonsEl = this.createElement('div', 'ldp-monthrange-picker__buttons')

    if (this.options.clearable !== false) {
      const clearBtn = this.createElement('button', 'ldp-monthrange-picker__clear-btn', locale?.buttons.clear || '清除')
      clearBtn.onclick = () => this.clear()
      buttonsEl.appendChild(clearBtn)
    }

    const confirmBtn = this.createElement('button', 'ldp-monthrange-picker__confirm-btn', locale?.buttons.confirm || '确定')
    confirmBtn.onclick = () => this.confirm()
    buttonsEl.appendChild(confirmBtn)

    footerEl.appendChild(buttonsEl)
    return footerEl
  }

  private getMonthCount(): number {
    if (!this.startValue || !this.endValue) return 0
    const startMonths = this.startValue.getFullYear() * 12 + this.startValue.getMonth()
    const endMonths = this.endValue.getFullYear() * 12 + this.endValue.getMonth()
    return endMonths - startMonths + 1
  }

  private isMonthInRange(year: number, month: number): boolean {
    if (!this.startValue || !this.endValue) return false
    const current = year * 12 + month
    const start = this.startValue.getFullYear() * 12 + this.startValue.getMonth()
    const end = this.endValue.getFullYear() * 12 + this.endValue.getMonth()
    return current > start && current < end
  }

  private isMonthInHoverRange(year: number, month: number): boolean {
    if (!this.selecting || !this.startValue || !this.hoverValue) return false
    const current = year * 12 + month
    const start = this.startValue.getFullYear() * 12 + this.startValue.getMonth()
    const hover = this.hoverValue.getFullYear() * 12 + this.hoverValue.getMonth()
    const min = Math.min(start, hover)
    const max = Math.max(start, hover)
    return current > min && current < max
  }

  private isMonthDisabled(year: number, month: number): boolean {
    const [minYear, maxYear] = this.options.yearRange || [1900, 2100]
    if (year < minYear || year > maxYear) return true
    if (this.options.disabledDate) {
      return this.options.disabledDate(new Date(year, month, 1))
    }
    return false
  }

  private gotoPrevYear(): void {
    this.currentYear--
    this.update()
  }

  private gotoNextYear(): void {
    this.currentYear++
    this.update()
  }

  protected update(): void {
    if (!this.container) return
    this.container.innerHTML = ''
    this.render()
  }
}
