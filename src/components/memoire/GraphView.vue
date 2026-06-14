<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import type { Piste, Note, Article, DomainEvent, PisteId, NoteId } from '../../types'
import { useMemoryGraph } from '../../composables/useMemoryGraph'
import { usePopover }     from '../../composables/usePopover'
import { useArticleDnD }  from '../../composables/useArticleDnD'
import ActionPopover      from './ActionPopover.vue'
import MoveLinkModal      from './MoveLinkModal.vue'

const props = defineProps<{
  pistes:   Piste[]
  notes:    Note[]
  articles: Article[]
  events:   DomainEvent[]
}>()

const emit = defineEmits<{
  'add-note':  [pisteTitle: string, pisteId: PisteId]
  'edit-note': [id: NoteId]
}>()

// ── composables ─────────────────────────────────────────────────────────────
const graph  = useMemoryGraph()
const pop    = usePopover()
const dnd    = useArticleDnD()

// ── refs ────────────────────────────────────────────────────────────────────
const frameRef = ref<HTMLDivElement | null>(null)
const svgRef   = ref<SVGSVGElement | null>(null)
const popRef   = ref<HTMLDivElement | null>(null)

// ── derived readout data ─────────────────────────────────────────────────────
const focusedPiste = computed(() =>
  props.pistes.find(p => p.id === graph.focusedId.value) ?? null
)

const focusedPinnedNote = computed(() => {
  const p = focusedPiste.value
  if (!p?.pinnedNoteId) return null
  return props.notes.find(n => n.id === p.pinnedNoteId) ?? null
})

function readoutBody(p: Piste): string {
  const days  = Math.floor((Date.now() - new Date(p.openedAt).getTime()) / 86400000)
  const count = p.traceCount
  const evts  = props.events.filter(e => e.pisteIds.includes(p.id as PisteId)).length
  let txt = `${count} traces sur ${days} jours`
  if (evts > 0) txt += `, dont ${evts} évènement${evts > 1 ? 's' : ''} récent${evts > 1 ? 's' : ''}.`
  else txt += '.'
  return txt
}

// ── static graph data (positions mirror the prototype) ───────────────────────
interface ClusterDef {
  id: string; cx: number; cy: number; r: number
  stroke: string; dotFill: string; labelFill?: string
  hasPinnedRing?: boolean; pinnedRingR?: number; pinnedRingDash?: string; pinnedRingOpacity?: number
  userEdges: string[]
  implicitEdges: string[]
  satellites: SatelliteDef[]
}

interface SatelliteDef {
  kind: 'article' | 'event' | 'note'
  sid: string; cx: number; cy: number; r: number
  label: string; meta?: string; name?: string
  labelAnchor: 'start' | 'end' | 'middle'
  lx: number; ly: number
  mlx?: number; mly?: number
  isPinned?: boolean
}

