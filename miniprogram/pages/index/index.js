// index.ts

const {
  uptUserInfo,
  getUserInfo
} = require("../../api/user");

// 获取应用实例
const app = getApp()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const defaultRole = 'Hello'
const defaultNickName = '微信用户' + Math.round(Math.random() * 10000) + new Date().getTime();


Component({
  data: {
    role: defaultRole,
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: defaultNickName,
    },
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },
  methods: {
    // 事件处理函数
    bindViewTap() {
      // 点击头像
    },
    onChooseAvatar(e) {
      const {
        avatarUrl
      } = e.detail
      const {
        nickName
      } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
      })
    },
    onInputChange(e) {
      const nickName = e.detail.value
      const {
        avatarUrl
      } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName
      })
    },
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo
          })
        }
      })
    },
    saveSetting() {
      uptUserInfo({
        username: this.data.userInfo.nickName,
        avatar: this.data.userInfo.avatarUrl
      }).then(() => {
        getUserInfo()
      });
    }
  },

  lifetimes: {
    attached(options) {
      // 读取缓存中的用户数据
      const userInfoInStorage = wx.getStorageSync('userInfo');
      console.log('用户数据', userInfoInStorage.username)

      this.setData({
        'userInfo.avatarUrl': userInfoInStorage.avatar,
        'userInfo.nickName': userInfoInStorage.username,
        role: '普通用户'
      })
    },
  }
})