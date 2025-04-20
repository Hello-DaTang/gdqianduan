import { getAllHomes, updateHome } from '@/api/device'

const state = {
  deviceList: [],
  lastFetchTime: 0,
  fetchInterval: 5 * 60 * 1000, // 5分钟的缓存时间
  loading: false
}

const mutations = {
  SET_DEVICE_LIST(state, devices) {
    state.deviceList = devices
  },
  SET_LAST_FETCH_TIME(state, time) {
    state.lastFetchTime = time
  },
  SET_LOADING(state, status) {
    state.loading = status
  }
}

const actions = {
  // 获取所有设备数据，支持缓存
  // eslint-disable-next-line no-unused-vars
  async fetchDevices({ commit, state, dispatch }, { force = false } = {}) {
    const now = Date.now()
    // 如果数据已存在且未过期，直接返回缓存数据
    if (!force && state.deviceList.length > 0 && now - state.lastFetchTime < state.fetchInterval) {
      return state.deviceList
    }
    
    // 否则重新获取数据
    try {
      commit('SET_LOADING', true)
      const response = await getAllHomes()
      if (response.data.code === 1 && response.data.data) {
        // 处理API返回的数据结构，确保deviceList始终是数组
        const deviceData = response.data.data
        const deviceList = Array.isArray(deviceData) ? deviceData : (deviceData.rows || [])
        
        commit('SET_DEVICE_LIST', deviceList)
        commit('SET_LAST_FETCH_TIME', now)
      }
      commit('SET_LOADING', false)
      return state.deviceList
    } catch (error) {
      console.error('获取设备数据失败:', error)
      commit('SET_LOADING', false)
      throw error
    }
  },
  
  // 更新设备数据
  async updateDevice({ dispatch }, deviceData) {
    try {
      await updateHome(deviceData)
      // 更新后重新获取最新设备列表
      await dispatch('fetchDevices', { force: true })
      return true
    } catch (error) {
      console.error('更新设备失败:', error)
      throw error
    }
  }
}

const getters = {
  deviceList: state => state.deviceList,
  deviceById: state => id => state.deviceList.find(device => device.id === id),
  devicesByType: state => type => state.deviceList.filter(device => device.type === type),
  isDeviceLoading: state => state.loading
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}