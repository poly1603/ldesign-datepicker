<script setup lang="ts">
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import DemoCard from '@/components/DemoCard.vue';

const week = ref<Date | null>(null);

const vueCode = `<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const week = ref(null);
<\/script>

<template>
  <DatePicker v-model="week" mode="week" show-week-number />
</template>`;

const jsCode = `import { createDatePicker } from '@ldesign/datepicker-core';

const picker = createDatePicker({
  mode: 'week',
  showWeekNumber: true,
  onChange: (value, formatted) => {
    console.log('选中周:', formatted);
  },
});

picker.mount('#container');`;
</script>

<template>
  <div class="week-demo">
    <p class="page-desc">周选择器用于选择一个完整的周。</p>
    
    <DemoCard
      title="周选择"
      description="选择一整周，显示周数，格式为'年份-周数'。"
      :vue-code="vueCode"
      :js-code="jsCode"
    >
      <DatePicker v-model="week" mode="week" show-week-number placeholder="请选择周" />
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
