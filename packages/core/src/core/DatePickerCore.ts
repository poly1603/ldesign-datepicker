/**
 * 日期选择器核心类 - 重构版
 * 集成状态管理器、中间件、插件系统
 */

import type {
  PickerType,
  ViewType,
  PickerValue,
  DateValue,
  DateRangeValue,
  DatesValue,
  DisabledDateFunc,
  DisabledTimeFunc,
  Shortcut,
  Locale,
  WeekDay,
} from '@ldesign/datepicker-shared';
import { cloneDate, parseDate } from '@ldesign/datepicker-shared';
import { StateManager } from '../architecture/StateManager';
import { MiddlewareManager, type MiddlewareContext } from '../architecture/Middleware';
import { PluginManager } from '../architecture/PluginSystem';
import { CommandManager } from '../architecture/CommandPattern';

/**
 * 日期选择器状态
 */
export interface DatePickerState {
  // 当前选中的值
  value: PickerValue;

  // 临时选择的值（用于范围选择）
  tempValue: PickerValue;

  // 当前视图类型
  view: ViewType;

  // 当前显示的日期（用于面板导航）
  currentDate: Date;

  // 是否显示面板
  visible: boolean;

  // 是否聚焦
  focused: boolean;

  // 范围选择的起始日期（临时）
  rangeStart: Date | null;

  // 悬停的日期（用于范围预览）
  hoverDate: Date | null;

  // 当前面板索引（范围选择时有两个面板）
  panelIndex: number;

  // 状态机状态
  machineState: 'idle' | 'selecting' | 'confirming' | 'disabled';
}

/**
 * 日期选择器配置
 */
export interface DatePickerConfig {
  type: PickerType;
  format?: string;
  valueFormat?: string;
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  rangeSeparator?: string;
  defaultValue?: PickerValue;
  defaultTime?: Date | [Date, Date];
  disabledDate?: DisabledDateFunc;
  disabledTime?: DisabledTimeFunc;
  shortcuts?: Shortcut[];
  clearable?: boolean;
  editable?: boolean;
  unlinkPanels?: boolean;
  weekStartsOn?: WeekDay;
  use12Hours?: boolean;
  showWeekNumber?: boolean;
  locale?: Locale;

  // 性能选项
  enableCache?: boolean;
  enableTimeTravel?: boolean;
  maxHistory?: number;

  // 回调
  onChange?: (value: PickerValue) => void;
  onInput?: (value: PickerValue) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onClear?: () => void;
  onVisibleChange?: (visible: boolean) => void;
  onPanelChange?: (date: Date, mode: ViewType) => void;
}

/**
 * 日期选择器核心类
 */
export class DatePickerCore {
  private stateManager: StateManager<DatePickerState>;
  private middlewareManager: MiddlewareManager<DatePickerState>;
  private pluginManager: PluginManager;
  private commandManager: CommandManager;
  private config: Required<Omit<DatePickerConfig, 'onChange' | 'onInput' | 'onBlur' | 'onFocus' | 'onClear' | 'onVisibleChange' | 'onPanelChange'>>;

  constructor(config: DatePickerConfig) {
    // 初始化配置（带默认值）
    this.config = {
      type: config.type,
      format: config.format || this.getDefaultFormat(config.type),
      valueFormat: config.valueFormat || 'YYYY-MM-DD HH:mm:ss',
      placeholder: config.placeholder || '选择日期',
      startPlaceholder: config.startPlaceholder || '开始日期',
      endPlaceholder: config.endPlaceholder || '结束日期',
      rangeSeparator: config.rangeSeparator || '至',
      defaultValue: config.defaultValue || this.getDefaultValue(config.type),
      defaultTime: config.defaultTime || this.getDefaultTime(config.type),
      disabledDate: config.disabledDate || (() => false),
      disabledTime: config.disabledTime || (() => ({})),
      shortcuts: config.shortcuts || [],
      clearable: config.clearable ?? true,
      editable: config.editable ?? true,
      unlinkPanels: config.unlinkPanels ?? false,
      weekStartsOn: config.weekStartsOn ?? 1,
      use12Hours: config.use12Hours ?? false,
      showWeekNumber: config.showWeekNumber ?? false,
      locale: config.locale || ({} as Locale),
      enableCache: config.enableCache ?? true,
      enableTimeTravel: config.enableTimeTravel ?? false,
      maxHistory: config.maxHistory ?? 50,
    };

    // 初始化状态管理器
    this.stateManager = new StateManager<DatePickerState>({
      initialState: {
        value: this.config.defaultValue,
        tempValue: this.config.defaultValue,
        view: this.getDefaultView(config.type),
        currentDate: new Date(),
        visible: false,
        focused: false,
        rangeStart: null,
        hoverDate: null,
        panelIndex: 0,
        machineState: 'idle',
      },
      maxHistory: this.config.maxHistory,
      enableTimeTravel: this.config.enableTimeTravel,
      immutable: true,
      debug: process.env.NODE_ENV === 'development',
    });

    // 初始化中间件管理器
    this.middlewareManager = new MiddlewareManager<DatePickerState>();

    // 初始化插件管理器
    this.pluginManager = new PluginManager();
    this.pluginManager.setCore(this);

    // 初始化命令管理器
    this.commandManager = new CommandManager(this.config.maxHistory);

    // 订阅状态变更
    this.stateManager.subscribe((newState, oldState, action) => {
      this.handleStateChange(newState, oldState, action);
    });

    // 注册回调
    if (config.onChange) this.on('change', config.onChange);
    if (config.onInput) this.on('input', config.onInput);
    if (config.onBlur) this.on('blur', config.onBlur);
    if (config.onFocus) this.on('focus', config.onFocus);
    if (config.onClear) this.on('clear', config.onClear);
    if (config.onVisibleChange) this.on('visible-change', config.onVisibleChange);
    if (config.onPanelChange) this.on('panel-change', config.onPanelChange);
  }

