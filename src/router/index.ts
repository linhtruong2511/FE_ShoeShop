import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';

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
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/OrderDetailView.vue'),
      },
    ]
  },
  {
    path: '/admin',
    component: () => import('../components/layout/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboardView.vue')
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('../views/admin/AdminProductListView.vue')
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/AdminOrderListView.vue')
      },
      {
        path: 'vouchers',
        name: 'AdminVouchers',
        component: () => import('../views/admin/AdminVoucherListView.vue')
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

export default router;
