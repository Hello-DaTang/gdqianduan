// 设备类型定义文件
// 包含所有支持的设备类型及其默认配置

const deviceTypes = {
  // 灯光设备
  light: {
    type: 'light',
    name: '智能灯',
    icon: 'el-icon-light-bulb',
    defaultData: {
      status: 'off',  // on, off
      brightness: 50, // 0-100
      color: '#FFFFFF', // 颜色值
      mode: 'normal',  // normal, reading, cinema, etc.
      power: 15, // 功率，单位瓦特
      timer: null, // 定时功能，格式：{time: 'HH:mm', action: 'on/off', enabled: true/false}
      autoMode: false // 自动模式
    },
    // 设备配置UI中需要展示的属性列表
    configOptions: [
      { key: 'status', label: '状态', type: 'switch', options: ['on', 'off'] },
      { key: 'brightness', label: '亮度', type: 'slider', min: 0, max: 100 },
      { key: 'color', label: '颜色', type: 'color' },
      { key: 'mode', label: '模式', type: 'select', options: ['normal', 'reading', 'cinema', 'party'] },
      { key: 'power', label: '功率(W)', type: 'number', readonly: true },
      { key: 'timer', label: '定时设置', type: 'timer' },
      { key: 'autoMode', label: '自动模式', type: 'switch', options: [true, false] }
    ]
  },
  
  // 窗帘设备
  curtain: {
    type: 'curtain',
    name: '智能窗帘',
    icon: 'el-icon-window',
    defaultData: {
      status: 'off', // on(开), off(关)
      position: 0,      // 0-100 (百分比打开)
      material: 'cotton', // 材质
      mode: 'manual',    // manual, auto
      power: 25, // 功率，单位瓦特
      timer: null, // 定时功能
      autoMode: false // 自动模式
    },
    configOptions: [
      { key: 'status', label: '状态', type: 'switch', options: ['on', 'off'] },
      { key: 'position', label: '位置', type: 'slider', min: 0, max: 100 },
      { key: 'material', label: '材质', type: 'select', options: ['cotton', 'linen', 'polyester', 'blackout'] },
      { key: 'mode', label: '模式', type: 'select', options: ['manual', 'auto', 'schedule'] },
      { key: 'power', label: '功率(W)', type: 'number', readonly: true },
      { key: 'timer', label: '定时设置', type: 'timer' },
      { key: 'autoMode', label: '自动模式', type: 'switch', options: [true, false] }
    ]
  },
  
  // 空调设备
  airConditioner: {
    type: 'airConditioner',
    name: '智能空调',
    icon: 'el-icon-cold',
    defaultData: {
      status: 'off',   // on, off
      temperature: 24, // 温度值 (16-30)
      mode: 'cool',    // cool, heat, auto, fan
      fanSpeed: 'auto', // auto, low, medium, high
      power: 1500, // 功率，单位瓦特
      timer: null, // 定时功能
      autoMode: false // 自动模式
    },
    configOptions: [
      { key: 'status', label: '状态', type: 'switch', options: ['on', 'off'] },
      { key: 'temperature', label: '温度', type: 'slider', min: 16, max: 30 },
      { key: 'mode', label: '模式', type: 'select', options: ['cool', 'heat', 'auto', 'fan'] },
      { key: 'fanSpeed', label: '风速', type: 'select', options: ['auto', 'low', 'medium', 'high'] },
      { key: 'power', label: '功率(W)', type: 'number', readonly: true },
      { key: 'timer', label: '定时设置', type: 'timer' },
      { key: 'autoMode', label: '自动模式', type: 'switch', options: [true, false] }
    ]
  },
  
  // 门锁设备
  doorLock: {
    type: 'doorLock',
    name: '智能门锁',
    icon: 'el-icon-lock',
    defaultData: {
      status: 'locked',   // locked, unlocked
      lockMode: 'manual', // manual, auto, schedule
      securityLevel: 'high', // low, medium, high
      power: 5, // 功率，单位瓦特
      timer: null // 定时功能
    },
    configOptions: [
      { key: 'status', label: '状态', type: 'switch', options: ['locked', 'unlocked'] },
      { key: 'lockMode', label: '锁定模式', type: 'select', options: ['manual', 'auto', 'schedule'] },
      { key: 'securityLevel', label: '安全等级', type: 'select', options: ['low', 'medium', 'high'] },
      { key: 'power', label: '功率(W)', type: 'number', readonly: true },
      { key: 'timer', label: '定时设置', type: 'timer' }
    ]
  },
  
  // 智能电视
  tv: {
    type: 'tv',
    name: '智能电视',
    icon: 'el-icon-video-play',
    defaultData: {
      status: 'off',   // on, off
      volume: 50,      // 音量 (0-100)
      channel: 1,      // 频道
      source: 'hdmi1', // 输入源
      power: 120,      // 功率，单位瓦特
      timer: null      // 定时功能
    },
    configOptions: [
      { key: 'status', label: '状态', type: 'switch', options: ['on', 'off'] },
      { key: 'volume', label: '音量', type: 'slider', min: 0, max: 100 },
      { key: 'channel', label: '频道', type: 'number', min: 1, max: 999 },
      { key: 'source', label: '输入源', type: 'select', options: ['hdmi1', 'hdmi2', 'usb', 'av', 'tv'] },
      { key: 'power', label: '功率(W)', type: 'number', readonly: true },
      { key: 'timer', label: '定时设置', type: 'timer' }
    ]
  },
  
  // 智能音箱
  speaker: {
    type: 'speaker',
    name: '智能音箱',
    icon: 'el-icon-microphone',
    defaultData: {
      status: 'off',   // on, off
      volume: 50,      // 音量 (0-100)
      mode: 'music',   // 模式: music, radio, assistant
      power: 30,       // 功率，单位瓦特
      timer: null      // 定时功能
    },
    configOptions: [
      { key: 'status', label: '状态', type: 'switch', options: ['on', 'off'] },
      { key: 'volume', label: '音量', type: 'slider', min: 0, max: 100 },
      { key: 'mode', label: '模式', type: 'select', options: ['music', 'radio', 'assistant'] },
      { key: 'power', label: '功率(W)', type: 'number', readonly: true },
      { key: 'timer', label: '定时设置', type: 'timer' }
    ]
  },
  
  // 自定义设备类型 - 用作模板
  custom: {
    type: 'custom',
    name: '自定义设备',
    icon: 'el-icon-setting',
    defaultData: {
      status: 'off',     // on, off
      customName: '',    // 自定义名称
      customType: '',    // 自定义类型
      power: 50,         // 默认功率，单位瓦特
      timer: null        // 定时功能
    },
    configOptions: [
      { key: 'status', label: '状态', type: 'switch', options: ['on', 'off'] },
      { key: 'customName', label: '设备名称', type: 'text' },
      { key: 'customType', label: '设备类型', type: 'text' },
      { key: 'power', label: '功率(W)', type: 'number' },
      { key: 'timer', label: '定时设置', type: 'timer' }    ]
  }
};

