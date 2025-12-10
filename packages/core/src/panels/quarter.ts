/**
 * 季度面板数据生成器
 */

import type { QuarterCell, DateRange, DisabledDateFn, DatePickerLocale } from '../types';
import {
  createDate,
  isSameQuarter,
  getQuarter,
  startOfQuarter,
  endOfQuarter,
  isBefore,
  isAfter,
  compareDate,
} from '../utils/date';
import { defaultLocale } from '../utils/format';

export interface QuarterPanelOptions {
  /** 显示的年份 */
  viewYear: number;
  /** 选中的季度 */
  selectedDate?: Date | Date[] | null;
  /** 季度范围 */
  dateRange?: DateRange | null;
  /** 悬停季度 */
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

export interface QuarterPanelData {
  /** 年份 */
  year: number;
  /** 年份显示文本 */
  yearText: string;
  /** 季度列表 */
  quarters: QuarterCell[];
}

/**
 * 生成季度面板数据
 */
export function generateQuarterPanel(options: QuarterPanelOptions): QuarterPanelData {
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
  const currentQuarter = getQuarter(today);
  const currentYear = today.getFullYear();

  // 确定选中日期数组
  const selectedDates = normalizeSelectedDates(selectedDate);

  // 确定范围
  const range = normalizeRange(dateRange, hoverDate);

  const quarters: QuarterCell[] = [];

  for (let q = 1; q <= 4; q++) {
    // 季度第一个月
    const month = (q - 1) * 3;
    const date = createDate(viewYear, month, 1);

    // 判断是否选中
    const isSelected = isQuarterSelected(date, selectedDates);

    // 判断是否在范围内
    const { isInRange, isRangeStart, isRangeEnd } = getQuarterRangeStatus(date, range);

    // 判断是否禁用
    const isDisabled = isQuarterDisabled(date, disabledDate, minDate, maxDate);

    quarters.push({
      quarter: q,
      year: viewYear,
      text: locale.quarters[q - 1],
      isCurrentQuarter: viewYear === currentYear && q === currentQuarter,
      isSelected,
      isDisabled,
      isInRange,
      isRangeStart,
      isRangeEnd,
    });
  }

  return {
    year: viewYear,
    yearText: `${viewYear}年`,
    quarters,
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
    const startQuarter = startOfQuarter(start);
    const hoverQuarter = startOfQuarter(hoverDate);
    return {
      start: compareDate(startQuarter, hoverQuarter) <= 0 ? startQuarter : hoverQuarter,
      end: compareDate(startQuarter, hoverQuarter) <= 0 ? hoverQuarter : startQuarter,
    };
  }

  return dateRange;
}

/**
 * 判断季度是否被选中
 */
function isQuarterSelected(date: Date, selectedDates: Date[]): boolean {
  return selectedDates.some(d => isSameQuarter(date, d));
}

/**
 * 获取季度的范围状态
 */
function getQuarterRangeStatus(
  date: Date,
  range: DateRange | null
): { isInRange: boolean; isRangeStart: boolean; isRangeEnd: boolean } {
  if (!range || !range.start || !range.end) {
    return { isInRange: false, isRangeStart: false, isRangeEnd: false };
  }

  const quarterStart = startOfQuarter(date);
  const rangeStartQuarter = startOfQuarter(range.start);
  const rangeEndQuarter = startOfQuarter(range.end);

  const isRangeStart = isSameQuarter(date, range.start);
  const isRangeEnd = isSameQuarter(date, range.end);
  const isInRange = isRangeStart || isRangeEnd ||
    (quarterStart.getTime() > rangeStartQuarter.getTime() &&
      quarterStart.getTime() < rangeEndQuarter.getTime());

  return { isInRange, isRangeStart, isRangeEnd };
}

/**
 * 判断季度是否禁用
 */
function isQuarterDisabled(
  date: Date,
  disabledDate?: DisabledDateFn,
  minDate?: Date,
  maxDate?: Date
): boolean {
  const quarterEnd = endOfQuarter(date);
  const quarterStart = startOfQuarter(date);

  if (minDate && isAfter(minDate, quarterEnd)) return true;
  if (maxDate && isBefore(maxDate, quarterStart)) return true;

  if (disabledDate && disabledDate(quarterStart)) return true;

  return false;
}

/**
 * 获取季度单元格的CSS类名
 */
export function getQuarterCellClass(cell: QuarterCell, prefix = 'ldp'): string {
  const classes = [`${prefix}-quarter-panel__cell`];

  if (cell.isCurrentQuarter) classes.push(`${prefix}-quarter-panel__cell--current`);
  if (cell.isSelected) classes.push(`${prefix}-quarter-panel__cell--selected`);
  if (cell.isDisabled) classes.push(`${prefix}-quarter-panel__cell--disabled`);
  if (cell.isInRange) classes.push(`${prefix}-quarter-panel__cell--in-range`);
  if (cell.isRangeStart) classes.push(`${prefix}-quarter-panel__cell--range-start`);
  if (cell.isRangeEnd) classes.push(`${prefix}-quarter-panel__cell--range-end`);

  return classes.join(' ');
}
