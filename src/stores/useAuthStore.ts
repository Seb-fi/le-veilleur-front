import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchMe, fetchUsers, type Me, type UserSummary } from '../api/me'
import { setActAs } from '../api/auth'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Identité de session (PRD #49). En mode mock (dev sans backend), pas de /me :
// on fournit une identité factice pour que l'UI reste pleinement navigable.
const MOCK_ME: Me = {
  user_id: 'usr_mock',
  role: 'admin',
  is_admin: true,
  is_impersonating: false,
  real_user_id: 'usr_mock',
  has_profile: true,
}

export const useAuthStore = defineStore('auth', () => {
  const me = ref<Me | null>(null)
  const users = ref<UserSummary[]>([])

  async function load() {
    if (me.value) return
    me.value = USE_MOCK ? MOCK_ME : await fetchMe()
  }

  async function loadUsers() {
    if (USE_MOCK || !me.value?.is_admin) return
    users.value = await fetchUsers()
  }

  // Switcher admin (INV-U5) : pose X-Act-As puis recharge l'app pour que les
  // stores se re-peuplent sous le user effectif. null = revenir à soi.
  async function impersonate(userId: string | null) {
    setActAs(userId)
    window.location.reload()
  }

  return { me, users, load, loadUsers, impersonate }
})
