<template>
  <div class="device-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20">
      <el-col :xs="12" :md="6">
        <div class="stat-box" @click="filterDevices('all')" :class="{ active: deviceFilter === 'all' }">
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
        <div class="stat-box online" @click="filterDevices('online')" :class="{ active: deviceFilter === 'online' }">
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
        <div class="stat-box offline" @click="filterDevices('offline')" :class="{ active: deviceFilter === 'offline' }">
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
        <el-tab-pane label="所有位置" name="all"></el-tab-pane>
        <el-tab-pane 
          v-for="room in roomOptions" 
          :key="room.value" 
          :label="room.label" 
          :name="room.value"
        ></el-tab-pane>
      </el-tabs>
      <button class="add-room-button" @click="showAddRoomDialog">
        <i class="el-icon-plus">+</i>
      </button>
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
              <img :src="getDeviceImage(device.type)" alt="设备图标" class="device-icon" />
            </div>
            <div class="device-status">
              <div class="status-dot" :class="{'status-on': device.deviceData.status === 'on'}"></div>
              <span>{{ device.deviceData.status === 'on' ? '在线' : '离线' }}</span>
            </div>
          </div>
          
          <div class="device-body">
            <h3>{{ device.homeName }}</h3>
            <div class="device-info">
              <span class="location-tag" v-if="device.location">
                <i class="el-icon-location"></i> 
                {{ getLocationLabel(device.location) }}
              </span>
            </div>
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
      title="添加新设备"
      width="450px"
      destroy-on-close
      custom-class="modern-dialog"
      top="4vh"
    >
      <div class="add-device-dialog">
        <div class="device-dialog-header">
          <div class="dialog-icon">
            <i class="el-icon-plus"></i>
          </div>
          <h3>选择您想要添加的设备类型</h3>
          <p>添加新的智能设备到您的智能家居系统</p>
        </div>
        
        <el-form :model="newDevice" label-position="top">
          <el-form-item label="设备名称">
            <modern-input 
              v-model="newDevice.homeName" 
              placeholder="请输入设备名称，例如：客厅灯"
              prefix-icon="el-icon-edit"
              style="width: 100%;"
            />
          </el-form-item>
            <el-form-item label="设备类型">
            <div class="device-type-grid">
              <div 
                v-for="option in deviceOptions" 
                :key="option.value"
                class="device-type-card"
                :class="{ 'active': newDevice.type === option.value }"
                @click="newDevice.type = option.value"
              >
                <div class="type-name">{{ option.label }}</div>
              </div>
            </div>
          </el-form-item>
          
          <!-- 自定义设备类型的额外字段 -->
          <div v-if="newDevice.type === 'custom'">
            <el-form-item label="自定义设备类型名称">
              <modern-input 
                v-model="newDevice.customTypeName" 
                placeholder="例如：智能咖啡机"
                prefix-icon="el-icon-edit"
                style="width: 100%;"
              />
            </el-form-item>
            
            <el-form-item label="设备功率(W)">
              <el-input-number 
                v-model="newDevice.customPower" 
                :min="1" 
                :max="5000"
                style="width: 100%;" 
              />
            </el-form-item>
          </div><el-form-item label="位置">
            <el-select v-model="newDevice.room" placeholder="请选择设备位置" style="width: 100%">
              <el-option
                v-for="room in roomOptions"
                :key="room.value"
                :label="room.label"
                :value="room.value"
              >
                <div class="room-option">
                  <i class="el-icon-office-building"></i>
                  <span>{{ room.label }}</span>
                </div>
              </el-option>
              <el-divider content-position="center">或</el-divider>
              <el-option
                key="add-new-room"
                value="add-new-room"
                label="+ 添加新位置"
              >
                <div class="room-option add-new">
                  <i class="el-icon-plus"></i>
                  <span>添加新位置</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <!-- 当选择"添加新位置"时显示的表单 -->
          <div v-if="newDevice.room === 'add-new-room'">
            <el-form-item label="位置名称" >
              <modern-input
                v-model="newRoomInline.name"
                placeholder="请输入位置名称，例如：书房"
                prefix-icon="el-icon-office-building"
                style="width: 100%;"
              />
            </el-form-item>
            
            <el-form-item label="位置标识" class="small-text">
              <modern-input
                v-model="newRoomInline.value"
                placeholder="位置唯一标识，如：study"
                prefix-icon="el-icon-key"
                style="width: 100%;"
              />
              <div class="tip-text">提示：标识只能包含英文字母、数字和下划线</div>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" size="small" @click="addRoomInline" 
                         :disabled="!newRoomInline.name || !newRoomInline.value">确认添加位置</el-button>
              <el-button size="small" @click="newDevice.room = roomOptions.length ? roomOptions[0].value : ''">
                取消
              </el-button>
            </el-form-item>
          </div>
        </el-form>
        
        <div class="dialog-preview">
          <div class="preview-box" :class="newDevice.type">
            <i :class="getDeviceIcon(newDevice.type)"></i>
            <span>{{ newDevice.homeName || '新设备' }}</span>
          </div>
        </div>
        
        <div class="dialog-footer">
          <modern-button text="取消" @click="addDeviceDialogVisible = false" />
          <modern-button type="primary" text="添加设备" @click="addDevice" :loading="adding" />
        </div>
      </div>
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
        
        <!-- 设备位置选择 -->
        <div class="control-section">
          <div class="control-label">设备位置</div>
          <el-select v-model="currentDevice.location" placeholder="请选择设备位置" style="width: 100%;">
            <el-option
              v-for="room in roomOptions"
              :key="room.value"
              :label="room.label"
              :value="room.value"
            >
              <div class="room-option">
                <i class="el-icon-office-building"></i>
                <span>{{ room.label }}</span>
              </div>
            </el-option>
          </el-select>
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
          </div>        </template>
        
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
        
        <!-- 空调控制 -->
        <template v-if="currentDevice.type === 'airConditioner' && currentDevice.deviceData">
          <div class="control-section">
            <div class="control-label">温度</div>
            <div class="control-slider">
              <el-slider 
                v-model="currentDevice.deviceData.temperature" 
                :min="16" 
                :max="30"
                :disabled="currentDevice.deviceData.status === 'off'"
              />
              <div class="slider-value">{{ currentDevice.deviceData.temperature }}°C</div>
            </div>
          </div>
          
          <div class="control-section">
            <div class="control-label">模式</div>
            <el-select v-model="currentDevice.deviceData.mode" style="width: 100%;">
              <el-option label="制冷" value="cool" />
              <el-option label="制热" value="heat" />
              <el-option label="自动" value="auto" />
              <el-option label="送风" value="fan" />
            </el-select>
          </div>
          
          <div class="control-section">
            <div class="control-label">风速</div>
            <el-select v-model="currentDevice.deviceData.fanSpeed" style="width: 100%;">
              <el-option label="自动" value="auto" />
              <el-option label="低速" value="low" />
              <el-option label="中速" value="medium" />
              <el-option label="高速" value="high" />
            </el-select>
          </div>
        </template>
        
        <!-- 设备功率显示（所有设备都有） -->
        <div class="control-section">
          <div class="control-label">设备功率</div>
          <div class="power-display">
            <span class="power-value">{{ currentDevice.deviceData.power || 0 }} W</span>
            <span class="power-hint">（设备固有属性）</span>
          </div>
        </div>
          <!-- 定时功能（所有设备都有） -->
        <div class="control-section">
          <timer-control 
            :value="currentDevice.deviceData.timer"
            @update:value="val => currentDevice.deviceData.timer = val"
            :device-type="currentDevice.type"
            label="定时控制"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="controlDeviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateDevice">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加位置对话框 -->
    <el-dialog
      v-model="addRoomDialogVisible"
      title="添加新位置"
      width="400px"
      destroy-on-close
      custom-class="room-dialog modern-dialog"
    >
      <div class="add-room-dialog">
        <div class="room-dialog-header">
          <div class="dialog-icon">
            <i class="el-icon-office-building"></i>
          </div>
          <h3>添加新的位置</h3>
          <p>为您的智能设备创建新的位置分组</p>
        </div>
        
        <el-form :model="newRoom" label-position="top">
          <el-form-item label="位置名称" >
            <modern-input
              v-model="newRoom.name"
              placeholder="请输入位置名称，例如：书房"
              prefix-icon="el-icon-office-building"
              style="width: 100%;"
            />
          </el-form-item>
          
          <el-form-item label="位置标识" class="small-text">
            <modern-input
              v-model="newRoom.value"
              placeholder="位置唯一标识，如：study"
              prefix-icon="el-icon-key"
              style="width: 100%;"
            />
            <div class="tip-text">提示：标识只能包含英文字母、数字和下划线</div>
          </el-form-item>
        </el-form>
        
        <div class="dialog-footer">
          <modern-button text="取消" @click="addRoomDialogVisible = false" />
          <modern-button type="primary" text="添加位置" @click="addRoom" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { detectDeviceType, getDefaultConfig } from '@/utils/deviceTypes'
