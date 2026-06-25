import React, { useState } from 'react'
import { X, User, Phone, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface Props {
  groupName: string
  onIdentify: (name: string, whatsapp: string) => Promise<void>
  onClose: () => void
}

export default function IdentityModal({ groupName, onIdentify, onClose }: Props) {
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !whatsapp.trim()) return
    if (!termsAccepted) {
      toast.error('Você precisa aceitar os Termos e Política.')
      return
    }
    setLoading(true)
    await onIdentify(name.trim(), whatsapp.trim())
    setLoading(false)
  }

  function formatWhatsapp(v: string) {
    const digits = v.replace(/\D/g, '')
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-fade-in-up"
        style={{
          background: 'var(--bg-surface)',
          borderRadius: '20px 20px 0 0',
          border: '1px solid var(--border-default)',
          borderBottom: 'none',
          padding: '2rem 1.25rem',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{
          width: 40, height: 4, background: 'var(--border-default)',
          borderRadius: 2, margin: '0 auto 1.5rem',
        }} />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>
              ENTRAR NO BOLÃO
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              {groupName}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ padding: '0.5rem' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{
          background: 'var(--color-verde-bg)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem',
          marginBottom: '1.5rem',
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            🔒 <strong style={{ color: 'var(--text-primary)' }}>Sem senha!</strong> Use seu número para entrar e dar seus palpites. Se já participou antes, vamos te reconhecer automaticamente.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="modal-name">Seu Nome *</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="modal-name"
                type="text"
                autoComplete="name"
                className="input"
                style={{ paddingLeft: '2.5rem', fontSize: '1rem' }}
                placeholder="Como te chamam no grupo?"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="modal-whatsapp">WhatsApp *</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="modal-whatsapp"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                className="input"
                style={{ paddingLeft: '2.5rem', fontSize: '1.1rem', letterSpacing: '0.05em' }}
                placeholder="(11) 99999-9999"
                value={whatsapp}
                onChange={e => setWhatsapp(formatWhatsapp(e.target.value))}
                required
                maxLength={15}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="checkbox"
              id="terms-modal"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className="mt-1"
              style={{ accentColor: 'var(--color-verde)', width: '16px', height: '16px' }}
              required
            />
            <label htmlFor="terms-modal" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, textAlign: 'left' }}>
              Eu concordo com os <Link to="/termos" target="_blank" style={{ color: 'var(--color-verde)' }}>Termos de Uso</Link> e a <Link to="/privacidade" target="_blank" style={{ color: 'var(--color-verde)' }}>Política de Privacidade</Link>.
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || !name.trim() || whatsapp.replace(/\D/g, '').length < 10 || !termsAccepted}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <><span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> Entrando...</>
            ) : (
              <>Entrar no Bolão <ArrowRight size={20} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
