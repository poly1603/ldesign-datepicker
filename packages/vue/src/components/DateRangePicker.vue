<script setup lang="ts">
/**
 * DateRangePicker 日期范围选择器组件
 * 基于DatePicker封装，默认使用range选择模式
 */
import DatePicker from './DatePicker.vue';
import type { DatePickerProps } from './DatePicker.vue';
import type { DateRange, PickerMode } from '@ldesign/datepicker-core';

// Props - 继承DatePicker的props，但设置不同的默认值
export interface DateRangePickerProps extends Omit<DatePickerProps, 'selectionType' | 'modelValue'> {
  /** 绑定值 */
  modelValue?: DateRange | null;
  /** 面板数量，默认2 */
  panelCount?: number;
}

const props = withDefaults(defineProps<DateRangePickerProps>(), {
  mode: 'date',
  panelCount: 2,
  weekStart: 1,
  showToday: true,
  showConfirm: false,
  allowClear: true,
  disabled: false,
  readonly: false,
  classPrefix: 'ldp',
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: DateRange | null];
  'change': [value: DateRange | null, formatted: string[]];
  'panelChange': [panel: string, date: Date];
  'open': [];
  'close': [];
  'confirm': [value: DateRange | null];
  'clear': [];
}>();

// 处理值变化
const handleUpdate = (value: Date | Date[] | DateRange | null) => {
  emit('update:modelValue', value as DateRange | null);
};

const handleChange = (value: Date | Date[] | DateRange | null, formatted: string | string[]) => {
  emit('change', value as DateRange | null, formatted as string[]);
};

const handleConfirm = (value: Date | Date[] | DateRange | null) => {
  emit('confirm', value as DateRange | null);
};
</script>

<template>
  <DatePicker
    :model-value="modelValue"
    :mode="mode"
    selection-type="range"
    :format="format"
    :value-format="valueFormat"
    :week-start="weekStart"
    :disabled-date="disabledDate"
    :disabled-time="disabledTime"
    :min-date="minDate"
    :max-date="maxDate"
    :show-week-number="showWeekNumber"
    :show-today="showToday"
    :show-confirm="showConfirm"
    :show-time="showTime"
    :allow-clear="allowClear"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :panel-count="panelCount"
    :locale="locale"
    :class-prefix="classPrefix"
    @update:model-value="handleUpdate"
    @change="handleChange"
    @panel-change="(panel, date) => emit('panelChange', panel, date)"
    @open="emit('open')"
    @close="emit('close')"
    @confirm="handleConfirm"
    @clear="emit('clear')"
  />
</template>
