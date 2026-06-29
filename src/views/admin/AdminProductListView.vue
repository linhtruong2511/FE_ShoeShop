<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { mockProducts } from '../../mocks/products';
import { getDiscountedPrice } from '../../stores/cart';
import type { Product, ProductColor, ProductSku, StockLog } from '../../types';

const products = ref<Product[]>([]);
const selectedProduct = ref<Product | null>(null);
const selectedColor = ref<ProductColor | null>(null);

// Forms toggles & inputs
const showAddProductModal = ref(false);
const newProductName = ref('');
const newProductBrand = ref<'Adidas' | 'Nike' | 'Puma' | 'Jordan'>('Nike');
const newProductCode = ref('');
const newProductDesc = ref('');
const newProductGender = ref<'men' | 'women' | 'unisex' | 'kids'>('unisex');

const showAddColorModal = ref(false);
const newColorName = ref('');
const newColorCode = ref('');
const newColorPrice = ref(2000000);
const newColorDiscountType = ref<'none' | 'percent' | 'fixed'>('none');
const newColorDiscountValue = ref(0);
const newColorHex = ref('#FFFFFF');
const newColorImageUrl = ref('');

const showAddSkuModal = ref(false);
const newSkuSize = ref('');
const newSkuStock = ref(10);

const showStockLogModal = ref(false);
const activeSkuForLog = ref<ProductSku | null>(null);
const activeSkuLogs = ref<StockLog[]>([]);

// Adjust stock state
const showAdjustStockModal = ref(false);
const activeSkuForAdjust = ref<ProductSku | null>(null);
const adjustQuantity = ref(5);
const adjustReason = ref<'import' | 'adjustment'>('import');
const adjustNote = ref('');

onMounted(() => {
  loadProducts();
});

const loadProducts = () => {
  const saved = localStorage.getItem('myshoes_products_data');
  if (saved) {
    try {
      products.value = JSON.parse(saved);
    } catch (e) {
      products.value = mockProducts;
    }
  } else {
    products.value = mockProducts;
    saveToStorage();
  }
};

const saveToStorage = () => {
  localStorage.setItem('myshoes_products_data', JSON.stringify(products.value));
};

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Add product
const handleAddProduct = () => {
  if (!newProductName.value || !newProductCode.value) {
    alert('Vui lòng điền mã và tên sản phẩm gốc!');
    return;
  }
  if (products.value.some(p => p.product_code === newProductCode.value)) {
    alert('Mã sản phẩm đã tồn tại trong hệ thống!');
    return;
  }

  const p: Product = {
    product_id: 'p-' + Date.now(),
    product_code: newProductCode.value.toUpperCase().trim(),
    product_name: newProductName.value.trim(),
    brand_name: newProductBrand.value,
    category_name: 'Giày Thể Thao',
    description: newProductDesc.value.trim(),
    gender_target: newProductGender.value,
    status: 'active',
    rating: 5.0,
    reviewsCount: 0,
    colors: []
  };

  products.value.push(p);
  saveToStorage();
  
  // reset
  newProductName.value = '';
  newProductCode.value = '';
  newProductDesc.value = '';
  showAddProductModal.value = false;
  alert('Đã tạo sản phẩm gốc thành công.');
};

// Add color to product
const handleAddColor = () => {
  if (!selectedProduct.value) return;
  if (!newColorName.value || !newColorCode.value) {
    alert('Vui lòng điền tên và mã màu!');
    return;
  }
  
  // check duplicate color code
  if (selectedProduct.value.colors.some(c => c.color_code === newColorCode.value)) {
    alert('Mã màu này đã tồn tại trong sản phẩm!');
    return;
  }

  const c: ProductColor = {
    color_id: 'c-' + Date.now(),
    product_id: selectedProduct.value.product_id,
    color_code: newColorCode.value.toUpperCase().trim(),
    color_name: newColorName.value.trim(),
    hex_code: newColorHex.value,
    price: newColorPrice.value,
    discount_type: newColorDiscountType.value,
    discount_value: newColorDiscountValue.value,
    is_default: selectedProduct.value.colors.length === 0,
    status: 'active',
    images: [
      {
        image_id: 'img-' + Date.now(),
        color_id: 'c-' + Date.now(),
        image_url: newColorImageUrl.value || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
        is_main: true,
        display_order: 1
      }
    ],
    skus: []
  };

  selectedProduct.value.colors.push(c);
  saveToStorage();
  
  // reset
  newColorName.value = '';
  newColorCode.value = '';
  newColorImageUrl.value = '';
  showAddColorModal.value = false;
  alert('Đã thêm màu biến thể thành công.');
};

