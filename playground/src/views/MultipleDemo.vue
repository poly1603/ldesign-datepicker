<script setup lang="ts">
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import DemoCard from '@/components/DemoCard.vue';

const dates = ref<Date[]>([]);

const vueCode = `<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const dates = ref([]);
<\/script>

<template>
  <DatePicker v-model="dates" selection-type="multiple" />
</template>`;

const jsCode = `import { createDatePicker } from '@ldesign/datepicker-core';

const picker = createDatePicker({
  mode: 'date',
  selectionType: 'multiple',
  onChange: (value, formatted) => {
    console.log('选中日期:', formatted);
  },
});

picker.mount('#container');`;
</script>

<template>
  <div class="multiple-demo">
    <p class="page-desc">多选模式允许选择多个日期。</p>
    
    <DemoCard
      title="多选日期"
      description="点击可选择或取消选择多个日期。"
      :vue-code="vueCode"
      :js-code="jsCode"
    >
      <DatePicker
        v-model="dates"
        selection-type="multiple"
        placeholder="请选择日期"
      />
      <div v-if="dates.length" class="selected-info">
        已选择 {{ dates.length }} 个日期
      </div>
    </DemoCard>
  </div>
</template>

<style lang="scss" scoped>
.page-desc {
  color: var(--text-secondary);
  margin-bottom: 32px;
  font-size: 15px;
}

.selected-info {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: var(--primary-light);
  color: var(--primary-color);
  border-radius: 4px;
  font-size: 13px;
}
</style>
