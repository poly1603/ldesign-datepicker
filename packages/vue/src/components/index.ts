export { default as DatePicker } from './DatePicker.vue';
export { default as DateRangePicker } from './DateRangePicker.vue';
export { default as TimePicker } from './TimePicker.vue';

// 类型在各自组件文件中通过 defineProps 定义
// 这里重新导出组件实例类型
export type DatePickerInstance = InstanceType<typeof import('./DatePicker.vue').default>;
export type DateRangePickerInstance = InstanceType<typeof import('./DateRangePicker.vue').default>;
export type TimePickerInstance = InstanceType<typeof import('./TimePicker.vue').default>;

// Props 类型需要从 core 包的类型派生
import type {
  PickerMode,
  SelectionType,
  WeekStart,
  DisabledDateFn,
  DisabledTimeFn,
  DatePickerLocale,
  DateRange,
  TimeValue,
} from '@ldesign/datepicker-core';

export interface DatePickerProps {
  modelValue?: Date | Date[] | DateRange | null;
  mode?: PickerMode;
  selectionType?: SelectionType;
  format?: string;
  valueFormat?: string;
  weekStart?: WeekStart;
  disabledDate?: DisabledDateFn;
  disabledTime?: DisabledTimeFn;
  minDate?: Date;
  maxDate?: Date;
  showWeekNumber?: boolean;
  showToday?: boolean;
  showConfirm?: boolean;
  showTime?: boolean;
  allowClear?: boolean;
  placeholder?: string | [string, string];
  disabled?: boolean;
  readonly?: boolean;
  panelCount?: number;
  locale?: DatePickerLocale;
  classPrefix?: string;
}

export interface DateRangePickerProps extends Omit<DatePickerProps, 'selectionType' | 'modelValue'> {
  modelValue?: DateRange | null;
}

export interface TimePickerProps {
  modelValue?: TimeValue | null;
  format?: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  use12Hours?: boolean;
  hideSeconds?: boolean;
  disabledTime?: DisabledTimeFn;
  allowClear?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  locale?: DatePickerLocale;
  classPrefix?: string;
}
