import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getLastRoute } from '../lib/persistence'

const Landing = lazy(() => import('../pages/Landing'))

/**
 * SmartLanding
 *
 * Componente gatekeeper que substitui <Landing /> na rota "/".
 *
 * Lógica de decisão:
 *   - Se auth ainda está carregando → mostra splash screen nativa
 *   - Se usuário está autenticado   → redireciona para última rota salva
 *                                     (ou /dashboard se não houver rota)
 *   - Se não autenticado            → renderiza <Landing /> normalmente
 *
 * Isso garante que NENHUM usuário autenticado veja a Landing Page ao
 * abrir o PWA pelo ícone da tela inicial.
 */
export function SmartLanding() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const navigated = useRef(false)

  useEffect(() => {
    // Aguarda a resolução do estado de autenticação
    if (loading) return
    // Evita navegação dupla em StrictMode
    if (navigated.current) return

    if (user) {
      navigated.current = true
      const lastRoute = getLastRoute()
      // Restaura última rota privada ou cai no dashboard
      navigate(lastRoute || '/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  // Splash screen enquanto verifica autenticação
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: 'var(--bg-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '3.5rem',
              marginBottom: '1rem',
              animation: 'spin 1s linear infinite',
              display: 'inline-block',
            }}
          >
            ⚽
          </div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              fontSize: '0.8rem',
            }}
          >
            CARREGANDO...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Usuário autenticado: não renderiza nada (navegação já foi disparada no useEffect)
  if (user) return null

  // Usuário não autenticado: Landing Page normal
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100dvh',
            background: 'var(--bg-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚽</div>
            <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
              CARREGANDO...
            </p>
          </div>
        </div>
      }
    >
      <Landing />
    </Suspense>
  )
}
