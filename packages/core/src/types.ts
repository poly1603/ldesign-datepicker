/**
 * 日期选择器类型定义
 */

/** 选择器模式 */
export type PickerMode = 'date' | 'week' | 'month' | 'quarter' | 'year' | 'datetime';

/** 面板类型 */
export type PanelType = 'date' | 'week' | 'month' | 'quarter' | 'year' | 'time';

/** 选择类型 */
export type SelectionType = 'single' | 'range' | 'multiple';

/** 星期首日 */
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** 日期单元格信息 */
export interface DateCell {
  /** 日期对象 */
  date: Date;
  /** 显示文本 */
  text: string;
  /** 是否当前月 */
  isCurrentMonth: boolean;
  /** 是否今天 */
  isToday: boolean;
  /** 是否选中 */
  isSelected: boolean;
  /** 是否禁用 */
  isDisabled: boolean;
  /** 是否在范围内 */
  isInRange: boolean;
  /** 是否范围开始 */
  isRangeStart: boolean;
  /** 是否范围结束 */
  isRangeEnd: boolean;
  /** 周数（周选择模式下） */
  weekNumber?: number;
  /** 是否周选中（周选择模式下） */
  isWeekSelected?: boolean;
}

/** 月份单元格信息 */
export interface MonthCell {
  /** 月份 (0-11) */
  month: number;
  /** 年份 */
  year: number;
  /** 显示文本 */
  text: string;
  /** 是否当前月 */
  isCurrentMonth: boolean;
  /** 是否选中 */
  isSelected: boolean;
  /** 是否禁用 */
  isDisabled: boolean;
  /** 是否在范围内 */
  isInRange: boolean;
  /** 是否范围开始 */
  isRangeStart: boolean;
  /** 是否范围结束 */
  isRangeEnd: boolean;
}

/** 季度单元格信息 */
export interface QuarterCell {
  /** 季度 (1-4) */
  quarter: number;
  /** 年份 */
  year: number;
  /** 显示文本 */
  text: string;
  /** 是否当前季度 */
  isCurrentQuarter: boolean;
  /** 是否选中 */
  isSelected: boolean;
  /** 是否禁用 */
  isDisabled: boolean;
  /** 是否在范围内 */
  isInRange: boolean;
  /** 是否范围开始 */
  isRangeStart: boolean;
  /** 是否范围结束 */
  isRangeEnd: boolean;
}

/** 年份单元格信息 */
export interface YearCell {
  /** 年份 */
  year: number;
  /** 显示文本 */
  text: string;
  /** 是否当前年 */
  isCurrentYear: boolean;
  /** 是否选中 */
  isSelected: boolean;
  /** 是否禁用 */
  isDisabled: boolean;
  /** 是否在范围内 */
  isInRange: boolean;
  /** 是否范围开始 */
  isRangeStart: boolean;
  /** 是否范围结束 */
  isRangeEnd: boolean;
  /** 是否在当前十年范围内 */
  isInDecade: boolean;
}

/** 时间单元格信息 */
export interface TimeCell {
  /** 值 */
  value: number;
  /** 显示文本 */
  text: string;
  /** 是否选中 */
  isSelected: boolean;
  /** 是否禁用 */
  isDisabled: boolean;
}

/** 周信息 */
export interface WeekInfo {
  /** 年份 */
  year: number;
  /** 周数 */
  week: number;
  /** 周开始日期 */
  startDate: Date;
  /** 周结束日期 */
  endDate: Date;
}

/** 日期范围 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/** 时间值 */
export interface TimeValue {
  hour: number;
  minute: number;
  second: number;
}

/** 禁用日期函数 */
export type DisabledDateFn = (date: Date) => boolean;

/** 禁用时间函数 */
export type DisabledTimeFn = (date: Date) => {
  disabledHours?: number[];
  disabledMinutes?: number[];
  disabledSeconds?: number[];
};

