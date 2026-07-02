import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * UniversalBackButton
 *
 * Um botão de voltar flutuante e discreto para páginas fora do layout principal.
 * Respeita a Safe Area de notch e Dynamic Island de aparelhos iOS e Android.
 * É renderizado apenas em caminhos que não possuem navegação própria.
 */
export function UniversalBackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  // Exibir apenas em páginas que não possuem sidebar ou barra de navegação integrada.
  // Ignora: Landing (/), painel (/dashboard/*), login e registro.
  const shouldShow = 
    path !== '/' && 
    !path.startsWith('/dashboard') && 
    path !== '/login' && 
    path !== '/register'

  if (!shouldShow) return null

  const handleBack = () => {
    // Retorna no histórico do navegador se possível, senão vai para a home
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <button
      onClick={handleBack}
      style={{
        position: 'fixed',
        top: 'calc(1rem + env(safe-area-inset-top, 0px))',
        left: 'calc(1rem + env(safe-area-inset-left, 0px))',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.75rem',
        height: '2.75rem',
        borderRadius: '50%',
        background: 'var(--bg-elevated, rgba(15, 23, 42, 0.6))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid var(--border-default, rgba(255, 255, 255, 0.1))',
        color: 'var(--text-primary)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        cursor: 'pointer',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s, border-color 0.2s',
        outline: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.06)'
        e.currentTarget.style.borderColor = 'var(--color-verde, #009C3B)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.borderColor = 'var(--border-default, rgba(255, 255, 255, 0.1))'
      }}
      title="Voltar"
      aria-label="Voltar para a página anterior"
    >
      <ArrowLeft size={20} style={{ color: 'var(--color-verde, #009C3B)' }} />
    </button>
  )
}
