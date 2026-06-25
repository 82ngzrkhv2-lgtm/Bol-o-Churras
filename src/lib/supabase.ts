import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase env vars missing. Using mock mode.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 2 },
  },
  global: {
    fetch: (url, options = {}) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      return fetch(url, { ...options, signal: controller.signal }).finally(() =>
        clearTimeout(timeout)
      )
    },
  },
})


export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      groups: {
        Row: {
          id: string
          organizer_id: string
          name: string
          slug: string
          description: string | null
          pool_entry_fee: number
          event_date: string | null
          event_location: string | null
          pix_key: string | null
          pix_qrcode: string | null
          scoring_exact: boolean
          scoring_winner: boolean
          points_exact: number
          points_winner: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['groups']['Insert']>
      }
      participants: {
        Row: {
          id: string
          group_id: string
          name: string
          whatsapp: string
          has_paid: boolean
          paid_at: string | null
          confirmed_presence: boolean
          avatar_seed: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['participants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['participants']['Insert']>
      }
      matches: {
        Row: {
          id: string
          group_id: string
          external_id: number | null
          home_team: string
          away_team: string
          home_flag: string | null
          away_flag: string | null
          match_date: string
          stage: string
          status: 'scheduled' | 'live' | 'finished' | 'cancelled'
          home_score: number | null
          away_score: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      predictions: {
        Row: {
          id: string
          match_id: string
          participant_id: string
          home_prediction: number
          away_prediction: number
          points_earned: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['predictions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['predictions']['Insert']>
      }
      event_items: {
        Row: {
          id: string
          group_id: string
          participant_id: string | null
          item_name: string
          quantity: string
          unit: string
          assigned: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['event_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['event_items']['Insert']>
      }
    }
  }
}
