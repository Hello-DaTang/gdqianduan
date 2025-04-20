import { getWeather } from '@/api/weather'

const state = {
  weatherData: {},
  currentCity: '沈阳市', // 默认城市
  lastFetchTime: 0,
  fetchInterval: 30 * 60 * 1000, // 30分钟的缓存时间
  loading: false
}

const mutations = {
  SET_WEATHER_DATA(state, data) {
    state.weatherData = data
  },
  SET_CURRENT_CITY(state, city) {
    state.currentCity = city
  },
  SET_LAST_FETCH_TIME(state, time) {
    state.lastFetchTime = time
  },
  SET_LOADING(state, status) {
    state.loading = status
  }
}

const actions = {
  // 获取天气数据，支持缓存
  async fetchWeather({ commit, state }, { city = state.currentCity, force = false } = {}) {
    const now = Date.now()
    
    // 如果请求的是当前缓存的城市且数据未过期，直接返回缓存数据
    if (!force && 
        city === state.currentCity && 
        Object.keys(state.weatherData).length > 0 && 
        now - state.lastFetchTime < state.fetchInterval) {
      return state.weatherData
    }
    
    // 否则重新获取数据
    try {
      commit('SET_LOADING', true)
      commit('SET_CURRENT_CITY', city)
      
      const response = await getWeather(city)
      // 修正这里：API成功返回码应为0而不是1
      if (response.data && response.data.code === 0 && response.data.data) {
        commit('SET_WEATHER_DATA', response.data.data)
        commit('SET_LAST_FETCH_TIME', now)
      } else {
        console.warn('获取天气数据失败:', response.data)
      }
      
      commit('SET_LOADING', false)
      return state.weatherData
    } catch (error) {
      console.error('获取天气数据失败:', error)
      commit('SET_LOADING', false)
      throw error
    }
  },
  
  // 切换城市
  async changeCity({ dispatch }, city) {
    await dispatch('fetchWeather', { city, force: true })
    return true
  }
}

const getters = {
  weatherData: state => state.weatherData,
  currentCity: state => state.currentCity,
  currentTemperature: state => {
    if (state.weatherData && state.weatherData.current) {
      return state.weatherData.current.temperature
    }
    return null
  },
  weatherDesc: state => {
    if (state.weatherData && state.weatherData.current) {
      return state.weatherData.current.weather
    }
    return ''
  },
  isWeatherLoading: state => state.loading
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}