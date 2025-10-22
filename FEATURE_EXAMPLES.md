# DatePicker 功能示例

> 展示 DatePicker v1.0.0 的核心功能使用示例

## 🎯 目录

1. [基本使用](#基本使用)
2. [状态管理](#状态管理)
3. [验证系统](#验证系统)
4. [相对日期](#相对日期)
5. [国际化](#国际化)
6. [键盘导航](#键盘导航)
7. [性能优化](#性能优化)
8. [插件系统](#插件系统)

## 基本使用

### Vue 3

```vue
<template>
  <DatePicker
    v-model="date"
    type="date"
    placeholder="选择日期"
    clearable
  />
</template>

<script setup lang="ts">
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
  
  return (
    <DatePicker
      value={date}
      onChange={setDate}
      type="date"
      placeholder="选择日期"
      clearable
    />
  );
}
```

## 状态管理

### 时间旅行调试

```typescript
import { DatePickerCore } from '@ldesign/datepicker-core';

const picker = new DatePickerCore({
  type: 'date',
  enableTimeTravel: true,
  maxHistory: 50,
});

// 选择日期
picker.setValue(new Date('2024-01-01'));
picker.setValue(new Date('2024-01-02'));
picker.setValue(new Date('2024-01-03'));

// 撤销
picker.undo(); // 回到 2024-01-02
picker.undo(); // 回到 2024-01-01

// 重做
picker.redo(); // 回到 2024-01-02

// 查看历史
const history = picker.getHistory();
console.log(history);
```

### 中间件

```typescript
import {
  createLoggerMiddleware,
  createPerformanceMiddleware,
  createValidationMiddleware,
} from '@ldesign/datepicker-core';

// 添加日志中间件
picker.use(createLoggerMiddleware({
  logLevel: 'debug',
  filter: (context) => context.action !== 'SET_HOVER_DATE', // 过滤悬停事件
}));

// 添加性能监控
picker.use(createPerformanceMiddleware({
  threshold: 16, // 超过 16ms 警告
  onSlow: (context, duration) => {
    console.warn(`Slow operation: ${context.action} took ${duration}ms`);
  },
}));

// 添加验证中间件
picker.use(createValidationMiddleware((state, action) => {
  // 验证状态是否合法
  if (state.value && state.value instanceof Date) {
    if (isNaN(state.value.getTime())) {
      return '无效的日期';
    }
  }
  return true;
}));
```

## 验证系统

### 创建验证链

```typescript
import {
  createDateValidationChain,
  dateRangeValidator,
  noWeekendsValidator,
  futureDateValidator,
} from '@ldesign/datepicker-shared';

const validator = createDateValidationChain()
  .required('请选择日期')
  .custom(dateRangeValidator(
    new Date('2024-01-01'),
    new Date('2024-12-31')
  ))
  .custom(noWeekendsValidator())
  .custom(futureDateValidator('不能选择过去的日期'));

// 验证日期
const result = await validator.validate(new Date('2024-06-15'));

if (!result.valid) {
  console.error(result.message);
}
```

### 异步验证

```typescript
const validator = createDateValidationChain()
  .required()
  .asyncCustom(async (date) => {
    // 检查日期是否可用（例如查询 API）
    const response = await fetch(`/api/check-date?date=${date.toISOString()}`);
    const { available } = await response.json();
    
    return {
      valid: available,
      message: available ? undefined : '该日期已被预订',
    };
  });
```

### 条件验证

```typescript
const validator = createDateValidationChain()
  .required()
  .when(
    (date) => date && date.getDay() === 6, // 如果是周六
    (chain) => chain.custom((date) => ({
      valid: false,
      message: '周六不可用',
    }))
  );
```

## 相对日期

### 自然语言解析

```typescript
import { parseNaturalLanguageDate } from '@ldesign/datepicker-shared';

// 解析中文
const result1 = parseNaturalLanguageDate('3天前');
console.log(result1?.date); // 3天前的日期
console.log(result1?.description); // "3天前"

// 解析英文
const result2 = parseNaturalLanguageDate('7 days ago');
console.log(result2?.date);

// 支持的表达式
const expressions = [
  '今天', '昨天', '明天',
  '本周', '上周', '下周',
  '本月', '上个月', '下个月',
  '今年', '去年', '明年',
  '3天前', '7天后',
  '2周前', '1个月后',
  '1年前',
];
```

### 相对日期快捷方式

```typescript
import { createRelativeDateShortcuts, RELATIVE_DATE_SHORTCUTS } from '@ldesign/datepicker-shared';

// 使用预设快捷方式
const shortcuts = createRelativeDateShortcuts();

// 或使用单个快捷方式
const today = RELATIVE_DATE_SHORTCUTS.today();
const last7Days = RELATIVE_DATE_SHORTCUTS.last7Days(); // 返回 [起始日期, 结束日期]
const last30Days = RELATIVE_DATE_SHORTCUTS.last30Days();

// 在 DatePicker 中使用
<DatePicker
  type="daterange"
  shortcuts={shortcuts}
/>
```

### 自定义相对日期

```typescript
import { calculateRelativeDate } from '@ldesign/datepicker-shared';

// 计算相对日期
const futureDate = calculateRelativeDate({
  amount: 15,
  unit: 'days',
  baseDate: new Date(),
});

const pastDate = calculateRelativeDate({
  amount: -30,
  unit: 'days',
});

const nextQuarter = calculateRelativeDate({
  amount: 1,
  unit: 'quarter',
});
```

## 国际化

### 加载语言包

```typescript
import { loadLocale, setLocale } from '@ldesign/datepicker-shared';

// 动态加载语言包
const locale = await loadLocale('ko-kr');
setLocale('ko-kr');

// 预加载多个语言包
import { preloadLocales } from '@ldesign/datepicker-shared';
await preloadLocales(['zh-cn', 'en-us', 'ja-jp', 'ko-kr']);

// 检查支持的语言
import { getSupportedLocales, isLocaleSupported } from '@ldesign/datepicker-shared';
console.log(getSupportedLocales()); // ['zh-cn', 'en-us', 'ja-jp', ...]
console.log(isLocaleSupported('fr-fr')); // true
```

### RTL 语言支持

```typescript
import { isRTL, applyRTLStyles, getTextDirection } from '@ldesign/datepicker-shared';

// 检查是否为 RTL 语言
console.log(isRTL('ar-sa')); // true
console.log(isRTL('en-us')); // false

// 获取文本方向
console.log(getTextDirection('ar-sa')); // 'rtl'
console.log(getTextDirection('zh-cn')); // 'ltr'

// 应用 RTL 样式
const pickerElement = document.querySelector('.ldate-picker');
applyRTLStyles(pickerElement, 'ar-sa');
```

## 键盘导航

### 配置键盘快捷键

```typescript
import { KeyboardShortcutManager, FocusManager } from '@ldesign/datepicker-shared';

const keyboardManager = new KeyboardShortcutManager({
  up: ['ArrowUp', 'k'],
  down: ['ArrowDown', 'j'],
  left: ['ArrowLeft', 'h'],
  right: ['ArrowRight', 'l'],
  select: ['Enter', ' '],
  cancel: ['Escape', 'q'],
  today: ['t', 'T'],
});

// 注册自定义快捷键
keyboardManager.register('jump-week', {
  keys: ['w', 'W'],
  handler: (event) => {
    // 跳转到下周
    console.log('Jump to next week');
  },
  description: '跳转到下周',
  preventDefault: true,
});

// 注册组合键
keyboardManager.register('select-range', {
  keys: ['Ctrl+Shift+R', 'Cmd+Shift+R'],
  handler: (event) => {
    // 选择范围
    console.log('Select range');
  },
  description: '选择范围',
});
```

### 焦点管理

```typescript
const focusManager = new FocusManager();

// 设置容器
const container = document.querySelector('.ldate-panel');
focusManager.setContainer(container);

// 焦点控制
focusManager.focusFirst(); // 聚焦第一个元素
focusManager.focusLast(); // 聚焦最后一个元素
focusManager.focusNext(); // 下一个
focusManager.focusPrevious(); // 上一个

// 循环焦点
focusManager.focusNextCircular(); // 到达末尾时回到开头
focusManager.focusPreviousCircular(); // 到达开头时回到末尾

// Tab 键处理（焦点陷阱）
document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    focusManager.handleTabKey(event);
  }
});
```

## 性能优化

### 对象池

```typescript
import { createDateCellPool } from '@ldesign/datepicker-core';

// 创建对象池
const pool = createDateCellPool(50, 200);

// 预热（提前创建对象）
pool.warmup(100);

// 使用对象
const cell = pool.acquire();
cell.date = new Date();
cell.selected = true;
cell.text = '15';

// 归还对象
pool.release(cell);

// 批量归还
const cells = [cell1, cell2, cell3];
pool.releaseMany(cells);

// 查看统计
console.log(`Pool size: ${pool.size()}`);
console.log(`Total created: ${pool.getTotalCreated()}`);
```

### 内存监控

```typescript
import { MemoryMonitor } from '@ldesign/datepicker-core';

const monitor = new MemoryMonitor({
  sampleInterval: 1000, // 每秒采样
  maxSamples: 100,
  warningThreshold: 100 * 1024 * 1024, // 100MB
  onWarning: (usage) => {
    console.warn('High memory usage:', MemoryMonitor.formatBytes(usage.usedJSHeapSize));
  },
});

// 开始监控
monitor.start();

// 查看报告
const report = monitor.getReport();
console.log(`Average usage: ${MemoryMonitor.formatBytes(report.avgUsage)}`);
console.log(`Max usage: ${MemoryMonitor.formatBytes(report.maxUsage)}`);
console.log(`Trend: ${report.trend}`); // 'increasing', 'decreasing', 'stable'

// 停止监控
monitor.stop();
```

### LRU 缓存

```typescript
import { LRUCache } from '@ldesign/datepicker-core';

const cache = new LRUCache<string, Date[]>(100);

// 设置缓存
cache.set('2024-01', generateDates('2024-01'));

// 获取缓存
const dates = cache.get('2024-01');

// 获取或设置
const dates2 = cache.getOrSet('2024-02', () => generateDates('2024-02'));

// 查看统计
const stats = cache.getStats();
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(2)}%`);
console.log(`Cache size: ${stats.size}/${stats.maxSize}`);
```

### 性能基准测试

```typescript
import { benchmark, benchmarkAsync } from '@ldesign/datepicker-core';

// 同步测试
const result = benchmark(() => {
  const cell = pool.acquire();
  cell.date = new Date();
  pool.release(cell);
}, 10000);

console.log(`Average: ${result.averageTime.toFixed(3)}ms`);
console.log(`Ops/sec: ${result.opsPerSecond.toFixed(0)}`);

// 异步测试
const asyncResult = await benchmarkAsync(async () => {
  await loadLocale('ko-kr');
}, 100);

console.log(`Average: ${asyncResult.averageTime.toFixed(3)}ms`);
```

## 插件系统

### 创建插件

```typescript
import { createPlugin } from '@ldesign/datepicker-core';

const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  dependencies: [], // 依赖其他插件
  
  install(core, options) {
    console.log('Plugin installed with options:', options);
    
    // 添加中间件
    core.use((context, next) => {
      console.log('Plugin middleware:', context.action);
      next();
    }, { priority: 10 });
    
    // 监听事件
    core.on('change', (value) => {
      console.log('Date changed:', value);
    });
  },
  
  uninstall(core) {
    console.log('Plugin uninstalled');
    // 清理逻辑
  },
});

// 注册和安装插件
const pluginManager = picker.getPluginManager();
pluginManager.register(myPlugin);
await pluginManager.install('my-plugin', { option1: 'value1' });

// 卸载插件
await pluginManager.uninstall('my-plugin');
```

### 插件示例：主题切换

```typescript
const themePlugin = createPlugin({
  name: 'theme-switcher',
  version: '1.0.0',
  
  install(core, options) {
    const { defaultTheme = 'light' } = options;
    
    // 应用主题
    const applyTheme = (theme: 'light' | 'dark') => {
      document.documentElement.setAttribute('data-theme', theme);
    };
    
    applyTheme(defaultTheme);
    
    // 添加主题切换方法
    (core as any).switchTheme = applyTheme;
  },
});
```

## 📚 更多示例

查看完整示例项目：
- [Vanilla JS 示例](./examples/vanilla-js/)
- [Vue 3 示例](./examples/vue-example/)
- [React 示例](./examples/react-example/)

## 🔗 相关文档

- [API 文档](./docs/API.md)
- [优化总结](./OPTIMIZATION_SUMMARY.md)
- [架构设计](./docs/ARCHITECTURE.md)
- [迁移指南](./docs/MIGRATION.md)

