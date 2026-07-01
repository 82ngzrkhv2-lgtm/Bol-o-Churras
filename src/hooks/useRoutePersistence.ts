import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { saveLastRoute, isPrivateRoute } from '../lib/persistence'

/**
 * useRoutePersistence
 *
 * Hook que escuta cada mudança de rota e persiste automaticamente
 * no localStorage — mas apenas para rotas privadas (autenticadas).
 *
 * Deve ser usado dentro de um componente montado dentro do <BrowserRouter>.
 */
export function useRoutePersistence() {
  const location = useLocation()

  useEffect(() => {
    const fullPath = location.pathname + location.search
    if (isPrivateRoute(location.pathname)) {
      saveLastRoute(fullPath)
    }
  }, [location.pathname, location.search])
}
