/**
 * 日历面板数据生成器
 */

import type {
  DateCell,
  WeekStart,
  DateRange,
  DisabledDateFn,
  DatePickerLocale,
} from '../types';
import {
  createDate,
  cloneDate,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
  isAfter,
  isBetween,
  getWeekInfo,
  compareDate,
} from '../utils/date';
import { defaultLocale } from '../utils/format';

export interface CalendarPanelOptions {
  /** 显示的年月 */
  viewDate: Date;
  /** 选中的日期 */
  selectedDate?: Date | Date[] | null;
  /** 日期范围 */
  dateRange?: DateRange | null;
  /** 悬停日期（范围选择预览） */
  hoverDate?: Date | null;
  /** 星期首日 */
  weekStart?: WeekStart;
  /** 是否显示周数 */
  showWeekNumber?: boolean;
  /** 禁用日期函数 */
  disabledDate?: DisabledDateFn;
  /** 最小日期 */
  minDate?: Date;
  /** 最大日期 */
  maxDate?: Date;
  /** 语言配置 */
  locale?: Required<DatePickerLocale>;
  /** 是否周选择模式 */
  isWeekMode?: boolean;
}

export interface CalendarPanelData {
  /** 星期标题 */
  weekdays: string[];
  /** 日期行 */
  rows: DateCell[][];
  /** 年份 */
  year: number;
  /** 月份 (0-11) */
  month: number;
  /** 月份显示文本 */
  monthText: string;
}

/**
 * 生成日历面板数据
 */
export function generateCalendarPanel(options: CalendarPanelOptions): CalendarPanelData {
  const {
    viewDate,
    selectedDate,
    dateRange,
    hoverDate,
    weekStart = 1,
    showWeekNumber = false,
    disabledDate,
    minDate,
    maxDate,
    locale = defaultLocale,
    isWeekMode = false,
  } = options;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // 生成星期标题
  const weekdays = generateWeekdays(weekStart, locale);

  // 生成日期单元格
  const rows = generateDateCells({
    year,
    month,
    selectedDate,
    dateRange,
    hoverDate,
    weekStart,
    showWeekNumber,
    disabledDate,
    minDate,
    maxDate,
    isWeekMode,
  });

  return {
    weekdays,
    rows,
    year,
    month,
    monthText: `${year}年 ${month + 1}月`,
  };
}

/**
 * 生成星期标题
 */
function generateWeekdays(
  weekStart: WeekStart,
  locale: Required<DatePickerLocale>
): string[] {
  const weekdays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayIndex = (weekStart + i) % 7;
    weekdays.push(locale.weekdaysMin[dayIndex]);
  }
  return weekdays;
}

interface GenerateDateCellsOptions {
  year: number;
  month: number;
  selectedDate?: Date | Date[] | null;
  dateRange?: DateRange | null;
  hoverDate?: Date | null;
  weekStart: WeekStart;
  showWeekNumber: boolean;
  disabledDate?: DisabledDateFn;
  minDate?: Date;
  maxDate?: Date;
  isWeekMode: boolean;
}

/**
 * 生成日期单元格
 */
