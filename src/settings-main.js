import { createApp } from 'vue'
import { createPinia } from 'pinia'
import AppSettings from './AppSettings.vue'
import './assets/style.css'

const app = createApp(AppSettings)
app.use(createPinia())
app.mount('#app')
