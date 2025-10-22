/**
 * React Hook Form 集成
 */

import { useController, type Control, type FieldValues } from 'react-hook-form';
import type { PickerValue, PickerType } from '@ldesign/datepicker-shared';

/**
 * DatePicker 字段配置
 */
export interface DatePickerFieldProps {
  /** 字段名 */
  name: string;

  /** 表单控制器 */
  control: Control<any>;

  /** 选择器类型 */
  type?: PickerType;

  /** 默认值 */
  defaultValue?: PickerValue;

  /** 是否必填 */
  required?: boolean;

  /** 验证规则 */
  rules?: any;
}

/**
 * 使用 DatePicker 字段
 */
export function useDatePickerField(props: DatePickerFieldProps) {
  const {
    field,
    fieldState: { error, invalid },
    formState: { isSubmitting },
  } = useController({
    name: props.name,
    control: props.control,
    defaultValue: props.defaultValue,
    rules: props.rules,
  });

  return {
    value: field.value,
    onChange: field.onChange,
    onBlur: field.onBlur,
    name: field.name,
    error: error?.message,
    invalid,
    disabled: isSubmitting,
  };
}

/**
 * DatePicker 验证规则辅助函数
 */
export const DatePickerRules = {
  /**
   * 必填规则
   */
  required: (message = '请选择日期') => ({
    required: { value: true, message },
  }),

  /**
   * 最小日期规则
   */
  minDate: (minDate: Date, message?: string) => ({
    validate: (value: Date | null) => {
      if (!value) return true;
      return value >= minDate || (message || `日期不能早于 ${minDate.toLocaleDateString()}`);
    },
  }),

  /**
   * 最大日期规则
   */
  maxDate: (maxDate: Date, message?: string) => ({
    validate: (value: Date | null) => {
      if (!value) return true;
      return value <= maxDate || (message || `日期不能晚于 ${maxDate.toLocaleDateString()}`);
    },
  }),

  /**
   * 日期范围规则
   */
  dateRange: (minDate: Date, maxDate: Date, message?: string) => ({
    validate: (value: Date | null) => {
      if (!value) return true;
      return (
        (value >= minDate && value <= maxDate) ||
        (message || `日期必须在 ${minDate.toLocaleDateString()} 到 ${maxDate.toLocaleDateString()} 之间`)
      );
    },
  }),

  /**
   * 自定义验证规则
   */
  custom: (validator: (value: any) => boolean | string) => ({
    validate: validator,
  }),
};

/**
 * 使用示例：
 * 
 * ```tsx
 * import { useForm } from 'react-hook-form';
 * import { useDatePickerField, DatePickerRules } from '@ldesign/datepicker-integrations/react-hook-form';
 * import { DatePicker } from '@ldesign/datepicker-react';
 * 
 * function MyForm() {
 *   const { control, handleSubmit } = useForm();
 *   
 *   const dateField = useDatePickerField({
 *     name: 'birthDate',
 *     control,
 *     rules: {
 *       ...DatePickerRules.required(),
 *       ...DatePickerRules.maxDate(new Date(), '不能选择未来日期'),
 *     },
 *   });
 *   
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <DatePicker
 *         value={dateField.value}
 *         onChange={dateField.onChange}
 *         onBlur={dateField.onBlur}
 *         disabled={dateField.disabled}
 *       />
 *       {dateField.error && <span>{dateField.error}</span>}
 *     </form>
 *   );
 * }
 * ```
 */

