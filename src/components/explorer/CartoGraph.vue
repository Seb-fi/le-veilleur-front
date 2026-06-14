<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { CartoData, CartoNode } from '../../api/explorer'

const props = defineProps<{ data: CartoData }>()

const svgRef = ref<SVGSVGElement | null>(null)
const popupVisible = ref(false)
const popupX = ref(0)
const popupY = ref(0)
const popupNode = ref<CartoNode | null>(null)

let pulseInterval: ReturnType<typeof setInterval> | null = null

const AXIS_COLOR: Record<string, string> = {
  'Pro · Data':       'oklch(58% 0.12 195)',
  'Pro · Dev':        'oklch(55% 0.10 145)',
  'Pro · Boulot':     'oklch(68% 0.12 75)',
  'Signaux faibles':  'oklch(38% 0.09 265)',
}

const STRENGTH_CFG = {
  strong: { w: 1.2, op: 0.42, dash: '' },
  medium: { w: 0.8, op: 0.28, dash: '' },
  weak:   { w: 0.6, op: 0.22, dash: '3 4' },
}

function buildSVGContent(): string {
  const { nodes, links } = props.data
  const W = 1200, H = 900

  // Cluster halos
  const clusters: Record<string, CartoNode[]> = {}
  nodes.forEach(n => {
    ;(clusters[n.axis] = clusters[n.axis] || []).push(n)
  })

  let halos = '<g class="cluster-halos">'
  Object.entries(clusters).forEach(([axis, ns]) => {
    const xs = ns.map(n => n.x), ys = ns.map(n => n.y)
    const cx = xs.reduce((a, b) => a + b, 0) / xs.length
    const cy = ys.reduce((a, b) => a + b, 0) / ys.length
    const r = Math.max(...ns.map(n => Math.hypot(n.x - cx, n.y - cy) + n.size)) + 60
    const color = AXIS_COLOR[axis] ?? 'oklch(38% 0.09 265)'
    halos += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity=".035"/>`
    const labelY = cy < H / 2 ? cy - r + 26 : cy + r - 12
    halos += `<text x="${cx}" y="${labelY}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="${color}" opacity=".5" letter-spacing="3" font-weight="500">${axis.toUpperCase()}</text>`
  })
  halos += '</g>'

  // Links
  let linksSVG = '<g class="carto-links">'
  links.forEach(([a, b, s]) => {
    const na = nodes.find(n => n.id === a)
    const nb = nodes.find(n => n.id === b)
    if (!na || !nb) return
    const cfg = STRENGTH_CFG[s] ?? STRENGTH_CFG.medium
    const sameAxis = na.axis === nb.axis
    const color = sameAxis ? (AXIS_COLOR[na.axis] ?? 'oklch(45% 0.015 270)') : 'oklch(45% 0.015 270)'
    linksSVG += `<line class="carto-link" data-a="${a}" data-b="${b}" x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}" stroke="${color}" stroke-width="${cfg.w}" stroke-dasharray="${cfg.dash}" opacity="${cfg.op}"/>`
  })
  linksSVG += '</g>'

  // Nodes
  let nodesSVG = '<g class="carto-nodes">'
  nodes.forEach(n => {
    const color = AXIS_COLOR[n.axis] ?? 'oklch(38% 0.09 265)'
    const isHigh = n.interest === 'high'
    const isLow = n.interest === 'low'
    const haloOp = isHigh ? 0.15 : n.interest === 'med' ? 0.08 : 0.045
    const strokeWidth = isHigh ? 2 : 1.3
    const strokeOp = isHigh ? 1 : n.interest === 'med' ? 0.7 : 0.42

    nodesSVG += `<g class="cnode" data-id="${n.id}" transform="translate(${n.x} ${n.y})" style="cursor:pointer">
      <circle class="cn-ring" r="${n.size + 6}" fill="${color}" opacity="0"/>
      <circle class="cn-halo" r="${n.size + 2}" fill="${color}" opacity="${haloOp}"/>
      <circle class="cn-core" r="${n.size}" fill="oklch(99% 0.005 85)" stroke="${color}" stroke-width="${strokeWidth}" stroke-opacity="${strokeOp}"/>
      ${isHigh ? `<circle r="3.5" fill="${color}" opacity=".9"/>` : ''}
    </g>`

    const lines = n.label.split('\n')
    const labelOp = isLow ? 0.55 : 1
    nodesSVG += `<g transform="translate(${n.x} ${n.y + n.size + 18})" style="pointer-events:none" opacity="${labelOp}">
      ${lines.map((l, i) => `<text text-anchor="middle" y="${i * 14}" font-family="Newsreader, serif" font-size="13" font-weight="500" fill="oklch(22% 0.012 270)">${l}</text>`).join('')}
      <text text-anchor="middle" y="${lines.length * 14 + 2}" font-family="IBM Plex Mono, monospace" font-size="9.5" fill="oklch(55% 0.008 270)" letter-spacing=".05em">${n.articles.toUpperCase()}</text>
    </g>`
  })
  nodesSVG += '</g>'

  return halos + linksSVG + nodesSVG
}

