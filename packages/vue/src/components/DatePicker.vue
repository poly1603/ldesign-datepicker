<script setup lang="ts">
/**
 * DatePicker 日期选择器组件
 * 直接封装 core 的 DOMDatePicker
 */
import { ref, watch, onMounted, onUnmounted } from 'vue';
import {
  createDatePicker,
  type DOMRendererOptions,
  type DateRange,
  type PickerMode,
  type SelectionType,
  type WeekStart,
  type DisabledDateFn,
  type DisabledTimeFn,
  type DatePickerLocale,
} from '@ldesign/datepicker-core';

// Props - 直接透传给 core
export interface DatePickerProps {
  modelValue?: Date | Date[] | DateRange | null;
  mode?: PickerMode;
  selectionType?: SelectionType;
  format?: string;
  valueFormat?: string;
  weekStart?: WeekStart;
  disabledDate?: DisabledDateFn;
  disabledTime?: DisabledTimeFn;
  minDate?: Date;
  maxDate?: Date;
  showWeekNumber?: boolean;
  showToday?: boolean;
  showConfirm?: boolean;
  showTime?: boolean;
  allowClear?: boolean;
  placeholder?: string | [string, string];
  disabled?: boolean;
  readonly?: boolean;
  panelCount?: number;
  locale?: DatePickerLocale;
  classPrefix?: string;
}

const props = withDefaults(defineProps<DatePickerProps>(), {
  mode: 'date',
  selectionType: 'single',
  weekStart: 1,
  format: '',
  valueFormat: '',
  showWeekNumber: false,
  showToday: true,
  showConfirm: false,
  showTime: false,
  allowClear: true,
  disabled: false,
  readonly: false,
  // panelCount 不设置默认值，让核心库自动判断
  classPrefix: 'ldp',
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: Date | Date[] | DateRange | null];
  'change': [value: Date | Date[] | DateRange | null, formatted: string | string[]];
  'open': [];
  'close': [];
  'clear': [];
}>();

// 容器 ref
const containerRef = ref<HTMLElement | null>(null);

// DOMDatePicker 实例
let picker: ReturnType<typeof createDatePicker> | null = null;

// 将 props 转换为 core 配置
function getPickerOptions(): DOMRendererOptions {
  return {
    mode: props.mode,
    selectionType: props.selectionType,
    format: props.format,
    valueFormat: props.valueFormat,
    weekStart: props.weekStart,
    disabledDate: props.disabledDate,
    disabledTime: props.disabledTime,
    minDate: props.minDate,
    maxDate: props.maxDate,
    showWeekNumber: props.showWeekNumber,
    showToday: props.showToday,
    showConfirm: props.showConfirm,
    showTime: props.showTime,
    allowClear: props.allowClear,
    placeholder: props.placeholder,
    disabled: props.disabled,
    readonly: props.readonly,
    panelCount: props.panelCount,
    locale: props.locale,
    classPrefix: props.classPrefix,
    defaultValue: props.modelValue ?? undefined,
    // 事件回调
    onChange: (value, formatted) => {
      emit('update:modelValue', value);
      emit('change', value, formatted);
    },
    onOpen: () => emit('open'),
    onClose: () => emit('close'),
    onClear: () => {
      emit('update:modelValue', null);
      emit('clear');
    },
  };
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (picker) {
    picker.setValue(newVal ?? null);
  }
});

onMounted(() => {
  if (!containerRef.value) return;

  // 创建 picker 实例
  picker = createDatePicker(getPickerOptions());
  picker.mount(containerRef.value);

  // 设置初始值
  if (props.modelValue) {
    picker.setValue(props.modelValue);
  }
});

onUnmounted(() => {
  picker?.destroy();
  picker = null;
});

// 暴露方法
defineExpose({
  open: () => picker?.open(),
  close: () => picker?.close(),
  clear: () => picker?.clear(),
  getValue: () => picker?.getValue(),
  getCore: () => picker?.getCore(),
});
</script>

<template>
  <div ref="containerRef" class="ldp-wrapper"></div>
</template>

<style>
.ldp-wrapper {
  display: inline-block;
}
</style>
