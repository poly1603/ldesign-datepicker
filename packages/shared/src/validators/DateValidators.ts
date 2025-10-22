/**
 * 日期验证器集合
 */

import type { ValidationResult } from './ValidationChain';

/**
 * 日期范围验证
 */
export function dateRangeValidator(min?: Date, max?: Date) {
  return (date: Date | null): ValidationResult => {
    if (!date) {
      return { valid: true };
    }

    if (min && date < min) {
      return {
        valid: false,
        message: `日期不能早于 ${min.toLocaleDateString()}`,
        code: 'DATE_TOO_EARLY',
        meta: { min, value: date },
      };
    }

    if (max && date > max) {
      return {
        valid: false,
        message: `日期不能晚于 ${max.toLocaleDateString()}`,
        code: 'DATE_TOO_LATE',
        meta: { max, value: date },
      };
    }

    return { valid: true };
  };
}

/**
 * 工作日验证
 */
export function weekdayValidator(allowedDays: number[] = [1, 2, 3, 4, 5]) {
  return (date: Date | null): ValidationResult => {
    if (!date) {
      return { valid: true };
    }

    const day = date.getDay();
    const isValid = allowedDays.includes(day);

    return {
      valid: isValid,
      message: isValid ? undefined : '只能选择工作日',
      code: 'INVALID_WEEKDAY',
      meta: { allowedDays, selectedDay: day },
    };
  };
}

/**
 * 非周末验证
 */
export function noWeekendsValidator() {
  return weekdayValidator([1, 2, 3, 4, 5]);
}

/**
 * 未来日期验证
 */
export function futureDateValidator(message = '不能选择过去的日期') {
  return (date: Date | null): ValidationResult => {
    if (!date) {
      return { valid: true };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isValid = date >= today;

    return {
      valid: isValid,
      message: isValid ? undefined : message,
      code: 'PAST_DATE',
    };
  };
}

/**
 * 过去日期验证
 */
export function pastDateValidator(message = '不能选择未来的日期') {
  return (date: Date | null): ValidationResult => {
    if (!date) {
      return { valid: true };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const isValid = date <= today;

    return {
      valid: isValid,
      message: isValid ? undefined : message,
      code: 'FUTURE_DATE',
    };
  };
}

/**
 * 日期范围跨度验证
 */
export function dateRangeSpanValidator(maxDays: number, message?: string) {
  return (range: [Date | null, Date | null]): ValidationResult => {
    const [start, end] = range;

    if (!start || !end) {
      return { valid: true };
    }

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const isValid = diffDays <= maxDays;

    return {
      valid: isValid,
      message: isValid ? undefined : (message || `日期范围不能超过 ${maxDays} 天`),
      code: 'RANGE_TOO_LARGE',
      meta: { maxDays, actualDays: diffDays },
    };
  };
}

/**
 * 日期必须在范围内验证
 */
export function dateInRangeValidator(
  start: Date | null,
  end: Date | null,
  message = '日期必须在指定范围内'
) {
  return (date: Date | null): ValidationResult => {
    if (!date || !start || !end) {
      return { valid: true };
    }

    const isValid = date >= start && date <= end;

    return {
      valid: isValid,
      message: isValid ? undefined : message,
      code: 'DATE_OUT_OF_RANGE',
      meta: { start, end, value: date },
    };
  };
}

/**
 * 自定义日期列表验证（黑名单）
 */
export function dateBlacklistValidator(blacklist: Date[], message = '该日期不可用') {
  return (date: Date | null): ValidationResult => {
    if (!date) {
      return { valid: true };
    }

    const isBlacklisted = blacklist.some((d) => {
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

    return {
      valid: !isBlacklisted,
      message: isBlacklisted ? message : undefined,
      code: 'DATE_BLACKLISTED',
    };
  };
}

/**
 * 自定义日期列表验证（白名单）
 */
export function dateWhitelistValidator(whitelist: Date[], message = '只能选择指定的日期') {
  return (date: Date | null): ValidationResult => {
    if (!date) {
      return { valid: true };
    }

    const isWhitelisted = whitelist.some((d) => {
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

    return {
      valid: isWhitelisted,
      message: isWhitelisted ? undefined : message,
      code: 'DATE_NOT_WHITELISTED',
    };
  };
}

/**
 * 月份第N天验证
 */
export function dayOfMonthValidator(allowedDays: number[], message = '只能选择每月的特定日期') {
  return (date: Date | null): ValidationResult => {
    if (!date) {
      return { valid: true };
    }

    const day = date.getDate();
    const isValid = allowedDays.includes(day);

    return {
      valid: isValid,
      message: isValid ? undefined : message,
      code: 'INVALID_DAY_OF_MONTH',
      meta: { allowedDays, selectedDay: day },
    };
  };
}

/**
 * 日期格式验证
 */
export function dateFormatValidator(date: Date | null): ValidationResult {
  if (!date) {
    return { valid: true };
  }

  if (!(date instanceof Date)) {
    return {
      valid: false,
      message: '无效的日期格式',
      code: 'INVALID_DATE_FORMAT',
    };
  }

  if (isNaN(date.getTime())) {
    return {
      valid: false,
      message: '无效的日期',
      code: 'INVALID_DATE',
    };
  }

  return { valid: true };
}

/**
 * 异步日期可用性验证（示例）
 */
export function createAsyncDateAvailabilityValidator(
  checkAvailability: (date: Date) => Promise<boolean>,
  message = '该日期不可用'
) {
  return async (date: Date | null): Promise<ValidationResult> => {
    if (!date) {
      return { valid: true };
    }

    try {
      const isAvailable = await checkAvailability(date);

      return {
        valid: isAvailable,
        message: isAvailable ? undefined : message,
        code: 'DATE_UNAVAILABLE',
      };
    } catch (error) {
      return {
        valid: false,
        message: '检查日期可用性时出错',
        code: 'AVAILABILITY_CHECK_ERROR',
      };
    }
  };
}

