/**
 * 表单验证器集成
 * 支持主流表单验证库
 */

import type { ValidationResult, ValidatorFunction } from '@ldesign/datepicker-shared';

/**
 * 表单字段配置
 */
export interface FormFieldConfig {
  name: string;
  label?: string;
  required?: boolean;
  validators?: ValidatorFunction[];
}

/**
 * 表单验证器适配器
 */
export class FormValidatorAdapter {
  /**
   * 转换为 HTML5 验证
   */
  static toHTML5Validator(validator: ValidatorFunction): (value: any) => boolean {
    return (value) => {
      const result = validator(value);

      if (result instanceof Promise) {
        throw new Error('HTML5 validation does not support async validators');
      }

      return result.valid;
    };
  }

  /**
   * 转换为自定义验证消息
   */
  static toCustomValidityMessage(validator: ValidatorFunction): (value: any) => string {
    return (value) => {
      const result = validator(value);

      if (result instanceof Promise) {
        return '';
      }

      return result.valid ? '' : (result.message || '验证失败');
    };
  }

  /**
   * 应用到 input 元素
   */
  static applyToInput(input: HTMLInputElement, validator: ValidatorFunction): void {
    input.addEventListener('input', () => {
      const result = validator(input.value);

      if (result instanceof Promise) {
        result.then((r) => {
          input.setCustomValidity(r.valid ? '' : (r.message || ''));
        });
      } else {
        input.setCustomValidity(result.valid ? '' : (result.message || ''));
      }
    });
  }
}

/**
 * VeeValidate 集成
 */
export const VeeValidateIntegration = {
  /**
   * 创建 VeeValidate 规则
   */
  createRule(validator: ValidatorFunction) {
    return {
      validate: async (value: any) => {
        const result = await Promise.resolve(validator(value));
        return result.valid || result.message || false;
      },
    };
  },
};

/**
 * React Hook Form 集成
 */
export const ReactHookFormIntegration = {
  /**
   * 创建验证规则
   */
  createValidate(validator: ValidatorFunction) {
    return async (value: any) => {
      const result = await Promise.resolve(validator(value));
      return result.valid ? true : (result.message || '验证失败');
    };
  },
};

/**
 * Yup 集成
 */
export const YupIntegration = {
  /**
   * 创建 Yup 测试方法
   */
  createTest(name: string, validator: ValidatorFunction) {
    return {
      name,
      test: async (value: any) => {
        const result = await Promise.resolve(validator(value));
        return result.valid;
      },
      message: async (value: any) => {
        const result = await Promise.resolve(validator(value));
        return result.message || '验证失败';
      },
    };
  },
};

/**
 * Zod 集成
 */
export const ZodIntegration = {
  /**
   * 创建 Zod 精炼验证
   */
  createRefinement(validator: ValidatorFunction) {
    return async (value: any, ctx: any) => {
      const result = await Promise.resolve(validator(value));

      if (!result.valid) {
        ctx.addIssue({
          code: 'custom',
          message: result.message || '验证失败',
        });
      }
    };
  },
};

