<template>
  <modern-page-container title="智能家居控制中心">
    <div class="welcome-section">
      <modern-card hoverable>
        <div class="welcome-content">
          <div class="welcome-text">
            <h1>欢迎使用智能家居管理系统</h1>
            <p>这里是您的智能家居控制中心，您可以在这里管理所有设备和查看家居状态。</p>
            <modern-button 
              type="primary" 
              size="large" 
              icon="el-icon-discover"
              text="开始探索"
              @click="startExplore"
            ></modern-button>
          </div>
          <div class="welcome-image">
            <img src="https://img.freepik.com/free-vector/smart-home-concept-illustration_114360-7342.jpg" alt="智能家居图片">
          </div>
        </div>
      </modern-card>
    </div>
    
    <!-- 状态概览部分 -->
    <div class="status-section">
      <div class="status-grid">
        <modern-card v-for="(stat, index) in stats" :key="index" hoverable>
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </modern-card>
      </div>
    </div>
    
    <!-- 轮播图部分 -->
    <modern-card title="智能家居提示">
      <el-carousel height="200px">
        <el-carousel-item v-for="(tip, index) in tips" :key="index">
          <div class="carousel-content" :style="{ backgroundImage: `url(${tip.image})` }">
            <div class="carousel-overlay">
              <h3>{{ tip.title }}</h3>
              <p>{{ tip.description }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </modern-card>
  </modern-page-container>
</template>

<script>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import ModernPageContainer from '@/components/layout/ModernPageContainer.vue'
import ModernCard from '@/components/layout/ModernCard.vue'
import ModernButton from '@/components/ui/ModernButton.vue'

export default {
  name: 'DashboardView',
  components: {
    ModernPageContainer,
    ModernCard,
    ModernButton
  },
  setup() {
    const router = useRouter()
    
    // 统计卡片数据
    const stats = reactive([
      { label: '连接设备', value: '16', icon: 'el-icon-connection', color: '#4285F4' },
      { label: '离线设备', value: '2', icon: 'el-icon-warning', color: '#EA4335' },
      { label: '今日用电量', value: '9.6 kWh', icon: 'el-icon-lightning', color: '#FBBC05' },
      { label: '节能表现', value: '良好', icon: 'el-icon-success', color: '#34A853' }
    ])
    
    // 轮播图数据
    const tips = reactive([
      {
        title: '季节变化，温度调节',
        description: '随着季节变化，记得调整您的中央空调温度，以获得最佳舒适度和节能效果。',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        title: '定时关灯省电',
        description: '设置灯光定时关闭功能，避免不必要的能源浪费，延长灯具使用寿命。',
        image: 'https://images.unsplash.com/photo-1564515963606-d01fd5901c82?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        title: '智能家居语音控制',
        description: '通过语音助手控制您的设备，免去复杂的操作，让家居生活更简单。',
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      }
    ])
    
    // 开始探索
    const startExplore = () => {
      router.push('/chat')
    }
    
    return {
      stats,
      tips,
      startExplore
    }
  }
}
</script>

<style lang="scss" scoped>
.welcome-section {
  margin-bottom: 20px;
}

.welcome-content {
  display: flex;
  align-items: center;
}

.welcome-text {
  flex: 1;
  padding-right: 20px;
  
  h1 {
    font-size: 28px;
    color: #333;
    margin-bottom: 16px;
    background: linear-gradient(45deg, #4285F4, #34A853);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    font-size: 16px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 24px;
  }
}

.welcome-image {
  flex: 1;
  display: flex;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
}

.status-section {
  margin-bottom: 20px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  
  i {
    font-size: 30px;
    color: white;
  }
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.carousel-content {
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
}

.carousel-overlay h3 {
  margin: 0 0 10px;
  font-size: 20px;
}

.carousel-overlay p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
  }
  
  .welcome-text {
    padding-right: 0;
    margin-bottom: 20px;
  }
}
</style>