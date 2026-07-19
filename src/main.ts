import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useBoothApp } from './core/composables/useBoothApp.ts'
import { installAllExtensions } from './extensions/extensionsRegistry.ts'

const app = createApp(App)

app.use(router)

const { boothApp } = useBoothApp();
installAllExtensions(boothApp.value);

app.mount('#app')

