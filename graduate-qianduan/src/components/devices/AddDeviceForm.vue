<template>
  <div class="add-device-form">
    <el-form label-position="top" :model="formData" :rules="rules" ref="addDeviceForm">
      <h3 class="form-title">添加新设备</h3>
      
      <el-form-item label="设备名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入设备名称"></el-input>
      </el-form-item>
      
      <el-form-item label="设备类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择设备类型" style="width: 100%">
          <el-option
            v-for="item in deviceTypes"
            :key="item.type"
            :label="item.name"
            :value="item.type"
          >
            <div class="device-type-option">
              <i :class="item.icon" class="device-type-icon"></i>
              <span>{{ item.name }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      
      <div class="form-actions">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button type="primary" @click="submitForm">添加</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { getDeviceTypes } from '@/utils/deviceTypes';
import deviceService from '@/services/deviceService';

export default {
  name: 'AddDeviceForm',
  setup(props, { emit }) {
    // 获取所有支持的设备类型
    const deviceTypes = getDeviceTypes();
    
    // 表单数据
    const formData = reactive({
      name: '',
      type: ''
    });
    
    // 表单校验规则
    const rules = {
      name: [
        { required: true, message: '请输入设备名称', trigger: 'blur' },
        { min: 2, max: 20, message: '设备名称长度在 2 到 20 个字符之间', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择设备类型', trigger: 'change' }
      ]
    };
    
    // 表单引用
    const addDeviceForm = ref(null);
    
    // 提交表单
    const submitForm = async () => {
      if (!addDeviceForm.value) return;
      
      addDeviceForm.value.validate(async (valid) => {
        if (valid) {
          try {
            // 创建新设备
            const success = await deviceService.createDevice(formData.name, formData.type);
            
            if (success) {
              ElMessage.success('添加设备成功');
              emit('added');
            } else {
              ElMessage.error('添加设备失败');
            }
          } catch (error) {
            ElMessage.error('添加设备失败: ' + error.message);
          }
        }
      });
    };
    
    return {
      deviceTypes,
      formData,
      rules,
      addDeviceForm,
      submitForm
    };
  }
};
</script>

<style lang="scss" scoped>
.add-device-form {
  padding: 20px;
}

.form-title {
  margin: 0 0 20px;
  text-align: center;
  font-size: 18px;
  color: #303133;
}

.device-type-option {
  display: flex;
  align-items: center;
}

.device-type-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #409EFF;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 10px;
}
</style>