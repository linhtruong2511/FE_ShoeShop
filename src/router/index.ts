import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../components/layout/UserLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: HomeView,
      },
      {
        path: 'products',
        name: 'ProductList',
        component: () => import('../views/ProductListView.vue'),
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetailView.vue'),
      },
      {
        path: 'checkout',
        name: 'Checkout',
        component: () => import('../views/CheckoutView.vue'),
      },
      {
        path: 'orders',
        name: 'OrderHistory',
        component: () => import('../views/OrderHistoryView.vue'),
        meta: { requiresCustomerAuth: true }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/OrderDetailView.vue'),
        meta: { requiresCustomerAuth: true }
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('../views/RegisterView.vue'),
      },
    ]
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/AdminLoginView.vue'),
  },
  {
    path: '/admin',
    component: () => import('../components/layout/AdminLayout.vue'),
    redirect: '/admin/',
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboardView.vue'),
        meta: { requiresStaffAuth: true }
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('../views/admin/AdminProductListView.vue'),
        meta: { requiresStaffAuth: true, requiresAdmin: true }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/AdminOrderListView.vue'),
        meta: { requiresStaffAuth: true }
      },
      {
        path: 'vouchers',
        name: 'AdminVouchers',
        component: () => import('../views/admin/AdminVoucherListView.vue'),
        meta: { requiresStaffAuth: true, requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/AdminUserListView.vue'),
        meta: { requiresStaffAuth: true, requiresAdmin: true }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('../views/admin/AdminCategoryListView.vue'),
        meta: { requiresStaffAuth: true, requiresAdmin: true }
      },
      {
        path: 'brands',
        name: 'AdminBrands',
        component: () => import('../views/admin/AdminBrandListView.vue'),
        meta: { requiresStaffAuth: true, requiresAdmin: true }
      },
      {
        path: 'audit-logs',
        name: 'AdminAuditLogs',
        component: () => import('../views/admin/AdminAuditLogView.vue'),
        meta: { requiresStaffAuth: true, requiresAdmin: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // Check customer auth
  if (to.matched.some(record => record.meta.requiresCustomerAuth) && !authStore.isCustomer) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  // Check admin/staff auth
  if (to.matched.some(record => record.meta.requiresStaffAuth) && !authStore.isStaff) {
    return next({ path: '/admin/login' });
  }

  if (to.matched.some(record => record.meta.requiresAdmin) && !authStore.isAdmin) {
    return next({ path: '/admin/dashboard' });
  }

  next();
});

export default router;

