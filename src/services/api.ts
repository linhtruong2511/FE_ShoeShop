import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
});

// Request interceptor — gắn token
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

const prefixStaticUrls = (obj: any, domain: string): any => {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('/static/')) {
      return `${domain}${obj}`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => prefixStaticUrls(item, domain));
  }
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = prefixStaticUrls(obj[key], domain);
      }
    }
  }
  return obj;
};

// Response interceptor — xử lý lỗi chung và tự động prefix url static
api.interceptors.response.use(
  (response) => {
    const domain = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');
    response.data = prefixStaticUrls(response.data, domain);
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