// Add SKU
const handleAddSku = () => {
  if (!selectedProduct.value || !selectedColor.value) return;
  if (!newSkuSize.value) {
    alert('Vui lòng điền size giày!');
    return;
  }

  if (selectedColor.value.skus.some(s => s.size === newSkuSize.value)) {
    alert('Kích cỡ này đã tồn tại trong màu biến thể!');
    return;
  }

  const s: ProductSku = {
    sku_id: 'sku-' + Date.now(),
    sku_code: `${selectedProduct.value.product_code}-${selectedColor.value.color_code}-${newSkuSize.value}`,
    color_id: selectedColor.value.color_id,
    size: newSkuSize.value,
    stock_quantity: newSkuStock.value,
    sold_quantity: 0,
    status: newSkuStock.value > 0 ? 'active' : 'out_of_stock'
  };

  selectedColor.value.skus.push(s);
  saveToStorage();

  // Log stock import
  if (newSkuStock.value > 0) {
    writeStockLog(s, newSkuStock.value, 0, newSkuStock.value, 'import', 'Khởi tạo tồn kho ban đầu');
  }

  newSkuSize.value = '';
  newSkuStock.value = 10;
  showAddSkuModal.value = false;
  alert('Đã sinh SKU size mới thành công.');
};

// Adjust stock quantity
const handleAdjustStock = () => {
  if (!activeSkuForAdjust.value) return;
  
  const originalStock = activeSkuForAdjust.value.stock_quantity;
  const quantityChange = adjustQuantity.value;
  const isImport = adjustReason.value === 'import';
  const finalQuantity = isImport ? originalStock + quantityChange : originalStock - quantityChange;
  
  if (finalQuantity < 0) {
    alert('Lỗi: Điều chỉnh tồn kho sau kiểm kho không thể âm!');
    return;
  }

  activeSkuForAdjust.value.stock_quantity = finalQuantity;
  activeSkuForAdjust.value.status = finalQuantity > 0 ? 'active' : 'out_of_stock';
  saveToStorage();

  writeStockLog(
    activeSkuForAdjust.value, 
    isImport ? quantityChange : -quantityChange,
    originalStock,
    finalQuantity,
    adjustReason.value,
    adjustNote.value || (isImport ? 'Nhập hàng thêm thủ công' : 'Điều chỉnh sau kiểm kho')
  );

  showAdjustStockModal.value = false;
  adjustNote.value = '';
  alert('Cập nhật tồn kho và ghi log thành công.');
};

const writeStockLog = (
  sku: ProductSku, 
  change: number, 
  before: number, 
  after: number, 
  reason: StockLog['reason'], 
  noteStr: string
) => {
  const newLog: StockLog = {
    log_id: 'sl-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    sku_id: sku.sku_id,
    sku_code: sku.sku_code,
    product_name: selectedProduct.value?.product_name || 'Giày thể thao',
    color_name: selectedColor.value?.color_name || 'Biến thể',
    size: sku.size,
    change_quantity: change,
    stock_before: before,
    stock_after: after,
    reason: reason,
    reason_note: noteStr,
    created_at: new Date().toISOString()
  };

  const logsStr = localStorage.getItem('myshoes_stock_logs');
  const logsList: StockLog[] = logsStr ? JSON.parse(logsStr) : [];
  logsList.unshift(newLog);
  localStorage.setItem('myshoes_stock_logs', JSON.stringify(logsList));
};

const openLogsModal = (sku: ProductSku) => {
  activeSkuForLog.value = sku;
  const logsStr = localStorage.getItem('myshoes_stock_logs');
  const logsList: StockLog[] = logsStr ? JSON.parse(logsStr) : [];
  activeSkuLogs.value = logsList.filter(l => l.sku_id === sku.sku_id);
  showStockLogModal.value = true;
};

