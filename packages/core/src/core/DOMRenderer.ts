/**
 * DOM 渲染器
 */
import type { DatePickerConfig, DateCell, TimeCell } from '../types';
import { DatePickerCore } from './DatePickerCore';
import { isClickOutside } from '../utils/dom';
import { getDateCellClass } from '../panels/calendar';
import { getMonthCellClass } from '../panels/month';
import { getQuarterCellClass } from '../panels/quarter';
import { getYearCellClass } from '../panels/year';
import { getTimeCellClass } from '../panels/time';

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
    // 只在 change 事件时更新输入框，不在 stateChange 时重新渲染
    this.core.on('change', () => this.updateInputValue());
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
    this.panelEl.innerHTML = '';
    this.panelEl.appendChild(this.renderHeader());
    const content = document.createElement('div');
    content.className = this.prefix + '-panel-content';
    content.appendChild(this.renderPanelContent(0));
    this.panelEl.appendChild(content);
    if (opts.showToday || opts.showConfirm) this.panelEl.appendChild(this.renderFooter());
  }

  private updateInputValue(): void {
    const txt = this.core.getDisplayText();
    if (this.inputEl) this.inputEl.value = Array.isArray(txt) ? txt[0] : txt;
  }

  private renderHeader(): HTMLElement {
    const { type, viewDate } = this.core.getState().panel;
    const hdr = document.createElement('div');
    hdr.className = this.prefix + '-panel-header';
    const prevY = document.createElement('button'); prevY.type = 'button'; prevY.className = this.prefix + '-panel-header-btn'; prevY.innerHTML = '';
    prevY.onclick = e => { e.stopPropagation(); this.core.prevYear(); };
    const prevM = document.createElement('button'); prevM.type = 'button'; prevM.className = this.prefix + '-panel-header-btn'; prevM.innerHTML = '';
    prevM.onclick = e => { e.stopPropagation(); this.core.prev(); };
    const title = document.createElement('span'); title.className = this.prefix + '-panel-header-title';
    const y = viewDate.getFullYear(), m = viewDate.getMonth() + 1;
    if (type === 'date' || type === 'week') { title.textContent = y + '年 ' + m + '月'; title.style.cursor = 'pointer'; title.onclick = e => { e.stopPropagation(); this.core.setPanelType('month'); }; }
    else if (type === 'month' || type === 'quarter') { title.textContent = y + '年'; title.style.cursor = 'pointer'; title.onclick = e => { e.stopPropagation(); this.core.setPanelType('year'); }; }
    else { title.textContent = this.core.getYearPanelData().decadeText; }
    const nextM = document.createElement('button'); nextM.type = 'button'; nextM.className = this.prefix + '-panel-header-btn'; nextM.innerHTML = '';
    nextM.onclick = e => { e.stopPropagation(); this.core.next(); };
    const nextY = document.createElement('button'); nextY.type = 'button'; nextY.className = this.prefix + '-panel-header-btn'; nextY.innerHTML = '';
    nextY.onclick = e => { e.stopPropagation(); this.core.nextYear(); };
    hdr.appendChild(prevY);
    if (type === 'date' || type === 'week') hdr.appendChild(prevM);
    hdr.appendChild(title);
    if (type === 'date' || type === 'week') hdr.appendChild(nextM);
    hdr.appendChild(nextY);
    return hdr;
  }

  private renderPanelContent(idx: number): HTMLElement {
    const { type } = this.core.getState().panel;
    const p = document.createElement('div'); p.className = this.prefix + '-panel-body';
    if (type === 'date' || type === 'week') p.appendChild(this.renderCalendar(idx));
    else if (type === 'month') p.appendChild(this.renderMonthPanel(idx));
    else if (type === 'quarter') p.appendChild(this.renderQuarterPanel(idx));
    else p.appendChild(this.renderYearPanel(idx));
    return p;
  }

  private renderCalendar(idx: number): HTMLElement {
    const data = this.core.getCalendarPanelData(idx);
    const cal = document.createElement('div'); cal.className = this.prefix + '-calendar';
    const wkRow = document.createElement('div'); wkRow.className = this.prefix + '-calendar__weekdays';
    for (const wd of data.weekdays) { const d = document.createElement('div'); d.className = this.prefix + '-calendar__weekday'; d.textContent = wd; wkRow.appendChild(d); }
    cal.appendChild(wkRow);
    for (const row of data.rows) {
      const r = document.createElement('div'); r.className = this.prefix + '-calendar__row';
      for (const cell of row) r.appendChild(this.renderDateCell(cell));
      cal.appendChild(r);
    }
    return cal;
  }

  private renderDateCell(cell: DateCell): HTMLElement {
    const mode = this.core.getOptions().mode;
    const el = document.createElement('div');
    el.className = getDateCellClass(cell, this.prefix);
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
      el.addEventListener('mouseenter', () => {
        if (!cell.isSelected) inner.style.backgroundColor = '#f3f3f3';
      });
      el.addEventListener('mouseleave', () => {
        if (!cell.isSelected) inner.style.backgroundColor = '';
      });
    }
    return el;
  }

  private renderMonthPanel(idx: number): HTMLElement {
    const data = this.core.getMonthPanelData(idx);
    const p = document.createElement('div'); p.className = this.prefix + '-month-panel';
    for (const row of data.rows) {
      const r = document.createElement('div'); r.className = this.prefix + '-month-panel__row';
      for (const c of row) {
        const el = document.createElement('div'); el.className = getMonthCellClass(c, this.prefix);
        const inner = document.createElement('span'); inner.className = this.prefix + '-month-panel__cell-inner'; inner.textContent = c.text;
        el.appendChild(inner);
        if (!c.isDisabled) { el.style.cursor = 'pointer'; el.onclick = e => { e.stopPropagation(); this.core.selectMonth(c.year, c.month); }; }
        r.appendChild(el);
      }
      p.appendChild(r);
    }
    return p;
  }

  private renderQuarterPanel(idx: number): HTMLElement {
    const data = this.core.getQuarterPanelData(idx);
    const p = document.createElement('div'); p.className = this.prefix + '-quarter-panel';
    const r = document.createElement('div'); r.className = this.prefix + '-quarter-panel__row';
    for (const c of data.quarters) {
      const el = document.createElement('div'); el.className = getQuarterCellClass(c, this.prefix);
      const inner = document.createElement('span'); inner.className = this.prefix + '-quarter-panel__cell-inner'; inner.textContent = c.text;
      el.appendChild(inner);
      if (!c.isDisabled) { el.style.cursor = 'pointer'; el.onclick = e => { e.stopPropagation(); this.core.selectQuarter(c.year, c.quarter); }; }
      r.appendChild(el);
    }
    p.appendChild(r);
    return p;
  }

  private renderYearPanel(idx: number): HTMLElement {
    const data = this.core.getYearPanelData(idx);
    const p = document.createElement('div'); p.className = this.prefix + '-year-panel';
    for (const row of data.rows) {
      const r = document.createElement('div'); r.className = this.prefix + '-year-panel__row';
      for (const c of row) {
        const el = document.createElement('div'); el.className = getYearCellClass(c, this.prefix);
        const inner = document.createElement('span'); inner.className = this.prefix + '-year-panel__cell-inner'; inner.textContent = c.text;
        el.appendChild(inner);
        if (!c.isDisabled) { el.style.cursor = 'pointer'; el.onclick = e => { e.stopPropagation(); this.core.selectYear(c.year); }; }
        r.appendChild(el);
      }
      p.appendChild(r);
    }
    return p;
  }

  private renderTimePanel(): HTMLElement {
    const data = this.core.getTimePanelData();
    const p = document.createElement('div'); p.className = this.prefix + '-time-panel';
    p.appendChild(this.renderTimeColumn(data.hours, v => this.core.selectTime({ hour: v })));
    p.appendChild(this.renderTimeColumn(data.minutes, v => this.core.selectTime({ minute: v })));
    if (data.showSeconds) p.appendChild(this.renderTimeColumn(data.seconds, v => this.core.selectTime({ second: v })));
    return p;
  }

  private renderTimeColumn(cells: TimeCell[], onSelect: (v: number) => void): HTMLElement {
    const col = document.createElement('div'); col.className = this.prefix + '-time-panel__column';
    const list = document.createElement('div'); list.className = this.prefix + '-time-panel__list';
    for (const c of cells) {
      const el = document.createElement('div'); el.className = getTimeCellClass(c, this.prefix); el.textContent = c.text;
      if (!c.isDisabled) { el.style.cursor = 'pointer'; el.onclick = e => { e.stopPropagation(); onSelect(c.value); }; }
      list.appendChild(el);
    }
    col.appendChild(list);
    return col;
  }

  private renderFooter(): HTMLElement {
    const opts = this.core.getOptions();
    const locale = opts.locale || {};
    const f = document.createElement('div'); f.className = this.prefix + '-panel-footer';
    if (opts.showToday) {
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = this.prefix + '-panel-footer-btn ' + this.prefix + '-panel-footer-btn--link';
      btn.textContent = locale.today || '今天';
      btn.onclick = e => { e.stopPropagation(); this.core.goToday(); };
      f.appendChild(btn);
    }
    if (opts.showConfirm) {
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
