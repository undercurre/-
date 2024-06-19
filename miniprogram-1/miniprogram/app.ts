// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          wx.request<ApiService.WechatLoginResult>({
            url: 'http://127.0.0.1:4000/wechat-login',
            method: 'POST',
            data: {
              code: res.code
            },
            success: (response) => {
              console.log(response)
              const cookies = response.cookies
              const cookieString = cookies[0];

              // 使用正则表达式从字符串中提取 refresh_token
              const refreshTokenMatch = cookieString.match(/refresh_token=([^;]+)/);
              const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

              wx.setStorageSync('refreshToken', refreshToken);
              if (response.data.accessToken) {
                // 存储accessToken
                wx.setStorageSync('accessToken', response.data.accessToken);
              }
            }
          });
        }
      },
    })
  },
})