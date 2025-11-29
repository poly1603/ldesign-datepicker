/**
 * 快捷选项类型定义
 */

import type { DateValue, DateRange } from './date'

/**
 * 快捷选项配置
 */
export interface ShortcutOption {
  /** 快捷选项文本 */
  text: string
  /** 快捷选项值（可以是函数或固定值） */
  value: DateValue | DateRange | (() => DateValue | DateRange)
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
  /** 点击回调 */
  onClick?: () => void
}

/**
 * 快捷选项组
 */
export interface ShortcutGroup {
  /** 分组标题 */
  title?: string
  /** 快捷选项列表 */
  options: ShortcutOption[]
}

/**
 * 快捷选项配置（可以是单个数组或分组数组）
 */
export type ShortcutsConfig = ShortcutOption[] | ShortcutGroup[]