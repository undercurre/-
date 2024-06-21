import request from "../utils/request"

const getUserInfo = () => {
  const userId = wx.getStorageSync('userId');
  return request({
    url: `http://127.0.0.1:4000/users/${userId}`,
    method: 'GET'
  })
}

const uptUserInfo = (userData) => {
  const userId = wx.getStorageSync('userId');
  return request({
    url: `http://127.0.0.1:4000/users/${userId}`,
    method: 'PUT',
    data: {
      ...userData,
    },
  })
}

const delUserInfo = (id) => {
  return request({
    url: `http://127.0.0.1:4000/users/${id}`,
    method: 'DELETE'
  })
}

export { getUserInfo, uptUserInfo, delUserInfo }