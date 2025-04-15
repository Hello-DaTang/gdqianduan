<template>
  <div class="modern-chart-container">
    <div v-if="loading" class="chart-loading">
      <loading-indicator type="spinner" :text="loadingText" />
    </div>
    <div v-else-if="error" class="chart-error">
      <empty-state 
        icon="el-icon-warning"
        title="数据加载失败"
        :description="error"
      >
        <template #action>
          <modern-button
            type="primary"
            size="small"
            @click="reloadChart"
            text="重新加载"
            icon="el-icon-refresh"
          />
        </template>
      </empty-state>
    </div>
    <div v-else-if="isEmpty" class="chart-empty">
      <empty-state 
        icon="el-icon-data-analysis"
        title="暂无数据"
        :description="emptyText"
      />
    </div>
    <div v-else ref="chartRef" class="chart-container" :style="{ height }"></div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts' // 修改为直接导入echarts
import LoadingIndicator from '@/components/feedback/LoadingIndicator.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import ModernButton from '@/components/ui/ModernButton.vue'

export default {
  name: 'ModernChart',
  components: {
    LoadingIndicator,
    EmptyState,
    ModernButton
  },
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    height: {
      type: String,
      default: '300px'
    },
    loading: {
      type: Boolean,
      default: false
    },
    isEmpty: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    emptyText: {
      type: String,
      default: '暂无图表数据'
    },
    loadingText: {
      type: String,
      default: '加载中...'
    }
  },
  emits: ['reload'],
  setup(props, { emit }) {
    const chartRef = ref(null)
    let chart = null
    
    // 初始化图表
    const initChart = () => {
      if (!chartRef.value) return
      
      // 销毁之前的图表实例
      if (chart) {
        chart.dispose()
      }
      
      // 创建新的图表实例
      chart = echarts.init(chartRef.value)
      
      // 应用Google风格的主题色
      const theme = {
        color: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#24C6DC', '#514A9D', '#673AB7', '#FF9800'],
        backgroundColor: 'transparent',
        textStyle: {},
        title: {
          textStyle: {
            color: '#333'
          },
          subtextStyle: {
            color: '#666'
          }
        },
        line: {
          itemStyle: {
            borderWidth: 2
          },
          lineStyle: {
            width: 2
          },
          symbolSize: 8
        },
        radar: {
          itemStyle: {
            borderWidth: 2
          },
          lineStyle: {
            width: 2
          },
          symbolSize: 8
        }
      }
      
      // 设置主题和配置
      chart.setOption({
        ...theme,
        ...props.options
      })
      
      // 响应窗口大小变化
      window.addEventListener('resize', handleResize)
    }
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (chart) {
        chart.resize()
      }
    }
    
    // 重新加载图表
    const reloadChart = () => {
      emit('reload')
    }
    
    // 监听配置变化
    watch(() => props.options, () => {
      if (chart && !props.loading && !props.isEmpty && !props.error) {
        chart.setOption(props.options)
      }
    }, { deep: true })
    
    // 监听加载状态变化
    watch(() => props.loading, (newVal) => {
      if (!newVal && !props.isEmpty && !props.error) {
        // 加载完成后初始化图表
        nextTick(() => {
          initChart()
        })
      }
    })
    
    onMounted(() => {
      if (!props.loading && !props.isEmpty && !props.error) {
        initChart()
      }
    })
    
    onBeforeUnmount(() => {
      if (chart) {
        chart.dispose()
        chart = null
      }
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      chartRef,
      reloadChart
    }
  }
}
</script>

<style scoped>
.modern-chart-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.chart-container {
  width: 100%;
}

.chart-loading,
.chart-error,
.chart-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>