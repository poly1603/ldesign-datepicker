/**
 * 日期选择器类型定义（增强版）
 */

// ==================== 品牌类型 ====================

/**
 * 品牌类型辅助
 * @internal
 */
declare const __brand: unique symbol;

/**
 * 时间戳品牌类型 - 防止与普通 number 混淆
 * @example
 * ```ts
 * const timestamp: DateTimestamp = Date.now() as DateTimestamp;
 * ```
 */
export type DateTimestamp = number & { readonly [__brand]: 'DateTimestamp' };

/**
 * ISO 日期字符串品牌类型
 * @example
 * ```ts
 * const isoDate: ISODateString = '2024-01-01' as ISODateString;
 * ```
 */
export type ISODateString = string & { readonly [__brand]: 'ISODateString' };

/**
 * 有效日期范围品牌类型 - 确保开始 <= 结束
 * @example
 * ```ts
 * const range: ValidDateRange = [new Date('2024-01-01'), new Date('2024-12-31')] as ValidDateRange;
 * ```
 */
export type ValidDateRange = [Date, Date] & { readonly [__brand]: 'ValidDateRange' };

// ==================== 基础类型 ====================

/**
 * 选择模式
 * 
 * @remarks
 * 支持多种日期时间选择模式，包括单选、多选和范围选择
 * 
 * @public
 */
export type PickerType =
  | 'date'           // 单个日期
  | 'dates'          // 多个日期
  | 'week'           // 星期
  | 'month'          // 月份
  | 'year'           // 年份
  | 'quarter'        // 季度
  | 'datetime'       // 日期时间
  | 'time'           // 时间
  | 'daterange'      // 日期范围
  | 'datetimerange'  // 日期时间范围
  | 'monthrange'     // 月份范围
  | 'yearrange'      // 年份范围
  | 'lunar'          // 农历（新增）
  | 'timezone';      // 时区选择（新增）

/**
 * 视图类型
 * 
 * @remarks
 * 定义日期选择器的显示视图
 * 
 * @public
 */
export type ViewType = 'date' | 'month' | 'year' | 'time' | 'lunar' | 'timezone';

/**
 * 状态机状态
 * 
 * @remarks
 * 用于跟踪选择器的当前状态
 * 
 * @public
 */
export type PickerMachineState = 'idle' | 'selecting' | 'confirming' | 'disabled';

/**
 * 日期值类型
 * 
 * @public
 */
export type DateValue = Date | null;

/**
 * 日期范围值类型
 * 
 * @public
 */
export type DateRangeValue = [Date | null, Date | null];

/**
 * 多个日期值类型
 * 
 * @public
 */
export type DatesValue = Date[];

/**
 * 选择器值类型（联合类型）
 * 
 * @public
 */
export type PickerValue = DateValue | DateRangeValue | DatesValue;

/**
 * 星期几（0-6，0表示周日）
 * 
 * @remarks
 * 用于表示一周中的某一天
 * 
 * @public
 */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 季度（1-4）
 * 
 * @remarks
 * 用于表示一年中的第几个季度
 * 
 * @public
 */
export type Quarter = 1 | 2 | 3 | 4;

// ==================== 类型守卫 ====================

/**
 * 检查是否为有效的日期对象
 * 
 * @param value - 待检查的值
 * @returns 是否为有效日期
 * 
 * @public
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * 检查是否为日期范围类型
 * 
 * @param value - 待检查的值
 * @returns 是否为日期范围
 * 
 * @public
 */
export function isDateRange(value: unknown): value is DateRangeValue {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    (value[0] === null || value[0] instanceof Date) &&
    (value[1] === null || value[1] instanceof Date)
  );
}

/**
 * 检查是否为有效的日期范围
 * 
 * @param value - 待检查的值
 * @returns 是否为有效日期范围
 * 
 * @public
 */
export function isValidDateRange(value: unknown): value is ValidDateRange {
  if (!isDateRange(value)) return false;
  const [start, end] = value;
  return (
    start !== null &&
    end !== null &&
    isValidDate(start) &&
    isValidDate(end) &&
    start <= end
  );
}

