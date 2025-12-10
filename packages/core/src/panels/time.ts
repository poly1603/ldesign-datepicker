/**
 * 时间面板数据生成器
 */

import type { TimeCell, TimeValue, DisabledTimeFn } from '../types';
import { padZero } from '../utils/format';

export interface TimePanelOptions {
  /** 选中的时间 */
  value?: TimeValue;
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
  /** 禁用时间函数 */
  disabledTime?: DisabledTimeFn;
  /** 日期（用于禁用时间判断） */
  date?: Date;
}

export interface TimePanelData {
  /** 小时列表 */
  hours: TimeCell[];
  /** 分钟列表 */
  minutes: TimeCell[];
  /** 秒列表 */
  seconds: TimeCell[];
  /** AM/PM列表（12小时制） */
  periods?: TimeCell[];
  /** 当前选中的时间 */
  value: TimeValue;
  /** 是否显示秒 */
  showSeconds: boolean;
  /** 是否12小时制 */
  is12Hours: boolean;
}

/**
 * 生成时间面板数据
 */
export function generateTimePanel(options: TimePanelOptions): TimePanelData {
  const {
    value = { hour: 0, minute: 0, second: 0 },
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    use12Hours = false,
    hideSeconds = false,
    disabledTime,
    date,
  } = options;

  // 获取禁用配置
  const disabled = disabledTime && date ? disabledTime(date) : {};
  const disabledHours = new Set(disabled.disabledHours || []);
  const disabledMinutes = new Set(disabled.disabledMinutes || []);
  const disabledSeconds = new Set(disabled.disabledSeconds || []);

  // 生成小时列表
  const hours = generateHours(value.hour, hourStep, use12Hours, disabledHours);

  // 生成分钟列表
  const minutes = generateMinutes(value.minute, minuteStep, disabledMinutes);

  // 生成秒列表
  const seconds = generateSeconds(value.second, secondStep, disabledSeconds);

  // 生成AM/PM列表（12小时制）
  const periods = use12Hours ? generatePeriods(value.hour) : undefined;

  return {
    hours,
    minutes,
    seconds,
    periods,
    value,
    showSeconds: !hideSeconds,
    is12Hours: use12Hours,
  };
}

/**
 * 生成小时列表
 */
function generateHours(
  selectedHour: number,
  step: number,
  use12Hours: boolean,
  disabledHours: Set<number>
): TimeCell[] {
  const cells: TimeCell[] = [];
  const maxHour = use12Hours ? 12 : 24;
  const minHour = use12Hours ? 1 : 0;

  for (let h = minHour; h < (use12Hours ? maxHour + 1 : maxHour); h += step) {
    const hour = use12Hours ? h : h;
    const displayHour = use12Hours ? h : h;

    // 12小时制转24小时制进行选中判断
    let isSelected = false;
    if (use12Hours) {
      const isPM = selectedHour >= 12;
      const selected12Hour = selectedHour % 12 || 12;
      isSelected = h === selected12Hour;
    } else {
      isSelected = h === selectedHour;
    }

    cells.push({
      value: hour,
      text: padZero(displayHour),
      isSelected,
      isDisabled: disabledHours.has(hour),
    });
  }

  return cells;
}

/**
 * 生成分钟列表
 */
function generateMinutes(
  selectedMinute: number,
  step: number,
  disabledMinutes: Set<number>
): TimeCell[] {
  const cells: TimeCell[] = [];

  for (let m = 0; m < 60; m += step) {
    cells.push({
      value: m,
      text: padZero(m),
      isSelected: m === selectedMinute,
      isDisabled: disabledMinutes.has(m),
    });
  }

  return cells;
}

/**
 * 生成秒列表
 */
function generateSeconds(
  selectedSecond: number,
  step: number,
  disabledSeconds: Set<number>
): TimeCell[] {
  const cells: TimeCell[] = [];

  for (let s = 0; s < 60; s += step) {
    cells.push({
      value: s,
      text: padZero(s),
      isSelected: s === selectedSecond,
      isDisabled: disabledSeconds.has(s),
    });
  }

  return cells;
}

/**
 * 生成AM/PM列表
 */
function generatePeriods(selectedHour: number): TimeCell[] {
  const isPM = selectedHour >= 12;

  return [
    {
      value: 0,
      text: 'AM',
      isSelected: !isPM,
      isDisabled: false,
    },
    {
      value: 1,
      text: 'PM',
      isSelected: isPM,
      isDisabled: false,
    },
  ];
}

/**
 * 获取时间单元格的CSS类名
 */
export function getTimeCellClass(cell: TimeCell, prefix = 'ldp'): string {
  const classes = [`${prefix}-time-panel__cell`];

  if (cell.isSelected) classes.push(`${prefix}-time-panel__cell--selected`);
  if (cell.isDisabled) classes.push(`${prefix}-time-panel__cell--disabled`);

  return classes.join(' ');
}

/**
 * 将12小时制转换为24小时制
 */
export function to24Hour(hour: number, isPM: boolean): number {
  if (isPM) {
    return hour === 12 ? 12 : hour + 12;
  }
  return hour === 12 ? 0 : hour;
}

/**
 * 将24小时制转换为12小时制
 */
export function to12Hour(hour: number): { hour: number; isPM: boolean } {
  const isPM = hour >= 12;
  const hour12 = hour % 12 || 12;
  return { hour: hour12, isPM };
}

/**
 * 格式化时间值
 */
export function formatTimeValue(
  value: TimeValue,
  format = 'HH:mm:ss',
  use12Hours = false
): string {
  const { hour, minute, second } = value;

  if (use12Hours) {
    const { hour: h12, isPM } = to12Hour(hour);
    return format
      .replace('HH', padZero(h12))
      .replace('H', String(h12))
      .replace('hh', padZero(h12))
      .replace('h', String(h12))
      .replace('mm', padZero(minute))
      .replace('m', String(minute))
      .replace('ss', padZero(second))
      .replace('s', String(second))
      .replace('A', isPM ? 'PM' : 'AM')
      .replace('a', isPM ? 'pm' : 'am');
  }

  return format
    .replace('HH', padZero(hour))
    .replace('H', String(hour))
    .replace('mm', padZero(minute))
    .replace('m', String(minute))
    .replace('ss', padZero(second))
    .replace('s', String(second));
}
