/**
 * 农历面板
 */

import type { DateCell } from '@ldesign/datepicker-shared';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  cloneDate,
  isSameDay,
  isToday,
  isInRange,
  addDays,
  startOfDay,
  type WeekDay,
} from '@ldesign/datepicker-shared';
import { LunarCalendar, type LunarDate } from '../calculators/LunarCalendar';

/**
 * 农历单元格数据
 */
export interface LunarDateCell extends DateCell {
  /** 农历信息 */
  lunar: LunarDate;

  /** 是否为节气 */
  isSolarTerm: boolean;

  /** 是否为节日 */
  isFestival: boolean;
}

/**
 * 农历面板选项
 */
export interface LunarPanelOptions {
  year: number;
  month: number;
  value: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  hoverDate?: Date | null;
  weekStartsOn?: WeekDay;
  disabledDate?: (date: Date) => boolean;
  showWeekNumber?: boolean;
  showLunarInfo?: boolean;
  showSolarTerms?: boolean;
  showFestivals?: boolean;
}

/**
 * 农历面板类
 */
export class LunarPanel {
  private options: Required<LunarPanelOptions>;

  constructor(options: LunarPanelOptions) {
    this.options = {
      year: options.year,
      month: options.month,
      value: options.value,
      rangeStart: options.rangeStart ?? null,
      rangeEnd: options.rangeEnd ?? null,
      hoverDate: options.hoverDate ?? null,
      weekStartsOn: options.weekStartsOn ?? 1,
      disabledDate: options.disabledDate ?? (() => false),
      showWeekNumber: options.showWeekNumber ?? false,
      showLunarInfo: options.showLunarInfo ?? true,
      showSolarTerms: options.showSolarTerms ?? true,
      showFestivals: options.showFestivals ?? true,
    };
  }

  /**
   * 生成农历日期单元格数据
   */
  generateCells(): LunarDateCell[][] {
    const { year, month, weekStartsOn } = this.options;
    const rows: LunarDateCell[][] = [];

    const firstDay = getFirstDayOfMonth(year, month);
    const daysInMonth = getDaysInMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    let firstDayOfWeek = firstDay;
    if (weekStartsOn !== 0) {
      firstDayOfWeek = (firstDay - weekStartsOn + 7) % 7;
    }

    let date = 1;
    let nextMonthDate = 1;

    for (let i = 0; i < 6; i++) {
      const row: LunarDateCell[] = [];

      for (let j = 0; j < 7; j++) {
        let cellDate: Date;
        let type: DateCell['type'] = 'normal';

        if (i === 0 && j < firstDayOfWeek) {
          const day = daysInPrevMonth - firstDayOfWeek + j + 1;
          cellDate = new Date(year, month - 1, day);
          type = 'prev';
        } else if (date > daysInMonth) {
          cellDate = new Date(year, month + 1, nextMonthDate);
          type = 'next';
          nextMonthDate++;
        } else {
          cellDate = new Date(year, month, date);
          type = 'normal';

          if (isToday(cellDate)) {
            type = 'today';
          }

          date++;
        }

        row.push(this.createLunarCell(cellDate, type));
      }

      rows.push(row);

      if (date > daysInMonth && i >= 4) {
        break;
      }
    }

    return rows;
  }

  /**
   * 创建农历单元格
   */
  private createLunarCell(date: Date, type: DateCell['type']): LunarDateCell {
    const { value, rangeStart, rangeEnd, hoverDate, disabledDate } = this.options;

    const disabled = disabledDate(date);
    const selected = value ? isSameDay(date, value) : false;

    let inRange = false;
    let rangeStartFlag = false;
    let rangeEndFlag = false;

    if (rangeStart && rangeEnd) {
      inRange = isInRange(date, rangeStart, rangeEnd);
      rangeStartFlag = isSameDay(date, rangeStart);
      rangeEndFlag = isSameDay(date, rangeEnd);
    } else if (rangeStart && hoverDate) {
      const start = rangeStart <= hoverDate ? rangeStart : hoverDate;
      const end = rangeStart <= hoverDate ? hoverDate : rangeStart;
      inRange = isInRange(date, start, end);
      rangeStartFlag = isSameDay(date, start);
      rangeEndFlag = isSameDay(date, end);
    }

    // 计算农历信息
    const lunar = LunarCalendar.solarToLunar(date);

    return {
      date: startOfDay(date),
      text: date.getDate(),
      type,
      disabled,
      selected,
      inRange,
      rangeStart: rangeStartFlag,
      rangeEnd: rangeEndFlag,
      lunar,
      isSolarTerm: !!lunar.solarTerm,
      isFestival: !!lunar.festival,
    };
  }

  /**
   * 获取单元格显示文本（农历优先）
   */
  getCellDisplayText(cell: LunarDateCell): string {
    const { showLunarInfo, showSolarTerms, showFestivals } = this.options;

    if (!showLunarInfo) {
      return String(cell.text);
    }

    // 优先显示节气
    if (showSolarTerms && cell.lunar.solarTerm) {
      return cell.lunar.solarTerm;
    }

    // 其次显示节日
    if (showFestivals && cell.lunar.festival) {
      return cell.lunar.festival;
    }

    // 月初显示月份
    if (cell.lunar.day === 1) {
      return cell.lunar.monthText;
    }

    // 否则显示农历日期
    return cell.lunar.dayText;
  }

  /**
   * 获取单元格自定义类名
   */
  getCellCustomClass(cell: LunarDateCell): string[] {
    const classes: string[] = [];

    if (cell.isSolarTerm) {
      classes.push('ldate-cell--solar-term');
    }

    if (cell.isFestival) {
      classes.push('ldate-cell--festival');
    }

    if (cell.lunar.day === 1) {
      classes.push('ldate-cell--lunar-month-start');
    }

    return classes;
  }
}

