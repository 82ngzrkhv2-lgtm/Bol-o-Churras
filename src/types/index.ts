// Tipos centrais do sistema Bolão & Churras

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  whatsapp?: string | null
  is_admin?: boolean
  accepted_terms_at?: string | null
  created_at: string
}

export interface Group {
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
  platform_fee_paid?: boolean
  platform_fee_receipt_url?: string | null
  created_at: string
}

export interface Participant {
  id: string
  group_id: string
  name: string
  whatsapp: string
  has_paid: boolean
  payment_status: 'pending' | 'verifying' | 'paid'
  receipt_url?: string | null
  paid_at: string | null
  confirmed_presence: boolean
  avatar_seed: string
  accepted_terms_at?: string | null
  created_at: string
}

export interface Match {
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

export interface Prediction {
  id: string
  match_id: string
  participant_id: string
  home_prediction: number
  away_prediction: number
  points_earned: number
  created_at: string
}

export interface EventItem {
  id: string
  group_id: string
  participant_id: string | null
  item_name: string
  quantity: string
  unit: string
  assigned: boolean
  created_at: string
}

// Tipos compostos (JOINs comuns)
export interface RankingEntry {
  participant_id: string
  name: string
  avatar_seed: string
  total_points: number
  exact_scores: number
  correct_winners: number
  total_predictions: number
  position: number
}

export interface ParticipantWithStats extends Participant {
  total_points?: number
  position?: number
}

export interface MatchWithPrediction extends Match {
  prediction?: Prediction
}

export interface EventItemWithParticipant extends EventItem {
  participant?: Participant
}
