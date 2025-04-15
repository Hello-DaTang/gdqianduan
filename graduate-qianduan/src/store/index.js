import { createStore } from 'vuex' // 确保按需导入 createStore
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'

const store = createStore({
  modules: {
    app,
    settings,
    user
  },
  getters
})

export default store
