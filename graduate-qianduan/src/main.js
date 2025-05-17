import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.css' // 引入新创建的样式文件
import './permission' // 权限控制
import './assets/styles/variables.scss'
import timerService from './services/timerService' // 引入定时器服务

const app = createApp(App)

app.use(store).use(router).use(ElementPlus)
app.mount('#app')

// 启动定时器服务
timerService.start()