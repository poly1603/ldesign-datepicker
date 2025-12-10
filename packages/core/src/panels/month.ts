/**
 * 月份面板数据生成器
 */

import type { MonthCell, DateRange, DisabledDateFn, DatePickerLocale } from '../types';
import {
  createDate,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  isBefore,
  isAfter,
  compareDate,
} from '../utils/date';
import { defaultLocale } from '../utils/format';

export interface MonthPanelOptions {
  /** 显示的年份 */
  viewYear: number;
  /** 选中的月份 */
  selectedDate?: Date | Date[] | null;
  /** 月份范围 */
  dateRange?: DateRange | null;
  /** 悬停月份 */
  hoverDate?: Date | null;
  /** 禁用日期函数 */
  disabledDate?: DisabledDateFn;
  /** 最小日期 */
  minDate?: Date;
  /** 最大日期 */
  maxDate?: Date;
  /** 语言配置 */
  locale?: Required<DatePickerLocale>;
}

export interface MonthPanelData {
  /** 年份 */
  year: number;
  /** 年份显示文本 */
  yearText: string;
  /** 月份行 */
  rows: MonthCell[][];
}

/**
 * 生成月份面板数据
 */
export function generateMonthPanel(options: MonthPanelOptions): MonthPanelData {
  const {
    viewYear,
    selectedDate,
    dateRange,
    hoverDate,
    disabledDate,
    minDate,
    maxDate,
    locale = defaultLocale,
  } = options;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // 确定选中日期数组
  const selectedDates = normalizeSelectedDates(selectedDate);

  // 确定范围
  const range = normalizeRange(dateRange, hoverDate);

  const rows: MonthCell[][] = [];

  // 4行3列
  for (let row = 0; row < 4; row++) {
    const cells: MonthCell[] = [];

    for (let col = 0; col < 3; col++) {
      const month = row * 3 + col;
      const date = createDate(viewYear, month, 1);

      // 判断是否选中
      const isSelected = isMonthSelected(date, selectedDates);

      // 判断是否在范围内
      const { isInRange, isRangeStart, isRangeEnd } = getMonthRangeStatus(date, range);

      // 判断是否禁用
      const isDisabled = isMonthDisabled(date, disabledDate, minDate, maxDate);

      cells.push({
        month,
        year: viewYear,
        text: locale.monthsShort[month],
        isCurrentMonth: viewYear === currentYear && month === currentMonth,
        isSelected,
        isDisabled,
        isInRange,
        isRangeStart,
        isRangeEnd,
      });
    }

    rows.push(cells);
  }

  return {
    year: viewYear,
    yearText: `${viewYear}年`,
    rows,
  };
}

/**
 * 规范化选中日期为数组
 */
function normalizeSelectedDates(selectedDate?: Date | Date[] | null): Date[] {
  if (!selectedDate) return [];
  if (Array.isArray(selectedDate)) return selectedDate;
  return [selectedDate];
}

/**
 * 规范化范围
 */
function normalizeRange(
  dateRange?: DateRange | null,
  hoverDate?: Date | null
): DateRange | null {
  if (!dateRange) return null;

  const { start, end } = dateRange;

  if (start && !end && hoverDate) {
    const startMonth = startOfMonth(start);
    const hoverMonth = startOfMonth(hoverDate);
    return {
      start: compareDate(startMonth, hoverMonth) <= 0 ? startMonth : hoverMonth,
      end: compareDate(startMonth, hoverMonth) <= 0 ? hoverMonth : startMonth,
    };
  }

  return dateRange;
}

/**
 * 判断月份是否被选中
 */
function isMonthSelected(date: Date, selectedDates: Date[]): boolean {
  return selectedDates.some(d => isSameMonth(date, d));
}

/**
 * 获取月份的范围状态
 */
function getMonthRangeStatus(
  date: Date,
  range: DateRange | null
): { isInRange: boolean; isRangeStart: boolean; isRangeEnd: boolean } {
  if (!range || !range.start || !range.end) {
    return { isInRange: false, isRangeStart: false, isRangeEnd: false };
  }

  const monthStart = startOfMonth(date);
  const rangeStartMonth = startOfMonth(range.start);
  const rangeEndMonth = startOfMonth(range.end);

  const isRangeStart = isSameMonth(date, range.start);
  const isRangeEnd = isSameMonth(date, range.end);
  const isInRange = isRangeStart || isRangeEnd ||
    (monthStart.getTime() > rangeStartMonth.getTime() &&
      monthStart.getTime() < rangeEndMonth.getTime());

  return { isInRange, isRangeStart, isRangeEnd };
}

/**
 * 判断月份是否禁用
 */
function isMonthDisabled(
  date: Date,
  disabledDate?: DisabledDateFn,
  minDate?: Date,
  maxDate?: Date
): boolean {
  const monthEnd = endOfMonth(date);
  const monthStart = startOfMonth(date);

  // 如果整个月份都在禁用范围内
  if (minDate && isAfter(minDate, monthEnd)) return true;
  if (maxDate && isBefore(maxDate, monthStart)) return true;

  // 使用禁用函数检查月份第一天
  if (disabledDate && disabledDate(monthStart)) return true;

  return false;
}

/**
 * 获取月份单元格的CSS类名
 */
export function getMonthCellClass(cell: MonthCell, prefix = 'ldp'): string {
  const classes = [`${prefix}-month-panel__cell`];

  if (cell.isCurrentMonth) classes.push(`${prefix}-month-panel__cell--current`);
  if (cell.isSelected) classes.push(`${prefix}-month-panel__cell--selected`);
  if (cell.isDisabled) classes.push(`${prefix}-month-panel__cell--disabled`);
  if (cell.isInRange) classes.push(`${prefix}-month-panel__cell--in-range`);
  if (cell.isRangeStart) classes.push(`${prefix}-month-panel__cell--range-start`);
  if (cell.isRangeEnd) classes.push(`${prefix}-month-panel__cell--range-end`);

  return classes.join(' ');
}
