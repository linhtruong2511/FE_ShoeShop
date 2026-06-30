<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminProductService } from '../../services/admin/product.service';
import { brandService } from '../../services/brand.service';
import { categoryService } from '../../services/category.service';
import type { Product, ProductColor, ProductSku, StockLog } from '../../types';
import Pagination from '@/components/common/Pagination.vue';
import BaseModal from '@/components/common/BaseModal.vue';

const products = ref<Product[]>([]);
const selectedProduct = ref<Product | null>(null);
const selectedColor = ref<ProductColor | null>(null);

const productPage = ref(1);
const productTotalPages = ref(1);
const productSearch = ref('');
const productFilter = ref('all');

// Advanced Search Filters
const filterBrandId = ref<number | string>('');
const filterCategoryId = ref<number | string>('');
const filterGender = ref<string>('');

const brands = ref<Array<{ brand_id: number; brand_name: string }>>([]);
const categories = ref<Array<{ category_id: number; category_name: string }>>([]);

// Drawer & Modal State
const isDrawerOpen = ref(false);
const showImageManagerModal = ref(false);

const openProductDrawer = (p: Product) => {
  selectedProduct.value = p;
  selectedColor.value = p.colors?.[0] || null;
  isDrawerOpen.value = true;
};

const closeDrawer = () => {
  isDrawerOpen.value = false;
};

const showAddProductModal = ref(false);
const newProductName = ref('');
const newProductBrandId = ref<number>(1);
const newProductCategoryId = ref<number>(1);
const newProductCode = ref('');
const newProductDesc = ref('');
const newProductGender = ref<'men' | 'women' | 'unisex' | 'kids'>('unisex');

const showEditProductModal = ref(false);
const editProductForm = ref({
  product_name: '',
  brand_id: 1,
  category_id: 1,
  description: '',
  gender_target: 'unisex'
});

const showEditColorModal = ref(false);
const editColorForm = ref({
  color_name: '',
  color_code: '', // Note: color_code is usually readonly, but we include it
  hex_code: '#FFFFFF',
  price: 2000000,
  discount_type: 'none',
  discount_value: 0
});

const showAddColorModal = ref(false);
const newColorName = ref('');
const newColorCode = ref('');
const newColorPrice = ref(2000000);
const newColorDiscountType = ref<'none' | 'percent' | 'fixed'>('none');
const newColorDiscountValue = ref(0);
const newColorHex = ref('#FFFFFF');

// Image upload file input instead of text URL
const imageFiles = ref<File[]>([]);
const isUploading = ref(false);

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    imageFiles.value = Array.from(target.files);
  }
};

