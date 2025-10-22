/**
 * 农历计算器
 * 支持公历农历互转、节气、节日等
 */

/**
 * 农历日期
 */
export interface LunarDate {
  /** 农历年 */
  year: number;

  /** 农历月（1-12） */
  month: number;

  /** 农历日（1-30） */
  day: number;

  /** 是否闰月 */
  isLeapMonth: boolean;

  /** 生肖 */
  zodiac: string;

  /** 天干地支年 */
  yearInGanZhi: string;

  /** 天干地支月 */
  monthInGanZhi: string;

  /** 天干地支日 */
  dayInGanZhi: string;

  /** 农历月份文本 */
  monthText: string;

  /** 农历日期文本 */
  dayText: string;

  /** 节气（如果有） */
  solarTerm?: string;

  /** 节日（如果有） */
  festival?: string;
}

/**
 * 天干
 */
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/**
 * 地支
 */
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 生肖
 */
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

/**
 * 农历月份
 */
const LUNAR_MONTHS = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月',
];

/**
 * 农历日期
 */
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];

/**
 * 二十四节气
 */
const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
];

/**
 * 农历数据表（1900-2100年）
 * 每个数字编码了一年的农历信息
 * 格式：0xXXXXX
 * - 前12位表示12个月的天数（0=29天，1=30天）
 * - 后4位表示闰月（0=无闰月，1-12=闰几月）
 */
const LUNAR_INFO: number[] = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  // ... 简化版本，实际应包含完整数据表
];

/**
 * 农历计算器
 */
export class LunarCalendar {
  /**
   * 公历转农历
   */
  static solarToLunar(date: Date): LunarDate {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 简化实现 - 实际应使用完整的农历算法
    // 这里提供接口，实际计算需要完整的农历数据表

    const lunarYear = year;
    const lunarMonth = month;
    const lunarDay = day;
    const isLeapMonth = false;

    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeapMonth,
      zodiac: this.getZodiac(lunarYear),
      yearInGanZhi: this.getYearInGanZhi(lunarYear),
      monthInGanZhi: this.getMonthInGanZhi(lunarYear, lunarMonth),
      dayInGanZhi: this.getDayInGanZhi(date),
      monthText: this.getLunarMonthText(lunarMonth, isLeapMonth),
      dayText: this.getLunarDayText(lunarDay),
      solarTerm: this.getSolarTerm(date),
      festival: this.getFestival(lunarMonth, lunarDay, isLeapMonth),
    };
  }

  /**
   * 农历转公历
   */
  static lunarToSolar(year: number, month: number, day: number, isLeapMonth = false): Date {
    // 简化实现 - 实际应使用完整的农历算法
    return new Date(year, month - 1, day);
  }

  /**
   * 获取生肖
   */
  static getZodiac(year: number): string {
    return ZODIAC_ANIMALS[(year - 4) % 12] || '鼠';
  }

  /**
   * 获取天干地支年
   */
  static getYearInGanZhi(year: number): string {
    const ganIndex = (year - 4) % 10;
    const zhiIndex = (year - 4) % 12;
    return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[zhiIndex];
  }

  /**
   * 获取天干地支月
   */
  static getMonthInGanZhi(year: number, month: number): string {
    const ganIndex = (year * 12 + month + 3) % 10;
    const zhiIndex = (month + 1) % 12;
    return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[zhiIndex];
  }

  /**
   * 获取天干地支日
   */
  static getDayInGanZhi(date: Date): string {
    // 以1900年1月1日为基准（甲子日）
    const base = new Date(1900, 0, 1);
    const diff = Math.floor((date.getTime() - base.getTime()) / (24 * 60 * 60 * 1000));
    const ganIndex = diff % 10;
    const zhiIndex = diff % 12;
    return HEAVENLY_STEMS[ganIndex] + EARTHLY_BRANCHES[zhiIndex];
  }

  /**
   * 获取农历月份文本
   */
  static getLunarMonthText(month: number, isLeapMonth: boolean): string {
    const prefix = isLeapMonth ? '闰' : '';
    return prefix + (LUNAR_MONTHS[month - 1] || '');
  }

  /**
   * 获取农历日期文本
   */
  static getLunarDayText(day: number): string {
    return LUNAR_DAYS[day - 1] || '';
  }

  /**
   * 获取节气
   */
  static getSolarTerm(date: Date): string | undefined {
    // 简化实现 - 实际应使用天文算法计算精确节气时间
    const month = date.getMonth();
    const day = date.getDate();

    // 近似值，每月两个节气
    const termIndex = month * 2;

    if (day >= 4 && day <= 6) {
      return SOLAR_TERMS[termIndex];
    } else if (day >= 19 && day <= 21) {
      return SOLAR_TERMS[termIndex + 1];
    }

    return undefined;
  }

  /**
   * 获取节日
   */
  static getFestival(month: number, day: number, isLeapMonth: boolean): string | undefined {
    if (isLeapMonth) return undefined;

    const festivals: Record<string, string> = {
      '1-1': '春节',
      '1-15': '元宵节',
      '5-5': '端午节',
      '7-7': '七夕节',
      '8-15': '中秋节',
      '9-9': '重阳节',
      '12-30': '除夕', // 简化处理
    };

    return festivals[`${month}-${day}`];
  }

  /**
   * 判断是否为闰年
   */
  static isLeapYear(year: number): boolean {
    const leapMonth = this.getLeapMonth(year);
    return leapMonth > 0;
  }

  /**
   * 获取闰月
   */
  static getLeapMonth(year: number): number {
    if (year < 1900 || year > 2100) return 0;

    const index = year - 1900;
    const info = LUNAR_INFO[index];

    if (!info) return 0;

    return info & 0x0f; // 取后4位
  }

  /**
   * 获取农历月份天数
   */
  static getLunarMonthDays(year: number, month: number): number {
    if (year < 1900 || year > 2100) return 30;

    const index = year - 1900;
    const info = LUNAR_INFO[index];

    if (!info) return 30;

    // 检查对应月份的位
    const bit = 1 << (16 - month);
    return (info & bit) ? 30 : 29;
  }

  /**
   * 格式化农历日期
   */
  static formatLunarDate(lunar: LunarDate, format = 'full'): string {
    switch (format) {
      case 'full':
        return `${lunar.yearInGanZhi}年${lunar.monthText}${lunar.dayText}`;
      case 'short':
        return `${lunar.monthText}${lunar.dayText}`;
      case 'zodiac':
        return `${lunar.zodiac}年 ${lunar.monthText}${lunar.dayText}`;
      default:
        return `${lunar.year}年${lunar.month}月${lunar.day}日`;
    }
  }
}

/**
 * 农历工具函数
 */
export const LunarUtils = {
  /**
   * 判断是否为传统节日
   */
  isFestival(lunar: LunarDate): boolean {
    return lunar.festival !== undefined;
  },

  /**
   * 判断是否为节气日
   */
  isSolarTerm(lunar: LunarDate): boolean {
    return lunar.solarTerm !== undefined;
  },

  /**
   * 获取完整描述
   */
  getFullDescription(lunar: LunarDate): string {
    const parts: string[] = [
      LunarCalendar.formatLunarDate(lunar, 'zodiac'),
    ];

    if (lunar.solarTerm) {
      parts.push(`[${lunar.solarTerm}]`);
    }

    if (lunar.festival) {
      parts.push(`[${lunar.festival}]`);
    }

    return parts.join(' ');
  },
};

