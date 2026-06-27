<script setup lang="ts">
import { useMemoireStore } from '../../stores/useMemoireStore'
import MemIcon from './MemIcon.vue'

const store = useMemoireStore()

function count(id: string): number {
  return store.favoriCounts[id] ?? 0
}
</script>

<template>
  <div class="pl-wrap">
    <button
      v-for="p in store.pistes"
      :key="p.id"
      type="button"
      class="pl-card"
      @click="store.openFiche(p.id)"
    >
      <div class="pl-head">
        <span class="pl-dot" :style="{ background: `var(--color-${p.couleur})` }" />
        <span class="pl-name">{{ p.nom }}</span>
        <span class="pl-star">★ {{ count(p.id) }}</span>
      </div>
      <p class="pl-desc">{{ p.descriptif }}</p>
      <div class="pl-foot">
        <span class="pl-active" />
        aperçu actif · {{ count(p.id) }} sources aujourd'hui
      </div>
    </button>

    <button type="button" class="pl-new" @click="store.openComposer(null)">
      <MemIcon name="plus" :size="13" /> Nouvelle piste
    </button>
  </div>
</template>

<style scoped>
.pl-wrap {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-items: start;
}
.pl-card {
  text-align: left;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--mem-radius-pop);
  padding: 18px 20px;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}
.pl-card:hover {
  box-shadow: var(--shadow-popover);
  transform: translateY(-1px);
}
.pl-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pl-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: none;
}
.pl-name {
  flex: 1;
  font-family: var(--font-serif);
  font-size: 20px;
  letter-spacing: -0.014em;
  color: var(--color-ink);
}
.pl-star {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
}
.pl-desc {
  font-family: var(--font-serif);
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-ink-3);
  margin: 10px 0 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pl-foot {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-4);
}
.pl-active {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-moss);
  flex: none;
}
.pl-new {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px dashed var(--color-ink-4);
  background: none;
  cursor: pointer;
  border-radius: var(--mem-radius-pop);
  padding: 18px 20px;
  min-height: 96px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-3);
}
.pl-new:hover {
  color: var(--color-indigo);
  border-color: var(--color-indigo-tint);
}
@media (max-width: 920px) {
  .pl-wrap {
    grid-template-columns: 1fr;
  }
}
</style>
