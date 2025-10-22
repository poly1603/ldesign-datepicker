# DatePicker API 文档

> 完整的 API 参考文档

## 核心 API

### DatePickerCore

主要的日期选择器核心类。

#### 构造函数

```typescript
new DatePickerCore(config: DatePickerConfig)
```

**参数:**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| config.type | `PickerType` | 是 | - | 选择器类型 |
| config.format | `string` | 否 | 自动 | 显示格式 |
| config.placeholder | `string` | 否 | '选择日期' | 占位符 |
| config.enableTimeTravel | `boolean` | 否 | `false` | 启用时间旅行 |
| config.maxHistory | `number` | 否 | `50` | 最大历史记录 |
| config.enableCache | `boolean` | 否 | `true` | 启用缓存 |

#### 方法

##### setValue

```typescript
setValue(value: PickerValue): void
```

设置选择器的值。

**参数:**
- `value` - 日期值

**示例:**
```typescript
picker.setValue(new Date('2024-01-01'));
picker.setValue([new Date('2024-01-01'), new Date('2024-01-31')]);
```

##### getState

```typescript
getState(): Readonly<DatePickerState>
```

获取当前状态（只读）。

**返回:**
- 当前状态对象

**示例:**
```typescript
const state = picker.getState();
console.log(state.value, state.visible);
```

##### undo

```typescript
undo(): boolean
```

撤销到上一个状态。

**返回:**
- 是否成功撤销

**示例:**
```typescript
picker.setValue(new Date('2024-01-01'));
picker.undo(); // 返回到之前的值
```

##### redo

```typescript
redo(): boolean
```

重做到下一个状态。

**返回:**
- 是否成功重做

##### use

```typescript
use(middleware: MiddlewareFunction, config?: MiddlewareConfig): () => void
```

使用中间件。

**参数:**
- `middleware` - 中间件函数
- `config` - 中间件配置（可选）

**返回:**
- 取消注册函数

**示例:**
```typescript
picker.use(createLoggerMiddleware());
picker.use(createPerformanceMiddleware({ threshold: 16 }));
```

##### getPluginManager

```typescript
getPluginManager(): PluginManager
```

获取插件管理器。

**返回:**
- 插件管理器实例

**示例:**
```typescript
const pm = picker.getPluginManager();
pm.register(myPlugin);
await pm.install('my-plugin');
```

## 工具 API

### StateManager

状态管理器类。

#### 构造函数

```typescript
new StateManager<T>(options: StateManagerOptions<T>)
```

#### 方法

```typescript
getState(): Readonly<T>
setState(updater: Partial<T> | ((state: T) => T), action?: string): void
subscribe(listener: StateChangeListener<T>): () => void
undo(): boolean
redo(): boolean
getHistory(): StateSnapshot<T>[]
```

### LRUCache

LRU 缓存类。

```typescript
const cache = new LRUCache<K, V>(maxSize);

cache.set(key, value);
cache.get(key);
cache.getOrSet(key, factory);
cache.getStats();
```

### ObjectPool

对象池类。

```typescript
const pool = new ObjectPool({
  create: () => createObject(),
  reset: (obj) => resetObject(obj),
  maxSize: 200,
});

const obj = pool.acquire();
// ... use obj
pool.release(obj);
```

## 验证 API

### ValidationChain

验证规则链。

```typescript
const validator = createDateValidationChain()
  .required('日期必填')
  .custom(dateRangeValidator(min, max))
  .asyncCustom(async (date) => {
    const isValid = await checkAvailability(date);
    return { valid: isValid };
  });

const result = await validator.validate(date);
```

### 内置验证器

- `dateRangeValidator(min, max)` - 日期范围验证
- `weekdayValidator(allowedDays)` - 工作日验证
- `noWeekendsValidator()` - 非周末验证
- `futureDateValidator(message)` - 未来日期验证
- `pastDateValidator(message)` - 过去日期验证
- `dateRangeSpanValidator(maxDays)` - 范围跨度验证

## 相对日期 API

### parseNaturalLanguageDate

```typescript
parseNaturalLanguageDate(input: string): RelativeDateDescriptor | null
```

解析自然语言日期。

**支持的表达式:**
- 中文: "今天", "昨天", "明天", "3天前", "下周"
- 英文: "today", "yesterday", "tomorrow", "7 days ago", "next week"

**示例:**
```typescript
const result = parseNaturalLanguageDate('3天前');
console.log(result?.date); // 3天前的 Date 对象
console.log(result?.description); // "3天前"
```

### calculateRelativeDate

```typescript
calculateRelativeDate(config: RelativeDateConfig): Date
```

计算相对日期。

**示例:**
```typescript
const date = calculateRelativeDate({
  amount: -7,
  unit: 'days',
  baseDate: new Date(),
});
```

## 国际化 API

### loadLocale

```typescript
loadLocale(locale: string): Promise<Locale>
```

动态加载语言包。

**示例:**
```typescript
const locale = await loadLocale('ko-kr');
```

### isRTL

```typescript
isRTL(locale: string): boolean
```

检查是否为 RTL 语言。

**示例:**
```typescript
isRTL('ar-sa'); // true
isRTL('zh-cn'); // false
```

## 移动端 API

### MobileAdapter

移动端适配器。

```typescript
const adapter = new MobileAdapter({
  enableGestures: true,
  minCellSize: 44,
});

adapter.init(element);
```

### TouchGestureManager

触摸手势管理器。

```typescript
const gestures = new TouchGestureManager();
gestures.bind(element);

gestures.on('swipeleft', () => {
  // 处理左滑
});
```

## 可访问性 API

### AccessibilityManager

可访问性管理器。

```typescript
const a11y = new AccessibilityManager();
a11y.init(element);
a11y.announce('已选择2024年1月1日');
```

### ColorContrastCalculator

颜色对比度计算器。

```typescript
const ratio = ColorContrastCalculator.getContrastRatio('#000', '#fff');
const meetsAA = ColorContrastCalculator.meetsWCAG_AA('#000', '#fff');
const meetsAAA = ColorContrastCalculator.meetsWCAG_AAA('#000', '#fff');
```

## 类型定义

### PickerType

```typescript
type PickerType =
  | 'date'           // 单个日期
  | 'dates'          // 多个日期
  | 'week'           // 星期
  | 'month'          // 月份
  | 'year'           // 年份
  | 'quarter'        // 季度
  | 'datetime'       // 日期时间
  | 'time'           // 时间
  | 'daterange'      // 日期范围
  | 'datetimerange'  // 日期时间范围
  | 'monthrange'     // 月份范围
  | 'yearrange'      // 年份范围
  | 'lunar'          // 农历
  | 'timezone';      // 时区选择
```

### PickerValue

```typescript
type DateValue = Date | null;
type DateRangeValue = [Date | null, Date | null];
type DatesValue = Date[];
type PickerValue = DateValue | DateRangeValue | DatesValue;
```

## 事件

### change

```typescript
picker.on('change', (value: PickerValue) => {
  console.log('Value changed:', value);
});
```

### visible-change

```typescript
picker.on('visible-change', (visible: boolean) => {
  console.log('Panel visibility:', visible);
});
```

### panel-change

```typescript
picker.on('panel-change', (date: Date, view: ViewType) => {
  console.log('Panel changed:', date, view);
});
```

## 更多

查看完整示例：[FEATURE_EXAMPLES.md](../FEATURE_EXAMPLES.md)

