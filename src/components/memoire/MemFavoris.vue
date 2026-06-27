<script setup lang="ts">
import { computed } from 'vue'
import { useMemoireStore } from '../../stores/useMemoireStore'
import type { FavFilter } from '../../stores/useMemoireStore'
import FavoriCard from './FavoriCard.vue'
import MemIcon from './MemIcon.vue'

const store = useMemoireStore()

const isAll = computed(() => store.favFilter.kind === 'all')
const isUnassigned = computed(() => store.favFilter.kind === 'unassigned')
function isPiste(id: string): boolean {
  return store.favFilter.kind === 'piste' && store.favFilter.id === id
}
function setFilter(f: FavFilter) {
  store.favFilter = f
}
</script>

<template>
  <div class="c-wrap">
    <aside class="c-rail">
      <div class="rail-head"><MemIcon name="filter" :size="12" /> Filtrer</div>
      <button
        type="button"
        class="rail-item"
        :class="{ on: isAll }"
        @click="setFilter({ kind: 'all' })"
      >
        <span>Tous les favoris</span>
        <span class="rail-count">{{ store.favorites.length }}</span>
      </button>
      <button
        type="button"
        class="rail-item rail-unassigned"
        :class="{ on: isUnassigned }"
        @click="setFilter({ kind: 'unassigned' })"
      >
        <span class="rail-dot" />
        <span>Non associés</span>
        <span class="rail-count">{{ store.unassignedCount }}</span>
      </button>

      <div class="rail-label">Par piste</div>
      <button
        v-for="p in store.pistes"
        :key="p.id"
        type="button"
        class="rail-item"
        :class="{ on: isPiste(p.id) }"
        @click="setFilter({ kind: 'piste', id: p.id })"
      >
        <span class="rail-pdot" :style="{ background: `var(--color-${p.couleur})` }" />
        <span class="rail-pname">{{ p.nom }}</span>
        <span class="rail-count">{{ store.favoriCounts[p.id] ?? 0 }}</span>
      </button>

      <button type="button" class="rail-new" @click="store.openComposer(null)">
        <MemIcon name="plus" :size="12" /> nouvelle piste
      </button>
    </aside>

    <section class="c-main">
      <div class="c-bar">
        <label class="c-search">
          <MemIcon name="search" :size="14" />
          <input
            v-model="store.favSearch"
            type="search"
            placeholder="Chercher un favori — titre, source…"
            aria-label="Chercher un favori"
          />
        </label>
      </div>

      <div v-if="store.filteredFavorites.length" class="c-cards">
        <FavoriCard v-for="f in store.filteredFavorites" :key="f.articleId" :favori="f" />
      </div>
      <p v-else class="c-empty">Aucun favori pour ce filtre.</p>
    </section>
  </div>
</template>

<style scoped>
.c-wrap {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
  min-height: 0;
}
.c-rail {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rail-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin-bottom: 8px;
}
.rail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 1px solid transparent;
  background: none;
  cursor: pointer;
  padding: 7px 9px;
  border-radius: var(--mem-radius-card);
  min-height: 32px;
  font-family: var(--font-sans);
  font-size: 12.5px;
  color: var(--color-ink-2);
  text-align: left;
  transition: background 0.14s;
}
.rail-item:hover {
  background: var(--color-bg-2);
}
.rail-item.on {
  background: var(--color-paper);
  box-shadow: inset 0 0 0 1px var(--color-rule);
  color: var(--color-ink);
}
.rail-item > span:nth-child(2),
.rail-pname {
  flex: 1;
}
.rail-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  font-variant-numeric: tabular-nums;
}
.rail-unassigned {
  color: var(--color-amber);
}
.rail-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-amber);
  flex: none;
}
.rail-label {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  padding: 14px 9px 6px;
}
.rail-pdot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}
.rail-new {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px dashed var(--color-ink-4);
  background: none;
  cursor: pointer;
  margin-top: 10px;
  padding: 8px 9px;
  border-radius: var(--mem-radius-card);
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  min-height: 32px;
}
.rail-new:hover {
  color: var(--color-indigo);
  border-color: var(--color-indigo-tint);
}
.c-main {
  min-width: 0;
}
.c-bar {
  margin-bottom: 14px;
}
.c-search {
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--mem-radius-card);
  padding: 9px 13px;
  color: var(--color-ink-3);
}
.c-search:focus-within {
  outline: 2px solid var(--color-indigo-tint);
}
.c-search input {
  flex: 1;
  border: none;
  background: none;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-ink);
}
.c-search input:focus {
  outline: none;
}
.c-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}
.c-empty {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 14px;
  color: var(--color-ink-4);
  padding: 40px 0;
}
@media (max-width: 920px) {
  .c-wrap {
    grid-template-columns: 1fr;
  }
  .c-rail {
    position: static;
  }
  .c-cards {
    grid-template-columns: 1fr;
  }
}
</style>
