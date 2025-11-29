/**
 * 日期计算工具类
 * 提供日期的各种计算、比较、获取等功能
 */

import type { DateUnit } from '../types/date'

/**
 * 日期工具类
 */
export class DateUtils {
  /**
   * 克隆日期对象
   */
  static clone(date: Date): Date {
    return new Date(date.getTime())
  }

  /**
   * 添加天数
   */
  static addDays(date: Date, days: number): Date {
    const result = this.clone(date)
    result.setDate(result.getDate() + days)
    return result
  }

  /**
   * 添加月份
   */
  static addMonths(date: Date, months: number): Date {
    const result = this.clone(date)
    const day = result.getDate()
    result.setMonth(result.getMonth() + months)

    // 处理月末日期溢出问题（如1月31日加1个月应该是2月28/29日）
    if (result.getDate() !== day) {
      result.setDate(0)
    }

    return result
  }

  /**
   * 添加年份
   */
  static addYears(date: Date, years: number): Date {
    const result = this.clone(date)
    result.setFullYear(result.getFullYear() + years)
    return result
  }

  /**
   * 添加小时
   */
  static addHours(date: Date, hours: number): Date {
    const result = this.clone(date)
    result.setHours(result.getHours() + hours)
    return result
  }

  /**
   * 添加分钟
   */
  static addMinutes(date: Date, minutes: number): Date {
    const result = this.clone(date)
    result.setMinutes(result.getMinutes() + minutes)
    return result
  }

  /**
   * 添加秒
   */
  static addSeconds(date: Date, seconds: number): Date {
    const result = this.clone(date)
    result.setSeconds(result.getSeconds() + seconds)
    return result
  }

  /**
   * 通用的添加时间方法
   */
  static add(date: Date, value: number, unit: DateUnit): Date {
    switch (unit) {
      case 'year':
        return this.addYears(date, value)
      case 'month':
        return this.addMonths(date, value)
      case 'week':
        return this.addDays(date, value * 7)
      case 'day':
        return this.addDays(date, value)
      case 'hour':
        return this.addHours(date, value)
      case 'minute':
        return this.addMinutes(date, value)
      case 'second':
        return this.addSeconds(date, value)
      default:
        return this.clone(date)
    }
  }

