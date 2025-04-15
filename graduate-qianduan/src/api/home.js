import request from '@/utils/request'

// 添加家居设备
export function addHomeDevice(data) {
  return request({
    url: '/home/add',
    method: 'post',
    data
  })
}

// 获取家居设备详情
export function getHomeDevice(id) {
  return request({
    url: `/home/${id}`,
    method: 'get'
  })
}

// 更新家居设备
export function updateHomeDevice(data) {
  return request({
    url: '/home/update',
    method: 'put',
    data
  })
}
