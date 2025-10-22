/**
 * 时区计算器
 * 支持时区转换、DST 处理等
 */

/**
 * 时区信息
 */
export interface TimezoneInfo {
  /** 时区标识符（如 'Asia/Shanghai'） */
  id: string;

  /** 时区名称 */
  name: string;

  /** UTC 偏移（分钟） */
  offset: number;

  /** 是否夏令时 */
  isDST: boolean;

  /** 缩写（如 'CST'） */
  abbreviation: string;
}

/**
 * 时区转换结果
 */
export interface TimezoneConversionResult {
  /** 源时区 */
  sourceTimezone: string;

  /** 目标时区 */
  targetTimezone: string;

  /** 源时间 */
  sourceTime: Date;

  /** 目标时间 */
  targetTime: Date;

  /** 时差（小时） */
  timeDifference: number;
}

/**
 * 常用时区列表
 */
export const COMMON_TIMEZONES: TimezoneInfo[] = [
  {
    id: 'Asia/Shanghai',
    name: '中国标准时间',
    offset: 480,
    isDST: false,
    abbreviation: 'CST',
  },
  {
    id: 'America/New_York',
    name: '美国东部时间',
    offset: -300,
    isDST: false,
    abbreviation: 'EST',
  },
  {
    id: 'America/Los_Angeles',
    name: '美国太平洋时间',
    offset: -480,
    isDST: false,
    abbreviation: 'PST',
  },
  {
    id: 'Europe/London',
    name: '英国时间',
    offset: 0,
    isDST: false,
    abbreviation: 'GMT',
  },
  {
    id: 'Europe/Paris',
    name: '中欧时间',
    offset: 60,
    isDST: false,
    abbreviation: 'CET',
  },
  {
    id: 'Asia/Tokyo',
    name: '日本标准时间',
    offset: 540,
    isDST: false,
    abbreviation: 'JST',
  },
  {
    id: 'Australia/Sydney',
    name: '澳大利亚东部时间',
    offset: 600,
    isDST: false,
    abbreviation: 'AEST',
  },
];

/**
 * 时区计算器
 */
export class TimezoneCalculator {
  /**
   * 获取时区信息
   */
  static getTimezoneInfo(timezoneId: string): TimezoneInfo | null {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneId,
        timeZoneName: 'short',
      });

      const parts = formatter.formatToParts(now);
      const timeZoneName = parts.find((p) => p.type === 'timeZoneName')?.value || '';

      // 计算 UTC 偏移
      const offset = this.getTimezoneOffset(timezoneId, now);

      // 检查是否为 DST
      const isDST = this.isDST(timezoneId, now);

      return {
        id: timezoneId,
        name: this.getTimezoneName(timezoneId),
        offset,
        isDST,
        abbreviation: timeZoneName,
      };
    } catch (error) {
      console.error(`Invalid timezone: ${timezoneId}`);
      return null;
    }
  }

  /**
   * 获取时区偏移（分钟）
   */
  static getTimezoneOffset(timezoneId: string, date: Date = new Date()): number {
    try {
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezoneId }));

      return Math.round((tzDate.getTime() - utcDate.getTime()) / (60 * 1000));
    } catch {
      return 0;
    }
  }

  /**
   * 转换时区
   */
  static convertTimezone(
    date: Date,
    sourceTimezone: string,
    targetTimezone: string
  ): TimezoneConversionResult {
    // 获取源时区和目标时区的偏移
    const sourceOffset = this.getTimezoneOffset(sourceTimezone, date);
    const targetOffset = this.getTimezoneOffset(targetTimezone, date);

    // 计算时差（分钟）
    const diffMinutes = targetOffset - sourceOffset;

    // 计算目标时间
    const targetTime = new Date(date.getTime() + diffMinutes * 60 * 1000);

    return {
      sourceTimezone,
      targetTimezone,
      sourceTime: date,
      targetTime,
      timeDifference: diffMinutes / 60,
    };
  }

  /**
   * 判断是否为夏令时
   */
  static isDST(timezoneId: string, date: Date = new Date()): boolean {
    // 获取1月和7月的偏移
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);

    const janOffset = this.getTimezoneOffset(timezoneId, jan);
    const julOffset = this.getTimezoneOffset(timezoneId, jul);
    const currentOffset = this.getTimezoneOffset(timezoneId, date);

    // 如果当前偏移大于冬季偏移，则为夏令时
    return currentOffset > Math.min(janOffset, julOffset);
  }

  /**
   * 获取时区名称
   */
  static getTimezoneName(timezoneId: string): string {
    const names: Record<string, string> = {
      'Asia/Shanghai': '中国标准时间',
      'America/New_York': '美国东部时间',
      'America/Los_Angeles': '美国太平洋时间',
      'Europe/London': '英国时间',
      'Europe/Paris': '中欧时间',
      'Asia/Tokyo': '日本标准时间',
      'Australia/Sydney': '澳大利亚东部时间',
    };

    return names[timezoneId] || timezoneId;
  }

  /**
   * 格式化 UTC 偏移
   */
  static formatUTCOffset(offset: number): string {
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';

    return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  /**
   * 获取所有可用时区
   */
  static getAllTimezones(): string[] {
    // 简化版本，实际应返回完整的 IANA 时区列表
    return COMMON_TIMEZONES.map((tz) => tz.id);
  }

  /**
   * 搜索时区
   */
  static searchTimezones(query: string): TimezoneInfo[] {
    const lowerQuery = query.toLowerCase();

    return COMMON_TIMEZONES.filter((tz) => {
      return (
        tz.id.toLowerCase().includes(lowerQuery) ||
        tz.name.toLowerCase().includes(lowerQuery) ||
        tz.abbreviation.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * 获取当前时区
   */
  static getCurrentTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * 按地区分组时区
   */
  static groupTimezonesByRegion(): Record<string, TimezoneInfo[]> {
    const groups: Record<string, TimezoneInfo[]> = {};

    COMMON_TIMEZONES.forEach((tz) => {
      const region = tz.id.split('/')[0] || 'Other';

      if (!groups[region]) {
        groups[region] = [];
      }

      groups[region]!.push(tz);
    });

    return groups;
  }
}

/**
 * 时区工具函数
 */
export const TimezoneUtils = {
  /**
   * 获取本地时区偏移（分钟）
   */
  getLocalOffset(): number {
    return -new Date().getTimezoneOffset();
  },

  /**
   * 判断两个时区是否相同
   */
  isSameTimezone(tz1: string, tz2: string): boolean {
    const offset1 = TimezoneCalculator.getTimezoneOffset(tz1);
    const offset2 = TimezoneCalculator.getTimezoneOffset(tz2);
    return offset1 === offset2;
  },

  /**
   * 获取时区显示文本
   */
  getTimezoneDisplayText(timezoneId: string): string {
    const info = TimezoneCalculator.getTimezoneInfo(timezoneId);
    if (!info) return timezoneId;

    const offset = TimezoneCalculator.formatUTCOffset(info.offset);
    return `(${offset}) ${info.name}`;
  },
};

