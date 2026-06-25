import { useState, useEffect } from 'react'
import { Target, Lock, Clock, Medal } from 'lucide-react'
import { useGroupContext } from '../../contexts/GroupContext'
import { supabase } from '../../lib/supabase'

export default function Predictions() {
  const { activeGroup: group, loading, participantsList, matchesList } = useGroupContext()
  const [predictionsByMatch, setPredictionsByMatch] = useState<Record<string, any[]>>({})
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && group && matchesList.length > 0) {
      fetchPredictions()
    } else if (!loading) {
      setFetching(false)
    }
  }, [loading, group, matchesList])

  async function fetchPredictions() {
    setFetching(true)
    const matchIds = matchesList.map(m => m.id)
    const { data: preds } = await supabase
      .from('predictions')
      .select('*')
      .in('match_id', matchIds)
      .order('created_at', { ascending: true })

    const grouped: Record<string, any[]> = {}
    
    // Initialize empty arrays for all matches
    matchesList.forEach(m => grouped[m.id] = [])

    if (preds) {
      preds.forEach(p => {
        if (!grouped[p.match_id]) grouped[p.match_id] = []
        const participant = participantsList.find(part => part.id === p.participant_id)
        if (participant) {
          grouped[p.match_id].push({
            ...p,
            participant
          })
        }
      })
    }

    setPredictionsByMatch(grouped)
    setFetching(false)
  }

  if (loading || fetching) {
    return <div className="p-8 text-center text-gray-500">Carregando palpites...</div>
  }

  if (!group) {
    return <div className="p-8 text-center text-gray-500">Nenhum grupo ativo selecionado.</div>
  }

  const paidList = participantsList.filter((p: any) => p.payment_status === 'paid')
  const platformDebt = paidList.length * 1.00
  
  // Encerramento dos palpites: considerado quando o primeiro jogo começa
  const hasMatchesStarted = matchesList.length > 0 && new Date(matchesList[0].match_date) <= new Date()
  
  const isFeeUnpaid = platformDebt > 0 && !group.platform_fee_paid
  const isBlocked = !hasMatchesStarted || isFeeUnpaid

  if (isBlocked) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl flex items-center gap-2">
            <Target size={24} className="text-purple-500" />
            Palpites da Galera
          </h2>
        </div>
        <div className="card text-center p-10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Lock size={32} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2 text-gray-800">Visão Bloqueada</h3>
            <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
              {!hasMatchesStarted 
                ? 'Os palpites da galera serão liberados após o início do primeiro jogo (encerramento dos palpites) e pagamento da taxa.' 
                : `Para ver os palpites de cada participante e a ordem de chegada, faça o repasse da Taxa da Plataforma (R$ ${platformDebt.toFixed(2).replace('.', ',')}) na aba Financeiro.`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl flex items-center gap-2">
          <Target size={24} className="text-purple-500" />
          Palpites da Galera (Ordem de Chegada)
        </h2>
      </div>

      <div className="flex flex-col gap-6">
        {matchesList.map(match => {
          const preds = predictionsByMatch[match.id] || []
          // Highlight up to top 10
          const displayPreds = preds.slice(0, 10)

          return (
            <div key={match.id} className="card overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 font-display font-bold text-gray-800">
                  <span>{match.home_team}</span>
                  <span className="text-gray-400 text-sm mx-1">vs</span>
                  <span>{match.away_team}</span>
                </div>
                {match.status === 'finished' && (
                  <div className="bg-gray-200 px-3 py-1 rounded-full text-sm font-bold">
                    {match.home_score} x {match.away_score}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                {preds.length === 0 ? (
                  <p className="text-gray-500 text-center text-sm py-4">Nenhum palpite registrado para este jogo ainda.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {displayPreds.map((pred, index) => {
                      let medalColor = 'text-gray-300'
                      let bgColor = 'bg-white'
                      if (index === 0) { medalColor = 'text-yellow-500'; bgColor = 'bg-yellow-50/50' }
                      else if (index === 1) { medalColor = 'text-gray-400'; bgColor = 'bg-gray-50/50' }
                      else if (index === 2) { medalColor = 'text-orange-400'; bgColor = 'bg-orange-50/50' }

                      return (
                        <div key={pred.id} className={`flex items-center justify-between p-3 rounded-lg border border-gray-100 ${bgColor}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-6 text-center font-bold text-sm text-gray-400">
                              {index + 1}º
                            </div>
                            <img src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${pred.participant.avatar_seed}&backgroundColor=6366f1`} alt={pred.participant.name} className="w-8 h-8 rounded-full" />
                            <div>
                              <p className="font-bold text-sm text-gray-800">{pred.participant.name}</p>
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(pred.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="font-display font-bold text-lg bg-gray-100 px-3 py-1 rounded-md">
                              {pred.home_prediction} x {pred.away_prediction}
                            </div>
                            {index < 3 && <Medal size={20} className={medalColor} />}
                          </div>
                        </div>
                      )
                    })}
                    {preds.length > 10 && (
                      <p className="text-center text-xs text-gray-400 mt-2">
                        Mais {preds.length - 10} palpites ocultos (exibindo apenas o Top 10).
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
