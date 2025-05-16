import DeviceControlPanel from './DeviceControlPanel.vue'
import LightDeviceControl from './controls/LightDeviceControl.vue'
import CurtainDeviceControl from './controls/CurtainDeviceControl.vue'
import AirConditionerDeviceControl from './controls/AirConditionerDeviceControl.vue'
import DoorLockDeviceControl from './controls/DoorLockDeviceControl.vue'
import TVDeviceControl from './controls/TVDeviceControl.vue'
import SpeakerDeviceControl from './controls/SpeakerDeviceControl.vue'
import DefaultDeviceControl from './controls/DefaultDeviceControl.vue'

// 导出组件
export {
  DeviceControlPanel,
  LightDeviceControl,
  CurtainDeviceControl,
  AirConditionerDeviceControl,
  DoorLockDeviceControl,
  TVDeviceControl,
  SpeakerDeviceControl,
  DefaultDeviceControl
}

// 创建设备控制组件映射
const deviceControlComponents = {
  light: LightDeviceControl,
  curtain: CurtainDeviceControl,
  airConditioner: AirConditionerDeviceControl,
  doorLock: DoorLockDeviceControl,
  tv: TVDeviceControl,
  speaker: SpeakerDeviceControl,
  custom: DefaultDeviceControl
}

// 根据设备类型获取对应的控制组件
export function getDeviceControlComponent(type) {
  return deviceControlComponents[type] || DefaultDeviceControl
}

export default {
  // 提供设备组件工厂方法
  install(app) {
    app.component('DeviceControlPanel', DeviceControlPanel)
    app.component('LightDeviceControl', LightDeviceControl)
    app.component('CurtainDeviceControl', CurtainDeviceControl)
    app.component('AirConditionerDeviceControl', AirConditionerDeviceControl)
    app.component('DoorLockDeviceControl', DoorLockDeviceControl)
    app.component('TVDeviceControl', TVDeviceControl)
    app.component('SpeakerDeviceControl', SpeakerDeviceControl)
    app.component('DefaultDeviceControl', DefaultDeviceControl)
  }
}