import { createRouter, createWebHashHistory } from 'vue-router'
import { hasToken } from '../api/auth'

// En mode mock (dev sans backend), l'auth est désactivée : l'app est navigable
// sans token. En mode réel, garde fail-closed (INV-U8) : sans token → /locked.
const AUTH_REQUIRED = import.meta.env.VITE_USE_MOCK !== 'true'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',                   redirect: '/memoire' },
    { path: '/locked',             component: () => import('../views/LockedView.vue') },
    { path: '/briefing',           component: () => import('../views/BriefingView.vue') },
    { path: '/explorer/articles',  component: () => import('../views/ArticlesView.vue') },
    { path: '/explorer/sujets',    component: () => import('../views/SujetsView.vue') },
    { path: '/explorer/carto',     component: () => import('../views/CartoView.vue') },
    { path: '/memoire',            component: () => import('../views/MemoireView.vue') },
    { path: '/onboarding',         component: () => import('../views/OnboardingView.vue') },
    { path: '/profil',             component: () => import('../views/ProfilView.vue') },
  ],
})

// Garde fail-closed (INV-U8) : sans token, toute route mène à l'écran « lien requis ».
router.beforeEach((to) => {
  if (!AUTH_REQUIRED) {
    return to.path === '/locked' ? '/' : true
  }
  if (to.path === '/locked') {
    return hasToken() ? '/' : true
  }
  return hasToken() ? true : '/locked'
})

export default router
