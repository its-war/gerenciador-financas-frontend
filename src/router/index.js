import { createRouter, createWebHistory } from 'vue-router'
import mainStore from "@/store/mainStore";

// Importações das Rotas
import HomePage from '@/pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage
    }
  ]
});

router.afterEach(() => {
  const store = mainStore();
  store.setOverlay(false);
});

export default router
