import { Trophy, Lock } from 'lucide-react'
import { useGroupContext } from '../../contexts/GroupContext'
import { supabase } from '../../lib/supabase'
import type { RankingEntry } from '../../types'
import { useEffect, useState } from 'react'

export default function Ranking() {
  const { activeGroup: group, participantsList, matchesList, loading } = useGroupContext()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [computing, setComputing] = useState(true)

  useEffect(() => {
    if (!loading && group) {
      computeRanking()
    }
  }, [loading, group, participantsList, matchesList])

  async function computeRanking() {
    setComputing(true)
    const finishedMatchIds = matchesList.filter(m => m.status === 'finished').map(m => m.id)
    if (finishedMatchIds.length === 0) {
      setRanking(participantsList.map((p, i) => ({
        participant_id: p.id,
        name: p.name,
        avatar_seed: p.avatar_seed,
        total_points: 0,
        exact_scores: 0,
        correct_winners: 0,
        total_predictions: 0,
        position: i + 1,
      })))
      setComputing(false)
      return
    }

    const { data: preds } = await supabase
      .from('predictions')
      .select('*')
      .in('match_id', finishedMatchIds)

    const entries: RankingEntry[] = participantsList.map(p => {
      const myPreds = (preds || []).filter(pr => pr.participant_id === p.id)
      const total_points = myPreds.reduce((s, pr) => s + (pr.points_earned || 0), 0)
      const exact_scores = myPreds.filter(pr => {
        const m = matchesList.find(mm => mm.id === pr.match_id)
        return m && pr.home_prediction === m.home_score && pr.away_prediction === m.away_score
      }).length
      return {
        participant_id: p.id,
        name: p.name,
        avatar_seed: p.avatar_seed,
        total_points,
        exact_scores,
        correct_winners: myPreds.filter(pr => pr.points_earned && pr.points_earned > 0).length,
        total_predictions: myPreds.length,
        position: 0,
      }
    })

    entries.sort((a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores)
    entries.forEach((e, i) => { e.position = i + 1 })
    setRanking(entries)
    setComputing(false)
  }

  if (loading || computing) {
    return <div className="p-8 text-center text-gray-500">Carregando ranking...</div>
  }

  if (!group) {
    return <div className="p-8 text-center text-gray-500">Nenhum evento ativo selecionado.</div>
  }

  const paidList = participantsList.filter(p => p.payment_status === 'paid')
  const platformDebt = paidList.length * 1.00
  
  // Encerramento dos palpites: considerado quando o primeiro jogo começa
  const hasMatchesStarted = matchesList.length > 0 && new Date(matchesList[0].match_date) <= new Date()
  
  const isFeeUnpaid = platformDebt > 0 && !group.platform_fee_paid
  const isBlocked = !hasMatchesStarted || isFeeUnpaid

  const exactWinners = ranking.filter(r => r.exact_scores > 0).sort((a, b) => b.exact_scores - a.exact_scores)
  const hasFinishedMatches = matchesList.some(m => m.status === 'finished')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl flex items-center gap-2">
          <Trophy size={24} className="text-yellow-500" />
          Ranking Geral
        </h2>
      </div>

      <div className="card p-2 relative">
        {isBlocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', borderRadius: 'var(--radius-md)' }}>
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Lock size={32} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2 text-gray-800">Ranking Bloqueado</h3>
            <p className="text-gray-600 text-sm mb-4">
              {!hasMatchesStarted 
                ? 'O ranking será liberado após o início do primeiro jogo (encerramento dos palpites) e pagamento da taxa.' 
                : `Faça o repasse da Taxa da Plataforma (R$ ${platformDebt.toFixed(2).replace('.', ',')}) na aba Financeiro para liberar os resultados finais.`}
            </p>
          </div>
        )}

        {ranking.length === 0 ? (
          <p className="text-center text-gray-500 p-8">Ninguém pontuou ainda.</p>
        ) : (
          <div className={`flex flex-col gap-6 ${isBlocked ? 'opacity-30 select-none' : ''}`}>
            
            {hasFinishedMatches && exactWinners.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-display font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <Trophy size={18} /> Ganhadores (Placar Exato)
                </h3>
                <div className="flex flex-col gap-2">
                  {exactWinners.map(w => (
                    <div key={'winner-' + w.participant_id} className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm">
                      <img src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${w.avatar_seed}&backgroundColor=F59E0B`} alt={w.name} className="w-8 h-8 rounded-full" />
                      <span className="font-bold text-sm text-gray-800 flex-1">{isBlocked ? 'Oculto' : w.name}</span>
                      <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {isBlocked ? '?' : w.exact_scores} {w.exact_scores === 1 ? 'acerto na mosca' : 'acertos na mosca'}
                      </span>
                    </div>
                  ))}
                </div>
                {exactWinners.length > 1 && (
                  <p className="text-xs text-yellow-700 mt-2 text-center font-semibold">Empate! O prêmio deve ser dividido entre {exactWinners.length} ganhadores.</p>
                )}
              </div>
            )}

            <div className="flex flex-col">
              <h3 className="font-display font-bold text-gray-700 mb-2 px-2">Classificação Completa</h3>
              {ranking.map((p, index) => (
              <div 
                key={p.participant_id} 
                className="flex items-center gap-4 p-3 border-b border-gray-100 last:border-0"
              >
                <div className={`font-display font-bold text-lg w-6 text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                  {p.position}º
                </div>
                <img
                  src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${p.avatar_seed}&backgroundColor=F59E0B`}
                  alt={p.name}
                  className="w-10 h-10 rounded-full bg-gray-100"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm">{isBlocked ? 'Participante Oculto' : p.name}</p>
                </div>
                <div className="font-display font-bold text-lg text-green-600">
                  {isBlocked ? '??' : p.total_points} <span className="text-xs text-gray-400">pts</span>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
