/**
 * 选择器类型定义
 */

import type { DateValue, DateRange, DisabledDateFn } from './date'
import type { LocaleCode } from './locale'
import type { ThemeName } from './theme'
import type { ShortcutsConfig } from './shortcuts'

/**
 * 选择器类型
 */
export type PickerType =
  | 'date'
  | 'year'
  | 'month'
  | 'week'
  | 'time'
  | 'datetime'
  | 'daterange'
  | 'yearrange'
  | 'monthrange'
  | 'weekrange'
  | 'timerange'
  | 'datetimerange'

/**
 * 选择器尺寸
 */
export type PickerSize = 'small' | 'medium' | 'large'

/**
 * 选择器位置
 */
export type PickerPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

/**
 * 时间精度
 */
export type TimePrecision = 'hour' | 'minute' | 'second'

/**
 * 基础选择器配置
 */
export interface BasePickerOptions {
  /** 语言 */
  locale?: LocaleCode
  /** 主题 */
  theme?: ThemeName
  /** 日期格式 */
  format?: string
  /** 占位符 */
  placeholder?: string | string[]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否可清除 */
  clearable?: boolean
  /** 尺寸 */
  size?: PickerSize
  /** 弹出位置 */
  placement?: PickerPlacement
  /** 禁用日期函数 */
  disabledDate?: DisabledDateFn
  /** 快捷选项 */
  shortcuts?: ShortcutsConfig
  /** 是否显示今天按钮 */
  showToday?: boolean
  /** 是否显示现在按钮 */
  showNow?: boolean
  /** 是否显示确认按钮 */
  showConfirm?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: Partial<CSSStyleDeclaration>
  /** z-index */
  zIndex?: number
  /** 值变化回调 */
  onChange?: (value: any) => void
  /** 清除回调 */
  onClear?: () => void
  /** 打开回调 */
  onOpen?: () => void
  /** 关闭回调 */
  onClose?: () => void
  /** 确认回调 */
  onConfirm?: (value: any) => void
}

/**
 * 日期选择器配置
 */
export interface DatePickerOptions extends BasePickerOptions {
  /** 默认值 */
  value?: DateValue
  /** 是否显示周数 */
  showWeekNumber?: boolean
  /** 一周的第一天（0-6，0表示周日） */
  firstDayOfWeek?: number
}

/**
 * 年份选择器配置
 */
export interface YearPickerOptions extends BasePickerOptions {
  /** 默认值 */
  value?: DateValue
  /** 起始年份 */
  startYear?: number
  /** 结束年份 */
  endYear?: number
}

/**
 * 月份选择器配置
 */
export interface MonthPickerOptions extends BasePickerOptions {
  /** 默认值 */
  value?: DateValue
}

/**
 * 星期选择器配置
 */
export interface WeekPickerOptions extends BasePickerOptions {
  /** 默认值 */
  value?: DateValue
  /** 一周的第一天 */
  firstDayOfWeek?: number
}

/**
 * 时间选择器配置
 */
export interface TimePickerOptions extends BasePickerOptions {
  /** 默认值 */
  value?: DateValue
  /** 时间精度 */
  precision?: TimePrecision
  /** 12/24小时制 */
  use12Hours?: boolean
  /** 小时步长 */
  hourStep?: number
  /** 分钟步长 */
  minuteStep?: number
  /** 秒步长 */
  secondStep?: number
  /** 禁用小时 */
  disabledHours?: () => number[]
  /** 禁用分钟 */
  disabledMinutes?: (hour: number) => number[]
  /** 禁用秒 */
  disabledSeconds?: (hour: number, minute: number) => number[]
}

/**
 * 日期时间选择器配置
 */
export interface DateTimePickerOptions extends BasePickerOptions {
  /** 默认值 */
  value?: DateValue
  /** 时间精度 */
  precision?: TimePrecision
  /** 时间配置 */
  timeOptions?: Partial<TimePickerOptions>
}

/**
 * 范围选择器配置
 */
export interface RangePickerOptions extends BasePickerOptions {
  /** 默认值 */
  value?: DateRange
  /** 最大范围（天数） */
  maxRange?: number
  /** 最小范围（天数） */
  minRange?: number
  /** 范围变化回调 */
  onRangeChange?: (range: DateRange) => void
}

/**
 * 日期范围选择器配置
 */
export interface DateRangePickerOptions extends RangePickerOptions {
  /** 是否显示周数 */
  showWeekNumber?: boolean
  /** 一周的第一天 */
  firstDayOfWeek?: number
}

/**
 * 年份范围选择器配置
 */
export interface YearRangePickerOptions extends RangePickerOptions {
  /** 年份范围 */
  yearRange?: [number, number]
}

/**
 * 月份范围选择器配置
 */
export interface MonthRangePickerOptions extends RangePickerOptions {
  /** 年份范围 */
  yearRange?: [number, number]
}

/**
 * 周范围选择器配置
 */
export interface WeekRangePickerOptions extends RangePickerOptions {
  /** 一周的第一天 */
  firstDayOfWeek?: number
}

/**
 * 时间范围选择器配置
 */
export interface TimeRangePickerOptions extends RangePickerOptions {
  /** 时间精度 */
  precision?: TimePrecision
  /** 12/24小时制 */
  use12Hours?: boolean
}

/**
 * 日期时间范围选择器配置
 */
export interface DateTimeRangePickerOptions extends RangePickerOptions {
  /** 时间精度 */
  precision?: TimePrecision
  /** 时间配置 */
  timeOptions?: Partial<TimePickerOptions>
}

/**
 * 选择器事件类型
 */
export type PickerEvent =
  | 'change'
  | 'clear'
  | 'open'
  | 'close'
  | 'confirm'
  | 'select'
  | 'hover'

/**
 * 事件处理器类型
 */
export type PickerEventHandler = (...args: any[]) => void