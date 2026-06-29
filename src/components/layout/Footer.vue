<template>
  <footer class="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        <!-- Column 1: Intro & Contact -->
        <div>
          <div class="flex items-center space-x-1 mb-6">
            <span class="text-2xl font-extrabold font-sans tracking-wider text-white">MY<span class="text-brand-accent">SHOES</span></span>
          </div>
          <p class="text-sm text-slate-400 mb-6 leading-relaxed">
            Hệ thống cửa hàng giày thể thao chính hãng Nike, Adidas, Puma, Jordan... hàng đầu Việt Nam. Cam kết chính hãng 100%, đồng hành cùng phong cách của bạn.
          </p>
          <div class="space-y-3 text-sm">
            <div class="flex items-start">
              <svg class="h-5 w-5 text-brand-accent mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Địa chỉ: 249 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội</span>
            </div>
            <div class="flex items-center">
              <svg class="h-5 w-5 text-brand-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Hotline: 1900 1234 / 0987 654 321</span>
            </div>
            <div class="flex items-center">
              <svg class="h-5 w-5 text-brand-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email: support@myshoes.vn</span>
            </div>
          </div>
        </div>

        <!-- Column 2: Links - About -->
        <div>
          <h3 class="text-white font-semibold font-sans tracking-wide mb-6 uppercase text-sm">Về chúng tôi</h3>
          <ul class="space-y-3.5 text-sm">
            <li><a href="#" class="hover:text-white transition-colors duration-200">Giới thiệu MyShoes</a></li>
            <li><a href="#" class="hover:text-white transition-colors duration-200">Tuyển dụng</a></li>
            <li><a href="#" class="hover:text-white transition-colors duration-200">Hệ thống cửa hàng</a></li>
            <li><a href="#" class="hover:text-white transition-colors duration-200">Tin tức & Blog</a></li>
            <li><a href="#" class="hover:text-white transition-colors duration-200">Liên hệ hợp tác</a></li>
          </ul>
        </div>

        <!-- Column 3: Links - Policies -->
        <div>
          <h3 class="text-white font-semibold font-sans tracking-wide mb-6 uppercase text-sm">Chính sách mua hàng</h3>
          <ul class="space-y-3.5 text-sm">
            <li><a href="#" class="hover:text-white transition-colors duration-200">Chính sách bảo hành sản phẩm</a></li>
            <li><a href="#" class="hover:text-white transition-colors duration-200">Chính sách đổi trả trong 30 ngày</a></li>
            <li><a href="#" class="hover:text-white transition-colors duration-200">Chính sách vận chuyển & Giao nhận</a></li>
            <li><a href="#" class="hover:text-white transition-colors duration-200">Chính sách bảo mật thông tin</a></li>
            <li><a href="#" class="hover:text-white transition-colors duration-200">Điều khoản sử dụng</a></li>
          </ul>
        </div>

        <!-- Column 4: Payments & Certification -->
        <div>
          <h3 class="text-white font-semibold font-sans tracking-wide mb-6 uppercase text-sm">Phương thức thanh toán</h3>
          <div class="flex flex-wrap gap-2.5 mb-6">
            <span class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md text-xs font-bold text-slate-300">VISA</span>
            <span class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md text-xs font-bold text-slate-300">MASTER CARD</span>
            <span class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md text-xs font-bold text-slate-300">VNPAY</span>
            <span class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md text-xs font-bold text-slate-300">COD</span>
            <span class="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md text-xs font-bold text-slate-300">MOMO</span>
          </div>

          <h3 class="text-white font-semibold font-sans tracking-wide mb-4 uppercase text-xs">Chứng nhận</h3>
          <div class="flex items-center space-x-3">
            <div class="bg-white/5 border border-slate-800 rounded px-2.5 py-1 text-center text-[10px] font-bold text-brand-accent tracking-widest uppercase">
              ĐÃ ĐĂNG KÝ
              <div class="text-[7px] text-slate-400 font-normal">Bộ Công Thương</div>
            </div>
            <div class="bg-white/5 border border-slate-800 rounded px-2.5 py-1 text-center text-[10px] font-bold text-emerald-500 tracking-widest uppercase">
              SECURED
              <div class="text-[7px] text-slate-400 font-normal">SSL Connection</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer Bottom -->
      <div class="mt-16 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <p>&copy; 2026 MyShoes.vn. Tất cả quyền được bảo lưu. Công nghệ phát triển bởi Vue.js + Tailwind CSS.</p>
        <div class="flex space-x-4">
          <a href="#" class="hover:text-white transition-colors duration-200">Facebook</a>
          <a href="#" class="hover:text-white transition-colors duration-200">Instagram</a>
          <a href="#" class="hover:text-white transition-colors duration-200">YouTube</a>
          <a href="#" class="hover:text-white transition-colors duration-200">TikTok</a>
        </div>
      </div>
    </div>
  </footer>
</template>
