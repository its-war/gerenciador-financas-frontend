import { createRouter, createWebHistory } from 'vue-router'

// Importações das Rotas
import HomePage from '@/pages/HomePage.vue'
import HomeBodyComponent from "@/components/HomePage/HomeBodyComponent.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomePage,
      children: [
        {
          path: '',
          name: 'Home',
          component: HomeBodyComponent
        }
      ]
    }
  ]
})

export default router
