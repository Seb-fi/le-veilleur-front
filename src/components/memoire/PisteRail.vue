<script setup lang="ts">
import type { Piste, PisteId, Note, DomainEvent } from '../../types'

const props = defineProps<{
  activePistes: Piste[]
  dormantPistes: Piste[]
  events: DomainEvent[]
  railPinnedNote: Note | null
  activePisteId: PisteId | null
}>()

const emit = defineEmits<{
  'select-piste': [id: PisteId]
  'add-piste': []
}>()

function dotClass(piste: Piste): string {
  if (piste.status === 'tension') return 'rose'
  const tag = piste.tags?.find(t => t.startsWith('axe'))
  if (piste.id === 'mcp') return 'indigo'
  if (piste.id === 'souv') return 'moss'
  if (piste.id === 'if') return 'amber'
  return ''
}

function pisteMetaShort(piste: Piste): string {
  const days = piste.tags?.find(t => /^\d+\s*j/.test(t)) ??
               piste.tags?.find(t => /\d+\s*mois/.test(t)) ?? ''
  return `${days} · ${piste.traceCount}`
}

function eventKindClass(kind: string): string {
  const map: Record<string, string> = {
    announce: 'annonce',
    regulatory: 'geo',
    geopolitical: 'geo',
    release: 'annonce',
  }
  return map[kind] ?? ''
}

function eventKindLabel(kind: string): string {
  const map: Record<string, string> = {
    announce: 'Annonce',
    regulatory: 'Réglementaire',
    geopolitical: 'Géopolitique',
    release: 'Release',
  }
  return map[kind] ?? kind
}

function formatEventDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '')
}
</script>

<template>
  <aside class="mem-rail-l">

    <!-- Pistes actives -->
    <div class="rail-section">
      <div class="rail-h">
        <span>Pistes</span>
        <button class="rh-add" @click="emit('add-piste')">+ nouvelle</button>
      </div>
      <ul class="pistes">
        <li
          v-for="p in activePistes"
          :key="p.id"
          class="piste"
          :class="{ open: p.id === activePisteId }"
          @click="emit('select-piste', p.id)"
        >
          <span class="pdot" :class="dotClass(p)" />
          <span class="pname">{{ p.title }}</span>
          <span class="pmeta">{{ pisteMetaShort(p) }}</span>
        </li>
      </ul>
    </div>

    <!-- Dormantes -->
    <div v-if="dormantPistes.length" class="rail-section">
      <div class="rail-h">
        <span>Dormantes</span>
        <span class="rh-count">{{ String(dormantPistes.length).padStart(2, '0') }}</span>
      </div>
      <ul class="pistes">
        <li
          v-for="p in dormantPistes"
          :key="p.id"
          class="piste dormant"
          @click="emit('select-piste', p.id)"
        >
          <span class="pdot" />
          <span class="pname">{{ p.title }}</span>
          <span class="pmeta">{{ p.tags?.[0] ?? '' }}</span>
        </li>
      </ul>
    </div>

    <!-- Évènements récents -->
    <div v-if="events.length" class="rail-section">
      <div class="rail-h"><span>Évènements récents</span></div>
      <div class="rail-events">
        <div
          v-for="ev in events.slice(0, 4)"
          :key="ev.id"
          class="rail-event"
        >
          <div class="re-date">{{ formatEventDate(ev.occurredAt) }}</div>
          <div>
            <div class="re-name">{{ ev.name }}</div>
            <span class="re-kind" :class="eventKindClass(ev.kind)">{{ eventKindLabel(ev.kind) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Note épinglée -->
    <div v-if="railPinnedNote" class="rail-section">
      <div class="rail-h"><span>En tête</span></div>
      <div class="rail-pin">
        <div class="rp-mark">Note épinglée · piste</div>
        <p>{{ railPinnedNote.body.replace(/\*\*/g, '') }}</p>
        <span class="rp-on">sur {{ activePistes.find(p => p.id === railPinnedNote?.pisteId)?.title ?? '' }}</span>
      </div>
    </div>

  </aside>
</template>

<style scoped>
.mem-rail-l {
  display: flex;
  flex-direction: column;
  gap: 36px;
  position: sticky;
  top: 24px;
  align-self: start;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: none;
}

.mem-rail-l::-webkit-scrollbar { width: 0; }

.rail-section {
  display: flex;
  flex-direction: column;
}

.rail-h {
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--color-ink-4);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-rule-2);
  margin-bottom: 8px;
  font-weight: var(--weight-medium);
}

