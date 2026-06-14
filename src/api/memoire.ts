import { api } from './client'
import type {
  Piste, PisteId, Note, NoteId, Article, ArticleId, DomainEvent, EventId, Trace,
} from '../types'

export type { Piste, PisteId, Note, NoteId, Article, ArticleId, DomainEvent, EventId, Trace }

export interface MemoireData {
  pistes: Piste[]
  notes: Note[]
  articles: Article[]
  events: DomainEvent[]
  stats: { pisteCount: number; articleCount: number; noteCount: number; eventCount: number; savedAt: string }
}

export function fetchMemoire(): Promise<MemoireData> {
  return api.get<MemoireData>('/memoire')
}

export function saveNote(note: Partial<Note> & { pisteId: PisteId }): Promise<Note> {
  return api.post<Note>('/memoire/notes', note)
}

export function updateNote(id: NoteId, body: string): Promise<Note> {
  return api.patch<Note>(`/memoire/notes/${id}`, { body })
}

export function pinNote(id: NoteId, pisteId: PisteId): Promise<void> {
  return api.post<void>(`/memoire/notes/${id}/pin`, { pisteId })
}
