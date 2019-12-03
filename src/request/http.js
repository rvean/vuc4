import axios from 'axios';
import qs from 'qs';

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASEURL,
  timeout: 1000 * 10,
  withCredentials: process.env.NODE_ENV === 'development',
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
});

instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = '';
    config.headers.token = token;

    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    const { status, data } = response;
    if (status !== 200) return Promise.reject(response);

    if (data.error) {
      if (data.code === -1) {

      }

      return Promise.reject(data.message || '');
    }
    return Promise.resolve(data.data);
  },
  error => {
    if (error.message === 'Network Error') {
      // Toast('网络请求失败');
    }
    return Promise.reject(error);
  }
);

export default instance;