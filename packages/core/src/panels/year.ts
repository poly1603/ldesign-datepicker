/**
 * 年份面板数据生成器
 */

import type { YearCell, DateRange, DisabledDateFn } from '../types';
import {
  createDate,
  isSameYear,
  startOfYear,
  endOfYear,
  getDecadeRange,
  isBefore,
  isAfter,
  compareDate,
} from '../utils/date';

export interface YearPanelOptions {
  /** 显示的十年起始年份 */
  viewDecadeStart: number;
  /** 选中的年份 */
  selectedDate?: Date | Date[] | null;
  /** 年份范围 */
  dateRange?: DateRange | null;
  /** 悬停年份 */
  hoverDate?: Date | null;
  /** 禁用日期函数 */
  disabledDate?: DisabledDateFn;
  /** 最小日期 */
  minDate?: Date;
  /** 最大日期 */
  maxDate?: Date;
}

export interface YearPanelData {
  /** 十年范围开始 */
  decadeStart: number;
  /** 十年范围结束 */
  decadeEnd: number;
  /** 范围显示文本 */
  decadeText: string;
  /** 年份行 */
  rows: YearCell[][];
}

/**
 * 生成年份面板数据
 */
export function generateYearPanel(options: YearPanelOptions): YearPanelData {
  const {
    viewDecadeStart,
    selectedDate,
    dateRange,
    hoverDate,
    disabledDate,
    minDate,
    maxDate,
  } = options;

  const today = new Date();
  const currentYear = today.getFullYear();

  // 确定选中日期数组
  const selectedDates = normalizeSelectedDates(selectedDate);

  // 确定范围
  const range = normalizeRange(dateRange, hoverDate);

  // 十年范围（包含前后各一年，共12年）
  const decadeStart = viewDecadeStart;
  const decadeEnd = decadeStart + 9;

  const rows: YearCell[][] = [];
  let yearIndex = decadeStart - 1; // 从前一年开始

  // 4行3列，共12年
  for (let row = 0; row < 4; row++) {
    const cells: YearCell[] = [];

    for (let col = 0; col < 3; col++) {
      const year = yearIndex;
      const date = createDate(year, 0, 1);

      // 判断是否在当前十年范围内
      const isInDecade = year >= decadeStart && year <= decadeEnd;

      // 判断是否选中
      const isSelected = isYearSelected(date, selectedDates);

      // 判断是否在范围内
      const { isInRange, isRangeStart, isRangeEnd } = getYearRangeStatus(date, range);

      // 判断是否禁用
      const isDisabled = isYearDisabled(date, disabledDate, minDate, maxDate);

      cells.push({
        year,
        text: String(year),
        isCurrentYear: year === currentYear,
        isSelected,
        isDisabled,
        isInRange,
        isRangeStart,
        isRangeEnd,
        isInDecade,
      });

      yearIndex++;
    }

    rows.push(cells);
  }

  return {
    decadeStart,
    decadeEnd,
    decadeText: `${decadeStart}年-${decadeEnd}年`,
    rows,
  };
}

/**
 * 获取日期所在的十年起始年份
 */
export function getDecadeStart(date: Date): number {
  const [start] = getDecadeRange(date);
  return start;
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
    const startYear = startOfYear(start);
    const hoverYear = startOfYear(hoverDate);
    return {
      start: compareDate(startYear, hoverYear) <= 0 ? startYear : hoverYear,
      end: compareDate(startYear, hoverYear) <= 0 ? hoverYear : startYear,
    };
  }

  return dateRange;
}

/**
 * 判断年份是否被选中
 */
function isYearSelected(date: Date, selectedDates: Date[]): boolean {
  return selectedDates.some(d => isSameYear(date, d));
}

/**
 * 获取年份的范围状态
 */
function getYearRangeStatus(
  date: Date,
  range: DateRange | null
): { isInRange: boolean; isRangeStart: boolean; isRangeEnd: boolean } {
  if (!range || !range.start || !range.end) {
    return { isInRange: false, isRangeStart: false, isRangeEnd: false };
  }

  const yearStart = startOfYear(date);
  const rangeStartYear = startOfYear(range.start);
  const rangeEndYear = startOfYear(range.end);

  const isRangeStart = isSameYear(date, range.start);
  const isRangeEnd = isSameYear(date, range.end);
  const isInRange = isRangeStart || isRangeEnd ||
    (yearStart.getTime() > rangeStartYear.getTime() &&
      yearStart.getTime() < rangeEndYear.getTime());

  return { isInRange, isRangeStart, isRangeEnd };
}

/**
 * 判断年份是否禁用
 */
function isYearDisabled(
  date: Date,
  disabledDate?: DisabledDateFn,
  minDate?: Date,
  maxDate?: Date
): boolean {
  const yearEnd = endOfYear(date);
  const yearStart = startOfYear(date);

  if (minDate && isAfter(minDate, yearEnd)) return true;
  if (maxDate && isBefore(maxDate, yearStart)) return true;

  if (disabledDate && disabledDate(yearStart)) return true;

  return false;
}

/**
 * 获取年份单元格的CSS类名
 */
export function getYearCellClass(cell: YearCell, prefix = 'ldp'): string {
  const classes = [`${prefix}-year-panel__cell`];

  if (!cell.isInDecade) classes.push(`${prefix}-year-panel__cell--other-decade`);
  if (cell.isCurrentYear) classes.push(`${prefix}-year-panel__cell--current`);
  if (cell.isSelected) classes.push(`${prefix}-year-panel__cell--selected`);
  if (cell.isDisabled) classes.push(`${prefix}-year-panel__cell--disabled`);
  if (cell.isInRange) classes.push(`${prefix}-year-panel__cell--in-range`);
  if (cell.isRangeStart) classes.push(`${prefix}-year-panel__cell--range-start`);
  if (cell.isRangeEnd) classes.push(`${prefix}-year-panel__cell--range-end`);

  return classes.join(' ');
}