const handleUploadImages = async () => {
  if (!selectedProduct.value || !selectedColor.value) return;
  if (imageFiles.value.length === 0) {
    alert('Vui lòng chọn ít nhất 1 ảnh để tải lên!');
    return;
  }
  try {
    isUploading.value = true;
    const res = await adminProductService.uploadImages(
      selectedProduct.value.product_id as number,
      selectedColor.value.color_id as number,
      imageFiles.value,
      selectedColor.value.images.length === 0
    );
    if (res.success) {
      alert('Đã tải ảnh lên thành công.');
      imageFiles.value = [];
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi tải ảnh lên');
  } finally {
    isUploading.value = false;
  }
};

const makeMainImage = async (targetImg: any) => {
  if (!selectedProduct.value || !selectedColor.value) return;
  try {
    const reorderData = selectedColor.value.images.map((img: any) => ({
      image_id: img.image_id,
      display_order: img.display_order,
      is_main: img.image_id === targetImg.image_id
    }));
    const res = await adminProductService.reorderImages(
      selectedProduct.value.product_id as number,
      selectedColor.value.color_id as number,
      reorderData
    );
    if (res.success) {
      await loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi đặt ảnh chính');
  }
};

const deleteImage = async (targetImg: any) => {
  if (!selectedProduct.value || !selectedColor.value) return;
  if (!confirm('Bạn có chắc muốn xóa ảnh này không?')) return;
  try {
    const res = await adminProductService.deleteImage(
      selectedProduct.value.product_id as number,
      selectedColor.value.color_id as number,
      targetImg.image_id
    );
    if (res.success) {
      await loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi xóa ảnh');
  }
};

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

const isLoading = ref(true);

onMounted(() => {
  loadMetadata();
  loadProducts();
});

const loadMetadata = async () => {
  try {
    const brandRes = await brandService.getBrands();
    if (brandRes.success) brands.value = brandRes.data;
    
    const catRes = await categoryService.getCategories();
    if (catRes.success) categories.value = catRes.data;
  } catch (e) {
    console.error('Failed to load filters metadata:', e);
  }
};

const loadProducts = async () => {
  try {
    isLoading.value = true;
    const res = await adminProductService.getProducts({
      skip: (productPage.value - 1) * 10,
      limit: 10,
      keyword: productSearch.value || undefined,
      brand_id: filterBrandId.value || undefined,
      category_id: filterCategoryId.value || undefined,
      gender_target: filterGender.value || undefined,
      status: productFilter.value === 'all' ? undefined : productFilter.value
    });
    if (res.success && res.data) {
      products.value = res.data;
      productTotalPages.value = res.pagination?.total_pages || 1;
      
      // Preserve active selection if product list reloads
      if (selectedProduct.value) {
        const found = products.value.find(p => p.product_id === selectedProduct.value?.product_id);
        if (found) {
          selectedProduct.value = found;
          if (selectedColor.value) {
            const foundColor = found.colors.find(c => c.color_id === selectedColor.value?.color_id);
            if (foundColor) selectedColor.value = foundColor;
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to load admin products list:', e);
  } finally {
    isLoading.value = false;
  }
};

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Add product
const handleAddProduct = async () => {
  if (!newProductName.value || !newProductCode.value) {
    alert('Vui lòng điền mã và tên sản phẩm gốc!');
    return;
  }
  
  try {
    const data = {
      product_code: newProductCode.value.toUpperCase().trim(),
      product_name: newProductName.value.trim(),
      brand_id: newProductBrandId.value,
      category_id: newProductCategoryId.value,
      description: newProductDesc.value.trim(),
      gender_target: newProductGender.value,
      status: 'active'
    };

    const res = await adminProductService.createProduct(data);
    if (res.success) {
      alert('Đã tạo sản phẩm gốc thành công.');
      newProductName.value = '';
      newProductCode.value = '';
      newProductDesc.value = '';
      showAddProductModal.value = false;
      loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi thêm sản phẩm');
  }
};

// Edit product
const openEditProductModal = () => {
  if (!selectedProduct.value) return;
  editProductForm.value = {
    product_name: selectedProduct.value.product_name,
    brand_id: selectedProduct.value.brand?.brand_id || 1,
    category_id: selectedProduct.value.category?.category_id || 1,
    description: selectedProduct.value.description || '',
    gender_target: selectedProduct.value.gender_target || 'unisex'
  };
  showEditProductModal.value = true;
};

const submitEditProduct = async () => {
  if (!selectedProduct.value) return;
  if (!editProductForm.value.product_name) {
    alert('Vui lòng điền tên sản phẩm!');
    return;
  }
  
  try {
    const res = await adminProductService.updateProduct(
      selectedProduct.value.product_id as number,
      editProductForm.value
    );
    if (res.success) {
      alert('Đã cập nhật sản phẩm thành công.');
      showEditProductModal.value = false;
      loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi cập nhật sản phẩm');
  }
};

// Delete product
const handleDeleteProduct = async () => {
  if (!selectedProduct.value) return;
  if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct.value.product_name}" không? Thao tác này không thể hoàn tác.`)) {
    return;
  }
  
  try {
    const res = await adminProductService.deleteProduct(selectedProduct.value.product_id as number);
    if (res.success) {
      alert('Đã xóa sản phẩm thành công.');
      closeDrawer();
      loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi xóa sản phẩm');
  }
};

// Edit color variant
const openEditColorModal = () => {
  if (!selectedColor.value) return;
  editColorForm.value = {
    color_name: selectedColor.value.color_name,
    color_code: selectedColor.value.color_code,
    hex_code: selectedColor.value.hex_code || '#FFFFFF',
    price: selectedColor.value.price,
    discount_type: selectedColor.value.discount_type || 'none',
    discount_value: selectedColor.value.discount_value || 0
  };
  showEditColorModal.value = true;
};

const submitEditColor = async () => {
  if (!selectedProduct.value || !selectedColor.value) return;
  
  try {
    // 1. Update basic info (name, hex)
    await adminProductService.updateColor(
      selectedProduct.value.product_id as number,
      selectedColor.value.color_id as number,
      {
        color_name: editColorForm.value.color_name,
        hex_code: editColorForm.value.hex_code
      }
    );

    // 2. Update pricing & discount
    await adminProductService.updatePricing(
      selectedProduct.value.product_id as number,
      selectedColor.value.color_id as number,
      {
        price: editColorForm.value.price,
        discount_type: editColorForm.value.discount_type,
        discount_value: editColorForm.value.discount_value
      }
    );

    alert('Đã cập nhật biến thể màu sắc thành công.');
    showEditColorModal.value = false;
    await loadProducts();
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi cập nhật biến thể màu');
  }
};

const handleSetDefaultColor = async () => {
  if (!selectedProduct.value || !selectedColor.value) return;
  try {
    const res = await adminProductService.setDefaultColor(
      selectedProduct.value.product_id as number,
      selectedColor.value.color_id as number
    );
    if (res.success) {
      alert('Đã thiết lập màu mặc định thành công.');
      await loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi thiết lập mặc định');
  }
};

const toggleColorStatus = async () => {
  if (!selectedProduct.value || !selectedColor.value) return;
  const nextStatus = selectedColor.value.status === 'active' ? 'hidden' : 'active';
  try {
    const res = await adminProductService.updateColorStatus(
      selectedProduct.value.product_id as number,
      selectedColor.value.color_id as number,
      nextStatus
    );
    if (res.success) {
      alert(`Đã chuyển trạng thái màu sang: ${nextStatus === 'active' ? 'Hoạt động' : 'Tạm ẩn'}`);
      await loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi cập nhật trạng thái màu');
  }
};

const toggleSkuStatus = async (sku: ProductSku) => {
  if (!selectedProduct.value || !selectedColor.value) return;
  const nextStatus = sku.status === 'active' ? 'discontinued' : 'active';
  try {
    const res = await adminProductService.updateSkuStatus(
      selectedProduct.value.product_id as number,
      selectedColor.value.color_id as number,
      sku.sku_id as number,
      nextStatus
    );
    if (res.success) {
      alert(`Đã chuyển trạng thái kích cỡ sang: ${nextStatus === 'active' ? 'Hoạt động' : 'Tạm ẩn'}`);
      await loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi cập nhật trạng thái kích cỡ');
  }
};

// Add color to product
const handleAddColor = async () => {
  if (!selectedProduct.value) return;
  if (!newColorName.value || !newColorCode.value) {
    alert('Vui lòng điền tên và mã màu!');
    return;
  }
  
  try {
    const data = {
      color_code: newColorCode.value.toUpperCase().trim(),
      color_name: newColorName.value.trim(),
      hex_code: newColorHex.value,
      price: newColorPrice.value,
      discount_type: newColorDiscountType.value,
      discount_value: newColorDiscountValue.value,
      is_default: selectedProduct.value.colors.length === 0,
      status: 'active'
    };

    const res = await adminProductService.addColor(selectedProduct.value.product_id as number, data);
    if (res.success && res.data) {
      const newColorId = res.data.color_id;
      
      // Upload images if selected
      if (imageFiles.value.length > 0) {
        await adminProductService.uploadImages(
          selectedProduct.value.product_id as number,
          newColorId,
          imageFiles.value,
          true
        );
      }
      
      alert('Đã thêm màu biến thể thành công.');
      newColorName.value = '';
      newColorCode.value = '';
      imageFiles.value = [];
      showAddColorModal.value = false;
      loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi thêm màu');
  }
};

// Add SKU size
const handleAddSku = async () => {
  if (!selectedProduct.value || !selectedColor.value) return;
  if (!newSkuSize.value) {
    alert('Vui lòng điền size giày!');
    return;
  }

  try {
    const data = {
      skus: [
        {
          size: newSkuSize.value,
          stock_quantity: newSkuStock.value
        }
      ]
    };

    const res = await adminProductService.addSkus(
      selectedProduct.value.product_id as number,
      selectedColor.value.color_id as number,
      data
    );
    
    if (res.success) {
      alert('Đã sinh SKU size mới thành công.');
      newSkuSize.value = '';
      newSkuStock.value = 10;
      showAddSkuModal.value = false;
      loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi thêm SKU');
  }
};

// Adjust stock quantity
const handleAdjustStock = async () => {
  if (!activeSkuForAdjust.value) return;
  
  try {
    const originalStock = activeSkuForAdjust.value.stock_quantity;
    const isImport = adjustReason.value === 'import';
    const quantityChange = isImport ? adjustQuantity.value : -adjustQuantity.value;
    
    if (!isImport && originalStock < adjustQuantity.value) {
      alert('Số lượng điều chỉnh giảm không thể lớn hơn tồn kho hiện tại!');
      return;
    }

    const data = {
      change_quantity: quantityChange,
      reason: adjustReason.value,
      reason_note: adjustNote.value || (isImport ? 'Nhập hàng thêm thủ công' : 'Điều chỉnh sau kiểm kho')
    };

    const res = await adminProductService.adjustStock(activeSkuForAdjust.value.sku_id as number, data);
    if (res.success) {
      alert('Cập nhật tồn kho và ghi log thành công.');
      showAdjustStockModal.value = false;
      adjustNote.value = '';
      loadProducts();
    }
  } catch (err: any) {
    alert(err.response?.data?.detail || err.message || 'Lỗi điều chỉnh tồn kho');
  }
};

const openLogsModal = async (sku: ProductSku) => {
  activeSkuForLog.value = sku;
  try {
    const res = await adminProductService.getStockLogs(sku.sku_id as number);
    if (res.success) {
      activeSkuLogs.value = res.data || [];
    }
    showStockLogModal.value = true;
  } catch (e) {
    alert('Không thể tải log tồn kho.');
  }
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

    <!-- Loading spinner for product load -->
    <div v-if="isLoading && products.length === 0" class="py-12 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
    </div>

    <div v-else class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-premium flex flex-col h-[700px]">
      <!-- Header Options -->
      <div class="p-5 space-y-4 border-b bg-slate-50/50">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <!-- Keyword -->
          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Từ khóa</label>
            <div class="flex gap-1.5">
              <input 
                type="text" 
                v-model="productSearch" 
                placeholder="Tên/Mã SP..." 
                class="flex-1 border rounded-xl px-3 py-1.5 text-xs bg-white"
                @keyup.enter="loadProducts"
              />
              <button @click="loadProducts" class="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-black">Tìm</button>
            </div>
          </div>
          <!-- Brand -->
          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Thương hiệu</label>
            <select v-model="filterBrandId" class="w-full border rounded-xl px-3 py-1.5 text-xs bg-white" @change="loadProducts">
              <option value="">Tất cả thương hiệu</option>
              <option v-for="b in brands" :key="b.brand_id" :value="b.brand_id">{{ b.brand_name }}</option>
            </select>
          </div>
          <!-- Category -->
          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Danh mục</label>
            <select v-model="filterCategoryId" class="w-full border rounded-xl px-3 py-1.5 text-xs bg-white" @change="loadProducts">
              <option value="">Tất cả danh mục</option>
              <option v-for="c in categories" :key="c.category_id" :value="c.category_id">{{ c.category_name }}</option>
            </select>
          </div>
          <!-- Gender Target -->
          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Đối tượng</label>
            <select v-model="filterGender" class="w-full border rounded-xl px-3 py-1.5 text-xs bg-white" @change="loadProducts">
              <option value="">Tất cả đối tượng</option>
              <option value="unisex">Unisex</option>
              <option value="men">Nam</option>
              <option value="women">Nữ</option>
              <option value="kids">Trẻ em</option>
            </select>
          </div>
          <!-- Status -->
          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Trạng thái</label>
            <select v-model="productFilter" class="w-full border rounded-xl px-3 py-1.5 text-xs bg-white" @change="loadProducts">
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="hidden">Đang ẩn</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Products Table -->
      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-left text-xs divide-y divide-slate-100">
          <thead class="bg-slate-50 sticky top-0 z-10 text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th class="py-4 px-6">Sản phẩm</th>
              <th class="py-4 px-4">Mã SP</th>
              <th class="py-4 px-4">Thương hiệu</th>
              <th class="py-4 px-4">Giới tính</th>
              <th class="py-4 px-4 text-center">Số màu</th>
              <th class="py-4 px-6 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-slate-700 font-medium">
            <tr 
              v-for="p in products" 
              :key="p.product_id" 
              class="hover:bg-slate-50/50 cursor-pointer transition-colors"
              @click="openProductDrawer(p)"
            >
              <td class="py-4 px-6 font-bold text-slate-900">{{ p.product_name }}</td>
              <td class="py-4 px-4"><span class="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{{ p.product_code }}</span></td>
              <td class="py-4 px-4 uppercase text-[10px] font-bold">{{ p.brand_name || p.brand?.brand_name || 'N/A' }}</td>
              <td class="py-4 px-4 capitalize">{{ p.gender_target }}</td>
              <td class="py-4 px-4 text-center"><span class="bg-brand-blue/10 text-brand-blue px-2 py-1 rounded-full font-bold text-[10px]">{{ p.colors?.length || 0 }} màu</span></td>
              <td class="py-4 px-6 text-right">
                <button class="text-brand-blue font-bold text-[10px] hover:underline" @click.stop="openProductDrawer(p)">Chi tiết &gt;</button>
              </td>
            </tr>
            <tr v-if="products.length === 0">
              <td colspan="6" class="text-center py-12 text-slate-400">Không tìm thấy sản phẩm nào.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-5 border-t bg-slate-50">
        <Pagination 
          v-model:currentPage="productPage" 
          :total-pages="productTotalPages" 
          @change="loadProducts" 
        />
      </div>
    </div>

    <!-- Product Details Drawer (Drawer 1) -->
    <div v-if="isDrawerOpen" class="fixed inset-0 z-40 overflow-hidden flex justify-end">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-950/20 backdrop-blur-sm transition-opacity" @click="closeDrawer"></div>
      
      <!-- Drawer Panel -->
      <div class="relative max-w-2xl w-full h-full bg-white shadow-2xl flex flex-col overflow-hidden transform transition-transform duration-300 translate-x-0">
        <!-- Drawer Header -->
        <div class="px-6 py-5 border-b flex justify-between items-center bg-slate-50 z-10">
          <div>
            <h2 class="text-xl font-black text-slate-900">{{ selectedProduct?.product_name }}</h2>
            <p class="text-xs text-slate-500 mt-1">Code: <span class="font-mono">{{ selectedProduct?.product_code }}</span> | Phân loại: <span class="uppercase font-bold">{{ selectedProduct?.gender_target }}</span></p>
          </div>
          <div class="flex items-center space-x-3">
            <button @click="openEditProductModal" class="text-brand-blue font-bold text-xs hover:underline bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 transition-colors">Sửa SP</button>
            <button @click="handleDeleteProduct" class="text-rose-600 font-bold text-xs hover:underline bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 transition-colors">Xóa SP</button>
            <div class="w-px h-6 bg-slate-200 mx-1"></div>
            <button @click="closeDrawer" class="text-slate-400 hover:text-slate-700 bg-white rounded-full p-2 border shadow-sm transition-all hover:scale-105">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
        
        <!-- Drawer Content -->
        <div class="p-6 space-y-8 flex-1 overflow-y-auto">
          <!-- Colors Chips Section -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b pb-2">
              <h3 class="text-sm font-bold text-slate-900 uppercase">Màu biến thể (Cấp 2)</h3>
              <button @click="showAddColorModal = true" class="text-[10px] font-extrabold text-brand-blue hover:text-brand-accent uppercase">+ THÊM MÀU</button>
            </div>
            
            <div class="flex flex-wrap gap-2">
              <div v-if="!selectedProduct?.colors || selectedProduct.colors.length === 0" class="text-xs text-slate-400 py-2">
                Chưa có biến thể màu nào. Vui lòng thêm màu.
              </div>
              <!-- Chip -->
              <button 
                v-for="color in selectedProduct?.colors" 
                :key="color.color_id"
                @click="selectedColor = color"
                class="flex items-center space-x-2 px-4 py-2 rounded-full border transition-all text-xs font-bold shadow-sm"
                :class="[
                  selectedColor?.color_id === color.color_id ? 'border-brand-blue bg-blue-50 text-brand-blue ring-2 ring-blue-100' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  color.status === 'hidden' ? 'opacity-40 line-through bg-slate-100' : ''
                ]"
              >
                <span class="h-3.5 w-3.5 rounded-full border shadow-inner" :style="{ backgroundColor: color.hex_code }"></span>
                <span>{{ color.color_name }}</span>
                <span v-if="color.is_default" class="text-[10px] text-amber-500 font-extrabold ml-1" title="Màu mặc định">★</span>
              </button>
            </div>
          </div>
          
          <!-- Details for Selected Color (Images & Sizes) -->
          <div v-if="selectedColor" class="bg-slate-50/50 border border-slate-200 rounded-3xl p-5 space-y-6 animate-fade-in">
            
            <!-- Color Info -->
            <div class="flex justify-between items-center text-xs">
               <div>
                 <p class="text-slate-500 mb-1">Mã màu: <strong class="text-slate-900 font-mono">{{ selectedColor.color_code }}</strong></p>
                 <p class="text-slate-500">Giá bán: <strong class="text-brand-blue text-sm">{{ formatPrice(selectedColor.price) }}</strong></p>
               </div>
               <div class="flex space-x-2">
                 <button v-if="!selectedColor.is_default" @click="handleSetDefaultColor" class="bg-amber-50 border border-amber-200 shadow-sm px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all flex items-center space-x-1 text-amber-800">
                   <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.772-.568-.372-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                   <span>Đặt mặc định</span>
                 </button>
                 <button @click="toggleColorStatus" class="bg-white border shadow-sm px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center space-x-1.5 text-slate-700">
                   <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                   <span>{{ selectedColor.status === 'active' ? 'Tạm ẩn' : 'Kích hoạt' }}</span>
                 </button>
                 <button @click="openEditColorModal" class="bg-white border shadow-sm px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center space-x-1.5 text-slate-700">
                   <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                   <span>Sửa màu</span>
                 </button>
                 <button @click="showImageManagerModal = true" class="bg-white border shadow-sm px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center space-x-2 text-slate-700">
                   <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                   <span>Quản lý ảnh</span>
                 </button>
               </div>
            </div>

            <!-- Sizes Table Inline -->
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="text-sm font-bold text-slate-900 uppercase">Kích thước & Kho (Cấp 3)</h3>
                <button @click="showAddSkuModal = true" class="text-[10px] font-extrabold text-brand-blue hover:text-brand-accent uppercase">+ THÊM SIZE</button>
              </div>
              
              <div v-if="selectedColor.skus.length === 0" class="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                Chưa có kích cỡ nào cho màu này.
              </div>
              
              <div v-else class="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                <table class="w-full text-left text-xs divide-y divide-slate-100">
                  <thead class="text-slate-400 bg-slate-50/80">
                    <tr>
                      <th class="py-2.5 px-4 font-bold uppercase">Size</th>
                      <th class="py-2.5 px-4 font-bold uppercase">Code</th>
                      <th class="py-2.5 px-4 font-bold uppercase text-right">Tồn kho</th>
                      <th class="py-2.5 px-4 font-bold uppercase text-right">Đã bán</th>
                      <th class="py-2.5 px-4 font-bold uppercase text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="sku in selectedColor.skus" :key="sku.sku_id" class="hover:bg-slate-50 transition-colors" :class="sku.status !== 'active' ? 'opacity-40 line-through bg-slate-50' : ''">
                      <td class="py-2 px-4 font-black text-slate-900 text-sm">{{ sku.size }}</td>
                      <td class="py-2 px-4"><code class="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{{ sku.sku_code }}</code></td>
                      <td class="py-2 px-4 text-right">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="sku.stock_quantity > 0 && sku.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
                          {{ sku.stock_quantity }}
                        </span>
                      </td>
                      <td class="py-2 px-4 text-right font-bold text-slate-600">{{ sku.sold_quantity }}</td>
                      <td class="py-2 px-4 text-center">
                        <div class="flex space-x-2 justify-center font-bold text-[10px]">
                          <button @click="openAdjustModal(sku)" class="text-brand-blue hover:text-brand-accent px-2 py-1 hover:bg-blue-50 rounded">Nhập/Xuất</button>
                          <button @click="toggleSkuStatus(sku)" class="text-slate-500 hover:text-slate-800 px-2 py-1 hover:bg-slate-100 rounded">
                            {{ sku.status === 'active' ? 'Tạm ẩn' : 'Hiện lại' }}
                          </button>
                          <button @click="openLogsModal(sku)" class="text-slate-500 hover:text-slate-800 px-2 py-1 hover:bg-slate-100 rounded">Log</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- 1. Add Product -->
    <BaseModal :show="showAddProductModal" title="Thêm sản phẩm gốc mới" size="md" @close="showAddProductModal = false">
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
              <select v-model="newProductBrandId" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
                <option v-for="b in brands" :key="b.brand_id" :value="b.brand_id">{{ b.brand_name }}</option>
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
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thể loại</label>
            <select v-model="newProductCategoryId" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
              <option v-for="c in categories" :key="c.category_id" :value="c.category_id">{{ c.category_name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mô tả sản phẩm</label>
            <textarea v-model="newProductDesc" rows="2" class="w-full border rounded-xl px-3 py-2 text-xs resize-none"></textarea>
          </div>
        </div>
        <div class="flex space-x-3.5 pt-4">
          <button @click="showAddProductModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="handleAddProduct" class="flex-1 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl">Thêm sản phẩm</button>
        </div>
    </BaseModal>

    <!-- 1b. Edit Product -->
    <BaseModal :show="showEditProductModal" title="Sửa sản phẩm gốc" size="md" @close="showEditProductModal = false">
        <div class="space-y-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mã sản phẩm</label>
            <input type="text" :value="selectedProduct?.product_code" disabled class="w-full border rounded-xl px-3 py-2 text-xs uppercase bg-slate-50 text-slate-400 cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tên sản phẩm *</label>
            <input type="text" v-model="editProductForm.product_name" class="w-full border rounded-xl px-3 py-2 text-xs" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thương hiệu</label>
              <select v-model="editProductForm.brand_id" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
                <option v-for="b in brands" :key="b.brand_id" :value="b.brand_id">{{ b.brand_name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Đối tượng</label>
              <select v-model="editProductForm.gender_target" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
                <option value="unisex">Unisex (Cả nam/nữ)</option>
                <option value="men">Men (Nam)</option>
                <option value="women">Women (Nữ)</option>
                <option value="kids">Kids (Trẻ em)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thể loại</label>
            <select v-model="editProductForm.category_id" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
              <option v-for="c in categories" :key="c.category_id" :value="c.category_id">{{ c.category_name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mô tả sản phẩm</label>
            <textarea v-model="editProductForm.description" rows="2" class="w-full border rounded-xl px-3 py-2 text-xs resize-none"></textarea>
          </div>
        </div>
        <div class="flex space-x-3.5 pt-4">
          <button @click="showEditProductModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="submitEditProduct" class="flex-1 bg-brand-blue text-white font-bold text-xs py-2.5 rounded-xl">Lưu thay đổi</button>
        </div>
    </BaseModal>

    <!-- 2. Add Color -->
    <BaseModal :show="showAddColorModal" title="Thêm màu biến thể" size="md" @close="showAddColorModal = false">
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
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Chọn ảnh sản phẩm *</label>
            <input type="file" multiple @change="handleImageSelect" class="w-full border rounded-xl px-3 py-2 text-xs" />
          </div>
        </div>
        <div class="flex space-x-3.5 pt-4">
          <button @click="showAddColorModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="handleAddColor" class="flex-1 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl">Thêm biến thể</button>
        </div>
    </BaseModal>

    <!-- 2b. Edit Color -->
    <BaseModal :show="showEditColorModal" title="Sửa biến thể màu sắc" size="md" @close="showEditColorModal = false">
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mã màu</label>
              <input type="text" :value="editColorForm.color_code" disabled class="w-full border rounded-xl px-3 py-2 text-xs uppercase bg-slate-50 text-slate-400 cursor-not-allowed" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tên màu *</label>
              <input type="text" v-model="editColorForm.color_name" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giá bán gốc (VNĐ) *</label>
              <input type="number" v-model="editColorForm.price" class="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mã màu Hex</label>
              <input type="color" v-model="editColorForm.hex_code" class="w-full h-8 border rounded-xl px-1 py-1" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Loại giảm giá</label>
              <select v-model="editColorForm.discount_type" class="w-full border rounded-xl px-3 py-2 text-xs bg-white">
                <option value="none">Không giảm giá</option>
                <option value="percent">Giảm theo %</option>
                <option value="fixed">Giảm số tiền cố định</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Giá trị giảm</label>
              <input type="number" v-model="editColorForm.discount_value" class="w-full border rounded-xl px-3 py-2 text-xs" :disabled="editColorForm.discount_type === 'none'" />
            </div>
          </div>
        </div>
        <div class="flex space-x-3.5 pt-4">
          <button @click="showEditColorModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="submitEditColor" class="flex-1 bg-brand-blue text-white font-bold text-xs py-2.5 rounded-xl">Lưu thay đổi</button>
        </div>
    </BaseModal>

    <!-- 3. Add Size/SKU -->
    <BaseModal :show="showAddSkuModal" title="Thêm size giày mới" size="sm" @close="showAddSkuModal = false">
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
        <div class="flex space-x-3.5 pt-4">
          <button @click="showAddSkuModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="handleAddSku" class="flex-1 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl">Tạo size</button>
        </div>
    </BaseModal>

    <!-- 4. Adjust Stock Modal -->
    <BaseModal :show="showAdjustStockModal" title="Điều chỉnh tồn kho" size="sm" @close="showAdjustStockModal = false">
        <p class="text-[10px] text-slate-400 uppercase font-bold mb-4" v-if="activeSkuForAdjust">
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
        <div class="flex space-x-3.5 pt-4">
          <button @click="showAdjustStockModal = false" class="flex-1 border text-slate-600 font-bold text-xs py-2.5 rounded-xl">Đóng</button>
          <button @click="handleAdjustStock" class="flex-1 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl">Cập nhật kho</button>
        </div>
    </BaseModal>

    <!-- 5. View Stock Logs Modal -->
    <BaseModal :show="showStockLogModal" title="Lịch sử tồn kho SKU" size="md" @close="showStockLogModal = false">
        <p class="text-[10px] text-slate-400 uppercase font-bold mb-4" v-if="activeSkuForLog">
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
        
        <div class="pt-4 text-right">
          <button @click="showStockLogModal = false" class="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl">Đóng</button>
        </div>
    </BaseModal>

    <!-- 6. Image Manager Modal -->
    <BaseModal :show="showImageManagerModal" title="Quản lý Hình ảnh" size="md" @close="showImageManagerModal = false">
      <div v-if="selectedColor">
        <p class="text-xs text-slate-500 mb-4">
          Màu đang chọn: <strong class="text-slate-900">{{ selectedColor.color_name }}</strong>
        </p>
        
        <!-- Current Images Grid -->
        <div class="grid grid-cols-3 gap-3 mb-6">
           <div v-for="img in selectedColor.images || []" :key="img.image_id" class="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
             <img :src="img.image_url" class="object-cover w-full h-full" />
             <!-- Image Actions Overlay -->
             <div class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center space-y-2 p-2">
                <button v-if="!img.is_main" @click="makeMainImage(img)" class="text-[9px] font-bold bg-white text-slate-900 px-2 py-1 rounded w-full truncate">Làm ảnh chính</button>
                <button @click="deleteImage(img)" class="text-[9px] font-bold bg-rose-600 text-white px-2 py-1 rounded w-full truncate">Xóa ảnh</button>
             </div>
             <div v-if="img.is_main" class="absolute top-1 right-1 bg-brand-blue text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Ảnh chính</div>
           </div>
           
           <div v-if="!selectedColor.images || selectedColor.images.length === 0" class="col-span-3 text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              Chưa có hình ảnh nào được tải lên.
           </div>
        </div>
        
        <!-- Add new Images -->
        <div class="border-t pt-4">
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-2">Thêm ảnh mới</label>
          <input type="file" multiple @change="handleImageSelect" class="w-full border rounded-xl px-3 py-2 text-xs" />
          <button @click="handleUploadImages" :disabled="isUploading" class="w-full mt-3 bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-black transition-colors disabled:bg-slate-400">
             {{ isUploading ? 'Đang tải lên...' : 'Tải lên ngay' }}
          </button>
        </div>
      </div>
      
      <div class="pt-4 flex justify-end">
        <button @click="showImageManagerModal = false" class="border text-slate-600 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">Đóng</button>
      </div>
    </BaseModal>
  </div>
</template>
