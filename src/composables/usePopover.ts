import { ref } from 'vue'

export interface PopoverPos { x: number; y: number }

export type PopoverCtx =
  | { type: 'empty'; svgX: number; svgY: number }
  | { type: 'entity'; kind: 'article' | 'event'; entityId: string; label: string }
  | { type: 'note'; noteId: string; label: string; isPinned: boolean }

export function usePopover() {
  const position = ref<PopoverPos>({ x: 0, y: 0 })
  const context  = ref<PopoverCtx | null>(null)
  const visible  = ref(false)
  const newPisteInput = ref('')

  function show(pos: PopoverPos, ctx: PopoverCtx) {
    position.value = pos
    context.value  = ctx
    visible.value  = true
    newPisteInput.value = ''
  }

  function hide() {
    visible.value = false
    context.value = null
  }

  return { position, context, visible, newPisteInput, show, hide }
}
