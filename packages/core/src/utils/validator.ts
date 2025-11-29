/**
 * 验证工具类
 * 提供各种日期相关的验证功能
 */

import { DateUtils } from './date'
import type { DateValue, DisabledDateFn } from '../types/date'

/**
 * 验证器类
 */
export class Validator {
  /**
   * 验证日期是否有效
   */
  static isValidDate(date: any): date is Date {
    return DateUtils.isValid(date)
  }

  /**
   * 验证日期值是否有效
   */
  static isValidDateValue(value: DateValue): boolean {
    if (!value) return false
    const date = DateUtils.parse(value)
    return date !== null
  }

  /**
   * 验证日期是否在范围内
   */
  static isInRange(date: Date, min?: Date | null, max?: Date | null): boolean {
    if (!this.isValidDate(date)) return false
    
    if (min && DateUtils.isBefore(date, min)) {
      return false
    }
    
    if (max && DateUtils.isAfter(date, max)) {
      return false
    }
    
    return true
  }

  /**
   * 验证日期是否被禁用
   */
  static isDisabled(date: Date, disabledDate?: DisabledDateFn): boolean {
    if (!disabledDate) return false
    return disabledDate(date)
  }

  /**
   * 验证日期范围是否有效
   */
  static isValidRange(start: Date | null, end: Date | null): boolean {
    if (!start || !end) return false
    if (!this.isValidDate(start) || !this.isValidDate(end)) return false
    return !DateUtils.isAfter(start, end)
  }

  /**
   * 验证范围长度是否符合要求
   */
  static isRangeLengthValid(
    start: Date,
    end: Date,
    minRange?: number,
    maxRange?: number
  ): boolean {
    if (!this.isValidDate(start) || !this.isValidDate(end)) {
      return false
    }

    const days = Math.abs(DateUtils.diffInDays(start, end))

    if (minRange !== undefined && days < minRange) {
      return false
    }

    if (maxRange !== undefined && days > maxRange) {
      return false
    }

    return true
  }

  /**
   * 验证时间是否有效
   */
  static isValidTime(hour: number, minute: number, second = 0): boolean {
    return (
      hour >= 0 &&
      hour <= 23 &&
      minute >= 0 &&
      minute <= 59 &&
      second >= 0 &&
      second <= 59
    )
  }

  /**
   * 验证年份是否有效
   */
  static isValidYear(year: number): boolean {
    return year >= 1900 && year <= 2100
  }

  /**
   * 验证月份是否有效
   */
  static isValidMonth(month: number): boolean {
    return month >= 0 && month <= 11
  }

  /**
   * 验证日期是否有效（1-31）
   */
  static isValidDay(day: number, year: number, month: number): boolean {
    if (day < 1) return false
    const maxDay = new Date(year, month + 1, 0).getDate()
    return day <= maxDay
  }

  /**
   * 验证小时是否被禁用
   */
  static isHourDisabled(hour: number, disabledHours?: () => number[]): boolean {
    if (!disabledHours) return false
    const disabled = disabledHours()
    return disabled.includes(hour)
  }

  /**
   * 验证分钟是否被禁用
   */
  static isMinuteDisabled(
    minute: number,
    hour: number,
    disabledMinutes?: (hour: number) => number[]
  ): boolean {
    if (!disabledMinutes) return false
    const disabled = disabledMinutes(hour)
    return disabled.includes(minute)
  }

  /**
   * 验证秒是否被禁用
   */
  static isSecondDisabled(
    second: number,
    hour: number,
    minute: number,
    disabledSeconds?: (hour: number, minute: number) => number[]
  ): boolean {
    if (!disabledSeconds) return false
    const disabled = disabledSeconds(hour, minute)
    return disabled.includes(second)
  }

  /**
   * 验证日期格式字符串
   */
  static isValidFormat(format: string): boolean {
    if (!format || typeof format !== 'string') return false
    
    const validTokens = [
      'YYYY', 'YY', 'MM', 'M', 'DD', 'D',
      'HH', 'H', 'hh', 'h', 'mm', 'm', 'ss', 's',
      'SSS', 'A', 'a', 'W', 'WW'
    ]
    
    // 检查是否包含至少一个有效的token
    return validTokens.some(token => format.includes(token))
  }

  /**
   * 清理并验证日期值
   */
  static sanitizeDateValue(value: DateValue): Date | null {
    if (!value) return null
    return DateUtils.parse(value)
  }

  /**
   * 验证并返回安全的日期范围
   */
  static sanitizeDateRange(
    start: DateValue,
    end: DateValue
  ): [Date | null, Date | null] {
    const startDate = this.sanitizeDateValue(start)
    const endDate = this.sanitizeDateValue(end)

    // 如果开始日期晚于结束日期，交换它们
    if (startDate && endDate && DateUtils.isAfter(startDate, endDate)) {
      return [endDate, startDate]
    }

    return [startDate, endDate]
  }
}