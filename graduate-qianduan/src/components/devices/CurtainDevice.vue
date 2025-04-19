<template>
  <default-device :device="device" deviceType="curtain" @edit="$emit('edit', device)" @detail="$emit('detail', device)">
    <template #content>
      <div class="curtain-device-content">
        <!-- 自定义窗帘组件的显示内容 -->
        <div class="curtain-preview">
          <div class="curtain-window">
            <div class="curtain-rail"></div>
            <div class="curtain-fabric" :style="curtainStyles"></div>
          </div>
        </div>
        
        <div class="curtain-info">
          <div class="curtain-info-item">
            <span class="curtain-info-label">位置:</span>
            <div class="curtain-position-bar">
              <div class="curtain-position-fill" :style="{ width: `${deviceData.position}%` }"></div>
            </div>
            <span class="curtain-position-value">{{ deviceData.position }}%</span>
          </div>
          
          <div class="curtain-info-item">
            <span class="curtain-info-label">材质:</span>
            <span class="curtain-material-value">{{ getMaterialText(deviceData.material) }}</span>
          </div>
          
          <div class="curtain-info-item">
            <span class="curtain-info-label">模式:</span>
            <span class="curtain-mode-value">{{ getModeText(deviceData.mode) }}</span>
          </div>
        </div>
      </div>
    </template>
  </default-device>
</template>

<script>
import DefaultDevice from './DefaultDevice.vue';

export default {
  name: 'CurtainDevice',
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
    curtainStyles() {
      // 根据窗帘开启程度来显示
      const position = this.deviceData.position || 0;
      const materialColorMap = {
        'cotton': '#f0f0f0',
        'linen': '#e8d6c0',
        'polyester': '#e8e8e8',
        'blackout': '#333333'
      };
      const color = materialColorMap[this.deviceData.material] || '#f0f0f0';
      
      return {
        height: `${100 - position}%`,
        backgroundColor: color
      };
    }
  },
  methods: {
    getMaterialText(material) {
      const materialMap = {
        'cotton': '棉布',
        'linen': '亚麻',
        'polyester': '涤纶',
        'blackout': '遮光布'
      };
      
      return materialMap[material] || material;
    },
    getModeText(mode) {
      const modeMap = {
        'manual': '手动',
        'auto': '自动',
        'schedule': '定时'
      };
      
      return modeMap[mode] || mode;
    }
  }
};
</script>

<style lang="scss" scoped>
.curtain-device-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
}

.curtain-preview {
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.curtain-window {
  width: 80%;
  height: 100%;
  border: 2px solid #a0a0a0;
  border-radius: 4px;
  background-color: #e8f4ff;
  position: relative;
  overflow: hidden;
}

.curtain-rail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background-color: #777;
}

.curtain-fabric {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  transition: height 0.5s ease;
}

.curtain-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.curtain-info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.curtain-info-label {
  width: 50px;
  color: #606266;
}

.curtain-position-bar {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background-color: #f5f7fa;
  overflow: hidden;
  margin: 0 10px;
}

.curtain-position-fill {
  height: 100%;
  background-color: #409EFF;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.curtain-position-value {
  width: 40px;
  text-align: right;
}

.curtain-material-value, .curtain-mode-value {
  flex: 1;
  text-align: right;
  color: #333;
}
</style>