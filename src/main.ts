import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useCartStore } from './stores/cart'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Tải dữ liệu giỏ hàng từ LocalStorage
const cartStore = useCartStore()
cartStore.loadCart()

app.mount('#app')
