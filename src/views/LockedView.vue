<script setup lang="ts">
// Écran fail-closed (PRD #49, INV-U8) : token absent/invalide → pas de page de
// garde premium, juste un message minimal. Affiché par la garde de routes.
import { hasToken } from '@/api/auth'

const reason = hasToken()
  ? 'Votre lien d’accès est invalide ou expiré.'
  : 'Le Veilleur est sur invitation.'
</script>

<template>
  <div class="locked">
    <div class="locked__card">
      <p class="locked__brand">Le Veilleur</p>
      <h1 class="locked__title">{{ reason }}</h1>
      <p class="locked__hint">Ouvrez votre lien d’invitation pour accéder à votre briefing.</p>
    </div>
  </div>
</template>

<style scoped>
.locked {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: 2rem;
  background: var(--color-bg);
}
.locked__card {
  max-width: 30rem;
  text-align: center;
}
.locked__brand {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin-bottom: 1.5rem;
}
.locked__title {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 1.2;
  color: var(--color-ink);
  margin-bottom: 0.75rem;
}
.locked__hint {
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  color: var(--color-ink-3);
}
</style>
