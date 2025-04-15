<template>
    <div class="modern-page-container">
      <!-- 波浪背景动画 -->
      <div class="wave-container">
        <div class="wave wave1"></div>
        <div class="wave wave2"></div>
        <div class="wave wave3"></div>
      </div>
      
      <!-- 主要内容 -->
      <div class="page-content">
        <!-- 面包屑导航 (如果提供) -->
        <breadcrumb-nav v-if="breadcrumbs && breadcrumbs.length" :items="breadcrumbs" />
        
        <!-- 页面标题 -->
        <div v-if="title" class="page-header">
          <h2 class="page-title">{{ title }}</h2>
          <div v-if="$slots.headerActions" class="page-actions">
            <slot name="headerActions"></slot>
          </div>
        </div>
        
        <!-- 页面内容 -->
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script>
  import BreadcrumbNav from '@/components/navigation/BreadcrumbNav.vue'
  
  export default {
    name: 'ModernPageContainer',
    components: {
      BreadcrumbNav
    },
    props: {
      title: {
        type: String,
        default: ''
      },
      breadcrumbs: {
        type: Array,
        default: () => []
      }
    }
  }
  </script>
  
  <style scoped>
  .modern-page-container {
    min-height: calc(100vh - 84px);
    position: relative;
    background-color: #f5f6fa;
    overflow: hidden;
    padding: 20px;
  }
  
  .wave-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;
    overflow: hidden;
  }
  
  .wave {
    position: absolute;
    width: 200%;
    height: 200%;
    bottom: -100%;
    left: -50%;
    border-radius: 40%;
    animation: wave 15s infinite linear;
    opacity: 0.1;
  }
  
  .wave1 {
    background-color: rgba(66, 133, 244, 0.3);
    animation-duration: 15s;
  }
  
  .wave2 {
    background-color: rgba(52, 168, 83, 0.2);
    animation-duration: 18s;
    animation-delay: -2s;
  }
  
  .wave3 {
    background-color: rgba(234, 67, 53, 0.1);
    animation-duration: 20s;
    animation-delay: -5s;
  }
  
  @keyframes wave {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .page-content {
    position: relative;
    z-index: 1;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  </style>