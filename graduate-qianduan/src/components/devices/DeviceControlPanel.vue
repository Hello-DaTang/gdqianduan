<template>
  <div v-if="device" class="device-control">
    <div class="device-control-header">
      <div class="device-control-icon">
        <img :src="getDeviceImage(device.type)" alt="设备图片" class="device-control-img" />
      </div>
      <h3>{{ device.homeName }}</h3>
    </div>
    
    <!-- 设备位置选择 -->
    <div class="control-section">
      <div class="control-label">设备位置</div>
      <el-select v-model="localDevice.location" placeholder="请选择设备位置" style="width: 100%;">
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
        v-model="localDevice.deviceData.status"
        active-value="on"
        inactive-value="off"
        active-color="#4285F4"
        inactive-color="#dcdfe6"
      />
    </div>
    
    <!-- 动态加载特定设备控制组件 -->
    <component 
      :is="getDeviceComponentName(localDevice.type)" 
      v-if="getDeviceComponentName(localDevice.type)"
      :device-data="localDevice.deviceData"
      @update:device-data="updateDeviceData"
      :disabled="localDevice.deviceData.status === 'off'"
    />
    
    <!-- 设备功率显示（所有设备都有） -->
    <div class="control-section">
      <div class="control-label">设备功率</div>
      <div class="power-display">
        <span class="power-value">{{ localDevice.deviceData.power || 0 }} W</span>
        <span class="power-hint">（设备固有属性）</span>
      </div>
    </div>
    
    <!-- 定时功能（所有设备都有） -->
    <div class="control-section">
      <timer-control 
        :value="localDevice.deviceData.timer"
        @update:value="val => localDevice.deviceData.timer = val"
        :device-type="localDevice.type"
        label="定时控制"
      />
    </div>
  </div>
</template>

<script>
import { reactive, watch } from 'vue'
import TimerControl from './TimerControl.vue'
import LightDeviceControl from './controls/LightDeviceControl.vue'
import CurtainDeviceControl from './controls/CurtainDeviceControl.vue'
import AirConditionerDeviceControl from './controls/AirConditionerDeviceControl.vue'
import DoorLockDeviceControl from './controls/DoorLockDeviceControl.vue'
import TVDeviceControl from './controls/TVDeviceControl.vue'
import SpeakerDeviceControl from './controls/SpeakerDeviceControl.vue'
import DefaultDeviceControl from './controls/DefaultDeviceControl.vue'

export default {
  name: 'DeviceControlPanel',
  components: {
    TimerControl,
    LightDeviceControl,
    CurtainDeviceControl,
    AirConditionerDeviceControl,
    DoorLockDeviceControl,
    TVDeviceControl,
    SpeakerDeviceControl,
    DefaultDeviceControl
  },
  props: {
    device: {
      type: Object,
      required: true
    },
    roomOptions: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // 创建本地副本以便编辑
    const localDevice = reactive(JSON.parse(JSON.stringify(props.device)))
    
    // 监听外部device变化，同步到本地
    watch(() => props.device, (newDevice) => {
      Object.assign(localDevice, JSON.parse(JSON.stringify(newDevice)))
    }, { deep: true })
    
    // 添加更新设备数据的方法
    const updateDeviceData = (newData) => {
      localDevice.deviceData = newData
    }
    
    // 获取设备图片
    const getDeviceImage = (type) => {
      const images = {
        light: require('@/assets/images/device/灯.png'),
        curtain: require('@/assets/images/device/窗帘.png'),
        airConditioner: require('@/assets/images/device/空调.png'),
        doorLock: require('@/assets/images/device/门锁.png'),
        tv: require('@/assets/images/device/TV@3x.png'),
        speaker: require('@/assets/images/device/音响.png'),
        custom: require('@/assets/images/device/设备.png')
      }
      return images[type] || require('@/assets/images/device/设备.png')
    }
    
    // 根据设备类型获取对应的控制组件名称
    const getDeviceComponentName = (type) => {
      const componentMap = {
        light: 'LightDeviceControl',
        curtain: 'CurtainDeviceControl',
        airConditioner: 'AirConditionerDeviceControl',
        doorLock: 'DoorLockDeviceControl',
        tv: 'TVDeviceControl',
        speaker: 'SpeakerDeviceControl'
      }
      return componentMap[type] || 'DefaultDeviceControl' // 使用默认设备控制组件
    }
    
    // 获取当前设备状态（供父组件使用）
    const getUpdatedDevice = () => {
      return localDevice
    }
    
    return {
      localDevice,
      getDeviceImage,
      getDeviceComponentName,
      getUpdatedDevice,
      updateDeviceData
    }
  }
}
</script>

<style scoped>
.device-control-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.device-control-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  overflow: hidden;
}

.device-control-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
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

.room-option {
  display: flex;
  align-items: center;
}

.room-option i {
  margin-right: 8px;
  font-size: 16px;
  color: #4285F4;
}
</style>