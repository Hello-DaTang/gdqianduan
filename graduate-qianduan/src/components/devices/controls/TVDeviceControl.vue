<template>
  <div>
    <!-- 音量控制 -->
    <div class="control-section">
      <div class="control-label">音量</div>
      <div class="control-slider">
        <el-slider 
          :model-value="deviceData.volume" 
          @update:model-value="updateVolume"
          :min="0" 
          :max="100"
          :disabled="disabled"
        />
        <div class="slider-value">{{ deviceData.volume }}%</div>
      </div>
    </div>
    
    <!-- 频道控制 -->
    <div class="control-section">
      <div class="control-label">频道</div>
      <div class="channel-control">
        <el-input-number
          :model-value="deviceData.channel"
          @update:model-value="updateChannel"
          :min="1"
          :max="999"
          :disabled="disabled"
          size="small"
          controls-position="right"
        ></el-input-number>
        
        <div class="channel-buttons">
          <el-button 
            size="small" 
            icon="el-icon-arrow-down" 
            @click="changeChannel(-1)" 
            :disabled="disabled"
            circle
          ></el-button>
          <el-button 
            size="small" 
            icon="el-icon-arrow-up" 
            @click="changeChannel(1)" 
            :disabled="disabled"
            circle
          ></el-button>
        </div>
      </div>
    </div>
    
    <!-- 输入源 -->
    <div class="control-section">
      <div class="control-label">输入源</div>
      <el-select 
        :model-value="deviceData.source" 
        @update:model-value="updateSource"
        style="width: 100%;" 
        :disabled="disabled"
      >
        <el-option label="电视" value="tv" />
        <el-option label="HDMI 1" value="hdmi1" />
        <el-option label="HDMI 2" value="hdmi2" />
        <el-option label="HDMI 3" value="hdmi3" />
        <el-option label="AV" value="av" />
        <el-option label="USB" value="usb" />
      </el-select>
    </div>
    
    <!-- 快捷应用 -->
    <div class="control-section">
      <div class="control-label">快捷应用</div>
      <div class="app-grid">
        <div 
          v-for="app in tvApps" 
          :key="app.id"
          class="app-item"
          :class="{ 'active': deviceData.currentApp === app.id }"
          @click="!disabled && launchApp(app.id)"
        >
          <div class="app-icon">
            <i :class="app.icon"></i>
          </div>
          <div class="app-name">{{ app.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TVDeviceControl',
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
    // 电视应用列表
    const tvApps = [
      { id: 'youtube', name: 'YouTube', icon: 'el-icon-video-play' },
      { id: 'netflix', name: 'Netflix', icon: 'el-icon-film' },
      { id: 'prime', name: 'Prime Video', icon: 'el-icon-video-camera' },
      { id: 'browser', name: '浏览器', icon: 'el-icon-connection' },
      { id: 'photo', name: '相册', icon: 'el-icon-picture' },
      { id: 'music', name: '音乐', icon: 'el-icon-headset' }
    ];
    
    // 更新音量
    const updateVolume = (value) => {
      emit('update:device-data', {
        ...props.deviceData,
        volume: value
      });
    }
    
    // 更新频道
    const updateChannel = (value) => {
      emit('update:device-data', {
        ...props.deviceData,
        channel: value
      });
    }
    
    // 频道加减
    const changeChannel = (step) => {
      const newChannel = Math.max(1, Math.min(999, (props.deviceData.channel || 1) + step));
      updateChannel(newChannel);
    }
    
    // 更新输入源
    const updateSource = (value) => {
      emit('update:device-data', {
        ...props.deviceData,
        source: value
      });
    }
    
    // 启动应用
    const launchApp = (appId) => {
      emit('update:device-data', {
        ...props.deviceData,
        currentApp: appId
      });
    }
    
    return {
      tvApps,
      updateVolume,
      updateChannel,
      changeChannel,
      updateSource,
      launchApp
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

.control-slider {
  display: flex;
  align-items: center;
}

.slider-value {
  width: 50px;
  text-align: right;
  font-size: 14px;
  color: #3C4043;
  margin-left: 10px;
}

.channel-control {
  display: flex;
  align-items: center;
  gap: 20px;
}

.channel-buttons {
  display: flex;
  gap: 10px;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.app-item {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-item:hover {
  background-color: #ecf5ff;
}

.app-item.active {
  background-color: #409eff;
  color: white;
}

.app-icon {
  margin-bottom: 5px;
}

.app-icon i {
  font-size: 20px;
}

.app-name {
  font-size: 12px;
  text-align: center;
}
</style>