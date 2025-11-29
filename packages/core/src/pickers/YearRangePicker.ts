/**
 * 年份范围选择器
 */

import { RangePicker } from './base/RangePicker'
import type { YearRangePickerOptions } from '../types/picker'

export class YearRangePicker extends RangePicker {
  private startYear: number
  private yearList: number[] = []

  declare protected options: YearRangePickerOptions

  constructor(options: YearRangePickerOptions = {}) {
    super(options)

    const now = new Date()
    this.startYear = Math.floor(now.getFullYear() / 12) * 12
    this.updateYearList()
  }

  protected normalizeOptions(options: YearRangePickerOptions): YearRangePickerOptions {
    return {
      ...super.normalizeOptions(options),
      yearRange: options.yearRange || [1900, 2100]
    }
  }

  private updateYearList(): void {
    this.yearList = []
    for (let i = 0; i < 12; i++) {
      this.yearList.push(this.startYear + i)
    }
  }

  protected render(): void {
    if (!this.container) return

    const pickerEl = this.createElement('div', 'ldp-yearrange-picker')
    if (this.options.disabled) {
      pickerEl.classList.add('ldp-yearrange-picker--disabled')
    }

    // 头部
    const headerEl = this.createHeader()
    pickerEl.appendChild(headerEl)

    // 年份网格
    const gridEl = this.createYearGrid()
    pickerEl.appendChild(gridEl)

    // 底部
    const footerEl = this.createFooter()
    pickerEl.appendChild(footerEl)

    this.container.appendChild(pickerEl)
  }

  private createHeader(): HTMLElement {
    const headerEl = this.createElement('div', 'ldp-yearrange-picker__header')

    const prevBtn = this.createElement('button', 'ldp-yearrange-picker__nav-btn', '‹')
    prevBtn.onclick = () => this.gotoPrevDecade()
    headerEl.appendChild(prevBtn)

    const endYear = this.startYear + 11
    const titleEl = this.createElement('span', 'ldp-yearrange-picker__title', `${this.startYear} - ${endYear}`)
    headerEl.appendChild(titleEl)

    const nextBtn = this.createElement('button', 'ldp-yearrange-picker__nav-btn', '›')
    nextBtn.onclick = () => this.gotoNextDecade()
    headerEl.appendChild(nextBtn)

    return headerEl
  }

  private createYearGrid(): HTMLElement {
    const gridEl = this.createElement('div', 'ldp-yearrange-picker__grid')

    this.yearList.forEach(year => {
      const yearEl = this.createYearCell(year)
      gridEl.appendChild(yearEl)
    })

    return gridEl
  }

  private createYearCell(year: number): HTMLElement {
    const cellEl = this.createElement('div', 'ldp-yearrange-picker__cell', String(year))
    const yearDate = new Date(year, 0, 1)

    // 当前年
    if (year === new Date().getFullYear()) {
      cellEl.classList.add('ldp-yearrange-picker__cell--current')
    }

    // 范围开始
    if (this.startValue && this.startValue.getFullYear() === year) {
      cellEl.classList.add('ldp-yearrange-picker__cell--start')
    }

    // 范围结束
    if (this.endValue && this.endValue.getFullYear() === year) {
      cellEl.classList.add('ldp-yearrange-picker__cell--end')
    }

    // 在范围内
    if (this.isYearInRange(year)) {
      cellEl.classList.add('ldp-yearrange-picker__cell--in-range')
    }

    // 悬停范围
    if (this.isYearInHoverRange(year)) {
      cellEl.classList.add('ldp-yearrange-picker__cell--in-hover-range')
    }

    // 禁用检查
    if (this.isYearDisabled(year)) {
      cellEl.classList.add('ldp-yearrange-picker__cell--disabled')
      return cellEl
    }

    cellEl.onclick = () => this.handleDateSelect(yearDate)

    cellEl.onmouseenter = () => {
      if (this.selecting) {
        cellEl.classList.add('ldp-yearrange-picker__cell--hover')
        this.handleDateHover(yearDate)
      }
    }
    cellEl.onmouseleave = () => {
      cellEl.classList.remove('ldp-yearrange-picker__cell--hover')
    }

    return cellEl
  }

  private createFooter(): HTMLElement {
    const locale = this.getLocale()
    const footerEl = this.createElement('div', 'ldp-yearrange-picker__footer')

    const infoEl = this.createElement('div', 'ldp-yearrange-picker__info')
    if (this.startValue && this.endValue) {
      const years = this.endValue.getFullYear() - this.startValue.getFullYear() + 1
      infoEl.textContent = `已选择 ${years} 年`
    } else if (this.selecting && this.startValue) {
      infoEl.textContent = '请选择结束年份'
    }
    footerEl.appendChild(infoEl)

    const buttonsEl = this.createElement('div', 'ldp-yearrange-picker__buttons')

    if (this.options.clearable !== false) {
      const clearBtn = this.createElement('button', 'ldp-yearrange-picker__clear-btn', locale?.buttons.clear || '清除')
      clearBtn.onclick = () => this.clear()
      buttonsEl.appendChild(clearBtn)
    }

    const confirmBtn = this.createElement('button', 'ldp-yearrange-picker__confirm-btn', locale?.buttons.confirm || '确定')
    confirmBtn.onclick = () => this.confirm()
    buttonsEl.appendChild(confirmBtn)

    footerEl.appendChild(buttonsEl)
    return footerEl
  }

  private isYearInRange(year: number): boolean {
    if (!this.startValue || !this.endValue) return false
    const startYear = this.startValue.getFullYear()
    const endYear = this.endValue.getFullYear()
    return year > startYear && year < endYear
  }

  private isYearInHoverRange(year: number): boolean {
    if (!this.selecting || !this.startValue || !this.hoverValue) return false
    const startYear = this.startValue.getFullYear()
    const hoverYear = this.hoverValue.getFullYear()
    const min = Math.min(startYear, hoverYear)
    const max = Math.max(startYear, hoverYear)
    return year > min && year < max
  }

  private isYearDisabled(year: number): boolean {
    const [minYear, maxYear] = this.options.yearRange || [1900, 2100]
    if (year < minYear || year > maxYear) return true
    if (this.options.disabledDate) {
      return this.options.disabledDate(new Date(year, 0, 1))
    }
    return false
  }

  private gotoPrevDecade(): void {
    this.startYear -= 12
    this.updateYearList()
    this.update()
  }

  private gotoNextDecade(): void {
    this.startYear += 12
    this.updateYearList()
    this.update()
  }

  protected update(): void {
    if (!this.container) return
    this.container.innerHTML = ''
    this.render()
  }
}
