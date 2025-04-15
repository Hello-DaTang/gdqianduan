<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'NotFound',
  setup() {
    const router = useRouter()
    
    const goHome = () => {
      router.push('/')
    }
    
    return {
      goHome
    }
  }
}
</script>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

.not-found-content {
  text-align: center;
}

.not-found-content h1 {
  font-size: 144px;
  font-weight: 600;
  color: #1890ff;
  margin: 0;
}

.not-found-content h2 {
  font-size: 24px;
  color: #1890ff;
  margin: 0 0 10px 0;
}

.not-found-content p {
  color: #606266;
  margin-bottom: 20px;
}
</style>
