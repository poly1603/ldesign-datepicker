/**
 * useDatePicker Hook
 * 提供日期选择器的核心逻辑
 */

import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue';
import {
  DatePickerCore,
  type DatePickerConfig,
  type DatePickerState,
  type DateRange,
  type PanelType,
  type CalendarPanelData,
  type MonthPanelData,
  type QuarterPanelData,
  type YearPanelData,
  type TimePanelData,
  type TimeValue,
} from '@ldesign/datepicker-core';

export interface UseDatePickerOptions extends DatePickerConfig {
  /** 受控值 */
  modelValue?: Date | Date[] | DateRange | null;
}

export interface UseDatePickerReturn {
  /** 核心实例 */
  core: DatePickerCore;
  /** 当前状态 */
  state: Ref<DatePickerState>;
  /** 是否显示面板 */
  visible: Ref<boolean>;
  /** 显示文本 */
  displayText: Ref<string | [string, string]>;
  /** 当前面板类型 */
  panelType: Ref<PanelType>;
  /** 视图日期 */
  viewDate: Ref<Date>;
  /** 日历面板数据 */
  calendarData: Ref<CalendarPanelData>;
  /** 月份面板数据 */
  monthData: Ref<MonthPanelData>;
  /** 季度面板数据 */
  quarterData: Ref<QuarterPanelData>;
  /** 年份面板数据 */
  yearData: Ref<YearPanelData>;
  /** 时间面板数据 */
  timeData: Ref<TimePanelData>;
  /** 打开面板 */
  open: () => void;
  /** 关闭面板 */
  close: () => void;
  /** 切换面板 */
  toggle: () => void;
  /** 选择日期 */
  selectDate: (date: Date) => void;
  /** 选择周 */
  selectWeek: (date: Date) => void;
  /** 选择月份 */
  selectMonth: (year: number, month: number) => void;
  /** 选择季度 */
  selectQuarter: (year: number, quarter: number) => void;
  /** 选择年份 */
  selectYear: (year: number) => void;
  /** 选择时间 */
  selectTime: (time: Partial<TimeValue>, isEnd?: boolean) => void;
  /** 上一个 */
  prev: () => void;
  /** 下一个 */
  next: () => void;
  /** 上一年 */
  prevYear: () => void;
  /** 下一年 */
  nextYear: () => void;
  /** 今天 */
  goToday: () => void;
  /** 确认 */
  confirm: () => void;
  /** 清除 */
  clear: () => void;
  /** 设置面板类型 */
  setPanelType: (type: PanelType) => void;
  /** 设置悬停日期 */
  setHoverDate: (date: Date | null) => void;
  /** 设置激活输入框 */
  setActiveInput: (input: 'start' | 'end') => void;
  /** 获取日历面板数据 */
  getCalendarData: (panelIndex?: number) => CalendarPanelData;
  /** 获取月份面板数据 */
  getMonthData: (panelIndex?: number) => MonthPanelData;
  /** 获取季度面板数据 */
  getQuarterData: (panelIndex?: number) => QuarterPanelData;
  /** 获取年份面板数据 */
  getYearData: (panelIndex?: number) => YearPanelData;
  /** 获取时间面板数据 */
  getTimeData: (isEnd?: boolean) => TimePanelData;
}

/**
 * 日期选择器Hook
 */
export function useDatePicker(options: UseDatePickerOptions = {}): UseDatePickerReturn {
  // 创建核心实例
  const core = new DatePickerCore(options);

  // 响应式状态
  const state = ref<DatePickerState>(core.getState());

  // 计算属性
  const visible = computed(() => state.value.panel.visible);
  const displayText = computed(() => core.getDisplayText());
  const panelType = computed(() => state.value.panel.type);
  const viewDate = computed(() => state.value.panel.viewDate);

  // 面板数据
  const calendarData = computed(() => core.getCalendarPanelData());
  const monthData = computed(() => core.getMonthPanelData());
  const quarterData = computed(() => core.getQuarterPanelData());
  const yearData = computed(() => core.getYearPanelData());
  const timeData = computed(() => core.getTimePanelData());

  // 监听状态变化
  const unsubscribe = core.on('stateChange', (newState: DatePickerState) => {
    state.value = { ...newState };
  });

  // 监听受控值变化
  if (options.modelValue !== undefined) {
    watch(
      () => options.modelValue,
      (newValue) => {
        if (newValue !== core.getValue()) {
          core.setValue(newValue ?? null, false);
        }
      },
      { immediate: true }
    );
  }

  // 清理
  onUnmounted(() => {
    unsubscribe();
    core.destroy();
  });

  // 方法
  const open = () => core.open();
  const close = () => core.close();
  const toggle = () => core.toggle();
  const selectDate = (date: Date) => core.selectDate(date);
  const selectWeek = (date: Date) => core.selectWeek(date);
  const selectMonth = (year: number, month: number) => core.selectMonth(year, month);
  const selectQuarter = (year: number, quarter: number) => core.selectQuarter(year, quarter);
  const selectYear = (year: number) => core.selectYear(year);
  const selectTime = (time: Partial<TimeValue>, isEnd = false) => core.selectTime(time, isEnd);
  const prev = () => core.prev();
  const next = () => core.next();
  const prevYear = () => core.prevYear();
  const nextYear = () => core.nextYear();
  const goToday = () => core.goToday();
  const confirm = () => core.confirm();
  const clear = () => core.clear();
  const setPanelType = (type: PanelType) => core.setPanelType(type);
  const setHoverDate = (date: Date | null) => core.setHoverDate(date);
  const setActiveInput = (input: 'start' | 'end') => core.setActiveInput(input);
  const getCalendarData = (panelIndex = 0) => core.getCalendarPanelData(panelIndex);
  const getMonthData = (panelIndex = 0) => core.getMonthPanelData(panelIndex);
  const getQuarterData = (panelIndex = 0) => core.getQuarterPanelData(panelIndex);
  const getYearData = (panelIndex = 0) => core.getYearPanelData(panelIndex);
  const getTimeData = (isEnd = false) => core.getTimePanelData(isEnd);

  return {
    core,
    state,
    visible,
    displayText,
    panelType,
    viewDate,
    calendarData,
    monthData,
    quarterData,
    yearData,
    timeData,
    open,
    close,
    toggle,
    selectDate,
    selectWeek,
    selectMonth,
    selectQuarter,
    selectYear,
    selectTime,
    prev,
    next,
    prevYear,
    nextYear,
    goToday,
    confirm,
    clear,
    setPanelType,
    setHoverDate,
    setActiveInput,
    getCalendarData,
    getMonthData,
    getQuarterData,
    getYearData,
    getTimeData,
  };
}
