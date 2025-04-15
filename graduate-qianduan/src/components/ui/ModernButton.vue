<template>
    <button 
      :class="['modern-button', type, size, { 'full-width': fullWidth, 'icon-only': iconOnly }]" 
      :disabled="disabled || loading"
      @click="$emit('click', $event)"
    >
      <i v-if="loading" class="el-icon-loading"></i>
      <i v-else-if="icon" :class="icon"></i>
      <span v-if="!iconOnly" class="button-text">
        <slot>{{ text }}</slot>
      </span>
      <span class="button-effect"></span>
    </button>
  </template>
  
  <script>
  export default {
    name: 'ModernButton',
    props: {
      type: {
        type: String,
        default: 'primary',
        validator: value => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'text'].includes(value)
      },
      size: {
        type: String,
        default: 'medium',
        validator: value => ['small', 'medium', 'large'].includes(value)
      },
      icon: {
        type: String,
        default: ''
      },
      text: {
        type: String,
        default: ''
      },
      loading: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      fullWidth: {
        type: Boolean,
        default: false
      },
      iconOnly: {
        type: Boolean,
        default: false
      }
    },
    emits: ['click']
  }
  </script>
  
  <style scoped>
  .modern-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0 20px;
    overflow: hidden;
    outline: none;
  }
  
  .modern-button i {
    margin-right: 8px;
  }
  
  .modern-button.icon-only {
    padding: 0;
    border-radius: 50%;
  }
  
  .modern-button.icon-only i {
    margin-right: 0;
  }
  
  .modern-button.small {
    height: 32px;
    font-size: 14px;
  }
  
  .modern-button.medium {
    height: 40px;
    font-size: 15px;
  }
  
  .modern-button.large {
    height: 48px;
    font-size: 16px;
  }
  
  .modern-button.icon-only.small {
    width: 32px;
  }
  
  .modern-button.icon-only.medium {
    width: 40px;
  }
  
  .modern-button.icon-only.large {
    width: 48px;
  }
  
  .modern-button.full-width {
    width: 100%;
  }
  
  .modern-button.primary {
    background: linear-gradient(45deg, #4285F4, #34A853);
    color: white;
    box-shadow: 0 4px 10px rgba(66, 133, 244, 0.3);
  }
  
  .modern-button.primary:hover {
    box-shadow: 0 6px 15px rgba(66, 133, 244, 0.4);
    transform: translateY(-1px);
  }
  
  .modern-button.primary:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
  }
  
  .modern-button.secondary {
    background: white;
    color: #4285F4;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
  }
  
  .modern-button.secondary:hover {
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .modern-button.success {
    background: linear-gradient(45deg, #34A853, #4CAF50);
    color: white;
    box-shadow: 0 4px 10px rgba(52, 168, 83, 0.3);
  }
  
  .modern-button.danger {
    background: linear-gradient(45deg, #EA4335, #F44336);
    color: white;
    box-shadow: 0 4px 10px rgba(234, 67, 53, 0.3);
  }
  
  .modern-button.warning {
    background: linear-gradient(45deg, #FBBC05, #FFC107);
    color: white;
    box-shadow: 0 4px 10px rgba(251, 188, 5, 0.3);
  }
  
  .modern-button.info {
    background: linear-gradient(45deg, #24C6DC, #514A9D);
    color: white;
    box-shadow: 0 4px 10px rgba(36, 198, 220, 0.3);
  }
  
  .modern-button.text {
    background: transparent;
    color: #4285F4;
    box-shadow: none;
    padding: 0 8px;
  }
  
  .modern-button.text:hover {
    color: #3367d6;
    background: rgba(66, 133, 244, 0.05);
  }
  
  .modern-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
  
  .button-effect {
    position: absolute;
    top: -50%;
    left: -25%;
    width: 150%;
    height: 200%;
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
    transform: rotate(45deg);
    transition: all 0.5s ease;
  }
  
  .modern-button:hover .button-effect {
    left: 100%;
  }
  </style>