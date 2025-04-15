import request from '@/utils/request'

// 获取所有设备
export function getUserOperate() {
  return request({
    url: '/operateLog/info',
    method: 'get'
  })
}