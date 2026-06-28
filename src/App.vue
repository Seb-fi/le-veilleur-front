<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFeedbackStore } from '@/stores/useFeedbackStore'

// L'écran verrouillé (PRD #49) s'affiche plein écran, sans la coquille applicative.
const route = useRoute()
const router = useRouter()
const isLocked = computed(() => route.path === '/locked')

// Identité de session + redirection onboarding (INV-U10) : un utilisateur sans
// profil est conduit vers l'entretien avant de voir un briefing vide.
const auth = useAuthStore()
const feedback = useFeedbackStore()
onMounted(async () => {
  if (route.path === '/locked') return
  try {
    await auth.load()
    if (auth.me && !auth.me.has_profile && route.path !== '/onboarding') {
      router.replace('/onboarding')
    }
    // Étoiles favori = reflet de la bibliothèque persistante (idempotent, best-effort).
    feedback.hydrateFavorites()
  } catch {
    /* 401 géré par client.ts (→ /locked) ; pas d'autre action ici. */
  }
})
</script>

<template>
  <RouterView v-if="isLocked" />
  <div v-else class="app-shell">
    <div class="bg-noise" aria-hidden="true" />
    <AppSidebar />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style>
.app-shell {
  display: flex;
  min-height: 100vh;
  position: relative;
}

.bg-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 .1 0 0 0 0 .1 0 0 0 0 .1 0 0 0 .04 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
}

.app-main {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}
</style>