const openAdjustModal = (sku: ProductSku) => {
  activeSkuForAdjust.value = sku;
  showAdjustStockModal.value = true;
};
</script>

<template>
  <div class="space-y-8 text-left">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-sans uppercase">Quản lý Sản phẩm</h1>
        <p class="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">Quản lý mô hình sản phẩm 3 cấp, biến thể màu, SKU và tồn kho</p>
      </div>
      <button 
        @click="showAddProductModal = true"
        class="bg-slate-950 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all"
      >
        TẠO SẢN PHẨM MỚI
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- 1. Products Grid List (4 columns) -->
      <div class="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-premium space-y-4">
        <h2 class="text-sm font-bold text-slate-900 uppercase border-b pb-2.5">Sản phẩm gốc (Cấp 1)</h2>
        <div class="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          <div 
            v-for="p in products" 
            :key="p.product_id"
            @click="selectedProduct = p; selectedColor = null"
            class="p-4 rounded-2xl border cursor-pointer transition-all text-xs"
            :class="selectedProduct?.product_id === p.product_id ? 'border-brand-blue bg-blue-50/20 shadow-sm' : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'"
          >
            <p class="font-bold text-slate-800">{{ p.product_name }}</p>
            <div class="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-semibold">
              <span>Code: {{ p.product_code }}</span>
              <span class="text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">{{ p.brand_name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Colors List (4 columns) -->
      <div class="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-premium space-y-4">
        <h2 class="text-sm font-bold text-slate-900 uppercase border-b pb-2.5 flex items-center justify-between">
          <span>Màu biến thể (Cấp 2)</span>
          <button 
            v-if="selectedProduct" 
            @click="showAddColorModal = true" 
            class="text-[10px] font-extrabold text-brand-blue hover:text-brand-accent uppercase"
          >
            + THÊM MÀU
          </button>
        </h2>

        <div v-if="!selectedProduct" class="py-12 text-center text-xs text-slate-400">
          Vui lòng chọn sản phẩm gốc bên trái để xem biến thể màu.
        </div>
        <div v-else-if="selectedProduct.colors.length === 0" class="py-12 text-center text-xs text-slate-400">
          Chưa có màu sắc biến thể nào. Ấn nút thêm màu để bắt đầu.
        </div>
        <div v-else class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          <div 
            v-for="color in selectedProduct.colors" 
            :key="color.color_id"
            @click="selectedColor = color"
            class="p-4 rounded-2xl border cursor-pointer transition-all text-xs"
            :class="selectedColor?.color_id === color.color_id ? 'border-brand-blue bg-blue-50/20 shadow-sm' : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'"
          >
            <div class="flex items-center space-x-2">
              <span class="h-3.5 w-3.5 rounded-full border shadow-sm" :style="{ backgroundColor: color.hex_code }"></span>
              <p class="font-bold text-slate-800">{{ color.color_name }}</p>
            </div>
            
            <div class="flex items-center justify-between mt-2 pt-2 border-t text-[10px] text-slate-400 font-semibold">
              <div>
                <span>Giá: <strong class="text-slate-800">{{ formatPrice(getDiscountedPrice(color)) }}</strong></span>
                <span v-if="color.discount_type !== 'none'" class="text-rose-600 ml-1.5 font-extrabold">SALE</span>
              </div>
              <span class="text-slate-400">Code: {{ color.color_code }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Sizes/SKUs List (4 columns) -->
      <div class="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-premium space-y-4">
        <h2 class="text-sm font-bold text-slate-900 uppercase border-b pb-2.5 flex items-center justify-between">
          <span>Kích thước & Kho (Cấp 3)</span>
          <button 
            v-if="selectedColor" 
            @click="showAddSkuModal = true" 
            class="text-[10px] font-extrabold text-brand-blue hover:text-brand-accent uppercase"
          >
            + THÊM SIZE
          </button>
        </h2>

        <div v-if="!selectedColor" class="py-12 text-center text-xs text-slate-400">
          Vui lòng chọn màu biến thể để quản lý kích cỡ (size) & tồn kho.
        </div>
        <div v-else-if="selectedColor.skus.length === 0" class="py-12 text-center text-xs text-slate-400">
          Chưa có size giày nào được tạo cho màu này.
        </div>
        <div v-else class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          <div 
            v-for="sku in selectedColor.skus" 
            :key="sku.sku_id"
            class="p-4 rounded-2xl border bg-slate-50/50 border-slate-100 text-xs text-left space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-slate-900 text-sm">Size: {{ sku.size }}</span>
              <span 
                class="px-2 py-0.5 rounded text-[10px] font-bold"
                :class="sku.stock_quantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
              >
                {{ sku.stock_quantity > 0 ? `Còn ${sku.stock_quantity} đôi` : 'Hết hàng' }}
              </span>
            </div>
            <code class="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono block">Code: {{ sku.sku_code }}</code>
            
            <div class="flex justify-between border-t pt-2 text-[10px] font-bold">
              <span>Đã bán: {{ sku.sold_quantity }} đôi</span>
              <div class="flex space-x-2">
                <button @click="openLogsModal(sku)" class="text-slate-500 hover:text-slate-800">Xem log</button>
                <span class="text-slate-200">|</span>
                <button @click="openAdjustModal(sku)" class="text-brand-blue hover:text-brand-accent">Nhập/Sửa kho</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- 1. Add Product -->
    <div v-if="showAddProductModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm" @click="showAddProductModal = false"></div>
      <div class="bg-white rounded-3xl max-w-md w-full p-6 z-10 shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-950 font-sans uppercase">Thêm sản phẩm gốc mới</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mã sản phẩm *</label>
            <input type="text" v-model="newProductCode" placeholder="Ví dụ: SUPERSTAR" class="w-full border rounded-xl px-3 py-2 text-xs uppercase" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tên sản phẩm *</label>
            <input type="text" v-model="newProductName" placeholder="Ví dụ: Giày Adidas Superstar Classic" class="w-full border rounded-xl px-3 py-2 text-xs" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thương hiệu</label>
              <select v-model="newProductBrand" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
                <option value="Nike">Nike</option>
                <option value="Adidas">Adidas</option>
                <option value="Puma">Puma</option>
                <option value="Jordan">Jordan</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Đối tượng</label>
              <select v-model="newProductGender" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
                <option value="unisex">Unisex (Cả nam/nữ)</option>
                <option value="men">Men (Nam)</option>
                <option value="women">Women (Nữ)</option>
                <option value="kids">Kids (Trẻ em)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mô tả sản phẩm</label>
            <textarea v-model="newProductDesc" rows="2" class="w-full border rounded-xl px-3 py-2 text-xs resize-none"></textarea>
          </div>
        </div>
        <div class="flex space-x-3.5 pt-2">
          <button @click="showAddProductModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="handleAddProduct" class="flex-1 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl">Thêm sản phẩm</button>
        </div>
      </div>
    </div>

    <!-- 2. Add Color -->
    <div v-if="showAddColorModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm" @click="showAddColorModal = false"></div>
      <div class="bg-white rounded-3xl max-w-md w-full p-6 z-10 shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-950 font-sans uppercase">Thêm màu biến thể</h3>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mã màu *</label>
              <input type="text" v-model="newColorCode" placeholder="Ví dụ: WHITE-BLACK" class="w-full border rounded-xl px-3 py-2 text-xs uppercase" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tên màu *</label>
              <input type="text" v-model="newColorName" placeholder="Ví dụ: Trắng Đen" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giá bán gốc (VNĐ) *</label>
              <input type="number" v-model="newColorPrice" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mã màu Hex</label>
              <input type="color" v-model="newColorHex" class="w-full h-8 border rounded-xl px-1 py-1" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Loại giảm giá</label>
              <select v-model="newColorDiscountType" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
                <option value="none">Không giảm giá</option>
                <option value="percent">Giảm theo %</option>
                <option value="fixed">Giảm số tiền cố định</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giá trị giảm</label>
              <input type="number" v-model="newColorDiscountValue" class="w-full border rounded-xl px-3 py-2 text-xs" :disabled="newColorDiscountType === 'none'" />
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">URL Ảnh chính của màu</label>
            <input type="text" v-model="newColorImageUrl" placeholder="Nhập liên kết ảnh sản phẩm..." class="w-full border rounded-xl px-3 py-2 text-xs" />
          </div>
        </div>
        <div class="flex space-x-3.5 pt-2">
          <button @click="showAddColorModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="handleAddColor" class="flex-1 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl">Thêm biến thể</button>
        </div>
      </div>
    </div>

    <!-- 3. Add Size/SKU -->
    <div v-if="showAddSkuModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm" @click="showAddSkuModal = false"></div>
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 z-10 shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-950 font-sans uppercase">Thêm size giày mới</h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kích cỡ (Size) *</label>
            <input type="text" v-model="newSkuSize" placeholder="Ví dụ: 39" class="w-full border rounded-xl px-3 py-2 text-xs" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tồn kho ban đầu</label>
            <input type="number" v-model="newSkuStock" class="w-full border rounded-xl px-3 py-2 text-xs" />
          </div>
        </div>
        <div class="flex space-x-3.5 pt-2">
          <button @click="showAddSkuModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="handleAddSku" class="flex-1 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl">Tạo size</button>
        </div>
      </div>
    </div>

    <!-- 4. Adjust Stock Modal -->
    <div v-if="showAdjustStockModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm" @click="showAdjustStockModal = false"></div>
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 z-10 shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-950 font-sans uppercase">Điều chỉnh tồn kho</h3>
        <p class="text-[10px] text-slate-400 uppercase font-bold" v-if="activeSkuForAdjust">
          SKU: {{ activeSkuForAdjust.sku_code }} (Hiện tại: {{ activeSkuForAdjust.stock_quantity }} đôi)
        </p>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hành động</label>
              <select v-model="adjustReason" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
                <option value="import">Nhập thêm hàng (+)</option>
                <option value="adjustment">Điều chỉnh kho / Xuất (-)</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Số lượng thay đổi *</label>
              <input type="number" v-model="adjustQuantity" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ghi chú điều chỉnh</label>
            <input type="text" v-model="adjustNote" placeholder="Ví dụ: Nhập hàng container tháng 6, kiểm kho thừa..." class="w-full border rounded-xl px-3 py-2 text-xs" />
          </div>
        </div>
        <div class="flex space-x-3.5 pt-2">
          <button @click="showAdjustStockModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="handleAdjustStock" class="flex-1 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl">Cập nhật kho</button>
        </div>
      </div>
    </div>

    <!-- 5. View Stock Logs Modal -->
    <div v-if="showStockLogModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm" @click="showStockLogModal = false"></div>
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 z-10 shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-950 font-sans uppercase">Lịch sử tồn kho SKU</h3>
        <p class="text-[10px] text-slate-400 uppercase font-bold" v-if="activeSkuForLog">
          SKU: {{ activeSkuForLog.sku_code }}
        </p>
        
        <div class="max-h-[300px] overflow-y-auto space-y-3 pr-2">
          <div v-if="activeSkuLogs.length === 0" class="text-center py-8 text-xs text-slate-400">
            Chưa có ghi chép nhật ký tồn kho nào phát sinh cho SKU này.
          </div>
          <div 
            v-else 
            v-for="log in activeSkuLogs" 
            :key="log.log_id"
            class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-left text-[11px] space-y-1"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800">
                Lý do: 
                <span class="text-brand-blue uppercase">
                  {{ log.reason === 'import' ? 'Nhập hàng' : log.reason === 'order_export' ? 'Xuất theo đơn' : log.reason === 'cancel_return' ? 'Hoàn trả do hủy' : 'Khác' }}
                </span>
              </span>
              <span class="text-slate-400 font-mono text-[9px]">{{ new Date(log.created_at).toLocaleString('vi-VN') }}</span>
            </div>
            <p class="text-slate-600" v-if="log.reason_note">Ghi chú: "{{ log.reason_note }}"</p>
            <div class="flex space-x-4 font-mono text-slate-500 text-[10px]">
              <span>Thay đổi: <strong :class="log.change_quantity > 0 ? 'text-emerald-600' : 'text-rose-600'">{{ log.change_quantity > 0 ? '+' : '' }}{{ log.change_quantity }}</strong></span>
              <span>Trước: {{ log.stock_before }}</span>
              <span>Sau: {{ log.stock_after }}</span>
            </div>
          </div>
        </div>
        
        <div class="pt-2 text-right">
          <button @click="showStockLogModal = false" class="bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>