import ModernButton from '@/components/ui/ModernButton.vue'
import ModernInput from '@/components/ui/ModernInput.vue'
import TimerControl from '@/components/devices/TimerControl.vue'
import { addHome, deleteHome } from '@/api/device'

export default {
  name: 'DeviceView',
  components: {
    ModernButton,
    ModernInput,
    TimerControl
  },
  setup() {
    const store = useStore()
    const loading = ref(false)
    const addDeviceDialogVisible = ref(false)
    const controlDeviceDialogVisible = ref(false)
    const addRoomDialogVisible = ref(false)
    const currentDevice = ref(null)
    const searchQuery = ref('')
    const activeTab = ref('all')
    const deviceFilter = ref('all')
    const adding = ref(false)
    
    // 从Vuex获取设备列表
    const devices = computed(() => {
      // 确保deviceList是数组
      const deviceList = Array.isArray(store.state.device.deviceList) 
        ? store.state.device.deviceList 
        : (store.state.device.deviceList?.rows || []);
      
      // 从设备中获取并添加类型信息
      return deviceList.map(device => {
        // 检测设备类型
        const type = detectDeviceType(device.deviceData)
        return {
          ...device,
          type
        }
      })
    })    // 新设备表单
    const newDevice = reactive({
      homeName: '',
      type: 'light',
      room: '',
      customTypeName: '',  // 自定义设备类型名称
      customPower: 50,     // 自定义设备功率
      deviceData: {}
    })

    // 新位置表单
    const newRoom = reactive({
      name: '',
      value: ''
    })
    
    // 内联添加新位置的表单
    const newRoomInline = reactive({
      name: '',
      value: ''
    })
   // 设备类型选项
    const deviceOptions = [
      { 
        label: '灯光', 
        value: 'light', 
        icon: require('@/assets/images/device/灯光logo.png') 
      },
      { 
        label: '窗帘', 
        value: 'curtain', 
        icon: require('@/assets/images/device/窗帘logo.png')
      },
      { 
        label: '空调', 
        value: 'airConditioner', 
        icon: require('@/assets/images/device/空调logo.png')
      },
      { 
        label: '门锁', 
        value: 'doorLock', 
        icon: require('@/assets/images/device/门锁logo.png')
      },
      { 
        label: '电视', 
        value: 'tv', 
        icon: require('@/assets/images/device/空调logo.png') // 使用现有图标
      },
      { 
        label: '音箱', 
        value: 'speaker', 
        icon: require('@/assets/images/device/灯光logo.png') // 使用现有图标
      },
      { 
        label: '自定义设备', 
        value: 'custom', 
        icon: require('@/assets/images/device/灯光logo.png') // 使用现有图标
      }
    ]

    // 灯光颜色选项
    const colorOptions = [
      { name: '白色', value: '#FFFFFF' },
      { name: '暖白', value: '#F5DEB3' },
      { name: '黄色', value: '#FFFF00' },
      { name: '蓝色', value: '#0000FF' },
      { name: '红色', value: '#FF0000' },
      { name: '绿色', value: '#00FF00' }
    ]

    // 房间选项
    const roomOptions = reactive([
      { label: '客厅', value: 'living' },
      { label: '卧室', value: 'bedroom' },
      { label: '厨房', value: 'kitchen' }
    ])

    // 从Vuex获取设备列表
    const fetchDevices = async () => {
      loading.value = true
      try {
        // 使用Vuex获取设备数据
        await store.dispatch('device/fetchDevices', { force: true })
        
        // 动态生成位置选项，只显示用户当前拥有设备的位置
        generateRoomOptions(devices.value)
      } catch (error) {
        console.error('获取设备列表出错:', error)
        ElMessage.error('获取设备列表失败')
      } finally {
        loading.value = false
      }
    }

    // 动态生成位置选项，只显示用户当前拥有设备的位置
    const generateRoomOptions = (deviceList) => {
      // 先清空当前位置选项
      roomOptions.splice(0, roomOptions.length);
      
      // 收集所有设备的位置
      const locationSet = new Set();
      
      // 遍历设备列表，收集所有不为空的位置
      deviceList.forEach(device => {
        if (device.location && device.location.trim() !== '') {
          locationSet.add(device.location);
        }
      });
      
      // 将收集到的位置转为选项格式
      const locationMapping = {
        'living': '客厅',
        'bedroom': '卧室',
        'kitchen': '厨房',
        'bathroom': '浴室',
        'study': '书房'
      };
      
      // 添加到位置选项中
      locationSet.forEach(location => {
        roomOptions.push({
          value: location,
          label: locationMapping[location] || location // 如果有预设名称则使用，否则使用原始值
        });
      });
      
      // 确保新设备的位置选项有默认值
      if (newDevice.room === '' && roomOptions.length > 0) {
        newDevice.room = roomOptions[0].value;
      }
    }    // 根据设备类型获取图标
    const getDeviceIcon = (type) => {
      const icons = {
        light: 'el-icon-lightbulb',
        curtain: 'el-icon-picture-outline-round',
        airConditioner: 'el-icon-cold-drink',
        doorLock: 'el-icon-lock',
        tv: 'el-icon-video-play',
        speaker: 'el-icon-microphone',
        custom: 'el-icon-setting'
      }
      return icons[type] || 'el-icon-s-platform'
    }// 根据设备类型获取图片
    const getDeviceImage = (type) => {
      const images = {
        light: require('@/assets/images/device/灯光logo.png'),
        curtain: require('@/assets/images/device/窗帘logo.png'),
        airConditioner: require('@/assets/images/device/空调logo.png'),
        doorLock: require('@/assets/images/device/门锁logo.png'),
        tv: require('@/assets/images/device/灯光logo.png'), // 暂用灯光图标代替
        speaker: require('@/assets/images/device/灯光logo.png'), // 暂用灯光图标代替
        custom: require('@/assets/images/device/灯光logo.png') // 暂用灯光图标代替
      }
      return images[type] || require('@/assets/images/device/灯光logo.png') // 默认使用灯光图标
    }
    
    // 获取特定状态的设备数量
    const getDeviceCount = (status) => {
      return devices.value.filter(device => device.deviceData.status === status).length
    }

    // 获取位置标签显示名称
    const getLocationLabel = (locationValue) => {
      const locationMapping = {
        'living': '客厅',
        'bedroom': '卧室',
        'kitchen': '厨房',
        'bathroom': '浴室',
        'study': '书房'
      };
      
      return locationMapping[locationValue] || locationValue;
    }

    // 过滤后的设备列表
    const filteredDevices = computed(() => {
      let result = devices.value
      
      // 根据标签页过滤
      if (activeTab.value !== 'all') {
        result = result.filter(device => device.location === activeTab.value)
      }
      
      // 根据设备状态过滤
      if (deviceFilter.value === 'online') {
        result = result.filter(device => device.deviceData.status === 'on')
      } else if (deviceFilter.value === 'offline') {
        result = result.filter(device => device.deviceData.status === 'off')
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
    })    // 显示添加设备对话框
    const showAddDeviceDialog = () => {
      // 重置表单
      newDevice.homeName = ''
      newDevice.type = 'light'
      newDevice.room = roomOptions.length > 0 ? roomOptions[0].value : ''
      newDevice.customTypeName = ''
      newDevice.customPower = 50
      // 显示对话框
      addDeviceDialogVisible.value = true
    }

    // 添加设备
    const addDevice = async () => {
      // 验证表单
      if (!newDevice.homeName) {
        ElMessage.warning('请输入设备名称');
        return;
      }
      
      try {
        adding.value = true;
        
        let defaultConfig;
        
        // 处理自定义设备类型
        if (newDevice.type === 'custom') {
          if (!newDevice.customTypeName) {
            ElMessage.warning('请输入自定义设备类型名称');
            adding.value = false;
            return;
          }
          
          // 为自定义设备创建配置
          defaultConfig = {
            status: 'off',
            customName: newDevice.customTypeName,
            customType: 'custom',
            power: newDevice.customPower || 50,
            timer: null
          };
        } else {
          // 根据设备类型获取默认配置
          defaultConfig = getDefaultConfig(newDevice.type);
          if (!defaultConfig) {
            ElMessage.error('不支持的设备类型');
            adding.value = false;
            return;
          }
        }        
        const response = await addHome(
          {
            homeName: newDevice.homeName,
            location: newDevice.room, // 使用location字段传递位置
            deviceData: defaultConfig
          }
        );

        if (response.data && response.data.code === 1) {
          ElMessage.success('设备添加成功');
          addDeviceDialogVisible.value = false;
          // 重新加载设备列表
          fetchDevices();
        } else {
          ElMessage.error('设备添加失败: ' + (response.data?.msg || '未知错误'));
        }
      } catch (error) {
        console.error('添加设备出错:', error);
        ElMessage.error('添加设备请求失败');
      } finally {
        adding.value = false;
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
        // 使用Vuex更新设备
        await store.dispatch('device/updateDevice', {
          id: currentDevice.value.id,
          homeName: currentDevice.value.homeName,
          location: currentDevice.value.location,
          deviceData: currentDevice.value.deviceData
        })
        
        ElMessage.success('设备更新成功')
        controlDeviceDialogVisible.value = false
      } catch (error) {
        console.error('更新设备出错:', error)
        ElMessage.error('更新设备请求失败')
      }
    }

    // 删除设备
    const deleteDevice = async (id) => {
      try {
        // 弹出确认框
        await ElMessageBox.confirm(
          '确认要删除这个设备吗？此操作不可恢复。',
          '删除确认',
          {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        // 调用删除设备的API
        const response = await deleteHome(id);

        if (response.data && response.data.code === 1) {
          ElMessage.success('设备删除成功');
          // 重新获取设备列表
          fetchDevices();
        } else {
          ElMessage.error('设备删除失败: ' + (response.data?.msg || '未知错误'));
        }
      } catch (error) {
        // 如果是用户取消操作，不显示错误
        if (error === 'cancel' || error.toString().includes('cancel')) {
          return;
        }
        console.error('删除设备出错:', error);
        ElMessage.error('删除设备失败');
      }
    }

    // 过滤设备
    const filterDevices = (filter) => {
      deviceFilter.value = filter
    }

    // 显示添加房间对话框
    const showAddRoomDialog = () => {
      // 重置表单
      newRoom.name = ''
      newRoom.value = ''
      addRoomDialogVisible.value = true
    }    // 添加房间
    const addRoom = () => {
      if (!newRoom.name || !newRoom.value) {
        ElMessage.warning('请输入位置名称和标识')
        return
      }
      if (!/^[a-zA-Z0-9_]+$/.test(newRoom.value)) {
        ElMessage.warning('位置标识只能包含英文字母、数字和下划线')
        return
      }
      roomOptions.push({ label: newRoom.name, value: newRoom.value })
      addRoomDialogVisible.value = false
      ElMessage.success('位置添加成功')
    }
    
    // 内联添加位置（在添加设备对话框内）
    const addRoomInline = () => {
      if (!newRoomInline.name || !newRoomInline.value) {
        ElMessage.warning('请输入位置名称和标识')
        return
      }
      if (!/^[a-zA-Z0-9_]+$/.test(newRoomInline.value)) {
        ElMessage.warning('位置标识只能包含英文字母、数字和下划线')
        return
      }
      
      // 检查是否已存在相同的位置标识
      const existingRoom = roomOptions.find(room => room.value === newRoomInline.value)
      if (existingRoom) {
        ElMessage.warning(`位置标识 "${newRoomInline.value}" 已存在`)
        return
      }
      
      // 添加新位置到位置选项
      roomOptions.push({ 
        label: newRoomInline.name, 
        value: newRoomInline.value 
      })
      
      // 设置新设备的位置为新添加的位置
      newDevice.room = newRoomInline.value
      
      // 重置内联位置表单
      newRoomInline.name = ''
      newRoomInline.value = ''
      
      ElMessage.success('新位置添加成功')
    }

    // 组件挂载时获取设备列表
    onMounted(() => {
      fetchDevices()
    })

    return {
      devices,
      loading,
      addDeviceDialogVisible,
      controlDeviceDialogVisible,
      addRoomDialogVisible,
      currentDevice,
      newDevice,
      newRoom,
      deviceOptions,
      colorOptions,
      roomOptions,
      searchQuery,
      activeTab,
      deviceFilter,
      filteredDevices,
      getDeviceIcon,
      getDeviceImage,
      getDeviceCount,
      showAddDeviceDialog,
      addDevice,
      controlDevice,
      updateDevice,
      deleteDevice,      filterDevices,
      showAddRoomDialog,
      addRoom,
      addRoomInline,
      adding,
      getLocationLabel,
      newRoomInline
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
  cursor: pointer;
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

.stat-box.active {
  border: 2px solid #FFD700;
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
  position: relative;
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

/* 添加位置按钮样式 */
.add-room-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  cursor: pointer;
}

.add-room-btn i {
  font-size: 18px;
  color: #4285F4;
  padding: 5px;
  transition: all 0.3s;
}

.add-room-btn i:hover {
  transform: rotate(90deg);
  color: #34A853;
}

.add-room-button {
  position: absolute;
  right: 20px; /* 与右侧边缘保持20px距离 */
  top: 63px; /* 根据您的设计调整，让按钮处于标签页行的垂直中心 */
  background: #4285F4; /* 蓝色背景更醒目 */
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /*z-index: 10;  确保在最顶层 */
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
  border: none;
  transition: all 0.3s;
}

.add-room-button i {
  font-size: 18px;
  color: white;
  transition: all 0.3s;
}

.room-option {
  display: flex;
  align-items: center;
}

room-option i {
  margin-right: 8px;
  font-size: 16px;
  color: #4285F4;
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

.device-icon {
  width: 100%;
  height: auto;
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

.power-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.power-value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.power-hint {
  font-size: 12px;
  color: #909399;
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

/* 添加设备对话框样式 */
.modern-dialog {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: -8vh !important;
}

.add-device-dialog {
  padding: 20px;
}

.device-dialog-header {
  text-align: center;
  margin-bottom: 20px;
}

.dialog-icon {
  font-size: 40px;
  color: #4285F4;
  margin-bottom: 10px;
}

.device-dialog-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.device-dialog-header p {
  font-size: 14px;
  color: #5F6368;
  margin: 5px 0 0;
}

.device-type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 每行显示2个 */
  gap: 70px;
  margin-bottom: 20px;
  width: 100%
}

.device-type-card {
  background: #f8faff;
  border: 1px solid #e8eaef;
  border-radius: 10px;
  padding: 20px 15px; /* 调整内边距 */
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex; /* 使用flex布局 */
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 40px; /* 固定高度 */
}

.device-type-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(66, 133, 244, 0.2);
}

.device-type-card.active {
  background: rgba(66, 133, 244, 0.1);
  border-color: #4285F4;
  color: #4285F4;
  box-shadow: 0 5px 15px rgba(66, 133, 244, 0.25);
}

.device-type-card.active .type-icon {
  color: #4285F4;
}

.type-icon {
  font-size: 32px;  /* 图标更大 */
  margin-bottom: 12px;
  color: #5F6368;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
}

.dialog-preview {
  margin-top: 20px;
  text-align: center;
}

.preview-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f0f4f9;
  font-size: 24px;
  color: #4285F4;
  margin: 0 auto;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

/* 添加位置对话框样式 */
.room-dialog {
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.add-room-dialog {
  padding: 20px;
}

.room-dialog-header {
  text-align: center;
  margin-bottom: 20px;
}

room-dialog-header .dialog-icon {
  font-size: 40px;
  color: #4285F4;
  margin-bottom: 10px;
}

room-dialog-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

room-dialog-header p {
  font-size: 14px;
  color: #5F6368;
  margin: 5px 0 0;
}

.tip-text {
  font-size: 12px;
  color: #9AA0A6;
  margin-top: 5px;
}
</style>