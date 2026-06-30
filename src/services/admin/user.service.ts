import api from '../api';
import type { AdminUser, AdminUserCreate } from '@/types';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const adminUserService = {
  async getUsers(params?: GetUsersParams) {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },
  
  async getUserDetail(id: number | string) {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },
  
  async createUser(payload: AdminUserCreate) {
    const { data } = await api.post('/admin/users', payload);
    return data;
  },
  
  async updateUser(id: number | string, payload: Partial<AdminUserCreate>) {
    const { data } = await api.put(`/admin/users/${id}`, payload);
    return data;
  },
  
  async toggleUserStatus(id: number | string, status: 'active' | 'locked') {
    const { data } = await api.patch(`/admin/users/${id}/status`, { status });
    return data;
  }
};
