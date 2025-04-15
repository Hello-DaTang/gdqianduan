<template>
    <div class="loading-indicator" :class="size">
      <div v-if="type === 'dots'" class="loading-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <div v-else-if="type === 'spinner'" class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <div v-if="text" class="loading-text">{{ text }}</div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoadingIndicator',
    props: {
      type: {
        type: String,
        default: 'dots',
        validator: value => ['dots', 'spinner'].includes(value)
      },
      size: {
        type: String,
        default: 'medium',
        validator: value => ['small', 'medium', 'large'].includes(value)
      },
      text: {
        type: String,
        default: ''
      }
    }
  }
  </script>
  
  <style scoped>
  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .loading-dots {
    display: flex;
    align-items: center;
  }
  
  .dot {
    background-color: #4285F4;
    border-radius: 50%;
    margin: 0 3px;
    animation: bounce 1.5s infinite ease-in-out;
  }
  
  .small .dot {
    width: 6px;
    height: 6px;
  }
  
  .medium .dot {
    width: 8px;
    height: 8px;
  }
  
  .large .dot {
    width: 10px;
    height: 10px;
  }
  
  .dot:nth-child(1) { animation-delay: 0s; }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-10px); }
  }
  
  .loading-spinner {
    position: relative;
  }
  
  .spinner {
    border-radius: 50%;
    border-style: solid;
    border-color: #4285F4 transparent transparent transparent;
    animation: spin 1s linear infinite;
    box-sizing: border-box;
  }
  
  .small .spinner {
    width: 20px;
    height: 20px;
    border-width: 2px;
  }
  
  .medium .spinner {
    width: 30px;
    height: 30px;
    border-width: 3px;
  }
  
  .large .spinner {
    width: 40px;
    height: 40px;
    border-width: 4px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .loading-text {
    margin-top: 10px;
    color: #666;
  }
  
  .small .loading-text {
    font-size: 12px;
  }
  
  .medium .loading-text {
    font-size: 14px;
  }
  
  .large .loading-text {
    font-size: 16px;
  }
  </style>