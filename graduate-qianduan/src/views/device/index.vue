<template>
  <div class="device-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20">
      <el-col :xs="12" :md="6">
        <div class="stat-box">
          <div class="stat-icon">
            <i class="el-icon-s-platform"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ devices.length }}</div>
            <div class="stat-label">所有设备</div>
          </div>
          <div class="stat-bg"></div>
        </div>
      </el-col>
      <el-col :xs="12" :md="6">
        <div class="stat-box online">
          <div class="stat-icon">
            <i class="el-icon-s-data"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getDeviceCount('on') }}</div>
            <div class="stat-label">在线设备</div>
          </div>
          <div class="stat-bg"></div>
        </div>
      </el-col>
      <el-col :xs="12" :md="6">
        <div class="stat-box offline">
          <div class="stat-icon">
            <i class="el-icon-s-release"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getDeviceCount('off') }}</div>
            <div class="stat-label">离线设备</div>
          </div>
          <div class="stat-bg"></div>
        </div>
      </el-col>
      <el-col :xs="12" :md="6">
        <div class="stat-box add-device" @click="showAddDeviceDialog">
          <div class="add-icon">
            <i class="el-icon-plus"></i>
          </div>
          <div class="add-label">添加新设备</div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 设备分组导航 -->
    <div class="device-navigation">
      <div class="nav-header">
        <h3>我的设备</h3>
        <div class="nav-actions">
          <el-input
            placeholder="搜索设备"
            prefix-icon="el-icon-search"
            v-model="searchQuery"
            clearable
            size="small"
          />
        </div>
      </div>
      
      <el-tabs v-model="activeTab" class="device-tabs">
        <el-tab-pane label="所有设备" name="all"></el-tab-pane>
        <el-tab-pane label="客厅" name="living"></el-tab-pane>
        <el-tab-pane label="卧室" name="bedroom"></el-tab-pane>
        <el-tab-pane label="厨房" name="kitchen"></el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 设备网格 -->
    <div class="device-grid">
      <el-empty v-if="filteredDevices.length === 0" description="没有找到设备" />
      <div v-else class="device-cards">
        <div
          v-for="device in filteredDevices"
          :key="device.id"
          class="device-card"
          :class="{'device-on': device.deviceData.status === 'on'}"
        >
          <div class="device-header">
            <div class="device-type">
              <i :class="getDeviceIcon(device.type)"></i>
            </div>
            <div class="device-status">
              <div class="status-dot" :class="{'status-on': device.deviceData.status === 'on'}"></div>
              <span>{{ device.deviceData.status === 'on' ? '在线' : '离线' }}</span>
            </div>
          </div>
          
          <div class="device-body">
            <h3>{{ device.homeName }}</h3>
            <div class="device-details">
              <template v-if="device.type === 'light'">
                <div class="detail-item">
                  <span>亮度</span>
                  <span>{{ device.deviceData.brightness }}%</span>
                </div>
              </template>
              <template v-else-if="device.type === 'curtain'">
                <div class="detail-item">
                  <span>位置</span>
                  <span>{{ device.deviceData.position }}%</span>
                </div>
              </template>
            </div>
          </div>
          
          <div class="device-footer">
            <el-button 
              size="small" 
              type="primary" 
              plain
              @click="controlDevice(device)"
            >控制</el-button>
            <el-button 
              size="small" 
              type="danger" 
              plain
              @click="deleteDevice(device.id)"
            >删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加设备对话框 -->
    <el-dialog 
      v-model="addDeviceDialogVisible" 
      title="添加设备" 
      width="400px"
      destroy-on-close
    >
      <div class="dialog-content">
        <el-form :model="newDevice" label-position="top">
          <el-form-item label="设备名称">
            <el-input v-model="newDevice.homeName" placeholder="输入设备名称" />
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select v-model="newDevice.type" placeholder="请选择设备类型" style="width: 100%">
              <el-option v-for="option in deviceOptions" :key="option.value" :label="option.label" :value="option.value">
                <div class="device-option">
                  <i :class="option.icon"></i>
                  <span>{{ option.label }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="房间">
            <el-select v-model="newDevice.room" placeholder="请选择房间" style="width: 100%">
              <el-option label="客厅" value="living"></el-option>
              <el-option label="卧室" value="bedroom"></el-option>
              <el-option label="厨房" value="kitchen"></el-option>
              <el-option label="浴室" value="bathroom"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDeviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addDevice">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 控制设备对话框 -->
    <el-dialog 
      v-model="controlDeviceDialogVisible" 
      title="设备控制" 
      width="400px"
      destroy-on-close
    >
      <div v-if="currentDevice" class="device-control">
        <div class="device-control-header">
          <div class="device-control-icon">
            <i :class="getDeviceIcon(currentDevice.type)"></i>
          </div>
          <h3>{{ currentDevice.homeName }}</h3>
        </div>
        
        <!-- 设备状态开关 -->
        <div class="device-power">
          <span>电源</span>
          <el-switch
            v-model="currentDevice.deviceData.status"
            active-value="on"
            inactive-value="off"
            active-color="#4285F4"
            inactive-color="#dcdfe6"
          />
        </div>
        
        <!-- 灯光控制 -->
        <template v-if="currentDevice.type === 'light' && currentDevice.deviceData">
          <div class="control-section">
            <div class="control-label">亮度</div>
            <div class="control-slider">
              <el-slider 
                v-model="currentDevice.deviceData.brightness" 
                :min="0" 
                :max="100"
                :disabled="currentDevice.deviceData.status === 'off'"
              />
              <div class="slider-value">{{ currentDevice.deviceData.brightness }}%</div>
            </div>
          </div>
          
          <div class="control-section">
            <div class="control-label">颜色</div>
            <div class="color-picker">
              <div 
                v-for="color in colorOptions" 
                :key="color.value"
                class="color-circle"
                :class="{ active: currentDevice.deviceData.color === color.value }"
                :style="{ background: color.value }"
                @click="currentDevice.deviceData.color = color.value"
              ></div>
            </div>
          </div>
        </template>
        
        <!-- 窗帘控制 -->
        <template v-if="currentDevice.type === 'curtain' && currentDevice.deviceData">
          <div class="control-section">
            <div class="control-label">位置</div>
            <div class="control-slider">
              <el-slider 
                v-model="currentDevice.deviceData.position" 
                :min="0" 
                :max="100"
                :disabled="currentDevice.deviceData.status === 'off'"
              />
              <div class="slider-value">{{ currentDevice.deviceData.position }}%</div>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="controlDeviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateDevice">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export default {
  name: 'DeviceView',
  setup() {
    const devices = ref([])
    const addDeviceDialogVisible = ref(false)
    const controlDeviceDialogVisible = ref(false)
    const currentDevice = ref(null)
    const searchQuery = ref('')
    const activeTab = ref('all')
    
    const newDevice = reactive({
      homeName: '',
      type: 'light',
      room: 'living',
      deviceData: {}
    })

    const deviceOptions = [
      { label: '灯光', value: 'light', icon: 'el-icon-lightbulb' },
      { label: '窗帘', value: 'curtain', icon: 'el-icon-picture-outline-round' },
      { label: '空调', value: 'aircon', icon: 'el-icon-cold-drink' },
      { label: '门锁', value: 'lock', icon: 'el-icon-lock' }
    ]

    const colorOptions = [
      { name: '白色', value: '#FFFFFF' },
      { name: '暖白', value: '#F5DEB3' },
      { name: '黄色', value: '#FFFF00' },
      { name: '蓝色', value: '#0000FF' },
      { name: '红色', value: '#FF0000' },
      { name: '绿色', value: '#00FF00' }
    ]

    // 获取设备列表
    const fetchDevices = async () => {
      try {
        // 模拟从后端获取设备列表
        devices.value = [
          {
            id: 1,
            homeName: '客厅灯',
            type: 'light',
            room: 'living',
            deviceData: {
              status: 'on',
              brightness: 75,
              color: '#FFFFFF',
              mode: 'normal'
            }
          },
          {
            id: 2,
            homeName: '卧室窗帘',
            type: 'curtain',
            room: 'bedroom',
            deviceData: {
              status: 'off',
              position: 50,
              material: 'cotton',
              mode: 'manual'
            }
          },
          {
            id: 3,
            homeName: '卧室灯',
            type: 'light',
            room: 'bedroom',
            deviceData: {
              status: 'on',
              brightness: 50,
              color: '#F5DEB3',
              mode: 'normal'
            }
          }
        ]
      } catch (error) {
        ElMessage.error('获取设备列表失败')
      }
    }

    // 根据设备类型获取图标
    const getDeviceIcon = (type) => {
      const icons = {
        light: 'el-icon-lightbulb',
        curtain: 'el-icon-picture-outline-round',
        aircon: 'el-icon-cold-drink',
        lock: 'el-icon-lock'
      }
      return icons[type] || 'el-icon-s-platform'
    }
    
    // 获取特定状态的设备数量
    const getDeviceCount = (status) => {
      return devices.value.filter(device => device.deviceData.status === status).length
    }

    // 过滤后的设备列表
    const filteredDevices = computed(() => {
      let result = devices.value
      
      // 根据标签页过滤
      if (activeTab.value !== 'all') {
        result = result.filter(device => device.room === activeTab.value)
      }
      
      // 根据搜索关键词过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(device => 
          device.homeName.toLowerCase().includes(query) || 
          device.type.toLowerCase().includes(query)
        )
      }
      
      return result
    })

    // 显示添加设备对话框
    const showAddDeviceDialog = () => {
      // 重置表单
      newDevice.homeName = ''
      newDevice.type = 'light'
      newDevice.room = 'living'
      // 显示对话框
      addDeviceDialogVisible.value = true
    }

    // 添加设备
    const addDevice = async () => {
      try {
        // 根据设备类型设置默认设备数据
        if (newDevice.type === 'light') {
          newDevice.deviceData = {
            status: 'off',
            brightness: 50,
            color: '#FFFFFF',
            mode: 'normal'
          }
        } else if (newDevice.type === 'curtain') {
          newDevice.deviceData = {
            status: 'off',
            position: 0,
            material: 'cotton',
            mode: 'manual'
          }
        }

        const token = localStorage.getItem('smart_home_token')
        const response = await axios.post(
          'http://localhost:8080/home/add',
          {
            homeName: newDevice.homeName,
            deviceData: newDevice.deviceData
          },
          { headers: { token } }
        )

        if (response.data && response.data.code === 1) {
          ElMessage.success('设备添加成功')
          addDeviceDialogVisible.value = false
          // 手动添加到列表中，实际应用中应该重新获取列表
          devices.value.push({
            id: Date.now(), // 临时ID
            homeName: newDevice.homeName,
            type: newDevice.type,
            room: newDevice.room,
            deviceData: { ...newDevice.deviceData }
          })
        } else {
          ElMessage.error('设备添加失败')
        }
      } catch (error) {
        console.error('添加设备出错:', error)
        ElMessage.error('添加设备请求失败')
      }
    }

    // 控制设备
    const controlDevice = (device) => {
      currentDevice.value = JSON.parse(JSON.stringify(device))
      controlDeviceDialogVisible.value = true
    }

    // 更新设备
    const updateDevice = async () => {
      try {
        const token = localStorage.getItem('smart_home_token')
        const response = await axios.put(
          'http://localhost:8080/home/update',
          {
            id: currentDevice.value.id,
            homeName: currentDevice.value.homeName,
            deviceData: currentDevice.value.deviceData
          },
          { headers: { token } }
        )

        if (response.data && response.data.code === 1) {
          ElMessage.success('设备更新成功')
          controlDeviceDialogVisible.value = false
          
          // 更新本地设备列表中的数据
          const index = devices.value.findIndex(d => d.id === currentDevice.value.id)
          if (index !== -1) {
            devices.value[index] = { ...currentDevice.value }
          }
        } else {
          ElMessage.error('设备更新失败')
        }
      } catch (error) {
        console.error('更新设备出错:', error)
        ElMessage.error('更新设备请求失败')
      }
    }

    // 删除设备
    const deleteDevice = async (id) => {
      try {
        // 这里应该调用删除设备的API
        ElMessage.success('设备删除成功')
        // 从列表中移除
        devices.value = devices.value.filter(device => device.id !== id)
      } catch (error) {
        ElMessage.error('设备删除失败')
      }
    }

    onMounted(() => {
      fetchDevices()
    })

    return {
      devices,
      addDeviceDialogVisible,
      controlDeviceDialogVisible,
      currentDevice,
      newDevice,
      deviceOptions,
      colorOptions,
      searchQuery,
      activeTab,
      filteredDevices,
      getDeviceIcon,
      getDeviceCount,
      showAddDeviceDialog,
      addDevice,
      controlDevice,
      updateDevice,
      deleteDevice
    }
  }
}
</script>

