// 设备组件工厂，根据设备类型动态加载对应的组件
// 这种模式允许我们轻松添加新设备类型，而不需要修改现有代码

// 导入设备组件
import LightDevice from './LightDevice.vue';
import CurtainDevice from './CurtainDevice.vue';
import AirConditionerDevice from './AirConditionerDevice.vue';
import DoorLockDevice from './DoorLockDevice.vue';
import DefaultDevice from './DefaultDevice.vue';

// 设备类型与组件映射
const deviceComponents = {
  light: LightDevice,
  curtain: CurtainDevice,
  airConditioner: AirConditionerDevice,
  doorLock: DoorLockDevice,
  default: DefaultDevice
};

/**
 * 获取设备组件
 * @param {string} type 设备类型
 * @returns {Component} 返回对应的Vue组件
 */
export function getDeviceComponent(type) {
  return deviceComponents[type] || deviceComponents.default;
}

/**
 * 判断设备类型是否支持
 * @param {string} type 设备类型
 * @returns {boolean} 是否支持
 */
export function isDeviceTypeSupported(type) {
  return !!deviceComponents[type];
}

export default {
  getDeviceComponent,
  isDeviceTypeSupported
};