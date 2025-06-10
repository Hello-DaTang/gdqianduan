<template>
  <!-- 这是一个逻辑组件，不渲染任何UI内容 -->
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { ref, computed, onMounted, provide } from 'vue'
import { useStore } from 'vuex'
import { detectDeviceType } from '@/utils/deviceTypes'

export default {
  name: 'DeviceDataProvider',
  setup() {
    const store = useStore()
    const loading = ref(false)
    
    // 设备数据
    const deviceList = computed(() => {
      // 确保deviceList是数组
      const list = Array.isArray(store.state.device.deviceList) 
        ? store.state.device.deviceList 
        : (store.state.device.deviceList?.rows || [])
      
      // 从设备中获取并添加类型信息
      return list.map(device => {
        // 检测设备类型
        const type = detectDeviceType(device.deviceData)
        return {
          ...device,
          type
        }
      })
    })
    
    // 连接设备数量
    const onlineDeviceCount = computed(() => {
      return deviceList.value.filter(device => device.deviceData?.status === 'on').length
    })
    
    // 离线设备数量
    const offlineDeviceCount = computed(() => {
      return deviceList.value.filter(device => device.deviceData?.status === 'off').length
    })
    
    // 获取设备数据
    const fetchDevices = async (forceRefresh = false) => {
      try {
        loading.value = true
        await store.dispatch('device/fetchDevices', { force: forceRefresh })
        return filterDeviceData(deviceList.value)
      } catch (error) {
        console.error('获取设备数据失败:', error)
        throw error
      } finally {
        loading.value = false
      }
    }
      // 过滤设备数据，移除不必要的字段
    const filterDeviceData = (devices) => {
      // 检查是否为有效数据
      if (!devices) return []
      
      // 确保是数组
      if (!Array.isArray(devices)) {
        console.log('设备数据非数组类型:', typeof devices)
        
        // 尝试查找是否有rows属性
        if (devices.rows && Array.isArray(devices.rows)) {
          devices = devices.rows
        } 
        // 尝试其他可能包含数组的属性
        else if (devices.data && Array.isArray(devices.data)) {
          devices = devices.data
        }
        // 如果仍然不是数组，返回空数组
        else {
          console.warn('无法从设备数据中提取有效数组', devices)
          return []
        }
      }
      
      return devices.map(device => {
        // 复制设备对象，避免修改原始数据
        const filteredDevice = { ...device }
        
        // 移除returnValue等不必要字段
        const fieldsToRemove = ['returnValue', 'return_value', 'return']
        fieldsToRemove.forEach(field => {
          delete filteredDevice[field]
        })
        
        return filteredDevice
      })
    }
    
    // 在组件挂载时预加载数据
    onMounted(async () => {
      try {
        await store.dispatch('device/fetchDevices')
      } catch (error) {
        console.error('预加载设备数据失败:', error)
      }
    })
    
    // 提供数据给子组件
    provide('deviceList', deviceList)
    provide('onlineDeviceCount', onlineDeviceCount)
    provide('offlineDeviceCount', offlineDeviceCount)
    provide('deviceLoading', loading)
    provide('fetchDevices', fetchDevices)
    
    return {
      deviceList,
      onlineDeviceCount,
      offlineDeviceCount,
      loading,
      fetchDevices
    }
  }
}
</script>
