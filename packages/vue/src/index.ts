/**
 * @ldesign/datepicker-vue
 * Vue 3 日期选择器组件
 */

import type { App, Plugin } from 'vue';

// 组件导出
export { DatePicker, DateRangePicker, TimePicker } from './components';
export type { DatePickerProps, DateRangePickerProps, TimePickerProps } from './components';

// Hooks 导出
export { useDatePicker, useClickOutside } from './hooks';
export type { UseDatePickerOptions, UseDatePickerReturn } from './hooks/useDatePicker';

// 指令导出
export { vDatepicker } from './directives';
export type { DatepickerDirectiveBinding } from './directives';

// 从 core 重新导出类型和工具函数
export {
  // 类型
  type DatePickerConfig,
  type DatePickerState,
  type DateRange,
  type TimeValue,
  type PickerMode,
  type SelectionType,
  type PanelType,
  type WeekStart,
  type DateCell,
  type MonthCell,
  type QuarterCell,
  type YearCell,
  type TimeCell,
  type DatePickerLocale,
  type DisabledDateFn,
  type DisabledTimeFn,
  // 核心类
  DatePickerCore,
  DOMDatePicker,
  createDatePicker,
  type DOMRendererOptions,
  // 工具函数
  formatDate,
  parseFormatted,
  formatTime,
  formatWeek,
  formatMonth,
  formatQuarter,
  formatYear,
  // 日期工具
  createDate,
  cloneDate,
  getToday,
  getNow,
  isSameDay,
  isSameMonth,
  isSameYear,
  isSameQuarter,
  isSameWeek,
  isToday,
  isBefore,
  isAfter,
  isBetween,
  addDays,
  addMonths,
  addYears,
  addWeeks,
  addQuarters,
  getQuarter,
  getWeekInfo,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
  // 语言配置
  defaultLocale,
  enLocale,
  mergeLocale,
} from '@ldesign/datepicker-core';

// 导入组件用于安装
import { DatePicker, DateRangePicker, TimePicker } from './components';
import { vDatepicker } from './directives';

/**
 * 安装插件
 */
export const install: Plugin['install'] = (app: App) => {
  app.component('LDatePicker', DatePicker);
  app.component('LDateRangePicker', DateRangePicker);
  app.component('LTimePicker', TimePicker);
  app.directive('datepicker', vDatepicker);
};

// 默认导出插件
export default {
  install,
};

// 版本
export const version = '1.0.0';
