declare namespace ApiService {
  type WechatLoginResult = {
    message: string;
    accessToken: string;
    userId: string;
  }

  interface RequestOptions {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    header?: Record<string, string>;
  }
  
  interface Response<T> {
    data: T;
    statusCode: number;
    header: Record<string, string>;
    cookies: string[];
    errMsg: string;
  }
}