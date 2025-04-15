import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import DashboardView from '../views/dashboard/index.vue'
import NotFound from '../views/404/index.vue'
import LoginView from '../views/login/index.vue'
import ChatView from '../views/chat/index.vue'
import DeviceView from '../views/device/index.vue'
import ProfileView from '../views/profile/index.vue'
import WeatherView from '../views/weather/index.vue'
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: Layout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/devices',
    name: 'devices',
    component: Layout,
    children: [
      {
        path: '',
        name: 'DeviceView',
        component: DeviceView,
        meta: { title: '设备管理', icon: 'home' }
      }
    ]
  },
  {
    path: '/chat',
    name: 'chat',
    component: Layout,
    children: [
      {
        path: '',
        name: 'ChatView',
        component: ChatView,
        meta: { title: '智能助手', icon: 'comment' }
      }
    ]
  },
  {
    path: '/weather',
    name: 'weather',
    component: Layout,
    children: [
      {
        path: '',
        name: 'WeatherView',
        component: WeatherView,
        meta: { title: '天气预报', icon: 'sun' }
      }
    ]
  },
  {
    path: '/profile',
    name: 'profile',
    component: Layout,
    children: [
      {
        path: '',
        name: 'ProfileView',
        component: ProfileView,
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  // 404页面必须放在最后
  { path: '/:pathMatch(.*)*', redirect: '/404' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 修改全局前置守卫逻辑
router.beforeEach((to, from, next) => {
  const hasToken = localStorage.getItem('smart_home_token')

  // 如果已经登录且要去登录页，直接进入首页
  if (to.path === '/login' && hasToken) {
    next('/home')
    return
  }
  
  // 未登录状态，如果不是访问登录页，则重定向到登录页
  if (!hasToken && to.path !== '/login') {
    next('/login')
    return
  }
  
  // 其他情况正常放行
  next()
})

export default router
