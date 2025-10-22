/**
 * ValidationChain 单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  createDateValidationChain,
  dateRangeValidator,
  noWeekendsValidator,
  futureDateValidator,
  pastDateValidator,
} from '../index';

describe('ValidationChain', () => {
  describe('基本验证', () => {
    it('required 验证应该正确工作', async () => {
      const validator = createDateValidationChain().required();

      const result1 = await validator.validate(null);
      expect(result1.valid).toBe(false);

      const result2 = await validator.validate(new Date());
      expect(result2.valid).toBe(true);
    });

    it('自定义验证应该正确工作', async () => {
      const validator = createDateValidationChain()
        .custom((date) => {
          return {
            valid: date !== null && date.getFullYear() === 2024,
            message: '只能选择2024年的日期',
          };
        });

      const result1 = await validator.validate(new Date('2024-01-01'));
      expect(result1.valid).toBe(true);

      const result2 = await validator.validate(new Date('2023-01-01'));
      expect(result2.valid).toBe(false);
      expect(result2.message).toContain('2024');
    });
  });

  describe('链式验证', () => {
    it('应该按顺序执行多个验证规则', async () => {
      const validator = createDateValidationChain()
        .required('日期必填')
        .custom(futureDateValidator());

      // 测试空值
      const result1 = await validator.validate(null);
      expect(result1.valid).toBe(false);
      expect(result1.message).toContain('必填');

      // 测试过去日期
      const pastDate = new Date('2020-01-01');
      const result2 = await validator.validate(pastDate);
      expect(result2.valid).toBe(false);
    });

    it('应该在第一个错误时停止', async () => {
      let secondRuleCalled = false;

      const validator = createDateValidationChain()
        .custom(() => ({ valid: false, message: '第一个规则失败' }))
        .custom(() => {
          secondRuleCalled = true;
          return { valid: true };
        });

      await validator.validate(new Date());

      expect(secondRuleCalled).toBe(false);
    });

    it('设置不在第一个错误停止应该收集所有错误', async () => {
      const validator = createDateValidationChain()
        .setStopOnFirstError(false)
        .custom(() => ({ valid: false, message: '错误1' }))
        .custom(() => ({ valid: false, message: '错误2' }));

      const result = await validator.validate(new Date());

      expect(result.valid).toBe(false);
      expect(result.message).toContain('错误1');
      expect(result.message).toContain('错误2');
    });
  });

  describe('内置验证器', () => {
    it('dateRangeValidator 应该验证日期范围', async () => {
      const min = new Date('2024-01-01');
      const max = new Date('2024-12-31');

      const validator = createDateValidationChain()
        .custom(dateRangeValidator(min, max));

      const result1 = await validator.validate(new Date('2024-06-15'));
      expect(result1.valid).toBe(true);

      const result2 = await validator.validate(new Date('2023-01-01'));
      expect(result2.valid).toBe(false);

      const result3 = await validator.validate(new Date('2025-01-01'));
      expect(result3.valid).toBe(false);
    });

    it('noWeekendsValidator 应该拒绝周末', async () => {
      const validator = createDateValidationChain()
        .custom(noWeekendsValidator());

      // 周一
      const monday = new Date('2024-01-01'); // 假设这是周一
      const result1 = await validator.validate(monday);

      // 周六
      const saturday = new Date('2024-01-06'); // 假设这是周六
      const result2 = await validator.validate(saturday);

      expect(result2.valid).toBe(false);
    });
  });

  describe('异步验证', () => {
    it('应该支持异步验证', async () => {
      const validator = createDateValidationChain()
        .asyncCustom(async (date) => {
          // 模拟异步检查
          await new Promise((resolve) => setTimeout(resolve, 10));

          return {
            valid: date !== null && date.getFullYear() === 2024,
            message: '异步验证失败',
          };
        });

      const result1 = await validator.validate(new Date('2024-01-01'));
      expect(result1.valid).toBe(true);

      const result2 = await validator.validate(new Date('2023-01-01'));
      expect(result2.valid).toBe(false);
    });
  });

  describe('条件验证', () => {
    it('应该支持条件验证', async () => {
      const validator = createDateValidationChain()
        .when(
          (date) => date !== null && date.getDay() === 6, // 如果是周六
          (chain) => chain.custom(() => ({
            valid: false,
            message: '周六不可用',
          }))
        );

      const saturday = new Date('2024-01-06'); // 周六
      const result1 = await validator.validate(saturday);
      expect(result1.valid).toBe(false);

      const monday = new Date('2024-01-01'); // 周一
      const result2 = await validator.validate(monday);
      expect(result2.valid).toBe(true);
    });
  });
});

