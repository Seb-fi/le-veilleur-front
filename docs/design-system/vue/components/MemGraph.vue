<script setup lang="ts">
/**
 * MemGraph.vue
 *
 * Mode "Graphe" — rendu SVG de la mémoire mentale.
 * Compose :
 *   - useMemoryGraph (état + actions)
 *   - useArticleDnD  (drag-drop d'articles)
 *   - usePopover     (popovers contextuels)
 *
 * Ce fichier reste volontairement maquette / scaffolding — la
 * logique de positionnement initial des pistes est calculée par
 * le backend (ou un store dédié). Ici on rend.
 */

import { computed, ref } from "vue";
import type { MemoryGraphApi } from "../composables/useMemoryGraph";
import type { ArticleDnDApi } from "../composables/useArticleDnD";
import type { PopoverApi } from "../composables/usePopover";

const props = defineProps<{
  graph: MemoryGraphApi;
  dnd: ArticleDnDApi;
  popover: PopoverApi;
}>();

const svgRef = ref<SVGSVGElement | null>(null);

/** Convertit un point écran en point SVG (matrice inverse). */
function screenToSvg(clientX: number, clientY: number) {
  const svg = svgRef.value!;
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM()!.inverse());
}

function onCanvasClick(e: MouseEvent) {
  // Clic sur un nœud — handlers spécifiques gèrent
  if ((e.target as HTMLElement).closest(".v-gnode")) return;
  // Clic dans le vide — popover de création de piste
  const p = screenToSvg(e.clientX, e.clientY);
  props.popover.open({
    position: { x: e.clientX, y: e.clientY },
    context: { type: "empty", svgPoint: { x: p.x, y: p.y } },
  });
}

function onPisteClick(id: any, e: MouseEvent) {
  e.stopPropagation();
  props.popover.close();
  props.graph.toggleCluster(id);
}

const clusters = computed(() => props.graph.clusters.value);
</script>

<template>
  <div class="v-graph">
    <svg
      ref="svgRef"
      class="v-graph__canvas"
      viewBox="0 0 1200 720"
      preserveAspectRatio="xMidYMid meet"
      @click="onCanvasClick"
    >
      <!-- ============ Clusters ============ -->
      <g
        v-for="c in clusters"
        :key="c.piste.id"
        class="v-gcluster"
        :class="{ 'is-expanded': graph.isExpanded(c.piste.id) }"
      >
        <!-- TODO: edges user/implicit générés à partir du modèle backend -->
        <g
          v-for="sat in c.satellites"
          :key="sat.id"
          class="v-gnode"
          :class="`v-gnode--${sat.kind}`"
        >
          <circle
            v-if="sat.kind === 'article'"
            class="v-gnode__bg-article"
            :cx="sat.x" :cy="sat.y" r="6"
          />
          <circle
            v-else-if="sat.kind === 'note'"
            class="v-gnode__bg-note"
            :cx="sat.x" :cy="sat.y" r="6"
          />
          <text
            class="v-gnode__label-article"
            :x="sat.x + 12" :y="sat.y - 4"
            text-anchor="start"
          >{{ sat.label }}</text>
        </g>
      </g>

      <!-- ============ Pistes (anchors) ============ -->
      <g
        v-for="c in clusters"
        :key="`piste-${c.piste.id}`"
        class="v-gnode v-gnode--piste"
        :class="{
          'is-expanded': graph.isExpanded(c.piste.id),
          'is-focused':  graph.focusedPisteId.value === c.piste.id,
        }"
        @click="onPisteClick(c.piste.id, $event)"
        @mouseenter="graph.hover(c.piste.id)"
        @mouseleave="graph.hover(null)"
      >
        <circle
          class="v-gnode__bg-piste"
          :cx="c.piste.graphPosition?.x ?? 0"
          :cy="c.piste.graphPosition?.y ?? 0"
          r="22"
        />
        <circle
          class="v-gnode__dot-piste"
          :cx="c.piste.graphPosition?.x ?? 0"
          :cy="c.piste.graphPosition?.y ?? 0"
          r="3.4"
        />
        <text
          class="v-gnode__label-piste"
          :x="c.piste.graphPosition?.x ?? 0"
          :y="(c.piste.graphPosition?.y ?? 0) + 40"
          text-anchor="middle"
        >{{ c.piste.title }}</text>
      </g>
    </svg>

    <!-- ============ Drag ghost ============ -->
    <div
      ref="dnd.ghostEl"
      class="v-drag-ghost"
      :class="{ 'is-on': dnd.state.value?.moved }"
    >
      <span class="v-drag-ghost__label">Article</span>
      {{ dnd.state.value?.ghost.label }}
    </div>

    <!-- ============ Readout (top-right) ============ -->
    <aside
      class="v-graph-readout"
      :class="{ 'is-on': graph.focusedPisteId.value !== null }"
    >
      <!-- contenu rendu par le parent via <slot> dans un vrai composant -->
    </aside>
  </div>
</template>
