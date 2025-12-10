<script setup lang="ts">
import { ref } from 'vue';
import { TimePicker } from '@ldesign/datepicker-vue';
import type { TimeValue } from '@ldesign/datepicker-core';
import DemoCard from '@/components/DemoCard.vue';

const time = ref<TimeValue | null>(null);
const timeNoSec = ref<TimeValue | null>(null);

const vueBasicCode = `<script setup>
import { ref } from 'vue';
import { TimePicker } from '@ldesign/datepicker-vue';

const time = ref(null);
<\/script>

<template>
  <TimePicker v-model="time" />
</template>`;

const jsBasicCode = `// 时间选择器目前通过 DatePicker 的 datetime 模式实现
// 独立的 TimePicker 可以通过核心类自定义渲染

import { generateTimePanel, getTimeCellClass } from '@ldesign/datepicker-core';

const data = generateTimePanel({
  value: { hour: 10, minute: 30, second: 0 },
});

// 使用 data.hours, data.minutes, data.seconds 进行渲染`;

const vueNoSecCode = `<script setup>
import { ref } from 'vue';
import { TimePicker } from '@ldesign/datepicker-vue';

const time = ref(null);
<\/script>

<template>
  <TimePicker v-model="time" hide-seconds />
</template>`;

const jsNoSecCode = `const data = generateTimePanel({
  value: { hour: 10, minute: 30, second: 0 },
  hideSeconds: true,
});`;
</script>

<template>
  <div class="time-demo">
    <p class="page-desc">时间选择器用于选择时分秒。</p>
    
    <DemoCard
      title="基础时间选择"
      description="选择时、分、秒。"
      :vue-code="vueBasicCode"
      :js-code="jsBasicCode"
    >
      <TimePicker v-model="time" placeholder="请选择时间" />
    </DemoCard>
    
    <DemoCard
      title="隐藏秒"
      description="只选择时、分，隐藏秒选择。"
      :vue-code="vueNoSecCode"
      :js-code="jsNoSecCode"
    >
      <TimePicker v-model="timeNoSec" hide-seconds placeholder="请选择时间" />
    </DemoCard>
  </div>
</template>

<style lang="scss" scoped>
.page-desc {
  color: var(--text-secondary);
  margin-bottom: 32px;
  font-size: 15px;
}
</style>
