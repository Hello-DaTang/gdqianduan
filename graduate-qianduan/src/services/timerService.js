// 定时器服务，用于处理设备定时操作
import store from '@/store'

class TimerService {
  constructor() {
    this.timers = new Map(); // 存储所有定时器的Map
    this.checkInterval = 60 * 1000; // 检查间隔：1分钟
    this.isRunning = false;
    this.intervalId = null;
  }
  // 启动定时服务
  start() {
    if (this.isRunning) return;
    
    console.log('%c定时器服务启动', 'color: #4285F4; font-weight: bold; font-size: 14px;');
    this.isRunning = true;
    
    // 立即执行一次检查
    this.checkTimers();
    
    // 设置定期检查
    this.intervalId = setInterval(() => {
      this.checkTimers();
    }, this.checkInterval);
    
    // 显示初始化消息
    this._logMessage('定时服务已初始化，将会检查并执行设备定时任务');
  }

  // 停止定时服务
  stop() {
    if (!this.isRunning) return;
    
    console.log('定时器服务停止');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // 检查所有设备的定时器设置
  async checkTimers() {
    try {
      // 获取所有设备
      const devices = await store.dispatch('device/fetchDevices');
      
      if (!devices || devices.length === 0) return;
      
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // 检查每个设备的定时器设置
      devices.forEach(device => {
        const timer = device.deviceData && device.deviceData.timer;
        
        // 如果定时器已启用，时间设置正确，并且操作有效
        if (timer && timer.enabled && timer.time && timer.action) {
          // 如果时间匹配（小时和分钟相同）
          if (this.timeMatches(timer.time, currentTimeString)) {
            console.log(`执行设备[${device.homeName}]的定时操作: ${timer.action}，当前时间: ${currentTimeString}`);
            this.executeTimerAction(device, timer.action);
          }
        }
      });
    } catch (error) {
      console.error('检查定时器失败:', error);
    }
  }
  
  // 判断两个时间是否匹配（只比较小时和分钟）
  timeMatches(time1, time2) {
    // 将 HH:mm 格式的时间转换为分钟数进行比较
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    
    const totalMinutes1 = hours1 * 60 + minutes1;
    const totalMinutes2 = hours2 * 60 + minutes2;
    
    // 允许1分钟的误差
    return Math.abs(totalMinutes1 - totalMinutes2) <= 1;
  }
  // 执行定时器动作
  async executeTimerAction(device, action) {
    try {
      const deviceData = { ...device.deviceData };
      const deviceType = device.type;
      const deviceName = device.homeName || '未命名设备';
      const deviceLocation = device.location || '默认位置';
      
      this._logMessage(`开始执行定时任务: ${deviceName} (${deviceLocation}) - ${action}`, 'info');
      
      // 根据不同设备类型和动作执行不同的操作
      switch (deviceType) {
        case 'light':
          this.handleLightAction(deviceData, action);
          break;
        case 'doorLock':
          this.handleDoorLockAction(deviceData, action);
          break;
        case 'curtain':
          this.handleCurtainAction(deviceData, action);
          break;
        case 'airConditioner':
          this.handleAirConditionerAction(deviceData, action);
          break;
        case 'tv':
        case 'speaker':
          this.handleCommonAction(deviceData, action);
          break;
        default:
          this.handleCommonAction(deviceData, action);
      }
      
      // 更新设备状态
      await store.dispatch('device/updateDevice', {
        id: device.id,
        deviceData: deviceData
      });
      
      this._logMessage(`设备[${deviceName}]定时操作[${action}]已成功执行`, 'success');
      
      // 如果浏览器支持通知，发送通知提醒用户
      this._sendNotification(deviceName, action, deviceType);
    } catch (error) {
      this._logMessage(`执行定时操作失败: ${error.message}`, 'error');
      console.error(error);
    }
  }
  
  // 处理灯光设备的动作
  handleLightAction(deviceData, action) {
    switch (action) {
      case 'on':
        deviceData.status = 'on';
        break;
      case 'off':
        deviceData.status = 'off';
        break;
      case 'dim':
        deviceData.status = 'on';
        deviceData.brightness = Math.max(deviceData.brightness - 30, 10);
        break;
      case 'brighten':
        deviceData.status = 'on';
        deviceData.brightness = Math.min(deviceData.brightness + 30, 100);
        break;
      default:
        break;
    }
  }
  
  // 处理门锁设备的动作
  handleDoorLockAction(deviceData, action) {
    switch (action) {      case 'lock': {
        deviceData.locked = true;
        
        // 添加操作日志
        const lockLog = {
          action: 'lock',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: '定时系统'
        };
        
        // 获取现有的日志记录或创建新数组
        const lockLogs = deviceData.accessLogs ? [...deviceData.accessLogs] : [];
        lockLogs.unshift(lockLog);
        deviceData.accessLogs = lockLogs.slice(0, 5); // 只保留最近5条记录
        break;
      }      case 'unlock': {
        deviceData.locked = false;
        
        // 添加操作日志
        const unlockLog = {
          action: 'unlock',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: '定时系统'
        };
        
        // 获取现有的日志记录或创建新数组
        const unlockLogs = deviceData.accessLogs ? [...deviceData.accessLogs] : [];
        unlockLogs.unshift(unlockLog);
        deviceData.accessLogs = unlockLogs.slice(0, 5); // 只保留最近5条记录
        break;
      }
      default:
        break;
    }
  }
  
  // 处理窗帘设备的动作
  handleCurtainAction(deviceData, action) {
    switch (action) {
      case 'on':
      case 'open':
        deviceData.status = 'on';
        deviceData.position = 100;
        break;
      case 'off':
      case 'close':
        deviceData.status = 'off';
        deviceData.position = 0;
        break;
      default:
        break;
    }
  }
  
  // 处理空调设备的动作
  handleAirConditionerAction(deviceData, action) {
    switch (action) {
      case 'on':
        deviceData.status = 'on';
        break;
      case 'off':
        deviceData.status = 'off';
        break;
      case 'cool':
        deviceData.status = 'on';
        deviceData.mode = 'cool';
        break;
      case 'heat':
        deviceData.status = 'on';
        deviceData.mode = 'heat';
        break;
      default:
        break;
    }
  }
  
  // 处理通用设备的动作（电视、音响等）
  handleCommonAction(deviceData, action) {
    switch (action) {
      case 'on':
        deviceData.status = 'on';
        break;
      case 'off':
        deviceData.status = 'off';
        break;
      default:
        break;
    }
  }
    // 发送浏览器通知
  _sendNotification(deviceName, action, deviceType) {
    // 检查是否支持通知
    if (!("Notification" in window)) {
      return;
    }
    
    // 获取动作的可读文本
    let actionText = action;
    switch (action) {
      case 'on':
        actionText = '开启';
        break;
      case 'off':
        actionText = '关闭';
        break;
      case 'lock':
        actionText = '上锁';
        break;
      case 'unlock':
        actionText = '解锁';
        break;
      case 'dim':
        actionText = '调暗';
        break;
      case 'brighten':
        actionText = '调亮';
        break;
    }
    
    // 转换设备类型为可读文本（仅用于日志记录，不在通知中使用）
    this._getDeviceTypeText(deviceType);
    
    // 已获得通知权限
    if (Notification.permission === "granted") {
      this._createNotification(deviceName, actionText);
    }
    // 未决定通知权限
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          this._createNotification(deviceName, actionText);
        }
      });
    }
  }
    // 创建通知
  _createNotification(deviceName, actionText) {
    const notification = new Notification("智能家居定时任务", {
      body: `${deviceName} 已按计划${actionText}`,
      icon: "/favicon.ico"
    });
    
    // 3秒后关闭通知
    setTimeout(() => {
      notification.close();
    }, 3000);
  }
  
  // 记录服务日志
  _logMessage(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = '[定时服务]';
    
    switch (type) {
      case 'success':
        console.log(`%c${prefix} ${timestamp}: ${message}`, 'color: #67C23A; font-weight: bold;');
        break;
      case 'warning':
        console.warn(`%c${prefix} ${timestamp}: ${message}`, 'color: #E6A23C; font-weight: bold;');
        break;
      case 'error':
        console.error(`%c${prefix} ${timestamp}: ${message}`, 'color: #F56C6C; font-weight: bold;');
        break;
      default:
        console.log(`%c${prefix} ${timestamp}: ${message}`, 'color: #909399;');
    }
  }
  
  // 获取设备类型的可读文本
  _getDeviceTypeText(deviceType) {
    switch (deviceType) {
      case 'light': return '灯光';
      case 'curtain': return '窗帘';
      case 'airConditioner': return '空调';
      case 'doorLock': return '门锁';
      case 'tv': return '电视';
      case 'speaker': return '音响';
      default: return deviceType;
    }
  }
}

// 创建和导出单例实例
const timerService = new TimerService();
export default timerService;
