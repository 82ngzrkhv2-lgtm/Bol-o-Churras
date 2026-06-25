import { Crown, Target } from 'lucide-react'
import type { RankingEntry } from '../../types'

interface Props {
  ranking: RankingEntry[]
  currentParticipantId?: string
}

export default function RankingView({ ranking, currentParticipantId }: Props) {
  if (ranking.length === 0) {
    return (
      <div className="card text-center animate-fade-in" style={{ padding: '3rem 1.5rem', marginTop: '0.5rem' }}>
        <Crown size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-secondary)' }}>
          RANKING VAZIO
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Ninguém entrou no bolão ainda. Seja o primeiro!
        </p>
      </div>
    )
  }

  const isActive = ranking.some(r => r.total_points > 0)

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* Podium Top 3 */}
      {isActive && ranking.length >= 3 && (
        <div className="animate-fade-in-up" style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          padding: '1rem 0.5rem',
        }}>
          {/* 2nd Place */}
          <PodiumCard entry={ranking[1]} position={2} isCurrent={ranking[1]?.participant_id === currentParticipantId} />
          {/* 1st Place */}
          <PodiumCard entry={ranking[0]} position={1} isCurrent={ranking[0]?.participant_id === currentParticipantId} />
          {/* 3rd Place */}
          <PodiumCard entry={ranking[2]} position={3} isCurrent={ranking[2]?.participant_id === currentParticipantId} />
        </div>
      )}

      {/* Lista completa */}
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem',
        letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase',
        marginBottom: '0.75rem',
      }}>
        {isActive ? 'CLASSIFICAÇÃO COMPLETA' : 'PARTICIPANTES INSCRITOS'}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {ranking.map((entry, idx) => (
          <RankingRow
            key={entry.participant_id}
            entry={entry}
            isCurrent={entry.participant_id === currentParticipantId}
            className={`animate-fade-in-up stagger-${Math.min(idx + 1, 5)}`}
          />
        ))}
      </div>

      {!isActive && (
        <div style={{
          textAlign: 'center', marginTop: '1.5rem',
          color: 'var(--text-muted)', fontSize: '0.82rem',
        }}>
          O ranking será atualizado assim que os jogos tiverem resultados 🏆
        </div>
      )}
    </div>
  )
}

function PodiumCard({ entry, position, isCurrent }: { entry: RankingEntry; position: number; isCurrent: boolean }) {
  const heights = { 1: 100, 2: 75, 3: 55 }
  const h = heights[position as keyof typeof heights]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <img
        src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${entry.avatar_seed}&backgroundColor=16A34A`}
        alt={entry.name}
        style={{
          width: position === 1 ? 54 : 42,
          height: position === 1 ? 54 : 42,
          borderRadius: '50%',
          border: `3px solid ${position === 1 ? '#FFD700' : position === 2 ? '#C0C0C0' : '#CD7F32'}`,
          boxShadow: isCurrent ? 'var(--shadow-verde)' : 'none',
        }}
      />
      <p style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: position === 1 ? '0.85rem' : '0.75rem',
        textAlign: 'center',
        maxWidth: '80px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: isCurrent ? 'var(--color-verde)' : 'var(--text-primary)',
      }}>
        {entry.name.split(' ')[0]}
      </p>
      <div style={{
        width: '100%', height: h,
        background: position === 1
          ? 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)'
          : position === 2
          ? 'linear-gradient(180deg, #C0C0C0 0%, #808080 100%)'
          : 'linear-gradient(180deg, #CD7F32 0%, #8B4513 100%)',
        borderRadius: '8px 8px 0 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.15rem',
        boxShadow: `0 -4px 12px ${position === 1 ? 'rgba(255,215,0,0.4)' : 'rgba(0,0,0,0.2)'}`,
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: position === 1 ? '1.1rem' : '0.85rem', color: '#000' }}>
          {position}°
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.78rem', color: '#000' }}>
          {entry.total_points}pts
        </span>
      </div>
    </div>
  )
}

function RankingRow({ entry, isCurrent, className }: { entry: RankingEntry; isCurrent: boolean; className?: string }) {
  const medalColors: Record<number, string> = {
    1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32',
  }

  return (
    <div className={`card ${className || ''}`} style={{
      padding: '0.75rem 1rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      borderColor: isCurrent ? 'var(--border-accent)' : 'var(--border-default)',
      background: isCurrent ? 'var(--color-verde-bg)' : 'var(--bg-card)',
    }}>
      {/* Posição */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: medalColors[entry.position]
          ? `linear-gradient(135deg, ${medalColors[entry.position]}, ${medalColors[entry.position]}aa)`
          : 'var(--bg-elevated)',
        fontFamily: 'var(--font-display)', fontWeight: 900,
        fontSize: '0.8rem',
        color: entry.position <= 3 ? '#000' : 'var(--text-secondary)',
        boxShadow: entry.position === 1 ? '0 0 8px rgba(255,215,0,0.5)' : 'none',
      }}>
        {entry.position}
      </div>

      {/* Avatar */}
      <img
        src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${entry.avatar_seed}&backgroundColor=16A34A`}
        alt={entry.name}
        style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${isCurrent ? 'var(--color-verde)' : 'var(--border-default)'}`,
        }}
      />

      {/* Nome + stats */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-1.5">
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: isCurrent ? 'var(--color-verde)' : 'var(--text-primary)',
          }}>
            {entry.name} {isCurrent && '(você)'}
          </p>
          {entry.position === 1 && <Crown size={14} style={{ color: '#FFD700', flexShrink: 0 }} />}
        </div>
        <div className="flex items-center gap-2" style={{ marginTop: '0.15rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            <Target size={10} style={{ display: 'inline', marginRight: 2 }} />
            {entry.exact_scores} exatos
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            {entry.total_predictions} palpites
          </span>
        </div>
      </div>

      {/* Pontos */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.3rem',
          color: entry.position === 1 ? '#FFD700' : isCurrent ? 'var(--color-verde)' : 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {entry.total_points}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontFamily: 'var(--font-display)' }}>
          PONTOS
        </div>
      </div>
    </div>
  )
}
