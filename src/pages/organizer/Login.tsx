import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, ShieldCheck, RotateCcw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signInOtp, verifyLoginOtp } = useAuth()

  // Abas de login: 'password' (senha) ou 'otp' (código de acesso)
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password')

  // Fluxo de senha
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Fluxo de OTP (Código de acesso)
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '', '', ''])
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup do timer ao desmontar
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [])

  // Foca o primeiro input quando entra na tela de digitação do código
  useEffect(() => {
    if (otpStep === 'code' && loginMethod === 'otp') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
      startCooldown()
    }
  }, [otpStep, loginMethod])

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

  // ─── LOGIN COM SENHA ─────────────────────────────────────────────────────────
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast.error('E-mail ou senha incorretos.')
    } else {
      toast.success('Bem-vindo de volta! ⚽')
      navigate('/dashboard')
    }
  }

  // ─── LOGIN COM OTP: PASSO 1 (Enviar Código) ──────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      toast.error('Informe seu e-mail.')
      return
    }

    setSendingCode(true)
    const { error } = await signInOtp(email)
    setSendingCode(false)

    if (error) {
      toast.error(error.message || 'Erro ao enviar código de acesso.')
    } else {
      toast.success('Código enviado para ' + email)
      setOtpStep('code')
    }
  }

  // ─── LOGIN COM OTP: PASSO 2 (Verificar Código) ───────────────────────────────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    const token = otpDigits.join('')
    if (token.length < 8) {
      toast.error('Digite o código completo de 8 dígitos.')
      return
    }

    setVerifyingCode(true)
    const { error } = await verifyLoginOtp(email, token)
    setVerifyingCode(false)

    if (error) {
      toast.error(error.message || 'Código inválido ou expirado.')
      setOtpDigits(['', '', '', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } else {
      toast.success('Login realizado com sucesso! ⚽')
      navigate('/dashboard')
    }
  }

  // ─── REENVIAR CÓDIGO DE LOGIN ────────────────────────────────────────────────
  async function handleResendLoginOtp() {
    if (resendCooldown > 0 || sendingCode) return

    setSendingCode(true)
    const { error } = await signInOtp(email)
    setSendingCode(false)

    if (error) {
      toast.error(error.message || 'Não foi possível reenviar o código.')
    } else {
      toast.success('Novo código enviado para ' + email)
      setOtpDigits(['', '', '', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      startCooldown()
    }
  }

  // ─── CONTROLE DOS INPUTS DE OTP ──────────────────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = digit
    setOtpDigits(newDigits)

    if (digit && index < 7) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        const newDigits = [...otpDigits]
        newDigits[index] = ''
        setOtpDigits(newDigits)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 7) inputRefs.current[index + 1]?.focus()
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    if (!pasted) return
    const newDigits = [...otpDigits]
    pasted.split('').forEach((ch, i) => { newDigits[i] = ch })
    setOtpDigits(newDigits)
    const nextIndex = Math.min(pasted.length, 7)
    inputRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      {/* Background decorativo */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at top, rgba(0,39,118,0.2) 0%, transparent 60%), radial-gradient(ellipse at bottom-left, rgba(0,156,59,0.15) 0%, transparent 60%)',
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
          {/* Seletor de método de login */}
          {otpStep !== 'code' && (
            <div style={{
              display: 'flex',
              background: 'var(--bg-card, rgba(255,255,255,0.05))',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1.5px solid var(--border-default, rgba(255,255,255,0.1))'
            }}>
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                  background: loginMethod === 'password' ? 'var(--color-verde)' : 'transparent',
                  color: loginMethod === 'password' ? '#fff' : 'var(--text-secondary)',
                  border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Entrar com Senha
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('otp')}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                  background: loginMethod === 'otp' ? 'var(--color-verde)' : 'transparent',
                  color: loginMethod === 'otp' ? '#fff' : 'var(--text-secondary)',
                  border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Entrar com Código
              </button>
            </div>
          )}

          {/* ── METODO 1: LOGIN COM SENHA ── */}
          {loginMethod === 'password' && (
            <>
              <h2 className="text-xl mb-6" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                ENTRAR COM SENHA
              </h2>

              <form onSubmit={handlePasswordSubmit}>
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
                  <label className="input-label" htmlFor="password">Senha</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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

                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
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
            </>
          )}

          {/* ── METODO 2: LOGIN COM OTP (CÓDIGO DE 6 DÍGITOS) ── */}
          {loginMethod === 'otp' && (
            <>
              {otpStep === 'email' && (
                <>
                  <h2 className="text-xl mb-6" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    ENTRAR COM CÓDIGO
                  </h2>
                  <form onSubmit={handleSendOtp}>
                    <div className="input-group">
                      <label className="input-label" htmlFor="emailOtp">Informe seu E-mail</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          id="emailOtp"
                          type="email"
                          className="input"
                          style={{ paddingLeft: '2.5rem' }}
                          placeholder="seu@email.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={sendingCode} style={{ marginTop: '0.5rem' }}>
                      {sendingCode ? (
                        <>
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Enviando código...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          Enviar Código de Acesso
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {otpStep === 'code' && (
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
                      CÓDIGO DE ACESSO
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                      Enviamos um código de 8 dígitos para seu e-mail:<br />
                      <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp}>
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
                            width: '2.4rem', height: '3rem',
                            textAlign: 'center', fontSize: '1.3rem', fontWeight: 700,
                            borderRadius: '0.6rem',
                            border: `2px solid ${digit ? 'var(--color-verde)' : 'var(--border-color, rgba(255,255,255,0.12))'}`,
                            background: 'var(--bg-card, rgba(255,255,255,0.05))',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                            boxShadow: digit ? '0 0 0 3px rgba(0,156,59,0.15)' : 'none',
                            caretColor: 'transparent',
                          }}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-azul btn-full"
                      disabled={verifyingCode || otpDigits.join('').length < 8}
                      style={{ marginBottom: '0.75rem' }}
                    >
                      {verifyingCode ? (
                        <>
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          <LogIn size={18} />
                          Confirmar Código e Entrar
                        </>
                      )}
                    </button>

                    {/* Reenviar código */}
                    <button
                      type="button"
                      onClick={handleResendLoginOtp}
                      disabled={resendCooldown > 0 || sendingCode}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.4rem', padding: '0.6rem',
                        background: 'none', border: 'none', cursor: (resendCooldown > 0 || sendingCode) ? 'not-allowed' : 'pointer',
                        color: (resendCooldown > 0 || sendingCode) ? 'var(--text-muted)' : 'var(--color-verde)',
                        fontSize: '0.88rem', fontWeight: 500,
                        transition: 'color 0.2s',
                      }}
                    >
                      {sendingCode ? (
                        <>
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-[var(--color-verde)] border-t-transparent rounded-full" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <RotateCcw size={14} />
                          {resendCooldown > 0
                            ? `Reenviar em ${resendCooldown}s`
                            : 'Reenviar código'
                          }
                        </>
                      )}
                    </button>
                  </form>

                  <div className="divider" />
                  <button
                    type="button"
                    onClick={() => setOtpStep('email')}
                    style={{
                      width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center',
                      padding: '0.25rem',
                    }}
                  >
                    ← Alterar e-mail
                  </button>
                </>
              )}
            </>
          )}

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