const CLUSTERS: ClusterDef[] = [
  {
    id: 'mcp', cx: 350, cy: 320, r: 24,
    stroke: 'var(--color-indigo)', dotFill: 'var(--color-indigo)',
    hasPinnedRing: true, pinnedRingR: 34,
    userEdges: [
      'M350 320 Q 280 240 220 200',
      'M350 320 Q 300 380 230 420',
      'M350 320 Q 420 250 470 200',
      'M350 320 Q 430 360 470 420',
      'M350 320 Q 290 320 230 320',
    ],
    implicitEdges: [
      'M220 200 Q 350 130 470 200',
      'M230 420 Q 350 460 470 420',
    ],
    satellites: [
      { kind: 'article', sid: 'codex',    cx: 220, cy: 200, r: 6, label: 'Codex policies', meta: 'a16z · 20 mai',         labelAnchor: 'end',   lx: 208, ly: 196, mlx: 208, mly: 210 },
      { kind: 'article', sid: 'mcpwin',   cx: 470, cy: 200, r: 6, label: 'Why MCP wins',   meta: 'Stratechery · 11 mai',  labelAnchor: 'start', lx: 482, ly: 196, mlx: 482, mly: 210 },
      { kind: 'article', sid: 'agentstk', cx: 230, cy: 420, r: 6, label: 'Agent permission stack', meta: 'The New Stack · 17 mai', labelAnchor: 'end', lx: 218, ly: 424, mlx: 218, mly: 438 },
      { kind: 'event',   sid: 'pinmcp',   cx: 470, cy: 420, r: 8, label: 'Évènement · 19 mai', name: 'Pinterest publie spec MCP', labelAnchor: 'start', lx: 484, ly: 416, mlx: 484, mly: 431 },
      { kind: 'note',    sid: 'granul',   cx: 230, cy: 320, r: 6, label: '"granularité des politiques"', labelAnchor: 'end', lx: 218, ly: 324 },
    ],
  },
  {
    id: 'souv', cx: 880, cy: 230, r: 22,
    stroke: 'var(--color-moss)', dotFill: 'var(--color-moss)',
    hasPinnedRing: true, pinnedRingR: 32, pinnedRingDash: '2 4', pinnedRingOpacity: 0.4,
    userEdges: [
      'M880 230 Q 800 180 760 130',
      'M880 230 Q 950 170 990 120',
      'M880 230 Q 970 280 1030 320',
      'M880 230 Q 820 280 780 320',
    ],
    implicitEdges: ['M760 130 Q 870 90 990 120'],
    satellites: [
      { kind: 'article', sid: 'dga',    cx: 760, cy: 130, r: 6, label: 'DGA-IA · audits',       labelAnchor: 'end',   lx: 752, ly: 118 },
      { kind: 'article', sid: 'mistral',cx: 990, cy: 120, r: 6, label: 'Mistral + souveraineté', labelAnchor: 'start', lx: 1002, ly: 118 },
      { kind: 'note',    sid: 'calend', cx: 1030, cy: 320, r: 6, label: '"calendrier serré"',    labelAnchor: 'start', lx: 1044, ly: 324 },
      { kind: 'article', sid: 'comeu',  cx: 780, cy: 320, r: 6, label: 'Commission EU',          labelAnchor: 'end',   lx: 768, ly: 324 },
    ],
  },
  {
    id: 'if', cx: 700, cy: 540, r: 20,
    stroke: 'var(--color-amber)', dotFill: 'var(--color-amber)',
    userEdges: [
      'M700 540 Q 620 590 570 640',
      'M700 540 Q 780 600 830 640',
      'M700 540 Q 660 480 620 440',
      'M700 540 Q 770 480 800 440',
    ],
    implicitEdges: ['M620 440 Q 710 460 800 440'],
    satellites: [
      { kind: 'article', sid: 'cerebras', cx: 570, cy: 640, r: 6, label: 'Cerebras IPO',     labelAnchor: 'end',   lx: 558, ly: 660 },
      { kind: 'article', sid: 'groq',     cx: 830, cy: 640, r: 6, label: 'Groq Series E',    labelAnchor: 'start', lx: 844, ly: 660 },
      { kind: 'note',    sid: 'compute',  cx: 620, cy: 440, r: 6, label: '"compute hétérogène"', labelAnchor: 'end', lx: 608, ly: 436 },
      { kind: 'article', sid: 'cernote',  cx: 800, cy: 440, r: 6, label: 'Cerebras note',    labelAnchor: 'start', lx: 814, ly: 436 },
    ],
  },
  {
    id: 'bench', cx: 300, cy: 580, r: 18,
    stroke: 'var(--color-ink-3)', dotFill: 'var(--color-ink-3)', labelFill: 'var(--color-ink-2)',
    userEdges: [
      'M300 580 Q 220 620 170 660',
      'M300 580 Q 360 630 400 670',
      'M300 580 Q 270 510 230 480',
    ],
    implicitEdges: [],
    satellites: [
      { kind: 'article', sid: 'swe',  cx: 170, cy: 660, r: 6, label: 'SWE-bench',    labelAnchor: 'end',   lx: 160, ly: 678 },
      { kind: 'article', sid: 'mmlu', cx: 400, cy: 670, r: 6, label: 'MMLU drift',   labelAnchor: 'start', lx: 414, ly: 673 },
      { kind: 'article', sid: 'helm', cx: 230, cy: 480, r: 6, label: 'HELM critique', labelAnchor: 'end',  lx: 218, ly: 476 },
    ],
  },
]

const SYSTEM_EDGES = [
  { from: 'mcp',   to: 'if',   d: 'M350 320 Q 530 280 700 540' },
  { from: 'souv',  to: 'if',   d: 'M880 230 Q 950 380 700 540' },
  { from: 'mcp',   to: 'souv', d: 'M350 320 Q 600 270 880 230' },
  { from: 'bench', to: 'if',   d: 'M300 580 Q 500 600 700 540' },
]

// ── SVG builder ──────────────────────────────────────────────────────────────
function pisteTitle(id: string): string {
  const p = props.pistes.find(x => x.id === id)
  return p?.title ?? id
}

function pisteMeta(id: string): string {
  const p = props.pistes.find(x => x.id === id)
  if (!p) return ''
  const days = Math.floor((Date.now() - new Date(p.openedAt).getTime()) / 86400000)
  return `${p.traceCount} traces · ${days} j`
}

