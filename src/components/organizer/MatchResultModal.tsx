import { useState } from 'react'
import { X, Save } from 'lucide-react'
import type { Match } from '../../types'

interface Props {
  match: Match
  onClose: () => void
  onSave: (matchId: string, homeScore: number, awayScore: number) => Promise<void>
}

export default function MatchResultModal({ match, onClose, onSave }: Props) {
  const [homeScore, setHomeScore] = useState<number | ''>(match.home_score ?? '')
  const [awayScore, setAwayScore] = useState<number | ''>(match.away_score ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(match.id, homeScore === '' ? 0 : homeScore, awayScore === '' ? 0 : awayScore)
    setSaving(false)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 360, padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
            INSERIR RESULTADO
          </h2>
          <button className="btn btn-ghost btn-sm" style={{ padding: '0.4rem' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {match.stage}
        </p>

        <div className="flex items-center gap-4" style={{ marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.5rem' }}>
              {match.home_flag} {match.home_team}
            </p>
            <input
              type="number"
              className="score-input"
              style={{ width: '100%', maxWidth: 80, margin: '0 auto', display: 'block' }}
              value={homeScore}
              onChange={e => {
                const val = e.target.value
                setHomeScore(val === '' ? '' : Math.max(0, parseInt(val) || 0))
              }}
              min={0}
              max={20}
            />
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-muted)' }}>
            ×
          </div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.5rem' }}>
              {match.away_team} {match.away_flag}
            </p>
            <input
              type="number"
              className="score-input"
              style={{ width: '100%', maxWidth: 80, margin: '0 auto', display: 'block' }}
              value={awayScore}
              onChange={e => {
                const val = e.target.value
                setAwayScore(val === '' ? '' : Math.max(0, parseInt(val) || 0))
              }}
              min={0}
              max={20}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-ghost btn-full" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Salvando...</>
            ) : (
              <><Save size={16} /> Salvar Resultado</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
