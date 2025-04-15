<template>
    <div class="empty-state">
      <div class="empty-icon">
        <i :class="icon"></i>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <div v-if="$slots.action" class="empty-action">
        <slot name="action"></slot>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'EmptyState',
    props: {
      icon: {
        type: String,
        default: 'el-icon-document'
      },
      title: {
        type: String,
        default: '暂无数据'
      },
      description: {
        type: String,
        default: '没有找到相关数据'
      }
    }
  }
  </script>
  
  <style scoped>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }
  
  .empty-icon {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 20px;
  }
  
  .empty-title {
    font-size: 18px;
    color: #333;
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .empty-description {
    font-size: 14px;
    color: #999;
    max-width: 300px;
    line-height: 1.6;
    margin-top: 0;
    margin-bottom: 20px;
  }
  
  .empty-action {
    margin-top: 10px;
  }
  </style>