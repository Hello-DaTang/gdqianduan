<template>
  <div class="device-card">
    <div class="device-header">
      <div class="device-title">
        <i :class="deviceIcon" class="device-icon"></i>
        <span>{{ device.homeName }}</span>
      </div>
      <div class="device-status" :class="{'device-status-active': isDeviceOn}">
        {{ statusText }}
      </div>
    </div>
    
    <div class="device-body">
      <slot name="content">
        <div class="device-info">
          <div class="device-info-item" v-for="(value, key) in displayableData" :key="key">
            <span class="device-info-label">{{ getOptionLabel(key) }}:</span>
            <span class="device-info-value">{{ formatValue(key, value) }}</span>
          </div>
        </div>
      </slot>
    </div>
    
    <div class="device-footer">
      <el-button size="small" type="primary" @click="$emit('edit', device)">
        控制
      </el-button>
      <el-button size="small" @click="$emit('detail', device)">
        详情
      </el-button>
    </div>
  </div>
</template>

<script>
import { getConfigOptions } from '@/utils/deviceTypes';

export default {
  name: 'DefaultDevice',
  props: {
    device: {
      type: Object,
      required: true
    },
    deviceType: {
      type: String,
      default: 'default'
    }
  },
  computed: {
    deviceData() {
      return this.device.deviceData || {};
    },
    deviceIcon() {
      return 'el-icon-setting';
    },
    isDeviceOn() {
      const status = this.deviceData.status;
      return status === 'on' || status === 'open' || status === 'active';
    },
    statusText() {
      return this.isDeviceOn ? '开启' : '关闭';
    },
    displayableData() {
      // 提取需要显示的数据字段
      const result = {};
      const options = getConfigOptions(this.deviceType);
      
      if (options && options.length) {
        // 如果有配置选项，则使用配置选项中定义的字段
        options.forEach(option => {
          if (this.deviceData[option.key] !== undefined) {
            result[option.key] = this.deviceData[option.key];
          }
        });
      } else {
        // 否则，使用原始数据的全部字段
        Object.assign(result, this.deviceData);
      }
      
      // 移除状态字段，因为已经单独显示了
      delete result.status;
      
      return result;
    }
  },
  methods: {
    getOptionLabel(key) {
      // 获取配置项的标签
      const options = getConfigOptions(this.deviceType);
      const option = options.find(opt => opt.key === key);
      
      return option ? option.label : key;
    },
    formatValue(key, value) {
      // 根据配置项类型格式化值
      const options = getConfigOptions(this.deviceType);
      const option = options.find(opt => opt.key === key);
      
      if (!option) return value;
      
      switch (option.type) {
        case 'slider':
          return `${value}${key === 'temperature' ? '°C' : '%'}`;
        case 'color':
          return value;
        case 'select':
          return value;
        default:
          return value;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.device-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 16px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.device-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.device-icon {
  margin-right: 8px;
  font-size: 20px;
  color: #409EFF;
}

.device-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: #f5f7fa;
  color: #909399;
}

.device-status-active {
  background-color: #f0f9eb;
  color: #67c23a;
}

.device-body {
  flex: 1;
  margin-bottom: 16px;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-info-item {
  display: flex;
  justify-content: space-between;
}

.device-info-label {
  color: #606266;
}

.device-info-value {
  font-weight: 500;
}

.device-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>