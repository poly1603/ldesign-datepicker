/**
 * 自定义单元格渲染器
 */

import type { DateCell, MonthCell, YearCell, TimeCell } from '@ldesign/datepicker-shared';

/**
 * 渲染结果
 */
export interface RenderResult {
  /** HTML 内容 */
  html?: string;

  /** 文本内容 */
  text?: string;

  /** 自定义类名 */
  className?: string | string[];

  /** 自定义样式 */
  style?: Record<string, string>;

  /** 自定义属性 */
  attributes?: Record<string, string>;

  /** 是否禁用默认样式 */
  disableDefaultStyles?: boolean;
}

/**
 * 渲染上下文
 */
export interface RenderContext {
  /** 当前日期 */
  currentDate: Date;

  /** 选中的值 */
  value: any;

  /** 是否为范围选择 */
  isRange: boolean;

  /** 附加数据 */
  metadata?: Record<string, any>;
}

/**
 * 单元格渲染器接口
 */
export interface CellRenderer {
  /**
   * 渲染日期单元格
   */
  renderDate?(cell: DateCell, context: RenderContext): RenderResult;

  /**
   * 渲染月份单元格
   */
  renderMonth?(cell: MonthCell, context: RenderContext): RenderResult;

  /**
   * 渲染年份单元格
   */
  renderYear?(cell: YearCell, context: RenderContext): RenderResult;

  /**
   * 渲染时间单元格
   */
  renderTime?(cell: TimeCell, context: RenderContext): RenderResult;

  /**
   * 渲染单元格容器
   */
  renderCellContainer?(content: RenderResult, cell: any, context: RenderContext): RenderResult;
}

/**
 * 默认渲染器
 */
export class DefaultCellRenderer implements CellRenderer {
  renderDate(cell: DateCell, context: RenderContext): RenderResult {
    return {
      text: String(cell.text),
      className: this.getDateCellClassName(cell),
    };
  }

  renderMonth(cell: MonthCell, context: RenderContext): RenderResult {
    return {
      text: cell.text,
      className: this.getMonthCellClassName(cell),
    };
  }

  renderYear(cell: YearCell, context: RenderContext): RenderResult {
    return {
      text: String(cell.text),
      className: this.getYearCellClassName(cell),
    };
  }

  renderTime(cell: TimeCell, context: RenderContext): RenderResult {
    return {
      text: cell.text,
      className: this.getTimeCellClassName(cell),
    };
  }

  private getDateCellClassName(cell: DateCell): string[] {
    const classes: string[] = ['ldate-cell'];

    if (cell.type !== 'normal') {
      classes.push(`ldate-cell--${cell.type}`);
    }

    if (cell.disabled) classes.push('ldate-cell--disabled');
    if (cell.selected) classes.push('ldate-cell--selected');
    if (cell.inRange) classes.push('ldate-cell--in-range');
    if (cell.rangeStart) classes.push('ldate-cell--range-start');
    if (cell.rangeEnd) classes.push('ldate-cell--range-end');

    if (cell.customClass) {
      classes.push(cell.customClass);
    }

    return classes;
  }

  private getMonthCellClassName(cell: MonthCell): string[] {
    const classes: string[] = ['ldate-month-cell'];

    if (cell.disabled) classes.push('ldate-month-cell--disabled');
    if (cell.selected) classes.push('ldate-month-cell--selected');
    if (cell.inRange) classes.push('ldate-month-cell--in-range');
    if (cell.rangeStart) classes.push('ldate-month-cell--range-start');
    if (cell.rangeEnd) classes.push('ldate-month-cell--range-end');

    if (cell.customClass) {
      classes.push(cell.customClass);
    }

    return classes;
  }

  private getYearCellClassName(cell: YearCell): string[] {
    const classes: string[] = ['ldate-year-cell'];

    if (cell.disabled) classes.push('ldate-year-cell--disabled');
    if (cell.selected) classes.push('ldate-year-cell--selected');
    if (cell.inRange) classes.push('ldate-year-cell--in-range');
    if (cell.rangeStart) classes.push('ldate-year-cell--range-start');
    if (cell.rangeEnd) classes.push('ldate-year-cell--range-end');

    if (cell.customClass) {
      classes.push(cell.customClass);
    }

    return classes;
  }

  private getTimeCellClassName(cell: TimeCell): string[] {
    const classes: string[] = ['ldate-time-cell'];

    if (cell.disabled) classes.push('ldate-time-cell--disabled');
    if (cell.selected) classes.push('ldate-time-cell--selected');

    return classes;
  }
}

/**
 * 渲染器管理器
 */
export class RendererManager {
  private renderers: Map<string, CellRenderer> = new Map();
  private defaultRenderer: CellRenderer = new DefaultCellRenderer();
  private activeRenderer: string | null = null;

  /**
   * 注册渲染器
   */
  register(name: string, renderer: CellRenderer): void {
    this.renderers.set(name, renderer);
  }

  /**
   * 取消注册渲染器
   */
  unregister(name: string): void {
    this.renderers.delete(name);
    if (this.activeRenderer === name) {
      this.activeRenderer = null;
    }
  }

  /**
   * 使用渲染器
   */
  use(name: string): void {
    if (!this.renderers.has(name)) {
      throw new Error(`Renderer "${name}" is not registered`);
    }
    this.activeRenderer = name;
  }

  /**
   * 使用默认渲染器
   */
  useDefault(): void {
    this.activeRenderer = null;
  }

  /**
   * 获取当前渲染器
   */
  getCurrentRenderer(): CellRenderer {
    if (this.activeRenderer) {
      const renderer = this.renderers.get(this.activeRenderer);
      if (renderer) {
        return renderer;
      }
    }
    return this.defaultRenderer;
  }

  /**
   * 渲染日期单元格
   */
  renderDate(cell: DateCell, context: RenderContext): RenderResult {
    const renderer = this.getCurrentRenderer();
    if (renderer.renderDate) {
      return renderer.renderDate(cell, context);
    }
    return this.defaultRenderer.renderDate!(cell, context);
  }

  /**
   * 渲染月份单元格
   */
  renderMonth(cell: MonthCell, context: RenderContext): RenderResult {
    const renderer = this.getCurrentRenderer();
    if (renderer.renderMonth) {
      return renderer.renderMonth(cell, context);
    }
    return this.defaultRenderer.renderMonth!(cell, context);
  }

  /**
   * 渲染年份单元格
   */
  renderYear(cell: YearCell, context: RenderContext): RenderResult {
    const renderer = this.getCurrentRenderer();
    if (renderer.renderYear) {
      return renderer.renderYear(cell, context);
    }
    return this.defaultRenderer.renderYear!(cell, context);
  }

  /**
   * 渲染时间单元格
   */
  renderTime(cell: TimeCell, context: RenderContext): RenderResult {
    const renderer = this.getCurrentRenderer();
    if (renderer.renderTime) {
      return renderer.renderTime(cell, context);
    }
    return this.defaultRenderer.renderTime!(cell, context);
  }

  /**
   * 获取所有注册的渲染器
   */
  getRenderers(): string[] {
    return Array.from(this.renderers.keys());
  }

  /**
   * 清空所有渲染器
   */
  clear(): void {
    this.renderers.clear();
    this.activeRenderer = null;
  }
}

/**
 * 创建自定义渲染器的辅助函数
 */
export function createCellRenderer(config: Partial<CellRenderer>): CellRenderer {
  return {
    renderDate: config.renderDate,
    renderMonth: config.renderMonth,
    renderYear: config.renderYear,
    renderTime: config.renderTime,
    renderCellContainer: config.renderCellContainer,
  };
}

