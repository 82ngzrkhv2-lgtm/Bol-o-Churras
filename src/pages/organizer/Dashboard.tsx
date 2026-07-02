import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Trophy, Calendar, DollarSign, Target, Copy,
  ExternalLink, ChevronRight, Upload, QrCode, Plus
} from 'lucide-react'
import { useGroupContext } from '../../contexts/GroupContext'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { activeGroup: group, stats, loading } = useGroupContext()
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  function copyLink(slug: string) {
    const link = `${window.location.origin}/${slug}`
    navigator.clipboard.writeText(link)
    setCopiedSlug(slug)
    toast.success('Link copiado!')
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton" style={{ height: 100 }} />
        <div className="skeleton" style={{ height: 200 }} />
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    )
  }

  if (!group || !stats) {
    return (
      <div className="card text-center" style={{ padding: '3rem 1.5rem', marginTop: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.5rem' }}>
          Nenhum evento ainda
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Crie seu primeiro bolão e chame a galera!
        </p>
        <Link to="/dashboard/groups/new" className="btn btn-primary">
          Criar primeiro evento
        </Link>
      </div>
    )
  }

  const { participants, paid } = stats
  const totalRevenue = paid * group.pool_entry_fee
  const totalPending = (participants - paid) * group.pool_entry_fee
  const percentageCollected = participants > 0 ? Math.round((paid / participants) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Dashboard Page Header with 'Novo Evento' button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>
            Painel Geral
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
            Acompanhe o engajamento e as finanças do seu bolão
          </p>
        </div>
        <Link 
          to="/dashboard/groups/new" 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
        >
          <Plus size={18} />
          <span>Novo Evento</span>
        </Link>
      </div>

      {/* 4 KPIs Row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--color-verde-bg)', color: 'var(--color-verde)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Participantes</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>{participants}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{participants - paid} pendente</p>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--color-azul-bg)', color: 'var(--color-azul)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Jogos</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>0</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-verde)' }}>0 ao vivo</p>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--color-amarelo-bg)', color: 'var(--color-amarelo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Arrecadado</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>R$ {totalRevenue.toFixed(2)}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{percentageCollected}% do total</p>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Pendente</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>R$ {totalPending.toFixed(2)}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{participants - paid} pendentes</p>
          </div>
        </div>
      </section>

      {/* Active Group Card */}
      <section className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 80, height: 80,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>{group.name}</h2>
              {group.is_active && <span className="badge badge-verde" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>Ativo</span>}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>/{group.slug}</p>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={16} /> {participants} participantes</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-verde)' }}><Target size={16} /> {paid} pagos</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444' }}>{participants - paid} pendente</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>R$ {group.pool_entry_fee} / pessoa</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => copyLink(group.slug)}>
            {copiedSlug === group.slug ? <><Target size={18} /> Copiado!</> : <><Copy size={18} /> Copiar Link</>}
          </button>
          <Link to={`/dashboard/participants`} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            Gerenciar evento <ChevronRight size={18} />
          </Link>
          <a href={`/${group.slug}`} target="_blank" className="btn btn-ghost" style={{ padding: '0.5rem' }}>
            <ExternalLink size={20} />
          </a>
        </div>
      </section>

      {/* Quick Actions Row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Participantes', sub: 'Ver todos', icon: <Users size={24} color="var(--color-verde)" />, bg: 'var(--color-verde-bg)' },
          { label: 'Jogos', sub: 'Ver todos', icon: <Calendar size={24} color="var(--color-azul)" />, bg: 'var(--color-azul-bg)' },
          { label: 'Evento', sub: 'Ver evento', icon: <Calendar size={24} color="var(--color-amarelo)" />, bg: 'var(--color-amarelo-bg)' },
          { label: 'Pagamentos', sub: 'Ver cobranças', icon: <DollarSign size={24} color="var(--color-verde)" />, bg: 'var(--color-verde-bg)' },
          { label: 'Ranking', sub: 'Ver ranking', icon: <Trophy size={24} color="#8B5CF6" />, bg: 'rgba(139, 92, 246, 0.1)' },
        ].map((act, i) => (
          <div key={i} className="card hover-bg-muted cursor-pointer" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'var(--transition-fast)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '16px', background: act.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              {act.icon}
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{act.label}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{act.sub}</p>
          </div>
        ))}
      </section>

      {/* 3 Columns Layout */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Próximos Jogos */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase' }}>Próximos Jogos</h3>
            <span style={{ color: 'var(--color-verde)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Ver todos</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
            Nenhum jogo cadastrado.
          </div>
          <button className="btn btn-outline btn-full btn-sm">Ver todos os jogos</button>
        </div>

        {/* Ranking Geral */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase' }}>Ranking Geral</h3>
            <span style={{ color: 'var(--color-verde)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Ver ranking completo</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
            Ranking vazio.
          </div>
          <button className="btn btn-outline btn-full btn-sm">Ver ranking completo</button>
        </div>

        {/* Atividade Recente */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase' }}>Atividade Recente</h3>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
            Nenhuma atividade ainda.
          </div>
          <button className="btn btn-outline btn-full btn-sm">Ver todas</button>
        </div>
      </section>

      {/* PIX Banner */}
      <section className="card" style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Pagamento via PIX
          </h3>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Valor por pessoa</p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-verde)' }}>
                R$ {group.pool_entry_fee.toFixed(2)}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Chave PIX</p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
                {group.pix_key || 'Não definida'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ width: 80, height: 80, background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-default)' }}>
          <QrCode size={48} color="var(--text-muted)" />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button className="btn btn-gold" onClick={() => {
            if(group.pix_key) {
              navigator.clipboard.writeText(group.pix_key)
              toast.success('Chave copiada!')
            }
          }}>
            <Copy size={18} /> Copiar PIX
          </button>
          <button className="btn btn-outline" style={{ color: 'var(--color-verde)', borderColor: 'var(--color-verde)' }}>
            <Upload size={18} /> Enviar comprovante
          </button>
          <button className="btn btn-ghost" style={{ padding: '0.5rem' }}><ChevronRight size={20} /></button>
        </div>
      </section>
    </div>
  )
}
