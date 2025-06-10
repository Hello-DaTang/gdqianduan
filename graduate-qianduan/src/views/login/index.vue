<template>
  <div class="login-container">
    <!-- 波浪动画背景 -->
    <div class="wave-container">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>
    
    <div class="login-box">
      <div class="login-header">
        <div class="logo-container">
          <img src="@/assets/images/login/logo.png" alt="Logo" class="logo">
        </div>
        <h2 class="system-title">智能家居管理系统</h2>
        <p class="system-subtitle">安全、便捷、智能的家居控制中心</p>
      </div>
      
      <div class="login-form">
        <div class="form-title">
          <span 
            :class="{'active-tab': !isRegisterMode}" 
            @click="isRegisterMode = false">用户登录</span>
          <span 
            :class="{'active-tab': isRegisterMode}" 
            @click="isRegisterMode = true">用户注册</span>
        </div>
        
        <!-- 表单容器使用动画过渡 -->
        <transition name="form-fade" mode="out-in">
          <!-- 登录表单 -->
          <div v-if="!isRegisterMode" key="login" class="form-container">
            <div class="form-item">
              <div class="form-icon">
                <i class="el-icon-user"></i>
              </div>
              <input type="text" placeholder="请输入用户名" v-model="loginForm.username">
            </div>
            
            <div class="form-item">
              <div class="form-icon">
                <i class="el-icon-lock"></i>
              </div>
              <input type="password" placeholder="请输入密码" v-model="loginForm.password">
            </div>
            
            <div class="remember-me">
              <label>
                <input type="checkbox" v-model="loginForm.remember">
                <span>记住我</span>
              </label>
              <!-- <a href="#" class="forgot-password">忘记密码?</a> -->
            </div>
            
            <button class="login-button" @click="handleLogin" :disabled="loading">
              <span class="button-text">{{ loading ? '登录中...' : '登录' }}</span>
              <span class="button-effect"></span>
            </button>
            
            <div class="switch-mode">
              <span @click="isRegisterMode = true">没有账号？立即注册</span>
            </div>
          </div>
          
          <!-- 注册表单 -->
          <div v-else key="register" class="form-container">
            <div class="form-item">
              <div class="form-icon">
                <i class="el-icon-user"></i>
              </div>
              <input type="text" placeholder="请输入用户名" v-model="registerForm.username">
            </div>
            
            <div class="form-item">
              <div class="form-icon">
                <i class="el-icon-lock"></i>
              </div>
              <input type="password" placeholder="请输入密码" v-model="registerForm.password">
            </div>
            
            <div class="form-item">
              <div class="form-icon">
                <i class="el-icon-lock"></i>
              </div>
              <input type="password" placeholder="请再次确认密码" v-model="registerForm.confirmPassword">
            </div>
            
            <div class="form-item">
              <div class="form-icon">
                <i class="el-icon-user"></i>
              </div>
              <input type="text" placeholder="请输入姓名" v-model="registerForm.name">
            </div>
            
            <div class="form-item">
              <div class="form-icon">
                <i class="el-icon-date"></i>
              </div>
              <input type="text" readonly :value="formattedDate" class="readonly-input" title="系统自动填充当前日期">
            </div>
            
            <button class="login-button" @click="handleRegister" :disabled="loading">
              <span class="button-text">{{ loading ? '注册中...' : '注册' }}</span>
              <span class="button-effect"></span>
            </button>
            
            <div class="switch-mode">
              <span @click="isRegisterMode = false">已有账号？立即登录</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>
import { setToken } from '@/utils/auth'
import { login, register } from '@/api/user' // 引入注册API

