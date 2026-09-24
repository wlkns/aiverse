import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import UnlockView from '@/views/UnlockView.vue'
import { useAuthStore } from '@/stores/auth'
import { TOOLS, type ToolId } from '@/tools/registry'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    /** Reachable without an access token. */
    public?: boolean
    toolId?: ToolId
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'All tools' } },
  ...TOOLS.map<RouteRecordRaw>((tool) => ({
    path: tool.path,
    name: tool.id,
    component: tool.component,
    meta: { title: tool.name, toolId: tool.id },
  })),
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'Settings' },
  },
  {
    path: '/unlock',
    name: 'unlock',
    component: UnlockView,
    meta: { title: 'Unlock', public: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!to.meta.public && !auth.isUnlocked) {
    return { name: 'unlock', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } }
  }
  if (to.name === 'unlock' && auth.isUnlocked) {
    return '/'
  }
})
