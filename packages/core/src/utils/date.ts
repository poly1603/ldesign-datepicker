/**
 * 日期工具函数
 */

import type { WeekStart, WeekInfo, DateRange, TimeValue } from '../types';

/**
 * 创建日期对象（去除时间部分）
 */
export function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * 创建日期时间对象
 */
export function createDateTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
): Date {
  return new Date(year, month, day, hour, minute, second, 0);
}

/**
 * 克隆日期
 */
export function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

/**
 * 获取今天（不含时间）
 */
export function getToday(): Date {
  const now = new Date();
  return createDate(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * 获取当前时间
 */
export function getNow(): Date {
  return new Date();
}

/**
 * 判断两个日期是否同一天
 */
export function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 判断两个日期是否同一月
 */
export function isSameMonth(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

/**
 * 判断两个日期是否同一年
 */
export function isSameYear(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear();
}

/**
 * 判断两个日期是否同一季度
 */
export function isSameQuarter(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    getQuarter(date1) === getQuarter(date2)
  );
}

/**
 * 判断两个日期是否同一周
 */
export function isSameWeek(date1: Date | null, date2: Date | null, weekStart: WeekStart = 1): boolean {
  if (!date1 || !date2) return false;
  const week1 = getWeekInfo(date1, weekStart);
  const week2 = getWeekInfo(date2, weekStart);
  return week1.year === week2.year && week1.week === week2.week;
}

/**
 * 判断日期是否在范围内
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  if (!range.start || !range.end) return false;
  const time = date.getTime();
  const start = startOfDay(range.start).getTime();
  const end = startOfDay(range.end).getTime();
  return time >= start && time <= end;
}

/**
 * 判断日期是否在两个日期之间
 */
export function isBetween(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const time = startOfDay(date).getTime();
  const startTime = startOfDay(start).getTime();
  const endTime = startOfDay(end).getTime();
  const minTime = Math.min(startTime, endTime);
  const maxTime = Math.max(startTime, endTime);
  return time > minTime && time < maxTime;
}

/**
 * 判断日期1是否在日期2之前
 */
export function isBefore(date1: Date, date2: Date): boolean {
  return startOfDay(date1).getTime() < startOfDay(date2).getTime();
}

/**
 * 判断日期1是否在日期2之后
 */
export function isAfter(date1: Date, date2: Date): boolean {
  return startOfDay(date1).getTime() > startOfDay(date2).getTime();
}

/**
 * 判断日期是否是今天
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, getToday());
}

/**
 * 获取一天的开始
 */
export function startOfDay(date: Date): Date {
  const d = cloneDate(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取一天的结束
 */
export function endOfDay(date: Date): Date {
  const d = cloneDate(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 获取月份的第一天
 */
export function startOfMonth(date: Date): Date {
  return createDate(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 获取月份的最后一天
 */
export function endOfMonth(date: Date): Date {
  return createDate(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * 获取年份的第一天
 */
export function startOfYear(date: Date): Date {
  return createDate(date.getFullYear(), 0, 1);
}

/**
 * 获取年份的最后一天
 */
export function endOfYear(date: Date): Date {
  return createDate(date.getFullYear(), 11, 31);
}

/**
 * 获取季度的第一天
 */
export function startOfQuarter(date: Date): Date {
  const quarter = getQuarter(date);
  const month = (quarter - 1) * 3;
  return createDate(date.getFullYear(), month, 1);
}

/**
 * 获取季度的最后一天
 */
export function endOfQuarter(date: Date): Date {
  const quarter = getQuarter(date);
  const month = quarter * 3;
  return createDate(date.getFullYear(), month, 0);
}

/**
 * 获取周的第一天
 */
export function startOfWeek(date: Date, weekStart: WeekStart = 1): Date {
  const d = cloneDate(date);
  const day = d.getDay();
  const diff = (day < weekStart ? 7 : 0) + day - weekStart;
  d.setDate(d.getDate() - diff);
  return startOfDay(d);
}

/**
 * 获取周的最后一天
 */
export function endOfWeek(date: Date, weekStart: WeekStart = 1): Date {
  const start = startOfWeek(date, weekStart);
  start.setDate(start.getDate() + 6);
  return startOfDay(start);
}

/**
 * 增加天数
 */
export function addDays(date: Date, days: number): Date {
  const d = cloneDate(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * 增加月份
 */
export function addMonths(date: Date, months: number): Date {
  const d = cloneDate(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // 处理月份天数不同的情况
  if (d.getDate() !== day) {
    d.setDate(0); // 设置为上月最后一天
  }
  return d;
}

/**
 * 增加年份
 */
export function addYears(date: Date, years: number): Date {
  const d = cloneDate(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/**
 * 增加周数
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * 增加季度
 */
export function addQuarters(date: Date, quarters: number): Date {
  return addMonths(date, quarters * 3);
}

/**
 * 获取季度 (1-4)
 */
export function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

/**
 * 设置季度
 */
export function setQuarter(date: Date, quarter: number): Date {
  const d = cloneDate(date);
  const month = (quarter - 1) * 3;
  d.setMonth(month);
  return d;
}

/**
 * 获取月份天数
 */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * 获取年份天数
 */
export function getDaysInYear(date: Date): number {
  return isLeapYear(date) ? 366 : 365;
}

/**
 * 判断是否闰年
 */
export function isLeapYear(date: Date): boolean {
  const year = date.getFullYear();
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 获取ISO周数信息
 */
export function getWeekInfo(date: Date, weekStart: WeekStart = 1): WeekInfo {
  const d = cloneDate(date);
  d.setHours(0, 0, 0, 0);

  // 设置到周四（ISO周数以周四为准）
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));

  // 获取年份第一周的周四
  const yearStart = new Date(d.getFullYear(), 0, 4);

  // 计算周数
  const week = Math.round(((d.getTime() - yearStart.getTime()) / 86400000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7) + 1;

  // 获取周的开始和结束日期
  const weekStartDate = startOfWeek(date, weekStart);
  const weekEndDate = endOfWeek(date, weekStart);

  return {
    year: d.getFullYear(),
    week,
    startDate: weekStartDate,
    endDate: weekEndDate,
  };
}

/**
 * 根据年份和周数获取日期
 */
export function getDateFromWeek(year: number, week: number, weekStart: WeekStart = 1): Date {
  // 获取该年第一天
  const jan1 = new Date(year, 0, 1);
  // 获取该年第一周的第一天
  const firstWeekStart = startOfWeek(jan1, weekStart);
  // 如果第一天不在第一周，则第一周从下一周开始
  const firstDay = jan1.getDay();
  const daysToAdd = (week - 1) * 7;

  // 计算目标周的开始日期
  const result = addDays(firstWeekStart, daysToAdd);

  // 调整：如果第一天在周的后半部分，需要加一周
  if (firstDay > weekStart && firstDay <= weekStart + 3) {
    return addDays(result, 7);
  }

  return result;
}

/**
 * 获取十年范围
 */
export function getDecadeRange(date: Date): [number, number] {
  const year = date.getFullYear();
  const start = Math.floor(year / 10) * 10;
  return [start, start + 9];
}

/**
 * 设置时间
 */
export function setTime(date: Date, time: TimeValue): Date {
  const d = cloneDate(date);
  d.setHours(time.hour, time.minute, time.second, 0);
  return d;
}

/**
 * 获取时间
 */
export function getTime(date: Date): TimeValue {
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
}

/**
 * 比较两个日期
 */
export function compareDate(date1: Date, date2: Date): number {
  const time1 = startOfDay(date1).getTime();
  const time2 = startOfDay(date2).getTime();
  if (time1 < time2) return -1;
  if (time1 > time2) return 1;
  return 0;
}

/**
 * 获取较小的日期
 */
export function minDate(date1: Date | null, date2: Date | null): Date | null {
  if (!date1) return date2;
  if (!date2) return date1;
  return compareDate(date1, date2) <= 0 ? date1 : date2;
}

/**
 * 获取较大的日期
 */
export function maxDate(date1: Date | null, date2: Date | null): Date | null {
  if (!date1) return date2;
  if (!date2) return date1;
  return compareDate(date1, date2) >= 0 ? date1 : date2;
}

/**
 * 规范化日期范围（确保start <= end）
 */
export function normalizeRange(range: DateRange): DateRange {
  if (!range.start || !range.end) return range;
  if (compareDate(range.start, range.end) > 0) {
    return { start: range.end, end: range.start };
  }
  return range;
}

/**
 * 判断日期是否有效
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 解析日期字符串
 */
export function parseDate(value: string | number | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }
  const date = new Date(value);
  return isValidDate(date) ? date : null;
}

/**
 * 生成日期数组（从start到end）
 */
export function generateDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  let current = startOfDay(start);
  const endDate = startOfDay(end);

  while (current.getTime() <= endDate.getTime()) {
    dates.push(current);
    current = addDays(current, 1);
  }

  return dates;
}