function attachInteractions() {
  const svg = svgRef.value
  if (!svg) return
  const { nodes, links } = props.data

  svg.querySelectorAll<SVGGElement>('.cnode').forEach(g => {
    const id = g.dataset.id!
    const node = nodes.find(n => n.id === id)
    if (!node) return

    g.addEventListener('mouseenter', (e) => {
      popupNode.value = node
      popupVisible.value = true

      g.querySelector<SVGCircleElement>('.cn-ring')?.setAttribute('opacity', '.18')

      const connected = new Set([id])
      links.forEach(([a, b]) => {
        if (a === id) connected.add(b)
        if (b === id) connected.add(a)
      })

      svg.querySelectorAll<SVGGElement>('.cnode').forEach(other => {
        if (!connected.has(other.dataset.id!)) other.style.opacity = '.32'
      })
      svg.querySelectorAll<SVGLineElement>('.carto-link').forEach(l => {
        const linked = l.dataset.a === id || l.dataset.b === id
        l.style.opacity = linked ? '.7' : '.06'
      })

      const rect = svg.closest('.carto')!.getBoundingClientRect()
      const mouseEvent = e as MouseEvent
      const x = mouseEvent.clientX - rect.left + 14
      const y = mouseEvent.clientY - rect.top + 14
      popupX.value = Math.min(x, rect.width - 280)
      popupY.value = Math.min(y, rect.height - 160)
    })

    g.addEventListener('mousemove', (e) => {
      const rect = svg.closest('.carto')!.getBoundingClientRect()
      const x = (e as MouseEvent).clientX - rect.left + 14
      const y = (e as MouseEvent).clientY - rect.top + 14
      popupX.value = Math.min(x, rect.width - 280)
      popupY.value = Math.min(y, rect.height - 160)
    })

    g.addEventListener('mouseleave', () => {
      popupVisible.value = false
      popupNode.value = null
      g.querySelector<SVGCircleElement>('.cn-ring')?.setAttribute('opacity', '0')
      svg.querySelectorAll<SVGGElement>('.cnode').forEach(o => { o.style.opacity = '' })
      svg.querySelectorAll<SVGLineElement>('.carto-link').forEach(l => { l.style.opacity = '' })
    })
  })

  let t = 0
  pulseInterval = setInterval(() => {
    t += 0.02
    svg.querySelectorAll<SVGLineElement>('.carto-link').forEach((l, i) => {
      if (l.style.opacity) return
      const base = parseFloat(l.getAttribute('opacity') ?? '0.25')
      const phase = Math.sin(t + i * 0.3) * 0.04
      l.setAttribute('opacity', Math.max(0.08, base + phase).toFixed(2))
    })
  }, 90)
}

onMounted(() => {
  if (svgRef.value) {
    svgRef.value.setAttribute('viewBox', '0 0 1200 900')
    svgRef.value.innerHTML = buildSVGContent()
    attachInteractions()
  }
})

