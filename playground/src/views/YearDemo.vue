<script setup lang="ts">
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import DemoCard from '@/components/DemoCard.vue';

const year = ref<Date | null>(null);

const vueCode = `<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const year = ref(null);
<\/script>

<template>
  <DatePicker v-model="year" mode="year" />
</template>`;

const jsCode = `import { createDatePicker } from '@ldesign/datepicker-core';

const picker = createDatePicker({
  mode: 'year',
  onChange: (value, formatted) => {
    console.log('选中年份:', formatted);
  },
});

picker.mount('#container');`;
</script>

<template>
  <div class="year-demo">
    <p class="page-desc">年份选择器用于选择年份。</p>
    
    <DemoCard
      title="年份选择"
      description="选择一个年份。"
      :vue-code="vueCode"
      :js-code="jsCode"
    >
      <DatePicker v-model="year" mode="year" placeholder="请选择年份" />
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