// 获取所有支持的设备类型
export function getDeviceTypes() {
  return Object.keys(deviceTypes).map(key => ({
    type: key,
    name: deviceTypes[key].name,
    icon: deviceTypes[key].icon
  }));
}

// 根据设备类型获取默认配置
export function getDefaultConfig(type) {
  if (!deviceTypes[type]) {
    console.error(`未支持的设备类型: ${type}`);
    return null;
  }
  
  return JSON.parse(JSON.stringify(deviceTypes[type].defaultData));
}

// 根据设备类型获取设备配置选项
export function getConfigOptions(type) {
  if (!deviceTypes[type]) {
    console.error(`未支持的设备类型: ${type}`);
    return [];
  }
  
  return deviceTypes[type].configOptions;
}

// 根据设备数据判断设备类型
export function detectDeviceType(deviceData) {
  if (!deviceData) return null;
  
  // 如果设备已经明确指定了类型，直接返回
  if (deviceData.type && deviceTypes[deviceData.type]) {
    return deviceData.type;
  }
  
  // 基于设备数据的特征判断设备类型
  if (deviceData.brightness !== undefined && deviceData.color !== undefined) {
    return 'light';
  } else if (deviceData.position !== undefined && deviceData.material !== undefined) {
    return 'curtain';
  } else if (deviceData.temperature !== undefined && deviceData.fanSpeed !== undefined) {
    return 'airConditioner';
  } else if (deviceData.lockMode !== undefined && deviceData.securityLevel !== undefined) {
    return 'doorLock';
  } else if (deviceData.channel !== undefined && deviceData.source !== undefined) {
    return 'tv';
  } else if (deviceData.volume !== undefined && !deviceData.channel && deviceData.mode === 'music') {
    return 'speaker';
  } else if (deviceData.customType !== undefined) {
    return 'custom';
  }
  
  return null;
}

// 获取设备完整信息
export function getDeviceTypeInfo(type) {
  return deviceTypes[type] || null;
}

export default deviceTypes;