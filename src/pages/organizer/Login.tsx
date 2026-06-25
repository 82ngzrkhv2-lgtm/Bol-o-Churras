import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast.error('E-mail ou senha incorretos')
    } else {
      toast.success('Bem-vindo de volta! ⚽')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background decorativo */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at top, rgba(0,156,59,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom-right, rgba(0,39,118,0.2) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div className="w-full max-w-sm relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="text-3xl mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 900 }}>
            BOLÃO<span style={{ color: 'var(--color-verde)' }}>&</span>CHURRAS
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Área do Organizador
          </p>
        </div>

        {/* Card de Login */}
        <div className="card p-6">
          <h2 className="text-xl mb-6" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            ENTRAR NA PLATAFORMA
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">
                E-mail
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="admin@seuemail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="divider" style={{ margin: '1.5rem 0' }} />

          <p className="text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Ainda não tem conta?{' '}
            <Link to="/register" style={{ color: 'var(--color-verde)', fontWeight: 600 }}>
              Criar conta grátis
            </Link>
          </p>
        </div>

        {/* Nota de participante */}
        <div className="text-center mt-6">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            É participante?{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              Acesse o link que o organizador enviou no WhatsApp.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