function pisteAxisLabel(id: string): string {
  const p = props.pistes.find(x => x.id === id)
  if (!p) return ''
  if (p.status === 'dormant') return 'en sommeil'
  if (p.status === 'emerging') return 'émergente'
  return p.axis?.replace('axe · ', '') ?? ''
}

function buildSatellite(s: SatelliteDef): string {
  if (s.kind === 'article') {
    return `
      <g class="gnode gnode-article" data-article="${s.sid}" data-sat-id="${s.sid}" data-sat-kind="article">
        <circle class="gn-art-bg" cx="${s.cx}" cy="${s.cy}" r="${s.r}"/>
        <text class="gn-art-label" x="${s.lx}" y="${s.ly}" text-anchor="${s.labelAnchor}">${s.label}</text>
        ${s.meta ? `<text class="gn-piste-meta" x="${s.mlx}" y="${s.mly}" text-anchor="${s.labelAnchor}">${s.meta}</text>` : ''}
      </g>`
  }
  if (s.kind === 'event') {
    return `
      <g class="gnode gnode-event" data-event="${s.sid}" data-sat-id="${s.sid}" data-sat-kind="event">
        <circle class="gn-event-bg" cx="${s.cx}" cy="${s.cy}" r="${s.r}"/>
        <circle class="gn-event-mark" cx="${s.cx}" cy="${s.cy}" r="2.6"/>
        <text class="gn-event-label" x="${s.lx}" y="${s.ly}" text-anchor="${s.labelAnchor}">${s.label}</text>
        ${s.name ? `<text class="gn-event-name" x="${s.mlx ?? s.lx}" y="${s.mly ?? (s.ly + 15)}" text-anchor="${s.labelAnchor}">${s.name}</text>` : ''}
      </g>`
  }
  // note
  const pinned = s.isPinned ? 'pinned' : ''
  return `
    <g class="gnode gnode-note ${pinned}" data-note="${s.sid}" data-sat-id="${s.sid}" data-sat-kind="note">
      <circle class="gn-note-bg" cx="${s.cx}" cy="${s.cy}" r="${s.r}"/>
      <text class="gn-note-label" x="${s.lx}" y="${s.ly}" text-anchor="${s.labelAnchor}">${s.label}</text>
    </g>`
}

function buildCluster(c: ClusterDef): string {
  const userEdges     = c.userEdges.map(d => `<path class="gedge user" d="${d}"/>`).join('')
  const implicitEdges = c.implicitEdges.map(d => `<path class="gedge implicit" d="${d}"/>`).join('')
  const sats          = c.satellites.map(buildSatellite).join('')
  return `<g class="gcluster" data-piste="${c.id}">${userEdges}${implicitEdges}${sats}</g>`
}

function buildPisteNode(c: ClusterDef): string {
  const title  = pisteTitle(c.id)
  const axis   = pisteAxisLabel(c.id)
  const meta   = pisteMeta(c.id)
  const lf     = c.labelFill ? ` style="fill:${c.labelFill}"` : ''
  const dotLy  = c.cy + c.r + 18
  const axeLy  = c.cy + c.r + 34
  const metaLy = c.cy + c.r + 51
  return `
    <g class="gnode gnode-piste" data-piste="${c.id}">
      <circle class="gn-piste-bg" cx="${c.cx}" cy="${c.cy}" r="${c.r}" style="stroke:${c.stroke}"/>
      <circle class="gn-piste-dot" cx="${c.cx}" cy="${c.cy}" r="${c.r * 0.15}" style="fill:${c.dotFill}"/>
      <text class="gn-piste-label" x="${c.cx}" y="${dotLy}" text-anchor="middle"${lf}>${title}</text>
      <text class="gn-piste-axe" x="${c.cx}" y="${axeLy}" text-anchor="middle">${axis}</text>
      <text class="gn-piste-meta" x="${c.cx}" y="${metaLy}" text-anchor="middle">${meta}</text>
    </g>`
}

