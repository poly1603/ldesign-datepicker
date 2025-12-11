/**
 * DatePicker 核心类
 * 管理日期选择器的状态和逻辑
 */

import type {
  DatePickerConfig,
  DatePickerState,
  DatePickerOptions,
  DateRange,
  TimeValue,
  PanelType,
  PickerMode,
  SelectionType,
  WeekStart,
  DatePickerLocale,
} from '../types';
import {
  cloneDate,
  getToday,
  isSameDay,
  addMonths,
  addYears,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  startOfQuarter,
  endOfQuarter,
  getWeekInfo,
  setTime,
  getTime,
  compareDate,
  isValidDate,
  parseDate,
} from '../utils/date';
import {
  formatDate,
  formatWeek,
  formatMonth,
  formatQuarter,
  formatYear,
  mergeLocale,
  getDefaultFormat,
  defaultLocale,
} from '../utils/format';
import {
  generateCalendarPanel,
  type CalendarPanelData,
} from '../panels/calendar';
import {
  generateMonthPanel,
  type MonthPanelData,
} from '../panels/month';
import {
  generateQuarterPanel,
  type QuarterPanelData,
} from '../panels/quarter';
import {
  generateYearPanel,
  getDecadeStart,
  type YearPanelData,
} from '../panels/year';
import {
  generateTimePanel,
  type TimePanelData,
} from '../panels/time';

/** 默认配置 */
const defaultOptions: Required<DatePickerOptions> = {
  mode: 'date',
  selectionType: 'single',
  weekStart: 1,
  format: '',
  valueFormat: '',
  defaultValue: null,
  disabledDate: undefined as never,
  disabledTime: undefined as never,
  minDate: undefined as never,
  maxDate: undefined as never,
  showWeekNumber: false,
  showToday: true,
  showConfirm: false,
  showTime: false,
  timeFormat: 'HH:mm:ss',
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1,
  use12Hours: false,
  hideSeconds: false,
  showTimeSeparator: false,
  timeCommitMode: 'confirm',
  panelCount: 1,
  locale: defaultLocale as Required<DatePickerLocale>,
  allowClear: true,
  placeholder: '',
  classPrefix: 'ldp',
  container: 'body',
  zIndex: 1000,
};

export type DatePickerEventType =
  | 'change'
  | 'panelChange'
  | 'open'
  | 'close'
  | 'confirm'
  | 'clear'
  | 'focus'
  | 'blur'
  | 'stateChange';

export type DatePickerEventHandler = (...args: unknown[]) => void;

/**
 * DatePicker 核心类
 */
export class DatePickerCore {
  private options: Required<DatePickerOptions>;
  private state: DatePickerState;
  private eventHandlers: Map<DatePickerEventType, Set<DatePickerEventHandler>>;
  private locale: Required<DatePickerLocale>;

  constructor(config: DatePickerConfig = {}) {
    // 合并配置
    this.options = { ...defaultOptions, ...config };

    // 范围选择模式自动设置双面板（除了日期时间范围）
    if (this.options.selectionType === 'range' && !this.options.showTime && !config.panelCount) {
      this.options.panelCount = 2;
    }

    // 日期时间模式自动设置双面板（左侧日期，右侧时间）
    if (this.options.mode === 'datetime' && !config.panelCount) {
      this.options.panelCount = 2;
    }

    this.locale = mergeLocale(config.locale);

    // 初始化事件处理器
    this.eventHandlers = new Map();

    // 注册回调
    if (config.onChange) this.on('change', config.onChange as DatePickerEventHandler);
    if (config.onPanelChange) this.on('panelChange', config.onPanelChange as DatePickerEventHandler);
    if (config.onOpen) this.on('open', config.onOpen);
    if (config.onClose) this.on('close', config.onClose);
    if (config.onConfirm) this.on('confirm', config.onConfirm as DatePickerEventHandler);
    if (config.onClear) this.on('clear', config.onClear);

    // 初始化状态
    this.state = this.createInitialState();
  }

  /**
   * 创建初始状态
   */
  private createInitialState(): DatePickerState {
    const { mode, selectionType, defaultValue } = this.options;

    // 解析默认值
    let value: Date | Date[] | DateRange | null = null;

    if (defaultValue) {
      if (selectionType === 'range') {
        value = defaultValue as DateRange;
      } else if (selectionType === 'multiple') {
        value = defaultValue as Date[];
      } else {
        value = defaultValue as Date;
      }
    }

    // 确定初始视图日期
    const viewDate = this.getViewDateFromValue(value) || getToday();

    // 确定初始面板类型
    const panelType = this.getPanelTypeFromMode(mode);

    return {
      value,
      panel: {
        type: panelType,
        viewDate,
        visible: false,
      },
      focused: false,
      hovered: false,
      hoverDate: null,
      activeInput: 'start',
      timeValue: { hour: 0, minute: 0, second: 0 },
      endTimeValue: { hour: 0, minute: 0, second: 0 },
    };
  }