  /**
   * 处理状态变更
   */
  private async handleStateChange(
    newState: DatePickerState,
    oldState: DatePickerState,
    action?: string
  ): Promise<void> {
    // 运行中间件
    const context: MiddlewareContext<DatePickerState> = {
      action: action || 'unknown',
      payload: newState,
      currentState: newState,
    };

    try {
      await this.middlewareManager.run(context);
    } catch (error) {
      console.error('[DatePickerCore] Middleware error:', error);
    }

    // 触发特定事件
    if (newState.value !== oldState.value) {
      this.emit('change', newState.value);
      this.emit('input', newState.value);
    }

    if (newState.visible !== oldState.visible) {
      this.emit('visible-change', newState.visible);
    }

    if (newState.view !== oldState.view || newState.currentDate !== oldState.currentDate) {
      this.emit('panel-change', newState.currentDate, newState.view);
    }

    if (newState.focused !== oldState.focused) {
      if (newState.focused) {
        this.emit('focus');
      } else {
        this.emit('blur');
      }
    }
  }

  /**
   * 事件订阅
   */
  on(event: string, handler: (...args: any[]) => void): () => void {
    return this.stateManager.on(event, handler);
  }

  /**
   * 使用中间件
   */
  use(middleware: (context: MiddlewareContext<DatePickerState>, next: () => void) => void, config?: any): () => void {
    return this.middlewareManager.use(middleware, config);
  }

  /**
   * 获取插件管理器
   */
  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  /**
   * 获取命令管理器
   */
  getCommandManager(): CommandManager {
    return this.commandManager;
  }

  /**
   * 获取状态（只读）
   */
  getState(): Readonly<DatePickerState> {
    return this.stateManager.getState();
  }

  /**
   * 获取配置（只读）
   */
  getConfig(): Readonly<typeof this.config> {
    return { ...this.config };
  }

  /**
   * 设置值
   */
  setValue(value: PickerValue): void {
    this.stateManager.setState(
      {
        value,
        tempValue: value,
      },
      'SET_VALUE'
    );
  }

  /**
   * 选择日期
   */
  selectDate(date: Date): void {
    const { type } = this.config;

    if (this.isDateDisabled(date)) {
      return;
    }

    if (type === 'date' || type === 'datetime') {
      this.setValue(date);
      if (type === 'date') {
        this.setVisible(false);
      }
    } else if (type === 'dates') {
      const currentState = this.getState();
      const currentDates = (currentState.value as DatesValue) || [];
      const index = currentDates.findIndex((d) => d.getTime() === date.getTime());

      if (index > -1) {
        currentDates.splice(index, 1);
      } else {
        currentDates.push(date);
      }

      this.setValue([...currentDates]);
    } else if (type === 'week') {
      this.setValue(date);
      this.setVisible(false);
    } else if (this.isRangeType(type)) {
      this.selectRangeDate(date);
    }
  }

  /**
   * 选择范围日期
   */
  private selectRangeDate(date: Date): void {
    const currentState = this.getState();

    if (!currentState.rangeStart) {
      this.stateManager.setState(
        {
          rangeStart: date,
          tempValue: [date, null],
          machineState: 'selecting',
        },
        'SELECT_RANGE_START'
      );
      this.emit('input', [date, null]);
    } else {
      const start = currentState.rangeStart;
      const end = date;

      const value: DateRangeValue = start <= end ? [start, end] : [end, start];
      this.stateManager.setState(
        {
          value,
          tempValue: value,
          rangeStart: null,
          machineState: 'idle',
        },
        'SELECT_RANGE_END'
      );
      this.setVisible(false);
    }
  }

