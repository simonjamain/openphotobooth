import { createRouter, createWebHashHistory } from 'vue-router';
import boothView from '@/views/boothView.vue';
import flowConfigView from '@/views/flowConfigView.vue';
import flowsView from '@/views/flowsView.vue';

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/booth',
            name: 'booth',
            component: boothView,
        },
        {
            path: '/configure/:flowIndex?',
            name: 'flow-config',
            component: flowConfigView,
            props: true,
        },
        {
            path: '/flows',
            name: 'flows',
            component: flowsView,
        },
        {
            path: '/',
            redirect: '/flows',
        },
    ],
});

export default router;
