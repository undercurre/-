import request from "../utils/request";
import { parseCookies } from '../utils/util';

const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async res => {
        console.log(res.code)
        if (res.code) {
          const loginResponse = await request.post('/wechat-login', {
            code: res.code
          });
          const cookies = loginResponse.headers['Set-Cookie'];
          const cookieString = cookies[0];
          const cookiesObj = parseCookies(cookieString);
          console.log(cookiesObj)
          const refreshToken = cookiesObj.refresh_token ? cookiesObj.refresh_token : null;
          wx.setStorageSync('refreshToken', refreshToken);
          if (loginResponse.data.accessToken) {
            // 存储accessToken
            wx.setStorageSync('accessToken', loginResponse.data.accessToken);
            wx.setStorageSync('userId', loginResponse.data.userId);
          }
        }
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    })
  })
}

// 刷新 token 的函数
const refreshToken = async () => {
  try {
    const refresh_token = wx.getStorageSync('refresh_token');
    const response = await request.post('/refresh-token', {
      headers: {
        'Cookie': refresh_token
      }
    });
    const newAccessToken = response.data.accessToken;
    wx.setStorageSync('access_token', newAccessToken);
    return newAccessToken;
  } catch (error) {
    // 刷新 token 失败，清除登录态
    wx.removeStorageSync('access_token');
    wx.removeStorageSync('refresh_token');
    wx.redirectTo({ url: '/pages/login/login' });
    return null;
  }
};

export { refreshToken, login }