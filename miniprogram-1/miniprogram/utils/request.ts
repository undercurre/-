// utils/request.ts
const request = <T = any>({ url, method, data, header = {} }: ApiService.RequestOptions): Promise<ApiService.Response<T>> => {
  const accessToken = wx.getStorageSync('access_token');
  const finalHeaders = {
    ...header,
    Authorization: accessToken ? `Bearer ${accessToken}` : '',
    'Content-Type': 'application/json',
  };
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: finalHeaders,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res as ApiService.Response<T>);
        } else {
          reject(new Error(`HTTP status code: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export { request };