  /**
   * 从值获取视图日期
   */
  private getViewDateFromValue(value: Date | Date[] | DateRange | null): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
      return cloneDate(value);
    }

    if (Array.isArray(value) && value.length > 0) {
      return cloneDate(value[0]);
    }

    if ('start' in value && value.start) {
      return cloneDate(value.start);
    }

    return null;
  }

  /**
   * 根据模式获取面板类型
   */
  private getPanelTypeFromMode(mode: PickerMode): PanelType {
    const mapping: Record<PickerMode, PanelType> = {
      date: 'date',
      datetime: 'date',
      week: 'week',
      month: 'month',
      quarter: 'quarter',
      year: 'year',
      time: 'time',
    };
    return mapping[mode] || 'date';
  }

  // ==================== 事件系统 ====================

  /**
   * 注册事件监听器
   */
  on(event: DatePickerEventType, handler: DatePickerEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    return () => this.off(event, handler);
  }

  /**
   * 移除事件监听器
   */
  off(event: DatePickerEventType, handler: DatePickerEventHandler): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  /**
   * 触发事件
   */
  private emit(event: DatePickerEventType, ...args: unknown[]): void {
    this.eventHandlers.get(event)?.forEach(handler => handler(...args));
  }

  // ==================== 状态管理 ====================

  /**
   * 获取当前状态
   */
  getState(): DatePickerState {
    return { ...this.state };
  }

  /**
   * 获取配置
   */
  getOptions(): Required<DatePickerOptions> {
    return { ...this.options };
  }

  /**
   * 更新状态
   */
  private setState(partial: Partial<DatePickerState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...partial };
    this.emit('stateChange', this.state, oldState);
  }

  /**
   * 获取值
   */
  getValue(): Date | Date[] | DateRange | null {
    return this.state.value;
  }

  /**
   * 设置值
   */
  setValue(value: Date | Date[] | DateRange | null, emitChange = true): void {
    this.setState({ value });

    if (value) {
      const viewDate = this.getViewDateFromValue(value);
      if (viewDate) {
        this.setViewDate(viewDate);
      }
    }

    if (emitChange) {
      this.emit('change', value, this.formatValue(value));
    }
  }

  /**
   * 清除值
   */
  clear(): void {
    this.setValue(null);
    this.emit('clear');
  }

  // ==================== 面板控制 ====================

  /**
   * 打开面板
   */
  open(): void {
    if (this.state.panel.visible) return;

    this.setState({
      panel: { ...this.state.panel, visible: true },
    });
    this.emit('open');
  }

  /**
   * 关闭面板
   */
  close(): void {
    if (!this.state.panel.visible) return;

    this.setState({
      panel: { ...this.state.panel, visible: false },
      hoverDate: null,
    });
    this.emit('close');
  }

  /**
   * 切换面板
   */
  toggle(): void {
    if (this.state.panel.visible) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * 设置面板类型
   */
  setPanelType(type: PanelType): void {
    this.setState({
      panel: { ...this.state.panel, type },
    });
    this.emit('panelChange', type, this.state.panel.viewDate);
  }

  /**
   * 获取面板类型
   */
  getPanelType(): PanelType {
    return this.state.panel.type;
  }

  /**
   * 设置视图日期
   */
  setViewDate(date: Date): void {
    this.setState({
      panel: { ...this.state.panel, viewDate: cloneDate(date) },
    });
  }

  /**
   * 获取视图日期
   */
  getViewDate(): Date {
    return cloneDate(this.state.panel.viewDate);
  }

  /**
   * 上一个月/年/十年
   */
  prev(): void {
    const { type, viewDate } = this.state.panel;
    let newDate: Date;

    switch (type) {
      case 'date':
      case 'week':
        newDate = addMonths(viewDate, -1);
        break;
      case 'month':
      case 'quarter':
        newDate = addYears(viewDate, -1);
        break;
      case 'year':
        newDate = addYears(viewDate, -10);
        break;
      default:
        newDate = addMonths(viewDate, -1);
    }

    this.setViewDate(newDate);
  }

  /**
   * 下一个月/年/十年
   */
  next(): void {
    const { type, viewDate } = this.state.panel;
    let newDate: Date;

    switch (type) {
      case 'date':
      case 'week':
        newDate = addMonths(viewDate, 1);
        break;
      case 'month':
      case 'quarter':
        newDate = addYears(viewDate, 1);
        break;
      case 'year':
        newDate = addYears(viewDate, 10);
        break;
      default:
        newDate = addMonths(viewDate, 1);
    }

    this.setViewDate(newDate);
  }

  /**
   * 上一年
   */
  prevYear(): void {
    const { viewDate } = this.state.panel;
    this.setViewDate(addYears(viewDate, -1));
  }

  /**
   * 下一年
   */
  nextYear(): void {
    const { viewDate } = this.state.panel;
    this.setViewDate(addYears(viewDate, 1));
  }

  /**
   * 跳转到今天
   */
  goToday(): void {
    const today = getToday();
    this.setViewDate(today);

    if (this.options.selectionType === 'single') {
      this.selectDate(today);
    }
  }

  // ==================== 日期选择 ====================

  /**
   * 选择日期
   */
  selectDate(date: Date): void {
    const { mode, selectionType, showTime, showConfirm } = this.options;

    // 检查是否禁用
    if (this.isDateDisabled(date)) return;

    if (selectionType === 'single') {
      // 单选模式
      let newValue = cloneDate(date);

      // 如果显示时间，合并时间值
      if (showTime || mode === 'datetime') {
        newValue = setTime(newValue, this.state.timeValue);
      }

      this.setValue(newValue);

      // 如果不需要确认，自动关闭
      if (!showConfirm && !showTime && mode !== 'datetime') {
        this.close();
      }
    } else if (selectionType === 'range') {
      this.selectRangeDate(date);
    } else if (selectionType === 'multiple') {
      this.selectMultipleDate(date);
    }
  }

  /**
   * 范围选择日期
   */
  private selectRangeDate(date: Date): void {
    const { activeInput } = this.state;
    const currentRange = (this.state.value as DateRange) || { start: null, end: null };

    let newRange: DateRange;

    if (activeInput === 'start' || !currentRange.start) {
      // 选择开始日期（或者重新开始选择）
      newRange = { start: date, end: null };
      this.setValue(newRange);
      this.setState({ activeInput: 'end', hoverDate: null });
    } else {
      // 选择结束日期（activeInput === 'end' && currentRange.start 存在）
      // 确保 start <= end
      if (compareDate(date, currentRange.start) < 0) {
        newRange = { start: date, end: currentRange.start };
      } else {
        newRange = { start: currentRange.start, end: date };
      }

      // 先设置值（包含 end）
      this.setValue(newRange);

      // 然后清除 hover 状态
      this.setState({ activeInput: 'start', hoverDate: null });

      // 范围选择完成，如果不需要确认则关闭
      if (!this.options.showConfirm) {
        this.close();
      }
    }
  }

  /**
   * 多选日期
   */
  private selectMultipleDate(date: Date): void {
    const currentDates = (this.state.value as Date[]) || [];

    // 检查是否已选中
    const index = currentDates.findIndex(d => isSameDay(d, date));

    let newDates: Date[];
    if (index >= 0) {
      // 取消选中
      newDates = [...currentDates];
      newDates.splice(index, 1);
    } else {
      // 添加选中
      newDates = [...currentDates, date];
    }

    this.setValue(newDates);
  }

  /**
   * 选择周
   */
  selectWeek(date: Date): void {
    const weekStart = startOfWeek(date, this.options.weekStart);
    const weekEnd = endOfWeek(date, this.options.weekStart);

    if (this.options.selectionType === 'range') {
      // 周范围选择：传递周的开始日期
      this.selectRangeDate(weekStart);
    } else {
      this.setValue(weekStart);
      if (!this.options.showConfirm) {
        this.close();
      }
    }
  }

  /**
   * 选择月份
   */
  selectMonth(year: number, month: number): void {
    const date = new Date(year, month, 1);

    if (this.options.mode === 'month') {
      if (this.options.selectionType === 'range') {
        this.selectRangeDate(date);
      } else {
        this.setValue(date);
        if (!this.options.showConfirm) {
          this.close();
        }
      }
    } else {
      // 钻取到日期面板
      this.setViewDate(date);
      this.setPanelType('date');
    }
  }

  /**
   * 选择季度
   */
  selectQuarter(year: number, quarter: number): void {
    const month = (quarter - 1) * 3;
    const date = new Date(year, month, 1);

    if (this.options.selectionType === 'range') {
      this.selectRangeDate(date);
    } else {
      this.setValue(date);
      if (!this.options.showConfirm) {
        this.close();
      }
    }
  }

  /**
   * 选择年份
   */
  selectYear(year: number): void {
    const date = new Date(year, 0, 1);

    if (this.options.mode === 'year') {
      if (this.options.selectionType === 'range') {
        this.selectRangeDate(date);
      } else {
        this.setValue(date);
        if (!this.options.showConfirm) {
          this.close();
        }
      }
    } else {
      // 钻取到月份面板
      this.setViewDate(date);
      this.setPanelType('month');
    }
  }

  /**
   * 选择时间
   */
  selectTime(time: Partial<TimeValue>, isEnd = false): void {
    if (isEnd) {
      this.setState({
        endTimeValue: { ...this.state.endTimeValue!, ...time },
      });
    } else {
      this.setState({
        timeValue: { ...this.state.timeValue, ...time },
      });
    }

    // 根据 timeCommitMode 决定是否立即触发 change 事件
    // datetime 模式下总是立即更新显示
    const shouldEmitChange = this.options.timeCommitMode === 'immediate' || this.options.mode === 'datetime';

    // 如果有选中的日期，更新日期的时间部分
    if (this.state.value instanceof Date) {
      const newDate = setTime(this.state.value, { ...this.state.timeValue, ...time });
      this.setValue(newDate, shouldEmitChange);
    } else if (this.options.mode === 'time' || this.options.mode === 'datetime') {
      // 时间模式或日期时间模式，创建一个今天的日期并设置时间
      const today = new Date();
      const newDate = setTime(today, { ...this.state.timeValue, ...time });
      this.setValue(newDate, shouldEmitChange);
    }
  }

  /**
   * 确认选择
   */
  confirm(): void {
    // 在 confirm 模式下，确认时需要触发 change 事件
    if (this.options.timeCommitMode === 'confirm' && this.options.mode === 'time') {
      this.emit('change', this.state.value, this.getDisplayText());
    }
    this.emit('confirm', this.state.value);
    this.close();
  }

  // ==================== 悬停处理 ====================

  /**
   * 设置悬停日期
   */
  setHoverDate(date: Date | null): void {
    // 只在范围选择、正在选择第二个日期、且未完成选择时生效
    const isRangeMode = this.options.selectionType === 'range';
    const currentRange = this.state.value as DateRange;
    const { activeInput } = this.state;

    // 关键条件：activeInput === 'end' 表示正在等待选择第二个日期
    if (isRangeMode && activeInput === 'end' && currentRange && currentRange.start && !currentRange.end) {
      this.setState({ hoverDate: date });
    }
  }

  /**
   * 设置激活的输入框
   */
  setActiveInput(input: 'start' | 'end'): void {
    this.setState({ activeInput: input });
  }

  // ==================== 禁用判断 ====================

  /**
   * 判断日期是否禁用
   */
  isDateDisabled(date: Date): boolean {
    const { disabledDate, minDate, maxDate } = this.options;

    if (disabledDate && disabledDate(date)) return true;
    if (minDate && compareDate(date, minDate) < 0) return true;
    if (maxDate && compareDate(date, maxDate) > 0) return true;

    return false;
  }

  // ==================== 格式化 ====================

  /**
   * 格式化值
   */
  formatValue(value: Date | Date[] | DateRange | null): string | string[] {
    if (!value) return '';

    const { mode, selectionType, showTime } = this.options;
    const format = this.options.format || getDefaultFormat(mode, showTime);

    if (selectionType === 'multiple' && Array.isArray(value)) {
      return value.map(d => this.formatSingleValue(d, format));
    }

    if (selectionType === 'range' && 'start' in value) {
      return [
        value.start ? this.formatSingleValue(value.start, format) : '',
        value.end ? this.formatSingleValue(value.end, format) : '',
      ];
    }

    if (value instanceof Date) {
      return this.formatSingleValue(value, format);
    }

    return '';
  }

  /**
   * 格式化单个日期值
   */
  private formatSingleValue(date: Date, format: string): string {
    const { mode } = this.options;

    switch (mode) {
      case 'week':
        return formatWeek(date, this.locale, this.options.weekStart);
      case 'month':
        return formatMonth(date, this.locale);
      case 'quarter':
        return formatQuarter(date, this.locale);
      case 'year':
        return formatYear(date);
      default:
        return formatDate(date, format, this.locale, this.options.weekStart);
    }
  }

  /**
   * 获取显示文本
   */
  getDisplayText(): string | [string, string] {
    const formatted = this.formatValue(this.state.value);

    if (Array.isArray(formatted)) {
      return [formatted[0] || '', formatted[1] || ''] as [string, string];
    }

    return formatted || '';
  }

  // ==================== 面板数据生成 ====================

  /**
   * 生成日历面板数据
   */
  getCalendarPanelData(panelIndex = 0): CalendarPanelData {
    const { viewDate } = this.state.panel;
    const viewDateForPanel = panelIndex > 0 ? addMonths(viewDate, panelIndex) : viewDate;

    return generateCalendarPanel({
      viewDate: viewDateForPanel,
      selectedDate: this.getSelectedDatesForPanel(),
      dateRange: this.options.selectionType === 'range' ? (this.state.value as DateRange) : null,
      hoverDate: this.state.hoverDate,
      weekStart: this.options.weekStart,
      showWeekNumber: this.options.showWeekNumber || this.options.mode === 'week',
      disabledDate: this.options.disabledDate,
      minDate: this.options.minDate,
      maxDate: this.options.maxDate,
      locale: this.locale,
      isWeekMode: this.options.mode === 'week',
    });
  }

  /**
   * 生成月份面板数据
   */
  getMonthPanelData(panelIndex = 0): MonthPanelData {
    const { viewDate } = this.state.panel;
    const viewYear = viewDate.getFullYear() + panelIndex;

    return generateMonthPanel({
      viewYear,
      selectedDate: this.getSelectedDatesForPanel(),
      dateRange: this.options.selectionType === 'range' ? (this.state.value as DateRange) : null,
      hoverDate: this.state.hoverDate,
      disabledDate: this.options.disabledDate,
      minDate: this.options.minDate,
      maxDate: this.options.maxDate,
      locale: this.locale,
    });
  }

  /**
   * 生成季度面板数据
   */
  getQuarterPanelData(panelIndex = 0): QuarterPanelData {
    const { viewDate } = this.state.panel;
    const viewYear = viewDate.getFullYear() + panelIndex;

    return generateQuarterPanel({
      viewYear,
      selectedDate: this.getSelectedDatesForPanel(),
      dateRange: this.options.selectionType === 'range' ? (this.state.value as DateRange) : null,
      hoverDate: this.state.hoverDate,
      disabledDate: this.options.disabledDate,
      minDate: this.options.minDate,
      maxDate: this.options.maxDate,
      locale: this.locale,
    });
  }

  /**
   * 生成年份面板数据
   */
  getYearPanelData(panelIndex = 0): YearPanelData {
    const { viewDate } = this.state.panel;
    const decadeStart = getDecadeStart(viewDate) + panelIndex * 10;

    return generateYearPanel({
      viewDecadeStart: decadeStart,
      selectedDate: this.getSelectedDatesForPanel(),
      dateRange: this.options.selectionType === 'range' ? (this.state.value as DateRange) : null,
      hoverDate: this.state.hoverDate,
      disabledDate: this.options.disabledDate,
      minDate: this.options.minDate,
      maxDate: this.options.maxDate,
    });
  }

  /**
   * 生成时间面板数据
   */
  getTimePanelData(isEnd = false): TimePanelData {
    const timeValue = isEnd ? this.state.endTimeValue : this.state.timeValue;

    return generateTimePanel({
      value: timeValue,
      hourStep: this.options.hourStep,
      minuteStep: this.options.minuteStep,
      secondStep: this.options.secondStep,
      use12Hours: this.options.use12Hours,
      hideSeconds: this.options.hideSeconds,
      disabledTime: this.options.disabledTime,
      date: this.state.value instanceof Date ? this.state.value : undefined,
    });
  }

  /**
   * 获取面板需要的选中日期
   */
  private getSelectedDatesForPanel(): Date | Date[] | null {
    const { value } = this.state;

    if (!value) return null;

    if (value instanceof Date) return value;
    if (Array.isArray(value)) return value;

    // DateRange
    const dates: Date[] = [];
    if (value.start) dates.push(value.start);
    if (value.end) dates.push(value.end);
    return dates.length > 0 ? dates : null;
  }

  // ==================== 销毁 ====================

  /**
   * 销毁实例
   */
  destroy(): void {
    this.eventHandlers.clear();
  }
}
