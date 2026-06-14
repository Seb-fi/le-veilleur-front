<script setup lang="ts">
import { onMounted } from 'vue'
import { useMemoireStore } from '../stores/useMemoireStore'
import PisteRail from '../components/memoire/PisteRail.vue'
import PisteDetail from '../components/memoire/PisteDetail.vue'
import NoteModal from '../components/memoire/NoteModal.vue'
import GraphView from '../components/memoire/GraphView.vue'
import type { NoteId, PisteId } from '../types'

const store = useMemoireStore()
onMounted(() => store.load())

function handleEditNote(id: NoteId) {
  const note = store.data?.notes.find(n => n.id === id)
  if (!note) return
  store.openNoteModal(store.activePiste?.title ?? '', note.body, id)
}

function handleAddNote() {
  store.openNoteModal(store.activePiste?.title ?? '')
}

function handleGraphAddNote(pisteTitle: string, pisteId: PisteId) {
  store.selectPiste(pisteId)
  store.openNoteModal(pisteTitle)
}

function handleGraphEditNote(id: NoteId) {
  const note = store.data?.notes.find(n => n.id === id)
  if (!note) return
  store.openNoteModal('', note.body, id)
}
</script>

<template>
  <div class="mem-page">
    <div v-if="store.loading" class="loading">
      <span>Chargement…</span>
    </div>

    <template v-else-if="store.data">
      <div class="mem-shell">

        <!-- Header -->
        <header class="mem-header">
          <div class="mem-eyebrow">
            <span class="mem-mark" />
            Mémoire active · espace personnel
          </div>
          <div class="mem-titlerow">
            <div>
              <h1 class="mem-title">Votre espace. Vos <em>fils</em>. Votre pensée à long terme.</h1>
              <p class="mem-tagline">
                Ce que vous gardez vivant ici devient progressivement la <b>mémoire stratégique</b>
                du Veilleur. Articles relus, notes épinglées, pistes ouvertes —
                rien ne part, rien ne se perd entre vos sessions.
              </p>
            </div>
            <div class="mem-modes" role="tablist" aria-label="Mode de visualisation">
              <button
                class="mode-btn"
                :class="{ on: store.mode === 'tree' }"
                :aria-selected="store.mode === 'tree'"
                @click="store.mode = 'tree'"
              >Arborescence</button>
              <button
                class="mode-btn"
                :class="{ on: store.mode === 'graph' }"
                :aria-selected="store.mode === 'graph'"
                @click="store.mode = 'graph'"
              >Graphe</button>
            </div>
          </div>
          <div class="mem-state">
            <span><b>{{ String(store.data.stats.pisteCount).padStart(2, '0') }}</b>pistes</span>
            <span><b>{{ String(store.data.stats.articleCount).padStart(2, '0') }}</b>articles</span>
            <span><b>{{ String(store.data.stats.noteCount).padStart(2, '0') }}</b>notes</span>
            <span><b>{{ String(store.data.stats.eventCount).padStart(2, '0') }}</b>évènements</span>
            <span class="ms-end">Sauvegardé · {{ store.data.stats.savedAt }}</span>
          </div>
        </header>

        <!-- Mode Arborescence -->
        <div v-if="store.mode === 'tree'" class="mem-layout">
          <PisteRail
            :active-pistes="store.activePistes"
            :dormant-pistes="store.dormantPistes"
            :events="store.data.events"
            :rail-pinned-note="store.railPinnedNote"
            :active-piste-id="store.activePisteId"
            @select-piste="store.selectPiste"
            @add-piste="handleAddNote"
          />

          <PisteDetail
            v-if="store.activePiste"
            :piste="store.activePiste"
            :pinned-note="store.pinnedNote"
            :stream="store.pisteStream"
            :stream-filter="store.streamFilter"
            :whisper-dismissed="store.whisperDismissed"
            @update:stream-filter="store.streamFilter = $event"
            @add-note="handleAddNote"
            @edit-note="handleEditNote"
            @pin-note="store.pinStreamNote"
            @dismiss-whisper="store.whisperDismissed = true"
          />

          <div v-else class="no-piste">
            <p>Sélectionnez une piste dans le rail pour l'ouvrir.</p>
          </div>
        </div>

        <!-- Mode Graphe -->
        <div v-else class="mem-graph">
          <GraphView
            v-if="store.data"
            :pistes="store.data.pistes"
            :notes="store.data.notes"
            :articles="store.data.articles"
            :events="store.data.events"
            @add-note="handleGraphAddNote"
            @edit-note="handleGraphEditNote"
          />
        </div>

      </div>
    </template>

    <!-- Note Modal -->
    <NoteModal
      :open="store.noteModalOpen"
      :context="store.noteModalContext"
      :initial-body="store.noteModalInitial"
      @close="store.closeNoteModal"
      @save="store.saveModalNote"
    />
  </div>