<style scoped>
.device-container {
  padding: 20px;
}

/* 统计卡片样式 */
.stat-box {
  background: linear-gradient(135deg, #4285F4, #34A853);
  border-radius: 12px;
  padding: 20px;
  color: white;
  position: relative;
  overflow: hidden;
  height: 120px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(66, 133, 244, 0.2);
}

.stat-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(66, 133, 244, 0.3);
}

.stat-box.online {
  background: linear-gradient(135deg, #34A853, #219653);
}

.stat-box.offline {
  background: linear-gradient(135deg, #9AA0A6, #5F6368);
}

.stat-icon {
  font-size: 30px;
  background: rgba(255, 255, 255, 0.2);
  height: 60px;
  width: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stat-content {
  z-index: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-label {
  opacity: 0.8;
  font-size: 16px;
}

.stat-bg {
  position: absolute;
  right: -20px;
  bottom: -30px;
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background: rgba(255, 255, 255, 0.1);
}

.add-device {
  background: white;
  color: #4285F4;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-device:hover {
  background: #f8faff;
}

.add-icon {
  font-size: 30px;
  margin-bottom: 10px;
}

.add-label {
  font-weight: 600;
}

/* 设备导航样式 */
.device-navigation {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.nav-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.nav-actions {
  width: 200px;
}

/* 设备网格样式 */
.device-grid {
  margin-top: 20px;
}

.device-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.device-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.device-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.device-on {
  border-left: 4px solid #34A853;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.device-type {
  background: #f0f4f9;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #4285F4;
}

.device-status {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #5F6368;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9AA0A6;
  margin-right: 6px;
}

.status-on {
  background: #34A853;
}

.device-body {
  margin-bottom: 15px;
}

.device-body h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.device-details {
  margin-top: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #5F6368;
}

.device-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

/* 对话框样式 */
.dialog-content {
  padding: 10px 0;
}

.device-option {
  display: flex;
  align-items: center;
}

.device-option i {
  margin-right: 10px;
  font-size: 16px;
  color: #4285F4;
}

.device-control-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.device-control-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: #f0f4f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #4285F4;
  margin-right: 15px;
}

.device-control-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #3C4043;
}

.device-power {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.control-section {
  margin-bottom: 20px;
}

.control-label {
  font-size: 14px;
  color: #5F6368;
  margin-bottom: 10px;
}

.control-slider {
  display: flex;
  align-items: center;
}

.slider-value {
  width: 50px;
  text-align: right;
  font-size: 14px;
  color: #3C4043;
  margin-left: 10px;
}

.color-picker {
  display: flex;
  gap: 12px;
}

.color-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.color-circle:hover {
  transform: scale(1.1);
}

.color-circle.active {
  border-color: #4285F4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
}

/* Tab样式定制 */
:deep(.el-tabs__item) {
  font-size: 15px;
}

:deep(.el-tabs__active-bar) {
  background-color: #4285F4;
}

:deep(.el-tabs__item.is-active) {
  color: #4285F4;
}
</style>