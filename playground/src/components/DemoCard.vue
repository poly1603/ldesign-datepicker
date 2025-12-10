<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Code, Eye, Copy, Check } from 'lucide-vue-next';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markup';

const props = defineProps<{
  title: string;
  description?: string;
  vueCode: string;
  jsCode: string;
}>();

const activeTab = ref<'preview' | 'vue' | 'js'>('preview');
const showCode = ref(false);
const copied = ref(false);

const highlightedVueCode = computed(() => {
  return Prism.highlight(props.vueCode.trim(), Prism.languages.markup, 'markup');
});

const highlightedJsCode = computed(() => {
  return Prism.highlight(props.jsCode.trim(), Prism.languages.typescript, 'typescript');
});

const copyCode = async () => {
  const code = activeTab.value === 'vue' ? props.vueCode : props.jsCode;
  await navigator.clipboard.writeText(code.trim());
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};

const toggleCode = () => {
  showCode.value = !showCode.value;
  if (showCode.value && activeTab.value === 'preview') {
    activeTab.value = 'vue';
  }
};
</script>

<template>
  <div class="demo-card">
    <div class="demo-card-header">
      <div class="demo-card-title">
        <h3>{{ title }}</h3>
        <p v-if="description">{{ description }}</p>
      </div>
      <div class="demo-card-actions">
        <button class="btn btn-text btn-sm" @click="toggleCode">
          <Code :size="16" />
          {{ showCode ? '隐藏代码' : '查看代码' }}
        </button>
      </div>
    </div>
    
    <div class="demo-card-body">
      <!-- 预览区域 -->
      <div class="demo-preview">
        <slot />
      </div>
      
      <!-- 代码区域 -->
      <div v-if="showCode" class="demo-code">
        <div class="demo-code-tabs">
          <button
            class="demo-code-tab"
            :class="{ active: activeTab === 'vue' }"
            @click="activeTab = 'vue'"
          >
            Vue 组件
          </button>
          <button
            class="demo-code-tab"
            :class="{ active: activeTab === 'js' }"
            @click="activeTab = 'js'"
          >
            原生 JS
          </button>
          <button class="demo-code-copy" @click="copyCode">
            <Check v-if="copied" :size="14" />
            <Copy v-else :size="14" />
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>
        
        <div class="demo-code-content">
          <pre v-if="activeTab === 'vue'"><code class="language-markup" v-html="highlightedVueCode"></code></pre>
          <pre v-if="activeTab === 'js'"><code class="language-typescript" v-html="highlightedJsCode"></code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-card {
  background-color: var(--bg-container);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
  overflow: hidden;
}

.demo-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.demo-card-title {
  h3 {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  p {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary);
  }
}

.demo-card-actions {
  display: flex;
  gap: 8px;
}

.demo-card-body {
  padding: 0;
}

.demo-preview {
  padding: 32px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.demo-code {
  border-top: 1px solid var(--border-color);
}

.demo-code-tabs {
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: var(--bg-page);
  border-bottom: 1px solid var(--border-color);
}

.demo-code-tab {
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
  
  &:hover {
    color: var(--text-primary);
  }
  
  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
}

.demo-code-copy {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.demo-code-content {
  max-height: 400px;
  overflow: auto;
  
  pre {
    margin: 0;
    padding: 16px 24px;
    background-color: var(--bg-code) !important;
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
