<template>
<div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{'is-collapsed': isCollapsed}">
      <div class="logo-container">
        <img src="@/assets/images/login/logo.png" alt="Logo" class="logo">
        <h2 v-if="!isCollapsed" class="system-title">智能家居管理系统</h2>
      </div>
      
      <!-- 波浪背景动画 -->
      <div class="sidebar-wave-container">
        <div class="sidebar-wave wave1"></div>
        <div class="sidebar-wave wave2"></div>
      </div>
      
      <!-- 菜单 -->
      <el-scrollbar class="scrollbar-wrapper">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapsed"
          background-color="transparent"
          text-color="#ffffff"
          active-text-color="#ffffff"
          :collapse-transition="false"
          mode="vertical"
          router
        >
          <!-- 首页 -->
          <el-menu-item index="/home">
            <i class="el-icon-s-home"></i>
            <span>首页</span>
          </el-menu-item>
          
          <!-- 设备管理 -->
          <el-menu-item index="/devices">
            <i class="el-icon-cpu"></i>
            <span>设备管理</span>
          </el-menu-item>
          
          <!-- 智能助手 -->
          <el-menu-item index="/chat">
            <i class="el-icon-chat-dot-round"></i>
            <span>智能助手</span>
          </el-menu-item>
          
          <!-- 天气预报 -->
          <el-menu-item index="/weather">
            <i class="el-icon-partly-cloudy"></i>
            <span>天气预报</span>
          </el-menu-item>
          
          <!-- 个人中心 -->
          <el-menu-item index="/profile">
            <i class="el-icon-user"></i>
            <span>个人中心</span>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
      
      <div class="sidebar-footer">
        <div class="user-info">
          <el-avatar 
            :size="32" 
            :src="userInfo.avatar || ''"
            @error="() => true">
            {{ userInfo.username ? userInfo.username.substring(0, 1).toUpperCase() : 'U' }}
          </el-avatar>
          <span v-if="!isCollapsed" class="username">{{ userInfo.username }}</span>
        </div>
        <el-tooltip :content="isCollapsed ? '展开菜单' : '收起菜单'" placement="right">
          <div class="collapse-btn" @click="toggleCollapse">
            <i :class="isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
          </div>
        </el-tooltip>
      </div>
    </div>
      
      <!-- 主区域 -->
      <div class="main-container" :class="{'is-collapsed': isCollapsed}">
        <!-- 头部区域 -->
        <div class="navbar">
          <div class="hamburger-container" @click="toggleCollapse">
            <i :class="isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
          </div>
          
          <breadcrumb-nav :items="breadcrumbs" />
          
          <div class="navbar-right">
            <el-badge is-dot class="notification-badge">
              <i class="el-icon-bell notification-icon"></i>
            </el-badge>
            
            <el-dropdown trigger="click">
              <div class="avatar-container">
                <el-avatar 
                  :size="32" 
                  :src="userInfo.avatar || ''"
                  @error="() => true">
                  {{ userInfo.username ? userInfo.username.substring(0, 1).toUpperCase() : 'U' }}
                </el-avatar>
                <i class="el-icon-caret-bottom"></i>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToProfile">
                    <i class="el-icon-user"></i> 个人中心
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="logout">
                    <i class="el-icon-switch-button"></i> 退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <!-- 内容区域 -->
        <div class="app-main">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import BreadcrumbNav from '@/components/navigation/BreadcrumbNav.vue'
  import { removeToken } from '@/utils/auth'
  import { getUserInfo } from '@/api/user' // 新增引入getUserInfo API

  export default {
    name: 'MainLayout',
    components: {
      BreadcrumbNav
    },
    setup() {
      const route = useRoute()
      const router = useRouter()
      const isCollapsed = ref(false)
      // 用户信息对象，包含用户名和头像
      const userInfo = ref({
        username: '智能用户',
        avatar: ''
      })
      
      // 获取用户信息方法
      const fetchUserInfo = async () => {
        try {
          const response = await getUserInfo()
          
          // 处理响应数据
          if (response && response.data.code === 1 && response.data) {
            userInfo.value = {
              username: response.data.data.name ||'智能用户',
              avatar: response.data.data.image || '' // 使用image作为头像
            }
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
        }
      }
      
      // 计算活动菜单
      const activeMenu = computed(() => {
        const { meta, path } = route
        if (meta.activeMenu) {
          return meta.activeMenu
        }
        return path
      })
    
      
      // 计算面包屑
      const breadcrumbs = computed(() => {
        // 从路由中获取面包屑数据
        const matched = route.matched.filter(item => item.meta && item.meta.title)
        
        // 添加首页
        const result = [{
          text: '首页',
          path: '/home',
          icon: 'el-icon-s-home'
        }]
        
        // 添加当前路径的面包屑
        matched.forEach(item => {
          if (item.meta && item.meta.title) {
            result.push({
              text: item.meta.title,
              path: item.path,
              icon: item.meta.icon
            })
          }
        })
        
        return result
      })
      
      // 切换折叠状态
      const toggleCollapse = () => {
        isCollapsed.value = !isCollapsed.value
      }
      
      // 前往个人中心
      const goToProfile = () => {
        router.push('/profile')
      }
      // 退出登录
      const logout = () => {
        removeToken()
        router.push('/login')
      }
      
      // 组件挂载时获取用户信息
      onMounted(() => {
        fetchUserInfo()
      })
      
      return {
        isCollapsed,
        userInfo, // 返回用户信息
        activeMenu,
        breadcrumbs,
        toggleCollapse,
        goToProfile, // 新增方法
        logout
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .app-wrapper {
    position: relative;
    height: 100vh;
    width: 100%;
    display: flex;
  }
  
  // 侧边栏样式
  .sidebar-container {
    width: 240px;
    height: 100%;
    background: rgba(48, 65, 86, 0.95);
    backdrop-filter: blur(8px);
    transition: width 0.3s;
    overflow: hidden;
    z-index: 1001;
    position: fixed;
    display: flex;
    flex-direction: column;
    
    &.is-collapsed {
      width: 64px;
    }
    
    // 侧边栏背景渐变
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, rgba(66, 133, 244, 0.15), transparent);
      z-index: 0;
      pointer-events: none;
    }
  }
  
  // 波浪背景动画
  .sidebar-wave-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;
    overflow: hidden;
    opacity: 0.05;
  }
  
  .sidebar-wave {
    position: absolute;
    width: 300%;
    height: 300%;
    top: -100%;
    left: -100%;
    border-radius: 40%;
    animation: sidebarWave 20s infinite linear;
  }
  
  .wave1 {
    background-color: rgba(66, 133, 244, 0.5);
    animation-duration: 25s;
  }
  
  .wave2 {
    background-color: rgba(52, 168, 83, 0.3);
    animation-duration: 30s;
    animation-delay: -5s;
  }
  
  @keyframes sidebarWave {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .logo-container {
    height: 64px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
    overflow: hidden;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .logo {
    height: 32px;
    width: 32px;
    border-radius: 50%;
    margin-right: 12px;
    animation: pulse 2s infinite;
  }
  
  .system-title {
    color: white;
    font-size: 18px;
    font-weight: 600;
    white-space: nowrap;
    margin: 0;
    background: linear-gradient(45deg, #fff 30%, #4285F4 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  // 滚动条美化
  .scrollbar-wrapper {
    flex: 1;
    overflow-x: hidden !important;
  
    :deep(.el-scrollbar__view) {
      height: 100%;
    }
  
    :deep(.el-scrollbar__bar.is-horizontal) {
      display: none;
    }
  
    :deep(.el-scrollbar__bar.is-vertical) {
      width: 6px;
      
      .el-scrollbar__thumb {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
  
  // 菜单样式
  :deep(.el-menu) {
    border-right: none;
    background-color: transparent !important;
  }
  
  :deep(.el-menu-item), 
  :deep(.el-submenu__title) {
    height: 50px;
    line-height: 50px;
    position: relative;
    color: rgba(255, 255, 255, 0.7) !important;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }
  }
  
  :deep(.el-menu-item.is-active) {
    color: white !important;
    background: linear-gradient(90deg, rgba(66, 133, 244, 0.3), rgba(66, 133, 244, 0.1)) !important;
    
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: #4285F4;
      border-radius: 2px 0 0 2px;
    }
    
    i {
      color: white !important;
    }
  }
  
  .sidebar-footer {
    height: 60px;
    padding: 0 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;
    color: white;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    
    .username {
      margin-left: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 140px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  .collapse-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    
    i {
      font-size: 20px;
    }
  }
  
  // 主区域样式
  .main-container {
    margin-left: 240px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    width: calc(100% - 240px);
    position: relative;
    overflow: auto;
    transition: margin-left 0.3s, width 0.3s;
    
    &.is-collapsed {
      margin-left: 64px;
      width: calc(100% - 64px);
    }
  }
  
  // 导航栏样式
  .navbar {
    height: 64px;
    padding: 0;
    position: relative;
    background-color: white;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
    display: flex;
    align-items: center;
  }
  
  .hamburger-container {
    padding: 0 16px;
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: background .3s;
    
    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
    padding-right: 16px;
    margin-left: auto;
  }
  
  .notification-badge {
    margin-right: 20px;
    cursor: pointer;
  }
  
  .notification-icon {
    font-size: 20px;
    color: #666;
  }
  
  .avatar-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    
    i {
      margin-left: 8px;
      color: #666;
    }
  }
  
  .app-main {
    flex: 1;
    padding: 20px;
    background-color: #f5f6fa;
    position: relative;
  }
  
  // 过渡动画
  .fade-transform-enter-active,
  .fade-transform-leave-active {
    transition: all 0.3s;
  }
  
  .fade-transform-enter-from {
    opacity: 0;
    transform: translateX(30px);
  }
  
  .fade-transform-leave-to {
    opacity: 0;
    transform: translateX(-30px);
  }
  
  // 动画效果
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(66, 133, 244, 0); }
    100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
  }
  </style>