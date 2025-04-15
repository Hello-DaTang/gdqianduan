<template>
    <div class="modern-card" :class="{ 'no-padding': noPadding, 'hoverable': hoverable }">
      <div v-if="$slots.header || title" class="card-header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <slot name="header"></slot>
        <div v-if="$slots.headerActions" class="header-actions">
          <slot name="headerActions"></slot>
        </div>
      </div>
      
      <div class="card-body" :class="{ 'has-header': $slots.header || title }">
        <slot></slot>
      </div>
      
      <div v-if="$slots.footer" class="card-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ModernCard',
    props: {
      title: {
        type: String,
        default: ''
      },
      noPadding: {
        type: Boolean,
        default: false
      },
      hoverable: {
        type: Boolean,
        default: false
      }
    }
  }
  </script>
  
  <style scoped>
  .modern-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.18);
    margin-bottom: 20px;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .modern-card.hoverable:hover {
    box-shadow: 0 12px 42px rgba(31, 38, 135, 0.15);
    transform: translateY(-5px);
  }
  
  .card-header {
    padding: 20px 25px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .card-body {
    padding: 25px;
  }
  
  .card-body.has-header {
    padding-top: 20px;
  }
  
  .no-padding .card-body {
    padding: 0;
  }
  
  .card-footer {
    padding: 15px 25px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    background: rgba(0, 0, 0, 0.02);
  }
  </style>