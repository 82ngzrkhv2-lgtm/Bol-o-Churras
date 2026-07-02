import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'
import { clearLastRoute, clearAllAppState } from '../lib/persistence'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string, whatsapp: string) => Promise<{ error: Error | null }>
  verifyOtp: (email: string, token: string, fullName: string, whatsapp: string) => Promise<{ error: Error | null }>
  resendOtp: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pega sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    // Escuta mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        
      if (data?.is_blocked) {
        await supabase.auth.signOut()
        setProfile(null)
        setUser(null)
        setSession(null)
        // Ensure toast is imported if we add toast here. Let's just alert for simplicity or use toast.
        alert('Sua conta foi suspensa. Contate o administrador.')
        return
      }

      setProfile(data)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string, whatsapp: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          whatsapp,
          accepted_terms_at: new Date().toISOString()
        }
      },
    })

    if (!error && data.user) {
      await supabase.from('profiles')
        .update({
          full_name: fullName,
          whatsapp,
          accepted_terms_at: new Date().toISOString()
        })
        .eq('id', data.user.id)
    }

    return { error }
  }, [])

  const verifyOtp = useCallback(async (email: string, token: string, fullName: string, whatsapp: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    })

    if (!error && data.user) {
      await supabase.from('profiles')
        .update({
          full_name: fullName,
          whatsapp,
          accepted_terms_at: new Date().toISOString()
        })
        .eq('id', data.user.id)
    }

    return { error }
  }, [])

  const resendOtp = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    // Limpa rota e estado de UI persistidos para que o próximo acesso
    // vá para a Landing Page (comportamento de app nativo após logout)
    clearLastRoute()
    clearAllAppState()
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signUp, verifyOtp, resendOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
