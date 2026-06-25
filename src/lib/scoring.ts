import type { Match, Prediction, Group } from '../types'

/**
 * Calcula os pontos de um palpite baseado no resultado real
 */
export function calculatePoints(
  prediction: Pick<Prediction, 'home_prediction' | 'away_prediction'>,
  result: Pick<Match, 'home_score' | 'away_score'>,
  config: Pick<Group, 'scoring_exact' | 'scoring_winner' | 'points_exact' | 'points_winner'>
): number {
  if (result.home_score === null || result.away_score === null) return 0

  // Placar exato
  if (
    config.scoring_exact &&
    prediction.home_prediction === result.home_score &&
    prediction.away_prediction === result.away_score
  ) {
    return config.points_exact
  }

  // Vencedor correto (sem placar exato)
  if (config.scoring_winner) {
    const predictedWinner = Math.sign(prediction.home_prediction - prediction.away_prediction)
    const actualWinner = Math.sign(result.home_score - result.away_score)
    if (predictedWinner === actualWinner) {
      return config.points_winner
    }
  }

  return 0
}

/**
 * Determina o status visual de um palpite
 */
export type PredictionStatus = 'exact' | 'winner' | 'miss' | 'pending'

export function getPredictionStatus(
  prediction: Pick<Prediction, 'home_prediction' | 'away_prediction' | 'points_earned'>,
  match: Pick<Match, 'home_score' | 'away_score' | 'status'>
): PredictionStatus {
  if (match.status !== 'finished') return 'pending'
  if (match.home_score === null || match.away_score === null) return 'pending'

  if (
    prediction.home_prediction === match.home_score &&
    prediction.away_prediction === match.away_score
  ) return 'exact'

  if (prediction.points_earned > 0) return 'winner'

  return 'miss'
}

/**
 * Formata o score de um time para exibição
 */
export function formatScore(score: number | null): string {
  return score === null ? '-' : String(score)
}

/**
 * Ordena ranking por pontos e critérios de desempate
 */
export function sortRanking<T extends { total_points: number; exact_scores: number }>(
  entries: T[]
): T[] {
  return [...entries].sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points
    return b.exact_scores - a.exact_scores
  })
}
