import { useState, useCallback } from 'react'
import { saveAppState, getAppState } from '../lib/persistence'

/**
 * useAppState<T>
 *
 * API idêntica ao useState, mas persiste o valor no localStorage.
 * Ideal para filtros, abas ativas, paginação e outros estados de UI
 * que o usuário espera encontrar ao reabrir o aplicativo.
 *
 * @param key          Chave única de namespace (ex: 'dashboard.tab', 'payments.page')
 * @param defaultValue Valor inicial caso não exista nada salvo
 *
 * @example
 * const [activeTab, setActiveTab] = useAppState('dashboard.activeTab', 'visao-geral')
 * const [currentPage, setPage]   = useAppState('payments.page', 1)
 */
export function useAppState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setStateRaw] = useState<T>(() => getAppState(key, defaultValue))

  const setState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStateRaw(prev => {
        const next = typeof value === 'function'
          ? (value as (prev: T) => T)(prev)
          : value
        saveAppState(key, next)
        return next
      })
    },
    [key]
  )

  return [state, setState]
}
