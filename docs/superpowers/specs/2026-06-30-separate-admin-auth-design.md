# Thiết kế Tách biệt Luồng Đăng nhập Khách hàng và Quản trị viên (FE_ShoeShop)

## 1. Mục tiêu
Tách rời hoàn toàn luồng đăng nhập của Khách hàng (Customer) và Quản trị viên/Nhân viên (Admin/Staff) trên giao diện Frontend:
- Khách hàng đăng nhập qua trang thường, token lưu riêng (`accessToken`).
- Admin/Staff đăng nhập qua trang Admin, token lưu riêng (`adminAccessToken`).
- Việc đăng nhập/đăng xuất của bên này hoàn toàn không ảnh hưởng tới trạng thái đăng nhập của bên kia.

---

## 2. Kiến trúc & Giải pháp Đề xuất

### 2.1 Quản lý trạng thái (Pinia Stores)
Chúng ta sẽ có 2 stores riêng biệt:
1. **`useAuthStore`** (`src/stores/auth.ts`):
   - Quản lý trạng thái của Khách hàng.
   - LocalStorage Keys: `accessToken`, `user` (hoặc `customerToken`, `customerUser`).
   - Sẽ đổi sang chỉ lưu thông tin khách hàng, bỏ logic kiểm tra role `admin`/`staff`.
2. **`useAdminAuthStore`** (`src/stores/adminAuth.ts`):
   - Quản lý trạng thái của Quản trị viên / Nhân viên.
   - LocalStorage Keys: `adminAccessToken`, `adminUser`, `adminRole`.
   - Cung cấp các getters: `isLoggedIn`, `isStaff`, `isAdmin`.

### 2.2 Tự động đính kèm Token & Xử lý lỗi (Axios Interceptors)
Trong `src/services/api.ts`:
- **Request Interceptor**:
  - Kiểm tra URL của request:
    - Nếu request URL bắt đầu bằng `/admin/` hoặc `/auth/admin/`, lấy token từ `useAdminAuthStore`.
    - Ngược lại, lấy token từ `useAuthStore` (Khách hàng).
- **Response Interceptor**:
  - Khi gặp lỗi `401 Unauthorized`:
    - Nếu request bị lỗi là request của admin (URL bắt đầu bằng `/admin/` hoặc `/auth/admin/`), thực hiện logout ở `useAdminAuthStore` và chuyển hướng về `/admin/login`.
    - Ngược lại, thực hiện logout ở `useAuthStore` và chuyển hướng về `/login`.

### 2.3 Bảo vệ định tuyến (Vue Router Guards)
Trong `src/router/index.ts`:
- Route guard `router.beforeEach`:
  - Đối với các route yêu cầu quyền khách hàng (`meta.requiresCustomerAuth`): Sử dụng `useAuthStore` để kiểm tra.
  - Đối với các route yêu cầu quyền admin/staff (`meta.requiresStaffAuth` hoặc `meta.requiresAdmin`): Sử dụng `useAdminAuthStore` để kiểm tra. Nếu chưa đăng nhập, chuyển hướng về `/admin/login`.

---

## 3. Các File cần Chỉnh sửa

1. **[MODIFY]** `src/stores/auth.ts`: Giới hạn chỉ dùng cho Customer.
2. **[NEW]** `src/stores/adminAuth.ts`: Tạo store riêng cho Admin/Staff.
3. **[MODIFY]** `src/services/api.ts`: Điều phối Token dựa trên API endpoint và xử lý lỗi 401 riêng biệt.
4. **[MODIFY]** `src/router/index.ts`: Cập nhật route guard kiểm tra song song 2 stores.
5. **[MODIFY]** `src/components/layout/AdminLayout.vue`: Sử dụng `useAdminAuthStore` và cập nhật logic Logout.
6. **[MODIFY]** `src/views/admin/AdminLoginView.vue`: Chuyển sang sử dụng `useAdminAuthStore`.
7. **[MODIFY]** `src/views/admin/AdminUserListView.vue`: Chuyển sang sử dụng `useAdminAuthStore`.
