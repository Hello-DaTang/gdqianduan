import request from '@/utils/request'

// 上传文件至阿里云
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('image', file)
  
  return request({
    url: '/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
