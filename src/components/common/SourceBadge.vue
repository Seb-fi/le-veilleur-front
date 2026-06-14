<script setup lang="ts">
import { computed } from 'vue'

interface SourceMark {
  mono: string
  cls: string
  small?: boolean
  serif?: boolean
}

const SOURCE_MARKS: Record<string, SourceMark> = {
  'Pinterest Engineering': { mono: 'P',  cls: 'sb-pinterest' },
  'Pinterest Eng':         { mono: 'P',  cls: 'sb-pinterest' },
  'Google DeepMind Blog':  { mono: 'G',  cls: 'sb-deepmind' },
  'OpenAI Blog':           { mono: '⚬', cls: 'sb-openai' },
  'OpenAI':                { mono: '⚬', cls: 'sb-openai' },
  'The New Stack':         { mono: 'N',  cls: 'sb-newstack' },
  'a16z':                  { mono: 'a',  cls: 'sb-a16z', small: true },
  'Anthropic Research':    { mono: 'A',  cls: 'sb-anthropic' },
  'Anthropic':             { mono: 'A',  cls: 'sb-anthropic' },
  'Politico EU':           { mono: 'P',  cls: 'sb-politico' },
  'The Information':       { mono: 'I',  cls: 'sb-information', serif: true },
  'GitHub Advisory':       { mono: '◔', cls: 'sb-github' },
  'Reuters':               { mono: 'R',  cls: 'sb-reuters' },
}

const props = defineProps<{
  source: string
  veilleur?: boolean
  size?: 'lg'
}>()

const mark = computed<SourceMark>(
  () => SOURCE_MARKS[props.source] ?? { mono: (props.source ?? '?').charAt(0).toUpperCase(), cls: 'sb-default' }
)
</script>

<template>
  <span v-if="veilleur" class="src-badge src-badge--veilleur" :class="size">
    <span class="sb-mark sb-mark--veilleur" title="Synthèse Le Veilleur">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <circle cx="4" cy="6" r="1.4" fill="currentColor" opacity=".7"/>
        <circle cx="20" cy="7" r="1.4" fill="currentColor" opacity=".7"/>
        <circle cx="5" cy="19" r="1.4" fill="currentColor" opacity=".7"/>
        <circle cx="19" cy="19" r="1.4" fill="currentColor" opacity=".7"/>
        <line x1="12" y1="12" x2="4" y2="6"/>
        <line x1="12" y1="12" x2="20" y2="7"/>
        <line x1="12" y1="12" x2="5" y2="19"/>
        <line x1="12" y1="12" x2="19" y2="19"/>
      </svg>
    </span>
    <span class="sb-name">{{ source }}</span>
  </span>

  <span v-else class="src-badge" :class="size">
    <span
      class="sb-mark"
      :class="[mark.cls, { 'sb-mark--small': mark.small, 'sb-mark--serif': mark.serif }]"
    >{{ mark.mono }}</span>
    <span class="sb-name">{{ source }}</span>
  </span>
</template>

<style scoped>
.src-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: var(--color-ink-2);
  font-weight: var(--weight-medium);
}

.src-badge--veilleur {
  color: var(--color-indigo);
}

.src-badge.lg .sb-mark { width: 22px; height: 22px; font-size: 11.5px; }
.src-badge.lg { font-size: 12px; }

.sb-mark {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex: none;
  font-family: var(--font-serif);
  font-size: 10px;
  font-weight: var(--weight-semibold);
  letter-spacing: 0;
  line-height: 1;
  color: white;
  background: var(--color-ink-2);
  box-shadow: inset 0 0 0 1px oklch(0% 0 0 / 0.1);
}

.sb-mark--veilleur {
  background: transparent;
  color: var(--color-indigo);
  border: 1px solid var(--color-indigo);
  width: 18px;
  height: 18px;
}

.sb-mark--veilleur svg {
  width: 11px;
  height: 11px;
}

.sb-mark--small { font-size: 7.5px; letter-spacing: 0; }
.sb-mark--serif { font-family: var(--font-serif); font-style: italic; font-size: 12px; }

.sb-name { white-space: nowrap; }

/* Source colors */
.sb-pinterest  { background: oklch(54% 0.16 25); }
.sb-deepmind   { background: oklch(48% 0.14 250); }
.sb-openai     { background: oklch(38% 0.03 160); }
.sb-newstack   { background: oklch(50% 0.14 30); }
.sb-a16z       { background: oklch(24% 0.02 270); }
.sb-anthropic  { background: oklch(58% 0.12 60); }
.sb-politico   { background: oklch(40% 0.14 25); }
.sb-information{ background: oklch(38% 0.04 30); }
.sb-github     { background: oklch(20% 0.01 270); }
.sb-reuters    { background: oklch(48% 0.16 30); }
.sb-default    { background: var(--color-ink-2); }
</style>
