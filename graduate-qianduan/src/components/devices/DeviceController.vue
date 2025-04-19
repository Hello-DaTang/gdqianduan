<template>
  <div class="device-controller">
    <el-form label-position="top" :model="formData">
      <h3 class="controller-title">{{ device.homeName }} 控制面板</h3>
      
      <div v-for="option in configOptions" :key="option.key">
        <!-- 开关类型的控制项 -->
        <el-form-item v-if="option.type === 'switch'" :label="option.label">
          <el-switch
            v-model="formData[option.key]"
            :active-value="option.options[0]"
            :inactive-value="option.options[1]"
            :active-text="getStatusText(option.options[0])"
            :inactive-text="getStatusText(option.options[1])"
          />
        </el-form-item>
        
        <!-- 滑块类型的控制项 -->
        <el-form-item v-else-if="option.type === 'slider'" :label="option.label">
          <el-slider
            v-model="formData[option.key]"
            :min="option.min"
            :max="option.max"
            :show-input="true"
          />
        </el-form-item>
        
        <!-- 颜色选择器类型的控制项 -->
        <el-form-item v-else-if="option.type === 'color'" :label="option.label">
          <el-color-picker v-model="formData[option.key]" show-alpha />
        </el-form-item>
        
        <!-- 下拉选择类型的控制项 -->
        <el-form-item v-else-if="option.type === 'select'" :label="option.label">
          <el-select v-model="formData[option.key]" style="width: 100%;">
            <el-option
              v-for="opt in option.options"
              :key="opt"
              :label="getMappedValue(option.key, opt)"
              :value="opt"
            />
          </el-select>
        </el-form-item>
      </div>
      
      <div class="controller-actions">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button type="primary" @click="saveChanges">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getConfigOptions } from '@/utils/deviceTypes';
import deviceService from '@/services/deviceService';
import { ElMessage } from 'element-plus';

export default {
  name: 'DeviceController',
  props: {
    device: {
      type: Object,
      required: true
    },
    deviceType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      formData: {},
      configOptions: []
    };
  },
  created() {
    // 获取设备类型的配置选项
    this.configOptions = getConfigOptions(this.deviceType);
    
    // 初始化表单数据
    this.initFormData();
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      this.formData = { ...this.device.deviceData };
    },
    
    // 获取开关状态的文本
    getStatusText(status) {
      const statusMap = {
        'on': '开启',
        'off': '关闭',
        'open': '打开',
        'closed': '关闭',
        'locked': '锁定',
        'unlocked': '解锁'
      };
      
      return statusMap[status] || status;
    },
    
    // 获取选项的映射值
    getMappedValue(key, value) {
      // 不同类型的选项值映射
      const mappings = {
        'mode': {
          'normal': '普通',
          'reading': '阅读',
          'cinema': '影院',
          'party': '派对',
          'manual': '手动',
          'auto': '自动',
          'schedule': '定时',
          'cool': '制冷',
          'heat': '制热',
          'fan': '通风'
        },
        'material': {
          'cotton': '棉布',
          'linen': '亚麻',
          'polyester': '涤纶',
          'blackout': '遮光布'
        },
        'fanSpeed': {
          'auto': '自动',
          'low': '低速',
          'medium': '中速',
          'high': '高速'
        },
        'securityLevel': {
          'low': '低',
          'medium': '中',
          'high': '高'
        }
      };
      
      return mappings[key] && mappings[key][value] ? mappings[key][value] : value;
    },
    
    // 保存变更
    async saveChanges() {
      try {
        // 调用设备服务更新设备
        const success = await deviceService.updateDevice(
          this.device.id,
          null, // 不更新名称
          this.formData
        );
        
        if (success) {
          ElMessage.success('设备更新成功');
          this.$emit('saved', {
            ...this.device,
            deviceData: { ...this.formData }
          });
        } else {
          ElMessage.error('设备更新失败');
        }
      } catch (error) {
        ElMessage.error('设备更新失败: ' + error.message);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.device-controller {
  padding: 20px;
}

.controller-title {
  margin: 0 0 20px;
  text-align: center;
  font-size: 18px;
  color: #303133;
}

.controller-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 10px;
}
</style>