.rh-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.02em;
  font-weight: 400;
}

.rh-add {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-ink-3);
  letter-spacing: 0.02em;
  padding: 0;
  cursor: pointer;
  background: none;
  border: none;
  transition: color var(--motion-quick) var(--ease-out);
}

.rh-add:hover { color: var(--color-indigo); }

.pistes {
  list-style: none;
  display: flex;
  flex-direction: column;
}

.piste {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
  padding: 8px 6px 8px 4px;
  font-family: var(--font-serif);
  font-size: 14.5px;
  font-weight: 400;
  letter-spacing: -0.005em;
  color: var(--color-ink-2);
  line-height: 1.25;
  cursor: pointer;
  transition: color var(--motion-quick) var(--ease-out);
  text-wrap: pretty;
  border-radius: 3px;
}

.piste:hover { color: var(--color-ink); }
.piste:hover .pmeta { color: var(--color-ink-3); }

.piste.open { color: var(--color-ink); font-weight: var(--weight-medium); }
.piste.open .pmeta { color: var(--color-ink-3); }
.piste.open .pname::after {
  content: "";
  display: block;
  width: 18px;
  height: 1px;
  background: var(--color-indigo);
  margin-top: 4px;
}

.piste.dormant { color: var(--color-ink-4); font-style: italic; }
.piste.dormant .pdot { opacity: 0.4; }

.pdot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-ink-4);
  margin-top: 7px;
  flex: none;
}

.pdot.indigo { background: var(--color-indigo); box-shadow: 0 0 0 3px oklch(38% 0.09 265 / 0.12); }
.pdot.moss   { background: var(--color-moss); }
.pdot.amber  { background: var(--color-amber); }
.pdot.rose   { background: var(--color-rose); opacity: 0.7; }

.pmeta {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.02em;
  font-weight: 400;
  padding-top: 3px;
  font-style: normal;
  white-space: nowrap;
}

.rail-events {
  display: flex;
  flex-direction: column;
}

.rail-event {
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 10px;
  padding: 8px 0;
  font-size: 12.5px;
  line-height: 1.35;
  color: var(--color-ink-2);
  border-top: 1px solid var(--color-rule-2);
  cursor: pointer;
  transition: opacity var(--motion-quick) var(--ease-out);
}

.rail-event:first-child { border-top: 0; }
.rail-event:hover { opacity: 0.65; }

.re-date {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.04em;
  padding-top: 1px;
}

.re-name {
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.005em;
  line-height: 1.3;
  color: var(--color-ink);
  text-wrap: pretty;
}

.re-kind {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-amber);
  font-weight: var(--weight-medium);
  display: block;
  margin-top: 3px;
}

.re-kind.geo     { color: oklch(48% 0.11 65); }
.re-kind.annonce { color: var(--color-indigo); }

.rail-pin {
  padding: 14px;
  background: oklch(96% 0.015 80);
  border-left: 2px solid var(--color-amber);
  border-radius: 0 3px 3px 0;
}

.rp-mark {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-amber);
  font-weight: var(--weight-medium);
  margin-bottom: 8px;
}

.rail-pin p {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-ink);
  text-wrap: pretty;
}

.rp-on {
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--color-ink-4);
  margin-top: 8px;
  display: block;
}
</style>