function buildSVGContent(): string {
  const defs = `
    <defs>
      <pattern id="memgrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0L0 0L0 40" fill="none" stroke="oklch(93% .008 80)" stroke-width=".5"/>
      </pattern>
      <radialGradient id="memvignette" cx="50%" cy="50%" r="65%">
        <stop offset="55%" stop-color="oklch(99% .005 85)" stop-opacity="0"/>
        <stop offset="100%" stop-color="oklch(94% .01 80)" stop-opacity=".5"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="720" fill="url(#memgrid)"/>
    <rect width="1200" height="720" fill="url(#memvignette)"/>`

  const systemEdges = SYSTEM_EDGES.map(e =>
    `<path class="gedge system" data-from="${e.from}" data-to="${e.to}" d="${e.d}"/>`
  ).join('')

  const pinnedRings = CLUSTERS
    .filter(c => c.hasPinnedRing)
    .map(c => {
      const dash    = c.pinnedRingDash ? ` stroke-dasharray="${c.pinnedRingDash}"` : ''
      const opacity = c.pinnedRingOpacity != null ? ` opacity="${c.pinnedRingOpacity}"` : ''
      return `<circle class="gedge pinned-ring" cx="${c.cx}" cy="${c.cy}" r="${c.pinnedRingR}"${dash}${opacity}/>`
    }).join('')

  const clusters   = CLUSTERS.map(buildCluster).join('')
  const pisteNodes = CLUSTERS.map(buildPisteNode).join('')

  const marginalia = `
    <text class="gtext-marginalia-mark" x="60" y="60">— Repli —</text>
    <text class="gtext-marginalia" x="60" y="78">Cliquez une piste</text>
    <text class="gtext-marginalia" x="60" y="95">pour la déplier.</text>
    <text class="gtext-marginalia-mark" x="1060" y="490">— Dérive —</text>
    <text class="gtext-marginalia" x="1060" y="508">Convergence implicite</text>
    <text class="gtext-marginalia" x="1060" y="525">entre Souveraineté et</text>
    <text class="gtext-marginalia" x="1060" y="542">Interfaces physiques.</text>`

  return defs + systemEdges + pinnedRings + clusters + pisteNodes + marginalia
}

// ── SVG state sync ────────────────────────────────────────────────────────────
function syncSVGState() {
  const svg = svgRef.value
  if (!svg) return
  svg.querySelectorAll<SVGGElement>('.gcluster').forEach(c => {
    c.classList.toggle('expanded', graph.expandedIds.value.has(c.dataset.piste ?? ''))
  })
  svg.querySelectorAll<SVGGElement>('.gnode-piste').forEach(n => {
    const id = n.dataset.piste ?? ''
    n.classList.toggle('expanded', graph.expandedIds.value.has(id))
    n.classList.toggle('focused',  graph.focusedId.value === id)
    n.classList.toggle('drop-target', dnd.dropTargetId.value === id)
  })
  svg.querySelectorAll<SVGPathElement>('.gedge.system').forEach(e => {
    const from = e.dataset.from ?? '', to = e.dataset.to ?? ''
    e.classList.toggle('show', graph.expandedIds.value.has(from) || graph.expandedIds.value.has(to))
  })
  svg.querySelectorAll<SVGGElement>('.gnode-article').forEach(n => {
    n.classList.toggle('dragging', dnd.draggingId.value === n.dataset.article)
  })
}

watch([graph.expandedIds, graph.focusedId, dnd.dropTargetId, dnd.draggingId], syncSVGState)

// ── SVG interactions ──────────────────────────────────────────────────────────
function svgPoint(clientX: number, clientY: number) {
  const svg = svgRef.value
  if (!svg) return { x: 0, y: 0 }
  const pt = svg.createSVGPoint()
  pt.x = clientX; pt.y = clientY
  return pt.matrixTransform(svg.getScreenCTM()!.inverse())
}

function frameOffset(clientX: number, clientY: number) {
  const frame = frameRef.value
  if (!frame) return { x: 0, y: 0 }
  const r = frame.getBoundingClientRect()
  return { x: clientX - r.left + 8, y: clientY - r.top + 8 }
}

function adjustPopover() {
  const frame = frameRef.value
  const el    = popRef.value?.querySelector<HTMLElement>('.g-action-popover.show')
  if (!frame || !el) return
  const fr = frame.getBoundingClientRect()
  const pr = el.getBoundingClientRect()
  if (pr.right  > fr.right  - 8) el.style.left = Math.max(8, fr.width - pr.width - 8) + 'px'
  if (pr.bottom > fr.bottom - 8) el.style.top  = Math.max(8, parseFloat(el.style.top) - pr.height - 16) + 'px'
}

