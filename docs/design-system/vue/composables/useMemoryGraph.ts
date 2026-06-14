/**
 * Le Veilleur — Design System
 * vue/composables/useMemoryGraph.ts
 *
 * État + logique du mode "Graphe" :
 *  - clusters par piste, expand / collapse
 *  - système edges qui n'apparaissent que sur cluster expanded
 *  - readout sur hover/click d'une piste
 *  - création de pistes ex-nihilo (clic dans le vide)
 *
 * IMPORTANT — la disposition des nœuds (positions XY) est calculée
 * une fois, persistée côté store, et n'est PAS recalculée à chaque
 * render. Pas de physics, pas de force-directed live. Le but est
 * une mémoire mentale stable que l'utilisateur reconnaît.
 */

import { computed, reactive, readonly, ref } from "vue";
import type {
  Piste, PisteId, GraphCluster, GraphEdge, GraphSatellite,
} from "../types";

interface UseMemoryGraphInput {
  /** Pistes initiales chargées par le store. */
  pistes: Piste[];
  /** Satellites par piste (chargés depuis l'API). */
  satellitesByPiste: Record<string, GraphSatellite[]>;
  /** Edges cross-piste calculés côté backend. */
  edges: GraphEdge[];
}

export function useMemoryGraph(input: UseMemoryGraphInput) {
  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------
  const pistes = ref<Piste[]>(input.pistes);
  const satellites = reactive<Record<string, GraphSatellite[]>>(
    { ...input.satellitesByPiste },
  );
  const edges = ref<GraphEdge[]>(input.edges);

  /** Pistes actuellement dépliées. */
  const expandedPisteIds = ref<Set<PisteId>>(new Set());

  /** Piste survolée / cliquée — pilote l'affichage du readout. */
  const focusedPisteId = ref<PisteId | null>(null);

  // ----------------------------------------------------------
  // Derived
  // ----------------------------------------------------------
  const clusters = computed<GraphCluster[]>(() =>
    pistes.value.map(piste => ({
      piste,
      satellites: satellites[piste.id] ?? [],
    })),
  );

  /** Edges système visibles : au moins un endpoint est expanded. */
  const visibleSystemEdges = computed<GraphEdge[]>(() =>
    edges.value.filter(
      e =>
        e.kind === "system" &&
        (expandedPisteIds.value.has(e.fromPisteId) ||
          expandedPisteIds.value.has(e.toPisteId)),
    ),
  );

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------
  function isExpanded(id: PisteId) {
    return expandedPisteIds.value.has(id);
  }

  function toggleCluster(id: PisteId) {
    const next = new Set(expandedPisteIds.value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expandedPisteIds.value = next;
    focusedPisteId.value = id;
  }

  function collapseAll() {
    expandedPisteIds.value = new Set();
    focusedPisteId.value = null;
  }

  function hover(id: PisteId | null) {
    // ne pas écraser un readout déjà accroché à une piste expanded
    if (id === null && focusedPisteId.value && isExpanded(focusedPisteId.value)) return;
    focusedPisteId.value = id;
  }

  /**
   * Crée une nouvelle piste à une position SVG donnée.
   * Le persisting est délégué à l'appelant (store/API).
   */
  function addPisteAt(
    title: string,
    position: { x: number; y: number },
    options?: { axis?: string },
  ): Piste {
    const id = `new-${Math.random().toString(36).slice(2, 10)}` as PisteId;
    const piste: Piste = {
      id,
      title,
      axis: options?.axis ?? "nouvelle · à enrichir",
      status: "active",
      origin: "user",
      openedAt: new Date().toISOString(),
      traceCount: 0,
      graphPosition: position,
    };
    pistes.value = [...pistes.value, piste];
    satellites[id] = [];
    return piste;
  }

  /** Place un article (déjà sauvegardé) en orbite autour d'une piste. */
  function attachArticleToPiste(
    pisteId: PisteId,
    article: { id: string; title: string; source: string; date: string },
  ): GraphSatellite | null {
    const piste = pistes.value.find(p => p.id === pisteId);
    if (!piste || !piste.graphPosition) return null;

    const existing = satellites[pisteId] ?? [];
    const { x, y } = findFreeOrbitPosition(piste.graphPosition, existing);

    const sat: GraphSatellite = {
      id: article.id,
      kind: "article",
      label: article.title,
      meta: `${article.source} · ${article.date}`,
      x, y,
    };
    satellites[pisteId] = [...existing, sat];
    if (!isExpanded(pisteId)) toggleCluster(pisteId);
    return sat;
  }

  /** Retire un article d'une piste (utilisé pour un "move"). */
  function detachArticleFromPiste(pisteId: PisteId, articleId: string) {
    satellites[pisteId] = (satellites[pisteId] ?? []).filter(s => s.id !== articleId);
  }

  // ----------------------------------------------------------
  // Layout helper — trouve l'angle libre le plus large
  // ----------------------------------------------------------
  function findFreeOrbitPosition(
    center: { x: number; y: number },
    existing: GraphSatellite[],
    distance = 120,
  ) {
    const occupied = existing.map(s =>
      Math.atan2(s.y - center.y, s.x - center.x),
    );

    let bestAngle = -Math.PI / 2;
    let bestGap = -1;
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + (i / 16) * Math.PI * 2;
      const gap =
        occupied.length === 0
          ? Math.PI
          : Math.min(
              ...occupied.map(e => {
                let d = Math.abs(a - e);
                if (d > Math.PI) d = 2 * Math.PI - d;
                return d;
              }),
            );
      if (gap > bestGap) { bestGap = gap; bestAngle = a; }
    }
    return {
      x: +(center.x + Math.cos(bestAngle) * distance).toFixed(1),
      y: +(center.y + Math.sin(bestAngle) * distance).toFixed(1),
    };
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------
  return {
    // state (readonly outside)
    pistes: readonly(pistes),
    clusters,
    edges: readonly(edges),
    visibleSystemEdges,
    expandedPisteIds: readonly(expandedPisteIds),
    focusedPisteId: readonly(focusedPisteId),

    // actions
    isExpanded,
    toggleCluster,
    collapseAll,
    hover,
    addPisteAt,
    attachArticleToPiste,
    detachArticleFromPiste,
  };
}

export type MemoryGraphApi = ReturnType<typeof useMemoryGraph>;
