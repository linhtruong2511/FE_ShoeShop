# Project-Scoped Rules (ShoeShop Workspace)

Tài liệu này định nghĩa các quy tắc cốt lõi về thiết kế UI/UX, bảng màu, typography, và cách xây dựng các component cho dự án ShoeShop. Antigravity Agent bắt buộc tuân thủ khi viết mã nguồn và chỉnh sửa giao diện.

---

## 1. Thiết kế UI/UX & Tương tác (UX Principles)

- **Trải nghiệm cao cấp (Premium Aesthetics)**:
  - Tránh các giao diện đơn điệu kiểu tối giản quá mức hoặc màu sắc thô cứng. Hãy hướng tới giao diện hiện đại, sạch sẽ và tạo cảm giác cao cấp.
  - Sử dụng các lớp đổ bóng mịn (`shadow-premium` và `shadow-premium-hover`) thay cho viền dày.
  - Tích hợp hiệu ứng kính mờ (glassmorphism) cho Header hoặc các thanh công cụ trượt (Drawers) để tạo chiều sâu.

- **Hiệu ứng & Hoạt họa động (Micro-animations)**:
  - Mọi nút bấm (Buttons) và thẻ sản phẩm (Product Cards) bắt buộc phải có hiệu ứng chuyển trạng thái mượt mà khi hover (`transition-all duration-300`).
  - Thẻ sản phẩm khi hover phải dịch chuyển nhẹ lên trên (`-translate-y-1.5`) và tăng độ bóng.
  - Các Drawer (giỏ hàng, bộ lọc di động) và Modal phải có hiệu ứng trượt (`translateX` hoặc `scale`) thay vì hiển thị đột ngột.

- **Thân thiện di động (Mobile-First Layout)**:
  - Mọi trang danh sách hoặc bộ lọc phức tạp trên màn hình lớn phải được chuyển đổi thành dạng ngăn kéo trượt (Slide-over drawer) trên Mobile.
  - Grid sản phẩm phải tự động co giãn từ 1 cột (Mobile nhỏ), 2 cột (Mobile lớn/Tablet), đến 3 hoặc 4 cột (Desktop).

---

## 2. Quy tắc màu sắc (Color System)

- **Tránh màu mặc định**: Không sử dụng các màu thô của trình duyệt hoặc màu thuần (như `red`, `blue`, `green` nguyên bản).
- **Brand Colors (Navy Blue Theme)**:
  - **Màu chủ đạo (Primary)**: Sử dụng các sắc độ xanh Navy đậm và Slate tối để tạo sự vững chắc, nam tính và đáng tin cậy.
    - Màu nền sâu/Header/Footer: Slate 950 / Slate 900 (`#0f172a`, `#020617`).
    - Màu nhấn điều hướng/tiêu đề phụ: Navy 900 (`#1e3a8a`), Slate 800 (`#1e293b`).
  - **Màu hành động (Accent)**: Sử dụng màu Đỏ cam sáng (`#ef4444`, `#dc2626`) cho nút mua sắm, giá khuyến mãi, hoặc nhãn giảm giá để thu hút sự chú ý.
  - **Màu nền phụ (Backgrounds)**: Sử dụng màu trắng ngà hoặc xám nhẹ (`#f8fafc` - Slate 50, `#f1f5f9` - Slate 100) làm nền để tôn sản phẩm.
  - **Màu viền & Phân cách (Borders)**: Dùng các đường kẻ mảnh màu xám rất nhẹ (`#e2e8f0` - Slate 200) để phân tách khu vực.

---

## 3. Typography (Phông chữ)

- **Cấu hình Fonts**:
  - Luôn sử dụng phông chữ **Outfit** làm phông chữ chính cho các tiêu đề lớn, logo, nút bấm và nhãn số liệu (tạo cảm giác hiện đại, bo tròn năng động).
  - Phông chữ **Inter** dùng cho đoạn văn bản dài, mô tả chi tiết sản phẩm và các ghi chú nhỏ (tối ưu hóa khả năng đọc ở mọi kích cỡ).
- **Hệ thống cấp bậc (Hierarchy)**:
  - Tiêu đề chính (`H1`): Cỡ chữ tối thiểu `text-3xl` đến `text-5xl` trên Desktop, trọng số `font-extrabold` hoặc `font-black`. Chỉ sử dụng tối đa một thẻ `H1` trên mỗi trang.
  - Tiêu đề phụ (`H2`, `H3`): Sử dụng `font-bold` và chữ in hoa nhẹ nhàng để tăng tính phân cấp.
  - Văn bản nội dung (`body`): Sử dụng cỡ chữ `text-sm` hoặc `text-base`, màu xám đậm (`text-slate-600` hoặc `text-slate-700`), khoảng cách dòng rộng rãi (`leading-relaxed`).

---

## 4. Thành phần & Components tái sử dụng (Reusability)

- **Nguyên tắc đóng gói**:
  - Các component phải có tính độc lập cao, nhận dữ liệu qua `Props` (sử dụng TypeScript định nghĩa kiểu rõ ràng) và phản hồi sự kiện qua `Emits`.
  - Component hiển thị (Stateless component) như `ProductCard.vue` không được tự ý thay đổi state toàn cục mà phải thông qua Pinia store hoặc kích hoạt emit lên view cha.
  - Tổ chức thư mục chuẩn hóa:
    - `src/components/common/`: Cho các nút bấm, ô nhập dữ liệu, thẻ card, modal, badge dùng chung.
    - `src/components/layout/`: Cho Header, Footer, Sidebar, Navigation dùng chung trên toàn hệ thống.