/**
 * 检查是否为多日期数组
 * 
 * @param value - 待检查的值
 * @returns 是否为日期数组
 * 
 * @public
 */
export function isDatesValue(value: unknown): value is DatesValue {
  return Array.isArray(value) && value.every((item) => item instanceof Date);
}

/**
 * 检查是否为范围选择类型
 * 
 * @param type - 选择器类型
 * @returns 是否为范围类型
 * 
 * @public
 */
export function isRangePickerType(type: PickerType): boolean {
  return type.endsWith('range');
}

/**
 * 检查是否为 WeekDay 类型
 * 
 * @param value - 待检查的值
 * @returns 是否为 WeekDay
 * 
 * @public
 */
export function isWeekDay(value: unknown): value is WeekDay {
  return typeof value === 'number' && value >= 0 && value <= 6 && Number.isInteger(value);
}

/**
 * 检查是否为 Quarter 类型
 * 
 * @param value - 待检查的值
 * @returns 是否为 Quarter
 * 
 * @public
 */
export function isQuarter(value: unknown): value is Quarter {
  return typeof value === 'number' && value >= 1 && value <= 4 && Number.isInteger(value);
}

// ==================== 单元格数据类型 ====================

/**
 * 日期单元格数据
 * 
 * @remarks
 * 用于渲染日期面板中的单个日期单元格
 * 
 * @public
 */
export interface DateCell {
  /** 日期对象 */
  date: Date;

  /** 显示文本 */
  text: string | number;

  /** 单元格类型 */
  type: 'normal' | 'prev' | 'next' | 'today';

  /** 是否禁用 */
  disabled: boolean;

  /** 是否选中 */
  selected: boolean;

  /** 是否在范围内 */
  inRange: boolean;

  /** 是否为范围起点 */
  rangeStart: boolean;

  /** 是否为范围终点 */
  rangeEnd: boolean;

  /** 自定义类名（可选） */
  customClass?: string;

  /** 附加数据（可选） */
  metadata?: Record<string, any>;
}

/**
 * 月份单元格数据
 * 
 * @remarks
 * 用于渲染月份选择面板中的单个月份单元格
 * 
 * @public
 */
export interface MonthCell {
  /** 月份（0-11） */
  month: number;

  /** 显示文本 */
  text: string;

  /** 是否禁用 */
  disabled: boolean;

  /** 是否选中 */
  selected: boolean;

  /** 是否在范围内 */
  inRange: boolean;

  /** 是否为范围起点 */
  rangeStart: boolean;

  /** 是否为范围终点 */
  rangeEnd: boolean;

  /** 自定义类名（可选） */
  customClass?: string;
}

/**
 * 年份单元格数据
 * 
 * @remarks
 * 用于渲染年份选择面板中的单个年份单元格
 * 
 * @public
 */
export interface YearCell {
  /** 年份 */
  year: number;

  /** 显示文本 */
  text: string | number;

  /** 是否禁用 */
  disabled: boolean;

  /** 是否选中 */
  selected: boolean;

  /** 是否在范围内 */
  inRange: boolean;

  /** 是否为范围起点 */
  rangeStart: boolean;

  /** 是否为范围终点 */
  rangeEnd: boolean;

  /** 自定义类名（可选） */
  customClass?: string;
}

/**
 * 时间单元格数据
 * 
 * @remarks
 * 用于渲染时间选择器中的单个时间单元格
 * 
 * @public
 */
export interface TimeCell {
  /** 数值（小时/分钟/秒） */
  value: number;

  /** 显示文本 */
  text: string;

  /** 是否禁用 */
  disabled: boolean;

  /** 是否选中 */
  selected: boolean;
}

// ==================== 快捷选项和回调类型 ====================

/**
 * 快捷选项
 * 
 * @remarks
 * 用于快速选择预定义的日期或日期范围
 * 
 * @example
 * ```ts
 * const shortcuts: Shortcut[] = [
 *   {
 *     text: '今天',
 *     value: new Date(),
 *   },
 *   {
 *     text: '最近7天',
 *     value: [
 *       new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
 *       new Date()
 *     ],
 *   },
 * ];
 * ```
 * 
 * @public
 */
