/**
 * 日期格式化和解析工具
 * 支持常见的日期时间格式化标记
 */

import { DateUtils } from './date'

/**
 * 格式化标记映射表
 */
const FORMAT_TOKENS: Record<string, (date: Date, locale?: any) => string> = {
  // 年份
  YYYY: (date) => String(date.getFullYear()),
  YY: (date) => String(date.getFullYear()).slice(-2),

  // 月份
  MM: (date) => String(date.getMonth() + 1).padStart(2, '0'),
  M: (date) => String(date.getMonth() + 1),

  // 日期
  DD: (date) => String(date.getDate()).padStart(2, '0'),
  D: (date) => String(date.getDate()),

  // 小时（24小时制）
  HH: (date) => String(date.getHours()).padStart(2, '0'),
  H: (date) => String(date.getHours()),

  // 小时（12小时制）
  hh: (date) => {
    const hours = date.getHours() % 12 || 12
    return String(hours).padStart(2, '0')
  },
  h: (date) => {
    const hours = date.getHours() % 12 || 12
    return String(hours)
  },

  // 分钟
  mm: (date) => String(date.getMinutes()).padStart(2, '0'),
  m: (date) => String(date.getMinutes()),

  // 秒
  ss: (date) => String(date.getSeconds()).padStart(2, '0'),
  s: (date) => String(date.getSeconds()),

  // 毫秒
  SSS: (date) => String(date.getMilliseconds()).padStart(3, '0'),

  // 上午/下午
  A: (date) => (date.getHours() < 12 ? 'AM' : 'PM'),
  a: (date) => (date.getHours() < 12 ? 'am' : 'pm'),

  // 星期
  W: (date) => String(date.getDay()),

  // 周数
  WW: (date) => String(DateUtils.getWeekOfYear(date)).padStart(2, '0')
}

/**
 * 日期格式化类
 */
export class DateFormatter {
  /**
   * 格式化日期
   * @param date 日期对象
   * @param format 格式字符串，如 'YYYY-MM-DD HH:mm:ss'
   * @param locale 语言包（用于本地化月份、星期等）
   * @returns 格式化后的字符串
   */
  static format(date: Date, format: string, locale?: any): string {
    if (!DateUtils.isValid(date)) {
      return ''
    }

    let result = format

    // 按照token长度降序排序，避免短token覆盖长token（如MM覆盖M）
    const tokens = Object.keys(FORMAT_TOKENS).sort((a, b) => b.length - a.length)

    for (const token of tokens) {
      if (result.includes(token)) {
        const formatter = FORMAT_TOKENS[token]
        if (formatter) {
          const value = formatter(date, locale)
          result = result.replace(new RegExp(token, 'g'), value)
        }
      }
    }

    return result
  }

  /**
   * 解析日期字符串
   * @param dateString 日期字符串
   * @param format 格式字符串
   * @returns Date对象或null
   */
  static parse(dateString: string, format: string): Date | null {
    if (!dateString || !format) {
      return null
    }

    try {
      // 提取格式中的token
      const tokens = Object.keys(FORMAT_TOKENS).sort((a, b) => b.length - a.length)

      // 构建解析正则表达式
      let regex = format
      const captureGroups: string[] = []

      for (const token of tokens) {
        if (regex.includes(token)) {
          captureGroups.push(token)
          // 为每个token创建捕获组
          regex = regex.replace(token, `(\\d{${token.length > 1 ? token.length : '1,2'}})`)
        }
      }

      // 执行匹配
      const matches = dateString.match(new RegExp(`^${regex}$`))
      if (!matches) {
        return null
      }

      // 提取各部分
      const parts: Record<string, number> = {}
      captureGroups.forEach((token, index) => {
        const matchValue = matches[index + 1]
        if (matchValue) {
          parts[token] = parseInt(matchValue, 10)
        }
      })

      // 构建日期
      const year = parts.YYYY || (parts.YY ? 2000 + parts.YY : new Date().getFullYear())
      const month = (parts.MM || parts.M || 1) - 1
      const day = parts.DD || parts.D || 1
      const hour = parts.HH || parts.H || parts.hh || parts.h || 0
      const minute = parts.mm || parts.m || 0
      const second = parts.ss || parts.s || 0

      const date = new Date(year, month, day, hour, minute, second)

      return DateUtils.isValid(date) ? date : null
    } catch (error) {
      console.error('Date parse error:', error)
      return null
    }
  }

  /**
   * 格式化日期范围
   */
  static formatRange(
    start: Date | null,
    end: Date | null,
    format: string,
    separator = ' ~ ',
    locale?: any
  ): string {
    const startStr = start ? this.format(start, format, locale) : ''
    const endStr = end ? this.format(end, format, locale) : ''

    if (!startStr && !endStr) return ''
    if (!startStr) return endStr
    if (!endStr) return startStr

    return `${startStr}${separator}${endStr}`
  }

  /**
   * 智能格式化（相对时间）
   * 如：刚刚、5分钟前、今天、昨天、2023-01-01
   */
  static formatSmart(date: Date, locale?: any): string {
    if (!DateUtils.isValid(date)) {
      return ''
    }

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const diffInSeconds = Math.floor(diff / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    // 刚刚（1分钟内）
    if (diffInMinutes < 1) {
      return locale?.texts?.justNow || '刚刚'
    }

    // X分钟前（1小时内）
    if (diffInHours < 1) {
      return `${diffInMinutes}${locale?.texts?.minutesAgo || '分钟前'}`
    }

    // X小时前（24小时内）
    if (diffInDays < 1) {
      return `${diffInHours}${locale?.texts?.hoursAgo || '小时前'}`
    }

    // 昨天
    if (diffInDays === 1) {
      return `${locale?.shortcuts?.yesterday || '昨天'} ${this.format(date, 'HH:mm')}`
    }

    // 今年的日期
    if (DateUtils.isSameYear(date, now)) {
      return this.format(date, 'MM-DD HH:mm')
    }

    // 其他日期
    return this.format(date, 'YYYY-MM-DD HH:mm')
  }

  /**
   * 获取默认格式
   */
  static getDefaultFormat(type: string): string {
    const formats: Record<string, string> = {
      date: 'YYYY-MM-DD',
      datetime: 'YYYY-MM-DD HH:mm:ss',
      time: 'HH:mm:ss',
      month: 'YYYY-MM',
      year: 'YYYY',
      week: 'YYYY-WW'
    }
    return formats[type] || 'YYYY-MM-DD'
  }

  /**
   * 验证格式字符串
   */
  static isValidFormat(format: string): boolean {
    if (!format) return false

    const tokens = Object.keys(FORMAT_TOKENS)
    let tempFormat = format

    // 移除所有有效的token
    for (const token of tokens) {
      tempFormat = tempFormat.replace(new RegExp(token, 'g'), '')
    }

    // 移除常见的分隔符
    tempFormat = tempFormat.replace(/[-\s/:,.]/g, '')

    // 如果还有剩余字符，说明包含无效token
    return tempFormat.length === 0
  }
}

/**
 * 导出便捷函数
 */
export const format = DateFormatter.format.bind(DateFormatter)
export const parse = DateFormatter.parse.bind(DateFormatter)
export const formatRange = DateFormatter.formatRange.bind(DateFormatter)
export const formatSmart = DateFormatter.formatSmart.bind(DateFormatter)