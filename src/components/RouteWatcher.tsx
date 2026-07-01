import { useRoutePersistence } from '../hooks/useRoutePersistence'

/**
 * RouteWatcher
 *
 * Componente invisível (não renderiza nada) que deve ser montado
 * uma única vez dentro do <BrowserRouter>, no topo da árvore.
 *
 * Responsabilidade: escutar cada mudança de rota e persistir
 * automaticamente as rotas privadas no localStorage.
 *
 * Uso em App.tsx:
 *   <BrowserRouter>
 *     <RouteWatcher />
 *     <AuthProvider>...</AuthProvider>
 *   </BrowserRouter>
 */
export function RouteWatcher() {
  useRoutePersistence()
  return null
}
