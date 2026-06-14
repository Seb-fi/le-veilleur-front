<script setup lang="ts">
const day = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date())
const dayLabel = day.charAt(0).toUpperCase() + day.slice(1)
</script>

<template>
  <div class="brand">
    <svg class="brand-mark" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="2.5" fill="oklch(38% .09 265)"/>
      <circle cx="4" cy="6" r="1.6" fill="oklch(38% .09 265)" opacity=".7"/>
      <circle cx="24" cy="8" r="1.6" fill="oklch(38% .09 265)" opacity=".7"/>
      <circle cx="6" cy="22" r="1.6" fill="oklch(68% .12 75)"/>
      <circle cx="22" cy="22" r="1.6" fill="oklch(38% .09 265)" opacity=".7"/>
      <g stroke="oklch(38% .09 265)" stroke-width=".7" opacity=".55">
        <line x1="14" y1="14" x2="4" y2="6"/>
        <line x1="14" y1="14" x2="24" y2="8"/>
        <line x1="14" y1="14" x2="6" y2="22"/>
        <line x1="14" y1="14" x2="22" y2="22"/>
        <line x1="4" y1="6" x2="24" y2="8" stroke-dasharray="1 2"/>
      </g>
    </svg>
    <div>
      <div class="brand-title">Le Veilleur</div>
      <span class="brand-sub">Édition · {{ dayLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 4px 8px 28px;
  border-bottom: var(--border-thin);
  margin-bottom: 20px;
}

.brand-mark {
  width: 28px;
  height: 28px;
  flex: none;
  transform: translateY(4px);
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
