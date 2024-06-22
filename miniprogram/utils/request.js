import axios from 'axios';
import wxAdapter from 'axios-miniprogram-adapter';
import {
  refreshToken
} from '../api/auth';

axios.defaults.adapter = wxAdapter;
// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:4000', // 所有的请求地址前缀部分
  timeout: 60000, // 请求超时时间毫秒
  withCredentials: true, // 异步请求携带cookie
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const access_token = wx.getStorageSync('accessToken');
    const handleConfig = {
      ...config
    };
    if (!handleConfig.headers) {
      handleConfig.headers = {};
    }
    if (!handleConfig.headers.Authorization) {
      handleConfig.headers.Authorization = `Bearer ${access_token}` || '';
    }
    return handleConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401) {
      const refresh_token = wx.getStorageSync('refreshToken');
      console.log(error.config.url)
      if (refresh_token && error.config.url !== 'http://localhost:4000/refresh-token') {
        const newAccessToken = await refreshToken();
        console.log(newAccessToken)
        if (newAccessToken) {
          console.log('重新请求')
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return request(originalRequest);
        }
      } else {
        // 重定向到登录
      }
    }
    return Promise.reject(error);
  }
);

export default request;