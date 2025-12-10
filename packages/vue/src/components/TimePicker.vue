<script setup lang="ts">
/**
 * TimePicker 时间选择器组件
 * 直接封装 core 的 DOMDatePicker (mode: 'time')
 */
import { ref, watch, onMounted, onUnmounted } from 'vue';
import {
  createDatePicker,
  type TimeValue,
  type DisabledTimeFn,
  type DatePickerLocale,
} from '@ldesign/datepicker-core';

// Props
export interface TimePickerProps {
  modelValue?: Date | null;
  format?: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  use12Hours?: boolean;
  hideSeconds?: boolean;
  disabledTime?: DisabledTimeFn;
  allowClear?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  locale?: DatePickerLocale;
  classPrefix?: string;
}

const props = withDefaults(defineProps<TimePickerProps>(), {
  format: 'HH:mm:ss',
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1,
  use12Hours: false,
  hideSeconds: false,
  allowClear: true,
  placeholder: '请选择时间',
  disabled: false,
  readonly: false,
  classPrefix: 'ldp',
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: Date | null];
  'change': [value: Date | null, formatted: string];
  'open': [];
  'close': [];
  'clear': [];
}>();

// 容器 ref
const containerRef = ref<HTMLElement | null>(null);

// Picker 实例
let picker: ReturnType<typeof createDatePicker> | null = null;

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (picker) {
    picker.setValue(newVal ?? null);
  }
});

onMounted(() => {
  if (!containerRef.value) return;

  picker = createDatePicker({
    mode: 'time',
    format: props.format,
    timeFormat: props.format,
    hourStep: props.hourStep,
    minuteStep: props.minuteStep,
    secondStep: props.secondStep,
    use12Hours: props.use12Hours,
    hideSeconds: props.hideSeconds,
    disabledTime: props.disabledTime,
    allowClear: props.allowClear,
    placeholder: props.placeholder,
    disabled: props.disabled,
    readonly: props.readonly,
    locale: props.locale,
    classPrefix: props.classPrefix,
    defaultValue: props.modelValue ?? undefined,
    onChange: (value, formatted) => {
      emit('update:modelValue', value as Date | null);
      emit('change', value as Date | null, formatted as string);
    },
    onOpen: () => emit('open'),
    onClose: () => emit('close'),
    onClear: () => {
      emit('update:modelValue', null);
      emit('clear');
    },
  });

  picker.mount(containerRef.value);

  if (props.modelValue) {
    picker.setValue(props.modelValue);
  }
});

onUnmounted(() => {
  picker?.destroy();
  picker = null;
});

defineExpose({
  open: () => picker?.open(),
  close: () => picker?.close(),
  clear: () => picker?.clear(),
  getValue: () => picker?.getValue(),
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
