/**
 * 时区面板
 */

import { TimezoneCalculator, COMMON_TIMEZONES, type TimezoneInfo } from '../calculators/Timezone';

/**
 * 时区单元格数据
 */
export interface TimezoneCell {
  /** 时区信息 */
  timezone: TimezoneInfo;

  /** 当前时间 */
  currentTime: Date;

  /** 是否选中 */
  selected: boolean;

  /** 是否禁用 */
  disabled: boolean;

  /** 时差描述 */
  offsetText: string;
}

/**
 * 时区面板选项
 */
export interface TimezonePanelOptions {
  /** 当前选中的时区 */
  selectedTimezone?: string;

  /** 基准时间 */
  baseTime?: Date;

  /** 禁用的时区列表 */
  disabledTimezones?: string[];

  /** 搜索关键词 */
  searchQuery?: string;

  /** 是否按地区分组 */
  groupByRegion?: boolean;
}

/**
 * 时区面板类
 */
export class TimezonePanel {
  private options: Required<TimezonePanelOptions>;

  constructor(options: TimezonePanelOptions = {}) {
    this.options = {
      selectedTimezone: options.selectedTimezone ?? TimezoneCalculator.getCurrentTimezone(),
      baseTime: options.baseTime ?? new Date(),
      disabledTimezones: options.disabledTimezones ?? [],
      searchQuery: options.searchQuery ?? '',
      groupByRegion: options.groupByRegion ?? true,
    };
  }

  /**
   * 生成时区单元格数据
   */
  generateCells(): TimezoneCell[] {
    let timezones = [...COMMON_TIMEZONES];

    // 搜索过滤
    if (this.options.searchQuery) {
      timezones = TimezoneCalculator.searchTimezones(this.options.searchQuery);
    }

    return timezones.map((timezone) => this.createTimezoneCell(timezone));
  }

  /**
   * 按地区分组
   */
  generateGroupedCells(): Record<string, TimezoneCell[]> {
    const cells = this.generateCells();
    const groups: Record<string, TimezoneCell[]> = {};

    cells.forEach((cell) => {
      const region = cell.timezone.id.split('/')[0] || 'Other';

      if (!groups[region]) {
        groups[region] = [];
      }

      groups[region]!.push(cell);
    });

    return groups;
  }

  /**
   * 创建时区单元格
   */
  private createTimezoneCell(timezone: TimezoneInfo): TimezoneCell {
    const { selectedTimezone, baseTime, disabledTimezones } = this.options;

    // 计算当前时区的时间
    const conversion = TimezoneCalculator.convertTimezone(
      baseTime,
      TimezoneCalculator.getCurrentTimezone(),
      timezone.id
    );

    return {
      timezone,
      currentTime: conversion.targetTime,
      selected: timezone.id === selectedTimezone,
      disabled: disabledTimezones.includes(timezone.id),
      offsetText: TimezoneCalculator.formatUTCOffset(timezone.offset),
    };
  }

  /**
   * 搜索时区
   */
  search(query: string): TimezoneCell[] {
    this.options.searchQuery = query;
    return this.generateCells();
  }

  /**
   * 获取时差描述
   */
  getTimeDifferenceText(sourceTimezone: string, targetTimezone: string): string {
    const sourceOffset = TimezoneCalculator.getTimezoneOffset(sourceTimezone);
    const targetOffset = TimezoneCalculator.getTimezoneOffset(targetTimezone);

    const diffMinutes = targetOffset - sourceOffset;
    const diffHours = Math.abs(diffMinutes) / 60;

    if (diffMinutes === 0) {
      return '相同时区';
    }

    const direction = diffMinutes > 0 ? '快' : '慢';
    return `${direction} ${diffHours} 小时`;
  }
}

/**
 * 时区比较面板
 * 用于并排显示多个时区的时间
 */
export class TimezoneComparisonPanel {
  private timezones: string[] = [];
  private baseTime: Date;

  constructor(timezones: string[], baseTime: Date = new Date()) {
    this.timezones = timezones;
    this.baseTime = baseTime;
  }

  /**
   * 生成对比数据
   */
  generateComparisonData(): Array<{
    timezone: TimezoneInfo;
    time: Date;
    offsetText: string;
    timeDiff: string;
  }> {
    const currentTimezone = TimezoneCalculator.getCurrentTimezone();

    return this.timezones.map((timezoneId) => {
      const timezone = TimezoneCalculator.getTimezoneInfo(timezoneId);
      if (!timezone) {
        throw new Error(`Invalid timezone: ${timezoneId}`);
      }

      const conversion = TimezoneCalculator.convertTimezone(
        this.baseTime,
        currentTimezone,
        timezoneId
      );

      const panel = new TimezonePanel();
      const timeDiff = panel.getTimeDifferenceText(currentTimezone, timezoneId);

      return {
        timezone,
        time: conversion.targetTime,
        offsetText: TimezoneCalculator.formatUTCOffset(timezone.offset),
        timeDiff,
      };
    });
  }

  /**
   * 添加时区
   */
  addTimezone(timezoneId: string): void {
    if (!this.timezones.includes(timezoneId)) {
      this.timezones.push(timezoneId);
    }
  }

  /**
   * 移除时区
   */
  removeTimezone(timezoneId: string): void {
    const index = this.timezones.indexOf(timezoneId);
    if (index > -1) {
      this.timezones.splice(index, 1);
    }
  }

  /**
   * 更新基准时间
   */
  updateBaseTime(time: Date): void {
    this.baseTime = time;
  }
}

