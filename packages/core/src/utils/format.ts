/**
 * 日期格式化工具
 */

import type { DatePickerLocale, TimeValue, WeekStart } from '../types';
import { getQuarter, getWeekInfo } from './date';

/** 默认语言配置 */
export const defaultLocale: Required<DatePickerLocale> = {
  locale: 'zh-CN',
  months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthsShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  weekdaysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  weekdaysMin: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天',
  confirm: '确定',
  clear: '清除',
  selectDate: '请选择日期',
  selectTime: '请选择时间',
  startDate: '开始日期',
  endDate: '结束日期',
  startTime: '开始时间',
  endTime: '结束时间',
  year: '年',
  month: '月',
  week: '周',
  quarter: '季度',
  quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
};

/** 英文语言配置 */
export const enLocale: Required<DatePickerLocale> = {
  locale: 'en-US',
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  today: 'Today',
  confirm: 'OK',
  clear: 'Clear',
  selectDate: 'Select date',
  selectTime: 'Select time',
  startDate: 'Start date',
  endDate: 'End date',
  startTime: 'Start time',
  endTime: 'End time',
  year: 'Year',
  month: 'Month',
  week: 'Week',
  quarter: 'Quarter',
  quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
};

/**
 * 合并语言配置
 */
export function mergeLocale(locale?: DatePickerLocale): Required<DatePickerLocale> {
  if (!locale) return defaultLocale;
  return { ...defaultLocale, ...locale };
}

/**
 * 补零
 */
export function padZero(num: number, length = 2): string {
  return String(num).padStart(length, '0');
}

/**
 * 格式化日期
 * 
 * 支持的格式化占位符：
 * - YYYY: 四位年份
 * - YY: 两位年份
 * - MM: 两位月份 (01-12)
 * - M: 月份 (1-12)
 * - DD: 两位日期 (01-31)
 * - D: 日期 (1-31)
 * - HH: 两位小时 (00-23)
 * - H: 小时 (0-23)
 * - hh: 两位小时 (01-12)
 * - h: 小时 (1-12)
 * - mm: 两位分钟 (00-59)
 * - m: 分钟 (0-59)
 * - ss: 两位秒 (00-59)
 * - s: 秒 (0-59)
 * - A: AM/PM
 * - a: am/pm
 * - W: 周数
 * - WW: 两位周数
 * - Q: 季度 (1-4)
 * - d: 星期 (0-6)
 * - dd: 星期简称 (日-六)
 * - ddd: 星期短称 (周日-周六)
 * - dddd: 星期全称 (星期日-星期六)
 */
export function formatDate(
  date: Date | null,
  format: string,
  locale: Required<DatePickerLocale> = defaultLocale,
  weekStart: WeekStart = 1
): string {
  if (!date) return '';

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const dayOfWeek = date.getDay();
  const weekInfo = getWeekInfo(date, weekStart);
  const quarter = getQuarter(date);

  const hour12 = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';

  const tokens: Record<string, string> = {
    YYYY: String(year),
    YY: String(year).slice(-2),
    MM: padZero(month + 1),
    M: String(month + 1),
    DD: padZero(day),
    D: String(day),
    HH: padZero(hour),
    H: String(hour),
    hh: padZero(hour12),
    h: String(hour12),
    mm: padZero(minute),
    m: String(minute),
    ss: padZero(second),
    s: String(second),
    A: ampm,
    a: ampm.toLowerCase(),
    WW: padZero(weekInfo.week),
    W: String(weekInfo.week),
    Q: String(quarter),
    dddd: locale.weekdays[dayOfWeek],
    ddd: locale.weekdaysShort[dayOfWeek],
    dd: locale.weekdaysMin[dayOfWeek],
    d: String(dayOfWeek),
  };

  // 按token长度从长到短排序，避免短token先匹配
  const tokenRegex = /YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|A|a|WW|W|Q|dddd|ddd|dd|d/g;

  return format.replace(tokenRegex, (match) => tokens[match] || match);
}

/**
 * 解析格式化字符串为日期
 */
