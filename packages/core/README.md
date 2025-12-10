# @ldesign/datepicker-core

日期选择器核心库，提供与框架无关的日期选择器逻辑。

## 特性

- 🎯 **多种模式** - 支持日期、周、月、季度、年份选择
- 📅 **范围选择** - 支持日期范围、周范围、月份范围等
- 🔢 **多选模式** - 支持多个日期同时选择
- ⏰ **时间选择** - 内置时间面板，支持时分秒选择
- 🎨 **TDesign风格** - 内置精美的样式
- 🌐 **国际化** - 支持多语言配置
- 📦 **框架无关** - 可在任意JavaScript环境中使用

## 安装

```bash
pnpm add @ldesign/datepicker-core
```

## 基本使用

### 原生 JavaScript

```javascript
import { createDatePicker } from '@ldesign/datepicker-core';
import '@ldesign/datepicker-core/styles';

const picker = createDatePicker({
  mode: 'date',
  onChange: (value, formatted) => {
    console.log('选中日期:', value, formatted);
  },
});

// 挂载到页面
picker.mount('#app');
```

### 使用核心类

```javascript
import { DatePickerCore } from '@ldesign/datepicker-core';

const core = new DatePickerCore({
  mode: 'date',
  selectionType: 'single',
  weekStart: 1,
  showToday: true,
});

// 监听变化
core.on('change', (value, formatted) => {
  console.log('选中:', value);
});

// 获取面板数据自行渲染
const calendarData = core.getCalendarPanelData();
console.log(calendarData);
```

## 选择模式

```javascript
// 日期选择
createDatePicker({ mode: 'date' });

// 周选择
createDatePicker({ mode: 'week' });

// 月份选择
createDatePicker({ mode: 'month' });

// 季度选择
createDatePicker({ mode: 'quarter' });

// 年份选择
createDatePicker({ mode: 'year' });

// 日期时间选择
createDatePicker({ mode: 'datetime' });
```

## 选择类型

```javascript
// 单选
createDatePicker({ selectionType: 'single' });

// 范围选择
createDatePicker({ selectionType: 'range', panelCount: 2 });

// 多选
createDatePicker({ selectionType: 'multiple' });
```

## 配置项

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| mode | 选择器模式 | `'date' \| 'week' \| 'month' \| 'quarter' \| 'year' \| 'datetime'` | `'date'` |
| selectionType | 选择类型 | `'single' \| 'range' \| 'multiple'` | `'single'` |
| weekStart | 星期首日 | `0-6` | `1` |
| format | 日期格式 | `string` | 根据mode自动推断 |
| disabledDate | 禁用日期函数 | `(date: Date) => boolean` | - |
| minDate | 最小日期 | `Date` | - |
| maxDate | 最大日期 | `Date` | - |
| showWeekNumber | 是否显示周数 | `boolean` | `false` |
| showToday | 是否显示今天按钮 | `boolean` | `true` |
| showConfirm | 是否显示确认按钮 | `boolean` | `false` |
| showTime | 是否显示时间选择 | `boolean` | `false` |
| locale | 国际化配置 | `DatePickerLocale` | 中文 |
| allowClear | 是否允许清空 | `boolean` | `true` |
| placeholder | 占位文本 | `string \| [string, string]` | - |

## 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| onChange | 值变化时触发 | `(value, formatted) => void` |
| onPanelChange | 面板变化时触发 | `(panel, date) => void` |
| onOpen | 面板打开时触发 | `() => void` |
| onClose | 面板关闭时触发 | `() => void` |
| onConfirm | 确认时触发 | `(value) => void` |
| onClear | 清除时触发 | `() => void` |

## 工具函数

```javascript
import {
  formatDate,
  parseFormatted,
  isSameDay,
  isBefore,
  isAfter,
  addDays,
  addMonths,
  getWeekInfo,
  // ... 更多
} from '@ldesign/datepicker-core';
```

## License

MIT
