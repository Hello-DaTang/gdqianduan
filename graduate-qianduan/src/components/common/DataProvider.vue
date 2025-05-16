<template>
  <!-- 这是一个逻辑组件，不渲染任何UI内容 -->
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { ref, computed, onMounted, provide } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'DataProvider',
  setup() {
    const store = useStore()
    const loading = ref({
      devices: false,
      weather: false,
      operateLogs: false
    })
    
    // 设备数据
    const deviceList = computed(() => {
      // 确保deviceList是数组
      const list = Array.isArray(store.state.device.deviceList) 
        ? store.state.device.deviceList 
        : (store.state.device.deviceList?.rows || [])
      return list
    })
    
    // 天气数据
    const weatherData = computed(() => store.state.weather.weatherData)
    
    // 操作日志数据
    const operateLogs = computed(() => store.state.operatelog.operateLogs)
    
    // 加载状态
    const isLoading = computed(() => {
      return loading.value.devices || loading.value.weather || loading.value.operateLogs
    })
    
    // 过滤掉原始数据中的return value
    const filterReturnValues = (data) => {
      if (!data) return data
      
      if (Array.isArray(data)) {
        return data.map(item => filterReturnValues(item))
      }
      
      if (typeof data === 'object' && data !== null) {
        const result = {}
        for (const key in data) {
          // 排除return value相关字段
          if (key !== 'returnValue' && 
              key !== 'return_value' && 
              key !== 'return' && 
              !key.includes('returnValue')) {
            result[key] = filterReturnValues(data[key])
          }
        }
        return result
      }
      
      return data
    }
    
    // 获取所有聊天上下文数据
    const getChatContextData = async (forceRefresh = false) => {
      try {
        // 标记加载状态
        loading.value = {
          devices: true,
          weather: true,
          operateLogs: true
        }
        
        // 并行加载所有数据
        await Promise.all([
          store.dispatch('device/fetchDevices', { force: forceRefresh }),
          store.dispatch('weather/fetchWeather', { force: forceRefresh }),
          store.dispatch('operatelog/fetchOperateLogs', { force: forceRefresh })
        ])
        
        // 准备过滤后的数据
        const filteredDevices = filterReturnValues(deviceList.value)
        const filteredWeather = filterReturnValues(weatherData.value)
        const filteredLogs = filterReturnValues(operateLogs.value)
        
        // 构建聊天上下文数据
        return {
          devices: filteredDevices,
          weather: filteredWeather,
          operateLogs: filteredLogs
        }
      } catch (error) {
        console.error('获取聊天上下文数据失败:', error)
        throw error
      } finally {
        // 清除加载状态
        loading.value = {
          devices: false,
          weather: false,
          operateLogs: false
        }
      }
    }
    
    // 简单加载数据
    const loadData = async () => {
      try {
        // 并行加载所有数据
        await Promise.all([
          store.dispatch('device/fetchDevices'),
          store.dispatch('weather/fetchWeather'),
          store.dispatch('operatelog/fetchOperateLogs')
        ])
      } catch (error) {
        console.error('预加载数据失败:', error)
      }
    }
    
    // 在组件挂载时预加载数据
    onMounted(loadData)
    
    // 提供数据给子组件
    provide('deviceList', deviceList)
    provide('weatherData', weatherData)
    provide('operateLogs', operateLogs)
    provide('isLoading', isLoading)
    provide('getChatContextData', getChatContextData)
    
    return {
      deviceList,
      weatherData,
      operateLogs,
      isLoading,
      getChatContextData
    }
  }
}
</script>
