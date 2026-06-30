import { defineStore } from 'pinia';

export const useAdminAuthStore = defineStore('adminAuth', {
  state: () => ({
    adminAccessToken: localStorage.getItem('adminAccessToken') || null,
    adminUser: JSON.parse(localStorage.getItem('adminUser') || 'null'),
    adminRole: localStorage.getItem('adminRole') || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.adminAccessToken,
    isStaff: (state) => state.adminRole === 'staff' || state.adminRole === 'admin',
    isAdmin: (state) => state.adminRole === 'admin',
  },
  actions: {
    login(token: string, user: any, role: string) {
      this.adminAccessToken = token;
      this.adminUser = user;
      this.adminRole = role;
      localStorage.setItem('adminAccessToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      localStorage.setItem('adminRole', role);
    },
    logout() {
      this.adminAccessToken = null;
      this.adminUser = null;
      this.adminRole = null;
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminRole');
    }
  }
});
