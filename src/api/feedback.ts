import { api } from './client'

// Feedback per-user (PRD #49 INV-U9 : jamais cross-user, user_id résolu serveur).
// Endpoints déjà en prod (docs/openapi.json).

export type ArticleFeedbackType =
  | 'relevant'
  | 'not_relevant'
  | 'favorite'
  | 'skipped'
  | 'source_clicked'
  | 'related_clicked'

// POST /api/articles/{id}/feedback — { type, briefing_date? }
export function postArticleFeedback(
  articleId: string,
  type: ArticleFeedbackType,
  briefingDate?: string,
): Promise<unknown> {
  return api.post(`/articles/${encodeURIComponent(articleId)}/feedback`, {
    type,
    briefing_date: briefingDate ?? null,
  })
}

// POST /api/briefings/{date}/listen — { percent } (0–100) ; fin/abandon d'écoute.
export function postListen(date: string, percent: number): Promise<unknown> {
  return api.post(`/briefings/${encodeURIComponent(date)}/listen`, { percent })
}
