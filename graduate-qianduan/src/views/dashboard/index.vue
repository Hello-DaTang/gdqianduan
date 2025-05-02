<template>
  <modern-page-container title="智能家居控制中心">
    <div class="welcome-section">
      <modern-card hoverable>
        <div class="welcome-content">
          <div class="welcome-text">
            <h1>欢迎使用智能家居管理系统</h1>
            <p>这里是您的智能家居控制中心，您可以在这里管理所有设备和查看家居状态。</p>
            <modern-button 
              type="primary" 
              size="large" 
              icon="el-icon-discover"
              text="开始探索"
              @click="startExplore"
            ></modern-button>
          </div>
          <div class="welcome-image">
            <img src="https://img.freepik.com/free-vector/smart-home-concept-illustration_114360-7342.jpg" alt="智能家居图片">
          </div>
        </div>
      </modern-card>
    </div>
    
    <!-- 状态概览部分 -->
    <div class="status-section">
      <div class="status-grid">
        <modern-card v-for="(stat, index) in stats" :key="index" hoverable>
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </modern-card>
      </div>
    </div>
    
    <!-- AI建议卡片 -->
    <modern-card title="AI智能建议" class="ai-suggestion-card">
      <div class="ai-card-content">
        <div class="ai-info">
          <i class="el-icon-magic-stick"></i>
          <h3>智能家居AI建议</h3>
          <p>基于您的设备数据、天气信息和使用习惯，获取AI智能建议，优化您的智能家居体验。</p>
          
          <div class="ai-actions">
            <modern-button 
              type="primary" 
              icon="el-icon-cpu"
              text="一键AI建议" 
              @click="generateAiSuggestion"
              :loading="isLoading"
            ></modern-button>
            
            <modern-button 
              type="info" 
              icon="el-icon-download"
              text="下载数据文件" 
              @click="downloadDataFile"
              :disabled="!hasCollectedData"
            ></modern-button>
          </div>
        </div>
        
        <div class="ai-status">
          <div v-if="isLoading" class="loading-container">
            <i class="el-icon-loading"></i>
            <span>{{ loadingMessage }}</span>
          </div>
          
          <div v-else-if="aiSuggestion" class="suggestion-container">
            <h4>AI建议</h4>
            <p>{{ aiSuggestion }}</p>
            
            <modern-button 
              type="success" 
              icon="el-icon-check"
              text="应用建议" 
              @click="applySuggestion"
              style="margin-top: 16px;"
            ></modern-button>
          </div>
        </div>
      </div>
    </modern-card>
    
    <!-- 轮播图部分 -->
    <modern-card title="智能家居提示">
      <el-carousel height="200px">
        <el-carousel-item v-for="(tip, index) in tips" :key="index">
          <div class="carousel-content" :style="{ backgroundImage: `url(${tip.image})` }">
            <div class="carousel-overlay">
              <h3>{{ tip.title }}</h3>
              <p>{{ tip.description }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </modern-card>
  </modern-page-container>
</template>

<script>
import { computed, onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import ModernPageContainer from '@/components/layout/ModernPageContainer.vue'
import ModernCard from '@/components/layout/ModernCard.vue'
import ModernButton from '@/components/ui/ModernButton.vue'
import { postAiResponse } from '@/api/chat'
import { parseDeviceInstructions } from '@/utils/deviceUtils'
// eslint-disable-next-line no-unused-vars
import { detectDeviceType } from '@/utils/deviceTypes'


export default {
  name: 'DashboardView',
  components: {
    ModernPageContainer,
    ModernCard,
    ModernButton
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    
    // 状态变量
    const isLoading = ref(false)
    const loadingMessage = ref('')
    const aiSuggestion = ref('')
    const hasCollectedData = ref(false)
    const collectedData = ref({
      devices: [],
      weather: {},
      operateLogs: []
    })
    const aiDeviceInstructions = ref(null)
    
    // 轮播提示数据
    const tips = reactive([
      {
        title: '季节变化，温度调节',
        description: '随着季节变化，记得调整您的中央空调温度，以获得最佳舒适度和节能效果。',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        title: '定时关灯省电',
        description: '设置灯光定时关闭功能，避免不必要的能源浪费，延长灯具使用寿命。',
        image: 'https://images.unsplash.com/photo-1564515963606-d01fd5901c82?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        title: '智能家居语音控制',
        description: '通过语音助手控制您的设备，免去复杂的操作，让家居生活更简单。',
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      }
    ])
    
    // 从Vuex获取数据的计算属性
    const deviceList = computed(() => {
      // 确保deviceList是数组
      const list = Array.isArray(store.state.device.deviceList) 
        ? store.state.device.deviceList 
        : (store.state.device.deviceList?.rows || [])
      return list
    })
    
    // 根据真实设备数据计算统计卡片内容
    const stats = computed(() => [
      { 
        label: '连接设备', 
        value: deviceList.value.filter(device => device.deviceData?.status === 'on').length.toString(), 
        icon: 'el-icon-connection', 
        color: '#4285F4' 
      },
      { 
        label: '离线设备', 
        value: deviceList.value.filter(device => device.deviceData?.status === 'off').length.toString(), 
        icon: 'el-icon-warning', 
        color: '#EA4335' 
      },
      { 
        label: '今日用电量', 
        value: '9.6 kWh', // 这个值可能需要从其他API获取
        icon: 'el-icon-lightning', 
        color: '#FBBC05' 
      },
      { 
        label: '节能表现', 
        value: '良好', // 这个值可能需要从其他API获取或根据其他数据计算
        icon: 'el-icon-success', 
        color: '#34A853' 
      }
    ])
    
    const weatherData = computed(() => store.state.weather.weatherData)
    const operateLogs = computed(() => store.state.operatelog.operateLogs)
    const isWeatherLoading = computed(() => store.state.weather.loading)
    
    // 在组件挂载时预加载数据
    onMounted(async () => {
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
    })
    
    
    // 生成AI建议
    const generateAiSuggestion = async () => {
      try {
        isLoading.value = true
        loadingMessage.value = '正在准备数据...'
        
        // 获取完整的设备数据
        await store.dispatch('device/fetchDevices', { force: true })
        
        // 获取完整的天气数据
        await store.dispatch('weather/fetchWeather', { force: true })
        
        // 获取操作日志
        await store.dispatch('operatelog/fetchOperateLogs', { force: true })
        
        // 过滤掉原始数据中的return value - 确保与文件导出使用相同的过滤逻辑
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
        
        // 准备过滤后的数据 - 与txt文件导出的数据完全一致
        const filteredDevices = filterReturnValues(deviceList.value)
        const filteredWeather = filterReturnValues(weatherData.value)
        const filteredLogs = filterReturnValues(operateLogs.value)
        
        // 构建与txt文件导出完全一致的数据
        const smartHomeData = {
          devices: filteredDevices,
          weather: filteredWeather,
          operateLogs: filteredLogs
        }
        
        // 设置已收集标志
        hasCollectedData.value = true
        collectedData.value = smartHomeData
        
        loadingMessage.value = '正在生成AI建议...'
        
        // 发送请求给AI - 使用与导出文件相同的数据
        const prompt = JSON.stringify(smartHomeData)
        console.log('发送的数据大小约为:', Math.round(prompt.length/1024), 'KB')
        
        // 使用直接返回JSON格式的API获取AI建议
        const aiResponse = await postAiResponse(prompt)
        
        // 处理AI响应
        if (aiResponse.data && aiResponse.data.code === 1) {
          try {
            // 因为后端返回严格的JSON格式，直接解析
            const jsonResponse = JSON.parse(aiResponse.data.data)
            
            // 保存原始AI建议文本
            aiSuggestion.value = typeof jsonResponse.explanation === 'string' ? 
              jsonResponse.explanation : 
              '根据您的设备数据和当前天气情况，AI已经生成了设备控制建议。'
            
            // 设置设备指令
            aiDeviceInstructions.value = {
              success: true,
              instructions: jsonResponse
            }
            
            console.log('成功解析到设备控制指令:', jsonResponse)
          } catch (jsonError) {
            console.error('解析JSON响应失败:', jsonError)
            // 如果JSON解析失败，尝试使用原有方法
            aiSuggestion.value = aiResponse.data.data
            aiDeviceInstructions.value = parseDeviceInstructions(aiResponse.data.data)
          }
        } else {
          ElMessage.error('获取AI建议失败: ' + (aiResponse.data?.msg || '未知错误'))
        }
        
        isLoading.value = false
        ElMessage.success('AI建议生成成功！')
      } catch (error) {
        console.error('生成AI建议失败:', error)
        ElMessage.error('生成AI建议失败: ' + (error.message || '未知错误'))
        isLoading.value = false
      }
    }
    
    // 应用AI建议
    const applySuggestion = async () => {
      if (!aiSuggestion.value) {
        ElMessage.warning('没有可应用的AI建议')
        return
      }
      
      // 检查是否有解析出的设备控制指令
      if (!aiDeviceInstructions.value || !aiDeviceInstructions.value.success) {
        ElMessage.warning('无法应用AI建议：未能解析出有效的设备控制指令')
        return
      }
      
      try {
        isLoading.value = true
        loadingMessage.value = '正在应用AI建议...'
        
        const instructions = aiDeviceInstructions.value.instructions     
        // 确保指令包含设备数组
        if (!instructions.devices || !Array.isArray(instructions.devices) || instructions.devices.length === 0) {
          throw new Error('无效的设备控制指令格式')
        }
        
        // 应用每个设备的更新
        for (const device of instructions.devices) {
          if (!device.id || !device.deviceData) {
            console.warn('设备指令缺少ID或数据:', device)
            continue
          }
          
          // 更新设备
          await store.dispatch('device/updateDevice', {
            id: device.id,
            deviceData: device.deviceData
          })
          
          console.log(`成功更新设备 ${device.id}:`, device.deviceData)
        }
        
        // 更新成功后刷新设备列表
        await store.dispatch('device/fetchDevices', { force: true })
        
        ElMessage.success('AI建议已成功应用到设备')
        isLoading.value = false
      } catch (error) {
        console.error('应用AI建议失败:', error)
        ElMessage.error('应用AI建议失败: ' + (error.message || '未知错误'))
        isLoading.value = false
      }
    }
    
    // 下载数据文件
    const downloadDataFile = async () => {
      if (!hasCollectedData.value) {
        ElMessage.warning('请先点击"一键AI建议"收集数据')
        return
      }
      
      try {
        // 显示上传中
        isLoading.value = true
        loadingMessage.value = '正在准备数据...'
        
        // 获取完整的设备数据
        await store.dispatch('device/fetchDevices', { force: true })
        
        // 获取完整的天气数据
        await store.dispatch('weather/fetchWeather', { force: true })
        
        // 获取操作日志
        await store.dispatch('operatelog/fetchOperateLogs', { force: true })
        
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
        
        // 准备过滤后的数据
        const filteredDevices = filterReturnValues(deviceList.value)
        const filteredWeather = filterReturnValues(weatherData.value)
        const filteredLogs = filterReturnValues(operateLogs.value)
        
        // 格式化数据为文本，完整保留所有数据（除了return value）
        const dataText = `# 智能家居数据导出 - ${new Date().toLocaleString('zh-CN')}
        
## 设备数据
${JSON.stringify(filteredDevices, null, 2)}

## 天气数据
${JSON.stringify(filteredWeather, null, 2)}

## 操作历史
${JSON.stringify(filteredLogs, null, 2)}
`
        
        // 直接上传到阿里云
        loadingMessage.value = '正在上传文件至阿里云...'
        
        // 创建文件对象
        const blob = new Blob([dataText], { type: 'text/plain' })
        const fileName = `智能家居数据_${new Date().toISOString().slice(0, 10)}.txt`
        const file = new File([blob], fileName, { type: 'text/plain' })
        
        // 导入上传API
        const { uploadFile } = await import('@/api/upload')
        
        // 调用上传API（上传到阿里云）
        const response = await uploadFile(file)
        
        // 处理上传结果
        if (response.data && response.data.code === 1) {//code为1才表示成功
          const fileUrl = response.data.data
          
          isLoading.value = false
          
          // 显示上传成功和下载链接 - 使用与系统匹配的风格
          ElMessage({
            dangerouslyUseHTMLString: true,
            message: `
              <div style="display: flex; align-items: center; padding: 8px 0;">
                <i class="el-icon-success" style="color: #34A853; font-size: 24px; margin-right: 12px;"></i>
                <div>
                  <p style="margin: 0 0 8px; font-weight: 500; color: #333;">文件已上传成功！</p>
                  <p style="margin: 0 0 8px; font-size: 14px; color: #666;">您可以通过以下链接访问：</p>
                  <div style="background: #f5f7fa; border-radius: 4px; padding: 8px; margin-bottom: 8px; word-break: break-all;">
                    <a href="${fileUrl}" target="_blank" style="color: #4285F4; text-decoration: none;">${fileUrl}</a>
                  </div>
                  <button id="copy-link-btn" class="el-button el-button--primary el-button--small">
                    <i class="el-icon-document-copy" style="margin-right: 4px;"></i>复制链接
                  </button>
                </div>
              </div>
            `,
            type: 'success',
            duration: 0,
            showClose: true,
            customClass: 'modern-message-box',
            center: false
          })
          
          // 复制链接到剪贴板
          const copyLink = () => {
            const textarea = document.createElement('textarea')
            textarea.value = fileUrl
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            ElMessage({
              message: '链接已复制到剪贴板',
              type: 'success',
              customClass: 'modern-message',
              offset: 60
            })
          }
          
          // 添加复制按钮事件
          setTimeout(() => {
            document.getElementById('copy-link-btn')?.addEventListener('click', copyLink)
          }, 100)
          
          // 自动打开下载链接
          setTimeout(() => {
            window.open(fileUrl, '_blank')
          }, 500)
          
        } else {
          isLoading.value = false
          ElMessage.error('文件上传失败: ' + (response.data?.msg || '未知错误'))
        }
      } catch (error) {
        console.error('文件上传失败:', error)
        ElMessage.error('文件上传失败: ' + (error.message || '未知错误'))
        isLoading.value = false
      }
    }
    
    // 开始探索
    const startExplore = () => {
      router.push('/chat')
    }
    
    // 刷新天气数据
    const refreshWeather = async () => {
      try {
        isLoading.value = true
        loadingMessage.value = '正在刷新天气数据...'
        await store.dispatch('weather/fetchWeather', { force: true })
        isLoading.value = false
        ElMessage.success('天气数据刷新成功！')
      } catch (error) {
        console.error('刷新天气数据失败:', error)
        ElMessage.error('刷新天气数据失败: ' + (error.message || '未知错误'))
        isLoading.value = false
      }
    }
    
    // 获取天气图标
    const getWeatherIcon = (weatherCode) => {
      // 确保weatherCode是字符串类型
      const code = String(weatherCode || '').trim()
      
      // 如果是数字类型的编码(例如"00","01"等)，则映射到W格式
      // 如果已经是W格式(例如"W0","W1"等)，则直接使用
      let iconCode = code
      
      // 处理不同格式的天气编码
      if (code && !code.startsWith('W')) {
        // 尝试将编码转换为W格式
        if (code === '00' || code === '0' || code === 'qing') {
          iconCode = 'W0'  // 晴
        } else if (code === '01' || code === '1' || code === 'duoyun') {
          iconCode = 'W1'  // 多云
        } else if (code === '02' || code === '2' || code === 'yin') {
          iconCode = 'W2'  // 阴
        } else if (code.includes('rain') || code.includes('yu')) {
          iconCode = 'W7'  // 雨
        } else if (code.includes('snow') || code.includes('xue')) {
          iconCode = 'W14' // 雪
        } else if (code.includes('fog') || code.includes('wu')) {
          iconCode = 'W18' // 雾
        } else {
          // 默认图标
          iconCode = 'W0'
        }
      }
      
      // 确保编码格式正确且添加W前缀
      if (!iconCode.startsWith('W')) {
        iconCode = `W${iconCode}`
      }
      
      try {
        // 使用require动态导入图标
        return require(`@/assets/images/weather/${iconCode}.png`)
      } catch (error) {
        console.warn(`天气图标 ${iconCode}.png 不存在，使用默认图标`)
        return require('@/assets/images/weather/W0.png') // 默认使用晴天图标
      }
    }
    
    return {
      stats,
      tips,
      startExplore,
      // AI建议相关
      isLoading,
      loadingMessage,
      aiSuggestion,
      hasCollectedData,
      generateAiSuggestion,
      downloadDataFile,
      applySuggestion,
      // 天气相关
      weatherData,
      isWeatherLoading,
      refreshWeather,
      getWeatherIcon
    }
  }
}
</script>

<style lang="scss" scoped>
.welcome-section {
  margin-bottom: 20px;
}

.welcome-content {
  display: flex;
  align-items: center;
}

.welcome-text {
  flex: 1;
  padding-right: 20px;
  
  h1 {
    font-size: 28px;
    color: #333;
    margin-bottom: 16px;
    background: linear-gradient(45deg, #4285F4, #34A853);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    font-size: 16px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 24px;
  }
}

.welcome-image {
  flex: 1;
  display: flex;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
}

.status-section {
  margin-bottom: 20px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  
  i {
    font-size: 30px;
    color: white;
  }
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 天气卡片样式 */
.weather-card {
  margin-bottom: 20px;
}

.weather-loading,
.weather-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #666;
  
  i {
    font-size: 24px;
    margin-bottom: 10px;
    color: #4285F4;
  }
}

.weather-content {
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.weather-current {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  border-radius: 12px;
  padding: 15px;
  color: white;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.weather-icon {
  width: 80px;
  height: 80px;
  margin-right: 20px;
  
  img {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
  }
}

.weather-info {
  flex: 1;
  
  .city-name {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    
    i {
      margin-right: 5px;
    }
  }
  
  .temperature {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .weather-desc {
    font-size: 16px;
    opacity: 0.9;
  }
}

.weather-details {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 10px;
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  
  i {
    font-size: 18px;
    margin-right: 8px;
    color: #4285F4;
  }
}

/* AI建议卡片样式 */
.ai-suggestion-card {
  margin-bottom: 20px;
}

.ai-card-content {
  display: flex;
  align-items: stretch;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.ai-info {
  flex: 1;
  padding-right: 20px;
  
  i {
    font-size: 40px;
    color: #4285F4;
    margin-bottom: 16px;
  }
  
  h3 {
    font-size: 20px;
    color: #333;
    margin-bottom: 12px;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
  }
}

.ai-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.ai-status {
  flex: 1;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  
  @media (max-width: 768px) {
    margin-top: 20px;
  }
}

.loading-container {
  text-align: center;
  color: #666;
  
  i {
    font-size: 24px;
    color: #4285F4;
    margin-right: 8px;
  }
  
  span {
    font-size: 16px;
  }
}

.suggestion-container {
  width: 100%;
  
  h4 {
    font-size: 18px;
    color: #4285F4;
    margin-bottom: 12px;
  }
  
  p {
    color: #333;
    line-height: 1.6;
    margin-bottom: 16px;
    white-space: pre-line;
  }
}

.carousel-content {
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}

.carousel-overlay h3 {
  margin: 0 0 10px;
  font-size: 20px;
}

.carousel-overlay p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
  }
  
  .welcome-text {
    padding-right: 0;
    margin-bottom: 20px;
  }
}
</style>