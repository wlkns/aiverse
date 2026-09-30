import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import App from './App.vue'
import { router } from './router'
import { storage, storageKey, trackStores } from './persistence'
import './style.css'

const pinia = createPinia()
// Saving can be switched off in Settings; see persistence.ts.
pinia.use(createPersistedState({ storage, key: storageKey }))
pinia.use(trackStores)

// Pinia must be installed before the router so navigation guards can use stores.
createApp(App).use(pinia).use(router).mount('#app')
