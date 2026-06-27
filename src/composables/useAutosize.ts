import { nextTick, watch, onMounted, type Ref } from 'vue'

// Ajuste la hauteur d'un <textarea> à son contenu (note autosize, sans saut).
export function useAutosize(el: Ref<HTMLTextAreaElement | null>, watchSource: () => unknown) {
  function resize() {
    const node = el.value
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${node.scrollHeight}px`
  }
  onMounted(() => nextTick(resize))
  watch(watchSource, () => nextTick(resize))
  return { resize }
}
