/**
 * DOM 渲染器
 */
import type { DatePickerConfig, DateCell, TimeCell, DatePickerState } from '../types';
import { DatePickerCore } from './DatePickerCore';
import { isClickOutside } from '../utils/dom';
import { getDateCellClass } from '../panels/calendar';
import { getMonthCellClass } from '../panels/month';
import { getQuarterCellClass } from '../panels/quarter';
import { getYearCellClass } from '../panels/year';
import { getTimeCellClass } from '../panels/time';
import { getIconSvg } from '../utils/icons';
import { startOfWeek } from '../utils/date';

export interface DOMRendererOptions extends DatePickerConfig {
  trigger?: HTMLElement | string;
  input?: HTMLInputElement | string;
  useBuiltinInput?: boolean;
}

export class DOMDatePicker {
  private core: DatePickerCore;
  private options: DOMRendererOptions;
  private prefix: string;
  private triggerEl: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private popupEl: HTMLElement | null = null;
  private panelEl: HTMLElement | null = null;
  private cleanupFns: (() => void)[] = [];
  private initialized = false;

  constructor(options: DOMRendererOptions = {}) {
    this.options = options;
    this.prefix = options.classPrefix || 'ldp';
    this.core = new DatePickerCore(options);
    this.core.on('change', () => {
      this.updateInputValue();
      // 值改变后重新渲染面板以更新选中状态
      if (this.core.getState().panel.visible) {
        this.renderPanel();
      }
    });
    this.core.on('stateChange', ((newState: DatePickerState, oldState?: DatePickerState) => {
      // 只在 hoverDate 改变时重新渲染（范围选择预览）
      if (!oldState) return;

      const oldHover = oldState.hoverDate;
      const newHover = newState.hoverDate;

      // 比较日期值，而不是对象引用
      const hoverChanged =
        (oldHover === null && newHover !== null) ||
        (oldHover !== null && newHover === null) ||
        (oldHover !== null && newHover !== null && oldHover.getTime() !== newHover.getTime());

      // 只有 hoverDate 真正改变时才渲染
      if (hoverChanged && this.core.getState().panel.visible) {
        this.renderPanel();
      }
    }) as any);
    this.core.on('open', () => this.showPopup());
    this.core.on('close', () => this.hidePopup());
  }

  private init(): void {
    this.setupTrigger();
    this.createPopup();
    this.bindEvents();
  }

  private setupTrigger(): void {
    const { trigger, input, useBuiltinInput = true } = this.options;
    if (input) this.inputEl = typeof input === 'string' ? document.querySelector(input) : input;
    if (trigger) this.triggerEl = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
    if (useBuiltinInput && !this.triggerEl) this.triggerEl = this.createBuiltinInput();
    if (!this.triggerEl && this.inputEl) this.triggerEl = this.inputEl;
  }

  private createBuiltinInput(): HTMLElement {
    const { selectionType, placeholder } = this.core.getOptions();
    const locale = this.core.getOptions().locale || {};
    const wrapper = document.createElement('div');
    wrapper.className = this.prefix + '-input-wrapper';
    const input = document.createElement('input');
    input.className = this.prefix + '-input';
    input.type = 'text';
    input.placeholder = (typeof placeholder === 'string' ? placeholder : '') || '请选择日期';
    input.readOnly = true;
    wrapper.appendChild(input);
    this.inputEl = input;
    return wrapper;
  }

  private createPopup(): void {
    this.popupEl = document.createElement('div');
    this.popupEl.className = this.prefix + '-popup';
    this.popupEl.style.cssText = 'position:absolute;z-index:1000;display:none;opacity:0;transform:translateY(-4px);transition:opacity 0.2s,transform 0.2s;';
    this.panelEl = document.createElement('div');
    this.panelEl.className = this.prefix + '-panel';
    this.popupEl.appendChild(this.panelEl);
    document.body.appendChild(this.popupEl);
  }

