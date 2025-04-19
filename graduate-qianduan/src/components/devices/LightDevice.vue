<template>
  <default-device :device="device" deviceType="light" @edit="$emit('edit', device)" @detail="$emit('detail', device)">
    <template #content>
      <div class="light-device-content">
        <!-- 自定义灯光组件的显示内容 -->
        <div class="light-preview" :style="lightStyles">
          <i class="el-icon-light-bulb light-icon"></i>
        </div>
        
        <div class="light-info">
          <div class="light-info-item">
            <span class="light-info-label">亮度:</span>
            <div class="light-brightness-bar">
              <div class="light-brightness-fill" :style="{ width: `${deviceData.brightness}%` }"></div>
            </div>
            <span class="light-brightness-value">{{ deviceData.brightness }}%</span>
          </div>
          
          <div class="light-info-item">
            <span class="light-info-label">颜色:</span>
            <div class="light-color-preview" :style="{ backgroundColor: deviceData.color }"></div>
            <span class="light-color-value">{{ deviceData.color }}</span>
          </div>
          
          <div class="light-info-item">
            <span class="light-info-label">模式:</span>
            <span class="light-mode-value">{{ getModeText(deviceData.mode) }}</span>
          </div>
        </div>
      </div>
    </template>
  </default-device>
</template>

<script>
import DefaultDevice from './DefaultDevice.vue';

export default {
  name: 'LightDevice',
  components: {
    DefaultDevice
  },
  props: {
    device: {
      type: Object,
      required: true
    }
  },
  computed: {
    deviceData() {
      return this.device.deviceData || {};
    },
    lightStyles() {
      return {
        backgroundColor: this.deviceData.status === 'on' ? this.deviceData.color : '#f5f5f5',
        opacity: this.deviceData.status === 'on' ? this.deviceData.brightness / 100 : 0.1,
        boxShadow: this.deviceData.status === 'on' 
          ? `0 0 20px ${this.deviceData.color}` 
          : 'none'
      };
    }
  },
  methods: {
    getModeText(mode) {
      const modeMap = {
        'normal': '普通',
        'reading': '阅读',
        'cinema': '影院',
        'party': '派对'
      };
      
      return modeMap[mode] || mode;
    }
  }
};
</script>

<style lang="scss" scoped>
.light-device-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
}

.light-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.light-icon {
  font-size: 36px;
  color: rgba(255, 255, 255, 0.9);
}

.light-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.light-info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.light-info-label {
  width: 50px;
  color: #606266;
}

.light-brightness-bar {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background-color: #f5f7fa;
  overflow: hidden;
  margin: 0 10px;
}

.light-brightness-fill {
  height: 100%;
  background-color: #409EFF;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.light-brightness-value {
  width: 40px;
  text-align: right;
}

.light-color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 10px;
  border: 1px solid #dcdfe6;
}

.light-color-value, .light-mode-value {
  flex: 1;
  text-align: right;
  color: #333;
}
</style>