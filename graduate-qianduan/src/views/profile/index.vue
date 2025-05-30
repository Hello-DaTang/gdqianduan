<template>
  <modern-page-container title="个人中心">
    <el-row :gutter="20">
      <el-col :span="8">
        <modern-card title="个人信息" :headerActions="true">
          <template #headerActions>
            <modern-button type="text" :text="editMode ? '取消' : '编辑'" @click="toggleEditMode" />
          </template>

          <div class="user-avatar">
            <el-avatar :size="100" :src="userInfo.avatar || ''">
              {{ userInfo.username ? userInfo.username.substring(0, 1).toUpperCase() : 'U' }}
            </el-avatar>
            <el-upload v-if="editMode" class="avatar-uploader" :http-request="uploadAvatar" :show-file-list="false"
              accept="image/*">
              <modern-button size="small" text="更换头像" />
            </el-upload>
          </div>

          <div class="user-info">
            <el-form :model="userForm" label-width="80px">
              <el-form-item label="用户名">
                <modern-input v-model="userForm.username" :disabled="!editMode" />
              </el-form-item>
              <el-form-item label="姓名">
                <modern-input v-model="userForm.name" :disabled="!editMode" />
              </el-form-item>
              <el-form-item label="注册日期">
                <el-date-picker v-model="userForm.entrydate" type="date" placeholder="请选择日期" format="YYYY-MM-DD"
                  disabled />
              </el-form-item>

              <el-form-item v-if="editMode">
                <modern-button type="primary" text="保存" @click="updateUserInfo" />
              </el-form-item>
            </el-form>
          </div>
        </modern-card>

        <modern-card title="城市设置" class="city-card">
          <el-form label-width="120px">
            <el-form-item label="当前城市">
              <template v-if="!cityEditMode">
                <modern-button :text="userInfo.currentCity || '未设置'" @click="startCityEdit" />
              </template>
              <template v-else>
                <div class="city-edit">
                  <modern-input v-model="cityForm.currentCity" placeholder="请输入城市名称" />
                  <div class="city-actions">
                    <modern-button type="primary" text="保存" @click="updateCity" />
                    <modern-button text="取消" @click="cancelCityEdit" />
                  </div>
                </div>
              </template>
            </el-form-item>
            
              <div class="city-tip">
                <i class="el-icon-info-filled"></i>
                <span>设置当前城市可以帮助我们为您提供更加精准的天气预报服务</span>
              </div>
          </el-form>
        </modern-card>
      </el-col>

      <el-col :span="16">
        <modern-card title="安全设置" class="security-card">
          <el-form label-width="120px">
            <el-form-item label="修改密码">
              <modern-button text="修改密码" @click="showPasswordDialog" />
            </el-form-item>
            <el-form-item label="账号安全">
              <status-badge type="success">正常</status-badge>
            </el-form-item>
            <el-form-item label="登录状态">
              <status-badge type="success">已登录</status-badge>
              <modern-button type="text" text="退出登录" style="margin-left: 10px;" @click="logout" />
            </el-form-item>
          </el-form>
        </modern-card>

        <modern-card title="最近活动" class="activity-card">
          <el-timeline>
            <el-timeline-item v-for="(activity, index) in activities" :key="index" :timestamp="activity.time"
              :type="activity.type">
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </modern-card>
      </el-col>
    </el-row>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="30%">
      <el-form :model="passwordForm" label-width="100px" :rules="passwordRules" ref="passwordFormRef">
        <el-form-item label="旧密码" prop="oldPassword">
          <modern-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" suffix="el-icon-lock" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <modern-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" suffix="el-icon-lock" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <modern-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码"
            suffix="el-icon-lock" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <modern-button text="取消" @click="passwordDialogVisible = false" />
          <modern-button type="primary" text="确认" @click="changePassword" />
        </span>
      </template>
    </el-dialog>
  </modern-page-container>
