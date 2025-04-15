import axios from 'axios'
import Router from '@/router'
import { removeToken, getToken } from '@/utils/auth'

// 创建axios实例并明确指定后端服务器地址为8080端口
const service = axios.create({
  baseURL: 'http://localhost:8080', // 明确指定后端地址为8080端口
  withCredentials: true,
  timeout: 500000 
})

// axios请求拦截器
service.interceptors.request.use(
  config => {
    let token = getToken();
    console.log('当前token:', token); // 调试用，帮助检查token是否存在
    if(token){
      config.headers['token'] = token;
    }
    return config;
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

//axios响应拦截器
service.interceptors.response.use(res => {
    // 检查是否需要登录
    if (res.data && res.data.code === 0 && res.data.msg === 'NOT_LOGIN') {
        console.log('用户未登录, 直接跳转至登录页面');
        removeToken();
        Router.replace('/login');
        return res;
    } else {
        return res;
    }
},
    
error => {
    console.log('err' + error)
    let { message } = error;
    if (message == "Network Error") {
        message = "后端接口连接异常";
    }
    else if (message.includes("timeout")) {
        message = "系统接口请求超时";
    }
    else if (message.includes("Request failed with status code")) {
        message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    return Promise.reject(error)
})

export default service
