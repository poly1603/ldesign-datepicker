/**
 * 相对日期工具
 * 支持自然语言解析和相对日期计算
 */

/**
 * 相对日期单位
 */
export type RelativeDateUnit =
  | 'second' | 'seconds'
  | 'minute' | 'minutes'
  | 'hour' | 'hours'
  | 'day' | 'days'
  | 'week' | 'weeks'
  | 'month' | 'months'
  | 'quarter' | 'quarters'
  | 'year' | 'years';

/**
 * 相对日期配置
 */
export interface RelativeDateConfig {
  /** 数量（正数表示未来，负数表示过去） */
  amount: number;

  /** 单位 */
  unit: RelativeDateUnit;

  /** 基准日期（默认为当前日期） */
  baseDate?: Date;

  /** 是否包含时间部分（默认 false，会重置为 00:00:00） */
  includeTime?: boolean;
}

/**
 * 相对日期描述
 */
export interface RelativeDateDescriptor {
  /** 原始输入 */
  input: string;

  /** 解析结果 */
  config: RelativeDateConfig;

  /** 计算后的日期 */
  date: Date;

  /** 可读描述 */
  description: string;
}

/**
 * 计算相对日期
 */
export function calculateRelativeDate(config: RelativeDateConfig): Date {
  const { amount, unit, baseDate = new Date(), includeTime = false } = config;

  const date = new Date(baseDate);

  // 如果不包含时间，重置为 00:00:00
  if (!includeTime) {
    date.setHours(0, 0, 0, 0);
  }

  switch (unit) {
    case 'second':
    case 'seconds':
      date.setSeconds(date.getSeconds() + amount);
      break;

    case 'minute':
    case 'minutes':
      date.setMinutes(date.getMinutes() + amount);
      break;

    case 'hour':
    case 'hours':
      date.setHours(date.getHours() + amount);
      break;

    case 'day':
    case 'days':
      date.setDate(date.getDate() + amount);
      break;

    case 'week':
    case 'weeks':
      date.setDate(date.getDate() + amount * 7);
      break;

    case 'month':
    case 'months':
      date.setMonth(date.getMonth() + amount);
      break;

    case 'quarter':
    case 'quarters':
      date.setMonth(date.getMonth() + amount * 3);
      break;

    case 'year':
    case 'years':
      date.setFullYear(date.getFullYear() + amount);
      break;
  }

  return date;
}

/**
 * 自然语言解析映射
 */
const NATURAL_LANGUAGE_PATTERNS: Array<{
  pattern: RegExp;
  parser: (match: RegExpMatchArray) => RelativeDateConfig;
}> = [
    // "今天"
    {
      pattern: /^(今天|today)$/i,
      parser: () => ({ amount: 0, unit: 'days' }),
    },

    // "昨天"
    {
      pattern: /^(昨天|yesterday)$/i,
      parser: () => ({ amount: -1, unit: 'days' }),
    },

    // "明天"
    {
      pattern: /^(明天|tomorrow)$/i,
      parser: () => ({ amount: 1, unit: 'days' }),
    },

    // "本周"
    {
      pattern: /^(本周|this week)$/i,
      parser: () => ({ amount: 0, unit: 'weeks' }),
    },

    // "上周"
    {
      pattern: /^(上周|last week)$/i,
      parser: () => ({ amount: -1, unit: 'weeks' }),
    },

    // "下周"
    {
      pattern: /^(下周|next week)$/i,
      parser: () => ({ amount: 1, unit: 'weeks' }),
    },

    // "本月"
    {
      pattern: /^(本月|this month)$/i,
      parser: () => ({ amount: 0, unit: 'months' }),
    },

    // "上个月"
    {
      pattern: /^(上个?月|last month)$/i,
      parser: () => ({ amount: -1, unit: 'months' }),
    },

    // "下个月"
    {
      pattern: /^(下个?月|next month)$/i,
      parser: () => ({ amount: 1, unit: 'months' }),
    },

    // "今年"
    {
      pattern: /^(今年|this year)$/i,
      parser: () => ({ amount: 0, unit: 'years' }),
    },

    // "去年"
    {
      pattern: /^(去年|last year)$/i,
      parser: () => ({ amount: -1, unit: 'years' }),
    },

    // "明年"
    {
      pattern: /^(明年|next year)$/i,
      parser: () => ({ amount: 1, unit: 'years' }),
    },

    // "N天前" / "N天后"
    {
      pattern: /^(\d+)\s*(天|日|days?)\s*(前|后|ago|later)$/i,
      parser: (match) => {
        const amount = parseInt(match[1]!);
        const direction = match[3]!.match(/前|ago/i) ? -1 : 1;
        return { amount: amount * direction, unit: 'days' };
      },
    },

    // "N周前" / "N周后"
    {
      pattern: /^(\d+)\s*(周|星期|weeks?)\s*(前|后|ago|later)$/i,
      parser: (match) => {
        const amount = parseInt(match[1]!);
        const direction = match[3]!.match(/前|ago/i) ? -1 : 1;
        return { amount: amount * direction, unit: 'weeks' };
      },
    },

    // "N个月前" / "N个月后"
    {
      pattern: /^(\d+)\s*个?月\s*(前|后|ago|later)$/i,
      parser: (match) => {
        const amount = parseInt(match[1]!);
        const direction = match[2]!.match(/前|ago/i) ? -1 : 1;
        return { amount: amount * direction, unit: 'months' };
      },
    },

    // "N年前" / "N年后"
    {
      pattern: /^(\d+)\s*年\s*(前|后|ago|later)$/i,
      parser: (match) => {
        const amount = parseInt(match[1]!);
        const direction = match[2]!.match(/前|ago/i) ? -1 : 1;
        return { amount: amount * direction, unit: 'years' };
      },
    },
  ];