  private bindEvents(): void {
    if (this.triggerEl) {
      const h = (e: Event) => { e.stopPropagation(); this.core.toggle(); };
      this.triggerEl.addEventListener('click', h);
      this.cleanupFns.push(() => this.triggerEl?.removeEventListener('click', h));
    }
    const docClick = (e: MouseEvent) => {
      if (this.core.getState().panel.visible && isClickOutside(e, this.triggerEl, this.popupEl)) this.core.close();
    };
    document.addEventListener('click', docClick);
    this.cleanupFns.push(() => document.removeEventListener('click', docClick));
  }

  private showPopup(): void {
    if (!this.initialized || !this.popupEl || !this.triggerEl) return;
    this.renderPanel();
    this.popupEl.style.display = 'block';
    this.popupEl.style.opacity = '0';
    void this.popupEl.offsetHeight;
    const rect = this.triggerEl.getBoundingClientRect();
    const h = this.popupEl.offsetHeight;
    const flip = window.innerHeight - rect.bottom < h + 10 && rect.top > window.innerHeight - rect.bottom;
    this.popupEl.style.top = flip ? (rect.top + window.scrollY - h - 4) + 'px' : (rect.bottom + window.scrollY + 4) + 'px';
    this.popupEl.style.left = (rect.left + window.scrollX) + 'px';
    requestAnimationFrame(() => { if (this.popupEl) { this.popupEl.style.opacity = '1'; this.popupEl.style.transform = 'translateY(0)'; } });
  }

  private hidePopup(): void {
    if (!this.popupEl) return;
    this.popupEl.style.opacity = '0';
    setTimeout(() => { if (this.popupEl && !this.core.getState().panel.visible) this.popupEl.style.display = 'none'; }, 200);
  }

  private renderPanel(): void {
    if (!this.panelEl) return;
    const opts = this.core.getOptions();
    const { type } = this.core.getState().panel;
    const panelCount = opts.panelCount || 1;

    this.panelEl.innerHTML = '';

    // 添加日期时间模式的类名
    if (opts.mode === 'datetime') {
      this.panelEl.classList.add(this.prefix + '-panel--datetime');
    } else {
      this.panelEl.classList.remove(this.prefix + '-panel--datetime');
    }

    const content = document.createElement('div');
    content.className = this.prefix + '-panel-content';

    // 日期时间模式：头部只在日期面板内
    if (opts.mode === 'datetime' && type === 'date') {
      // 左侧：日期面板（带头部）
      const datePanel = document.createElement('div');
      datePanel.className = this.prefix + '-panel-body';
      datePanel.appendChild(this.renderHeader());
      datePanel.appendChild(this.renderCalendar(0));
      content.appendChild(datePanel);

      // 右侧：时间面板
      const timePanel = document.createElement('div');
      timePanel.className = this.prefix + '-panel-body';
      timePanel.appendChild(this.renderTimePanel());
      content.appendChild(timePanel);
    } else {
      // 其他模式：头部在顶部
      this.panelEl.appendChild(this.renderHeader());

      // 渲染多个面板（范围选择时）
      for (let i = 0; i < panelCount; i++) {
        content.appendChild(this.renderPanelContent(i));
      }
    }

    this.panelEl.appendChild(content);
    if (type === 'time' || opts.showToday || opts.showConfirm) this.panelEl.appendChild(this.renderFooter());
  }

  private updateInputValue(): void {
    const txt = this.core.getDisplayText();
    if (this.inputEl) {
      if (Array.isArray(txt)) {
        // 范围选择：显示为 "start → end"
        this.inputEl.value = txt[1] ? `${txt[0]} → ${txt[1]}` : txt[0];
      } else {
        this.inputEl.value = txt;
      }
    }
  }

