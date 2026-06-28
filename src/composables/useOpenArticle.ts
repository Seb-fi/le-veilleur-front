import { useRouter } from 'vue-router'

// Navigation unifiée vers la page détail d'un article — même cible que le briefing et
// l'Explorer (`router.push('/explorer/articles/:id')`). Centralisée ici pour que toutes
// les surfaces (favoris, notes, aperçu, fiche) ouvrent l'article de façon cohérente.
export function useOpenArticle() {
  const router = useRouter()
  return (articleId: string) =>
    router.push(`/explorer/articles/${encodeURIComponent(articleId)}`)
}