function generateDateCells(options: GenerateDateCellsOptions): DateCell[][] {
  const {
    year,
    month,
    selectedDate,
    dateRange,
    hoverDate,
    weekStart,
    showWeekNumber,
    disabledDate,
    minDate,
    maxDate,
    isWeekMode,
  } = options;

  const firstDayOfMonth = startOfMonth(createDate(year, month, 1));
  const lastDayOfMonth = endOfMonth(createDate(year, month, 1));

  // 从月份第一天所在周的第一天开始
  let currentDate = startOfWeek(firstDayOfMonth, weekStart);

  const rows: DateCell[][] = [];
  const today = new Date();

  // 确定选中日期数组
  const selectedDates = normalizeSelectedDates(selectedDate);

  // 确定范围
  const range = normalizeRange(dateRange, hoverDate);

  // 生成6行日期
  for (let week = 0; week < 6; week++) {
    const row: DateCell[] = [];

    // 获取周信息
    const weekInfo = getWeekInfo(currentDate, weekStart);

    // 判断这一周是否被选中（周选择模式）
    const isWeekSelected = isWeekMode && isWeekSelectedFn(currentDate, selectedDate, weekStart);

    for (let day = 0; day < 7; day++) {
      const date = cloneDate(currentDate);
      const isCurrentMonth = date.getMonth() === month;

      // 判断是否选中
      const isSelected = isDateSelected(date, selectedDates);

      // 判断是否在范围内
      const { isInRange, isRangeStart, isRangeEnd } = getRangeStatus(date, range);

      // 判断是否禁用
      const isDisabled = isDateDisabled(date, disabledDate, minDate, maxDate);

      row.push({
        date,
        text: String(date.getDate()),
        isCurrentMonth,
        isToday: isToday(date),
        isSelected: isWeekMode ? false : isSelected,
        isDisabled,
        isInRange,
        isRangeStart,
        isRangeEnd,
        weekNumber: showWeekNumber ? weekInfo.week : undefined,
        isWeekSelected,
      });

      currentDate = addDays(currentDate, 1);
    }

    rows.push(row);

    // 如果已经过了当月最后一天的下一周，可以提前结束
    if (week >= 4 && currentDate.getMonth() !== month && currentDate.getMonth() !== (month + 1) % 12) {
      // 但为了保持6行，我们继续
    }
  }

  return rows;
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

  // 如果只有开始日期且有悬停日期，使用悬停日期作为临时结束
  if (start && !end && hoverDate) {
    return {
      start: compareDate(start, hoverDate) <= 0 ? start : hoverDate,
      end: compareDate(start, hoverDate) <= 0 ? hoverDate : start,
    };
  }

  return dateRange;
}

/**
 * 判断日期是否被选中
 */
function isDateSelected(date: Date, selectedDates: Date[]): boolean {
  return selectedDates.some(d => isSameDay(date, d));
}

/**
 * 判断周是否被选中
 */
function isWeekSelectedFn(
  date: Date,
  selectedDate: Date | Date[] | null | undefined,
  weekStart: WeekStart
): boolean {
  if (!selectedDate) return false;

  const dates = Array.isArray(selectedDate) ? selectedDate : [selectedDate];
  const weekInfo = getWeekInfo(date, weekStart);

  return dates.some(d => {
    const info = getWeekInfo(d, weekStart);
    return info.year === weekInfo.year && info.week === weekInfo.week;
  });
}

/**
 * 获取日期的范围状态
 */
function getRangeStatus(
  date: Date,
  range: DateRange | null
): { isInRange: boolean; isRangeStart: boolean; isRangeEnd: boolean } {
  if (!range || !range.start || !range.end) {
    return { isInRange: false, isRangeStart: false, isRangeEnd: false };
  }

  const isRangeStart = isSameDay(date, range.start);
  const isRangeEnd = isSameDay(date, range.end);
  const isInRange = isRangeStart || isRangeEnd || isBetween(date, range.start, range.end);

  return { isInRange, isRangeStart, isRangeEnd };
}

/**
 * 判断日期是否禁用
 */
function isDateDisabled(
  date: Date,
  disabledDate?: DisabledDateFn,
  minDate?: Date,
  maxDate?: Date
): boolean {
  if (disabledDate && disabledDate(date)) return true;
  if (minDate && isBefore(date, minDate)) return true;
  if (maxDate && isAfter(date, maxDate)) return true;
  return false;
}

/**
 * 获取日期单元格的CSS类名
 */
export function getDateCellClass(cell: DateCell, prefix = 'ldp'): string {
  const classes = [`${prefix}-calendar__cell`];

  if (!cell.isCurrentMonth) classes.push(`${prefix}-calendar__cell--other-month`);
  if (cell.isToday) classes.push(`${prefix}-calendar__cell--today`);
  if (cell.isSelected) classes.push(`${prefix}-calendar__cell--selected`);
  if (cell.isDisabled) classes.push(`${prefix}-calendar__cell--disabled`);
  if (cell.isInRange) classes.push(`${prefix}-calendar__cell--in-range`);
  if (cell.isRangeStart) classes.push(`${prefix}-calendar__cell--range-start`);
  if (cell.isRangeEnd) classes.push(`${prefix}-calendar__cell--range-end`);
  if (cell.isWeekSelected) classes.push(`${prefix}-calendar__cell--week-selected`);

  return classes.join(' ');
}
