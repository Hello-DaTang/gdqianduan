<template>
  <div>
    <!-- 基本控制选项 -->
    <div class="control-section">
      <div class="control-label">设备模式</div>
      <el-select 
        :model-value="deviceData.mode" 
        @update:model-value="updateMode"
        style="width: 100%;" 
        :disabled="disabled"
      >
        <el-option label="正常模式" value="normal" />
        <el-option label="节能模式" value="eco" />
        <el-option label="增强模式" value="boost" />
      </el-select>
    </div>
    
    <!-- 自定义参数控制 -->
    <div class="control-section" v-if="deviceData.customParams">
      <div class="control-label">自定义参数</div>
      <div class="custom-params">
        <div v-for="(value, key) in deviceData.customParams" :key="key" class="custom-param-item">
          <div class="param-label">{{ getReadableParamName(key) }}</div>
          <div class="param-control">
            <!-- 对于数值类型的参数使用滑块 -->
            <template v-if="typeof value === 'number'">
              <el-slider 
                :model-value="value"
                @update:model-value="(val) => updateCustomParam(key, val)"
                :min="0"
                :max="100"
                :disabled="disabled"
              />
              <div class="param-value">{{ value }}</div>
            </template>
            
            <!-- 对于布尔类型的参数使用开关 -->
            <template v-else-if="typeof value === 'boolean'">
              <el-switch
                :model-value="value"
                @update:model-value="(val) => updateCustomParam(key, val)"
                :disabled="disabled"
              />
            </template>
            
            <!-- 对于字符串类型的参数使用输入框 -->
            <template v-else>
              <el-input
                :model-value="value"
                @update:model-value="(val) => updateCustomParam(key, val)"
                :disabled="disabled"
                size="small"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DefaultDeviceControl',
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
    // 更新模式
    const updateMode = (value) => {
      emit('update:device-data', {
        ...props.deviceData,
        mode: value
      });
    }
    
    // 更新自定义参数
    const updateCustomParam = (key, value) => {
      const updatedCustomParams = { 
        ...props.deviceData.customParams,
        [key]: value
      };
      
      emit('update:device-data', {
        ...props.deviceData,
        customParams: updatedCustomParams
      });
    }
    
    // 将参数名转换为可读的名称
    const getReadableParamName = (key) => {
      const nameMap = {
        level: '级别',
        volume: '音量',
        intensity: '强度',
        speed: '速度',
        temperature: '温度',
        humidity: '湿度',
        pressure: '压力',
        angle: '角度',
        distance: '距离',
        duration: '持续时间',
        frequency: '频率',
        isEnabled: '是否启用',
        isLocked: '是否锁定',
        isActive: '是否激活'
      };
      
      return nameMap[key] || key;
    }
    
    return {
      updateMode,
      updateCustomParam,
      getReadableParamName
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
  color: #5F6368;
  margin-bottom: 10px;
}

.custom-params {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
}

.custom-param-item {
  margin-bottom: 15px;
}

.custom-param-item:last-child {
  margin-bottom: 0;
}

.param-label {
  font-size: 13px;
  color: #5F6368;
  margin-bottom: 5px;
}

.param-control {
  display: flex;
  align-items: center;
}

.param-value {
  min-width: 40px;
  text-align: right;
  margin-left: 10px;
  font-size: 13px;
  color: #3C4043;
}
</style>