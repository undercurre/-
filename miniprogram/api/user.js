import request from "../utils/request"

const getUserInfo = (id) => {
  return request({
    url: `http://127.0.0.1:4000/users/${id}`,
    method: 'GET'
  })
}

const uptUserInfo = (id, userData) => {
  return request({
    url: `http://127.0.0.1:4000/users/${id}`,
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