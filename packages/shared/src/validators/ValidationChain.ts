/**
 * 验证规则链系统
 */

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否通过验证 */
  valid: boolean;

  /** 错误消息 */
  message?: string;

  /** 错误代码 */
  code?: string;

  /** 附加数据 */
  meta?: Record<string, any>;
}

/**
 * 验证器函数
 */
export type ValidatorFunction<T = any> = (
  value: T,
  context?: ValidationContext
) => ValidationResult | Promise<ValidationResult>;

/**
 * 验证上下文
 */
export interface ValidationContext {
  /** 字段名 */
  field?: string;

  /** 父级数据 */
  parent?: any;

  /** 根数据 */
  root?: any;

  /** 附加数据 */
  metadata?: Record<string, any>;
}

/**
 * 验证规则配置
 */
export interface ValidatorConfig<T = any> {
  /** 验证器函数 */
  validator: ValidatorFunction<T>;

  /** 规则名称 */
  name?: string;

  /** 错误消息 */
  message?: string;

  /** 是否异步 */
  async?: boolean;

  /** 验证条件（返回 false 则跳过该规则） */
  when?: (value: T, context?: ValidationContext) => boolean;
}

/**
 * 验证规则链
 * 
 * @example
 * ```ts
 * const chain = new ValidationChain<Date>()
 *   .required('日期不能为空')
 *   .custom((date) => {
 *     return date > new Date() 
 *       ? { valid: false, message: '不能选择未来日期' }
 *       : { valid: true };
 *   })
 *   .asyncCustom(async (date) => {
 *     const isValid = await checkDateAvailability(date);
 *     return {
 *       valid: isValid,
 *       message: '该日期不可用',
 *     };
 *   });
 * 
 * const result = await chain.validate(new Date());
 * ```
 */
export class ValidationChain<T = any> {
  private rules: ValidatorConfig<T>[] = [];
  private stopOnFirstError = true;

  /**
   * 设置是否在第一个错误时停止
   */
  setStopOnFirstError(stop: boolean): this {
    this.stopOnFirstError = stop;
    return this;
  }

  /**
   * 添加自定义规则
   */
  addRule(config: ValidatorConfig<T>): this {
    this.rules.push(config);
    return this;
  }

  /**
   * 必填验证
   */
  required(message = '此字段为必填项'): this {
    return this.addRule({
      name: 'required',
      message,
      validator: (value) => {
        const isEmpty = value === null ||
          value === undefined ||
          value === '' ||
          (Array.isArray(value) && value.length === 0);

        return {
          valid: !isEmpty,
          message: isEmpty ? message : undefined,
          code: 'REQUIRED',
        };
      },
    });
  }

  /**
   * 自定义验证
   */
  custom(
    validator: (value: T, context?: ValidationContext) => ValidationResult | boolean,
    message?: string
  ): this {
    return this.addRule({
      name: 'custom',
      message,
      validator: (value, context) => {
        const result = validator(value, context);

        if (typeof result === 'boolean') {
          return {
            valid: result,
            message: result ? undefined : message,
          };
        }

        return result;
      },
    });
  }

  /**
   * 异步自定义验证
   */
  asyncCustom(
    validator: (value: T, context?: ValidationContext) => Promise<ValidationResult | boolean>,
    message?: string
  ): this {
    return this.addRule({
      name: 'asyncCustom',
      message,
      async: true,
      validator: async (value, context) => {
        const result = await validator(value, context);

        if (typeof result === 'boolean') {
          return {
            valid: result,
            message: result ? undefined : message,
          };
        }

        return result;
      },
    });
  }

  /**
   * 条件验证
   */
  when(
    condition: (value: T, context?: ValidationContext) => boolean,
    thenChain: (chain: ValidationChain<T>) => ValidationChain<T>
  ): this {
    const subChain = thenChain(new ValidationChain<T>());

    subChain.rules.forEach((rule) => {
      this.addRule({
        ...rule,
        when: condition,
      });
    });

    return this;
  }

  /**
   * 执行验证
   */
  async validate(value: T, context?: ValidationContext): Promise<ValidationResult> {
    const errors: string[] = [];

    for (const rule of this.rules) {
      // 检查条件
      if (rule.when && !rule.when(value, context)) {
        continue;
      }

      try {
        const result = await Promise.resolve(rule.validator(value, context));

        if (!result.valid) {
          const errorMsg = result.message || rule.message || '验证失败';
          errors.push(errorMsg);

          if (this.stopOnFirstError) {
            return {
              valid: false,
              message: errorMsg,
              code: result.code,
              meta: result.meta,
            };
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '验证过程出错';
        errors.push(errorMsg);

        if (this.stopOnFirstError) {
          return {
            valid: false,
            message: errorMsg,
            code: 'VALIDATION_ERROR',
          };
        }
      }
    }

    return {
      valid: errors.length === 0,
      message: errors.length > 0 ? errors.join('; ') : undefined,
    };
  }

  /**
   * 同步验证（仅验证非异步规则）
   */
  validateSync(value: T, context?: ValidationContext): ValidationResult {
    const errors: string[] = [];

    for (const rule of this.rules) {
      if (rule.async) {
        console.warn('[ValidationChain] Skipping async rule in sync validation');
        continue;
      }

      // 检查条件
      if (rule.when && !rule.when(value, context)) {
        continue;
      }

      try {
        const result = rule.validator(value, context) as ValidationResult;

        if (!result.valid) {
          const errorMsg = result.message || rule.message || '验证失败';
          errors.push(errorMsg);

          if (this.stopOnFirstError) {
            return {
              valid: false,
              message: errorMsg,
              code: result.code,
              meta: result.meta,
            };
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '验证过程出错';
        errors.push(errorMsg);

        if (this.stopOnFirstError) {
          return {
            valid: false,
            message: errorMsg,
            code: 'VALIDATION_ERROR',
          };
        }
      }
    }

    return {
      valid: errors.length === 0,
      message: errors.length > 0 ? errors.join('; ') : undefined,
    };
  }

  /**
   * 获取所有规则
   */
  getRules(): ValidatorConfig<T>[] {
    return [...this.rules];
  }

  /**
   * 清空所有规则
   */
  clear(): this {
    this.rules = [];
    return this;
  }
}

/**
 * 创建日期验证链
 */
export function createDateValidationChain(): ValidationChain<Date | null> {
  return new ValidationChain<Date | null>();
}

/**
 * 创建日期范围验证链
 */
export function createDateRangeValidationChain(): ValidationChain<[Date | null, Date | null]> {
  return new ValidationChain<[Date | null, Date | null]>();
}