</template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { getUserInfo, updateUser } from '@/api/user'
  import { uploadFile } from '@/api/upload'
  import { getUserOperate } from '@/api/operatelog'
  import { removeToken } from '@/utils/auth'
  import ModernPageContainer from '@/components/layout/ModernPageContainer.vue'
  import ModernCard from '@/components/layout/ModernCard.vue'
  import ModernButton from '@/components/ui/ModernButton.vue'
  import ModernInput from '@/components/ui/ModernInput.vue'
  import StatusBadge from '@/components/ui/StatusBadge.vue'
  
  export default {
    name: 'ProfileView',
    components: {
      ModernPageContainer,
      ModernCard,
      ModernButton,
      ModernInput,
      StatusBadge
    },
    setup() {
      const router = useRouter()
      const editMode = ref(false)
      const cityEditMode = ref(false) 
      const passwordDialogVisible = ref(false)
      const passwordFormRef = ref(null)
      
      // 用户信息
      const userInfo = ref({
        username: '',
        name: '',
        avatar: '',
        entrydate: '',
        currentCity: ''
      })
      
      // 用户表单
      const userForm = reactive({
        username: '',
        name: '',
        entrydate: new Date()
      })
      // 新增：城市表单
      const cityForm = reactive({
        currentCity: ''
      })
      // 新增：原始城市信息
      const originalCityData = ref('')
      // 保存原始用户信息，用于取消编辑时恢复
      const originalUserData = ref({
        username: '',
        name: ''
      })
      // 密码表单
      const passwordForm = reactive({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      // 密码表单验证规则
      const passwordRules = {
        oldPassword: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (value !== passwordForm.newPassword) {
                callback(new Error('两次输入密码不一致'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ]
      }
      
      // 活动记录
      const activities = ref([])
      
      // 获取操作日志数据
      const fetchOperateLog = async () => {
        try {
          const response = await getUserOperate()
          if (response && response.data.code === 1) {
            // 将操作日志数据转换为活动记录格式
            const operateLogData = response.data.data.rows || []
            const activityList = operateLogData.map(log => {
              // 为不同的操作类型设置不同的类型标识
              let type = 'info'
              let content = ''
              
              // 根据方法名判断操作类型并设置相应的类型和内容
              if (log.methodName.includes('save') || log.methodName.includes('add')) {
                type = 'primary'
                content = `添加了新设备: ${log.methodParams.includes('homeName') ? 
                  log.methodParams.match(/homeName=([^,)]+)/)?.[1] || '智能设备' : '智能设备'}`
              } else if (log.methodName.includes('update')) {
                type = 'info'
                content = `更新了${log.className.includes('User') ? '个人信息' : '设备信息'}`
              } else if (log.methodName.includes('delete')) {
                type = 'warning'
                content = '删除了设备'
              } else if (log.methodName.includes('login')) {
                type = 'success'
                content = '登录系统'
              } else {
                content = `执行了${log.methodName}操作`
              }
              
              // 格式化操作时间
              const operateTime = new Date(log.operateTime).toLocaleString('zh-CN')
              
              return {
                content,
                time: operateTime,
                type,
                rawTime: new Date(log.operateTime) // 保存原始时间用于排序
              }
            })
            
            // 按时间倒序排列（最新的在最前面）
            activityList.sort((a, b) => b.rawTime - a.rawTime)
            
            // 更新活动记录
            activities.value = activityList
          } else {
            ElMessage.warning('获取操作日志失败')
          }
        } catch (error) {
          console.error('获取操作日志出错:', error)
          // 如果获取失败，使用默认数据
          activities.value = [
            { content: '登录系统', time: new Date().toLocaleString('zh-CN'), type: 'success' }
          ]
        }
      }
      
      // 获取用户信息
      const fetchUserInfo = async () => {
        try {
          const response = await getUserInfo()

          if (response && response.data.code === 1 && response.data) {
            // 保存用户信息
            userInfo.value = {
              ...response.data.data,
              avatar: response.data.data.image || '', // 使用image字段作为头像
              currentCity: response.data.data.currentCity || '沈阳市' // 获取当前城市，默认为沈阳市
            }

            // 填充表单
            userForm.username = userInfo.value.username || ''
            userForm.name = userInfo.value.name || ''
            userForm.entrydate = userInfo.value.entrydate ? new Date(userInfo.value.entrydate) : new Date()

            // 填充城市表单
            cityForm.currentCity = userInfo.value.currentCity || '沈阳市'

            // 保存原始数据，用于取消编辑
            originalUserData.value = {
              username: userForm.username,
              name: userForm.name
            }
            originalCityData.value = cityForm.currentCity
          } else {
            ElMessage.error('获取用户信息失败: ' + (response?.data.msg || '无用户信息'))
          }
        } catch (error) {
          ElMessage.error('获取用户信息失败: ' + (error.message || '未知错误'))
        }
      }
      
      // 切换编辑模式
      const toggleEditMode = () => {
        if (editMode.value) {
          // 如果当前是编辑模式，则取消编辑，恢复原始数据
          userForm.username = originalUserData.value.username
          userForm.name = originalUserData.value.name
        }
        editMode.value = !editMode.value
      }
      // 新增：开始编辑城市
      const startCityEdit = () => {
        cityEditMode.value = true
        cityForm.currentCity = userInfo.value.currentCity || ''
        originalCityData.value = cityForm.currentCity
      }
      // 新增：取消编辑城市
      const cancelCityEdit = () => {
        cityEditMode.value = false
        cityForm.currentCity = originalCityData.value
      }
      // 新增：更新城市
      const updateCity = async () => {
        try {
          if (!cityForm.currentCity) {
            ElMessage.warning('城市名称不能为空')
            return
          }

          await updateUser({
            currentCity: cityForm.currentCity
          })

          ElMessage.success('城市设置更新成功')
          cityEditMode.value = false

          // 更新显示的用户城市信息
          userInfo.value.currentCity = cityForm.currentCity

          // 更新原始城市数据
          originalCityData.value = cityForm.currentCity

          // 添加一条活动记录
          activities.value.unshift({
            content: '更新了城市设置',
            time: new Date().toLocaleString('zh-CN'),
            type: 'info'
          })
        } catch (error) {
          ElMessage.error('更新城市失败: ' + (error.message || '未知错误'))
        }
      }

      // 更新用户信息
      const updateUserInfo = async () => {
        try {
          await updateUser({
            username: userForm.username,
            name: userForm.name
          })

          ElMessage.success('用户信息更新成功')
          editMode.value = false

          // 更新显示的用户信息
          userInfo.value.username = userForm.username
          userInfo.value.name = userForm.name

          // 更新原始数据
          originalUserData.value = {
            username: userForm.username,
            name: userForm.name
          }

          // 可以添加一条活动记录
          activities.value.unshift({
            content: '更新了个人信息',
            time: new Date().toLocaleString('zh-CN'),
            type: 'info'
          })
        } catch (error) {
          ElMessage.error('更新失败: ' + (error.message || '未知错误'))
        }
      }
      
      // 上传头像
      const uploadAvatar = async ({ file }) => {
        try {
          const response = await uploadFile(file)
          userInfo.value.avatar = response.data.data
          ElMessage.success('头像上传成功')
          await updateUser({
            image: response.data.data
          })
        } catch (error) {
          ElMessage.error('上传失败')
        }
      }
      
      // 显示密码对话框
      const showPasswordDialog = () => {
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
        passwordDialogVisible.value = true
      }
      
      // 修改密码
      const changePassword = async () => {
        if (!passwordFormRef.value) return
        
        await passwordFormRef.value.validate(async (valid) => {
          if (valid) {
            try {
              // 这里应该调用修改密码的API
              await updateUser({
                password: passwordForm.newPassword,
              })
              ElMessage.success('密码修改成功')
              passwordDialogVisible.value = false
            } catch (error) {
              ElMessage.error('密码修改失败')
            }
          }
        })
      }
      
      // 退出登录
      const logout = () => {
        removeToken()
        router.push('/login')
        ElMessage.success('退出登录成功')
      }
      
      onMounted(() => {
        fetchUserInfo()
        fetchOperateLog()
      })
      
      return {
        editMode,
        passwordDialogVisible,
        passwordFormRef,
        userInfo,
        userForm,
        passwordForm,
        passwordRules,
        activities,
        updateUserInfo,
        uploadAvatar,
        showPasswordDialog,
        changePassword,
        logout,
        toggleEditMode,
        startCityEdit, 
        cancelCityEdit, 
        updateCity,
        cityEditMode,
        cityForm
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .user-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    
    .el-avatar {
      box-shadow: 0 4px 15px rgba(66, 133, 244, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.8);
      margin-bottom: 15px;
    }
  }
  
  .avatar-uploader {
    margin-top: 10px;
  }
  
  .user-info {
    margin-top: 20px;
  }
  
  .security-card, 
  .activity-card {
    margin-bottom: 20px;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  :deep(.el-timeline-item__content) {
    color: #333;
    font-weight: 500;
  }
  
  :deep(.el-timeline-item__timestamp) {
    color: #666;
  }
  
  :deep(.el-timeline-item__node--primary) {
    background-color: #4285F4;
  }
  
  :deep(.el-timeline-item__node--success) {
    background-color: #34A853;
  }
  
  :deep(.el-timeline-item__node--warning) {
    background-color: #FBBC05;
  }
  
  :deep(.el-timeline-item__node--info) {
    background-color: #24C6DC;
  }
  /* 新增城市卡片样式 */
.city-card {
  margin-top: 20px;
}

.city-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.current-city-display {
  flex: 1;
}

.city-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.city-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.city-edit {
  margin-top: 10px;
}

.city-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.city-tip {
  display: flex;
  align-items: center;
  background-color: rgba(66, 133, 244, 0.1);
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #4285F4;
  margin-left: 0; /* 确保左侧不对齐 */
  i {
    margin-right: 5px;
    font-size: 14px;
  }
}
  </style>