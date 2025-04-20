// 设备数据处理和格式化工具
import { detectDeviceType } from './deviceTypes'

/**
 * 获取所有设备信息，包括类型检测
 * @param {Array} deviceList 原始设备列表
 * @returns {Array} 增强后的设备列表
 */
export function getEnhancedDeviceList(deviceList) {
  if (!deviceList) return []
  
  // 确保deviceList是数组
  const list = Array.isArray(deviceList) 
    ? deviceList 
    : (deviceList?.rows || [])
  
  // 从设备中获取并添加类型信息
  return list.map(device => {
    // 检测设备类型
    const type = detectDeviceType(device.deviceData)
    return {
      ...device,
      type
    }
  })
}

/**
 * 获取设备名称
 * @param {Number} id 设备ID
 * @param {Array} deviceList 设备列表
 * @returns {String} 设备名称
 */
export function getDeviceName(id, deviceList) {
  const device = deviceList.find(d => d.id === id)
  return device ? device.homeName : `设备 ${id}`
}

/**
 * 设备参数名称映射
 */
export const deviceParamLabels = {
  'status': '状态',
  'mode': '模式',
  'temperature': '温度',
  'fanSpeed': '风速',
  'brightness': '亮度',
  'color': '颜色',
  'position': '位置',
  'material': '材质',
  'lockStatus': '锁状态',
  'securityLevel': '安全等级'
}

/**
 * 格式化设备参数名称
 * @param {String} key 参数键名
 * @returns {String} 格式化后的参数名称
 */
export function formatDeviceParamName(key) {
  return deviceParamLabels[key] || key
}

/**
 * 设备参数值格式化函数映射
 */
export const deviceParamValueFormatters = {
  'status': (value) => value === 'on' ? '开启' : '关闭',
  'mode': (value) => {
    const modeMap = {
      'auto': '自动',
      'manual': '手动',
      'cool': '制冷',
      'heat': '制热',
      'dry': '除湿',
      'fan': '送风'
    }
    return modeMap[value] || value
  },
  'fanSpeed': (value) => {
    const speedMap = {
      'auto': '自动',
      'low': '低速',
      'medium': '中速',
      'high': '高速'
    }
    return speedMap[value] || value
  },
  'position': (value) => `${value}%`,
  'temperature': (value) => `${value}°C`,
  'brightness': (value) => `${value}%`
}

/**
 * 格式化设备参数值
 * @param {String} key 参数键名
 * @param {*} value 参数值
 * @returns {String} 格式化后的参数值
 */
export function formatDeviceParamValue(key, value) {
  const formatter = deviceParamValueFormatters[key]
  return formatter ? formatter(value) : value
}

/**
 * 从AI响应中解析设备控制指令
 * @param {String} response AI响应文本
 * @returns {Object} 解析结果
 */
export function parseDeviceInstructions(response) {
  try {
    // 寻找被```json和```包裹的内容
    const jsonMatch = response.match(/```json\s*({[\s\S]*?})\s*```/);
    
    if (jsonMatch && jsonMatch[1]) {
      // 解析提取出的JSON字符串
      const instructions = JSON.parse(jsonMatch[1]);
      return {
        success: true,
        instructions
      };
    }
    
    // 如果没有找到标准格式，尝试查找任何JSON格式的内容
    const fallbackMatch = response.match(/{[\s\S]*"devices"[\s\S]*}/);
    if (fallbackMatch) {
      try {
        const instructions = JSON.parse(fallbackMatch[0]);
        return {
          success: true,
          instructions,
          warning: '非标准格式JSON，但已成功解析'
        };
      } catch (e) {
        // 如果解析失败，返回一个错误
        return {
          success: false,
          error: '找到可能的JSON内容但解析失败'
        };
      }
    }
    
    return {
      success: false,
      error: '未找到设备指令JSON'
    };
  } catch (error) {
    console.error('解析设备指令出错:', error);
    return {
      success: false,
      error: '解析设备指令时发生错误: ' + error.message
    };
  }
}