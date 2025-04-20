import { createStore } from 'vuex' // 确保按需导入 createStore
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import device from './modules/device'
import weather from './modules/weather'
import operatelog from './modules/operatelog'

const store = createStore({
  modules: {
    app,
    settings,
    user,
    device,
    weather,
    operatelog
  },
  getters
})

export default store
