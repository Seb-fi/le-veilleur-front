<script setup lang="ts">
import { computed } from 'vue'
import { useMemoireStore } from '../../stores/useMemoireStore'
import type { NotesGrouping } from '../../stores/useMemoireStore'
import type { Note, ArticleId, PisteId } from '../../types'
import NoteCard from './NoteCard.vue'
import MemIcon from './MemIcon.vue'

const store = useMemoireStore()

function fold(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Recherche accent-insensible sur le texte de la note + titre/source d'article + nom de piste.
const matching = computed<Note[]>(() => {
  const q = fold(store.notesSearch.trim())
  if (!q) return store.notes
  return store.notes.filter((n) => {
    if (fold(n.texte).includes(q)) return true
    if (n.kind === 'fav') {
      const a = store.favoriById(n.targetId as ArticleId)
      if (a && (fold(a.titre).includes(q) || fold(a.source).includes(q))) return true
      // pistes dérivées
      return store.derivedPistesOfNote(n).some((id) => {
        const p = store.pisteById(id)
        return p ? fold(p.nom).includes(q) : false
      })
    }
    const p = store.pisteById(n.targetId as PisteId)
    return p ? fold(p.nom).includes(q) : false
  })
})

const GROUPINGS: { id: NotesGrouping; label: string }[] = [
  { id: 'toutes', label: 'Toutes' },
  { id: 'piste', label: 'Par piste' },
  { id: 'article', label: 'Par article' },
]

// --- Par piste : une note d'article réapparaît sous chaque piste dérivée -----
interface PisteSection { key: string; label: string; couleur?: string; notes: Note[] }

const byPiste = computed<PisteSection[]>(() => {
  const sections: PisteSection[] = []
  for (const p of store.pistes) {
    const notes = matching.value.filter((n) => {
      if (n.kind === 'piste') return n.targetId === p.id
      return store.derivedPistesOfNote(n).includes(p.id)
    })
    if (notes.length) sections.push({ key: p.id, label: p.nom, couleur: p.couleur, notes })
  }
  const orphans = matching.value.filter(
    (n) => n.kind === 'fav' && store.derivedPistesOfNote(n).length === 0,
  )
  if (orphans.length) sections.push({ key: '__orphans', label: 'Articles non associés', notes: orphans })
  return sections
})

const byArticle = computed<PisteSection[]>(() => {
  const sections: PisteSection[] = []
  const articleNotes = matching.value.filter((n) => n.kind === 'fav')
  const seen = new Set<string>()
  for (const n of articleNotes) {
    if (seen.has(n.targetId)) continue
    seen.add(n.targetId)
    const a = store.favoriById(n.targetId as ArticleId)
    const notes = articleNotes.filter((x) => x.targetId === n.targetId)
    sections.push({ key: n.targetId, label: a?.titre ?? 'Article', notes })
  }
  const pisteNotes = matching.value.filter((n) => n.kind === 'piste')
  if (pisteNotes.length) {
    sections.push({ key: '__pistes', label: 'Notes de piste (sans article)', notes: pisteNotes })
  }
  return sections
})
</script>

<template>
  <div class="nl-wrap">
    <div class="nl-head">
      <label class="nl-search">
        <MemIcon name="search" :size="14" />
        <input
          v-model="store.notesSearch"
          type="search"
          placeholder="Chercher dans vos notes…"
          aria-label="Chercher dans vos notes"
        />
      </label>
      <div class="nl-seg" role="tablist" aria-label="Regroupement des notes">
        <button
          v-for="g in GROUPINGS"
          :key="g.id"
          type="button"
          role="tab"
          :aria-selected="store.notesGrouping === g.id"
          :class="{ on: store.notesGrouping === g.id }"
          @click="store.notesGrouping = g.id"
        >{{ g.label }}</button>
      </div>
    </div>

    <div class="nl-body">
      <div v-if="store.notesGrouping === 'toutes'" class="nl-grid">
        <NoteCard v-for="n in matching" :key="n.id" :note="n" />
        <p v-if="!matching.length" class="nl-empty">Aucune note.</p>
      </div>

      <template v-else-if="store.notesGrouping === 'piste'">
        <section v-for="s in byPiste" :key="s.key" class="nl-section">
          <div class="nl-section-head">
            <span v-if="s.couleur" class="nl-sdot" :style="{ background: `var(--color-${s.couleur})` }" />
            {{ s.label }} <span class="nl-scount">{{ s.notes.length }}</span>
          </div>
          <div class="nl-grid">
            <NoteCard v-for="n in s.notes" :key="n.id + s.key" :note="n" />
          </div>
        </section>
        <p v-if="!byPiste.length" class="nl-empty">Aucune note.</p>
      </template>

      <template v-else>
        <section v-for="s in byArticle" :key="s.key" class="nl-section">
          <div class="nl-section-head">{{ s.label }} <span class="nl-scount">{{ s.notes.length }}</span></div>
          <div class="nl-grid">
            <NoteCard v-for="n in s.notes" :key="n.id + s.key" :note="n" />
          </div>
        </section>
        <p v-if="!byArticle.length" class="nl-empty">Aucune note.</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.nl-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.nl-search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--mem-radius-card);
  padding: 9px 13px;
  color: var(--color-ink-3);
  max-width: 420px;
}
.nl-search:focus-within {
  outline: 2px solid var(--color-indigo-tint);
}
.nl-search input {
  flex: 1;
  border: none;
  background: none;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--color-ink);
}
.nl-search input:focus {
  outline: none;
}
.nl-seg {
  display: flex;
  background: var(--color-bg-2);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-pill);
  padding: 3px;
  margin-left: auto;
}
.nl-seg button {
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  min-height: 30px;
}
.nl-seg button.on {
  background: var(--color-paper);
  color: var(--color-ink);
  box-shadow: var(--shadow-hover);
}
.nl-section {
  margin-bottom: 26px;
}
.nl-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  margin-bottom: 12px;
  padding-bottom: 7px;
  border-bottom: 1px solid var(--color-rule-2);
}
.nl-sdot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.nl-scount {
  color: var(--color-ink-4);
}
.nl-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 13px;
  align-items: start;
}
.nl-empty {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 14px;
  color: var(--color-ink-4);
  padding: 40px 0;
}
@media (max-width: 1100px) {
  .nl-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .nl-grid {
    grid-template-columns: 1fr;
  }
  .nl-head {
    flex-wrap: wrap;
  }
}
</style>
