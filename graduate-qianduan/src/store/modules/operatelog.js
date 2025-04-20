import { getUserOperate } from '@/api/operatelog'

const state = {
  operateLogs: [],
  lastFetchTime: 0,
  fetchInterval: 10 * 60 * 1000, // 10分钟的缓存时间
  loading: false
}

const mutations = {
  SET_OPERATE_LOGS(state, logs) {
    state.operateLogs = logs
  },
  SET_LAST_FETCH_TIME(state, time) {
    state.lastFetchTime = time
  },
  SET_LOADING(state, status) {
    state.loading = status
  }
}

const actions = {
  // 获取用户操作日志，支持缓存
  async fetchOperateLogs({ commit, state }, { force = false } = {}) {
    const now = Date.now()
    
    // 如果数据已存在且未过期，直接返回缓存数据
    if (!force && 
        state.operateLogs.length > 0 && 
        now - state.lastFetchTime < state.fetchInterval) {
      return state.operateLogs
    }
    
    // 否则重新获取数据
    try {
      commit('SET_LOADING', true)
      
      const response = await getUserOperate()
      if (response.data.code === 1 && response.data.data) {
        commit('SET_OPERATE_LOGS', response.data.data)
        commit('SET_LAST_FETCH_TIME', now)
      }
      
      commit('SET_LOADING', false)
      return state.operateLogs
    } catch (error) {
      console.error('获取操作日志失败:', error)
      commit('SET_LOADING', false)
      throw error
    }
  }
}

const getters = {
  operateLogs: state => state.operateLogs,
  latestOperates: state => (count = 5) => state.operateLogs.slice(0, count),
  operatesByDevice: state => deviceId => state.operateLogs.filter(log => log.deviceId === deviceId),
  isOperateLoading: state => state.loading
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}