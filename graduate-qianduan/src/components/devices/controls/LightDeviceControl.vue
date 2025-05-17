<template>
  <div>
    <div class="control-section">
      <div class="control-label">亮度</div>
      <div class="control-slider">
        <el-slider 
          :model-value="deviceData.brightness"
          @update:model-value="updateBrightness"
          :min="0" 
          :max="100"
          :disabled="disabled"
        />
        <div class="slider-value">{{ deviceData.brightness }}%</div>
      </div>
    </div>
    
    <div class="control-section">
      <div class="control-label">颜色</div>
      <div class="color-picker">
        <div 
          v-for="color in colorOptions" 
          :key="color.value"
          class="color-circle"
          :class="{ active: deviceData.color === color.value }"
          :style="{ background: color.value }"
          @click="!disabled && updateColor(color.value)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LightDeviceControl',
  props: {
    deviceData: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    // 灯光颜色选项
    const colorOptions = [
      { name: '白色', value: '#FFFFFF' },
      { name: '暖白', value: '#F5DEB3' },
      { name: '黄色', value: '#FFFF00' },
      { name: '蓝色', value: '#0000FF' },
      { name: '红色', value: '#FF0000' },
      { name: '绿色', value: '#00FF00' }
    ]
    
    // 更新亮度事件处理
    const updateBrightness = (value) => {
      emit('update:deviceData', {
        ...props.deviceData,
        brightness: value
      });
    }
    
    // 更新颜色事件处理
    const updateColor = (value) => {
      emit('update:deviceData', {
        ...props.deviceData,
        color: value
      });
    }
    
    return {
      colorOptions,
      updateBrightness,
      updateColor
    }
  }
}
</script>

<style scoped>
.control-section {
  margin-bottom: 20px;
}

.control-label {
  font-size: 14px;
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
}

.control-slider {
  display: flex;
  align-items: center;
}

.slider-value {
  margin-left: 15px;
  min-width: 45px;
  text-align: center;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-circle:hover {
  transform: scale(1.1);
}

.color-circle.active {
  border-color: #409EFF;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
}
</style>