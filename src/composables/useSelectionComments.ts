import { ref, type Ref } from 'vue'
import type { NoteAnchor } from '../types'

// Sélection de passage → commentaire ancré (façon Google Docs), PRD §5.
// Trois chemins d'ouverture de la bulle « Commenter » : souris (mouseup), clavier
// (sélection au clavier + raccourci), tactile (selectionchange / touchend).
// Mono-paragraphe au MVP : une sélection cross-paragraphe donne un retour clair (gate (c)),
// jamais d'échec muet.

export interface PendingSelection {
  quote: string
  offset: number // offset de caractères dans le paragraphe (vérité d'ancrage, PRD §5)
  paragraphIndex: number
  paragraphText: string
  mode: 'resume' | 'full'
  // Position de la bulle, en coordonnées locales au conteneur du corps.
  x: number
  y: number
}

const MIN_QUOTE = 3

export function useSelectionComments(
  container: Ref<HTMLElement | null>,
  mode: Ref<'resume' | 'full'>,
) {
  const pending = ref<PendingSelection | null>(null)
  // Message de garde-fou (sélection cross-paragraphe) — retour clair, pas d'échec muet.
  const crossParaWarning = ref<string | null>(null)
  let warnTimer: ReturnType<typeof setTimeout> | null = null

  function clearPending() {
    pending.value = null
  }

  function warnCrossPara() {
    crossParaWarning.value = 'Un commentaire ne couvre qu’un seul paragraphe pour le moment.'
    if (warnTimer) clearTimeout(warnTimer)
    warnTimer = setTimeout(() => {
      crossParaWarning.value = null
    }, 3200)
  }

  // Construit le PendingSelection depuis la sélection courante du document, ou null.
  function readSelection(): PendingSelection | null {
    const sel = window.getSelection()
    const cont = container.value
    if (!sel || sel.isCollapsed || !cont) return null
    const quote = sel.toString().replace(/\s+/g, ' ').trim()
    if (quote.length < MIN_QUOTE) return null

    const range = sel.getRangeAt(0)
    const startNode = range.startContainer
    const endNode = range.endContainer
    const startEl = (startNode.nodeType === Node.TEXT_NODE ? startNode.parentElement : (startNode as Element))?.closest('[data-para]')
    const endEl = (endNode.nodeType === Node.TEXT_NODE ? endNode.parentElement : (endNode as Element))?.closest('[data-para]')
    if (!startEl || !cont.contains(startEl)) return null
    // Garde-fou cross-paragraphe (gate (c)).
    if (!endEl || startEl !== endEl) {
      warnCrossPara()
      return null
    }
    const paragraphIndex = Number((startEl as HTMLElement).dataset.para)
    if (Number.isNaN(paragraphIndex)) return null
    const paragraphText = (startEl.textContent ?? '').replace(/\s+/g, ' ').trim()
    // offset = position du passage dans le paragraphe canonique (best-effort, PRD §5).
    const offset = paragraphText.indexOf(quote)
    if (offset < 0) return null

    const rr = range.getBoundingClientRect()
    const cr = cont.getBoundingClientRect()
    return {
      quote,
      offset,
      paragraphIndex,
      paragraphText,
      mode: mode.value,
      x: rr.left + rr.width / 2 - cr.left,
      y: rr.bottom - cr.top + 8,
    }
  }

  // Chemin souris/tactile : à la fin du geste, on lit la sélection.
  function onPointerUp() {
    const next = readSelection()
    pending.value = next
  }

  // Chemin clavier : Shift+flèches sélectionne ; on rafraîchit la bulle si une sélection existe.
  function onKeyUp(ev: KeyboardEvent) {
    if (ev.shiftKey || ev.key === 'Shift') {
      const next = readSelection()
      if (next) pending.value = next
    }
  }

  // Construit l'ancre d'un PendingSelection (PRD §3 : quote, offset, mode, paragraph_text, index).
  function toAnchor(p: PendingSelection): NoteAnchor {
    return {
      quote: p.quote,
      offset: p.offset,
      mode: p.mode,
      paragraphText: p.paragraphText,
      paragraphIndex: p.paragraphIndex,
    }
  }

  return { pending, crossParaWarning, clearPending, onPointerUp, onKeyUp, readSelection, toAnchor }
}
