<script setup lang="ts">
import type { NoteId } from '../../types'
import type { StreamItem } from '../../stores/useMemoireStore'

const props = defineProps<{ trace: StreamItem }>()
const emit = defineEmits<{
  'edit-note': [id: NoteId]
  'pin-note': [id: NoteId]
  'open-article': [id: string]
}>()

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const day = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '')
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${day}|${time}`
}

function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '')
}

function kindLabel(k: string): string {
  const m: Record<string, string> = { announce: 'annonce', regulatory: 'réglementaire', geopolitical: 'géopolitique', release: 'release' }
  return m[k] ?? k
}
</script>

<template>
  <!-- NOTE -->
  <article v-if="trace.traceKind === 'note'" class="stream-item is-note">
    <div class="si-date">
      <b>{{ fmtDate(trace.createdAt).split('|')[0] }}</b>
      {{ fmtDate(trace.createdAt).split('|')[1] }}
    </div>
    <div class="si-body">
      <div class="si-kind note">Note</div>
      <p class="si-text">{{ trace.body.replace(/\*\*/g, '') }}</p>
    </div>
    <div class="si-actions">
      <button title="Éditer" @click.stop="emit('edit-note', trace.id)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4z" />
        </svg>
      </button>
      <button title="Épingler" @click.stop="emit('pin-note', trace.id)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M12 2v15M9 7l3-5 3 5M8 22h8" />
        </svg>
      </button>
    </div>
  </article>

  <!-- ARTICLE -->
  <article v-else-if="trace.traceKind === 'article'" class="stream-item is-article">
    <div class="si-date">
      <b>{{ fmtDate(trace.savedAt).split('|')[0] }}</b>
      {{ fmtDate(trace.savedAt).split('|')[1] }}
    </div>
    <div class="si-body">
      <div class="si-kind article">Article sauvegardé</div>
      <h4>{{ trace.title }}</h4>
      <div class="si-src">
        <b>{{ trace.source }}</b>
        <span class="sep" />
        <span>gardé actif</span>
        <template v-if="trace.userNote">
          <span class="sep" />
          <span class="pinned-ico">note attachée</span>
        </template>
      </div>
      <div v-if="trace.userNote" class="si-mynote">
        <span class="mn-mark">votre note</span>{{ trace.userNote.replace(/\*/g, '') }}
      </div>
    </div>
    <div class="si-actions">
      <button title="Ouvrir" @click.stop="emit('open-article', trace.id)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M7 17L17 7M17 7H8M17 7v9" />
        </svg>
      </button>
      <button title="Épingler">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M12 2v15M9 7l3-5 3 5M8 22h8" />
        </svg>
      </button>
    </div>
  </article>

  <!-- EVENT -->
  <article v-else-if="trace.traceKind === 'event'" class="stream-item is-event">
    <div class="si-date">
      <b>{{ fmtDay(trace.occurredAt) }}</b>
    </div>
    <div class="si-body">
      <div class="si-kind event">Évènement · {{ kindLabel(trace.kind) }}</div>
      <h4>{{ trace.name }}</h4>
      <div v-if="trace.source" class="si-src">
        <b>{{ trace.source }}</b>
      </div>
    </div>
    <div class="si-actions">
      <button title="Lier">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M10 14a3 3 0 004 0l4-4a3 3 0 00-4-4l-1 1M14 10a3 3 0 00-4 0l-4 4a3 3 0 004 4l1-1" />
        </svg>
      </button>
      <button title="Épingler">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M12 2v15M9 7l3-5 3 5M8 22h8" />
        </svg>
      </button>
    </div>
  </article>
</template>

<style scoped>
.stream-item {
  display: grid;
  grid-template-columns: 62px 1fr;
  gap: 22px;
  padding: 20px 0;
  border-bottom: 1px solid var(--color-rule-2);
  cursor: pointer;
  transition: padding-left var(--motion-quick) var(--ease-out),
              background var(--motion-quick) var(--ease-out);
  position: relative;
}

.stream-item:hover {
  padding-left: 8px;
  background: linear-gradient(to right, var(--color-bg-2), transparent 60%);
}

.stream-item:hover .si-actions { opacity: 1; }

.si-date {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.04em;
  line-height: 1.5;
  padding-top: 2px;
}

.si-date b {
  display: block;
  color: var(--color-ink-2);
  font-weight: var(--weight-medium);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13px;
  letter-spacing: 0;
  margin-bottom: 2px;
}

.si-body { min-width: 0; }

.si-kind {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  font-weight: var(--weight-medium);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 7px;
}

.si-kind::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  flex: none;
}

.si-kind.note    { color: var(--color-indigo); }
.si-kind.article { color: var(--color-ink-3); }
.si-kind.event   { color: var(--color-amber); }

.is-note p.si-text {
  font-family: var(--font-serif);
  font-size: 16px;
  line-height: 1.55;
  color: var(--color-ink);
  text-wrap: pretty;
  font-style: italic;
  margin: 0;
}

.is-note p.si-text::before {
  content: "\201C";
  color: var(--color-ink-4);
  font-size: 24px;
  font-style: normal;
  line-height: 0;
  margin-right: 4px;
  vertical-align: -7px;
}

.is-note p.si-text::after {
  content: "\201D";
  color: var(--color-ink-4);
  font-size: 24px;
  font-style: normal;
  line-height: 0;
  margin-left: 2px;
  vertical-align: -7px;
}

.stream-item h4 {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.01em;
  line-height: 1.25;
  margin-bottom: 6px;
  color: var(--color-ink);
  text-wrap: pretty;
}

.is-event h4 em {
  font-style: normal;
  background: linear-gradient(transparent 60%, oklch(94% 0.035 85) 60%);
  padding: 0 2px;
}

.si-src {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--color-ink-4);
  letter-spacing: 0.02em;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.si-src b { color: var(--color-ink-2); font-weight: var(--weight-medium); }

.sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-ink-4);
  flex: none;
}

.pinned-ico {
  color: var(--color-amber);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: var(--weight-medium);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.si-mynote {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 14.5px;
  line-height: 1.5;
  color: var(--color-ink-2);
  padding: 8px 0 0 16px;
  border-left: 1px solid var(--color-rule);
  text-wrap: pretty;
  margin-top: 8px;
}

.mn-mark {
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  font-weight: var(--weight-medium);
  margin-right: 8px;
}

.si-actions {
  position: absolute;
  top: 18px;
  right: 0;
  display: flex;
  gap: 1px;
  opacity: 0;
  transition: opacity var(--motion-quick) var(--ease-out);
}

.si-actions button {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: grid;
  place-items: center;
  color: var(--color-ink-4);
  background: none;
  border: none;
  cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out),
              color var(--motion-quick) var(--ease-out);
}

.si-actions button:hover { background: var(--color-paper); color: var(--color-ink); }

.si-actions svg { width: 13px; height: 13px; }
</style>