  private renderHeader(): HTMLElement {
    const { type, viewDate } = this.core.getState().panel;
    const hdr = document.createElement('div');
    hdr.className = this.prefix + '-panel-header';

    // 时间模式隐藏头部
    if (type === 'time') {
      hdr.style.display = 'none';
      return hdr;
    }

    const prevY = document.createElement('button'); prevY.type = 'button'; prevY.className = this.prefix + '-panel-header-btn'; prevY.innerHTML = getIconSvg('chevronsLeft', 16);
    prevY.onclick = e => { e.stopPropagation(); this.core.prevYear(); this.renderPanel(); };
    const prevM = document.createElement('button'); prevM.type = 'button'; prevM.className = this.prefix + '-panel-header-btn'; prevM.innerHTML = getIconSvg('chevronLeft', 16);
    prevM.onclick = e => { e.stopPropagation(); this.core.prev(); this.renderPanel(); };
    const title = document.createElement('span'); title.className = this.prefix + '-panel-header-title';
    const y = viewDate.getFullYear(), m = viewDate.getMonth() + 1;
    if (type === 'date' || type === 'week') { title.textContent = y + '年 ' + m + '月'; title.style.cursor = 'pointer'; title.onclick = e => { e.stopPropagation(); this.core.setPanelType('month'); this.renderPanel(); }; }
    else if (type === 'month' || type === 'quarter') { title.textContent = y + '年'; title.style.cursor = 'pointer'; title.onclick = e => { e.stopPropagation(); this.core.setPanelType('year'); this.renderPanel(); }; }
    else { title.textContent = this.core.getYearPanelData().decadeText; }
    const nextM = document.createElement('button'); nextM.type = 'button'; nextM.className = this.prefix + '-panel-header-btn'; nextM.innerHTML = getIconSvg('chevronRight', 16);
    nextM.onclick = e => { e.stopPropagation(); this.core.next(); this.renderPanel(); };
    const nextY = document.createElement('button'); nextY.type = 'button'; nextY.className = this.prefix + '-panel-header-btn'; nextY.innerHTML = getIconSvg('chevronsRight', 16);
    nextY.onclick = e => { e.stopPropagation(); this.core.nextYear(); this.renderPanel(); };
    hdr.appendChild(prevY);
    if (type === 'date' || type === 'week') hdr.appendChild(prevM);
    hdr.appendChild(title);
    if (type === 'date' || type === 'week') hdr.appendChild(nextM);
    hdr.appendChild(nextY);
    return hdr;
  }

  private renderPanelContent(idx: number): HTMLElement {
    const { type } = this.core.getState().panel;
    const opts = this.core.getOptions();
    const p = document.createElement('div'); p.className = this.prefix + '-panel-body';

    // 日期时间模式：左侧日期，右侧时间
    if (opts.mode === 'datetime' && type === 'date') {
      if (idx === 0) {
        p.appendChild(this.renderCalendar(idx));
      } else {
        p.appendChild(this.renderTimePanel());
      }
    } else if (type === 'date' || type === 'week') {
      p.appendChild(this.renderCalendar(idx));
    } else if (type === 'month') {
      p.appendChild(this.renderMonthPanel(idx));
    } else if (type === 'quarter') {
      p.appendChild(this.renderQuarterPanel(idx));
    } else if (type === 'time') {
      p.appendChild(this.renderTimePanel());
    } else {
      p.appendChild(this.renderYearPanel(idx));
    }
    return p;
  }

  private renderCalendar(idx: number): HTMLElement {
    const data = this.core.getCalendarPanelData(idx);
    const mode = this.core.getOptions().mode;
    const showWeekNumber = mode === 'week';
    const cal = document.createElement('div'); cal.className = this.prefix + '-calendar';

    const wkRow = document.createElement('div'); wkRow.className = this.prefix + '-calendar__weekdays';
    if (showWeekNumber) {
      const emptyCell = document.createElement('div');
      emptyCell.className = this.prefix + '-calendar__week-number';
      wkRow.appendChild(emptyCell);
    }
    for (const wd of data.weekdays) {
      const d = document.createElement('div');
      d.className = this.prefix + '-calendar__weekday';
      d.textContent = wd;
      wkRow.appendChild(d);
    }
    cal.appendChild(wkRow);

    for (const row of data.rows) {
      const r = document.createElement('div'); r.className = this.prefix + '-calendar__row';
      if (showWeekNumber && row.length > 0) {
        const weekNum = document.createElement('div');
        weekNum.className = this.prefix + '-calendar__week-number';
        weekNum.textContent = row[0].weekNumber?.toString() || '';
        r.appendChild(weekNum);
      }
      for (let i = 0; i < row.length; i++) {
        const cell = row[i];
        const isFirst = i === 0;
        const isLast = i === row.length - 1;
        r.appendChild(this.renderDateCell(cell, r, isFirst, isLast));
      }
      cal.appendChild(r);
    }
    return cal;
  }

