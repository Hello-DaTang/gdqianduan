<template>
    <div class="breadcrumb-nav">
      <template v-for="(item, index) in items">
        <!-- 使用 v-if 和一个唯一 key -->
        <span 
          v-if="index > 0" 
          :key="`separator-${index}`" 
          class="separator"
        >/</span>
        
        <router-link 
          v-if="item.path && index !== items.length - 1" 
          :key="`link-${index}`"
          :to="item.path" 
          class="breadcrumb-item"
        >
          <i v-if="item.icon" :class="item.icon"></i>
          {{ item.text }}
        </router-link>
        
        <span 
          v-else 
          :key="`text-${index}`"
          class="breadcrumb-item current"
        >
          <i v-if="item.icon" :class="item.icon"></i>
          {{ item.text }}
        </span>
      </template>
    </div>
  </template>
  
  <script>
  export default {
    name: 'BreadcrumbNav',
    props: {
      items: {
        type: Array,
        required: true,
        validator: items => items.every(item => item.text)
      }
    }
  }
  </script>
  
  <style scoped>
  .breadcrumb-nav {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    font-size: 14px;
  }
  
  .breadcrumb-item {
    color: #666;
    transition: color 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  
  .breadcrumb-item i {
    margin-right: 5px;
  }
  
  .breadcrumb-item:hover {
    color: #4285F4;
  }
  
  .breadcrumb-item.current {
    color: #333;
    font-weight: 500;
  }
  
  .separator {
    margin: 0 8px;
    color: #ccc;
  }
  </style>