</template>

<style scoped>
.mem-page {
  min-height: 100%;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  font-family: var(--font-mono);
  font-size: var(--type-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-ink-4);
}

.mem-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 40px 96px;
}

/* Header */
.mem-header {
  padding: 48px 0 22px;
  border-bottom: var(--border-rule);
  position: relative;
}

.mem-eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--weight-medium);
}

.mem-eyebrow::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-rule-2);
  max-width: 120px;
}

.mem-mark {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-indigo);
  box-shadow: 0 0 0 3px oklch(38% 0.09 265 / 0.15);
  flex: none;
}

.mem-titlerow {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 48px;
  align-items: end;
}

.mem-title {
  font-family: var(--font-serif);
  font-size: 46px;
  font-weight: 400;
  letter-spacing: -0.024em;
  line-height: 1.02;
  margin-bottom: 14px;
  text-wrap: pretty;
  max-width: 20ch;
  color: var(--color-ink);
}

.mem-title em { font-style: italic; color: var(--color-indigo); font-weight: 400; }

.mem-tagline {
  font-family: var(--font-serif);
  font-size: 17px;
  font-style: italic;
  line-height: 1.5;
  color: var(--color-ink-3);
  max-width: 54ch;
  text-wrap: pretty;
  font-weight: 300;
}

.mem-tagline b { font-style: normal; font-weight: var(--weight-medium); color: var(--color-ink-2); }

.mem-modes {
  display: flex;
  background: var(--color-bg-2);
  border-radius: var(--radius-pill);
  padding: 3px;
  border: 1px solid var(--color-rule);
}

.mode-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  color: var(--color-ink-3);
  transition: all 0.2s;
  font-weight: var(--weight-medium);
  background: none;
  border: none;
  cursor: pointer;
}

.mode-btn:hover { color: var(--color-ink); }

.mode-btn.on {
  background: var(--color-paper);
  color: var(--color-ink);
  box-shadow: 0 1px 2px oklch(0% 0 0 / 0.05);
}

.mem-state {
  display: flex;
  align-items: center;
  gap: 28px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--color-ink-3);
  letter-spacing: 0.05em;
  padding-top: 22px;
  margin-top: 24px;
  border-top: 1px solid var(--color-rule-2);
}

.mem-state b {
  color: var(--color-ink);
  font-weight: var(--weight-medium);
  font-family: var(--font-serif);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  margin-right: 6px;
  vertical-align: -1px;
}

.ms-end {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-ink-4);
  font-style: italic;
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0;
}

.ms-end::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-moss);
  box-shadow: 0 0 0 3px oklch(52% 0.075 155 / 0.18);
  flex: none;
}

/* Layout Arborescence */
.mem-layout {
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
  gap: 72px;
  padding-top: 36px;
  align-items: start;
}

/* No piste selected */
.no-piste {
  padding: 80px 0;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 15px;
  color: var(--color-ink-4);
}

/* Graph mode */
.mem-graph {
  padding-top: 32px;
}
</style>
