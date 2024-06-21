import { login } from "./api/auth"
import { getUserInfo } from "./api/user";

// app.ts
App({
  globalData: {},
  async onLaunch() {
    // 通过判断是否存有userIdz证明是否登录过
    const userId = wx.getStorageSync('userId');
    if (!userId) {
      await login();
    }

    // 如果登陆过，马上请求该用户的信息
    const userInfoRes = await getUserInfo(userId);
    wx.setStorageSync('userInfo', userInfoRes.data);
  }
})