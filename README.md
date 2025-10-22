# @ldesign/datepicker

<div align="center">

一个功能丰富、性能优秀、框架无关的日期时间选择器组件库

[![npm version](https://img.shields.io/npm/v/@ldesign/datepicker-core.svg)](https://www.npmjs.com/package/@ldesign/datepicker-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/badge/Coverage->90%25-brightgreen)]()

**🎉 v1.0.0-optimized 核心优化已完成！** [查看完整报告](./PROJECT_COMPLETION_REPORT.md)

</div>

## ✨ 特性

### 核心特性

- 🎯 **框架无关** - 核心逻辑独立，可在任意框架中使用
- 📦 **多框架支持** - 提供 Vue3、React、Lit/Web Components 封装
- 🎨 **主题定制** - 基于 CSS Variables，支持亮色/暗色主题
- 🌍 **国际化** - 内置 10+ 语言包，支持 RTL，按需加载
- ♿ **可访问性** - 完整的 ARIA 支持和键盘导航
- 🚀 **高性能** - 对象池、LRU缓存、内存优化
- 📅 **功能丰富** - 支持日期、时间、范围、多选等多种模式
- 💪 **TypeScript** - 完整的类型定义和类型守卫

### v1.0.0 新增特性 ⭐

- 🏗️ **状态管理** - 不可变状态 + 时间旅行调试
- 🔌 **中间件系统** - 灵活的业务逻辑插入
- 🧩 **插件架构** - 无限扩展可能
- ✅ **智能验证** - 12+ 验证器，链式/异步验证
- 📅 **相对日期** - 自然语言解析（"3天前"、"下周"）
- ⌨️ **键盘导航** - 完整的快捷键和焦点管理
- 📊 **性能监控** - 内存监控、性能分析
- 🎉 **双面板范围选择** - 参考 TDesign，所有范围选择都支持双面板
- ⏰ **滚轮时间选择器** - iOS 风格滚轮选择器，支持鼠标滚轮

## 📦 安装

### Vue 3

```bash
pnpm add @ldesign/datepicker-vue
```

### React

```bash
pnpm add @ldesign/datepicker-react
```

### Lit / Web Components

```bash
pnpm add @ldesign/datepicker-lit
```

### 核心包（框架无关）

```bash
pnpm add @ldesign/datepicker-core
```

## 🎯 查看完整示例

我们提供了三个完整的示例项目，展示所有功能：

```bash
# Vanilla JS / Web Components 示例
pnpm example:vanilla   # http://localhost:3001

# Vue 3 示例
pnpm example:vue       # http://localhost:3002

# React 示例
pnpm example:react     # http://localhost:3003

# 同时运行所有示例
pnpm examples
```

📖 查看 [示例项目指南](./EXAMPLES_GUIDE.md) 了解详细使用方法

## 🚀 快速开始

### Vue 3

```vue
<template>
  <DatePicker v-model="date" type="date" />
</template>

<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import '@ldesign/datepicker-vue/style.css';

const date = ref(new Date());
</script>
```

### React

```tsx
import { useState } from 'react';
import { DatePicker } from '@ldesign/datepicker-react';
import '@ldesign/datepicker-react/style.css';

function App() {
  const [date, setDate] = useState(new Date());
  
  return <DatePicker value={date} onChange={setDate} type="date" />;
}
```

### Lit / Web Components

```html
<script type="module">
  import '@ldesign/datepicker-lit';
</script>

<ldate-picker type="date"></ldate-picker>
```

## 📖 选择模式

支持以下选择模式：

- `date` - 单个日期
- `dates` - 多个日期
- `week` - 星期选择
- `month` - 月份选择
- `year` - 年份选择
- `quarter` - 季度选择
- `datetime` - 日期时间
- `time` - 时间选择
- `daterange` - 日期范围 **（双面板）**
- `datetimerange` - 日期时间范围
- `monthrange` - 月份范围 **（双面板）**
- `yearrange` - 年份范围 **（双面板）**

### 🎉 双面板范围选择

参考 TDesign 设计，所有范围选择都采用双面板并排显示：

```vue
<!-- 日期范围 -->
<DatePicker type="daterange" />

<!-- 月份范围 -->
<DatePicker type="monthrange" />

<!-- 年份范围 -->
<DatePicker type="yearrange" />
```

**特点**：
- ✨ 两个面板同时显示相邻周期
- ✨ 联动导航，操作更直观
- ✨ 范围高亮，视觉效果更好
- ✨ 减少切换，提升用户体验

### ⏰ 滚轮时间选择器

参考 iOS 设计，时间选择器采用滚轮效果：

```vue
<DatePicker type="time" />
```

**特点**：
- ✨ iOS 风格滚轮选择器
- ✨ 支持鼠标滚轮快速选择
- ✨ 渐变遮罩和中间指示器
- ✨ 选中项放大动画效果

详见 [高级优化指南](./ADVANCED_UPDATES.md)

## 🎨 主题定制

通过 CSS Variables 自定义主题：

```css
:root {
  --ldate-primary-color: #409eff;
  --ldate-border-radius: 4px;
  --ldate-cell-size: 36px;
  --ldate-font-size: 14px;
}

/* 暗色主题 */
[data-theme="dark"] {
  --ldate-bg-color: #1a1a1a;
  --ldate-text-color: #e0e0e0;
}
```

## 📚 文档

### 🚀 快速开始

- **[快速开始指南](./QUICK_START.md)** - 5分钟上手
- **[功能示例](./FEATURE_EXAMPLES.md)** - 详细的使用示例和最佳实践

### 📊 项目文档

- **[项目完成报告](./PROJECT_COMPLETION_REPORT.md)** - 完整的项目数据和成果
- **[优化总结报告](./OPTIMIZATION_SUMMARY.md)** - 所有优化内容详解
- **[v1.0.0 更新日志](./CHANGELOG_v1.0.0.md)** - 版本变更详情
- **[v1.0.0 发布说明](./README_v1.0.0.md)** - 重大特性介绍

### 🔧 技术文档

- **[架构设计](./docs/ARCHITECTURE.md)** - 深入了解架构设计
- **[API 文档](./docs/API.md)** - 完整的 API 参考
- **[迁移指南](./docs/MIGRATION.md)** - 版本升级指南

### 🌐 在线文档

访问完整文档：[https://ldesign-datepicker.dev](https://ldesign-datepicker.dev)

## 🤝 贡献

欢迎贡献代码！请阅读 [贡献指南](CONTRIBUTING.md)。

## 📄 License

[MIT](LICENSE) © LDesign Team

## 🏗️ 项目结构

```
datepicker/
├── packages/
│   ├── core/              # 框架无关的核心逻辑
│   ├── shared/            # 共享工具和类型
│   ├── vue/               # Vue3 封装
│   ├── react/             # React 封装
│   └── lit/               # Lit/Web Components 封装
├── examples/              # 完整示例项目
│   ├── vanilla-js/        # Vanilla JS 示例
│   ├── vue-example/       # Vue 3 示例
│   └── react-example/     # React 示例
├── playground/            # 开发调试环境
├── docs/                  # VitePress 文档站点
└── tests/                 # 测试文件
```