onUnmounted(() => {
  if (pulseInterval) clearInterval(pulseInterval)
})
</script>

<template>
  <div class="carto">
    <svg
      ref="svgRef"
      class="carto-canvas"
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid meet"
    />

    <div class="carto-overlay">
      <div>
        <div class="carto-title">Carte des <em>sujets</em></div>
        <div class="carto-sub">{{ data.nodes.length }} sujets actifs · organisé selon votre profil</div>
      </div>
      <div class="carto-legend">
        <h4>Légende</h4>
        <div class="legend-items">
          <div v-for="(color, axis) in {'Pro · Data': 'data', 'Pro · Dev': 'dev', 'Pro · Boulot': 'boulot', 'Signaux faibles': 'faibles'}" :key="axis" class="legend-item">
            <span class="legend-dot" :class="axis.toLowerCase().replace(/\s·\s/g, '-').replace(/\s/g, '-')" />
            <span>{{ axis }}</span>
          </div>
        </div>
        <div class="legend-links">
          <div class="link-sample strong" /><span>Fort</span>
          <div class="link-sample medium" /><span>Moyen</span>
          <div class="link-sample weak" /><span>Faible</span>
        </div>
      </div>
    </div>

    <div
      v-if="popupVisible && popupNode"
      class="carto-pop show"
      :style="{ left: popupX + 'px', top: popupY + 'px' }"
    >
      <div class="pop-title">{{ popupNode.label.replace(/\n/g, ' ') }}</div>
      <div class="pop-meta">
        <span>{{ popupNode.articles }}</span>
        <span class="dot-sep" />
        <span>{{ popupNode.axis }}</span>
      </div>
      <p class="pop-desc">{{ popupNode.desc }}</p>
    </div>

    <div class="carto-hint">
      Survoler un nœud pour explorer les connexions
    </div>
  </div>
</template>

<style scoped>
.carto {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg);
}

.carto-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.carto-overlay {
  position: absolute;
  top: 24px;
  left: 32px;
  right: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
  z-index: 3;
}

.carto-title {
  font-family: var(--font-serif);
  font-size: 34px;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--color-ink);
}

.carto-title em {
  font-style: italic;
  color: var(--color-indigo);
}

.carto-sub {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-3);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-top: 6px;
}

.carto-legend {
  background: oklch(99% 0.005 85 / 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  pointer-events: auto;
  min-width: 180px;
}

.carto-legend h4 {
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--color-ink-4);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--color-ink-2);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.legend-dot.pro---data     { background: oklch(58% 0.12 195); }
.legend-dot.pro---dev      { background: oklch(55% 0.10 145); }
.legend-dot.pro---boulot   { background: oklch(68% 0.12 75); }
.legend-dot.signaux-faibles { background: oklch(38% 0.09 265); }

.legend-links {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 4px 8px;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-3);
  border-top: 1px solid var(--color-rule-2);
  padding-top: 10px;
}

.link-sample {
  height: 1px;
  background: var(--color-ink-3);
}

.link-sample.strong { opacity: 0.8; }
.link-sample.medium { opacity: 0.5; }
.link-sample.weak   { opacity: 0.35; border-top: 1px dashed var(--color-ink-3); background: none; height: 0; }

.carto-pop {
  position: absolute;
  width: 260px;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  box-shadow: 0 4px 16px oklch(0% 0 0 / 0.10);
  z-index: 10;
  pointer-events: none;
}

.pop-title {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: var(--weight-medium);
  color: var(--color-ink);
  margin-bottom: 6px;
  line-height: 1.3;
}

.pop-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.dot-sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-ink-4);
  flex: none;
}

.pop-desc {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-ink-2);
  font-family: var(--font-sans);
  margin: 0;
}

.carto-hint {
  position: absolute;
  bottom: 24px;
  left: 32px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--color-ink-3);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  z-index: 3;
}
</style>
