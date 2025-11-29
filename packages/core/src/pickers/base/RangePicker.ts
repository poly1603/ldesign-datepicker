/**
 * 范围选择器抽象类
 * 所有范围选择器的基类
 */

import { BasePicker } from './BasePicker'
import { DateUtils } from '../../utils/date'
import type { RangePickerOptions } from '../../types/picker'
import type { DateRange } from '../../types/date'

/**
 * 范围选择器抽象类
 */
export abstract class RangePicker extends BasePicker {
  protected startValue: Date | null = null
  protected endValue: Date | null = null
  protected hoverValue: Date | null = null
  protected selecting: boolean = false

  declare protected options: RangePickerOptions

  /**
   * 构造函数
   */
  constructor(options: RangePickerOptions = {}) {
    super(options)
  }

  /**
   * 规范化配置项
   */
  protected normalizeOptions(options: RangePickerOptions): RangePickerOptions {
    return {
      ...super.normalizeOptions(options),
      maxRange: options.maxRange,
      minRange: options.minRange
    }
  }

  /**
   * 获取范围值
   */
  getValue(): DateRange {
    return [this.startValue, this.endValue]
  }

  /**
   * 设置范围值
   */
  setValue(value: DateRange): void {
    if (this.options.readonly || this.options.disabled) {
      return
    }

    if (!value || !Array.isArray(value)) {
      this.clear()
      return
    }

    const [start, end] = value
    const startDate = start ? DateUtils.parse(start) : null
    const endDate = end ? DateUtils.parse(end) : null

    // 验证日期有效性
    if (start && !startDate) {
      console.warn('[RangePicker] Invalid start date:', start)
      return
    }

    if (end && !endDate) {
      console.warn('[RangePicker] Invalid end date:', end)
      return
    }

    // 确保开始日期不晚于结束日期
    if (startDate && endDate && DateUtils.isAfter(startDate, endDate)) {
      this.startValue = endDate
      this.endValue = startDate
    } else {
      this.startValue = startDate
      this.endValue = endDate
    }

    // 验证范围长度
    if (!this.validateRangeLength()) {
      console.warn('[RangePicker] Range length validation failed')
      return
    }

    this.value = this.getValue()
    this.update()
    this.emit('change', this.value)
  }

  /**
   * 获取开始值
   */
  getStartValue(): Date | null {
    return this.startValue
  }

  /**
   * 获取结束值
   */
  getEndValue(): Date | null {
    return this.endValue
  }

  /**
   * 设置开始值
   */
  setStartValue(value: Date | null): void {
    if (this.options.readonly || this.options.disabled) {
      return
    }

    this.startValue = value
    this.selecting = true
    this.update()
  }

  /**
   * 设置结束值
   */
  setEndValue(value: Date | null): void {
    if (this.options.readonly || this.options.disabled) {
      return
    }

    this.endValue = value
    this.selecting = false
    this.hoverValue = null // 清除悬停值

    // 确保开始日期不晚于结束日期
    if (this.startValue && this.endValue &&
      DateUtils.isAfter(this.startValue, this.endValue)) {
      [this.startValue, this.endValue] = [this.endValue, this.startValue]
    }

    // 验证范围长度
    if (!this.validateRangeLength()) {
      console.warn('[RangePicker] Range length validation failed')
      this.endValue = null
      return
    }

    this.value = this.getValue()
    this.update()
    this.emit('change', this.value)
    this.emit('rangeChange', this.value)
  }

  /**
   * 设置范围
   */
  setRange(start: Date | null, end: Date | null): void {
    this.setValue([start, end])
  }

  /**
   * 清除范围
   */
  clear(): void {
    if (this.options.readonly || this.options.disabled) {
      return
    }

    this.startValue = null
    this.endValue = null
    this.hoverValue = null
    this.selecting = false
    this.value = null
    this.update()
    this.emit('clear')
    this.emit('change', null)
  }

  /**
   * 处理日期选择
   */
  protected handleDateSelect(date: Date): void {
    if (this.options.readonly || this.options.disabled) {
      return
    }

    // 检查是否禁用
    if (this.options.disabledDate && this.options.disabledDate(date)) {
      return
    }

    if (!this.selecting || !this.startValue) {
      // 第一次选择，设置开始日期
      this.setStartValue(date)
    } else {
      // 第二次选择，设置结束日期
      this.setEndValue(date)
    }
  }

  /**
   * 处理日期悬停
   */
  protected handleDateHover(date: Date | null): void {
    if (!this.selecting || !this.startValue) {
      return
    }

    this.hoverValue = date
    this.update()
  }

  /**
   * 判断日期是否在范围内
   */
  protected isInRange(date: Date): boolean {
    if (!this.startValue || !this.endValue) {
      return false
    }

    return DateUtils.isBetween(date, this.startValue, this.endValue)
  }

  /**
   * 判断日期是否在悬停范围内
   */
  protected isInHoverRange(date: Date): boolean {
    if (!this.selecting || !this.startValue || !this.hoverValue) {
      return false
    }

    const start = DateUtils.isBefore(this.startValue, this.hoverValue)
      ? this.startValue
      : this.hoverValue
    const end = DateUtils.isBefore(this.startValue, this.hoverValue)
      ? this.hoverValue
      : this.startValue

    return DateUtils.isBetween(date, start, end)
  }

  /**
   * 判断是否为范围开始
   */
  protected isRangeStart(date: Date): boolean {
    return this.startValue ? DateUtils.isSameDay(date, this.startValue) : false
  }

  /**
   * 判断是否为范围结束
   */
  protected isRangeEnd(date: Date): boolean {
    return this.endValue ? DateUtils.isSameDay(date, this.endValue) : false
  }

  /**
   * 验证范围长度
   */
  protected validateRangeLength(): boolean {
    if (!this.startValue || !this.endValue) {
      return true
    }

    const days = Math.abs(DateUtils.diffInDays(this.startValue, this.endValue))

    if (this.options.minRange !== undefined && days < this.options.minRange) {
      return false
    }

    if (this.options.maxRange !== undefined && days > this.options.maxRange) {
      return false
    }

    return true
  }

  /**
   * 获取范围天数
   */
  protected getRangeDays(): number {
    if (!this.startValue || !this.endValue) {
      return 0
    }

    return Math.abs(DateUtils.diffInDays(this.startValue, this.endValue)) + 1
  }

  /**
   * 判断是否正在选择
   */
  isSelecting(): boolean {
    return this.selecting
  }

  /**
   * 取消选择
   */
  cancelSelect(): void {
    this.selecting = false
    this.hoverValue = null
    this.update()
  }
}