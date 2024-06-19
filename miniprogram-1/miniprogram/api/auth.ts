import { request } from "../utils/request";

const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          const loginResponse = await request<ApiService.WechatLoginResult>({
            url: 'http://127.0.0.1:4000/wechat-login',
            method: 'POST',
            data: {
              code: res.code
            },
          });
          const cookies = loginResponse.cookies
          const cookieString = cookies[0];

          // 使用正则表达式从字符串中提取 refresh_token
          const refreshTokenMatch = cookieString.match(/refresh_token=([^;]+)/);
          const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

          wx.setStorageSync('refreshToken', refreshToken);
          if (loginResponse.data.accessToken) {
            // 存储accessToken
            wx.setStorageSync('accessToken', loginResponse.data.accessToken);
            wx.setStorageSync('userId', loginResponse.data.userId);
          }

          resolve(res);
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

export { login };