<template>
    <div class="status-badge" :class="[type, size]">
      <span v-if="dot" class="status-dot"></span>
      <slot>{{ text }}</slot>
    </div>
  </template>
  
  <script>
  export default {
    name: 'StatusBadge',
    props: {
      type: {
        type: String,
        default: 'default',
        validator: value => ['success', 'warning', 'danger', 'info', 'default', 'primary'].includes(value)
      },
      size: {
        type: String,
        default: 'medium',
        validator: value => ['small', 'medium', 'large'].includes(value)
      },
      text: {
        type: String,
        default: ''
      },
      dot: {
        type: Boolean,
        default: false
      }
    }
  }
  </script>
  
  <style scoped>
  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0 10px;
    border-radius: 12px;
    font-weight: 500;
    line-height: 1;
  }
  
  .status-badge.small {
    height: 20px;
    font-size: 12px;
  }
  
  .status-badge.medium {
    height: 24px;
    font-size: 13px;
  }
  
  .status-badge.large {
    height: 28px;
    font-size: 14px;
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    display: inline-block;
  }
  
  .status-badge.success {
    background-color: rgba(52, 168, 83, 0.1);
    color: #34A853;
  }
  
  .status-badge.success .status-dot {
    background-color: #34A853;
  }
  
  .status-badge.warning {
    background-color: rgba(251, 188, 5, 0.1);
    color: #FBBC05;
  }
  
  .status-badge.warning .status-dot {
    background-color: #FBBC05;
  }
  
  .status-badge.danger {
    background-color: rgba(234, 67, 53, 0.1);
    color: #EA4335;
  }
  
  .status-badge.danger .status-dot {
    background-color: #EA4335;
  }
  
  .status-badge.info {
    background-color: rgba(66, 133, 244, 0.1);
    color: #4285F4;
  }
  
  .status-badge.info .status-dot {
    background-color: #4285F4;
  }
  
  .status-badge.primary {
    background-color: rgba(66, 133, 244, 0.1);
    color: #4285F4;
  }
  
  .status-badge.primary .status-dot {
    background-color: #4285F4;
  }
  
  .status-badge.default {
    background-color: rgba(0, 0, 0, 0.05);
    color: #666;
  }
  
  .status-badge.default .status-dot {
    background-color: #999;
  }
  </style>