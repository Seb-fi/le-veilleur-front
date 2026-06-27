<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMemoireStore } from '../stores/useMemoireStore'
import MemFavoris from '../components/memoire/MemFavoris.vue'
import MemPistesList from '../components/memoire/MemPistesList.vue'
import MemFiche from '../components/memoire/MemFiche.vue'
import MemComposer from '../components/memoire/MemComposer.vue'
import MemNotes from '../components/memoire/MemNotes.vue'
import MemIcon from '../components/memoire/MemIcon.vue'

const store = useMemoireStore()
onMounted(() => store.load())

// L'onglet « Pistes » couvre la liste, la fiche et le composeur.
const activeTab = computed<'favoris' | 'pistes' | 'notes'>(() => {
  if (store.screen === 'favoris') return 'favoris'
  if (store.screen === 'notes') return 'notes'
  return 'pistes'
})

const noteCount = computed(() => store.notes.length)
</script>

<template>
  <div class="mem-page">
    <header class="mem-top">
      <div class="mem-eyebrow"><MemIcon name="mem" :size="12" /> Mémoire active</div>
      <div class="mem-titlerow">
        <div>
          <h1 class="mem-title">Vos <em>favoris</em></h1>
          <p class="mem-sub">Les articles que vous gardez vivants — associés aux pistes qu'ils nourrissent.</p>
        </div>
        <button type="button" class="mem-newbtn" @click="store.openComposer(null)">
          <MemIcon name="plus" :size="13" /> Nouvelle piste
        </button>
      </div>

      <nav class="mem-tabs" role="tablist" aria-label="Sections de la mémoire active">
        <button
          type="button"
          role="tab"
          class="mem-tab"
          :aria-selected="activeTab === 'favoris'"
          :class="{ on: activeTab === 'favoris' }"
          @click="store.goFavoris()"
        >
          Favoris <span class="mem-pill">{{ store.favorites.length }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="mem-tab"
          :aria-selected="activeTab === 'pistes'"
          :class="{ on: activeTab === 'pistes' }"
          @click="store.goPistes()"
        >
          Pistes <span class="mem-pill">{{ store.pistes.length }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="mem-tab"
          :aria-selected="activeTab === 'notes'"
          :class="{ on: activeTab === 'notes' }"
          @click="store.goNotes()"
        >
          Notes <span class="mem-pill">{{ noteCount }}</span>
        </button>
      </nav>
    </header>

    <main class="mem-content">
      <p v-if="store.loading" class="mem-loading">Chargement…</p>
      <template v-else>
        <MemFavoris v-if="store.screen === 'favoris'" />
        <MemPistesList v-else-if="store.screen === 'pistes'" />
        <MemFiche v-else-if="store.screen === 'fiche'" />
        <MemComposer v-else-if="store.screen === 'composer'" />
        <MemNotes v-else-if="store.screen === 'notes'" />
      </template>
    </main>

    <Transition name="toast">
      <div v-if="store.toastMessage" class="mem-toast" role="status">{{ store.toastMessage }}</div>
    </Transition>
  </div>
</template>

<style scoped>
/* Radii locaux à la surface mémoire (handoff vise 8/12) — sans muter les globaux. */
.mem-page {
  --mem-radius-card: 8px;
  --mem-radius-pop: 12px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.mem-top {
  padding: 24px 40px 0;
}
.mem-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin-bottom: 14px;
}
.mem-titlerow {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}
.mem-title {
  font-family: var(--font-serif);
  font-size: 26px;
  line-height: 1.04;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  font-weight: var(--weight-regular);
}
.mem-title em {
  font-style: italic;
  color: var(--color-indigo);
}
.mem-sub {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13.5px;
  color: var(--color-ink-3);
  margin-top: 5px;
}
.mem-newbtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--color-rule);
  background: var(--color-paper);
  border-radius: var(--radius-lg);
  padding: 9px 14px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-2);
  cursor: pointer;
  min-height: 36px;
  flex: none;
}
.mem-newbtn:hover {
  color: var(--color-indigo);
  border-color: var(--color-indigo-tint);
}
.mem-tabs {
  display: flex;
  gap: 24px;
  padding: 16px 0 0;
  margin-top: 18px;
  border-bottom: 1px solid var(--color-rule);
}
.mem-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0 0 12px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.mem-tab:hover {
  color: var(--color-ink-2);
}
.mem-tab.on {
  color: var(--color-ink);
  border-bottom-color: var(--color-indigo);
}
.mem-pill {
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 2px 6px;
  border-radius: var(--radius-pill);
  background: var(--color-bg-2);
  color: var(--color-ink-3);
  font-variant-numeric: tabular-nums;
}
.mem-tab.on .mem-pill {
  background: var(--color-indigo-tint);
  color: var(--color-indigo);
}
.mem-content {
  flex: 1;
  min-height: 0;
  padding: 28px 40px 64px;
}
.mem-loading {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  padding: 60px 0;
  text-align: center;
}
.mem-toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 60;
  background: var(--color-ink);
  color: var(--color-paper);
  font-family: var(--font-sans);
  font-size: 12.5px;
  padding: 10px 18px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
