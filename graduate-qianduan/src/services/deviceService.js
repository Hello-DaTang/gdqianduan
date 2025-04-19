import { getDefaultConfig, detectDeviceType } from '@/utils/deviceTypes';
import { getAllDevices, getDeviceById, addDevice, updateDevice, deleteDevice } from '@/api/device';

// 设备服务，处理设备相关的业务逻辑
const deviceService = {
  /**
   * 获取所有设备列表
   * @returns {Promise} 返回设备列表
   */
  async getDeviceList() {
    try {
      const response = await getAllDevices();
      
      if (response && response.data && response.data.code === 1) {
        // 处理并返回设备列表
        const devices = response.data.data.rows || [];
        
        // 为每个设备添加设备类型信息
        return devices.map(device => {
          const deviceType = detectDeviceType(device.deviceData);
          return {
            ...device,
            deviceType
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error('获取设备列表失败', error);
      throw error;
    }
  },
  
  /**
   * 获取设备详情
   * @param {number} id 设备ID
   * @returns {Promise} 返回设备详情
   */
  async getDeviceDetail(id) {
    try {
      const response = await getDeviceById(id);
      
      if (response && response.data && response.data.code === 1) {
        const device = response.data.data;
        const deviceType = detectDeviceType(device.deviceData);
        
        return {
          ...device,
          deviceType
        };
      }
      
      return null;
    } catch (error) {
      console.error(`获取设备详情失败 (ID: ${id})`, error);
      throw error;
    }
  },
  
  /**
   * 创建新设备
   * @param {string} name 设备名称
   * @param {string} type 设备类型
   * @param {string} location 位置 (可选)
   * @returns {Promise} 返回创建结果
   */
  async createDevice(name, type, location) {
    try {
      // 获取设备类型的默认配置
      const defaultConfig = getDefaultConfig(type);
      
      if (!defaultConfig) {
        throw new Error(`不支持的设备类型: ${type}`);
      }
      
      // 构建设备数据
      const deviceData = {
        homeName: name,
        deviceData: defaultConfig
      };
      
      // 如果有位置信息，添加到请求数据中
      if (location) {
        deviceData.location = location;
      }
      
      // 调用API添加设备
      const response = await addDevice(deviceData);
      
      return response && response.data && response.data.code === 1;
    } catch (error) {
      console.error('创建设备失败', error);
      throw error;
    }
  },
  
  /**
   * 更新设备信息
   * @param {number} id 设备ID
   * @param {string} name 设备名称 (可选)
   * @param {object} config 设备配置 (可选)
   * @param {string} location 位置 (可选)
   * @returns {Promise} 返回更新结果
   */
  async updateDevice(id, name, config, location) {
    try {
      // 构建更新数据
      const updateData = { id };
      
      if (name) {
        updateData.homeName = name;
      }
      
      if (config) {
        updateData.deviceData = config;
      }
      
      // 如果提供了位置信息，添加到更新数据中
      if (location !== undefined) {
        updateData.location = location;
      }
      
      // 调用API更新设备
      const response = await updateDevice(updateData);
      
      return response && response.data && response.data.code === 1;
    } catch (error) {
      console.error(`更新设备失败 (ID: ${id})`, error);
      throw error;
    }
  },
  
  /**
   * 删除设备
   * @param {number} id 设备ID
   * @returns {Promise} 返回删除结果
   */
  async deleteDevice(id) {
    try {
      const response = await deleteDevice(id);
      
      return response && response.data && response.data.code === 1;
    } catch (error) {
      console.error(`删除设备失败 (ID: ${id})`, error);
      throw error;
    }
  }
};

export default deviceService;