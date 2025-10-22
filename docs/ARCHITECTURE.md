# DatePicker 架构设计

> v1.0.0-optimized 架构文档

## 📐 总体架构

DatePicker 采用分层架构，核心逻辑框架无关，通过适配器支持多个框架。

```
┌─────────────────────────────────────────────────────┐
│           框架层 (Vue/React/Lit)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Vue Adapter │ │React Adapter│ │ Lit Adapter │   │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘   │
└─────────┼────────────────┼────────────────┼─────────┘
          │                │                │
┌─────────┴────────────────┴────────────────┴─────────┐
│                   核心层 (Core)                       │
│  ┌──────────────────────────────────────────────┐   │
│  │           DatePickerCore                      │   │
│  │  ┌──────────────┐  ┌──────────────┐         │   │
│  │  │StateManager  │  │MiddlewareMan │         │   │
│  │  └──────────────┘  └──────────────┘         │   │
│  │  ┌──────────────┐  ┌──────────────┐         │   │
│  │  │PluginManager │  │CommandManager│         │   │
│  │  └──────────────┘  └──────────────┘         │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Panels  │ │Calculators│ │Renderers │           │
│  └──────────┘ └──────────┘ └──────────┘           │
└───────────────────────────┬─────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────┐
│                   共享层 (Shared)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Types   │ │  Utils   │ │Validators│           │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Locales  │ │   I18n   │ │Constants │           │
│  └──────────┘ └──────────┘ └──────────┘           │
└───────────────────────────────────────────────────────┘
```

## 🏗️ 核心组件

### StateManager（状态管理器）

负责管理组件状态，支持不可变更新和时间旅行。

**特性:**
- ✅ 不可变状态
- ✅ 状态快照
- ✅ 撤销/重做
- ✅ 订阅机制
- ✅ 深度克隆和冻结

**使用场景:**
- 状态追踪
- 调试
- 时间旅行

### MiddlewareManager（中间件管理器）

提供中间件机制，允许在状态变更时插入自定义逻辑。

**特性:**
- ✅ 优先级队列
- ✅ 异步中间件
- ✅ 错误处理
- ✅ 内置中间件（日志、性能、验证）

**使用场景:**
- 日志记录
- 性能监控
- 状态验证
- 业务逻辑

### PluginManager（插件管理器）

支持插件化扩展功能。

**特性:**
- ✅ 插件注册
- ✅ 依赖管理
- ✅ 生命周期钩子
- ✅ 配置传递

**使用场景:**
- 功能扩展
- 自定义面板
- 第三方集成

### CommandManager（命令管理器）

实现命令模式，支持操作的撤销和重做。

**特性:**
- ✅ 命令历史
- ✅ 撤销/重做
- ✅ 组合命令
- ✅ 异步命令

**使用场景:**
- 撤销/重做
- 批量操作
- 事务处理

## 🎯 设计模式

### 1. 观察者模式

状态管理器使用观察者模式通知状态变更。

```typescript
stateManager.subscribe((newState, oldState) => {
  // 响应状态变更
});
```

### 2. 中间件模式

中间件链式调用处理状态变更。

```typescript
picker.use((context, next) => {
  // 前置处理
  next();
  // 后置处理
});
```

### 3. 命令模式

操作封装为命令，支持撤销和重做。

```typescript
const command = createCommand({
  execute: () => { /* ... */ },
  undo: () => { /* ... */ },
});

commandManager.execute(command);
commandManager.undo();
```

### 4. 对象池模式

复用对象减少内存分配。

```typescript
const pool = createDateCellPool();
const cell = pool.acquire();
// use cell
pool.release(cell);
```

### 5. 策略模式

不同的验证策略、渲染策略等。

```typescript
const validator = createDateValidationChain()
  .custom(strategy1)
  .custom(strategy2);
```

## 📊 数据流

### 单向数据流

```
用户交互
    ↓
事件处理
    ↓
中间件链
    ↓
状态更新
    ↓
视图更新
```

### 状态变更流程

```
setValue()
    ↓
StateManager.setState()
    ↓
MiddlewareManager.run()
    ↓
State Update
    ↓
Notify Subscribers
    ↓
UI Update
```

## 🔧 性能优化策略

### 1. 对象池

避免频繁创建和销毁对象。

### 2. LRU 缓存

缓存计算结果，避免重复计算。

### 3. 弱引用

允许对象被垃圾回收，减少内存占用。

### 4. 批量更新

合并多个更新到一个渲染周期。

### 5. 虚拟化

只渲染可见部分，减少 DOM 节点。

## 📦 模块组织

### Core 包

```
packages/core/src/
├── architecture/      # 架构组件
│   ├── StateManager.ts
│   ├── Middleware.ts
│   ├── PluginSystem.ts
│   └── CommandPattern.ts
├── core/              # 核心逻辑
│   └── DatePickerCore.ts
├── panels/            # 面板组件
│   ├── date-panel.ts
│   ├── lunar-panel.ts
│   └── timezone-panel.ts
├── calculators/       # 计算器
│   ├── LunarCalendar.ts
│   └── Timezone.ts
├── renderers/         # 渲染器
│   └── CellRenderer.ts
├── mobile/            # 移动端
│   ├── TouchGesture.ts
│   └── MobileAdapter.ts
└── utils/             # 工具
    ├── performance.ts
    ├── object-pool.ts
    ├── memory-monitor.ts
    └── ...
```

### Shared 包

```
packages/shared/src/
├── types/             # 类型定义
├── utils/             # 工具函数
├── validators/        # 验证器
├── locales/           # 语言包
├── i18n/              # 国际化
└── constants/         # 常量
```

## 🧪 测试策略

### 单元测试

- 核心逻辑覆盖率 >90%
- 工具函数覆盖率 100%
- 使用 Vitest

### E2E 测试

- Playwright 测试
- 跨浏览器兼容性
- 移动端测试

### 性能测试

- 基准测试
- 内存泄漏检测
- 压力测试

## 📝 最佳实践

### 1. 使用类型守卫

```typescript
import { isValidDate, isDateRange } from '@ldesign/datepicker-shared';

if (isValidDate(value)) {
  // value 现在是 Date 类型
}
```

### 2. 启用缓存

```typescript
const picker = new DatePickerCore({
  type: 'date',
  enableCache: true, // 启用 LRU 缓存
});
```

### 3. 使用对象池

```typescript
import { createDateCellPool } from '@ldesign/datepicker-core';

const pool = createDateCellPool(50, 200);
// 复用对象，减少 GC 压力
```

### 4. 监控性能

```typescript
import { MemoryMonitor } from '@ldesign/datepicker-core';

const monitor = new MemoryMonitor();
monitor.start();
```

## 🔮 未来规划

### v1.1.0
- 完整的农历数据表
- 更多时区支持
- 移动端手势优化

### v1.2.0
- Chrome DevTools 扩展
- 更多集成工具
- 可视化配置器

## 参考资料

- [优化总结](../OPTIMIZATION_SUMMARY.md)
- [功能示例](../FEATURE_EXAMPLES.md)
- [API 文档](./API.md)

