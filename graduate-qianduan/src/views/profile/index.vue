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
      const passwordDialogVisible = ref(false)
      const passwordFormRef = ref(null)
      
      // 用户信息
      const userInfo = ref({
        username: '',
        name: '',
        avatar: '',
        entrydate: ''
      })
      
      // 用户表单
      const userForm = reactive({
        username: '',
        name: '',
        entrydate: new Date()
      })
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
      const activities = ref([
        { content: '登录系统', time: '2025-03-31 16:30:00', type: 'success' },
        { content: '更新了个人信息', time: '2025-03-31 15:20:00', type: 'info' },
        { content: '添加了新设备: 客厅灯', time: '2025-03-31 14:10:00', type: 'primary' },
        { content: '修改了设备状态', time: '2025-03-31 12:45:00', type: 'warning' }
      ])
      
      // 获取用户信息
      const fetchUserInfo = async () => {
        try {
          const response = await getUserInfo()

          if (response && response.data.code === 1 && response.data) {
            // 保存用户信息
            userInfo.value = {
              ...response.data.data,
              avatar: response.data.data.image || '' // 使用image字段作为头像
            }

            // 填充表单
            userForm.username = userInfo.value.username || ''
            userForm.name = userInfo.value.name || ''
            userForm.entrydate = userInfo.value.entrydate ? new Date(userInfo.value.entrydate) : new Date()

            // 保存原始数据，用于取消编辑
            originalUserData.value = {
              username: userForm.username,
              name: userForm.name
            }
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
        toggleEditMode
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
  </style>