<script setup lang="ts">
import { Calendar, CalendarDays, CalendarRange, Clock, Sparkles, Palette, Box, Zap } from 'lucide-vue-next';

const features = [
  {
    icon: Calendar,
    title: '多种选择模式',
    description: '支持日期、周、月、季度、年份等多种选择模式',
  },
  {
    icon: CalendarRange,
    title: '范围选择',
    description: '支持日期范围、周范围、月范围等范围选择',
  },
  {
    icon: Clock,
    title: '时间选择',
    description: '内置时间面板，支持时分秒选择',
  },
  {
    icon: Palette,
    title: 'TDesign 风格',
    description: '采用 TDesign 设计规范，美观大方',
  },
  {
    icon: Box,
    title: '框架无关',
    description: '核心库与框架无关，支持 Vue、React、原生 JS',
  },
  {
    icon: Zap,
    title: '高性能',
    description: '轻量级实现，无外部依赖，性能优异',
  },
];
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <div class="hero">
      <div class="hero-icon">
        <Calendar :size="48" />
      </div>
      <h1>LDesign DatePicker</h1>
      <p>一个功能强大、设计优雅的日期时间选择器组件库</p>
      <div class="hero-actions">
        <router-link to="/date" class="btn btn-primary">
          <Sparkles :size="16" />
          开始体验
        </router-link>
      </div>
    </div>
    
    <!-- Features -->
    <div class="features">
      <h2>特性</h2>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon">
            <component :is="feature.icon" :size="24" />
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </div>
    
    <!-- Demos -->
    <div class="demos-section">
      <h2>示例演示</h2>
      <div class="demos-grid">
        <router-link to="/date" class="demo-link">
          <Calendar :size="20" />
          <span>日期选择</span>
        </router-link>
        <router-link to="/week" class="demo-link">
          <CalendarDays :size="20" />
          <span>周选择</span>
        </router-link>
        <router-link to="/range" class="demo-link">
          <CalendarRange :size="20" />
          <span>范围选择</span>
        </router-link>
        <router-link to="/datetime" class="demo-link">
          <Clock :size="20" />
          <span>日期时间</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 60px 0;
  
  .hero-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background-color: var(--primary-light);
    color: var(--primary-color);
    border-radius: 20px;
    margin-bottom: 24px;
  }
  
  h1 {
    font-size: 36px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 12px;
  }
  
  p {
    font-size: 18px;
    color: var(--text-secondary);
    margin: 0 0 32px;
  }
  
  .hero-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}

.features {
  padding: 40px 0;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 32px;
    text-align: center;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background-color: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 24px;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow);
  }
  
  .feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: var(--primary-light);
    color: var(--primary-color);
    border-radius: 12px;
    margin-bottom: 16px;
  }
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px;
  }
  
  p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }
}

.demos-section {
  padding: 40px 0;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 32px;
    text-align: center;
  }
}

.demos-grid {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.demo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: var(--bg-container);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
