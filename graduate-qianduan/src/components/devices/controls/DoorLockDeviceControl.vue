<template>
  <div>
    <!-- 锁状态 -->
    <div class="control-section">
      <div class="lock-control">
        <div class="lock-status" :class="{ 'locked': deviceData.locked }">
          <i :class="deviceData.locked ? 'el-icon-lock' : 'el-icon-unlock'"></i>
          <div class="lock-text">{{ deviceData.locked ? '已锁定' : '已解锁' }}</div>
        </div>
        
        <el-button 
          type="primary" 
          :icon="deviceData.locked ? 'el-icon-unlock' : 'el-icon-lock'"
          @click="toggleLock" 
          :disabled="disabled"
          class="lock-button"
        >
          {{ deviceData.locked ? '解锁' : '锁定' }}
        </el-button>
      </div>
    </div>
    
    <!-- 安全模式 -->
    <div class="control-section">
      <div class="control-header">
        <div class="control-label">安全模式</div>
      </div>
      <el-select 
        :model-value="deviceData.securityMode" 
        @update:model-value="updateSecurityMode"
        style="width: 100%;" 
        :disabled="disabled"
      >
        <el-option label="标准模式" value="standard" />
        <el-option label="高安全模式" value="high" />
        <el-option label="假日模式" value="vacation" />
        <el-option label="访客模式" value="guest" />
      </el-select>
    </div>
    
    <!-- 访问记录 -->
    <div class="control-section">
      <div class="control-header">
        <div class="control-label">最近访问记录</div>
        <el-button 
          type="text" 
          size="small" 
          icon="el-icon-delete" 
          @click="clearLogs" 
          :disabled="disabled || !deviceData.accessLogs || deviceData.accessLogs.length === 0"
        >
          清空记录
        </el-button>
      </div>
      <div class="access-logs">
        <el-empty v-if="!deviceData.accessLogs || deviceData.accessLogs.length === 0" description="暂无访问记录" :image-size="50" />
        <div v-else class="log-list">
          <div v-for="(log, index) in deviceData.accessLogs" :key="index" class="log-item">
            <div class="log-icon">
              <i :class="log.action === 'unlock' ? 'el-icon-unlock' : 'el-icon-lock'"></i>
            </div>
            <div class="log-info">
              <div class="log-action">{{ log.action === 'unlock' ? '解锁' : '锁定' }}</div>
              <div class="log-time">{{ log.time }}</div>
            </div>
            <div class="log-user">{{ log.user || '未知用户' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'

export default {
  name: 'DoorLockDeviceControl',
  props: {
    deviceData: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },  setup(props, { emit }) {
    // 切换锁状态
    const toggleLock = () => {
      // 当前时间
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // 创建新的访问记录
      const newLog = {
        action: props.deviceData.locked ? 'unlock' : 'lock',
        time: timeStr,
        user: '当前用户' // 这里可以替换为实际的用户名
      };
      
      // 获取现有的日志记录或创建新数组
      const accessLogs = props.deviceData.accessLogs ? [...props.deviceData.accessLogs] : [];
      
      // 将新日志添加到开头
      accessLogs.unshift(newLog);
      
      // 只保留最近5条记录
      const recentLogs = accessLogs.slice(0, 5);
        // 更新设备数据
      emit('update:deviceData', {
        ...props.deviceData,
        locked: !props.deviceData.locked,
        accessLogs: recentLogs
      });
    }
      // 更新安全模式
    const updateSecurityMode = (value) => {
      emit('update:deviceData', {
        ...props.deviceData,
        securityMode: value
      });
    }
      // 清空访问记录
    const clearLogs = () => {
      emit('update:deviceData', {
        ...props.deviceData,
        accessLogs: [],
        lastClearedDate: new Date().toISOString().split('T')[0] // 保存最后清空的日期
      });
    }
    
    // 检查是否需要自动清空记录
    const checkAndClearLogs = () => {
      // 如果没有设置最后清空日期或者日期不是今天，则清空记录
      const today = new Date().toISOString().split('T')[0];
      if (!props.deviceData.lastClearedDate || props.deviceData.lastClearedDate !== today) {
        // 只有当有记录时才清空
        if (props.deviceData.accessLogs && props.deviceData.accessLogs.length > 0) {
          clearLogs();
        } else {          // 即使没有记录，也要更新最后清空日期
          emit('update:deviceData', {
            ...props.deviceData,
            lastClearedDate: today
          });
        }
      }
    }
    
    // 组件挂载时检查是否需要清空记录
    onMounted(() => {
      checkAndClearLogs();
    });
    
    return {
      toggleLock,
      updateSecurityMode,
      clearLogs
    }
  }
}
</script>

<style scoped>
.control-section {
  margin-bottom: 20px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.control-label {
  font-size: 14px;
  color: #5F6368;
}

.lock-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
}

.lock-status {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lock-status i {
  font-size: 30px;
  color: #f56c6c;
  margin-bottom: 5px;
}

.lock-status.locked i {
  color: #67c23a;
}

.lock-text {
  font-size: 14px;
  font-weight: 500;
}

.lock-button {
  height: 40px;
}

.access-logs {
  max-height: 200px;
  overflow-y: auto;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #ebeef5;
}

.log-item:last-child {
  border-bottom: none;
}

.log-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e6f1fc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.log-icon i {
  font-size: 20px;
  color: #409eff;
}

.log-info {
  flex-grow: 1;
}

.log-action {
  font-size: 14px;
  color: #303133;
}

.log-time {
  font-size: 12px;
  color: #909399;
}

.log-user {
  font-size: 13px;
  color: #606266;
}
</style>