export interface Shortcut {
  /** 快捷选项显示文本 */
  text: string;

  /** 快捷选项对应的值 */
  value: Date | [Date, Date] | Date[];

  /** 点击回调（可选） */
  onClick?: () => void;

  /** 图标（可选） */
  icon?: string;

  /** 是否禁用（可选） */
  disabled?: boolean;

  /** 分组（可选） */
  group?: string;
}

/**
 * 禁用日期函数
 * 
 * @remarks
 * 用于判断某个日期是否应该被禁用
 * 
 * @param date - 待判断的日期
 * @returns 是否禁用
 * 
 * @example
 * ```ts
 * const disabledDate: DisabledDateFunc = (date) => {
 *   // 禁用周末
 *   return date.getDay() === 0 || date.getDay() === 6;
 * };
 * ```
 * 
 * @public
 */
export type DisabledDateFunc = (date: Date) => boolean;

/**
 * 禁用时间配置
 * 
 * @public
 */
export interface DisabledTimeConfig {
  /** 禁用的小时数组 */
  disabledHours?: number[];

  /** 禁用的分钟数组 */
  disabledMinutes?: number[];

  /** 禁用的秒数组 */
  disabledSeconds?: number[];
}

/**
 * 禁用时间函数
 * 
 * @remarks
 * 用于判断某个时间点的哪些部分应该被禁用
 * 
 * @param date - 当前日期
 * @returns 禁用配置
 * 
 * @example
 * ```ts
 * const disabledTime: DisabledTimeFunc = (date) => {
 *   return {
 *     disabledHours: [0, 1, 2, 3, 4, 5], // 禁用凌晨0-5点
 *     disabledMinutes: [], // 不禁用分钟
 *   };
 * };
 * ```
 * 
 * @public
 */
export type DisabledTimeFunc = (date: Date) => DisabledTimeConfig;

/**
 * 日期格式化选项
 */
export interface FormatOptions {
  locale?: string;
  weekStartsOn?: WeekDay;
  use12Hours?: boolean;
}

/**
 * 日期范围限制
 */
export interface DateRange {
  min?: Date;
  max?: Date;
}

/**
 * 选择器配置
 */
export interface PickerOptions {
  type: PickerType;
  format?: string;
  valueFormat?: string;
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  rangeSeparator?: string;
  defaultValue?: PickerValue;
  defaultTime?: Date | [Date, Date];
  disabledDate?: DisabledDateFunc;
  disabledTime?: DisabledTimeFunc;
  shortcuts?: Shortcut[];
  clearable?: boolean;
  editable?: boolean;
  prefixIcon?: string;
  clearIcon?: string;
  validateEvent?: boolean;
  unlinkPanels?: boolean;
  weekStartsOn?: WeekDay;
  use12Hours?: boolean;
  showWeekNumber?: boolean;
  cellClassName?: (date: Date) => string;
}

/**
 * 国际化配置
 */
export interface Locale {
  name: string;
  weekdays: string[];
  weekdaysShort: string[];
  weekdaysMin: string[];
  months: string[];
  monthsShort: string[];
  firstDayOfWeek: WeekDay;
  formats: {
    date: string;
    datetime: string;
    time: string;
    month: string;
    year: string;
    quarter: string;
  };
  meridiem: {
    am: string;
    pm: string;
  };
  ordinal?: (n: number) => string;
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  primaryColor?: string;
  borderRadius?: string;
  cellSize?: string;
  fontSize?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBgColor?: string;
  selectedBgColor?: string;
  selectedTextColor?: string;
  disabledTextColor?: string;
  disabledBgColor?: string;
  rangeBgColor?: string;
}

/**
 * 事件类型
 */
export interface PickerEvents {
  change: (value: PickerValue) => void;
  input: (value: PickerValue) => void;
  blur: () => void;
  focus: () => void;
  clear: () => void;
  visibleChange: (visible: boolean) => void;
  panelChange: (date: Date, mode: ViewType) => void;
  calendarChange: (value: PickerValue) => void;
}

/**
 * 面板位置
 */
export type Placement =
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
  | 'right-end';





