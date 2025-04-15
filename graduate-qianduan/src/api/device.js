import request from '@/utils/request'

// 获取所有设备
export function getAllDevices() {
  return request({
    url: '/home/list',
    method: 'get'
  })
}

// 获取设备详情
export function getDeviceById(id) {
  return request({
    url: `/home/${id}`,
    method: 'get'
  })
}

// 添加设备
export function addDevice(data) {
  return request({
    url: '/home/add',
    method: 'post',
    data
  })
}

// 更新设备
export function updateDevice(data) {
  return request({
    url: '/home/update',
    method: 'put',
    data
  })
}

// 删除设备
export function deleteDevice(id) {
  return request({
    url: `/home/delete/${id}`,
    method: 'delete'
  })
}
