# 介绍

## 什么是 LDesign DatePicker？

LDesign DatePicker 是一个功能丰富、性能优秀、框架无关的日期时间选择器组件库。

它采用独特的架构设计，将核心逻辑与框架适配层分离，使得同一套代码可以在 Vue、React、Lit 等多个框架中使用，同时保持一致的 API 和用户体验。

## 特性

### 🎯 框架无关

核心逻辑完全独立，不依赖任何框架。提供了 Vue 3、React 和 Lit/Web Components 的官方适配层。

### 📦 多种选择模式

支持 12+ 种选择模式：

- `date` - 单个日期
- `dates` - 多个日期
- `week` - 星期选择
- `month` - 月份选择
- `year` - 年份选择
- `quarter` - 季度选择
- `datetime` - 日期时间
- `time` - 时间选择
- `daterange` - 日期范围
- `datetimerange` - 日期时间范围
- `monthrange` - 月份范围
- `yearrange` - 年份范围

### 🎨 主题定制

基于 CSS Variables 的主题系统，轻松定制外观：

```css
:root {
  --ldate-primary-color: #409eff;
  --ldate-border-radius: 4px;
  --ldate-cell-size: 36px;
}
```

支持亮色/暗色主题切换：

```css
[data-theme="dark"] {
  --ldate-bg-color: #1a1a1a;
  --ldate-text-color: #e0e0e0;
}
```

### 🌍 国际化

内置 20+ 语言包，支持自定义语言配置：

```ts
import { zhCN, enUS } from '@ldesign/datepicker-shared';

// 使用中文
<DatePicker locale={zhCN} />

// 使用英文
<DatePicker locale={enUS} />
```

### ♿ 可访问性

- 完整的 ARIA 标签
- 键盘导航支持
- 屏幕阅读器友好
- 符合 WCAG 2.1 AA 标准

### 🚀 高性能

- 虚拟滚动（大数据量场景）
- 懒加载面板
- Tree-shaking 友好
- 打包后仅 30KB (gzipped)

### 💪 TypeScript

完整的类型定义，提供出色的开发体验：

```ts
import type { PickerType, PickerValue } from '@ldesign/datepicker-shared';

const value: PickerValue = new Date();
const type: PickerType = 'daterange';
```

## 架构设计

LDesign DatePicker 采用分层架构：

```
┌─────────────────────────────────────┐
│      Framework Adapters             │
│  (Vue / React / Lit)                │
├─────────────────────────────────────┤
│      Core Logic Layer               │
│  (State Management, Panels)         │
├─────────────────────────────────────┤
│      Shared Utilities               │
│  (Date Utils, Types, i18n)          │
└─────────────────────────────────────┘
```

### 优势

1. **一致性**：所有框架共享同一套核心逻辑，保证行为一致
2. **可维护性**：核心逻辑集中管理，易于维护和升级
3. **灵活性**：轻松适配新的框架或场景
4. **性能**：核心逻辑优化一次，所有框架受益

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 开源协议

MIT License

## 下一步

- [快速开始](/guide/getting-started) - 5 分钟快速上手
- [安装](/guide/installation) - 详细的安装说明
- [组件示例](/components/datepicker) - 查看更多示例





