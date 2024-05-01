import { createRouter, createWebHistory } from 'vue-router'

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
})

export default router
