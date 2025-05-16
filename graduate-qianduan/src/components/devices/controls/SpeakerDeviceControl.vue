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
    
    <!-- 低音调节 -->
    <div class="control-section">
      <div class="control-label">低音</div>
      <div class="control-slider">
        <el-slider 
          :model-value="deviceData.bass" 
          @update:model-value="updateBass"
          :min="-10" 
          :max="10"
          :disabled="disabled"
        />
        <div class="slider-value">{{ deviceData.bass }}</div>
      </div>
    </div>
    
    <!-- 高音调节 -->
    <div class="control-section">
      <div class="control-label">高音</div>
      <div class="control-slider">
        <el-slider 
          :model-value="deviceData.treble" 
          @update:model-value="updateTreble"
          :min="-10" 
          :max="10"
          :disabled="disabled"
        />
        <div class="slider-value">{{ deviceData.treble }}</div>
      </div>
    </div>
    
    <!-- 音效模式 -->
    <div class="control-section">
      <div class="control-label">音效模式</div>
      <el-select 
        :model-value="deviceData.soundMode" 
        @update:model-value="updateSoundMode"
        style="width: 100%;" 
        :disabled="disabled"
      >
        <el-option label="标准" value="standard" />
        <el-option label="电影" value="movie" />
        <el-option label="音乐" value="music" />
        <el-option label="对话" value="dialogue" />
        <el-option label="游戏" value="game" />
        <el-option label="自定义" value="custom" />
      </el-select>
    </div>
    
    <!-- 输入源 -->
    <div class="control-section">
      <div class="control-label">输入源</div>
      <div class="source-buttons">
        <el-radio-group 
          :model-value="deviceData.source" 
          @update:model-value="updateSource"
          :disabled="disabled"
          size="small"
        >
          <el-radio-button label="bluetooth">蓝牙</el-radio-button>
          <el-radio-button label="aux">AUX</el-radio-button>
          <el-radio-button label="optical">光纤</el-radio-button>
          <el-radio-button label="wifi">WiFi</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    
    <!-- 当前播放 -->
    <div class="control-section" v-if="deviceData.currentTrack">
      <div class="control-label">当前播放</div>
      <div class="now-playing">
        <div class="track-info">
          <div class="track-title">{{ deviceData.currentTrack.title || '未知歌曲' }}</div>
          <div class="track-artist">{{ deviceData.currentTrack.artist || '未知艺术家' }}</div>
        </div>
        <div class="player-controls">
          <el-button 
            size="small" 
            icon="el-icon-arrow-left" 
            circle
            :disabled="disabled"
            @click="prevTrack"
          ></el-button>
          <el-button 
            size="small" 
            :icon="deviceData.playing ? 'el-icon-video-pause' : 'el-icon-video-play'" 
            circle
            :disabled="disabled"
            @click="togglePlay"
          ></el-button>
          <el-button 
            size="small" 
            icon="el-icon-arrow-right" 
            circle
            :disabled="disabled"
            @click="nextTrack"
          ></el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpeakerDeviceControl',
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
    // 更新音量
    const updateVolume = (value) => {
      emit('update:device-data', {
        ...props.deviceData,
        volume: value
      });
    }
    
    // 更新低音
    const updateBass = (value) => {
      emit('update:device-data', {
        ...props.deviceData,
        bass: value
      });
    }
    
    // 更新高音
    const updateTreble = (value) => {
      emit('update:device-data', {
        ...props.deviceData,
        treble: value
      });
    }
    
    // 更新音效模式
    const updateSoundMode = (value) => {
      emit('update:device-data', {
        ...props.deviceData,
        soundMode: value
      });
    }
    
    // 更新输入源
    const updateSource = (value) => {
      emit('update:device-data', {
        ...props.deviceData,
        source: value
      });
    }
    
    // 切换播放状态
    const togglePlay = () => {
      emit('update:device-data', {
        ...props.deviceData,
        playing: !props.deviceData.playing
      });
    }
    
    // 上一曲
    const prevTrack = () => {
      // 这里只是模拟，实际应用中可能需要调用API
      const dummyTracks = [
        { title: '心墙', artist: '林贝依' },
        { title: '晴天', artist: '周杰伦' },
        { title: '同步', artist: '周深' },
        { title: '海底', artist: '迪豆音' }
      ];
      
      const randomTrack = dummyTracks[Math.floor(Math.random() * dummyTracks.length)];
      
      emit('update:device-data', {
        ...props.deviceData,
        currentTrack: randomTrack,
        playing: true
      });
    }
    
    // 下一曲
    const nextTrack = () => {
      // 复用上一曲的逻辑，实际应用中应有所区别
      prevTrack();
    }
    
    return {
      updateVolume,
      updateBass,
      updateTreble,
      updateSoundMode,
      updateSource,
      togglePlay,
      prevTrack,
      nextTrack
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

.source-buttons {
  display: flex;
  justify-content: center;
}

.now-playing {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
}

.track-info {
  margin-bottom: 15px;
}

.track-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.track-artist {
  font-size: 14px;
  color: #606266;
}

.player-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
}
</style>