/**
 * 日期相关类型定义
 */

/**
 * 日期值类型
 */
export type DateValue = Date | string | number | null | undefined

/**
 * 日期范围
 */
export type DateRange = [Date | null, Date | null]

/**
 * 日期格式化标记
 */
export type DateFormatToken =
  | 'YYYY' // 四位年份
  | 'YY'   // 两位年份
  | 'MM'   // 两位月份
  | 'M'    // 月份
  | 'DD'   // 两位日期
  | 'D'    // 日期
  | 'HH'   // 24小时制小时
  | 'H'    // 24小时制小时（无前导0）
  | 'hh'   // 12小时制小时
  | 'h'    // 12小时制小时（无前导0）
  | 'mm'   // 分钟
  | 'm'    // 分钟（无前导0）
  | 'ss'   // 秒
  | 's'    // 秒（无前导0）
  | 'A'    // 上午/下午（大写）
  | 'a'    // 上午/下午（小写）
  | 'W'    // 星期（数字）
  | 'WW'   // 周数

/**
 * 日期单位
 */
export type DateUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'

/**
 * 星期常量
 */
export enum Weekday {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}

/**
 * 月份常量
 */
export enum Month {
  January = 0,
  February = 1,
  March = 2,
  April = 3,
  May = 4,
  June = 5,
  July = 6,
  August = 7,
  September = 8,
  October = 9,
  November = 10,
  December = 11
}

/**
 * 日期禁用函数类型
 */
export type DisabledDateFn = (date: Date) => boolean

/**
 * 日期验证函数类型
 */
export type DateValidatorFn = (date: Date) => boolean