function attachInteractions() {
  const svg = svgRef.value
  if (!svg) return

  // Piste nodes
  svg.querySelectorAll<SVGGElement>('.gnode-piste').forEach(node => {
    const id = node.dataset.piste ?? ''

    node.addEventListener('mouseenter', () => graph.peekReadout(id))
    node.addEventListener('mouseleave', () => graph.unpeekReadout(id))
    node.addEventListener('click', e => {
      e.stopPropagation()
      pop.hide()
      graph.toggleCluster(id)
    })

    // Drag-over for DnD
    node.addEventListener('dragover', e => {
      e.preventDefault()
      dnd.setDropTarget(id)
    })
    node.addEventListener('dragleave', () => dnd.clearDropTarget())
    node.addEventListener('drop', e => {
      e.preventDefault()
      const articleId = e.dataTransfer?.getData('text/plain')
      if (!articleId) { dnd.clearDropTarget(); return }
      const label = node.querySelector<SVGTextElement>('.gn-piste-label')?.textContent ?? ''
      const sourcePiste = props.articles.find(a => a.id === articleId)?.pisteIds[0] ?? null
      if (sourcePiste) {
        dnd.openModal({ articleId, articleLabel: articleId, sourcePisteId: sourcePiste, targetPisteId: id, targetLabel: label })
      }
      dnd.clearDropTarget()
    })
  })

  // Satellite: article / event
  svg.querySelectorAll<SVGGElement>('.gnode-article, .gnode-event').forEach(node => {
    const label = node.querySelector<SVGTextElement>('.gn-art-label, .gn-event-name')?.textContent ?? ''
    const kind  = node.classList.contains('gnode-event') ? 'event' as const : 'article' as const
    const id    = node.dataset.article ?? node.dataset.event ?? node.dataset.satId ?? ''

    node.addEventListener('click', e => {
      e.stopPropagation()
      const pos = frameOffset(e.clientX, e.clientY)
      pop.show(pos, { type: 'entity', kind, entityId: id, label })
      requestAnimationFrame(adjustPopover)
    })

    // Drag article
    if (kind === 'article') {
      node.setAttribute('draggable', 'true')
      node.addEventListener('dragstart', e => {
        e.dataTransfer?.setData('text/plain', id)
        dnd.startDrag(id, label, e.clientX, e.clientY)
        node.classList.add('dragging')
      })
      node.addEventListener('dragend', () => {
        node.classList.remove('dragging')
        dnd.endDrag()
      })
    }
  })

  // Satellite: note
  svg.querySelectorAll<SVGGElement>('.gnode-note').forEach(node => {
    const label    = node.querySelector<SVGTextElement>('.gn-note-label')?.textContent ?? ''
    const noteId   = node.dataset.note ?? node.dataset.satId ?? ''
    const isPinned = node.classList.contains('pinned')

    node.addEventListener('click', e => {
      e.stopPropagation()
      const pos = frameOffset(e.clientX, e.clientY)
      pop.show(pos, { type: 'note', noteId, label, isPinned })
      requestAnimationFrame(adjustPopover)
    })
  })

  // Empty canvas click
  svg.addEventListener('click', e => {
    if ((e.target as SVGElement).closest('.gnode')) return
    if (pop.visible.value) { pop.hide(); return }
    graph.collapseAll()
    const sv  = svgPoint(e.clientX, e.clientY)
    const pos = frameOffset(e.clientX, e.clientY)
    pop.show(pos, { type: 'empty', svgX: sv.x, svgY: sv.y })
    requestAnimationFrame(adjustPopover)
  })
}

// ── popover actions ───────────────────────────────────────────────────────────
function handlePopoverAction(act: string, ctx: ReturnType<typeof pop.context.value extends infer T ? () => T : never>) {
  const pisteId = graph.focusedId.value
  if (act === 'new-note' || act === 'edit-note') {
    const piste = props.pistes.find(p => p.id === pisteId)
    if (act === 'edit-note' && pop.context.value?.type === 'note') {
      emit('edit-note', (pop.context.value as { noteId: string }).noteId as NoteId)
    } else {
      emit('add-note', piste?.title ?? '', (pisteId ?? '') as PisteId)
    }
    pop.hide()
    return
  }
  pop.hide()
}

function handleConfirmPiste(name: string) {
  const ctx = pop.context.value
  if (ctx?.type !== 'empty') return
  addPisteNode(ctx.svgX, ctx.svgY, name)
  pop.hide()
}

