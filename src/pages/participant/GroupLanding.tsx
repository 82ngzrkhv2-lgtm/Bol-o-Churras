import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Trophy, DollarSign, Calendar, ArrowRight, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Group, Participant, Match, RankingEntry } from '../../types'
import { generateAvatarSeed } from '../../lib/api-football'
import IdentityModal from '../../components/participant/IdentityModal'
import PredictionsView from '../../components/participant/PredictionsView'
import RankingView from '../../components/participant/RankingView'
import EventRSVP from '../../components/participant/EventRSVP'
import ItemsView from '../../components/participant/ItemsView'
import toast from 'react-hot-toast'

type Tab = 'ranking' | 'palpites' | 'evento' | 'itens'

export default function GroupLanding() {
  const { slug } = useParams<{ slug: string }>()
  const [group, setGroup] = useState<Group | null>(null)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showIdentity, setShowIdentity] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('ranking')
  const [totalArrecadado, setTotalArrecadado] = useState(0)

  // Restaurar participante do localStorage
  useEffect(() => {
    if (slug) {
      const saved = localStorage.getItem(`bolao-participant-${slug}`)
      if (saved) {
        try {
          setParticipant(JSON.parse(saved))
        } catch {}
      }
      loadGroup()
    }
  }, [slug])

  async function loadGroup() {
    setLoading(true)
    try {
      const { data: g, error } = await supabase
        .from('groups')
        .select('*')
        .eq('slug', slug!)
        .eq('is_active', true)
        .single()

      if (error || !g) { setNotFound(true); return }
      setGroup(g)

      const [{ data: m }, { data: parts }] = await Promise.all([
        supabase.from('matches').select('*').eq('group_id', g.id).order('match_date'),
        supabase.from('participants').select('*').eq('group_id', g.id),
      ])

      setMatches(m || [])
      const partsData = parts || []
      const paidCount = partsData.filter(p => p.payment_status === 'paid').length
      setTotalArrecadado(paidCount * (g.pool_entry_fee || 0))
      
      computeRanking(partsData, m || [])
    } finally {
      setLoading(false)
    }
  }

  async function computeRanking(parts: Participant[], ms: Match[]) {
    const finishedMatchIds = ms.filter(m => m.status === 'finished').map(m => m.id)
    if (finishedMatchIds.length === 0) {
      setRanking(parts.map((p, i) => ({
        participant_id: p.id,
        name: p.name,
        avatar_seed: p.avatar_seed,
        total_points: 0,
        exact_scores: 0,
        correct_winners: 0,
        total_predictions: 0,
        position: i + 1,
      })))
      return
    }

    const { data: preds } = await supabase
      .from('predictions')
      .select('*')
      .in('match_id', finishedMatchIds)

    const entries: RankingEntry[] = parts.map(p => {
      const myPreds = (preds || []).filter(pr => pr.participant_id === p.id)
      const total_points = myPreds.reduce((s, pr) => s + (pr.points_earned || 0), 0)
      const exact_scores = myPreds.filter(pr => {
        const m = ms.find(mm => mm.id === pr.match_id)
        return m && pr.home_prediction === m.home_score && pr.away_prediction === m.away_score
      }).length
      return {
        participant_id: p.id,
        name: p.name,
        avatar_seed: p.avatar_seed,
        total_points,
        exact_scores,
        correct_winners: myPreds.filter(pr => pr.points_earned > 0).length,
        total_predictions: myPreds.length,
        position: 0,
      }
    })

    entries.sort((a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores)
    entries.forEach((e, i) => { e.position = i + 1 })
    setRanking(entries)
  }

  async function handleIdentify(name: string, whatsapp: string) {
    if (!group) return

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('participants')
      .select('*')
      .eq('group_id', group.id)
      .eq('whatsapp', whatsapp.replace(/\D/g, ''))
      .single()

    let part: Participant

    if (existing) {
      part = existing
    } else {
      const seed = generateAvatarSeed(name, whatsapp)
      const { data: created, error } = await supabase
        .from('participants')
        .insert({
          group_id: group.id,
          name: name.trim(),
          whatsapp: whatsapp.replace(/\D/g, ''),
          has_paid: false,
          confirmed_presence: false,
          avatar_seed: seed,
          accepted_terms_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error || !created) {
        toast.error('Erro ao entrar no bolão. Tente novamente.')
        return
      }
      part = created
    }

    setParticipant(part)
    localStorage.setItem(`bolao-participant-${slug}`, JSON.stringify(part))
    setShowIdentity(false)
    toast.success(`Bem-vindo, ${part.name}! ⚽`)
    setActiveTab('palpites')
    await loadGroup()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center animate-fade-in">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚽</div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            CARREGANDO BOLÃO...
          </p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center animate-fade-in container-app">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😅</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '0.75rem' }}>
            BOLÃO NÃO ENCONTRADO
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Verifique o link com o organizador do bolão.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', paddingBottom: '80px' }}>
      {/* Hero Header */}
      <header style={{
        background: 'linear-gradient(180deg, rgba(22,163,74,0.15) 0%, transparent 100%)',
        padding: '1.5rem 1rem 1rem',
        borderBottom: '1px solid var(--border-default)',
      }}>
        <div className="container-app">
          {/* Logo + Nome */}
          <div className="flex items-center gap-3 mb-4">
            <div style={{
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', lineHeight: 1 }}>
                {group?.name}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                Bolão<span style={{ color: 'var(--color-verde)' }}>&</span>Churras
              </p>
            </div>
          </div>

          {/* Chips de info */}
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <span className="badge badge-verde">
              <Trophy size={11} />
              {ranking.length} jogadores
            </span>
            {group?.pool_entry_fee && group.pool_entry_fee > 0 && (
              <span className="badge badge-amarelo">
                <DollarSign size={11} />
                R$ {group.pool_entry_fee}/pessoa
              </span>
            )}
            {group?.pool_entry_fee && group.pool_entry_fee > 0 && (
              <span className="badge badge-verde">
                <DollarSign size={11} />
                Arrecadado: R$ {totalArrecadado.toFixed(2)}
              </span>
            )}
            {group?.event_date && (
              <span className="badge badge-azul">
                <Calendar size={11} />
                {new Date(group.event_date).toLocaleDateString('pt-BR')}
              </span>
            )}
            {group?.event_location && (
              <span className="badge badge-muted">
                📍 {group.event_location}
              </span>
            )}
          </div>

          {/* Participante atual */}
          {participant ? (
            <div className="flex items-center justify-between mt-4" style={{
              background: 'var(--color-verde-bg)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
            }}>
              <div className="flex items-center gap-2">
                <img
                  src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${participant.avatar_seed}&backgroundColor=16A34A`}
                  alt={participant.name}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--color-verde)' }}
                />
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.1 }}>
                    {participant.name}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {participant.payment_status === 'paid' ? '✅ Pagamento confirmado' : '⏳ Pagamento pendente'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {ranking.find(r => r.participant_id === participant.id) && (
                  <div className="flex items-center gap-1" style={{ color: 'var(--color-amarelo)' }}>
                    <Star size={14} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem' }}>
                      {ranking.find(r => r.participant_id === participant.id)?.total_points || 0} pts
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: '1rem' }}
              onClick={() => setShowIdentity(true)}
            >
              Entrar no Bolão
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Tabs de Navegação */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div className="container-app">
          <div className="flex" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
            {(['ranking', 'palpites', 'evento', 'itens'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  if ((tab === 'palpites' || tab === 'evento' || tab === 'itens') && !participant) {
                    setShowIdentity(true)
                    return
                  }
                  setActiveTab(tab)
                }}
                style={{
                  flex: '0 0 auto',
                  minWidth: '25%',
                  padding: '0.9rem 0.5rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--color-verde)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--color-verde)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                {tab === 'ranking' ? '🏆 Ranking' : tab === 'palpites' ? '⚽ Palpites' : tab === 'evento' ? '🍖 Evento' : '🛒 Itens'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container-app" style={{ padding: '1rem' }}>
        {activeTab === 'ranking' && (
          <RankingView
            ranking={ranking}
            currentParticipantId={participant?.id}
          />
        )}
        {activeTab === 'palpites' && participant && (
          <PredictionsView
            group={group!}
            participant={participant}
            matches={matches}
            onUpdate={loadGroup}
          />
        )}
        {activeTab === 'evento' && participant && group && (
          <EventRSVP
            group={group}
            participant={participant}
            onUpdate={async () => {
              await loadGroup()
              const { data } = await supabase.from('participants').select('*').eq('id', participant.id).single()
              if (data) {
                setParticipant(data)
                localStorage.setItem(`bolao-participant-${slug}`, JSON.stringify(data))
              }
            }}
          />
        )}
        {activeTab === 'itens' && participant && group && (
          <ItemsView
            group={group}
            participant={participant}
            onUpdate={loadGroup}
          />
        )}
      </div>

      {/* Identity Modal */}
      {showIdentity && (
        <IdentityModal
          groupName={group?.name || ''}
          onIdentify={handleIdentify}
          onClose={() => setShowIdentity(false)}
        />
      )}
    </div>
  )
}