/**
 * 解析自然语言日期
 */
export function parseNaturalLanguageDate(input: string): RelativeDateDescriptor | null {
  const trimmedInput = input.trim();

  for (const { pattern, parser } of NATURAL_LANGUAGE_PATTERNS) {
    const match = trimmedInput.match(pattern);
    if (match) {
      const config = parser(match);
      const date = calculateRelativeDate(config);
      const description = formatRelativeDate(config);

      return {
        input,
        config,
        date,
        description,
      };
    }
  }

  return null;
}

/**
 * 格式化相对日期描述
 */
export function formatRelativeDate(config: RelativeDateConfig): string {
  const { amount, unit } = config;

  const absAmount = Math.abs(amount);
  const direction = amount >= 0 ? '后' : '前';

  const unitMap: Record<string, string> = {
    second: '秒',
    seconds: '秒',
    minute: '分钟',
    minutes: '分钟',
    hour: '小时',
    hours: '小时',
    day: '天',
    days: '天',
    week: '周',
    weeks: '周',
    month: '个月',
    months: '个月',
    quarter: '个季度',
    quarters: '个季度',
    year: '年',
    years: '年',
  };

  const unitText = unitMap[unit] || unit;

  if (amount === 0) {
    if (unit.includes('day')) return '今天';
    if (unit.includes('week')) return '本周';
    if (unit.includes('month')) return '本月';
    if (unit.includes('year')) return '今年';
  }

  return `${absAmount}${unitText}${direction}`;
}

/**
 * 预设相对日期快捷方式
 */
export const RELATIVE_DATE_SHORTCUTS = {
  // 今天/昨天/明天
  today: () => calculateRelativeDate({ amount: 0, unit: 'days' }),
  yesterday: () => calculateRelativeDate({ amount: -1, unit: 'days' }),
  tomorrow: () => calculateRelativeDate({ amount: 1, unit: 'days' }),

  // 本周/上周/下周
  thisWeek: () => calculateRelativeDate({ amount: 0, unit: 'weeks' }),
  lastWeek: () => calculateRelativeDate({ amount: -1, unit: 'weeks' }),
  nextWeek: () => calculateRelativeDate({ amount: 1, unit: 'weeks' }),

  // 本月/上月/下月
  thisMonth: () => calculateRelativeDate({ amount: 0, unit: 'months' }),
  lastMonth: () => calculateRelativeDate({ amount: -1, unit: 'months' }),
  nextMonth: () => calculateRelativeDate({ amount: 1, unit: 'months' }),

  // 本季度/上季度/下季度
  thisQuarter: () => calculateRelativeDate({ amount: 0, unit: 'quarters' }),
  lastQuarter: () => calculateRelativeDate({ amount: -1, unit: 'quarters' }),
  nextQuarter: () => calculateRelativeDate({ amount: 1, unit: 'quarters' }),

  // 今年/去年/明年
  thisYear: () => calculateRelativeDate({ amount: 0, unit: 'years' }),
  lastYear: () => calculateRelativeDate({ amount: -1, unit: 'years' }),
  nextYear: () => calculateRelativeDate({ amount: 1, unit: 'years' }),

  // 最近N天
  last7Days: () => [
    calculateRelativeDate({ amount: -7, unit: 'days' }),
    calculateRelativeDate({ amount: 0, unit: 'days' }),
  ],
  last30Days: () => [
    calculateRelativeDate({ amount: -30, unit: 'days' }),
    calculateRelativeDate({ amount: 0, unit: 'days' }),
  ],
  last90Days: () => [
    calculateRelativeDate({ amount: -90, unit: 'days' }),
    calculateRelativeDate({ amount: 0, unit: 'days' }),
  ],

  // 未来N天
  next7Days: () => [
    calculateRelativeDate({ amount: 0, unit: 'days' }),
    calculateRelativeDate({ amount: 7, unit: 'days' }),
  ],
  next30Days: () => [
    calculateRelativeDate({ amount: 0, unit: 'days' }),
    calculateRelativeDate({ amount: 30, unit: 'days' }),
  ],
};

/**
 * 创建相对日期快捷选项
 */
export function createRelativeDateShortcuts() {
  return [
    { text: '今天', value: RELATIVE_DATE_SHORTCUTS.today() },
    { text: '昨天', value: RELATIVE_DATE_SHORTCUTS.yesterday() },
    { text: '明天', value: RELATIVE_DATE_SHORTCUTS.tomorrow() },
    { text: '最近7天', value: RELATIVE_DATE_SHORTCUTS.last7Days() },
    { text: '最近30天', value: RELATIVE_DATE_SHORTCUTS.last30Days() },
    { text: '最近90天', value: RELATIVE_DATE_SHORTCUTS.last90Days() },
    { text: '本周', value: RELATIVE_DATE_SHORTCUTS.thisWeek() },
    { text: '本月', value: RELATIVE_DATE_SHORTCUTS.thisMonth() },
    { text: '本季度', value: RELATIVE_DATE_SHORTCUTS.thisQuarter() },
    { text: '今年', value: RELATIVE_DATE_SHORTCUTS.thisYear() },
  ];
}