// ── dynamic piste creation ────────────────────────────────────────────────────
function addPisteNode(svgX: number, svgY: number, name: string) {
  const svg = svgRef.value
  if (!svg) return
  const ns = 'http://www.w3.org/2000/svg'
  const id = `new-${Date.now()}`

  // cluster placeholder
  const cluster = document.createElementNS(ns, 'g')
  cluster.setAttribute('class', 'gcluster')
  cluster.setAttribute('data-piste', id)
  svg.appendChild(cluster)

  // piste node
  const g = document.createElementNS(ns, 'g')
  g.setAttribute('class', 'gnode gnode-piste is-new')
  g.setAttribute('data-piste', id)
  g.innerHTML = `
    <circle class="gn-piste-bg" cx="${svgX}" cy="${svgY}" r="18" style="stroke:var(--color-indigo)"/>
    <circle class="gn-piste-dot" cx="${svgX}" cy="${svgY}" r="2.7"/>
    <text class="gn-piste-label" x="${svgX}" y="${svgY + 34}" text-anchor="middle">${name}</text>
    <text class="gn-piste-axe"   x="${svgX}" y="${svgY + 50}" text-anchor="middle">nouvelle · à enrichir</text>
    <text class="gn-piste-meta"  x="${svgX}" y="${svgY + 67}" text-anchor="middle">0 trace · 0 j</text>
  `
  svg.appendChild(g)

  g.addEventListener('mouseenter', () => graph.peekReadout(id))
  g.addEventListener('mouseleave', () => graph.unpeekReadout(id))
  g.addEventListener('click', e => {
    e.stopPropagation()
    pop.hide()
    graph.toggleCluster(id)
  })
}

// ── lifecycle ─────────────────────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (pop.visible.value) { pop.hide(); return }
    graph.collapseAll()
  }
}

onMounted(() => {
  if (svgRef.value) {
    svgRef.value.setAttribute('viewBox', '0 0 1200 720')
    svgRef.value.innerHTML = buildSVGContent()
    attachInteractions()
  }
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onOutsideClick)
})

function onOutsideClick(e: MouseEvent) {
  if (!(e.target as HTMLElement)?.closest?.('.g-action-popover')) {
    pop.hide()
  }
}
</script>

<template>
  <div ref="frameRef" class="graph-frame">

    <!-- SVG canvas -->
    <svg
      ref="svgRef"
      class="graph-canvas"
      preserveAspectRatio="xMidYMid meet"
    />

    <!-- Action popover -->
    <div ref="popRef">
      <ActionPopover
        :position="pop.position.value"
        :context="pop.context.value"
        :visible="pop.visible.value"
        :new-piste-input="pop.newPisteInput.value"
        @close="pop.hide()"
        @confirm-piste="handleConfirmPiste"
        @action="handlePopoverAction"
        @update:new-piste-input="pop.newPisteInput.value = $event"
      />
    </div>

    <!-- Focused readout -->
    <aside class="graph-readout" :class="{ show: graph.readoutShow.value }">
      <template v-if="focusedPiste">
        <div class="gr-h">Piste · {{ focusedPiste.title }}</div>
        <p>{{ readoutBody(focusedPiste) }}</p>
        <div v-if="focusedPinnedNote" class="gr-pin">
          <span class="grp-h">Note épinglée ·</span>
          {{ focusedPinnedNote.body.replace(/\*\*/g, '') }}
        </div>
        <button
          class="gr-add-note"
          @click="emit('add-note', focusedPiste.title, focusedPiste.id)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Ajouter une note à cette piste
        </button>
      </template>
    </aside>

    <!-- Legend -->
    <aside class="graph-legend">
      <h4>Légende</h4>
      <div class="gleg-row">
        <span class="swc" style="background:var(--color-paper);border:1.4px solid var(--color-indigo)"/>
        <span>Piste (vous)</span>
      </div>
      <div class="gleg-row">
        <span class="swc" style="background:var(--color-paper);border:.8px solid var(--color-ink-3)"/>
        <span>Article sauvegardé</span>
      </div>
      <div class="gleg-row">
        <span class="swc" style="background:var(--color-indigo-tint);border:.8px solid var(--color-indigo)"/>
        <span>Note</span>
      </div>
      <div class="gleg-row">
        <span class="swc" style="background:oklch(96.5% .025 85);border:1px solid var(--color-amber)"/>
        <span>Évènement</span>
      </div>
      <div class="leg-sep"/>
      <div class="gleg-row">
        <span class="swl">
          <svg viewBox="0 0 22 6">
            <line x1="0" y1="3" x2="22" y2="3" stroke="oklch(38% .09 265)" stroke-width="1.4" opacity=".6"/>
          </svg>
        </span>
        <span>Lien créé par vous</span>
      </div>
      <div class="gleg-row">
        <span class="swl">
          <svg viewBox="0 0 22 6">
            <line x1="0" y1="3" x2="22" y2="3" stroke="oklch(55% .008 270)" stroke-width=".9" stroke-dasharray="4 3" opacity=".55"/>
          </svg>
        </span>
        <span>Lien implicite</span>
      </div>
      <div class="gleg-row">
        <span class="swl">
          <svg viewBox="0 0 22 6">
            <line x1="0" y1="3" x2="22" y2="3" stroke="oklch(72% .006 270)" stroke-width=".8" stroke-dasharray="1 4" opacity=".5"/>
          </svg>
        </span>
        <span>Lien système</span>
      </div>
    </aside>

    <!-- Hint bar -->
    <div class="graph-hint">
      <span>Cliquez une <kbd>piste</kbd> pour la déplier</span>
      <span><kbd>Esc</kbd> tout replier</span>
    </div>

    <!-- Move / link modal (scoped inside frame) -->
    <MoveLinkModal
      :visible="dnd.modalVisible.value"
      :pending-drop="dnd.pendingDrop.value"
      @close="dnd.closeModal()"
      @decide="(act) => { dnd.closeModal() }"
    />

  </div>