  /**
   * 清除选择
   */
  clear(): void {
    this.setValue(this.getDefaultValue(this.config.type));
    this.emit('clear');
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean): void {
    const currentState = this.getState();

    if (currentState.visible !== visible) {
      const updates: Partial<DatePickerState> = { visible };

      if (visible) {
        // 面板打开时，重置当前日期
        const value = currentState.value;
        if (value) {
          if (Array.isArray(value)) {
            if (value.length > 0 && value[0]) {
              updates.currentDate = cloneDate(value[0]);
            }
          } else if (value instanceof Date) {
            updates.currentDate = cloneDate(value);
          }
        }
      } else {
        // 面板关闭时，重置临时状态
        updates.rangeStart = null;
        updates.hoverDate = null;
        updates.machineState = 'idle';
      }

      this.stateManager.setState(updates, visible ? 'OPEN_PANEL' : 'CLOSE_PANEL');
    }
  }

  /**
   * 切换视图
   */
  changeView(view: ViewType): void {
    this.stateManager.setState({ view }, 'CHANGE_VIEW');
  }

  /**
   * 导航到上一个周期
   */
  navigatePrev(): void {
    const { view, currentDate } = this.getState();
    let newDate: Date;

    if (view === 'date') {
      newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    } else if (view === 'month') {
      newDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
    } else if (view === 'year') {
      newDate = new Date(currentDate.getFullYear() - 10, currentDate.getMonth(), 1);
    } else {
      return;
    }

    this.stateManager.setState({ currentDate: newDate }, 'NAVIGATE_PREV');
  }

  /**
   * 导航到下一个周期
   */
  navigateNext(): void {
    const { view, currentDate } = this.getState();
    let newDate: Date;

    if (view === 'date') {
      newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    } else if (view === 'month') {
      newDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1);
    } else if (view === 'year') {
      newDate = new Date(currentDate.getFullYear() + 10, currentDate.getMonth(), 1);
    } else {
      return;
    }

    this.stateManager.setState({ currentDate: newDate }, 'NAVIGATE_NEXT');
  }

  /**
   * 设置悬停日期
   */
  setHoverDate(date: Date | null): void {
    this.stateManager.setState({ hoverDate: date }, 'SET_HOVER_DATE');
  }

  /**
   * 判断日期是否禁用
   */
  isDateDisabled(date: Date): boolean {
    return this.config.disabledDate(date);
  }

  /**
   * 判断是否是范围类型
   */
  private isRangeType(type: PickerType): boolean {
    return type.endsWith('range');
  }

  /**
   * 撤销
   */
  undo(): boolean {
    return this.stateManager.undo();
  }

  /**
   * 重做
   */
  redo(): boolean {
    return this.stateManager.redo();
  }

  /**
   * 获取历史记录
   */
  getHistory(): any[] {
    return this.stateManager.getHistory();
  }

  /**
   * 获取默认格式
   */
  private getDefaultFormat(type: PickerType): string {
    const formatMap: Record<PickerType, string> = {
      date: 'YYYY-MM-DD',
      dates: 'YYYY-MM-DD',
      week: 'YYYY-[W]ww',
      month: 'YYYY-MM',
      year: 'YYYY',
      quarter: 'YYYY-[Q]Q',
      datetime: 'YYYY-MM-DD HH:mm:ss',
      time: 'HH:mm:ss',
      daterange: 'YYYY-MM-DD',
      datetimerange: 'YYYY-MM-DD HH:mm:ss',
      monthrange: 'YYYY-MM',
      yearrange: 'YYYY',
    };
    return formatMap[type] || 'YYYY-MM-DD';
  }

  /**
   * 获取默认值
   */
  private getDefaultValue(type: PickerType): PickerValue {
    if (type === 'dates') {
      return [];
    } else if (this.isRangeType(type)) {
      return [null, null];
    }
    return null;
  }

  /**
   * 获取默认时间
   */
  private getDefaultTime(type: PickerType): Date | [Date, Date] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (this.isRangeType(type)) {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return [now, end];
    }

    return now;
  }

  /**
   * 获取默认视图
   */
  private getDefaultView(type: PickerType): ViewType {
    if (type === 'time') return 'time';
    if (type === 'month' || type === 'monthrange') return 'month';
    if (type === 'year' || type === 'yearrange') return 'year';
    return 'date';
  }

  /**
   * 触发事件
   */
  private emit(event: string, ...args: any[]): void {
    this.stateManager.on(event, () => { })();
    // 通过状态管理器的事件系统触发
    (this.stateManager as any).emitter?.emit(event, ...args);
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stateManager.destroy();
    this.middlewareManager.clear();
    this.pluginManager.clear();
    this.commandManager.clear();
  }
}

