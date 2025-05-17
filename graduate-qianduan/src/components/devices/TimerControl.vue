<template>
  <div class="timer-control">
    <div class="timer-header">
      <div class="timer-title">{{ label }}</div>
      <el-switch
        v-model="timerEnabled"
        active-color="#4285F4"
        inactive-color="#dcdfe6"
        @change="toggleTimer"
      />
    </div>
    
    <div v-if="timerEnabled" class="timer-settings">
      <div class="time-picker">
        <el-time-picker
          v-model="timerTime"
          format="HH:mm"
          placeholder="选择时间"
          style="width: 100%"
          @change="updateTimer"
        />
      </div>
      
      <div class="action-select">
        <el-form-item label="定时操作">
          <el-select v-model="timerAction" placeholder="选择操作" style="width: 100%" @change="updateTimer">
            <el-option
              v-for="option in actionOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </div>
    </div>
    
    <!-- 定时任务执行时间提示 -->
    <div v-if="timerEnabled && nextExecutionTime" class="timer-info">
      <div class="timer-info-icon">
        <i class="el-icon-time"></i>
      </div>
      <div class="timer-info-text">
        将在 <span class="timer-time">{{ getTimeString(nextExecutionTime) }}</span> 
        <span class="timer-day">{{ isToday(nextExecutionTime) ? '今天' : '明天' }}</span>
        执行 <span class="timer-action">{{ getActionLabel(timerAction) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed, onMounted } from 'vue'
import { ElNotification } from 'element-plus'

export default {
  name: 'TimerControl',
  props: {
    value: {
      type: Object,
      default: null
    },
    label: {
      type: String,
      default: '定时设置'
    },
    deviceType: {
      type: String,
      default: 'light'
    }
  },
  emits: ['update:value', 'change'],
  setup(props, { emit }) {
    const timerEnabled = ref(false)
    const timerTime = ref(null)
    const timerAction = ref('on')
    const nextExecutionTime = ref(null)
    
    // 根据设备类型生成不同的动作选项
    const actionOptions = computed(() => {
      const commonOptions = [
        { label: '开启', value: 'on' },
        { label: '关闭', value: 'off' }
      ]
      
      // 设备类型特定的选项
      switch (props.deviceType) {
        case 'light':
          return [
            ...commonOptions,
            { label: '调暗', value: 'dim' },
            { label: '调亮', value: 'brighten' }
          ]
        case 'curtain':
          return [
            ...commonOptions,
            { label: '打开', value: 'open' },
            { label: '关闭', value: 'close' }
          ]
        case 'airConditioner':
          return [
            ...commonOptions,
            { label: '制冷模式', value: 'cool' },
            { label: '制热模式', value: 'heat' }
          ]
        case 'doorLock':
          return [
            { label: '上锁', value: 'lock' },
            { label: '解锁', value: 'unlock' }
          ]
        case 'tv':
        case 'speaker':
          return commonOptions
        default:
          return commonOptions
      }
    })
    
    // 初始化值
    onMounted(() => {
      if (props.value) {
        timerEnabled.value = !!props.value.enabled
        
        if (props.value.time) {
          // 转换字符串时间为Date对象
          const [hours, minutes] = props.value.time.split(':').map(Number)
          const date = new Date()
          date.setHours(hours)
          date.setMinutes(minutes)
          timerTime.value = date
        }
        
        if (props.value.action) {
          timerAction.value = props.value.action
        }
      }
    })
    
    // 监听props变化
    watch(() => props.value, (newValue) => {
      if (newValue) {
        timerEnabled.value = !!newValue.enabled
        
        if (newValue.time) {
          // 转换字符串时间为Date对象
          const [hours, minutes] = newValue.time.split(':').map(Number)
          const date = new Date()
          date.setHours(hours)
          date.setMinutes(minutes)
          timerTime.value = date
        }
        
        if (newValue.action) {
          timerAction.value = newValue.action
        }
      } else {
        timerEnabled.value = false
        timerTime.value = null
        timerAction.value = 'on'
      }
    })
      // 更新定时器
    const updateTimer = () => {
      if (!timerTime.value) return
      
      const hours = timerTime.value.getHours().toString().padStart(2, '0')
      const minutes = timerTime.value.getMinutes().toString().padStart(2, '0')
      const timeString = `${hours}:${minutes}`
      
      const timer = {
        time: timeString,
        action: timerAction.value,
        enabled: timerEnabled.value,
        lastUpdated: new Date().toISOString() // 添加更新时间记录
      }
        // 计算并更新下次执行时间
      const targetTime = updateNextExecutionTime();
      const now = new Date();
      
      nextExecutionTime.value = targetTime
        // 提示用户定时设置已保存
      if (timerEnabled.value) {
        ElNotification({
          title: '定时任务已设置',
          message: `将在 ${targetTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} ${targetTime.getDate() === now.getDate() ? '今天' : '明天'} 执行 ${getActionLabel(timerAction.value)} 操作`,
          type: 'success',
          duration: 5000
        });
      } else {
        ElNotification({
          title: '定时任务已关闭',
          message: '设备将不会自动执行任何操作',
          type: 'info',
          duration: 3000
        });
      }
      
      emit('update:value', timer)
      emit('change', timer)
    }
    
    // 获取操作的中文标签
    const getActionLabel = (actionValue) => {
      const option = actionOptions.value.find(opt => opt.value === actionValue)
      return option ? option.label : actionValue
    }
    
    // 格式化时间显示
    const getTimeString = (date) => {
      return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    }
    
    // 判断是否是今天
    const isToday = (date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    }
    
    // 更新下次执行时间
    const updateNextExecutionTime = () => {
      if (!timerTime.value) return null;
      
      const hours = timerTime.value.getHours();
      const minutes = timerTime.value.getMinutes();
      
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);
      
      // 如果目标时间已经过去，那么设置为明天的这个时间
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      nextExecutionTime.value = targetTime;
      return targetTime;
    }
      // 切换定时器启用状态
    const toggleTimer = () => {
      if (timerEnabled.value && !timerTime.value) {
        // 如果启用但没有设置时间，设置默认时间为当前时间后1小时
        const date = new Date()
        date.setHours(date.getHours() + 1)
        timerTime.value = date
      }
      
      updateTimer()
      updateNextExecutionTime()
    }
      return {
      timerEnabled,
      timerTime,
      timerAction,
      actionOptions,
      nextExecutionTime,
      updateTimer,
      toggleTimer,
      getTimeString,
      isToday,
      getActionLabel
    }
  }
}
</script>

<style scoped>
.timer-control {
  margin-bottom: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  background-color: #f9fafc;
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.timer-title {
  font-weight: 500;
  color: #606266;
}

.timer-settings {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

@media (min-width: 576px) {
  .timer-settings {
    grid-template-columns: 1fr 1fr;
  }
}

.time-picker,
.action-select {
  width: 100%;
}

.timer-info {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-top: 15px;
}

.timer-info-icon {
  font-size: 18px;
  color: #4285F4;
  margin-right: 10px;
}

.timer-info-text {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.timer-time {
  font-weight: 500;
  color: #333;
}

.timer-day {
  font-weight: 400;
  color: #999;
}

.timer-action {
  font-weight: 500;
  color: #4285F4;
}
</style>