</template>

<style scoped>
.graph-frame {
  position: relative;
  height: 720px;
  border: 1px solid var(--color-rule);
  border-radius: 4px;
  background: var(--color-paper);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px oklch(0% 0 0 / .015);
}

.graph-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* ── SVG node classes (global — inside SVG innerHTML) ── */
:deep(.gnode)        { cursor: pointer; }
:deep(.gnode:hover .gn-piste-bg),
:deep(.gnode:hover .gn-art-bg),
:deep(.gnode:hover .gn-note-bg),
:deep(.gnode:hover .gn-event-bg) { filter: drop-shadow(0 2px 6px oklch(0% 0 0 / .12)); }

:deep(.gn-piste-bg)  { fill: var(--color-paper); stroke: var(--color-indigo); stroke-width: 1.4; }
:deep(.gn-piste-dot) { fill: var(--color-indigo); }
:deep(.gn-piste-label) {
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: var(--weight-medium);
  fill: var(--color-ink);
  letter-spacing: -.008em;
}
:deep(.gn-piste-meta) {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: .14em;
  text-transform: uppercase;
  fill: var(--color-ink-4);
  font-weight: var(--weight-medium);
}
:deep(.gn-piste-axe) {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 11.5px;
  fill: var(--color-ink-3);
  font-weight: 400;
}

:deep(.gn-art-bg)    { fill: var(--color-paper); stroke: var(--color-ink-3); stroke-width: .8; }
:deep(.gn-art-label) { font-family: var(--font-serif); font-size: 11px; fill: var(--color-ink-2); font-weight: 400; }

:deep(.gn-note-bg)    { fill: var(--color-indigo-tint); stroke: var(--color-indigo); stroke-width: .8; opacity: .85; }
:deep(.gn-note-label) { font-family: var(--font-serif); font-style: italic; font-size: 10.5px; fill: var(--color-indigo); font-weight: var(--weight-medium); }

:deep(.gn-event-bg)    { fill: oklch(96.5% .025 85); stroke: var(--color-amber); stroke-width: 1; }
:deep(.gn-event-mark)  { fill: var(--color-amber); }
:deep(.gn-event-label) {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: .06em;
  fill: oklch(45% .1 70);
  font-weight: var(--weight-medium);
  text-transform: uppercase;
}
:deep(.gn-event-name) { font-family: var(--font-serif); font-size: 11px; fill: var(--color-ink-2); font-weight: var(--weight-medium); }

/* Cluster expand/collapse */
:deep(.gcluster > .gedge),
:deep(.gcluster > .gnode:not(.gnode-piste)) {
  opacity: 0;
  visibility: hidden;
  transition: opacity .35s, visibility .35s;
  pointer-events: none;
}
:deep(.gcluster.expanded > .gedge.user)    { opacity: .55; visibility: visible; pointer-events: auto; }
:deep(.gcluster.expanded > .gedge.implicit){ opacity: .45; visibility: visible; pointer-events: auto; }
:deep(.gcluster.expanded > .gnode:not(.gnode-piste)) { opacity: 1; visibility: visible; pointer-events: auto; }

/* Piste node states */
:deep(.gnode-piste .gn-piste-bg)         { transition: stroke-width .2s; }
:deep(.gnode-piste.expanded .gn-piste-bg){ stroke-width: 2; }
:deep(.gnode-piste.focused .gn-piste-bg) { stroke-width: 2; stroke: var(--color-ink); }
:deep(.gnode-piste.drop-target .gn-piste-bg) {
  stroke-width: 3;
  filter: drop-shadow(0 0 10px oklch(38% .09 265 / .45));
}

/* Edges */
:deep(.gedge) { fill: none; }
:deep(.gedge.user)    { stroke: var(--color-indigo); stroke-width: 1.2; opacity: .55; }
:deep(.gedge.implicit){ stroke: var(--color-ink-3);  stroke-width: .8; stroke-dasharray: 4 4; opacity: .45; }
:deep(.gedge.system)  {
  stroke: var(--color-ink-4); stroke-width: .7; stroke-dasharray: 1 4;
  opacity: 0; visibility: hidden;
  transition: opacity .35s, visibility .35s;
}
:deep(.gedge.system.show) { opacity: .32; visibility: visible; }
:deep(.gedge.pinned-ring) { stroke: var(--color-amber); stroke-width: .8; opacity: .55; }

