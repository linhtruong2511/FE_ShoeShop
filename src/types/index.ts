export interface ProductImage {
  image_id: number | string;
  color_id: number | string;
  image_url: string;
  is_main: boolean;
  display_order: number;
}

export interface ProductSku {
  sku_id: number | string;
  sku_code: string;
  color_id: number | string;
  size: string;
  stock_quantity: number;
  sold_quantity: number;
  status: 'active' | 'out_of_stock' | 'discontinued';
}

export interface ProductColor {
  color_id: number | string;
  product_id: number | string;
  color_code: string;
  color_name: string;
  hex_code?: string;
  price: number;
  discount_type: 'none' | 'percent' | 'fixed';
  discount_value: number;
  discounted_price?: number;
  is_default: boolean;
  status: 'active' | 'hidden' | 'discontinued';
  images: ProductImage[];
  skus: ProductSku[];
}

export interface Product {
  product_id: number | string;
  product_code: string;
  product_name: string;
  brand_name: string;
  brand?: { brand_id: number | string; brand_name: string };
  category_name: string;
  category?: { category_id: number | string; category_name: string };
  description: string;
  gender_target: 'men' | 'women' | 'unisex' | 'kids';
  status: 'active' | 'hidden' | 'discontinued';
  colors: ProductColor[];
  rating?: number;
  reviewsCount?: number;
  isHot?: boolean;
  isNew?: boolean;
}

export interface ProductListDefaultColor {
  color_id: number | string;
  color_name: string;
  price: number;
  discount_type: 'none' | 'percent' | 'fixed';
  discount_value: number;
  main_image_url?: string;
  discounted_price: number;
}

export interface ProductListItem {
  product_id: number | string;
  product_name: string;
  brand_name?: string;
  category_name?: string;
  gender_target?: string;
  default_color?: ProductListDefaultColor;
  has_stock: boolean;
  isHot?: boolean;
  isNew?: boolean;
  rating?: number;
  reviewsCount?: number;
}

export interface CartItem {
  id: number | string;
  product: Product | ProductListItem;
  selectedColor: ProductColor | ProductListDefaultColor;
  selectedSku: ProductSku;
  quantity: number;
}

export interface Voucher {
  voucher_id: number | string;
  code: string;
  voucher_type: 'percent' | 'fixed' | 'free_shipping';
  discount_value: number;
  max_discount_amount?: number;
  min_order_amount: number;
  usage_limit?: number;
  used_count: number;
  max_usage_per_customer: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'paused' | 'expired';
}

export interface OrderDetail {
  order_detail_id: number | string;
  order_id: number | string;
  sku_id: number | string;
  sku_code_snapshot: string;
  product_name_snapshot: string;
  color_name_snapshot: string;
  size_snapshot: string;
  image_url_snapshot?: string;
  quantity: number;
  unit_price: number;
  discount_type_snapshot: 'none' | 'percent' | 'fixed';
  discount_value_snapshot: number;
  discounted_price: number;
  line_total: number;
}

export interface OrderStatusLog {
  status_log_id: number | string;
  order_id: number | string;
  old_status?: string;
  new_status: string;
  note?: string;
  changed_at: string;
}

export interface Order {
  order_id: number | string;
  order_code: string;
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  note?: string;
  payment_method: 'cod' | 'bank_transfer';
  payment_status: 'pending' | 'paid' | 'refunded';
  voucher_id?: number | string;
  voucher_code_snapshot?: string;
  subtotal_amount: number;
  voucher_discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  order_status: 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'completed' | 'cancelled';
  cancelled_reason?: string;
  cancelled_at?: string;
  completed_at?: string;
  created_at: string;
  details: OrderDetail[];
  status_history: OrderStatusLog[];
}

export interface ReturnItem {
  return_item_id: number | string;
  return_id: number | string;
  original_sku_id: number | string;
  exchange_sku_id?: number | string;
  quantity: number;
  product_name: string;
  color_name: string;
  size: string;
}

export interface ReturnRequest {
  return_id: number | string;
  order_id: number | string;
  order_code: string;
  request_type: 'exchange' | 'refund';
  reason: 'wrong_size' | 'wrong_color' | 'defective' | 'wrong_item' | 'other';
  reason_note?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  items: ReturnItem[];
  created_at: string;
  reviewed_at?: string;
  note?: string;
}

export interface StockLog {
  log_id: number | string;
  sku_id: number | string;
  sku_code: string;
  product_name: string;
  color_name: string;
  size: string;
  change_quantity: number;
  stock_before: number;
  stock_after: number;
  reason: 'import' | 'order_export' | 'cancel_return' | 'adjustment' | 'exchange';
  reason_note?: string;
  created_at: string;
}

