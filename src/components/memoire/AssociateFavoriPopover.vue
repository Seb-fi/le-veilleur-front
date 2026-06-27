<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import type { Favori, PisteId, ArticleId } from '../../types'
import MemIcon from './MemIcon.vue'

const props = defineProps<{ pisteId: PisteId; favorites: Favori[] }>()
const emit = defineEmits<{
  (e: 'toggle', articleId: ArticleId): void
  (e: 'close'): void
}>()

const root = ref<HTMLElement | null>(null)
const search = ref('')
const onlyUnassoc = ref(false)

function fold(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const list = computed<Favori[]>(() => {
  let l = props.favorites
  if (onlyUnassoc.value) l = l.filter((f) => !f.pisteIds.includes(props.pisteId))
  const q = fold(search.value.trim())
  if (q) l = l.filter((f) => fold(f.titre).includes(q) || fold(f.source).includes(q))
  return l
})

function isOn(f: Favori): boolean {
  return f.pisteIds.includes(props.pisteId)
}

function onPointerDown(ev: PointerEvent) {
  if (root.value && !root.value.contains(ev.target as Node)) emit('close')
}
function onKey(ev: KeyboardEvent) {
  if (ev.key === 'Escape') emit('close')
}
onMounted(() => {
  setTimeout(() => document.addEventListener('pointerdown', onPointerDown), 0)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="popf" role="dialog" aria-label="Associer un favori">
    <label class="popf-search">
      <MemIcon name="search" :size="13" />
      <input v-model="search" type="search" placeholder="Chercher un favori…" aria-label="Chercher un favori" />
    </label>
    <div class="popf-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        :aria-selected="!onlyUnassoc"
        :class="{ on: !onlyUnassoc }"
        @click="onlyUnassoc = false"
      >Tous</button>
      <button
        type="button"
        role="tab"
        :aria-selected="onlyUnassoc"
        :class="{ on: onlyUnassoc }"
        @click="onlyUnassoc = true"
      >Pas encore associés</button>
    </div>
    <ul class="popf-list">
      <li v-for="f in list" :key="f.articleId">
        <button type="button" class="popf-row" role="checkbox" :aria-checked="isOn(f)" @click="emit('toggle', f.articleId)">
          <span class="popf-check" :class="{ on: isOn(f) }">
            <MemIcon v-if="isOn(f)" name="check" :size="11" />
          </span>
          <span class="popf-body">
            <span class="popf-title">{{ f.titre }}</span>
            <span class="popf-source">{{ f.source }} · {{ f.date }}</span>
          </span>
        </button>
      </li>
      <li v-if="!list.length" class="popf-empty">Aucun favori.</li>
    </ul>
  </div>
</template>

<style scoped>
.popf {
  position: absolute;
  z-index: 30;
  top: calc(100% + 6px);
  right: 0;
  width: 300px;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--mem-radius-pop);
  box-shadow: var(--shadow-popover);
  padding: 12px;
}
.popf-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-rule);
  border-radius: var(--mem-radius-card);
  padding: 7px 10px;
  color: var(--color-ink-3);
}
.popf-search input {
  flex: 1;
  border: none;
  background: none;
  font-family: var(--font-sans);
  font-size: 12.5px;
  color: var(--color-ink);
}
.popf-search input:focus {
  outline: none;
}
.popf-tabs {
  display: flex;
  gap: 4px;
  margin: 8px 0;
}
.popf-tabs button {
  border: 1px solid var(--color-rule);
  background: none;
  border-radius: var(--radius-pill);
  padding: 4px 10px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-3);
  cursor: pointer;
}
.popf-tabs button.on {
  background: var(--color-indigo-tint);
  border-color: transparent;
  color: var(--color-indigo);
}
.popf-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 228px;
  overflow-y: auto;
}
.popf-row {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  padding: 7px 6px;
  border-radius: var(--mem-radius-card);
  text-align: left;
  transition: background 0.14s;
}
.popf-row:hover {
  background: var(--color-bg-2);
}
.popf-check {
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 5px;
  border: 1px solid var(--color-ink-4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-paper);
  margin-top: 1px;
}
.popf-check.on {
  background: var(--color-indigo);
  border-color: var(--color-indigo);
}
.popf-body {
  min-width: 0;
}
.popf-title {
  display: block;
  font-family: var(--font-serif);
  font-size: 13px;
  line-height: 1.25;
  color: var(--color-ink);
}
.popf-source {
  display: block;
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-ink-4);
  margin-top: 2px;
}
.popf-empty {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 12.5px;
  color: var(--color-ink-4);
  padding: 12px 6px;
}
</style>