  private renderDateCell(cell: DateCell, row?: HTMLElement, isFirst = false, isLast = false): HTMLElement {
    const mode = this.core.getOptions().mode;
    const el = document.createElement('div');
    el.className = getDateCellClass(cell, this.prefix);

    // 周选择模式下，给第一个和最后一个单元格添加特定class
    if (mode === 'week') {
      if (isFirst) el.classList.add(this.prefix + '-calendar__cell--week-start');
      if (isLast) el.classList.add(this.prefix + '-calendar__cell--week-end');
    }

    const inner = document.createElement('span');
    inner.className = this.prefix + '-calendar__cell-inner';
    inner.textContent = cell.text;
    el.appendChild(inner);
    el.style.cursor = cell.isDisabled ? 'not-allowed' : 'pointer';

    const self = this;
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      if (cell.isDisabled) return;
      if (mode === 'week') self.core.selectWeek(cell.date);
      else self.core.selectDate(cell.date);
    });

    if (!cell.isDisabled) {
      const opts = this.core.getOptions();

      if (mode === 'week' && row) {
        // 周选择模式
        if (opts.selectionType === 'range') {
          // 周范围选择：支持 hover 预览（使用周开始日期）
          el.addEventListener('mouseenter', () => {
            const weekStart = startOfWeek(cell.date, opts.weekStart);
            this.core.setHoverDate(weekStart);
          });
          el.addEventListener('mouseleave', () => {
            this.core.setHoverDate(null);
          });
        } else {
          // 周单选：鼠标悬停高亮整行
          el.addEventListener('mouseenter', () => {
            if (!cell.isWeekSelected) {
              row.classList.add(this.prefix + '-calendar__row--hover');
            }
          });
          el.addEventListener('mouseleave', () => {
            row.classList.remove(this.prefix + '-calendar__row--hover');
          });
        }
      } else {
        // 日期选择模式
        if (opts.selectionType === 'range') {
          // 范围选择模式：设置 hoverDate 以显示范围预览
          el.addEventListener('mouseenter', () => {
            this.core.setHoverDate(cell.date);
          });
          el.addEventListener('mouseleave', () => {
            this.core.setHoverDate(null);
          });
        } else {
          // 单选模式：只高亮当前单元格
          el.addEventListener('mouseenter', () => {
            if (!cell.isSelected) inner.style.backgroundColor = '#f3f3f3';
          });
          el.addEventListener('mouseleave', () => {
            if (!cell.isSelected) inner.style.backgroundColor = '';
          });
        }
      }
    }
    return el;
  }

  private renderMonthPanel(idx: number): HTMLElement {
    const data = this.core.getMonthPanelData(idx);
    const opts = this.core.getOptions();
    const p = document.createElement('div'); p.className = this.prefix + '-month-panel';
    for (const row of data.rows) {
      const r = document.createElement('div'); r.className = this.prefix + '-month-panel__row';
      for (const c of row) {
        const el = document.createElement('div'); el.className = getMonthCellClass(c, this.prefix);
        const inner = document.createElement('span'); inner.className = this.prefix + '-month-panel__cell-inner'; inner.textContent = c.text;
        el.appendChild(inner);
        if (!c.isDisabled) {
          el.style.cursor = 'pointer';
          el.onclick = e => { e.stopPropagation(); this.core.selectMonth(c.year, c.month); };

          // 范围选择模式添加 hover 预览
          if (opts.selectionType === 'range') {
            const date = new Date(c.year, c.month, 1);
            el.addEventListener('mouseenter', () => this.core.setHoverDate(date));
            el.addEventListener('mouseleave', () => this.core.setHoverDate(null));
          }
        }
        r.appendChild(el);
      }
      p.appendChild(r);
    }
    return p;
  }

  private renderQuarterPanel(idx: number): HTMLElement {
    const data = this.core.getQuarterPanelData(idx);
    const opts = this.core.getOptions();
    const p = document.createElement('div'); p.className = this.prefix + '-quarter-panel';
    const r = document.createElement('div'); r.className = this.prefix + '-quarter-panel__row';
    for (const c of data.quarters) {
      const el = document.createElement('div'); el.className = getQuarterCellClass(c, this.prefix);
      const inner = document.createElement('span'); inner.className = this.prefix + '-quarter-panel__cell-inner'; inner.textContent = c.text;
      el.appendChild(inner);
      if (!c.isDisabled) {
        el.style.cursor = 'pointer';
        el.onclick = e => { e.stopPropagation(); this.core.selectQuarter(c.year, c.quarter); };

        // 范围选择模式添加 hover 预览
        if (opts.selectionType === 'range') {
          const month = (c.quarter - 1) * 3;
          const date = new Date(c.year, month, 1);
          el.addEventListener('mouseenter', () => this.core.setHoverDate(date));
          el.addEventListener('mouseleave', () => this.core.setHoverDate(null));
        }
      }
      r.appendChild(el);
    }
    p.appendChild(r);
    return p;
  }

  private renderYearPanel(idx: number): HTMLElement {
    const data = this.core.getYearPanelData(idx);
    const opts = this.core.getOptions();
    const p = document.createElement('div'); p.className = this.prefix + '-year-panel';
    for (const row of data.rows) {
      const r = document.createElement('div'); r.className = this.prefix + '-year-panel__row';
      for (const c of row) {
        const el = document.createElement('div'); el.className = getYearCellClass(c, this.prefix);
        const inner = document.createElement('span'); inner.className = this.prefix + '-year-panel__cell-inner'; inner.textContent = c.text;
        el.appendChild(inner);
        if (!c.isDisabled) {
          el.style.cursor = 'pointer';
          el.onclick = e => { e.stopPropagation(); this.core.selectYear(c.year); };

          // 范围选择模式添加 hover 预览
          if (opts.selectionType === 'range') {
            const date = new Date(c.year, 0, 1);
            el.addEventListener('mouseenter', () => this.core.setHoverDate(date));
            el.addEventListener('mouseleave', () => this.core.setHoverDate(null));
          }
        }
        r.appendChild(el);
      }
      p.appendChild(r);
    }
    return p;
  }

  private renderTimePanel(): HTMLElement {
    const data = this.core.getTimePanelData();
    const opts = this.core.getOptions();
    const showSeparator = opts.showTimeSeparator ?? false;
    const p = document.createElement('div');
    p.className = this.prefix + '-time-panel';

    const columns = document.createElement('div');
    columns.className = this.prefix + '-time-panel__columns';

    const indicator = document.createElement('div');
    indicator.className = this.prefix + '-time-panel__indicator';
    columns.appendChild(indicator);

    const hourCol = this.renderTimeWheel(data.hours, v => this.core.selectTime({ hour: v }));
    columns.appendChild(hourCol);

    if (showSeparator) {
      const sep1 = document.createElement('div');
      sep1.className = this.prefix + '-time-panel__separator ' + this.prefix + '-time-panel__separator--visible';
      sep1.textContent = ':';
      columns.appendChild(sep1);
    }

    const minCol = this.renderTimeWheel(data.minutes, v => this.core.selectTime({ minute: v }));
    columns.appendChild(minCol);

    if (data.showSeconds) {
      if (showSeparator) {
        const sep2 = document.createElement('div');
        sep2.className = this.prefix + '-time-panel__separator ' + this.prefix + '-time-panel__separator--visible';
        sep2.textContent = ':';
        columns.appendChild(sep2);
      }

      const secCol = this.renderTimeWheel(data.seconds, v => this.core.selectTime({ second: v }));
      columns.appendChild(secCol);
    }

    p.appendChild(columns);
    return p;
  }

  private renderTimeWheel(cells: TimeCell[], onSelect: (v: number) => void): HTMLElement {
    const ITEM_HEIGHT = 36;
    const VISIBLE_ITEMS = 7;
    const CENTER_INDEX = 3;

    const col = document.createElement('div');
    col.className = this.prefix + '-time-panel__wheel';
    col.style.height = ITEM_HEIGHT * VISIBLE_ITEMS + 'px';

    const wrapper = document.createElement('div');
    wrapper.className = this.prefix + '-time-panel__wheel-wrapper';

    let selectedIndex = cells.findIndex(c => c.isSelected);
    if (selectedIndex === -1) selectedIndex = 0;

    let currentOffset = -selectedIndex * ITEM_HEIGHT + CENTER_INDEX * ITEM_HEIGHT;
    wrapper.style.transform = `translateY(${currentOffset}px)`;

    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      const el = document.createElement('div');
      el.className = this.prefix + '-time-panel__wheel-item';
      el.style.height = ITEM_HEIGHT + 'px';
      el.style.lineHeight = ITEM_HEIGHT + 'px';
      el.textContent = c.text;
      if (c.isDisabled) el.classList.add(this.prefix + '-time-panel__wheel-item--disabled');
      wrapper.appendChild(el);
    }

    col.appendChild(wrapper);

    const scrollToIndex = (index: number, animate = false) => {
      currentOffset = -index * ITEM_HEIGHT + CENTER_INDEX * ITEM_HEIGHT;
      if (!animate) {
        wrapper.style.transition = 'none';
      }
      wrapper.style.transform = `translateY(${currentOffset}px)`;
      updateItemStyles(index);
      if (!animate) {
        setTimeout(() => wrapper.style.transition = '', 0);
      }
    };

    const updateItemStyles = (centerIndex: number) => {
      for (let i = 0; i < wrapper.children.length; i++) {
        const item = wrapper.children[i] as HTMLElement;
        const distance = Math.abs(i - centerIndex);
        item.classList.remove(this.prefix + '-time-panel__wheel-item--selected', this.prefix + '-time-panel__wheel-item--near', this.prefix + '-time-panel__wheel-item--far');
        if (distance === 0) item.classList.add(this.prefix + '-time-panel__wheel-item--selected');
        else if (distance === 1) item.classList.add(this.prefix + '-time-panel__wheel-item--near');
        else item.classList.add(this.prefix + '-time-panel__wheel-item--far');
      }
    };

    updateItemStyles(selectedIndex);

    for (let i = 0; i < wrapper.children.length; i++) {
      const el = wrapper.children[i] as HTMLElement;
      const idx = i;
      el.onclick = (e) => {
        e.stopPropagation();
        if (cells[idx].isDisabled) return;
        scrollToIndex(idx, true);
        onSelect(cells[idx].value);
      };
    }

    col.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      let newIndex = Math.round((-currentOffset + CENTER_INDEX * ITEM_HEIGHT) / ITEM_HEIGHT) + delta;
      newIndex = Math.max(0, Math.min(cells.length - 1, newIndex));
      while (newIndex >= 0 && newIndex < cells.length && cells[newIndex].isDisabled) newIndex += delta;
      if (newIndex >= 0 && newIndex < cells.length && !cells[newIndex].isDisabled) {
        scrollToIndex(newIndex, true);
        onSelect(cells[newIndex].value);
      }
    }, { passive: false });

    let startY = 0, startOffset = 0, isDragging = false, lastY = 0, velocity = 0, lastTime = 0;

    const onStart = (e: TouchEvent | MouseEvent) => {
      isDragging = true;
      startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      startOffset = currentOffset;
      lastY = startY;
      lastTime = Date.now();
      velocity = 0;
      wrapper.classList.add(this.prefix + '-time-panel__wheel-wrapper--dragging');
      wrapper.style.transition = 'none';
    };

    const onMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = y - startY;
      const now = Date.now();
      if (now - lastTime > 0) velocity = (y - lastY) / (now - lastTime);
      lastY = y;
      lastTime = now;
      currentOffset = startOffset + deltaY;
      wrapper.style.transform = `translateY(${currentOffset}px)`;
      updateItemStyles(Math.max(0, Math.min(cells.length - 1, Math.round((-currentOffset + CENTER_INDEX * ITEM_HEIGHT) / ITEM_HEIGHT))));
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      wrapper.classList.remove(this.prefix + '-time-panel__wheel-wrapper--dragging');
      let targetIndex = Math.round((-currentOffset - velocity * 150 + CENTER_INDEX * ITEM_HEIGHT) / ITEM_HEIGHT);
      targetIndex = Math.max(0, Math.min(cells.length - 1, targetIndex));
      while (targetIndex < cells.length && cells[targetIndex].isDisabled) targetIndex++;
      if (targetIndex >= cells.length || cells[targetIndex].isDisabled) {
        targetIndex = Math.round((-currentOffset + CENTER_INDEX * ITEM_HEIGHT) / ITEM_HEIGHT);
        while (targetIndex >= 0 && cells[targetIndex].isDisabled) targetIndex--;
      }
      if (targetIndex >= 0 && targetIndex < cells.length && !cells[targetIndex].isDisabled) {
        scrollToIndex(targetIndex, true);
        onSelect(cells[targetIndex].value);
      }
    };

    col.addEventListener('touchstart', onStart as EventListener, { passive: true });
    col.addEventListener('touchmove', onMove as EventListener, { passive: false });
    col.addEventListener('touchend', onEnd);
    col.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onStart(e);
      const move = (e: MouseEvent) => onMove(e);
      const up = () => { onEnd(); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });

    return col;
  }

  private renderFooter(): HTMLElement {
    const opts = this.core.getOptions();
    const { type } = this.core.getState().panel;
    const locale = opts.locale || {};
    const f = document.createElement('div'); f.className = this.prefix + '-panel-footer';
    if (opts.showToday) {
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = this.prefix + '-panel-footer-btn ' + this.prefix + '-panel-footer-btn--link';
      btn.textContent = locale.today || '今天';
      btn.onclick = e => { e.stopPropagation(); this.core.goToday(); };
      f.appendChild(btn);
    }
    // 时间模式总是显示确定按钮
    if (opts.showConfirm || type === 'time') {
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = this.prefix + '-panel-footer-btn ' + this.prefix + '-panel-footer-btn--primary';
      btn.textContent = locale.confirm || '确定';
      btn.onclick = e => { e.stopPropagation(); this.core.confirm(); };
      f.appendChild(btn);
    }
    return f;
  }

  getCore(): DatePickerCore { return this.core; }
  getValue() { return this.core.getValue(); }
  setValue(value: Date | Date[] | { start: Date | null; end: Date | null } | null) { this.core.setValue(value); }
  open() { this.core.open(); }
  close() { this.core.close(); }
  clear() { this.core.clear(); }
  getTriggerElement(): HTMLElement | null { return this.triggerEl; }

  mount(target: HTMLElement | string): void {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) { console.warn('[DOMDatePicker] Mount target not found:', target); return; }
    if (!this.initialized) { this.init(); this.initialized = true; }
    if (this.triggerEl) el.appendChild(this.triggerEl);
  }

  destroy(): void {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    this.popupEl?.remove();
    this.core.destroy();
  }
}

export function createDatePicker(options: DOMRendererOptions = {}): DOMDatePicker {
  return new DOMDatePicker(options);
}
