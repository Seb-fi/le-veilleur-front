import { api } from './client'

// GET /api/me — identité résolue serveur depuis le token (PRD #49). has_profile
// pilote la bannière « profil requis » (INV-U10) avant l'onboarding.
export interface Me {
  user_id: string
  role: string
  is_admin: boolean
  is_impersonating: boolean
  real_user_id: string
  has_profile: boolean
}

export interface UserSummary {
  user_id: string
  email: string | null
  role: string
}

export const fetchMe = () => api.get<Me>('/me')
export const fetchUsers = () => api.get<UserSummary[]>('/admin/users')
