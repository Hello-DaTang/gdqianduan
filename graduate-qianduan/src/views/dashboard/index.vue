<template>
  <modern-page-container title="智能家居控制中心">
    <!-- 使用DataProvider组件包裹内容 -->
    <data-provider ref="dataProviderRef">
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
      <div class="status-grid">        <modern-card v-for="(stat, index) in stats" :key="index" hoverable>
          <div class="stat-content">
            <div class="stat-icon">
              <img :src="stat.image" alt="状态图标">
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

          <div v-else class="preference-input-container">
            <h4>输入您的偏好</h4>
            <p class="input-desc">告诉AI您的需求，如"我想享受更多的阳光"、"我想节省能源"等</p>
            <el-input
              v-model="userPreference"
              type="textarea"
              :rows="4"
              placeholder="请输入您的偏好或需求..."
              class="preference-textarea"
            ></el-input>
          </div>
        </div>
      </div>
    </modern-card>      <!-- 轮播图部分 -->
    <modern-card title="系统功能介绍">
      <el-carousel height="400px">
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
    </data-provider>
  </modern-page-container>
</template>

<script>
import { computed, onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import ModernPageContainer from '@/components/layout/ModernPageContainer.vue'
import ModernCard from '@/components/layout/ModernCard.vue'
import ModernButton from '@/components/ui/ModernButton.vue'
import DataProvider from '@/components/common/DataProvider.vue'
import { postAiResponse } from '@/api/chat'
import { parseDeviceInstructions } from '@/utils/deviceUtils'
// eslint-disable-next-line no-unused-vars
import { detectDeviceType } from '@/utils/deviceTypes'


export default {
  name: 'DashboardView',
  components: {
    ModernPageContainer,
    ModernCard,
    ModernButton,
    DataProvider
  },  setup() {
    const router = useRouter()
    const store = useStore()
    const dataProviderRef = ref(null)
    
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
    const userPreference = ref('')
      // 轮播提示数据
    const tips = reactive([
      {
        title: '多设备智能控制',
        description: '一站式管理多种智能设备，包括灯光、窗帘、空调、门锁、电视和音箱等，随时随地掌控您的智能家居。',
        image: require('@/assets/images/carousel/多设备智能控制.png')
      },
      {
        title: '能源监控与节能',
        description: '实时监控各设备功率和用电量，智能分析节能表现，为您打造经济环保的智能家居环境。',
        image: require('@/assets/images/carousel/能源监控与节能.png')
      },
      {
        title: '智能定时控制',
        description: '为每个设备设置精确的定时控制方案，自动化您的日常生活，提升家居舒适度和便捷性。',
        image: require('@/assets/images/carousel/智能定时控制.png')
      },
      {
        title: '自定义设备管理',
        description: '支持自定义设备类型和功率设置，轻松扩展系统功能，适应各种智能家居场景需求。',
        image: require('@/assets/images/carousel/自定义设备管理.png')
      },
      {
        title: '房间位置管理',
        description: '按房间分类管理设备，直观展示各区域设备状态，让家居管理更加条理分明。',
        image: require('@/assets/images/carousel/房间位置管理.png')
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
        image: require('@/assets/images/dashboard/连接设备logo.png')
      },
      { 
        label: '离线设备', 
        value: deviceList.value.filter(device => device.deviceData?.status === 'off').length.toString(),
        image: require('@/assets/images/dashboard/离线设备logo.png')
      },
      { 
        label: '今日用电量', 
        value: calculatePowerConsumption(), // 使用计算方法
        image: require('@/assets/images/dashboard/今日用电logo.png')
      },
      { 
        label: '节能表现', 
        value: evaluateEnergySaving(), // 使用评估方法
        image: require('@/assets/images/dashboard/节能表现logo.png')
      }
    ])
    
    const weatherData = computed(() => store.state.weather.weatherData)
    const operateLogs = computed(() => store.state.operatelog.operateLogs)
    const isWeatherLoading = computed(() => store.state.weather.loading)
      // 在组件挂载时预加载数据 - 如果使用DataProvider，则不需要这个加载过程
    onMounted(async () => {
      // DataProvider组件会自动加载数据
    })
    
      // 生成AI建议
    const generateAiSuggestion = async () => {
      try {
        isLoading.value = true
        loadingMessage.value = '正在准备数据...'
        
        let smartHomeData = null
        
        // 使用DataProvider组件获取数据
        if (dataProviderRef.value) {
          try {
            smartHomeData = await dataProviderRef.value.getChatContextData(true)
            // 添加用户偏好
            smartHomeData.userPreference = userPreference.value
          } catch (dataError) {
            console.error('获取数据失败:', dataError)
            // 退回到原始方法
            smartHomeData = null
          }
        }
        
        // 如果使用DataProvider获取数据失败，使用原始方法
        if (!smartHomeData) {
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
          smartHomeData = {
            devices: filteredDevices,
            weather: filteredWeather,
            operateLogs: filteredLogs,
            userPreference: userPreference.value // 添加用户偏好
          }
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
        
        // 记录设备变更详情
        const deviceChanges = []
        
        // 获取当前设备状态
        const currentDevices = JSON.parse(JSON.stringify(deviceList.value))
        const currentDeviceMap = {}
        currentDevices.forEach(device => {
          currentDeviceMap[device.id] = device
        })
        
        // 应用每个设备的更新
        for (const device of instructions.devices) {
          if (!device.id || !device.deviceData) {
            console.warn('设备指令缺少ID或数据:', device)
            continue
          }
          
          // 获取当前设备状态
          const currentDevice = currentDeviceMap[device.id]
          if (!currentDevice) {
            console.warn(`找不到ID为${device.id}的设备`)
            continue
          }
          
          // 记录变更
          const change = {
            id: device.id,
            name: currentDevice.homeName || currentDevice.name || `设备${device.id}`, // 优先使用homeName
            type: currentDevice.type || 'unknown',
            before: JSON.parse(JSON.stringify(currentDevice.deviceData || {})),
            after: JSON.parse(JSON.stringify(device.deviceData || {}))
          }
          
          deviceChanges.push(change)
          
          // 更新设备
          await store.dispatch('device/updateDevice', {
            id: device.id,
            deviceData: device.deviceData
          })
          
          console.log(`成功更新设备 ${currentDevice.homeName || currentDevice.name || device.id}:`, device.deviceData)
        }
        
        // 更新成功后刷新设备列表
        await store.dispatch('device/fetchDevices', { force: true })
        
        // 显示设备变更详情对话框
        showDeviceChangesDialog(deviceChanges, userPreference.value)
        
        // 清空用户偏好
        userPreference.value = ''
        
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
    
    // 显示设备变更详情对话框
    const showDeviceChangesDialog = (deviceChanges, userPreference) => {
      if (!deviceChanges || deviceChanges.length === 0) {
        ElMessage.warning('没有设备发生变化')
        return
      }
      
      // 格式化设备变更详情为HTML
      let changesHTML = `
        <div class="device-changes-dialog">
          <div class="dialog-header">
            <i class="el-icon-magic-stick" style="font-size: 24px; color: #4285F4; margin-right: 10px;"></i>
            <h3 style="margin: 0; color: #333;">AI建议已应用</h3>
          </div>
          ${userPreference ? `<div class="user-preference">
            <span style="font-weight: bold;">您的偏好：</span>${userPreference}
          </div>` : ''}
          <div class="changes-summary">
            <p>共修改了 <span style="font-weight: bold; color: #4285F4;">${deviceChanges.length}</span> 个设备</p>
          </div>
          <ul class="device-list">
      `
      
      // 添加每个设备的变更详情
      deviceChanges.forEach(change => {
        const deviceTypeName = getDeviceTypeName(change.type)
        const deviceIcon = getDeviceTypeIcon(change.type)
        
        // 生成设备状态变化描述
        const stateChanges = getStateChangesDescription(change.before, change.after)
        
        changesHTML += `
          <li class="device-item">
            <div class="device-header">
              <img src="${deviceIcon}" class="device-icon" style="width: 32px; height: 32px; margin-right: 10px; border-radius: 4px;">
              <span class="device-name" style="font-weight: bold; color: #333;">${change.name}</span>
              <span class="device-type" style="color: #666; margin-left: 8px;">(${deviceTypeName})</span>
            </div>
            <div class="state-changes">
              ${stateChanges}
            </div>
          </li>
        `
      })
      
      changesHTML += `
          </ul>
        </div>
      `
      
      // 使用Element Plus的消息框显示变更详情
      ElMessageBox({
        title: 'AI建议已成功应用',
        dangerouslyUseHTMLString: true,
        message: changesHTML,
        showCancelButton: false,
        confirmButtonText: '确定',
        center: false,
        customClass: 'device-changes-message-box'
      })
    }
    
    // 获取设备类型名称
    const getDeviceTypeName = (type) => {
      const typeMap = {
        'light': '智能灯',
        'curtain': '智能窗帘',
        'airconditioner': '智能空调',
        'doorlock': '智能门锁',
        'default': '智能设备'
      }
      return typeMap[type] || typeMap.default
    }
    
    // 获取设备类型图标
    const getDeviceTypeIcon = (type) => {
      try {
        return require(`@/assets/images/device/${type}logo.png`)
      } catch (error) {
        // 使用默认图标
        const typeIconMap = {
          'light': require('@/assets/images/device/灯.png'),
          'curtain': require('@/assets/images/device/窗帘.png'),
          'airConditioner': require('@/assets/images/device/空调.png'),
          'doorLock': require('@/assets/images/device/门锁.png'),
          'tv': require('@/assets/images/device/TV@3x.png'), 
          'speaker': require('@/assets/images/device/音响.png'), 
          'custom': require('@/assets/images/device/设备.png') 
        }
        return typeIconMap[type] || typeIconMap.light
      }
    }
    
    // 获取状态变化描述
    const getStateChangesDescription = (before, after) => {
      let changes = ''
      
      if (!before || !after) {
        return '<span class="no-changes">无法比较设备状态变化</span>'
      }
      
      // 公共状态处理
      if (before.status !== after.status) {
        const statusText = {
          'on': '开启',
          'off': '关闭'
        }
        changes += `
          <div class="state-item">
            <span class="state-name">状态</span>
            <span class="state-from">${statusText[before.status] || before.status}</span>
            <span class="state-arrow">→</span>
            <span class="state-to">${statusText[after.status] || after.status}</span>
          </div>
        `
      }
      
      // 根据设备类型处理不同属性
      if (before.type === 'light' || after.type === 'light') {
        // 灯光亮度
        if (before.brightness !== after.brightness) {
          changes += `
            <div class="state-item">
              <span class="state-name">亮度</span>
              <span class="state-from">${before.brightness || 0}%</span>
              <span class="state-arrow">→</span>
              <span class="state-to">${after.brightness || 0}%</span>
            </div>
          `
        }
        
        // 灯光颜色
        if (before.color !== after.color) {
          changes += `
            <div class="state-item">
              <span class="state-name">颜色</span>
              <span class="state-from">${before.color || '默认'}</span>
              <span class="state-arrow">→</span>
              <span class="state-to">${after.color || '默认'}</span>
            </div>
          `
        }
      }
      
      // 窗帘开度
      if ((before.type === 'curtain' || after.type === 'curtain') && 
          before.openPercentage !== after.openPercentage) {
        changes += `
          <div class="state-item">
            <span class="state-name">开合度</span>
            <span class="state-from">${before.openPercentage || 0}%</span>
            <span class="state-arrow">→</span>
            <span class="state-to">${after.openPercentage || 0}%</span>
          </div>
        `
      }
      
      // 空调温度
      if ((before.type === 'airconditioner' || after.type === 'airconditioner') && 
          before.temperature !== after.temperature) {
        changes += `
          <div class="state-item">
            <span class="state-name">温度</span>
            <span class="state-from">${before.temperature || 0}°C</span>
            <span class="state-arrow">→</span>
            <span class="state-to">${after.temperature || 0}°C</span>
          </div>
        `
      }
      
      // 空调模式
      if ((before.type === 'airconditioner' || after.type === 'airconditioner') && 
          before.mode !== after.mode) {
        const modeText = {
          'cool': '制冷',
          'heat': '制热',
          'fan': '送风',
          'auto': '自动',
          'dry': '除湿'
        }
        changes += `
          <div class="state-item">
            <span class="state-name">模式</span>
            <span class="state-from">${modeText[before.mode] || before.mode || '默认'}</span>
            <span class="state-arrow">→</span>
            <span class="state-to">${modeText[after.mode] || after.mode || '默认'}</span>
          </div>
        `
      }
      
      // 门锁状态
      if ((before.type === 'doorlock' || after.type === 'doorlock') && 
          before.locked !== after.locked) {
        changes += `
          <div class="state-item">
            <span class="state-name">门锁状态</span>
            <span class="state-from">${before.locked ? '已锁定' : '已解锁'}</span>
            <span class="state-arrow">→</span>
            <span class="state-to">${after.locked ? '已锁定' : '已解锁'}</span>
          </div>
        `
      }
      
      // 处理任何其他属性变化（通用）
      const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])
      allKeys.forEach(key => {
        // 排除已处理的特定属性
        if (['status', 'type', 'brightness', 'color', 'openPercentage', 
             'temperature', 'mode', 'locked'].includes(key)) {
          return
        }
        
        // 检查属性是否发生变化
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          changes += `
            <div class="state-item">
              <span class="state-name">${key}</span>
              <span class="state-from">${JSON.stringify(before[key])}</span>
              <span class="state-arrow">→</span>
              <span class="state-to">${JSON.stringify(after[key])}</span>
            </div>
          `
        }
      })
      
      return changes || '<span class="no-changes">设备状态未发生变化</span>'
    }
    
    // 计算今日用电量（根据设备功率和使用时间估算）
    const calculatePowerConsumption = () => {
      if (!deviceList.value || deviceList.value.length === 0) {
        return '0.0 kWh';
      }
      
      // 获取所有在线设备
      const onlineDevices = deviceList.value.filter(device => device.deviceData?.status === 'on');
      
      let totalPowerConsumption = 0;
      
      // 计算每个设备的用电量
      onlineDevices.forEach(device => {
        // 获取设备功率，如果没有设置默认为50W
        const power = device.deviceData?.power || 50; // 单位：瓦特
        
        // 假设每个设备平均已开启8小时
        const hoursOn = 8;
        
        // 计算该设备的用电量（千瓦时）
        const deviceConsumption = (power * hoursOn) / 1000;
        
        totalPowerConsumption += deviceConsumption;
      });
      
      // 格式化为两位小数
      return totalPowerConsumption.toFixed(1) + ' kWh';
    }
    
    // 评估节能表现
    const evaluateEnergySaving = () => {
      if (!deviceList.value || deviceList.value.length === 0) {
        return '良好';
      }
      
      // 获取所有设备
      const allDevices = deviceList.value;
      const onlineDevices = allDevices.filter(device => device.deviceData?.status === 'on');
      
      // 计算开启设备的百分比
      const onlineRatio = onlineDevices.length / allDevices.length;
      
      // 计算总功率
      let totalPower = 0;
      onlineDevices.forEach(device => {
        totalPower += device.deviceData?.power || 50;
      });
      
      // 评估节能表现
      if (onlineRatio < 0.3 && totalPower < 500) {
        return '优秀';
      } else if (onlineRatio < 0.5 && totalPower < 1000) {
        return '良好';
      } else if (onlineRatio < 0.7 && totalPower < 2000) {
        return '一般';
      } else {
        return '需改进';
      }
    }
      return {
      tips,
      stats,
      deviceList,
      weatherData,
      operateLogs,
      isLoading,
      isWeatherLoading,
      loadingMessage,
      aiSuggestion,
      downloadDataFile,
      generateAiSuggestion,
      refreshWeather,
      getWeatherIcon,
      applySuggestion,
      collectedData,
      hasCollectedData,
      userPreference,
      dataProviderRef,
      startExplore
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
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

.preference-input-container {
  width: 100%;
  
  h4 {
    font-size: 18px;
    color: #4285F4;
    margin-bottom: 12px;
  }
  
  .input-desc {
    color: #666;
    margin-bottom: 8px;
  }
  
  .preference-textarea {
    width: 100%;
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

/* 设备变更对话框样式 */
:deep(.device-changes-message-box) {
  max-width: 600px;
  width: 90%;
}

:deep(.device-changes-dialog) {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

:deep(.dialog-header) {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

:deep(.user-preference) {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
}

:deep(.changes-summary) {
  margin-bottom: 15px;
  font-size: 15px;
}

:deep(.device-list) {
  list-style: none;
  padding: 0;
  margin: 0;
}

:deep(.device-item) {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 12px;
}

:deep(.device-header) {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

:deep(.state-changes) {
  border-top: 1px dashed #e0e0e0;
  padding-top: 10px;
}

:deep(.state-item) {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
}

:deep(.state-name) {
  font-weight: bold;
  width: 80px;
  color: #555;
}

:deep(.state-from) {
  color: #999;
  flex: 1;
}

:deep(.state-arrow) {
  margin: 0 10px;
  color: #4285F4;
  font-weight: bold;
}

:deep(.state-to) {
  flex: 1;
  color: #4285F4;
  font-weight: bold;
}

:deep(.no-changes) {
  color: #999;
  font-style: italic;
  font-size: 14px;
}
</style>