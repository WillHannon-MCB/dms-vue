import { createRouter, createWebHistory } from 'vue-router'
import StartView from '@/views/StartView.vue'
import ConfigureView from '@/views/ConfigureView.vue'
import VisualizeView from '@/views/VisualizeView.vue'
import ExportView from '@/views/ExportView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'start',
      component: StartView,
      meta: {
        title: 'Start',
        order: 1,
      },
    },
    {
      path: '/configure',
      name: 'configure',
      component: ConfigureView,
      meta: {
        title: 'Configure',
        order: 2,
      },
    },
    {
      path: '/visualize',
      name: 'visualize',
      component: VisualizeView,
      meta: {
        title: 'Visualize',
        order: 3,
      },
    },
    {
      path: '/export',
      name: 'export',
      component: ExportView,
      meta: {
        title: 'Export',
        order: 4,
      },
    },
  ],
})

export default router
