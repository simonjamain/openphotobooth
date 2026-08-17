import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { useBoothApp } from './core/composables/useBoothApp.ts'
import { installAllExtensions } from './extensions/extensionsRegistry.ts'
import './ui/styles/base.css'

const app = createApp(App)

app.use(router)
app.use(i18n)

const { boothApp } = useBoothApp();
installAllExtensions(boothApp.value);

app.mount('#app')