/** 日期选择器配置 */
export interface DatePickerOptions {
  /** 选择器模式 */
  mode?: PickerMode;
  /** 选择类型 */
  selectionType?: SelectionType;
  /** 星期首日 (0=周日, 1=周一) */
  weekStart?: WeekStart;
  /** 日期格式 */
  format?: string;
  /** 值格式（用于绑定值） */
  valueFormat?: string;
  /** 默认值 */
  defaultValue?: Date | Date[] | DateRange | null;
  /** 禁用日期函数 */
  disabledDate?: DisabledDateFn;
  /** 禁用时间函数 */
  disabledTime?: DisabledTimeFn;
  /** 最小日期 */
  minDate?: Date;
  /** 最大日期 */
  maxDate?: Date;
  /** 是否显示周数 */
  showWeekNumber?: boolean;
  /** 是否显示今天按钮 */
  showToday?: boolean;
  /** 是否显示确认按钮 */
  showConfirm?: boolean;
  /** 是否显示时间选择 */
  showTime?: boolean;
  /** 时间格式 */
  timeFormat?: string;
  /** 小时步长 */
  hourStep?: number;
  /** 分钟步长 */
  minuteStep?: number;
  /** 秒步长 */
  secondStep?: number;
  /** 是否使用12小时制 */
  use12Hours?: boolean;
  /** 是否隐藏秒 */
  hideSeconds?: boolean;
  /** 面板数量（范围选择） */
  panelCount?: number;
  /** 语言/国际化配置 */
  locale?: DatePickerLocale;
  /** 是否允许清空 */
  allowClear?: boolean;
  /** 占位文本 */
  placeholder?: string | [string, string];
  /** CSS类名前缀 */
  classPrefix?: string;
  /** 挂载容器 */
  container?: HTMLElement | string;
  /** z-index */
  zIndex?: number;
}

/** 国际化配置 */
export interface DatePickerLocale {
  /** 语言代码 */
  locale?: string;
  /** 月份名称 */
  months?: string[];
  /** 月份简称 */
  monthsShort?: string[];
  /** 星期名称 */
  weekdays?: string[];
  /** 星期简称 */
  weekdaysShort?: string[];
  /** 星期最短 */
  weekdaysMin?: string[];
  /** 今天 */
  today?: string;
  /** 确定 */
  confirm?: string;
  /** 清除 */
  clear?: string;
  /** 选择日期 */
  selectDate?: string;
  /** 选择时间 */
  selectTime?: string;
  /** 开始日期 */
  startDate?: string;
  /** 结束日期 */
  endDate?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  /** 年 */
  year?: string;
  /** 月 */
  month?: string;
  /** 周 */
  week?: string;
  /** 季度 */
  quarter?: string;
  /** 季度名称 */
  quarters?: string[];
}

/** 事件回调 */
export interface DatePickerCallbacks {
  /** 值变化 */
  onChange?: (value: Date | Date[] | DateRange | null, formatted: string | string[]) => void;
  /** 面板变化 */
  onPanelChange?: (panel: PanelType, date: Date) => void;
  /** 打开 */
  onOpen?: () => void;
  /** 关闭 */
  onClose?: () => void;
  /** 确认 */
  onConfirm?: (value: Date | Date[] | DateRange | null) => void;
  /** 清除 */
  onClear?: () => void;
  /** 聚焦 */
  onFocus?: (e: FocusEvent) => void;
  /** 失焦 */
  onBlur?: (e: FocusEvent) => void;
}

/** 日期选择器完整配置 */
export interface DatePickerConfig extends DatePickerOptions, DatePickerCallbacks { }

/** 面板状态 */
export interface PanelState {
  /** 当前面板类型 */
  type: PanelType;
  /** 当前显示的年月 */
  viewDate: Date;
  /** 是否显示 */
  visible: boolean;
}

/** 选择器状态 */
export interface DatePickerState {
  /** 当前选中值 */
  value: Date | Date[] | DateRange | null;
  /** 面板状态 */
  panel: PanelState;
  /** 是否聚焦 */
  focused: boolean;
  /** 是否悬停 */
  hovered: boolean;
  /** 临时悬停日期（用于范围选择预览） */
  hoverDate: Date | null;
  /** 范围选择中的激活端 */
  activeInput: 'start' | 'end';
  /** 时间值 */
  timeValue: TimeValue;
  /** 结束时间值（范围选择） */
  endTimeValue?: TimeValue;
}

/** 渲染函数返回的虚拟节点简化表示 */
export interface VNode {
  tag: string;
  attrs?: Record<string, string | number | boolean | undefined>;
  class?: string | string[] | Record<string, boolean>;
  style?: string | Record<string, string>;
  children?: (VNode | string)[];
  events?: Record<string, (e: Event) => void>;
}

/** DOM渲染器接口 */
export interface DOMRenderer {
  /** 创建元素 */
  createElement(vnode: VNode): HTMLElement;
  /** 更新元素 */
  updateElement(el: HTMLElement, vnode: VNode): void;
  /** 挂载到容器 */
  mount(container: HTMLElement): void;
  /** 卸载 */
  unmount(): void;
}
