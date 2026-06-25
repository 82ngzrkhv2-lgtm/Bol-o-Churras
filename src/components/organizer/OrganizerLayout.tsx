import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { 
  Home, Users, Trophy, Calendar, DollarSign, Target, Settings,
  Bell, Plus, ChevronDown, X, MoreHorizontal
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { GroupProvider } from '../../contexts/GroupContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function OrganizerLayout() {
  return (
    <GroupProvider>
      <OrganizerLayoutInner />
    </GroupProvider>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function OrganizerLayoutInner() {
  const { profile } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('Service Worker registrado:', reg)
          checkSubscription()
        })
        .catch(err => console.error('Erro ao registrar Service Worker:', err))
    }
  }, [])

  useEffect(() => {
    if (profile) {
      checkSubscription()
    }
  }, [profile])

  async function checkSubscription() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setIsSubscribed(!!sub)
    }
  }

  async function togglePushSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Seu navegador não suporta notificações push.')
      return
    }

    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()

      if (sub) {
        await sub.unsubscribe()
        if (profile) {
          const { error } = await supabase
            .from('profiles')
            .update({ push_subscription: null })
            .eq('id', profile.id)
          if (error) throw error
        }
        setIsSubscribed(false)
        toast.success('Notificações desativadas.')
      } else {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          toast.error('Você precisa permitir as notificações no seu navegador.')
          return
        }

        const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
        if (!publicKey) {
          toast.error('Chave pública VAPID não configurada.')
          return
        }

        const newSub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        })

        if (profile) {
          const { error } = await supabase
            .from('profiles')
            .update({ push_subscription: newSub.toJSON() })
            .eq('id', profile.id)
          if (error) throw error
        }

        setIsSubscribed(true)
        toast.success('Notificações ativadas com sucesso! 🔔')
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao configurar notificações: ' + err.message)
    }
  }

  const navItems = [
    { label: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
    { label: 'Participantes', icon: <Users size={20} />, path: '/dashboard/participants' },
    { label: 'Jogos', icon: <Trophy size={20} />, path: '/dashboard/matches' },
    { label: 'Evento', icon: <Calendar size={20} />, path: '/dashboard/event' },
    { label: 'Pagamentos', icon: <DollarSign size={20} />, path: '/dashboard/payments' },
    { label: 'Ranking', icon: <Trophy size={20} />, path: '/dashboard/ranking' },
    { label: 'Palpites', icon: <Target size={20} />, path: '/dashboard/predictions' },
    { label: 'Configurações', icon: <Settings size={20} />, path: '/dashboard/settings' },
  ]

  const mobileNavItems = navItems.slice(0, 4)

  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex" style={{
        flexDirection: 'column', width: '256px', background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)', height: '100%'
      }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            Bolão<span style={{ color: 'var(--color-verde)' }}>&</span>Churras
          </span>
        </div>

        <nav style={{ flex: 1, padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path) && item.path !== '/dashboard'
            return (
              <Link
                key={item.label}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: isActive ? 700 : 500,
                  transition: 'var(--transition-fast)',
                  background: isActive ? 'var(--color-verde)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                }}
                className={!isActive ? "hover-bg-muted" : ""}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}

          {/* Invitation Banner */}
          <div style={{
            marginTop: '2rem', background: 'var(--bg-base)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', padding: '1rem', textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Convide amigos e aumente a galera!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '-0.5rem', marginBottom: '1rem' }}>
              <img src="https://api.dicebear.com/8.x/thumbs/svg?seed=A&backgroundColor=16A34A" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #fff' }} alt="avatar" />
              <img src="https://api.dicebear.com/8.x/thumbs/svg?seed=B&backgroundColor=FACC15" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #fff', marginLeft: '-10px' }} alt="avatar" />
              <img src="https://api.dicebear.com/8.x/thumbs/svg?seed=C&backgroundColor=2563EB" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #fff', marginLeft: '-10px' }} alt="avatar" />
            </div>
            <button className="btn btn-primary btn-full" style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
              Convidar
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
        {/* TOP HEADER */}
        <header style={{
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)',
          padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div className="flex items-center lg:hidden gap-2">
            <div style={{
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src="/logo.png" alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
              Bolão<span style={{color: 'var(--color-verde)'}}>&</span>Churras
            </span>
          </div>

          <div className="hidden lg:block">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Olá, {profile?.full_name?.split(' ')[0] || 'Admin'} 👋</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={togglePushSubscription}
              style={{ 
                position: 'relative', 
                color: isSubscribed ? 'var(--color-verde)' : 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }} 
              className="hover-text-primary"
              title={isSubscribed ? "Notificações Ativas" : "Ativar Notificações"}
            >
              <Bell size={20} className={isSubscribed ? "fill-current" : ""} />
              {isSubscribed && (
                <span style={{
                  position: 'absolute', top: -2, right: -2, width: 8, height: 8,
                  background: 'var(--color-amarelo)', borderRadius: '50%', border: '2px solid #fff'
                }} />
              )}
            </button>
            <div className="hidden sm:flex items-center gap-2 cursor-pointer">
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--color-verde-dark)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem'
              }}>
                {profile?.full_name?.charAt(0) || 'J'}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {profile?.full_name?.split(' ')[0] || 'João'}
              </span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </div>
            <Link to="/dashboard/groups/new" className="hidden sm:flex btn btn-primary" style={{ gap: '0.4rem', padding: '0.4rem 1rem' }}>
              <Plus size={16} />
              Novo Evento
            </Link>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)', paddingBottom: '80px' }}>
          <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </main>

        {/* BOTTOM NAVIGATION (Mobile) */}
        <nav className="lg:hidden" style={{
          position: 'fixed', bottom: 0, width: '100%', background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-default)', zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path) && item.path !== '/dashboard'
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '0.6rem 0', color: isActive ? 'var(--color-verde)' : 'var(--text-muted)',
                  }}
                >
                  {item.icon}
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, marginTop: '0.2rem' }}>{item.label}</span>
                </Link>
              )
            })}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '0.6rem 0', color: mobileMenuOpen ? 'var(--color-verde)' : 'var(--text-muted)',
                background: 'transparent', border: 'none', cursor: 'pointer'
              }}
            >
              <MoreHorizontal size={20} />
              <span style={{ fontSize: '0.65rem', fontWeight: 600, marginTop: '0.2rem' }}>Mais</span>
            </button>
          </div>
        </nav>

        {/* Mobile "More" Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden" style={{
            position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
          }} onClick={() => setMobileMenuOpen(false)}>
            <div style={{
              position: 'absolute', bottom: '60px', left: 0, right: 0, background: 'var(--bg-surface)',
              borderRadius: '24px 24px 0 0', padding: '1.5rem', boxShadow: 'var(--shadow-xl)'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>Mais Opções</h3>
                <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {navItems.slice(4).map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '1rem', background: 'var(--bg-base)', borderRadius: 'var(--radius-lg)',
                      color: 'var(--text-secondary)', textDecoration: 'none'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{item.icon}</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
