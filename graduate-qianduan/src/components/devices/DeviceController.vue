<template>
  <div class="device-controller">
    <el-form label-position="top" :model="formData">
      <div class="controller-header">
        <div class="device-image">
          <img :src="getDeviceImage(deviceType)" alt="设备图片" />
        </div>
        <h3 class="controller-title">{{ device.homeName }} 控制面板</h3>
      </div>
      
      <!-- 设备位置选择 -->
      <el-form-item label="设备位置">
        <el-select v-model="location" placeholder="请选择设备位置" style="width: 100%;">
          <el-option
            v-for="room in roomOptions"
            :key="room.value"
            :label="room.label"
            :value="room.value"
          >
            <div class="room-option">
              <i class="el-icon-office-building"></i>
              <span>{{ room.label }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      
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
    },
    roomOptions: {
      type: Array,
      default: () => [
        { label: '客厅', value: 'living' },
        { label: '卧室', value: 'bedroom' },
        { label: '厨房', value: 'kitchen' },
        { label: '浴室', value: 'bathroom' }
      ]
    }
  },
  data() {
    return {
      formData: {},
      configOptions: [],
      location: ''
    };
  },
  created() {
    // 获取设备类型的配置选项
    this.configOptions = getConfigOptions(this.deviceType);
    
    // 初始化表单数据和位置
    this.initFormData();
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      this.formData = { ...this.device.deviceData };
      this.location = this.device.location || '';
    },
      // 根据设备类型获取设备图片
    getDeviceImage(type) {
      const images = {
        'light': require('@/assets/images/device/灯光logo.png'),
        'curtain': require('@/assets/images/device/窗帘logo.png'),
        'airConditioner': require('@/assets/images/device/空调logo.png'),
        'doorLock': require('@/assets/images/device/门锁logo.png'),
        'tv': require('@/assets/images/device/灯光logo.png'), // 暂用灯光图标代替
        'speaker': require('@/assets/images/device/灯光logo.png'), // 暂用灯光图标代替
        'custom': require('@/assets/images/device/灯光logo.png') // 暂用灯光图标代替
      };
      return images[type] || require('@/assets/images/device/灯光logo.png');
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
          this.formData,
          this.location // 更新位置
        );
        
        if (success) {
          ElMessage.success('设备更新成功');
          this.$emit('saved', {
            ...this.device,
            deviceData: { ...this.formData },
            location: this.location
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

.controller-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.device-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  
  img {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
}

.controller-title {
  margin: 0;
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

.room-option {
  display: flex;
  align-items: center;
  
  i {
    margin-right: 8px;
    color: #409EFF;
  }
}
</style>