import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, Clock, Lock, Trophy } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Group, Match, Participant, Prediction } from '../../types'
import { canPredict, formatMatchDate } from '../../lib/api-football'
import { getPredictionStatus } from '../../lib/scoring'
import toast from 'react-hot-toast'

interface Props {
  group: Group
  participant: Participant
  matches: Match[]
  onUpdate: () => void
}

export default function PredictionsView({ participant, matches }: Props) {
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadPredictions()
  }, [participant.id])

  async function loadPredictions() {
    const matchIds = matches.map(m => m.id)
    if (!matchIds.length) { setLoading(false); return }

    const { data } = await supabase
      .from('predictions')
      .select('*')
      .eq('participant_id', participant.id)
      .in('match_id', matchIds)

    const map: Record<string, Prediction> = {}
    for (const p of data || []) map[p.match_id] = p
    setPredictions(map)
    setLoading(false)
  }

  const savePrediction = useCallback(async (matchId: string, home: number, away: number) => {
    setSaving(s => ({ ...s, [matchId]: true }))
    try {
      const existing = predictions[matchId]
      if (existing) {
        const { data } = await supabase
          .from('predictions')
          .update({ home_prediction: home, away_prediction: away })
          .eq('id', existing.id)
          .select()
          .single()
        if (data) setPredictions(p => ({ ...p, [matchId]: data }))
      } else {
        const { data } = await supabase
          .from('predictions')
          .insert({
            match_id: matchId,
            participant_id: participant.id,
            home_prediction: home,
            away_prediction: away,
            points_earned: 0,
          })
          .select()
          .single()
        if (data) setPredictions(p => ({ ...p, [matchId]: data }))
      }
      toast.success('Palpite salvo! ⚽', { id: `save-${matchId}` })
    } catch {
      toast.error('Erro ao salvar palpite')
    } finally {
      setSaving(s => ({ ...s, [matchId]: false }))
    }
  }, [predictions, participant.id])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 130 }} />)}
      </div>
    )
  }

  const upcomingMatches = matches.filter(m => canPredict(m.match_date, m.status))
  const pastMatches = matches.filter(m => !canPredict(m.match_date, m.status))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
      {/* Placar do participante */}
      <div className="card" style={{
        padding: '1rem',
        background: 'linear-gradient(135deg, var(--color-azul-bg), var(--color-verde-bg))',
        borderColor: 'var(--border-accent)',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2rem', color: 'var(--color-amarelo)', lineHeight: 1 }}>
            {Object.values(predictions).reduce((s, p) => s + (p.points_earned || 0), 0)}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
            PONTOS
          </p>
        </div>
        <div style={{ width: 1, height: 40, background: 'var(--border-default)' }} />
        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1 }}>
            {Object.keys(predictions).length}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
            PALPITES
          </p>
        </div>
        <div style={{ width: 1, height: 40, background: 'var(--border-default)' }} />
        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-verde)', lineHeight: 1 }}>
            {Object.values(predictions).filter(p => (p.points_earned || 0) > 0).length}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
            ACERTOS
          </p>
        </div>
      </div>

      {/* Jogos abertos para palpite */}
      {upcomingMatches.length > 0 && (
        <section>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            ⚽ Próximos Jogos — Dê seu Palpite
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingMatches.map((match, idx) => (
              <MatchPredictionCard
                key={match.id}
                match={match}
                prediction={predictions[match.id]}
                saving={saving[match.id]}
                onSave={savePrediction}
                className={`animate-fade-in-up stagger-${Math.min(idx + 1, 5)}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Jogos encerrados */}
      {pastMatches.length > 0 && (
        <section>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            🏁 Jogos Encerrados
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pastMatches.map(match => (
              <MatchResultCard
                key={match.id}
                match={match}
                prediction={predictions[match.id]}
              />
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <div className="card text-center" style={{ padding: '3rem 1.5rem' }}>
          <Trophy size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
            AGUARDANDO JOGOS
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            O organizador ainda não cadastrou os jogos.
          </p>
        </div>
      )}
    </div>
  )
}

interface MatchCardProps {
  match: Match
  prediction?: Prediction
  saving?: boolean
  onSave: (matchId: string, home: number, away: number) => void
  className?: string
}

function MatchPredictionCard({ match, prediction, saving, onSave, className }: MatchCardProps) {
  const [home, setHome] = useState(prediction?.home_prediction ?? '')
  const [away, setAway] = useState(prediction?.away_prediction ?? '')

  useEffect(() => {
    if (prediction) {
      setHome(prediction.home_prediction)
      setAway(prediction.away_prediction)
    }
  }, [prediction])

  function handleSave() {
    if (home === '' || away === '') return
    onSave(match.id, Number(home), Number(away))
  }

  const hasPrediction = prediction !== undefined

  return (
    <div className={`card ${className || ''}`} style={{
      padding: '1rem',
      borderColor: hasPrediction ? 'var(--border-accent)' : 'var(--border-default)',
    }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
          {match.stage}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
          {formatMatchDate(match.match_date)}
        </span>
      </div>

      <div className="flex items-center gap-2" style={{ marginBottom: '0.85rem' }}>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
            {match.home_flag} {match.home_team}
          </p>
        </div>

        <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
          <input
            type="number"
            className="score-input"
            value={home}
            onChange={e => setHome(Math.max(0, parseInt(e.target.value) || 0))}
            onBlur={handleSave}
            min={0}
            max={20}
            aria-label={`Palpite gols ${match.home_team}`}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--text-muted)', fontSize: '1.2rem' }}>×</span>
          <input
            type="number"
            className="score-input"
            value={away}
            onChange={e => setAway(Math.max(0, parseInt(e.target.value) || 0))}
            onBlur={handleSave}
            min={0}
            max={20}
            aria-label={`Palpite gols ${match.away_team}`}
          />
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
            {match.away_team} {match.away_flag}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`badge ${hasPrediction ? 'badge-verde' : 'badge-muted'}`} style={{ fontSize: '0.7rem' }}>
          {saving ? (
            <><span className="animate-spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" /> Salvando...</>
          ) : hasPrediction ? (
            <><CheckCircle size={11} /> Palpite salvo</>
          ) : (
            <><Clock size={11} /> Sem palpite</>
          )}
        </span>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving || home === '' || away === ''}
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem', minHeight: 32 }}
        >
          {hasPrediction ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}

function MatchResultCard({ match, prediction }: { match: Match; prediction?: Prediction }) {
  const status = prediction
    ? getPredictionStatus(
        { home_prediction: prediction.home_prediction, away_prediction: prediction.away_prediction, points_earned: prediction.points_earned },
        match
      )
    : 'pending'

  const statusConfig = {
    exact: { label: '🎯 Placar Exato!', color: 'var(--color-verde-dark)', bg: 'var(--color-verde-bg)' },
    winner: { label: '✅ Vencedor Certo', color: 'var(--color-verde)', bg: 'var(--color-verde-bg)' },
    miss: { label: '❌ Errou', color: '#B91C1C', bg: 'rgba(239,68,68,0.1)' },
    pending: { label: '—', color: 'var(--text-muted)', bg: 'transparent' },
  }[status]

  return (
    <div className="card" style={{ padding: '0.85rem', opacity: match.status === 'cancelled' ? 0.5 : 1 }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-display)' }}>{match.stage}</span>
        {prediction && (
          <span style={{
            background: statusConfig.bg,
            color: statusConfig.color,
            borderRadius: 'var(--radius-full)',
            padding: '0.15rem 0.55rem',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
          }}>
            {statusConfig.label} {prediction.points_earned > 0 && `+${prediction.points_earned}pts`}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{match.home_flag} {match.home_team}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--color-amarelo)', lineHeight: 1 }}>
            {match.home_score} × {match.away_score}
          </div>
          {prediction && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.2rem' }}>
              Palpite: {prediction.home_prediction}-{prediction.away_prediction}
            </div>
          )}
          {!prediction && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.2rem' }}>
              <Lock size={10} style={{ display: 'inline' }} /> Sem palpite
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{match.away_team} {match.away_flag}</p>
        </div>
      </div>
    </div>
  )
}
