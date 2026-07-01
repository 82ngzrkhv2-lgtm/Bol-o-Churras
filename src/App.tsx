import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'
import { SmartLanding } from './components/SmartLanding'
import { RouteWatcher } from './components/RouteWatcher'

// Lazy loading para melhor performance
const Login = lazy(() => import('./pages/organizer/Login'))
const Register = lazy(() => import('./pages/organizer/Register'))
const Dashboard = lazy(() => import('./pages/organizer/Dashboard'))
const GroupCreate = lazy(() => import('./pages/organizer/GroupCreate'))
const Participants = lazy(() => import('./pages/organizer/Participants'))
const Matches = lazy(() => import('./pages/organizer/Matches'))
const Payments = lazy(() => import('./pages/organizer/Payments'))
const EventInfo = lazy(() => import('./pages/organizer/EventInfo'))
const Ranking = lazy(() => import('./pages/organizer/Ranking'))
const Predictions = lazy(() => import('./pages/organizer/Predictions'))
const Settings = lazy(() => import('./pages/organizer/Settings'))
const Churras = lazy(() => import('./pages/organizer/Churras'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const GroupLanding = lazy(() => import('./pages/participant/GroupLanding'))
// Landing é carregada internamente pelo SmartLanding apenas quando necessário
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const OrganizerLayout = lazy(() => import('./components/organizer/OrganizerLayout'))

function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚽</div>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
          CARREGANDO...
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      {/* RouteWatcher: componente invisível que persiste a rota atual a cada navegação */}
      <RouteWatcher />
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Rotas Públicas */}
            {/* SmartLanding: redireciona usuários autenticados para última rota salva */}
            <Route path="/" element={<SmartLanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rota do Admin Oculta */}
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />

            {/* Rotas do Organizador (protegidas com Layout) */}
            <Route path="/dashboard" element={<PrivateRoute><OrganizerLayout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="groups/new" element={<GroupCreate />} />
              <Route path="participants" element={<Participants />} />
              <Route path="matches" element={<Matches />} />
              <Route path="payments" element={<Payments />} />
              <Route path="event" element={<EventInfo />} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="predictions" element={<Predictions />} />
              <Route path="settings" element={<Settings />} />
              <Route path="churras" element={<Churras />} />
            </Route>

            {/* Rota do Participante — Link Público */}
            <Route path="/:slug" element={<GroupLanding />} />

            {/* Rotas Estáticas LGPD */}
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />

            {/* Redirect padrão */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-verde)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
