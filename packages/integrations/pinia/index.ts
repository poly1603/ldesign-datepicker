/**
 * Pinia 状态管理集成
 */

import { defineStore } from 'pinia';
import type { PickerValue, PickerType } from '@ldesign/datepicker-shared';

/**
 * DatePicker Pinia Store 配置
 */
export interface DatePickerStoreConfig {
  id?: string;
  initialValue?: PickerValue;
  type?: PickerType;
}

/**
 * 创建 DatePicker Pinia Store
 */
export function createDatePickerStore(config: DatePickerStoreConfig = {}) {
  return defineStore(config.id || 'datepicker', {
    state: () => ({
      value: config.initialValue || null as PickerValue,
      type: config.type || 'date' as PickerType,
      visible: false,
      focused: false,
      history: [] as PickerValue[],
      historyIndex: -1,
    }),

    getters: {
      hasValue: (state) => state.value !== null,

      isRange: (state) => state.type.endsWith('range'),

      canUndo: (state) => state.historyIndex > 0,

      canRedo: (state) => state.historyIndex < state.history.length - 1,
    },

    actions: {
      setValue(value: PickerValue) {
        // 添加到历史
        if (this.historyIndex < this.history.length - 1) {
          this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(value);
        this.historyIndex = this.history.length - 1;

        // 限制历史大小
        if (this.history.length > 50) {
          this.history.shift();
          this.historyIndex--;
        }

        this.value = value;
      },

      clear() {
        this.setValue(null);
      },

      setVisible(visible: boolean) {
        this.visible = visible;
      },

      setFocused(focused: boolean) {
        this.focused = focused;
      },

      undo() {
        if (this.canUndo) {
          this.historyIndex--;
          this.value = this.history[this.historyIndex]!;
        }
      },

      redo() {
        if (this.canRedo) {
          this.historyIndex++;
          this.value = this.history[this.historyIndex]!;
        }
      },

      reset() {
        this.value = config.initialValue || null;
        this.visible = false;
        this.focused = false;
        this.history = [];
        this.historyIndex = -1;
      },
    },
  });
}

/**
 * 使用示例：
 * 
 * ```ts
 * import { createDatePickerStore } from '@ldesign/datepicker-integrations/pinia';
 * 
 * const useDatePickerStore = createDatePickerStore({
 *   id: 'main-datepicker',
 *   initialValue: new Date(),
 *   type: 'date',
 * });
 * 
 * // 在组件中使用
 * const store = useDatePickerStore();
 * 
 * store.setValue(new Date('2024-01-01'));
 * store.undo();
 * store.redo();
 * ```
 */

