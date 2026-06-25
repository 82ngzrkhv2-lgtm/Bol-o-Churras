import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!termsAccepted) {
      toast.error('Você precisa aceitar os Termos de Uso e Política de Privacidade.')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, fullName, whatsapp)
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Erro ao criar conta')
    } else {
      toast.success('Conta criada! Faça login para começar. ⚽')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at top, rgba(0,39,118,0.2) 0%, transparent 60%), radial-gradient(ellipse at bottom-left, rgba(0,156,59,0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div className="w-full max-w-sm relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="text-3xl mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 900 }}>
            BOLÃO<span style={{ color: 'var(--color-verde)' }}>&</span>CHURRAS
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Crie sua conta de organizador
          </p>
        </div>

        <div className="card p-6">
          <h2 className="text-xl mb-6" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            CRIAR CONTA GRÁTIS
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="fullName">Nome Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  className="input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="email">E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="whatsapp">WhatsApp</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  📱
                </span>
                <input
                  id="whatsapp"
                  type="tel"
                  className="input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="(11) 99999-9999"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Senha (mínimo 6 caracteres)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
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

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-1"
                style={{ accentColor: 'var(--color-verde)', width: '16px', height: '16px' }}
                required
              />
              <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Eu concordo com os <Link to="/termos" target="_blank" style={{ color: 'var(--color-verde)' }}>Termos de Uso</Link> e a <Link to="/privacidade" target="_blank" style={{ color: 'var(--color-verde)' }}>Política de Privacidade</Link> e autorizo o tratamento dos meus dados.
              </label>
            </div>

            <button type="submit" className="btn btn-azul btn-full" disabled={loading || !termsAccepted} style={{ marginTop: '0.5rem' }}>
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Criar conta
                </>
              )}
            </button>
          </form>

          <div className="divider" />
          <p className="text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: 'var(--color-verde)', fontWeight: 600 }}>
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
