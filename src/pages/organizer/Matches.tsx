import { useState } from 'react'
import { Calendar, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useGroupContext } from '../../contexts/GroupContext'
import type { Match } from '../../types'
import MatchResultModal from '../../components/organizer/MatchResultModal'
import toast from 'react-hot-toast'

export default function Matches() {
  const { activeGroup: group, matchesList, refreshActiveGroup, loading } = useGroupContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultMatch, setResultMatch] = useState<Match | null>(null)
  
  // Modal de Jogo Manual
  const [showManualMatchModal, setShowManualMatchModal] = useState(false)
  const [newMatch, setNewMatch] = useState({
    home_team: '', away_team: '', match_date: '', stage: ''
  })

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando jogos...</div>
  }

  if (!group) {
    return <div className="p-8 text-center text-gray-500">Nenhum grupo ativo selecionado.</div>
  }

  async function saveManualMatch(e: React.FormEvent) {
    e.preventDefault()
    if (!group) return
    setIsProcessing(true)
    const { error } = await supabase.from('matches').insert([{
      group_id: group.id,
      home_team: newMatch.home_team,
      away_team: newMatch.away_team,
      match_date: new Date(newMatch.match_date).toISOString(),
      stage: newMatch.stage,
      status: 'scheduled'
    }])
    if (!error) {
      toast.success('Jogo adicionado com sucesso!')
      setShowManualMatchModal(false)
      setNewMatch({ home_team: '', away_team: '', match_date: '', stage: '' })
      await refreshActiveGroup(true)
    } else {
      toast.error('Erro ao adicionar jogo')
    }
    setIsProcessing(false)
  }

  async function saveMatchResult(matchId: string, homeScore: number, awayScore: number) {
    if (!resultMatch) return
    setIsProcessing(true)
    const { error } = await supabase
      .from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'finished'
      })
      .eq('id', matchId)

    if (!error) {
      toast.success('Resultado salvo! Pontos calculados.')
      setResultMatch(null)
      await refreshActiveGroup(true)
    } else {
      toast.error('Erro ao salvar resultado')
    }
    setIsProcessing(false)
  }

  const hasMatchesStarted = matchesList.length > 0 && new Date(matchesList[0].match_date) <= new Date()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl flex items-center gap-2">
          <Calendar size={24} className="text-green-600" />
          Jogos ({matchesList.length})
        </h2>
        {!hasMatchesStarted && (
          <button
            onClick={() => setShowManualMatchModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-1"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Adicionar</span> Jogo
          </button>
        )}
      </div>

      {hasMatchesStarted && (
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm border border-yellow-200">
          <strong>Atenção:</strong> Como o primeiro jogo já começou (ou já passou da hora), a estrutura deste bolão está <strong>bloqueada</strong>. Você não pode mais adicionar jogos. Para uma nova rodada, crie um novo bolão.
        </div>
      )}

      {matchesList.length === 0 ? (
        <div className="card text-center p-10">
          <p className="text-gray-500">Nenhum jogo cadastrado.</p>
          <button className="btn btn-outline btn-sm mt-4" onClick={() => setShowManualMatchModal(true)}>
            Adicionar o primeiro jogo
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matchesList.map(match => (
            <div key={match.id} className="card p-4">
              <div className="text-center text-xs text-gray-400 mb-2 font-display uppercase tracking-wider">
                {match.stage} • {new Date(match.match_date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </div>
              
              <div className="flex justify-between items-center px-4">
                <div className="flex-1 text-right font-bold text-sm sm:text-base">
                  {match.home_team}
                </div>
                
                <div className="px-4">
                  {match.status === 'finished' ? (
                    <div className="bg-gray-100 rounded px-3 py-1 font-bold text-lg border border-gray-200">
                      {match.home_score} x {match.away_score}
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm text-xs"
                      onClick={() => setResultMatch(match)}
                      disabled={isProcessing}
                    >
                      Resultado
                    </button>
                  )}
                </div>

                <div className="flex-1 text-left font-bold text-sm sm:text-base">
                  {match.away_team}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {resultMatch && (
        <MatchResultModal
          match={resultMatch}
          onClose={() => setResultMatch(null)}
          onSave={saveMatchResult}
        />
      )}

      {showManualMatchModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-lg">Novo Jogo Manual</h3>
              <button onClick={() => setShowManualMatchModal(false)} className="btn btn-ghost p-2">✕</button>
            </div>
            
            <form onSubmit={saveManualMatch} className="flex flex-col gap-4">
              <div>
                <label className="input-label">Time Casa</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="Ex: Flamengo, Solteiros"
                  value={newMatch.home_team}
                  onChange={e => setNewMatch({ ...newMatch, home_team: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Time Visitante</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="Ex: Vasco, Casados"
                  value={newMatch.away_team}
                  onChange={e => setNewMatch({ ...newMatch, away_team: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Data e Hora</label>
                <input
                  type="datetime-local"
                  required
                  className="input"
                  value={newMatch.match_date}
                  onChange={e => setNewMatch({ ...newMatch, match_date: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Fase / Descrição</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="Ex: Final, Amistoso"
                  value={newMatch.stage}
                  onChange={e => setNewMatch({ ...newMatch, stage: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full mt-2" disabled={isProcessing}>
                {isProcessing ? 'Salvando...' : 'Adicionar Jogo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
