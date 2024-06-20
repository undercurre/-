import request from "../utils/request"

const getUserInfo = (id: string) => {
  return request<UserService.UserEntity>({
    url: `http://127.0.0.1:4000/users/${id}`,
    method: 'GET'
  })
}

const uptUserInfo = (id: string, userData: UserService.UserEntity) => {
  return request<UserService.UserEntity>({
    url: `http://127.0.0.1:4000/users/${id}`,
    method: 'PUT',
    data: {
      ...userData,
    },
  })
}

const delUserInfo = (id: string) => {
  return request<UserService.UserEntity>({
    url: `http://127.0.0.1:4000/users/${id}`,
    method: 'DELETE'
  })
}

export { getUserInfo, uptUserInfo, delUserInfo }