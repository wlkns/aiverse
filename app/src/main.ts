import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import { router } from './router'
import './style.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Pinia must be installed before the router so navigation guards can use stores.
createApp(App).use(pinia).use(router).mount('#app')
