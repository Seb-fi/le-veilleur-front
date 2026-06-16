<script setup lang="ts">
import logo from '@/assets/veilleur-mark.png'

const day = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date())
const dayLabel = day.charAt(0).toUpperCase() + day.slice(1)
</script>

<template>
  <div class="brand">
    <img class="brand-mark" :src="logo" alt="Le Veilleur" />
    <div>
      <div class="brand-title">Le Veilleur</div>
      <span class="brand-sub">Édition · {{ dayLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 4px 8px 28px;
  border-bottom: var(--border-thin);
  margin-bottom: 20px;
}

.brand-mark {
  width: 34px;
  height: auto;
  flex: none;
}

.brand-title {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.01em;
  line-height: 1;
  color: var(--color-ink);
}

.brand-sub {
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--color-ink-4);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-top: 4px;
  display: block;
}
</style>