export default {
  name: 'LoginPage',
  data() {
    return {
      isRegisterMode: false,
      loginForm: {
        username: '',
        password: '',
        remember: false
      },
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '', // 新增确认密码字段
        name: '',
        entrydate: new Date().toISOString().slice(0, 10)
      },
      loading: false
    }
  },
  computed: {
    formattedDate() {
      // 格式化显示当前日期
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },
  methods: {
    handleLogin() {
      if (!this.loginForm.username || !this.loginForm.password) {
        this.$message.error('用户名和密码不能为空')
        return
      }
      
      this.loading = true
      
      login({
        username: this.loginForm.username,
        password: this.loginForm.password
      })
        .then(res => {          
          if (res.data.code === 1) {
            // 登录成功
            setToken(res.data.data) // 保存 JWT token
            
            if (this.loginForm.remember) {
              localStorage.setItem('remember_login', 'true')
            }
            
            this.$message.success('登录成功')
            this.$router.push('/') // 跳转到首页
          } else {
            // 登录失败但有返回信息
            this.$message.error(res.msg || '账号或密码错误')
          }
        })
        .catch(error => {
          console.error('登录请求出错:', error)
          this.$message.error('登录失败，请检查网络连接或联系管理员')
        })
        .finally(() => {
          this.loading = false
        })
    },
    
    handleRegister() {
      // 表单验证
      if (!this.registerForm.username || !this.registerForm.password || 
          !this.registerForm.confirmPassword || !this.registerForm.name) {
        this.$message.error('注册信息不能为空')
        return
      }
      
      // 验证两次密码是否一致
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.$message.error('两次输入的密码不一致')
        return
      }
      
      this.loading = true
      
      register({
        username: this.registerForm.username,
        password: this.registerForm.password,
        name: this.registerForm.name,
        entrydate: this.registerForm.entrydate
      })
        .then(res => {
          if (res.data.code === 1) {
            this.$message.success('注册成功，请登录')
            this.isRegisterMode = false // 切换到登录模式
            // 自动填充登录表单
            this.loginForm.username = this.registerForm.username
            this.loginForm.password = this.registerForm.password
            
            // 清空注册表单
            this.registerForm = {
              username: '',
              password: '',
              confirmPassword: '',
              name: '',
              entrydate: new Date().toISOString().slice(0, 10)
            }
          } else {
            this.$message.error(res.data.msg || '注册失败')
          }
        })
        .catch(error => {
          console.error('注册请求出错:', error)
          this.$message.error('注册失败，请检查网络连接或联系管理员')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>

.readonly-input {
  background-color: #f0f4f9 !important;
  color: #606266;
  cursor: default;
}

.readonly-input:focus {
  border-color: #E1E6EF !important;
  box-shadow: none !important;
}

.login-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #f5f6fa;
  justify-content: center;
  align-items: center;
}


/* 波浪动画背景 */
.wave-container {
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
  left: 0;
  z-index: 0;
  overflow: hidden;
}

.wave {
  position: absolute;
  width: 200%;
  height: 200%;
  bottom: -100%;
  left: -50%;
  border-radius: 40%;
  animation: wave 15s infinite linear;
  opacity: 0.3;
}

.wave1 {
  background-color: rgba(68, 138, 255, 0.2);
  animation-duration: 15s;
}

.wave2 {
  background-color: rgba(68, 138, 255, 0.4);
  animation-duration: 13s;
  animation-delay: -2s;
}

.wave3 {
  background-color: rgba(68, 138, 255, 0.1);
  animation-duration: 17s;
  animation-delay: -5s;
}

@keyframes wave {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media screen and (max-width: 576px) {
  .login-box {
    width: 90%;
    padding: 30px;
    margin: 0 15px;
  }
  
  .form-item input {
    font-size: 14px;
    padding: 10px 38px 10px 12px;
  }
  
  .form-title {
    margin-bottom: 20px;
  }
  
  .system-title {
    font-size: 20px;
  }
}

.login-box {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 420px;
  padding: 40px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.login-box:hover {
  box-shadow: 0 12px 42px rgba(31, 38, 135, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.logo {
  width: 70px;
  height: 70px;
  object-fit: contain;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.system-title {
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.system-subtitle {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.form-title {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  font-size: 18px;
}

.form-title span {
  padding: 0 15px;
  cursor: pointer;
  color: #999;
  position: relative;
  margin: 0 10px;
  transition: all 0.3s ease;
}

.form-title .active-tab {
  color: #4285F4;
  font-weight: 600;
}

.form-title .active-tab:after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #4285F4;
  border-radius: 3px;
  transform: scaleX(1);
  transition: transform 0.3s ease;
}

.form-title span:not(.active-tab):after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #4285F4;
  border-radius: 3px;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.form-title span:not(.active-tab):hover:after {
  transform: scaleX(0.5);
}

.form-container {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

.form-fade-enter-active, .form-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.form-fade-enter-from, .form-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.form-item {
  position: relative;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.form-item input {
  width: 100%;
  padding: 12px 45px 12px 15px;
  font-size: 16px;
  background-color: #F7F9FC;
  border: 2px solid #E1E6EF;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box; 
}

.form-item input:focus {
  border-color: #4285F4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  background-color: #fff;
}

.form-icon {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  color: #A0A9BD;
  transition: color 0.3s ease;
}

.form-item input:focus + .form-icon {
  color: #4285F4;
}

.remember-me {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  color: #555;
  font-size: 14px;
}

.remember-me label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  margin-right: 8px;
  accent-color: #4285F4;
}

.forgot-password {
  color: #4285F4;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #3367d6;
  text-decoration: underline;
}

.login-button {
  width: 100%;
  padding: 13px 0;
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(45deg, #4285F4, #34A853);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 14px rgba(66, 133, 244, 0.3);
  transition: all 0.3s ease;
}

.login-button:hover {
  box-shadow: 0 6px 20px rgba(66, 133, 244, 0.4);
  transform: translateY(-1px);
}

.login-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(66, 133, 244, 0.3);
}

.login-button:disabled {
  background: linear-gradient(45deg, #a5c4fa, #a6d3b4);
  cursor: not-allowed;
  box-shadow: none;
}

.button-text {
  position: relative;
  z-index: 2;
}

.button-effect {
  position: absolute;
  top: -50%;
  left: -25%;
  width: 150%;
  height: 200%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(45deg);
  transition: all 0.5s ease;
}

.login-button:hover .button-effect {
  left: 100%;
}

.switch-mode {
  text-align: center;
  margin-top: 20px;
  font-size: 15px;
  color: #4285F4;
  cursor: pointer;
}

.switch-mode span {
  position: relative;
  transition: all 0.3s ease;
}

.switch-mode span:after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 1px;
  background-color: #4285F4;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.switch-mode span:hover {
  color: #3367d6;
}

.switch-mode span:hover:after {
  transform: scaleX(1);
}
</style>