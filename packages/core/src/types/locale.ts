/**
 * 国际化（i18n）类型定义
 */

/**
 * 语言包数据结构
 */
export interface LocaleData {
  /** 语言名称，如 'zh-CN', 'en-US' */
  name: string

  /** 月份全称 */
  months: string[]

  /** 月份简称 */
  monthsShort: string[]

  /** 星期全称 */
  weekdays: string[]

  /** 星期简称 */
  weekdaysShort: string[]

  /** 星期最短形式 */
  weekdaysMin: string[]

  /** 上午/下午格式化函数 */
  meridiem: (hour: number, minute: number, isLowercase?: boolean) => string

  /** 日期时间格式 */
  formats: {
    date: string
    time: string
    datetime: string
    month: string
    year: string
    week: string
  }

  /** 按钮文本 */
  buttons: {
    confirm: string
    cancel: string
    clear: string
    today: string
    now: string
    prevYear: string
    nextYear: string
    prevMonth: string
    nextMonth: string
  }

  /** 快捷选项文本 */
  shortcuts: {
    today: string
    yesterday: string
    tomorrow: string
    lastWeek: string
    lastMonth: string
    lastYear: string
    thisWeek: string
    thisMonth: string
    thisYear: string
    last7Days: string
    last30Days: string
    last90Days: string
  }

  /** 占位符文本 */
  placeholders: {
    date: string
    dateRange: string[]
    month: string
    monthRange: string[]
    year: string
    yearRange: string[]
    week: string
    weekRange: string[]
    time: string
    timeRange: string[]
    datetime: string
    datetimeRange: string[]
  }

  /** 其他文本 */
  texts: {
    selectDate: string
    selectTime: string
    selectYear: string
    selectMonth: string
    selectWeek: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    to: string
    weekNumber: string
  }
}

/**
 * 支持的语言代码
 */
export type LocaleCode = 'zh-CN' | 'en-US' | 'zh-TW' | 'ja-JP' | 'ko-KR' | string