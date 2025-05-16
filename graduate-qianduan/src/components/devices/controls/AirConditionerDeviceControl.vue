<template>
  <div>
    <div class="control-section">
      <div class="control-label">温度</div>
      <div class="control-slider">
        <el-slider 
          :model-value="deviceData.temperature"
          @update:model-value="updateTemperature"
          :min="16" 
          :max="30"
          :disabled="disabled"
        />
        <div class="slider-value">{{ deviceData.temperature }}°C</div>
      </div>
    </div>
    
    <div class="control-section">
      <div class="control-label">模式</div>
      <el-select 
        :model-value="deviceData.mode" 
        @update:model-value="updateMode"
        style="width: 100%;" 
        :disabled="disabled"
      >
        <el-option label="制冷" value="cool" />
        <el-option label="制热" value="heat" />
        <el-option label="自动" value="auto" />
        <el-option label="送风" value="fan" />
      </el-select>
    </div>
    
    <div class="control-section">
      <div class="control-label">风速</div>
      <el-select 
        :model-value="deviceData.fanSpeed" 
        @update:model-value="updateFanSpeed"
        style="width: 100%;" 
        :disabled="disabled"
      >
        <el-option label="自动" value="auto" />
        <el-option label="低速" value="low" />
        <el-option label="中速" value="medium" />
        <el-option label="高速" value="high" />
      </el-select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AirConditionerDeviceControl',
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
    // 更新温度
    const updateTemperature = (value) => {
      emit('update:deviceData', {
        ...props.deviceData,
        temperature: value
      });
    }
    
    // 更新模式
    const updateMode = (value) => {
      emit('update:deviceData', {
        ...props.deviceData,
        mode: value
      });
    }
    
    // 更新风速
    const updateFanSpeed = (value) => {
      emit('update:deviceData', {
        ...props.deviceData,
        fanSpeed: value
      });
    }
    
    return {
      updateTemperature,
      updateMode,
      updateFanSpeed
    }
  }
}
</script>