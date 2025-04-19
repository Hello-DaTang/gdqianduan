import request from '@/utils/request'

// 获取所有设备
export function getAllHomes() {
  return request({
    url: '/home',
    method: 'get',
    params: {
      page: 1,
      pageSize: 50 // 获取足够多的设备
    }
  })
}

// 获取设备详情
export function getHomeById(id) {
  return request({
    url: `/home/${id}`,
    method: 'get'
  })
}

// 添加设备
export function addHome(data) {
  return request({
    url: '/home/add',
    method: 'post',
    data
  })
}

// 更新设备
export function updateHome(data) {
  return request({
    url: '/home/update',
    method: 'put',
    data
  })
}

// 删除设备
export function deleteHome(id) {
  return request({
    url: `/home/delete/${id}`,
    method: 'delete'
  })
}