export function parseFormatted(
  value: string,
  format: string,
  locale: Required<DatePickerLocale> = defaultLocale
): Date | null {
  if (!value || !format) return null;

  // 构建解析正则
  const tokenMap: Record<string, { regex: string; handler: (match: string, result: ParseResult) => void }> = {
    YYYY: {
      regex: '(\\d{4})',
      handler: (match, result) => { result.year = parseInt(match, 10); },
    },
    YY: {
      regex: '(\\d{2})',
      handler: (match, result) => { result.year = 2000 + parseInt(match, 10); },
    },
    MM: {
      regex: '(\\d{2})',
      handler: (match, result) => { result.month = parseInt(match, 10) - 1; },
    },
    M: {
      regex: '(\\d{1,2})',
      handler: (match, result) => { result.month = parseInt(match, 10) - 1; },
    },
    DD: {
      regex: '(\\d{2})',
      handler: (match, result) => { result.day = parseInt(match, 10); },
    },
    D: {
      regex: '(\\d{1,2})',
      handler: (match, result) => { result.day = parseInt(match, 10); },
    },
    HH: {
      regex: '(\\d{2})',
      handler: (match, result) => { result.hour = parseInt(match, 10); },
    },
    H: {
      regex: '(\\d{1,2})',
      handler: (match, result) => { result.hour = parseInt(match, 10); },
    },
    hh: {
      regex: '(\\d{2})',
      handler: (match, result) => { result.hour = parseInt(match, 10); },
    },
    h: {
      regex: '(\\d{1,2})',
      handler: (match, result) => { result.hour = parseInt(match, 10); },
    },
    mm: {
      regex: '(\\d{2})',
      handler: (match, result) => { result.minute = parseInt(match, 10); },
    },
    m: {
      regex: '(\\d{1,2})',
      handler: (match, result) => { result.minute = parseInt(match, 10); },
    },
    ss: {
      regex: '(\\d{2})',
      handler: (match, result) => { result.second = parseInt(match, 10); },
    },
    s: {
      regex: '(\\d{1,2})',
      handler: (match, result) => { result.second = parseInt(match, 10); },
    },
    A: {
      regex: '(AM|PM)',
      handler: (match, result) => { result.ampm = match; },
    },
    a: {
      regex: '(am|pm)',
      handler: (match, result) => { result.ampm = match.toUpperCase(); },
    },
    W: {
      regex: '(\\d{1,2})',
      handler: (match, result) => { result.week = parseInt(match, 10); },
    },
    WW: {
      regex: '(\\d{2})',
      handler: (match, result) => { result.week = parseInt(match, 10); },
    },
    Q: {
      regex: '(\\d)',
      handler: (match, result) => { result.quarter = parseInt(match, 10); },
    },
  };

  interface ParseResult {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    ampm?: string;
    week?: number;
    quarter?: number;
  }

  // 提取tokens
  const tokens: string[] = [];
  let regexStr = format.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  const tokenRegex = /YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|A|a|WW|W|Q/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(format)) !== null) {
    tokens.push(match[0]);
  }

  // 构建正则
  for (const token of Object.keys(tokenMap).sort((a, b) => b.length - a.length)) {
    regexStr = regexStr.replace(new RegExp(token, 'g'), tokenMap[token].regex);
  }

  const regex = new RegExp(`^${regexStr}$`);
  const matches = value.match(regex);

  if (!matches) return null;

  const result: ParseResult = {
    year: new Date().getFullYear(),
    month: 0,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
  };

  // 处理匹配结果
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const matchValue = matches[i + 1];
    if (tokenMap[token]) {
      tokenMap[token].handler(matchValue, result);
    }
  }

  // 处理12小时制
  if (result.ampm === 'PM' && result.hour !== undefined && result.hour < 12) {
    result.hour += 12;
  } else if (result.ampm === 'AM' && result.hour === 12) {
    result.hour = 0;
  }

  return new Date(
    result.year!,
    result.month!,
    result.day!,
    result.hour!,
    result.minute!,
    result.second!
  );
}

/**
 * 格式化时间
 */
export function formatTime(time: TimeValue, format = 'HH:mm:ss'): string {
  const { hour, minute, second } = time;
  const hour12 = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';

  const tokens: Record<string, string> = {
    HH: padZero(hour),
    H: String(hour),
    hh: padZero(hour12),
    h: String(hour12),
    mm: padZero(minute),
    m: String(minute),
    ss: padZero(second),
    s: String(second),
    A: ampm,
    a: ampm.toLowerCase(),
  };

  const tokenRegex = /HH|H|hh|h|mm|m|ss|s|A|a/g;
  return format.replace(tokenRegex, (match) => tokens[match] || match);
}

/**
 * 格式化周
 */
export function formatWeek(
  date: Date,
  locale: Required<DatePickerLocale> = defaultLocale,
  weekStart: WeekStart = 1
): string {
  const weekInfo = getWeekInfo(date, weekStart);
  return `${weekInfo.year}-${weekInfo.week}${locale.week}`;
}

/**
 * 格式化月份
 */
export function formatMonth(
  date: Date,
  locale: Required<DatePickerLocale> = defaultLocale
): string {
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}`;
}

/**
 * 格式化季度
 */
export function formatQuarter(
  date: Date,
  locale: Required<DatePickerLocale> = defaultLocale
): string {
  const quarter = getQuarter(date);
  return `${date.getFullYear()}-${locale.quarters[quarter - 1]}`;
}

/**
 * 格式化年份
 */
export function formatYear(date: Date): string {
  return String(date.getFullYear());
}

/**
 * 获取格式对应的占位符
 */
export function getPlaceholder(
  mode: string,
  locale: Required<DatePickerLocale> = defaultLocale
): string {
  const placeholders: Record<string, string> = {
    date: locale.selectDate,
    datetime: locale.selectDate,
    week: `请选择${locale.week}`,
    month: `请选择${locale.month}`,
    quarter: `请选择${locale.quarter}`,
    year: `请选择${locale.year}`,
    time: locale.selectTime,
  };
  return placeholders[mode] || locale.selectDate;
}

/**
 * 获取默认格式
 */
export function getDefaultFormat(mode: string, showTime = false): string {
  const formats: Record<string, string> = {
    date: showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
    datetime: 'YYYY-MM-DD HH:mm:ss',
    week: 'YYYY-WW周',
    month: 'YYYY-MM',
    quarter: 'YYYY-QQ',
    year: 'YYYY',
    time: 'HH:mm:ss',
  };
  return formats[mode] || 'YYYY-MM-DD';
}
