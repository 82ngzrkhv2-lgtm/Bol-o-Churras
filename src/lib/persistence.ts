/**
 * persistence.ts
 * Módulo centralizado para persistência de rota e estado no localStorage.
 * Garante comportamento de app nativo no PWA: o usuário retorna exatamente
 * onde estava ao fechar o aplicativo.
 */

const LAST_ROUTE_KEY = 'bolao:lastRoute'
const APP_STATE_PREFIX = 'bolao:state:'

// ─── Rotas que NÃO devem ser salvas como "última rota" ────────────────────────
const PUBLIC_ROUTES = ['/', '/login', '/register', '/termos', '/privacidade']

/**
 * Retorna true se a rota é privada (deve ser persistida).
 * Rotas de participante (/:slug) também são excluídas pois são para outros usuários.
 */
export function isPrivateRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return false
  // Rotas do organizador sempre começam com /dashboard ou /admin
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) return true
  return false
}

// ─── Persistência de Rota ─────────────────────────────────────────────────────

/**
 * Salva a rota atual (pathname + search) no localStorage.
 * Chamado automaticamente pelo RouteWatcher a cada navegação.
 */
export function saveLastRoute(path: string): void {
  try {
    localStorage.setItem(LAST_ROUTE_KEY, path)
  } catch {
    // localStorage pode estar desabilitado em modo privado extremo
  }
}

/**
 * Recupera a última rota salva.
 * Retorna null se não houver rota ou localStorage indisponível.
 */
export function getLastRoute(): string | null {
  try {
    return localStorage.getItem(LAST_ROUTE_KEY)
  } catch {
    return null
  }
}

/**
 * Remove a última rota salva.
 * Chamado no signOut para garantir que o próximo acesso vá para Landing.
 */
export function clearLastRoute(): void {
  try {
    localStorage.removeItem(LAST_ROUTE_KEY)
  } catch {
    // silencioso
  }
}

// ─── Persistência de Estado da UI ─────────────────────────────────────────────

/**
 * Salva um estado de UI com namespace específico.
 * @param key   Chave única (ex: 'dashboard.activeTab', 'payments.page')
 * @param value Qualquer valor serializável como JSON
 */
export function saveAppState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(APP_STATE_PREFIX + key, JSON.stringify(value))
  } catch {
    // silencioso
  }
}

/**
 * Recupera um estado de UI salvo.
 * @param key          Chave usada em saveAppState
 * @param defaultValue Valor padrão caso a chave não exista
 */
export function getAppState<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(APP_STATE_PREFIX + key)
    if (raw === null) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

/**
 * Remove um estado de UI específico.
 */
export function clearAppState(key: string): void {
  try {
    localStorage.removeItem(APP_STATE_PREFIX + key)
  } catch {
    // silencioso
  }
}

/**
 * Remove todos os estados de UI salvos (chamado no signOut para limpeza completa).
 */
export function clearAllAppState(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(APP_STATE_PREFIX))
    keys.forEach(k => localStorage.removeItem(k))
  } catch {
    // silencioso
  }
}
