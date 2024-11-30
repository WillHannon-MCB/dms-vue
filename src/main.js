import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

import router from './router'
import App from './App.vue'

import './assets/css/main.css'

const pinia = createPinia()
const app = createApp(App)

// Pinia for state management
app.use(pinia)
// Vue Router for client-side routing
app.use(router)
// PrimeVue for basic UI Components
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})
app.mount('#app')
