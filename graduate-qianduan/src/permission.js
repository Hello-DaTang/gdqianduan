import router from './router'

// 路由守卫
router.beforeEach((to, from, next) => {
  const hasToken = localStorage.getItem('smart_home_token')

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' }) // 已登录用户重定向到首页
    } else {
      next() // 继续访问
    }
  } else {
    if (to.path === '/login') {
      next() // 未登录用户可以访问登录页
    } else {
      next(`/login?redirect=${to.path}`) // 未登录用户重定向到登录页
    }
  }
})
