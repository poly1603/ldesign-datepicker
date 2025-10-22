# DatePicker DevTools

开发调试工具，帮助开发者调试和优化 DatePicker。

## 📦 安装

```bash
pnpm add -D @ldesign/datepicker-devtools
```

## 🚀 使用

### 状态调试器

```typescript
import { enableDebugMode, getGlobalDebugger } from '@ldesign/datepicker-devtools';

// 启用调试模式
enableDebugMode();

// 通过浏览器控制台访问
window.__LDATE_DEBUGGER__.getLogs();
window.__LDATE_DEBUGGER__.getStats();
window.__LDATE_DEBUGGER__.exportLogs();
```

### 性能分析器

```typescript
import { getGlobalAnalyzer } from '@ldesign/datepicker-devtools';

const analyzer = getGlobalAnalyzer();

// 开始测量
const end = analyzer.startMeasure('render', 'render');
// ... 执行操作
end();

// 查看报告
console.log(analyzer.getReport());

// 查看慢操作
const slowOps = analyzer.getSlowOperations(16); // 超过16ms的操作
```

### 在组件中使用

```vue
<template>
  <DatePicker v-model="date" @change="handleChange" />
</template>

<script setup>
import { enableDebugMode } from '@ldesign/datepicker-devtools';

// 开发模式下启用调试
if (import.meta.env.DEV) {
  enableDebugMode();
}
</script>
```

## 📊 调试面板

调试器会在浏览器控制台输出详细信息：

```
[StateDebugger] SET_VALUE
State: { value: Date, visible: false, ... }
Duration: 1.23ms
Memory: 45.67MB
```

## 🔍 查看历史记录

```javascript
// 在浏览器控制台
const debugger = window.__LDATE_DEBUGGER__;

// 获取所有日志
const logs = debugger.getLogs();

// 获取统计信息
const stats = debugger.getStats();

// 导出日志（用于分享或分析）
const json = debugger.exportLogs();
```

## 📈 性能分析

```javascript
const analyzer = window.__LDATE_ANALYZER__;

// 获取性能报告
console.log(analyzer.getReport());

// 导出性能数据
const data = analyzer.export();
```

## ⚠️ 注意事项

- 仅在开发环境使用 DevTools
- 生产环境请禁用调试模式
- 性能分析会轻微影响性能

