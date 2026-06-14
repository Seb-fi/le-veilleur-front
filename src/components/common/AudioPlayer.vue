<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

defineProps<{
  title: string
  duration: string
  edition: string
  filesize: string
}>()

const WAVE_BARS = [
  { h: 40, d: 0 },    { h: 75, d: 0.1 },  { h: 55, d: 0.2 },  { h: 90, d: 0.3 },
  { h: 35, d: 0.4 },  { h: 65, d: 0.5 },  { h: 80, d: 0.15 }, { h: 45, d: 0.25 },
  { h: 70, d: 0.35 }, { h: 30, d: 0.45 }, { h: 55, d: 0.05 }, { h: 85, d: 0.2 },
  { h: 50, d: 0.3 },  { h: 72, d: 0.4 },  { h: 38, d: 0.05 }, { h: 62, d: 0.15 },
]

const SPEEDS = [0.75, 1, 1.5, 2]
const SPEED_LABELS = ['0,75×', '1×', '1,5×', '2×']

const playing = ref(false)
const speed = ref(1)
const elapsed = ref(174) // 02:54 in seconds

function parseDuration(d: string): number {
  const [m, s] = d.split(':').map(Number)
  return m * 60 + s
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

let timer: ReturnType<typeof setInterval> | null = null

function togglePlay() {
  playing.value = !playing.value
  if (playing.value) {
    timer = setInterval(() => {
      elapsed.value += speed.value
    }, 1000)
  } else {
    if (timer) clearInterval(timer)
    timer = null
  }
}

const durationSecs = computed(() => parseDuration('08:42'))
const progress = computed(() => Math.min(elapsed.value / durationSecs.value, 1))
const currentTimeLabel = computed(() => formatTime(elapsed.value))

function scrub(e: MouseEvent) {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  elapsed.value = Math.round(ratio * durationSecs.value)
}

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <section class="audio-hero">
    <button class="audio-disc" :class="{ playing }" aria-label="Écouter le briefing" @click="togglePlay">
      <span class="ad-play">
        <svg v-if="!playing" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
      </span>
    </button>

    <div class="audio-body">
      <div class="audio-meta">
        <span class="live-dot" :class="{ paused: !playing }" />
        <span>Édition du {{ edition }}</span>
        <span class="ah-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="4" y="7" width="16" height="10" rx="2"/>
            <circle cx="8" cy="19" r="1.5"/><circle cx="16" cy="19" r="1.5"/>
            <path d="M7 7l1.5-2h7L17 7"/>
          </svg>
          {{ duration }} · Format trajet
        </span>
      </div>

      <h2 class="audio-headline">{{ title }}</h2>

      <div class="audio-progress">
        <span>{{ currentTimeLabel }}</span>
        <div class="ap-bar" role="slider" :aria-valuenow="elapsed" @click="scrub">
          <div class="ap-fill" :style="{ width: progress * 100 + '%' }" />
        </div>
        <span>{{ duration }}</span>
      </div>

      <div class="audio-speed">
        <button
          v-for="(s, i) in SPEEDS"
          :key="s"
          :class="{ on: speed === s }"
          @click="speed = s"
        >{{ SPEED_LABELS[i] }}</button>
      </div>
    </div>

    <div class="audio-wave-wrap">
      <div class="audio-wave" :class="{ paused: !playing }">
        <i
          v-for="(bar, idx) in WAVE_BARS"
          :key="idx"
          :style="{ height: bar.h + '%', animationDelay: bar.d + 's' }"
        />
      </div>
      <div class="audio-filesize">{{ duration }} · {{ filesize }}</div>
    </div>
  </section>
</template>

<style scoped>
.audio-hero {
  padding: 36px 0 48px;
  border-bottom: var(--border-rule);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 32px;
  align-items: center;
}

/* ---- Disc ---- */
.audio-disc {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, oklch(48% 0.09 265), oklch(28% 0.07 270));
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  box-shadow: 0 8px 24px oklch(0% 0 0 / 0.12), inset 0 0 0 1px oklch(0% 0 0 / 0.15);
}

.audio-disc::before {
  content: "";
  position: absolute;
  inset: 12px;
  border-radius: 50%;
  border: 1px solid oklch(100% 0 0 / 0.12);
  pointer-events: none;
}

.audio-disc::after {
  content: "";
  position: absolute;
  inset: 28px;
  border-radius: 50%;
  background: var(--color-paper);
  box-shadow: inset 0 0 0 1px oklch(0% 0 0 / 0.2);
  pointer-events: none;
}

.ad-play {
  position: relative;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-paper);
  color: var(--color-ink);
  display: grid;
  place-items: center;
  transition: transform var(--motion-base) var(--ease-out);
}

.ad-play svg { width: 14px; height: 14px; }
.audio-disc:hover .ad-play { transform: scale(1.06); }

/* ---- Body ---- */
.audio-meta {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-amber);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-amber);
  box-shadow: 0 0 0 4px oklch(68% 0.12 75 / 0.18);
  animation: pulse 2.2s infinite ease-in-out;
  flex: none;
}

.live-dot.paused { animation-play-state: paused; }

.ah-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 3px;
  background: var(--color-amber-tint);
  color: oklch(42% 0.1 65);
  letter-spacing: 0.12em;
  font-size: 9.5px;
  font-weight: var(--weight-medium);
}

.ah-chip svg { width: 13px; height: 13px; flex: none; }

.audio-headline {
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: var(--weight-medium);
  letter-spacing: -0.012em;
  line-height: 1.22;
  margin-bottom: 14px;
  text-wrap: pretty;
  max-width: 32ch;
  color: var(--color-ink);
}

.audio-progress {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--color-ink-3);
  max-width: 480px;
}

.ap-bar {
  flex: 1;
  height: 2px;
  background: var(--color-rule);
  position: relative;
  cursor: pointer;
}

.ap-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--color-ink);
  transition: width 1s linear;
}

.ap-fill::after {
  content: "";
  position: absolute;
  right: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-ink);
}

.audio-speed {
  display: flex;
  gap: 14px;
  margin-top: 14px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.05em;
  color: var(--color-ink-4);
}

.audio-speed button { color: var(--color-ink-4); }
.audio-speed button:hover { color: var(--color-ink-2); }
.audio-speed button.on {
  color: var(--color-ink);
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
}

/* ---- Wave ---- */
.audio-wave-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex: none;
}

.audio-wave {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 62px;
}

.audio-wave i {
  display: block;
  width: 3px;
  background: var(--color-indigo);
  opacity: 0.6;
  border-radius: 1px;
  animation: wave 1.4s infinite ease-in-out;
}

.audio-wave.paused i { animation-play-state: paused; }

.audio-filesize {
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--color-ink-4);
  letter-spacing: 0.05em;
}
</style>
