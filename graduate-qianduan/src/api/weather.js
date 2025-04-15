import request from '@/utils/request'

// 获取天气信息
export function getWeather(cityName) {
  return request({
    url: '/weather',
    method: 'get',
    params: { cityName },
    headers: {
      // 确保请求头携带token
      'needToken': true
    }
  })
}
