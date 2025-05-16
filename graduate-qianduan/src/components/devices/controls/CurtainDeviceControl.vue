<template>
  <div>
    <div class="control-section">
      <div class="control-label">位置</div>
      <div class="control-slider">
        <el-slider 
          :model-value="deviceData.position"
          @update:model-value="updatePosition"
          :min="0" 
          :max="100"
          :disabled="disabled"
        />
        <div class="slider-value">{{ deviceData.position }}%</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CurtainDeviceControl',
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
    // 更新位置事件处理
    const updatePosition = (value) => {
      emit('update:deviceData', {
        ...props.deviceData,
        position: value
      });
    }
    
    return {
      updatePosition
    }
  }
}
</script>