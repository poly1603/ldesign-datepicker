# 🚀 快速开始指南

> 5分钟上手 @ldesign/datepicker v1.0.0-optimized

## 📦 安装

根据你的框架选择对应的包：

### Vue 3

```bash
pnpm add @ldesign/datepicker-vue
# 或
npm install @ldesign/datepicker-vue
# 或
yarn add @ldesign/datepicker-vue
```

### React

```bash
pnpm add @ldesign/datepicker-react
```

### Vanilla JS / Web Components

```bash
pnpm add @ldesign/datepicker-lit
```

## 🎯 基本使用

### Vue 3

```vue
<template>
  <div>
    <h3>选择日期</h3>
    <DatePicker v-model="date" type="date" />
    
    <h3>选择日期范围</h3>
    <DatePicker v-model="dateRange" type="daterange" />
    
    <p>选中的日期: {{ date }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import '@ldesign/datepicker-vue/style.css';

const date = ref(new Date());
const dateRange = ref<[Date, Date]>([new Date(), new Date()]);
</script>
```

### React

```tsx
import { useState } from 'react';
import { DatePicker } from '@ldesign/datepicker-react';
import '@ldesign/datepicker-react/style.css';

function App() {
  const [date, setDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);

  return (
    <div>
      <h3>选择日期</h3>
      <DatePicker value={date} onChange={setDate} type="date" />
      
      <h3>选择日期范围</h3>
      <DatePicker value={dateRange} onChange={setDateRange} type="daterange" />
      
      <p>选中的日期: {date.toLocaleDateString()}</p>
    </div>
  );
}
```

## 💡 常用功能

### 1. 时间旅行调试

```typescript
import { DatePickerCore } from '@ldesign/datepicker-core';

const picker = new DatePickerCore({
  type: 'date',
  enableTimeTravel: true, // 启用时间旅行
  maxHistory: 50,         // 保留50条历史
});

// 操作
picker.setValue(new Date('2024-01-01'));
picker.setValue(new Date('2024-01-02'));

// 撤销
picker.undo(); // 回到 2024-01-01

// 重做
picker.redo(); // 回到 2024-01-02

// 查看历史
const history = picker.getHistory();
```

### 2. 日期验证

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
  .custom(futureDateValidator());

// 验证日期
const result = await validator.validate(new Date('2024-06-15'));

if (!result.valid) {
  console.error(result.message);
}
```

### 3. 相对日期

```typescript
import {
  parseNaturalLanguageDate,
  createRelativeDateShortcuts,
} from '@ldesign/datepicker-shared';

// 解析自然语言
const result1 = parseNaturalLanguageDate('3天前');
const result2 = parseNaturalLanguageDate('下周');
const result3 = parseNaturalLanguageDate('7 days ago');

console.log(result1?.date); // 3天前的日期

// 使用快捷方式
const shortcuts = createRelativeDateShortcuts();

<DatePicker
  type="daterange"
  :shortcuts="shortcuts"
/>
```

### 4. 国际化

```typescript
import { loadLocale, setLocale } from '@ldesign/datepicker-shared';

// 动态加载语言包
const locale = await loadLocale('ko-kr');
setLocale('ko-kr');

// 在组件中使用
<DatePicker
  type="date"
  :locale="locale"
/>
```

### 5. 键盘导航

```typescript
import {
  KeyboardShortcutManager,
  FocusManager,
} from '@ldesign/datepicker-shared';

const keyboardManager = new KeyboardShortcutManager();

// 注册快捷键
keyboardManager.register('today', {
  keys: ['t', 'T'],
  handler: () => {
    picker.setValue(new Date());
  },
  description: '选择今天',
});

// 焦点管理
const focusManager = new FocusManager();
focusManager.setContainer(pickerElement);
focusManager.focusFirst();
```

### 6. 性能监控

```typescript
import {
  MemoryMonitor,
  createDateCellPool,
  LRUCache,
} from '@ldesign/datepicker-core';

// 内存监控
const monitor = new MemoryMonitor({
  sampleInterval: 1000,
  warningThreshold: 100 * 1024 * 1024, // 100MB
});

monitor.start();

// 对象池
const pool = createDateCellPool(50, 200);
const cell = pool.acquire();
// ... 使用 cell
pool.release(cell);

// LRU 缓存
const cache = new LRUCache(100);
cache.set('key', value);
const stats = cache.getStats();
console.log(`命中率: ${(stats.hitRate * 100).toFixed(2)}%`);
```

### 7. 中间件

```typescript
import {
  createLoggerMiddleware,
  createPerformanceMiddleware,
} from '@ldesign/datepicker-core';

// 日志中间件
picker.use(createLoggerMiddleware({
  logLevel: 'debug',
}));

// 性能监控中间件
picker.use(createPerformanceMiddleware({
  threshold: 16, // 超过16ms警告
  onSlow: (context, duration) => {
    console.warn(`慢操作: ${context.action} 耗时 ${duration}ms`);
  },
}));
```

### 8. 插件系统

```typescript
import { createPlugin } from '@ldesign/datepicker-core';

const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  install(core, options) {
    console.log('插件安装', options);
    
    // 添加功能
    core.use((context, next) => {
      // 自定义中间件逻辑
      next();
    });
  },
  uninstall(core) {
    console.log('插件卸载');
  },
});

// 使用插件
const pluginManager = picker.getPluginManager();
pluginManager.register(myPlugin);
await pluginManager.install('my-plugin', { option1: 'value' });
```

## 📖 配置选项

### 常用属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `PickerType` | `'date'` | 选择器类型 |
| `placeholder` | `string` | `'选择日期'` | 占位符文本 |
| `clearable` | `boolean` | `true` | 是否可清除 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `shortcuts` | `Shortcut[]` | `[]` | 快捷选项 |
| `disabledDate` | `Function` | - | 禁用日期函数 |

### 高级选项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableTimeTravel` | `boolean` | `false` | 启用时间旅行 |
| `maxHistory` | `number` | `50` | 最大历史记录数 |
| `enableCache` | `boolean` | `true` | 启用缓存 |
| `weekStartsOn` | `0-6` | `1` | 周起始日 |
| `use12Hours` | `boolean` | `false` | 12小时制 |

## 🔗 相关链接

- 📖 [完整文档](./README.md)
- 🎯 [功能示例](./FEATURE_EXAMPLES.md)
- 📊 [优化报告](./OPTIMIZATION_SUMMARY.md)
- 📝 [更新日志](./CHANGELOG_v1.0.0.md)

## 💬 获取帮助

- 📧 Email: support@ldesign.dev
- 💬 Discussions: [GitHub Discussions](https://github.com/ldesign/datepicker/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/ldesign/datepicker/issues)

---

**开始使用吧！** 🎉

