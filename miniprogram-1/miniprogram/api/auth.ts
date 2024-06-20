import request from "../utils/request";

const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async res => {
        if (res.code) {
          const loginResponse = await request.post('/login', {
            data: {
              code: res.code,
            }
          });
          const cookies = loginResponse
          console.log(loginResponse)

          // // 使用正则表达式从字符串中提取 refresh_token
          // const refreshTokenMatch = cookieString.match(/refresh_token=([^;]+)/);
          // const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

          // wx.setStorageSync('refreshToken', refreshToken);
          // if (loginResponse.data.accessToken) {
          //   // 存储accessToken
          //   wx.setStorageSync('accessToken', loginResponse.data.accessToken);
          //   wx.setStorageSync('userId', loginResponse.data.userId);
          // }
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