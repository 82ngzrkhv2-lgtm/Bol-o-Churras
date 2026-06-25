import type { Match } from '../types'

// API Football (api-sports.io) — Copa do Mundo 2026
// Documentação: https://www.api-football.com/documentation-v3
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || ''
const API_URL = import.meta.env.VITE_API_FOOTBALL_URL || 'https://v3.football.api-sports.io'

// Copa do Mundo 2026: League ID = 1 (FIFA World Cup), Season = 2026
const WORLD_CUP_LEAGUE_ID = 1
const WORLD_CUP_SEASON = 2026

/**
 * Busca jogos da Copa do Mundo 2026 via API Football
 */
export async function fetchWorldCupMatches(): Promise<Omit<Match, 'id' | 'group_id' | 'created_at'>[]> {
  if (!API_KEY) {
    console.warn('API Football key não configurada, usando dados mockados')
    return MOCK_MATCHES
  }

  try {
    const response = await fetch(
      `${API_URL}/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}&status=NS-LIVE-FT`,
      {
        headers: {
          'x-apisports-key': API_KEY,
        },
      }
    )

    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const data = await response.json()

    // Trata erro de plano gratuito (não acessa 2026) ou array vazio
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.warn('Erro na API Football (possivelmente limitação de plano):', data.errors)
      return MOCK_MATCHES
    }

    if (!data.response || data.response.length === 0) {
      console.warn('Nenhum jogo retornado pela API. Usando mock.')
      return MOCK_MATCHES
    }

    return data.response.map((fixture: ApiFixture) => ({
      external_id: fixture.fixture.id,
      home_team: fixture.teams.home.name,
      away_team: fixture.teams.away.name,
      home_flag: getTeamFlag(fixture.teams.home.name),
      away_flag: getTeamFlag(fixture.teams.away.name),
      match_date: fixture.fixture.date,
      stage: fixture.league.round || 'Fase de Grupos',
      status: mapStatus(fixture.fixture.status.short),
      home_score: fixture.goals.home,
      away_score: fixture.goals.away,
    }))
  } catch (err) {
    console.error('Erro ao buscar da API Football, usando mock:', err)
    return MOCK_MATCHES
  }
}

type FixtureStatus = 'NS' | 'LIVE' | '1H' | 'HT' | '2H' | 'ET' | 'BT' | 'P' | 'FT' | 'AET' | 'PEN' | 'SUSP' | 'INT' | 'PST' | 'CANC' | 'ABD' | 'AWD' | 'WO'

function mapStatus(apiStatus: FixtureStatus | string): Match['status'] {
  if (['NS', 'TBD'].includes(apiStatus)) return 'scheduled'
  if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(apiStatus)) return 'live'
  if (['FT', 'AET', 'PEN'].includes(apiStatus)) return 'finished'
  if (['SUSP', 'INT', 'PST', 'CANC', 'ABD'].includes(apiStatus)) return 'cancelled'
  return 'scheduled'
}

interface ApiFixture {
  fixture: { id: number; date: string; status: { short: string } }
  teams: { home: { name: string }; away: { name: string } }
  goals: { home: number | null; away: number | null }
  league: { round: string }
}

// Mapeamento de bandeiras de países (emojis) para os principais selecionados
const FLAG_MAP: Record<string, string> = {
  'Brazil': '🇧🇷', 'Brasil': '🇧🇷',
  'Argentina': '🇦🇷',
  'France': '🇫🇷', 'França': '🇫🇷',
  'Germany': '🇩🇪', 'Alemanha': '🇩🇪',
  'Spain': '🇪🇸', 'Espanha': '🇪🇸',
  'Portugal': '🇵🇹',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Italy': '🇮🇹', 'Itália': '🇮🇹',
  'Netherlands': '🇳🇱', 'Países Baixos': '🇳🇱',
  'Belgium': '🇧🇪', 'Bélgica': '🇧🇪',
  'Uruguay': '🇺🇾',
  'Colombia': '🇨🇴',
  'Mexico': '🇲🇽', 'México': '🇲🇽',
  'USA': '🇺🇸', 'United States': '🇺🇸', 'EUA': '🇺🇸',
  'Canada': '🇨🇦',
  'Japan': '🇯🇵', 'Japão': '🇯🇵',
  'South Korea': '🇰🇷', 'Coreia do Sul': '🇰🇷',
  'Morocco': '🇲🇦', 'Marrocos': '🇲🇦',
  'Senegal': '🇸🇳',
  'Australia': '🇦🇺', 'Austrália': '🇦🇺',
  'Croatia': '🇭🇷', 'Croácia': '🇭🇷',
  'Switzerland': '🇨🇭', 'Suíça': '🇨🇭',
  'Denmark': '🇩🇰', 'Dinamarca': '🇩🇰',
  'Poland': '🇵🇱', 'Polônia': '🇵🇱',
  'Saudi Arabia': '🇸🇦', 'Arábia Saudita': '🇸🇦',
  'Cameroon': '🇨🇲', 'Camarões': '🇨🇲',
  'Ghana': '🇬🇭',
  'Ecuador': '🇪🇨', 'Equador': '🇪🇨',
  'Serbia': '🇷🇸', 'Sérvia': '🇷🇸',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'País de Gales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Chile': '🇨🇱',
  'Paraguay': '🇵🇾',
  'Peru': '🇵🇪',
  'Bolivia': '🇧🇴',
  'Venezuela': '🇻🇪',
  'Tunisia': '🇹🇳', 'Tunísia': '🇹🇳',
  'Nigeria': '🇳🇬',
  'Egypt': '🇪🇬', 'Egito': '🇪🇬',
  'Iran': '🇮🇷',
  'Qatar': '🇶🇦',
  'South Africa': '🇿🇦', 'África do Sul': '🇿🇦',
}

