<template>
  <!-- 这是一个逻辑组件，不渲染任何UI内容 -->
  <slot></slot>
</template>

<script>
import { ref, computed, onMounted, provide } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'LogDataProvider',
  setup() {
    const store = useStore()
    const loading = ref(false)
    
    // 操作日志数据
    const operateLogs = computed(() => store.state.operatelog.operateLogs)
    
    // 获取最近的操作日志
    const recentLogs = computed(() => {
      if (!operateLogs.value || !operateLogs.value.length) {
        return []
      }
      
      // 按时间排序，最新的在前
      return [...operateLogs.value].sort((a, b) => {
        return new Date(b.createTime) - new Date(a.createTime)
      }).slice(0, 10) // 获取最近10条
    })
      // 获取操作日志数据
    const fetchLogs = async (forceRefresh = false) => {
      try {
        loading.value = true
        
        // 调用store action获取数据
        const result = await store.dispatch('operatelog/fetchOperateLogs', { force: forceRefresh })
        console.log('获取到的操作日志数据类型:', typeof result, Array.isArray(result) ? '是数组' : '不是数组')
        
        // 使用安全的数据源 - 优先使用返回值，如果返回值有问题再用state中的数据
        const logsToFilter = result || operateLogs.value
        
        // 过滤数据
        const filteredData = filterLogData(logsToFilter)
        console.log('过滤后的操作日志数量:', filteredData.length)
        return filteredData
      } catch (error) {
        console.error('获取操作日志失败:', error)
        
        // 尝试使用现有的缓存数据作为备份
        if (operateLogs.value) {
          console.log('尝试使用缓存的操作日志数据')
          return filterLogData(operateLogs.value)
        }
        
        // 如果仍然失败，返回空数组避免错误
        return []
      } finally {
        loading.value = false
      }
    }
      // 过滤日志数据，移除不必要的字段
    const filterLogData = (logs) => {
      // 确保 logs 是数组
      if (!logs) return []
      
      // 检查是否可能是对象而不是数组 (例如 {rows: [...]})
      if (!Array.isArray(logs)) {
        console.log('日志数据非数组类型:', typeof logs)
        
        // 尝试查找是否有rows属性
        if (logs.rows && Array.isArray(logs.rows)) {
          logs = logs.rows
        } 
        // 尝试其他可能包含数组的属性
        else if (logs.data && Array.isArray(logs.data)) {
          logs = logs.data
        }
        // 如果仍然不是数组，返回空数组
        else {
          console.warn('无法从操作日志中提取有效数组数据', logs)
          return []
        }
      }
      
      // 处理数组中的每个日志
      return logs.map(log => {
        // 复制日志对象，避免修改原始数据
        const filteredLog = { ...log }
        
        // 移除returnValue等不必要字段
        const fieldsToRemove = ['returnValue', 'return_value', 'return']
        fieldsToRemove.forEach(field => {
          delete filteredLog[field]
        })
        
        return filteredLog
      })
    }
    
    // 在组件挂载时预加载数据
    onMounted(async () => {
      try {
        await store.dispatch('operatelog/fetchOperateLogs')
      } catch (error) {
        console.error('预加载操作日志失败:', error)
      }
    })
    
    // 提供数据给子组件
    provide('operateLogs', operateLogs)
    provide('recentLogs', recentLogs)
    provide('logLoading', loading)
    provide('fetchLogs', fetchLogs)
    
    return {
      operateLogs,
      recentLogs,
      loading,
      fetchLogs
    }
  }
}
</script>
