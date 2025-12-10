<script setup lang="ts">
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import DemoCard from '@/components/DemoCard.vue';

const quarter = ref<Date | null>(null);

const vueCode = `<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const quarter = ref(null);
<\/script>

<template>
  <DatePicker v-model="quarter" mode="quarter" />
</template>`;

const jsCode = `import { createDatePicker } from '@ldesign/datepicker-core';

const picker = createDatePicker({
  mode: 'quarter',
  onChange: (value, formatted) => {
    console.log('选中季度:', formatted);
  },
});

picker.mount('#container');`;
</script>

<template>
  <div class="quarter-demo">
    <p class="page-desc">季度选择器用于选择年度季度（Q1-Q4）。</p>
    
    <DemoCard
      title="季度选择"
      description="选择一个季度，格式为'年份-Q季度'。"
      :vue-code="vueCode"
      :js-code="jsCode"
    >
      <DatePicker v-model="quarter" mode="quarter" placeholder="请选择季度" />
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