/* Pinned note node */
:deep(.gnode-note.pinned .gn-note-bg) { stroke: var(--color-amber); stroke-width: 1.4; fill: oklch(95% .03 80); }

/* Dragging */
:deep(.gnode-article.dragging) { opacity: .28; pointer-events: none; }

/* New piste animation */
:deep(.gnode-piste.is-new .gn-piste-bg) {
  stroke-dasharray: 3 2;
  animation: newPiste 1.6s ease forwards;
}
@keyframes newPiste {
  0%   { stroke-dasharray: 3 2; stroke-opacity: .6; }
  100% { stroke-dasharray: none; stroke-opacity: 1; }
}

/* Marginalia */
:deep(.gtext-marginalia) {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 11.5px;
  fill: var(--color-ink-4);
}
:deep(.gtext-marginalia-mark) {
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 8.5px;
  letter-spacing: .2em;
  text-transform: uppercase;
  fill: var(--color-ink-4);
  font-weight: var(--weight-medium);
}

/* ── Readout ── */
.graph-readout {
  position: absolute;
  top: 20px;
  right: 24px;
  background: oklch(99% .005 85 / .94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--color-rule);
  border-radius: 4px;
  padding: 14px 18px;
  width: 280px;
  z-index: 3;
  font-family: var(--font-serif);
  font-size: 13px;
  color: var(--color-ink-2);
  line-height: 1.5;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: opacity .18s ease, transform .18s ease, visibility .18s;
  pointer-events: none;
}

.graph-readout.show {
  opacity: 1;
  visibility: visible;
  transform: none;
  pointer-events: auto;
}

.gr-h {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--color-indigo);
  margin-bottom: 8px;
  font-weight: var(--weight-medium);
  display: flex;
  align-items: center;
  gap: 8px;
}

.gr-h::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-indigo);
}

.graph-readout p { margin: 0; text-wrap: pretty; }

.gr-pin {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--color-rule);
  font-style: italic;
  font-size: 12.5px;
  color: var(--color-ink-3);
}

.grp-h {
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 9px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--color-amber);
  font-weight: var(--weight-medium);
  margin-right: 6px;
}

.gr-add-note {
  margin-top: 14px;
  padding: 8px 12px;
  width: 100%;
  text-align: left;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: .18em;
  text-transform: uppercase;
  background: transparent;
  color: var(--color-ink-3);
  border: 1px dashed var(--color-rule);
  border-radius: 3px;
  cursor: pointer;
  transition: all .15s;
  font-weight: var(--weight-medium);
  display: flex;
  align-items: center;
  gap: 8px;
}

.gr-add-note:hover {
  background: var(--color-bg-2);
  color: var(--color-indigo);
  border-color: var(--color-indigo);
  border-style: solid;
}

.gr-add-note svg { width: 11px; height: 11px; }

/* ── Legend ── */
.graph-legend {
  position: absolute;
  bottom: 18px;
  right: 24px;
  background: oklch(99% .005 85 / .78);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid var(--color-rule-2);
  border-radius: 3px;
  padding: 10px 12px;
  min-width: 0;
  z-index: 2;
  opacity: .72;
  transition: opacity .2s, background .2s;
}

.graph-legend:hover {
  opacity: 1;
  background: oklch(99% .005 85 / .94);
}

.graph-legend h4 {
  font-family: var(--font-mono);
  font-size: 8.5px;
  color: var(--color-ink-4);
  letter-spacing: .22em;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: var(--weight-medium);
}

.gleg-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  font-size: 10.5px;
  color: var(--color-ink-3);
  font-family: var(--font-sans);
  line-height: 1.3;
}

.swc {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex: none;
  display: inline-block;
}

.swl {
  width: 18px;
  flex: none;
  display: flex;
  align-items: center;
}

.swl svg { width: 18px; height: 5px; }

.leg-sep {
  height: 1px;
  background: var(--color-rule-2);
  margin: 10px 0;
}

/* ── Hint ── */
.graph-hint {
  position: absolute;
  bottom: 18px;
  left: 24px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink-4);
  letter-spacing: .16em;
  text-transform: uppercase;
  z-index: 2;
  display: flex;
  gap: 18px;
  align-items: center;
}

.graph-hint kbd {
  padding: 2px 6px;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0;
  color: var(--color-ink-2);
  margin: 0 3px;
}
</style>
