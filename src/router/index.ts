import { createRouter, createWebHistory } from 'vue-router';
import boothView from '@/views/boothView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'booth',
            component: boothView,
        },
    ],
});

export default router;