export function getTeamFlag(teamName: string): string {
  return FLAG_MAP[teamName] || '🏳️'
}

// Dados mockados Copa do Mundo 2026 — fallback quando API não disponível
export const MOCK_MATCHES: Omit<Match, 'id' | 'group_id' | 'created_at'>[] = [
  {
    external_id: 1001,
    home_team: 'Brasil',
    away_team: 'México',
    home_flag: '🇧🇷',
    away_flag: '🇲🇽',
    match_date: '2026-07-15T18:00:00Z',
    stage: 'Fase de Grupos - Grupo E',
    status: 'scheduled',
    home_score: null,
    away_score: null,
  },
  {
    external_id: 1002,
    home_team: 'Argentina',
    away_team: 'Alemanha',
    home_flag: '🇦🇷',
    away_flag: '🇩🇪',
    match_date: '2026-07-16T15:00:00Z',
    stage: 'Fase de Grupos - Grupo A',
    status: 'scheduled',
    home_score: null,
    away_score: null,
  },
  {
    external_id: 1003,
    home_team: 'Portugal',
    away_team: 'França',
    home_flag: '🇵🇹',
    away_flag: '🇫🇷',
    match_date: '2026-06-17T21:00:00Z',
    stage: 'Fase de Grupos - Grupo F',
    status: 'finished',
    home_score: 2,
    away_score: 1,
  },
  {
    external_id: 1004,
    home_team: 'Espanha',
    away_team: 'Itália',
    home_flag: '🇪🇸',
    away_flag: '🇮🇹',
    match_date: '2026-06-18T18:00:00Z',
    stage: 'Fase de Grupos - Grupo D',
    status: 'live',
    home_score: 1,
    away_score: 0,
  },
  {
    external_id: 1005,
    home_team: 'Brasil',
    away_team: 'Cameroon',
    home_flag: '🇧🇷',
    away_flag: '🇨🇲',
    match_date: '2026-07-20T15:00:00Z',
    stage: 'Fase de Grupos - Grupo E',
    status: 'scheduled',
    home_score: null,
    away_score: null,
  },
  {
    external_id: 1006,
    home_team: 'EUA',
    away_team: 'Bélgica',
    home_flag: '🇺🇸',
    away_flag: '🇧🇪',
    match_date: '2026-07-21T21:00:00Z',
    stage: 'Fase de Grupos - Grupo B',
    status: 'scheduled',
    home_score: null,
    away_score: null,
  },
]

/**
 * Gera avatar baseado em seed (via DiceBear)
 */
export function getAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a0f1e`
}

/**
 * Gera seed de avatar aleatório
 */
export function generateAvatarSeed(name: string, whatsapp: string): string {
  return `${name}-${whatsapp}`.replace(/\s/g, '-').toLowerCase()
}

/**
 * Formata número de WhatsApp para link wa.me
 */
export function formatWhatsAppLink(whatsapp: string, message: string): string {
  const number = whatsapp.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/55${number}?text=${encoded}`
}

/**
 * Gera mensagem de cobrança para o WhatsApp
 */
export function generateChargeMessage(
  participantName: string,
  groupName: string,
  amount: number,
  pixKey: string
): string {
  return `⚽ Olá, ${participantName}!

Seu bolão *${groupName}* está aguardando pagamento.

💰 Valor: R$ ${amount.toFixed(2)}
🔑 PIX: ${pixKey}

Pague para garantir sua participação no ranking! 🏆

Bolão & Churras 🍖`
}

/**
 * Verifica se um jogo ainda pode receber palpites (até o início)
 */
export function canPredict(matchDate: string, status: Match['status']): boolean {
  if (status !== 'scheduled') return false
  return new Date(matchDate) > new Date()
}

/**
 * Formata data do jogo em pt-BR
 */
export function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
