/**
 * v-datepicker 指令
 * 将日期选择器功能附加到任意输入元素
 */

import type { Directive, DirectiveBinding } from 'vue';
import {
  DOMDatePicker,
  type DOMRendererOptions,
  type DateRange,
} from '@ldesign/datepicker-core';

export interface DatepickerDirectiveBinding extends DOMRendererOptions {
  /** 值变化回调 */
  onUpdate?: (value: Date | Date[] | DateRange | null) => void;
}

const datepickerMap = new WeakMap<HTMLElement, DOMDatePicker>();

export const vDatepicker: Directive<HTMLElement, DatepickerDirectiveBinding> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<DatepickerDirectiveBinding>) {
    const options = binding.value || {};

    // 创建日期选择器实例
    const picker = new DOMDatePicker({
      ...options,
      trigger: el,
      input: el instanceof HTMLInputElement ? el : undefined,
      useBuiltinInput: false,
      onChange: (value: Date | Date[] | DateRange | null, formatted: string | string[]) => {
        // 更新输入框值
        if (el instanceof HTMLInputElement) {
          el.value = Array.isArray(formatted) ? formatted.join(' - ') : formatted;
        }
        // 触发回调
        options.onUpdate?.(value);
      },
    });

    // 存储实例
    datepickerMap.set(el, picker);
  },

  updated(el: HTMLElement, binding: DirectiveBinding<DatepickerDirectiveBinding>) {
    const picker = datepickerMap.get(el);
    if (!picker) return;

    // 根据binding.value的变化更新picker
    // 这里可以根据需要扩展更新逻辑
  },

  unmounted(el: HTMLElement) {
    const picker = datepickerMap.get(el);
    if (picker) {
      picker.destroy();
      datepickerMap.delete(el);
    }
  },
};

export default vDatepicker;
