<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  LayoutGrid,
  Hash,
  Layers,
  ListChecks,
  Home,
  Github,
  Menu,
  X,
} from 'lucide-vue-next';

const route = useRoute();
const sidebarOpen = ref(true);

const navItems = [
  { path: '/', name: '首页', icon: Home },
  { path: '/date', name: '日期选择', icon: Calendar },
  { path: '/week', name: '周选择', icon: CalendarDays },
  { path: '/month', name: '月份选择', icon: LayoutGrid },
  { path: '/quarter', name: '季度选择', icon: Hash },
  { path: '/year', name: '年份选择', icon: Layers },
  { path: '/range', name: '范围选择', icon: CalendarRange },
  { path: '/datetime', name: '日期时间', icon: Clock },
  { path: '/time', name: '时间选择', icon: Clock },
  { path: '/multiple', name: '多选', icon: ListChecks },
];

const currentNav = computed(() => {
  return navItems.find(item => item.path === route.path);
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
</script>

<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <Calendar :size="24" />
          <span v-if="sidebarOpen">DatePicker</span>
        </div>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <X v-if="sidebarOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <component :is="item.icon" :size="20" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <a
          href="https://github.com/nicepkg/ldesign"
          target="_blank"
          class="nav-item"
        >
          <Github :size="20" />
          <span v-if="sidebarOpen">GitHub</span>
        </a>
      </div>
    </aside>
    
    <!-- 主内容区 -->
    <main class="main-content">
      <header class="content-header">
        <h1>{{ currentNav?.name || 'DatePicker' }}</h1>
      </header>
      
      <div class="content-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-page);
}

.sidebar {
  width: 240px;
  background-color: var(--bg-container);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-collapsed .sidebar {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 18px;
  color: var(--primary-color);
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }
  
  &.active {
    background-color: var(--primary-light);
    color: var(--primary-color);
  }
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid var(--border-color);
}

.main-content {
  flex: 1;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
}

.sidebar-collapsed .main-content {
  margin-left: 64px;
}

.content-header {
  padding: 24px 32px;
  background-color: var(--bg-container);
  border-bottom: 1px solid var(--border-color);
  
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.content-body {
  padding: 32px;
}
</style>