  /**
   * 判断是否为同一天
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  /**
   * 判断是否为同一月
   */
  static isSameMonth(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    )
  }

  /**
   * 判断是否为同一年
   */
  static isSameYear(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear()
  }

  /**
   * 判断日期1是否在日期2之前
   */
  static isBefore(date1: Date, date2: Date): boolean {
    return date1.getTime() < date2.getTime()
  }

  /**
   * 判断日期1是否在日期2之后
   */
  static isAfter(date1: Date, date2: Date): boolean {
    return date1.getTime() > date2.getTime()
  }

  /**
   * 判断日期是否在范围内（包含边界）
   */
  static isBetween(date: Date, start: Date, end: Date): boolean {
    const time = date.getTime()
    return time >= start.getTime() && time <= end.getTime()
  }

  /**
   * 获取某月的天数
   */
  static getDaysInMonth(date: Date): number {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  /**
   * 获取某年的天数
   */
  static getDaysInYear(date: Date): number {
    return this.isLeapYear(date) ? 366 : 365
  }

  /**
   * 判断是否为闰年
   */
  static isLeapYear(date: Date): boolean {
    const year = date.getFullYear()
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  /**
   * 获取某月的第一天
   */
  static startOfMonth(date: Date): Date {
    const result = this.clone(date)
    result.setDate(1)
    result.setHours(0, 0, 0, 0)
    return result
  }

  /**
   * 获取某月的最后一天
   */
  static endOfMonth(date: Date): Date {
    const result = this.clone(date)
    result.setMonth(result.getMonth() + 1, 0)
    result.setHours(23, 59, 59, 999)
    return result
  }

  /**
   * 获取某天的开始时间
   */
  static startOfDay(date: Date): Date {
    const result = this.clone(date)
    result.setHours(0, 0, 0, 0)
    return result
  }

  /**
   * 获取某天的结束时间
   */
  static endOfDay(date: Date): Date {
    const result = this.clone(date)
    result.setHours(23, 59, 59, 999)
    return result
  }

  /**
   * 获取某年的第一天
   */
  static startOfYear(date: Date): Date {
    const result = this.clone(date)
    result.setMonth(0, 1)
    result.setHours(0, 0, 0, 0)
    return result
  }

  /**
   * 获取某年的最后一天
   */
  static endOfYear(date: Date): Date {
    const result = this.clone(date)
    result.setMonth(11, 31)
    result.setHours(23, 59, 59, 999)
    return result
  }

  /**
   * 获取某周的第一天
   * @param date 日期
   * @param firstDayOfWeek 一周的第一天（0-6，0表示周日）
   */
  static startOfWeek(date: Date, firstDayOfWeek = 0): Date {
    const result = this.clone(date)
    const day = result.getDay()
    const diff = (day < firstDayOfWeek ? 7 : 0) + day - firstDayOfWeek
    result.setDate(result.getDate() - diff)
    result.setHours(0, 0, 0, 0)
    return result
  }

  /**
   * 获取某周的最后一天
   */
  static endOfWeek(date: Date, firstDayOfWeek = 0): Date {
    const start = this.startOfWeek(date, firstDayOfWeek)
    return this.addDays(start, 6)
  }

  /**
   * 获取年份中的第几周（ISO 8601标准）
   */
  static getWeekOfYear(date: Date): number {
    const target = this.clone(date)
    const dayNumber = (date.getDay() + 6) % 7
    target.setDate(target.getDate() - dayNumber + 3)
    const firstThursday = target.valueOf()
    target.setMonth(0, 1)
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7))
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
  }

  /**
   * 获取年份中的第几天
   */
  static getDayOfYear(date: Date): number {
    const start = this.startOfYear(date)
    const diff = date.getTime() - start.getTime()
    return Math.floor(diff / 86400000) + 1
  }

  /**
   * 获取两个日期之间的天数差
   */
  static diffInDays(date1: Date, date2: Date): number {
    const start = this.startOfDay(date1)
    const end = this.startOfDay(date2)
    const diff = end.getTime() - start.getTime()
    return Math.round(diff / 86400000)
  }

  /**
   * 获取两个日期之间的月数差
   */
  static diffInMonths(date1: Date, date2: Date): number {
    const yearDiff = date2.getFullYear() - date1.getFullYear()
    const monthDiff = date2.getMonth() - date1.getMonth()
    return yearDiff * 12 + monthDiff
  }

  /**
   * 获取两个日期之间的年数差
   */
  static diffInYears(date1: Date, date2: Date): number {
    return date2.getFullYear() - date1.getFullYear()
  }

  /**
   * 判断是否为今天
   */
  static isToday(date: Date): boolean {
    return this.isSameDay(date, new Date())
  }

  /**
   * 判断是否为本月
   */
  static isThisMonth(date: Date): boolean {
    return this.isSameMonth(date, new Date())
  }

  /**
   * 判断是否为本年
   */
  static isThisYear(date: Date): boolean {
    return this.isSameYear(date, new Date())
  }

  /**
   * 判断是否为周末
   */
  static isWeekend(date: Date): boolean {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  /**
   * 获取日历面板数据（包含上月和下月的日期）
   * @param date 当前月份的任意日期
   * @param firstDayOfWeek 一周的第一天
   * @returns 日期数组（6周 * 7天 = 42天）
   */
  static getCalendarDates(date: Date, firstDayOfWeek = 0): Date[] {
    const firstDay = this.startOfMonth(date)

    // 获取第一天是星期几
    const firstDayOfMonth = firstDay.getDay()

    // 计算需要显示上月的天数
    const daysFromPrevMonth = (firstDayOfMonth - firstDayOfWeek + 7) % 7

    // 开始日期
    const startDate = this.addDays(firstDay, -daysFromPrevMonth)

    // 生成42天的日期数组（6周）
    const dates: Date[] = []
    for (let i = 0; i < 42; i++) {
      dates.push(this.addDays(startDate, i))
    }

    return dates
  }

  /**
   * 获取年份选择器面板数据（12年为一页）
   */
  static getYearPanelYears(year: number): number[] {
    const startYear = Math.floor(year / 12) * 12
    return Array.from({ length: 12 }, (_, i) => startYear + i)
  }

  /**
   * 验证日期是否有效
   */
  static isValid(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime())
  }

  /**
   * 解析日期值
   */
  static parse(value: any): Date | null {
    if (!value) return null

    if (value instanceof Date) {
      return this.isValid(value) ? value : null
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value)
      return this.isValid(date) ? date : null
    }

    return null
  }

  /**
   * 设置日期的时间部分
   */
  static setTime(date: Date, hours: number, minutes: number, seconds = 0): Date {
    const result = this.clone(date)
    result.setHours(hours, minutes, seconds, 0)
    return result
  }

  /**
   * 获取月份范围
   */
  static getMonthRange(date: Date): [Date, Date] {
    return [this.startOfMonth(date), this.endOfMonth(date)]
  }

  /**
   * 获取年份范围
   */
  static getYearRange(date: Date): [Date, Date] {
    return [this.startOfYear(date), this.endOfYear(date)]
  }

  /**
   * 获取周范围
   */
  static getWeekRange(date: Date, firstDayOfWeek = 0): [Date, Date] {
    return [this.startOfWeek(date, firstDayOfWeek), this.endOfWeek(date, firstDayOfWeek)]
  }
}