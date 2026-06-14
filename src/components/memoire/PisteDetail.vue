<script setup lang="ts">
import type { Piste, Note, NoteId } from '../../types'
import type { StreamItem as StreamTrace, StreamFilter } from '../../stores/useMemoireStore'
import PistePinned from './PistePinned.vue'
import StreamItem from './StreamItem.vue'
import PisteWhisper from './PisteWhisper.vue'

const FILTERS: StreamFilter[] = ['Tout', 'Articles', 'Notes', 'Évènements']

const props = defineProps<{
  piste: Piste
  pinnedNote: Note | null
  stream: StreamTrace[]
  streamFilter: StreamFilter
  whisperDismissed: boolean
}>()

const emit = defineEmits<{
  'update:streamFilter': [f: StreamFilter]
  'add-note': []
  'edit-note': [id: NoteId]
  'pin-note': [id: NoteId]
  'dismiss-whisper': []
}>()

function formatOpened(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000)
  return `${days} jours`
}
</script>

<template>
  <article class="mem-piste">

    <!-- Masthead -->
    <div class="piste-mast">
      <div class="pm-l">
        <span>Piste · ouverte depuis <b>{{ formatOpened(piste.openedAt) }}</b></span>
        <span>{{ piste.traceCount }} traces</span>
      </div>
      <div class="piste-actions">
        <button title="Renommer">Renommer</button>
        <button class="share-on" title="Partager">Partager</button>
        <button title="Plus">⋯</button>
      </div>
    </div>

    <!-- Title + axis + tags -->
    <h2 class="piste-title">{{ piste.title }}</h2>
    <p v-if="piste.axis" class="piste-axe">{{ piste.axis }}</p>

    <div v-if="piste.tags?.length" class="piste-tags">
      <span
        v-for="tag in piste.tags"
        :key="tag"
        class="ptag"
        :class="{
          tension: tag === 'tension active',
          axe: tag.startsWith('axe'),
        }"
      >{{ tag }}</span>
    </div>

    <!-- Pinned note -->
    <PistePinned
      v-if="pinnedNote"
      :note="pinnedNote"
      @edit="emit('edit-note', $event.id)"
    />

    <!-- Stream -->
    <div class="piste-stream">
      <div class="stream-h">
        <span>Traces chronologiques</span>
        <div class="sh-filter">
          <button
            v-for="f in FILTERS"
            :key="f"
            :class="{ on: streamFilter === f }"
            @click="emit('update:streamFilter', f)"
          >{{ f }}</button>
        </div>
      </div>

      <StreamItem
        v-for="trace in stream"
        :key="`${trace.traceKind}-${trace.id}`"
        :trace="trace"
        @edit-note="emit('edit-note', $event)"
        @pin-note="emit('pin-note', $event)"
        @open-article="() => {}"
      />

      <!-- Add note -->
      <div class="stream-add" @click="emit('add-note')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>Ajouter une note dans cette piste</span>
      </div>
    </div>

    <!-- Whisper -->
    <PisteWhisper
      v-if="!whisperDismissed"
      @dismiss="emit('dismiss-whisper')"
    />

  </article>
</template>

<style scoped>
.mem-piste {
  min-width: 0;
  max-width: 760px;
}

.piste-mast {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-3);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-rule-2);
  font-weight: var(--weight-medium);
}

.pm-l {
  display: flex;
  gap: 14px;
  align-items: baseline;
}

.pm-l b { color: var(--color-ink); font-weight: var(--weight-medium); }

.piste-actions {
  display: flex;
  gap: 2px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.piste-actions button {
  color: var(--color-ink-3);
  padding: 5px 9px;
  border-radius: 3px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.1em;
  background: none;
  border: none;
  cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out),
              color var(--motion-quick) var(--ease-out);
}

.piste-actions button:hover { background: var(--color-bg-2); color: var(--color-ink); }
.piste-actions button.share-on { background: var(--color-indigo-tint); color: var(--color-indigo); }

.piste-title {
  font-family: var(--font-serif);
  font-size: 38px;
  font-weight: 400;
  letter-spacing: -0.022em;
  line-height: 1.04;
  margin: 24px 0 12px;
  text-wrap: pretty;
  color: var(--color-ink);
}

.piste-title em { font-style: italic; color: var(--color-indigo); font-weight: 400; }

.piste-axe {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 15px;
  line-height: 1.5;
  color: var(--color-ink-3);
  margin-bottom: 22px;
  text-wrap: pretty;
  max-width: 50ch;
}

.piste-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 28px;
}

.ptag {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  padding: 3px 9px;
  border-radius: 999px;
  color: var(--color-ink-3);
  background: transparent;
  border: 1px solid var(--color-rule);
}

.ptag.tension { color: oklch(42% 0.12 25); border-color: oklch(80% 0.05 25); }
.ptag.axe     { color: var(--color-indigo); border-color: oklch(80% 0.05 265); }

.piste-stream { display: flex; flex-direction: column; }

.stream-h {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  padding-bottom: 10px;
  border-bottom: var(--border-rule);
  margin-bottom: 0;
  font-weight: var(--weight-medium);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.sh-filter {
  display: flex;
  gap: 14px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.sh-filter button {
  color: var(--color-ink-4);
  padding: 0;
  font-weight: var(--weight-medium);
  letter-spacing: 0.12em;
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--motion-quick) var(--ease-out);
}

.sh-filter button:hover { color: var(--color-ink-2); }

.sh-filter button.on {
  color: var(--color-ink);
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 0.5px;
}

.stream-add {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 0;
  color: var(--color-ink-4);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  border-bottom: 1px solid var(--color-rule-2);
  font-weight: var(--weight-medium);
  transition: color var(--motion-quick) var(--ease-out);
}

.stream-add:hover { color: var(--color-indigo); }

.stream-add svg { width: 13px; height: 13px; }
</style>
