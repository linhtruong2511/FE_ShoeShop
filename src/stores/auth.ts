import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    role: localStorage.getItem('role') || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.accessToken,
    isCustomer: (state) => state.role === 'customer',
    isStaff: (state) => state.role === 'staff' || state.role === 'admin',
    isAdmin: (state) => state.role === 'admin',
  },
  actions: {
    login(token: string, user: any, role: string) {
      this.accessToken = token;
      this.user = user;
      this.role = role;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
    },
    logout() {
      this.accessToken = null;
      this.user = null;
      this.role = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
  }
});
