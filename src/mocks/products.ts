import type { Product, Voucher } from '../types';

export const mockProducts: Product[] = [
  {
    product_id: 'adidas-superstar',
    product_code: 'ADISUPER',
    product_name: 'Giày Adidas Superstar Mũi Sò Cổ Điển',
    brand_name: 'Adidas',
    category_name: 'Giày Thể Thao',
    description: 'Giày Adidas Superstar là một trong những mẫu sneaker mang tính biểu tượng nhất thế giới. Ban đầu được giới thiệu như một mẫu giày bóng rổ cổ thấp vào năm 1969, đôi giày nhanh chóng được giới hip-hop và thời trang đường phố ưa chuộng nhờ phần mũi giày hình vỏ sò độc đáo (shell toe) cùng chất liệu da cao cấp và 3 sọc đen đặc trưng.',
    gender_target: 'unisex',
    status: 'active',
    rating: 4.8,
    reviewsCount: 154,
    isHot: true,
    isNew: false,
    colors: [
      {
        color_id: 'superstar-white-black',
        product_id: 'adidas-superstar',
        color_code: 'WHITE-BLACK',
        color_name: 'Trắng Đen',
        hex_code: '#FFFFFF',
        price: 2300000,
        discount_type: 'percent',
        discount_value: 22, // Price after discount ~ 1790000
        is_default: true,
        status: 'active',
        images: [
          { image_id: 'img-ss-wb-1', color_id: 'superstar-white-black', image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600&auto=format&fit=crop', is_main: true, display_order: 1 },
          { image_id: 'img-ss-wb-2', color_id: 'superstar-white-black', image_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=600&auto=format&fit=crop', is_main: false, display_order: 2 },
          { image_id: 'img-ss-wb-3', color_id: 'superstar-white-black', image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop', is_main: false, display_order: 3 },
          { image_id: 'img-ss-wb-4', color_id: 'superstar-white-black', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', is_main: false, display_order: 4 }
        ],
        skus: [
          { sku_id: 'sku-ss-wb-38', sku_code: 'ADISUPER-WHITE-BLACK-38', color_id: 'superstar-white-black', size: '38', stock_quantity: 5, sold_quantity: 42, status: 'active' },
          { sku_id: 'sku-ss-wb-39', sku_code: 'ADISUPER-WHITE-BLACK-39', color_id: 'superstar-white-black', size: '39', stock_quantity: 8, sold_quantity: 50, status: 'active' },
          { sku_id: 'sku-ss-wb-40', sku_code: 'ADISUPER-WHITE-BLACK-40', color_id: 'superstar-white-black', size: '40', stock_quantity: 0, sold_quantity: 36, status: 'out_of_stock' },
          { sku_id: 'sku-ss-wb-41', sku_code: 'ADISUPER-WHITE-BLACK-41', color_id: 'superstar-white-black', size: '41', stock_quantity: 12, sold_quantity: 28, status: 'active' },
          { sku_id: 'sku-ss-wb-42', sku_code: 'ADISUPER-WHITE-BLACK-42', color_id: 'superstar-white-black', size: '42', stock_quantity: 6, sold_quantity: 15, status: 'active' },
          { sku_id: 'sku-ss-wb-43', sku_code: 'ADISUPER-WHITE-BLACK-43', color_id: 'superstar-white-black', size: '43', stock_quantity: 4, sold_quantity: 8, status: 'active' }
        ]
      },
      {
        color_id: 'superstar-full-white',
        product_id: 'adidas-superstar',
        color_code: 'FULL-WHITE',
        color_name: 'Full Trắng',
        hex_code: '#F8FAF5',
        price: 2300000,
        discount_type: 'none',
        discount_value: 0,
        is_default: false,
        status: 'active',
        images: [
          { image_id: 'img-ss-fw-1', color_id: 'superstar-full-white', image_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=600&auto=format&fit=crop', is_main: true, display_order: 1 }
        ],
        skus: [
          { sku_id: 'sku-ss-fw-39', sku_code: 'ADISUPER-FULL-WHITE-39', color_id: 'superstar-full-white', size: '39', stock_quantity: 10, sold_quantity: 14, status: 'active' },
          { sku_id: 'sku-ss-fw-40', sku_code: 'ADISUPER-FULL-WHITE-40', color_id: 'superstar-full-white', size: '40', stock_quantity: 5, sold_quantity: 20, status: 'active' },
          { sku_id: 'sku-ss-fw-41', sku_code: 'ADISUPER-FULL-WHITE-41', color_id: 'superstar-full-white', size: '41', stock_quantity: 0, sold_quantity: 18, status: 'out_of_stock' },
          { sku_id: 'sku-ss-fw-42', sku_code: 'ADISUPER-FULL-WHITE-42', color_id: 'superstar-full-white', size: '42', stock_quantity: 8, sold_quantity: 10, status: 'active' }
        ]
      }
    ]
  },
  {
    product_id: 'nike-air-force-1',
    product_code: 'NIKEAF1',
    product_name: 'Giày Nike Air Force 1 \'07 All White',
    brand_name: 'Nike',
    category_name: 'Giày Cổ Điển',
    description: 'Vẻ rạng ngời vẫn tiếp tục sống trong Nike Air Force 1 \'07, mẫu giày bóng rổ nguyên bản mang nét đột phá mới cho những gì bạn biết rõ nhất: các lớp phủ được khâu bền bỉ, bề mặt hoàn thiện sạch sẽ và lượng chi tiết hoàn hảo để bạn tỏa sáng.',
    gender_target: 'unisex',
    status: 'active',
    rating: 4.9,
    reviewsCount: 320,
    isHot: true,
    isNew: true,
    colors: [
      {
        color_id: 'af1-full-white',
        product_id: 'nike-air-force-1',
        color_code: 'FULL-WHITE',
        color_name: 'Full Trắng',
        hex_code: '#FFFFFF',
        price: 2900000,
        discount_type: 'fixed',
        discount_value: 250000, // Price after discount = 2650000
        is_default: true,
        status: 'active',
        images: [
          { image_id: 'img-af1-fw-1', color_id: 'af1-full-white', image_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=600&auto=format&fit=crop', is_main: true, display_order: 1 },
          { image_id: 'img-af1-fw-2', color_id: 'af1-full-white', image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop', is_main: false, display_order: 2 }
        ],
        skus: [
          { sku_id: 'sku-af1-fw-39', sku_code: 'NIKEAF1-FULL-WHITE-39', color_id: 'af1-full-white', size: '39', stock_quantity: 15, sold_quantity: 110, status: 'active' },
          { sku_id: 'sku-af1-fw-40', sku_code: 'NIKEAF1-FULL-WHITE-40', color_id: 'af1-full-white', size: '40', stock_quantity: 20, sold_quantity: 95, status: 'active' },
          { sku_id: 'sku-af1-fw-41', sku_code: 'NIKEAF1-FULL-WHITE-41', color_id: 'af1-full-white', size: '41', stock_quantity: 18, sold_quantity: 80, status: 'active' },
          { sku_id: 'sku-af1-fw-42', sku_code: 'NIKEAF1-FULL-WHITE-42', color_id: 'af1-full-white', size: '42', stock_quantity: 3, sold_quantity: 50, status: 'active' },
          { sku_id: 'sku-af1-fw-43', sku_code: 'NIKEAF1-FULL-WHITE-43', color_id: 'af1-full-white', size: '43', stock_quantity: 0, sold_quantity: 35, status: 'out_of_stock' }
        ]
      },
      {
        color_id: 'af1-white-gum',
        product_id: 'nike-air-force-1',
        color_code: 'WHITE-GUM',
        color_name: 'Trắng Đế Gum',
        hex_code: '#E5D3B3',
        price: 3100000,
        discount_type: 'none',
        discount_value: 0,
        is_default: false,
        status: 'active',
        images: [
          { image_id: 'img-af1-wg-1', color_id: 'af1-white-gum', image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop', is_main: true, display_order: 1 }
        ],
        skus: [
          { sku_id: 'sku-af1-wg-40', sku_code: 'NIKEAF1-WHITE-GUM-40', color_id: 'af1-white-gum', size: '40', stock_quantity: 10, sold_quantity: 12, status: 'active' },
          { sku_id: 'sku-af1-wg-41', sku_code: 'NIKEAF1-WHITE-GUM-41', color_id: 'af1-white-gum', size: '41', stock_quantity: 14, sold_quantity: 10, status: 'active' },
          { sku_id: 'sku-af1-wg-42', sku_code: 'NIKEAF1-WHITE-GUM-42', color_id: 'af1-white-gum', size: '42', stock_quantity: 6, sold_quantity: 5, status: 'active' }
        ]
      }
    ]
  },
  {
    product_id: 'jordan-1-low',
    product_code: 'JD1LOW',
    product_name: 'Giày Air Jordan 1 Low \'Chicago Split\'',
    brand_name: 'Jordan',
    category_name: 'Giày Bóng Rổ',
    description: 'Lấy cảm hứng từ mẫu giày Jordan cổ điển năm 1985, Air Jordan 1 Low mang đến vẻ ngoài sạch sẽ, gọn gàng nhưng không kém phần nổi bật với phối màu Chicago huyền thoại kết hợp các chi tiết được tách rời độc đáo.',
    gender_target: 'men',
    status: 'active',
    rating: 4.9,
    reviewsCount: 98,
    isHot: true,
    isNew: true,
    colors: [
      {
        color_id: 'jordan-chicago',
        product_id: 'jordan-1-low',
        color_code: 'CHICAGO',
        color_name: 'Đỏ Đen Trắng',
        hex_code: '#B31B1B',
        price: 4200000,
        discount_type: 'percent',
        discount_value: 8.33, // Price after discount ~ 3850000
        is_default: true,
        status: 'active',
        images: [
          { image_id: 'img-jd-chi-1', color_id: 'jordan-chicago', image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop', is_main: true, display_order: 1 },
          { image_id: 'img-jd-chi-2', color_id: 'jordan-chicago', image_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=600&auto=format&fit=crop', is_main: false, display_order: 2 }
        ],
        skus: [
          { sku_id: 'sku-jd-chi-40', sku_code: 'JD1LOW-CHICAGO-40', color_id: 'jordan-chicago', size: '40', stock_quantity: 4, sold_quantity: 24, status: 'active' },
          { sku_id: 'sku-jd-chi-41', sku_code: 'JD1LOW-CHICAGO-41', color_id: 'jordan-chicago', size: '41', stock_quantity: 6, sold_quantity: 32, status: 'active' },
          { sku_id: 'sku-jd-chi-42', sku_code: 'JD1LOW-CHICAGO-42', color_id: 'jordan-chicago', size: '42', stock_quantity: 2, sold_quantity: 40, status: 'active' },
          { sku_id: 'sku-jd-chi-43', sku_code: 'JD1LOW-CHICAGO-43', color_id: 'jordan-chicago', size: '43', stock_quantity: 8, sold_quantity: 15, status: 'active' },
          { sku_id: 'sku-jd-chi-44', sku_code: 'JD1LOW-CHICAGO-44', color_id: 'jordan-chicago', size: '44', stock_quantity: 0, sold_quantity: 8, status: 'out_of_stock' }
        ]
      }
    ]
  },
  {
    product_id: 'puma-smash-v2',
    product_code: 'PUMASMASH',
    product_name: 'Giày Thể Thao Puma Smash v2 L Black',
    brand_name: 'Puma',
    category_name: 'Giày Thể Thao',
    description: 'Puma Smash v2 L là phiên bản nâng cấp của mẫu giày tennis huyền thoại. Chất liệu da mềm mại được trang bị thêm lớp lót giày SoftFoam mang đến sự êm ái tối đa cho bàn chân trong mỗi bước đi.',
    gender_target: 'unisex',
    status: 'active',
    rating: 4.5,
    reviewsCount: 88,
    isHot: false,
    isNew: false,
    colors: [
      {
        color_id: 'smash-black-white',
        product_id: 'puma-smash-v2',
        color_code: 'BLACK-WHITE',
        color_name: 'Đen Trắng',
        hex_code: '#1A1A1A',
        price: 1800000,
        discount_type: 'percent',
        discount_value: 25, // Price after discount = 1350000
        is_default: true,
        status: 'active',
        images: [
          { image_id: 'img-ps-bw-1', color_id: 'smash-black-white', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', is_main: true, display_order: 1 }
        ],
        skus: [
          { sku_id: 'sku-ps-bw-39', sku_code: 'PUMASMASH-BLACK-WHITE-39', color_id: 'smash-black-white', size: '39', stock_quantity: 12, sold_quantity: 34, status: 'active' },
          { sku_id: 'sku-ps-bw-40', sku_code: 'PUMASMASH-BLACK-WHITE-40', color_id: 'smash-black-white', size: '40', stock_quantity: 18, sold_quantity: 45, status: 'active' },
          { sku_id: 'sku-ps-bw-41', sku_code: 'PUMASMASH-BLACK-WHITE-41', color_id: 'smash-black-white', size: '41', stock_quantity: 22, sold_quantity: 50, status: 'active' },
          { sku_id: 'sku-ps-bw-42', sku_code: 'PUMASMASH-BLACK-WHITE-42', color_id: 'smash-black-white', size: '42', stock_quantity: 0, sold_quantity: 28, status: 'out_of_stock' },
          { sku_id: 'sku-ps-bw-43', sku_code: 'PUMASMASH-BLACK-WHITE-43', color_id: 'smash-black-white', size: '43', stock_quantity: 5, sold_quantity: 15, status: 'active' }
        ]
      }
    ]
  }
];

export const mockVouchers: Voucher[] = [
  {
    voucher_id: 'v-sale10',
    code: 'SALE10',
    voucher_type: 'percent',
    discount_value: 10,
    max_discount_amount: 200000,
    min_order_amount: 500000,
    usage_limit: 100,
    used_count: 23,
    max_usage_per_customer: 1,
    start_date: '2026-06-01T00:00:00Z',
    end_date: '2026-07-31T23:59:59Z',
    status: 'active'
  },
  {
    voucher_id: 'v-sale50k',
    code: 'SHOES50K',
    voucher_type: 'fixed',
    discount_value: 50000,
    min_order_amount: 300000,
    usage_limit: 200,
    used_count: 55,
    max_usage_per_customer: 2,
    start_date: '2026-06-01T00:00:00Z',
    end_date: '2026-07-31T23:59:59Z',
    status: 'active'
  },
  {
    voucher_id: 'v-freeship',
    code: 'FREESHIP',
    voucher_type: 'free_shipping',
    discount_value: 30000, // standard shipping fee is 30000
    min_order_amount: 1000000,
    usage_limit: 500,
    used_count: 142,
    max_usage_per_customer: 5,
    start_date: '2026-06-01T00:00:00Z',
    end_date: '2026-07-31T23:59:59Z',
    status: 'active'
  }
];
