import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, ShieldCheck, RotateCcw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [step, setStep] = useState<'form' | 'otp'>('form')

  // Step 1 — dados do formulário
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Step 2 — OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { signUp, verifyOtp, resendOtp } = useAuth()
  const navigate = useNavigate()

  // Cleanup do cooldown timer ao desmontar
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [])

  // Foca primeiro input ao entrar na tela OTP
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
      startCooldown()
    }
  }, [step])

  function startCooldown() {
    setResendCooldown(60)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // ─── Step 1: Submeter formulário ─────────────────────────────────────────────

  async function handleFormSubmit(e: React.FormEvent) {
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
      toast.success('Código enviado para ' + email)
      setStep('otp')
    }
  }

  // ─── Step 2: Inputs OTP ───────────────────────────────────────────────────────

  function handleOtpChange(index: number, value: string) {
    // Aceita só números
    const digit = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = digit
    setOtpDigits(newDigits)

    // Avança para o próximo campo automaticamente
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        // Apaga o dígito atual
        const newDigits = [...otpDigits]
        newDigits[index] = ''
        setOtpDigits(newDigits)
      } else if (index > 0) {
        // Volta ao campo anterior
        inputRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newDigits = [...otpDigits]
    pasted.split('').forEach((ch, i) => { newDigits[i] = ch })
    setOtpDigits(newDigits)
    // Foca o campo após o último dígito colado
    const nextIndex = Math.min(pasted.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const token = otpDigits.join('')
    if (token.length < 6) {
      toast.error('Digite o código completo de 6 dígitos.')
      return
    }

    setVerifying(true)
    const { error } = await verifyOtp(email, token, fullName, whatsapp)
    setVerifying(false)

    if (error) {
      toast.error('Código inválido ou expirado. Tente novamente.')
      setOtpDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } else {
      toast.success('Email verificado! Bem-vindo(a) ao BolãoeChurras 🎉')
      navigate('/login')
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    const { error } = await resendOtp(email)
    if (error) {
      toast.error('Não foi possível reenviar o código. Tente em instantes.')
    } else {
      toast.success('Novo código enviado para ' + email)
      setOtpDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      startCooldown()
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

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
            {step === 'form' ? 'Crie sua conta de organizador' : 'Verifique seu email'}
          </p>
        </div>

        <div className="card p-6">

          {/* ── Step 1: Formulário ── */}
          {step === 'form' && (
            <>
              <h2 className="text-xl mb-6" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                CRIAR CONTA GRÁTIS
              </h2>

              <form onSubmit={handleFormSubmit}>
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
            </>
          )}

          {/* ── Step 2: Verificação OTP ── */}
          {step === 'otp' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '3.5rem', height: '3.5rem', borderRadius: '50%', marginBottom: '1rem',
                  background: 'rgba(0,156,59,0.12)', border: '1.5px solid rgba(0,156,59,0.3)'
                }}>
                  <ShieldCheck size={28} style={{ color: 'var(--color-verde)' }} />
                </div>
                <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  VERIFICAR EMAIL
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Enviamos um código de 6 dígitos para<br />
                  <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerify}>
                {/* Inputs OTP — 6 caixinhas */}
                <div style={{
                  display: 'flex', gap: '0.5rem', justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      style={{
                        width: '3rem', height: '3.5rem',
                        textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
                        borderRadius: '0.6rem',
                        border: `2px solid ${digit ? 'var(--color-verde)' : 'var(--border-color, rgba(255,255,255,0.12))'}`,
                        background: 'var(--bg-card, rgba(255,255,255,0.05))',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: digit ? '0 0 0 3px rgba(0,156,59,0.15)' : 'none',
                        caretColor: 'transparent',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--color-verde)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(0,156,59,0.2)'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = digit ? 'var(--color-verde)' : 'var(--border-color, rgba(255,255,255,0.12))'
                        e.target.style.boxShadow = digit ? '0 0 0 3px rgba(0,156,59,0.15)' : 'none'
                      }}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-azul btn-full"
                  disabled={verifying || otpDigits.join('').length < 6}
                  style={{ marginBottom: '0.75rem' }}
                >
                  {verifying ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Verificar código
                    </>
                  )}
                </button>

                {/* Reenviar código */}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.4rem', padding: '0.6rem',
                    background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--color-verde)',
                    fontSize: '0.88rem', fontWeight: 500,
                    transition: 'color 0.2s',
                  }}
                >
                  <RotateCcw size={14} />
                  {resendCooldown > 0
                    ? `Reenviar em ${resendCooldown}s`
                    : 'Reenviar código'
                  }
                </button>
              </form>

              <div className="divider" />
              <button
                type="button"
                onClick={() => setStep('form')}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center',
                  padding: '0.25rem',
                }}
              >
                ← Voltar e corrigir email
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
