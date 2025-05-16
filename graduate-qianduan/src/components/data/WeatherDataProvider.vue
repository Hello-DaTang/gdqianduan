<template>
  <!-- 这是一个逻辑组件，不渲染任何UI内容 -->
  <slot></slot>
</template>

<script>
import { ref, computed, onMounted, provide } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'WeatherDataProvider',
  setup() {
    const store = useStore()
    const loading = ref(false)
    
    // 天气数据
    const weatherData = computed(() => store.state.weather.weatherData)
    
    // 获取今日天气
    const todayWeather = computed(() => {
      if (!weatherData.value || !weatherData.value.daily || !weatherData.value.daily.length) {
        return null
      }
      return weatherData.value.daily[0]
    })
    
    // 获取天气数据
    const fetchWeather = async (forceRefresh = false) => {
      try {
        loading.value = true
        await store.dispatch('weather/fetchWeather', { force: forceRefresh })
        return filterWeatherData(weatherData.value)
      } catch (error) {
        console.error('获取天气数据失败:', error)
        throw error
      } finally {
        loading.value = false
      }
    }
      // 过滤天气数据，移除不必要的字段
    const filterWeatherData = (weather) => {
      if (!weather) return null
      
      // 检查数据类型
      console.log('天气数据类型:', typeof weather)
      
      // 创建一个深拷贝
      let filtered
      try {
        filtered = JSON.parse(JSON.stringify(weather))
      } catch (error) {
        console.error('天气数据序列化失败:', error)
        return null
      }
      
      // 递归清理对象
      const cleanObj = (obj) => {
        if (!obj || typeof obj !== 'object') return obj
        
        // 如果是数组，递归处理每个元素
        if (Array.isArray(obj)) {
          return obj.map(item => cleanObj(item))
        }
        
        // 处理对象
        const newObj = {}
        for (const key in obj) {
          // 跳过returnValue等字段
          if (key !== 'returnValue' && key !== 'return_value' && key !== 'return' && !key.includes('returnValue')) {
            newObj[key] = cleanObj(obj[key])
          }
        }
        return newObj
      }
      
      try {
        return cleanObj(filtered)
      } catch (error) {
        console.error('天气数据过滤失败:', error)
        return null
      }
    }
    
    // 在组件挂载时预加载数据
    onMounted(async () => {
      try {
        await store.dispatch('weather/fetchWeather')
      } catch (error) {
        console.error('预加载天气数据失败:', error)
      }
    })
    
    // 提供数据给子组件
    provide('weatherData', weatherData)
    provide('todayWeather', todayWeather)
    provide('weatherLoading', loading)
    provide('fetchWeather', fetchWeather)
    
    return {
      weatherData,
      todayWeather,
      loading,
      fetchWeather
    }
  }
}
</script>
