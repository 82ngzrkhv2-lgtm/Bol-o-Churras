import { useState, useEffect, useCallback } from 'react'
import { ShoppingBag, CheckCircle, Circle, Plus, Package, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Group, Participant, EventItemWithParticipant } from '../../types'
import toast from 'react-hot-toast'

interface Props {
  group: Group
  participant: Participant
  onUpdate?: () => void
}

const UNIT_OPTIONS = [
  { value: 'un', label: 'un' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'L', label: 'L' },
  { value: 'ml', label: 'ml' },
  { value: 'pacote', label: 'pacote' },
  { value: 'caixa', label: 'caixa' },
  { value: 'dúzia', label: 'dúzia' },
  { value: 'porção', label: 'porção' },
]

export default function ItemsView({ group, participant, onUpdate }: Props) {
  const [items, setItems] = useState<EventItemWithParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [showAddFree, setShowAddFree] = useState(false)
  const [freeName, setFreeName] = useState('')
  const [freeQty, setFreeQty] = useState('1')
  const [freeUnit, setFreeUnit] = useState('un')
  const [saving, setSaving] = useState(false)

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const { data: itemsData } = await supabase
        .from('event_items')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: true })

      if (!itemsData || itemsData.length === 0) {
        setItems([])
        return
      }

      const participantIds = [...new Set(itemsData.filter(i => i.participant_id).map(i => i.participant_id))]
      let participantsMap: Record<string, { name: string; avatar_seed: string }> = {}

      if (participantIds.length > 0) {
        const { data: parts } = await supabase
          .from('participants')
          .select('id, name, avatar_seed')
          .in('id', participantIds)

        if (parts) {
          participantsMap = Object.fromEntries(parts.map(p => [p.id, p]))
        }
      }

      setItems(itemsData.map(item => ({
        ...item,
        participant: item.participant_id ? participantsMap[item.participant_id] as any : undefined,
      })))
    } finally {
      setLoading(false)
    }
  }, [group.id])

  useEffect(() => { loadItems() }, [loadItems])

  // Participante reserva um item da lista do organizador
  async function claimItem(item: EventItemWithParticipant) {
    if (item.assigned && item.participant_id !== participant.id) {
      toast.error(`${item.participant?.name} já reservou esse item!`)
      return
    }

    setProcessing(item.id)
    try {
      const isMine = item.participant_id === participant.id
      const { error } = await supabase
        .from('event_items')
        .update({
          assigned: !isMine,
          participant_id: isMine ? null : participant.id,
        })
        .eq('id', item.id)

      if (error) throw error

      if (isMine) {
        toast('Item desmarcado', { icon: '↩️' })
      } else {
        toast.success('Ótimo! Você vai levar esse item 🙌')
      }

      await loadItems()
      onUpdate?.()
    } catch {
      toast.error('Erro ao atualizar item')
    } finally {
      setProcessing(null)
    }
  }

  // Participante adiciona item livre (quando não há lista do organizador)
  async function addFreeItem(e: React.FormEvent) {
    e.preventDefault()
    if (!freeName.trim()) return
    setSaving(true)
    try {
      const { error } = await supabase.from('event_items').insert({
        group_id: group.id,
        participant_id: participant.id,
        item_name: freeName.trim(),
        quantity: freeQty.trim() || '1',
        unit: freeUnit,
        assigned: true,
      })
      if (error) throw error
      toast.success('Adicionado! 🍖')
      setFreeName('')
      setFreeQty('1')
      setFreeUnit('un')
      setShowAddFree(false)
      await loadItems()
      onUpdate?.()
    } catch {
      toast.error('Erro ao adicionar item')
    } finally {
      setSaving(false)
    }
  }

  // Remove item que o próprio participante adicionou livremente
  async function removeMyFreeItem(id: string) {
    await supabase.from('event_items').delete().eq('id', id)
    await loadItems()
    onUpdate?.()
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        Carregando lista...
      </div>
    )
  }

  // Se não há itens → modo livre (participante adiciona livremente)
  const isEmptyList = items.length === 0

  // Itens que o participante atual marcou
  const myItems = items.filter(i => i.participant_id === participant.id)


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.05rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <ShoppingBag size={20} style={{ color: 'var(--color-verde)' }} />
          O que vamos levar?
        </h3>
        {myItems.length > 0 && (
          <span style={{
            background: 'var(--color-verde-bg)',
            color: 'var(--color-verde)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-full)',
            padding: '0.2rem 0.6rem',
            fontSize: '0.72rem',
            fontWeight: 700,
          }}>
            Você vai levar {myItems.length} item{myItems.length !== 1 ? 'ns' : ''}
          </span>
        )}
      </div>

      {/* Lista criada pelo organizador */}
      {!isEmptyList && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map(item => {
            const isMine = item.participant_id === participant.id
            const isTakenByOther = item.assigned && item.participant_id !== participant.id
            const isAvailable = !item.assigned

            return (
              <button
                key={item.id}
                disabled={isTakenByOther || processing === item.id}
                onClick={() => claimItem(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.9rem 1rem',
                  background: isMine
                    ? 'var(--color-verde-bg)'
                    : 'var(--bg-surface)',
                  border: `1.5px solid ${isMine
                    ? 'var(--border-accent)'
                    : isTakenByOther
                      ? 'var(--border-default)'
                      : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: isTakenByOther ? 'default' : 'pointer',
                  opacity: isTakenByOther ? 0.65 : 1,
                  textAlign: 'left',
                  width: '100%',
                  transition: 'var(--transition-fast)',
                }}
              >
                {/* Checkbox visual */}
                <div style={{ flexShrink: 0 }}>
                  {isMine ? (
                    <CheckCircle size={22} style={{ color: 'var(--color-verde)' }} />
                  ) : isTakenByOther ? (
                    <CheckCircle size={22} style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <Circle size={22} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: isMine ? 'var(--color-verde)' : 'var(--text-primary)',
                    textDecoration: isTakenByOther ? 'line-through' : 'none',
                  }}>
                    {item.item_name}
                  </p>
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                    {item.quantity} {item.unit}
                  </p>
                </div>

                {/* Status */}
                <div style={{ flexShrink: 0 }}>
                  {isMine && (
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--color-verde)',
                      background: 'var(--color-verde-bg)',
                      border: '1px solid var(--border-accent)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.2rem 0.6rem',
                    }}>
                      ✓ Vou levar!
                    </span>
                  )}
                  {isTakenByOther && item.participant && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <img
                        src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${item.participant.avatar_seed}&backgroundColor=16A34A`}
                        alt={item.participant.name}
                        style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--border-default)' }}
                      />
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        maxWidth: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.participant.name}
                      </span>
                    </div>
                  )}
                  {isAvailable && (
                    <span style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                    }}>
                      Toque para reservar
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Modo livre — sem lista do organizador */}
      {isEmptyList && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '2px dashed var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            textAlign: 'center',
          }}>
            <Package size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              O organizador ainda não criou uma lista
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Mas você pode registrar o que vai levar!
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddFree(true)}
              style={{ fontSize: '0.85rem' }}
            >
              <Plus size={15} />
              Adicionar o que vou levar
            </button>
          </div>
        </div>
      )}

      {/* Botão adicionar item livre (mesmo com lista do org) */}
      {!isEmptyList && !showAddFree && (
        <button
          onClick={() => setShowAddFree(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: 'transparent',
            border: '1.5px dashed var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'var(--transition-fast)',
          }}
          className="hover-bg-muted"
        >
          <Plus size={16} />
          Adicionar item extra que vou levar
        </button>
      )}

      {/* Form adição livre */}
      {showAddFree && (
        <form
          onSubmit={addFreeItem}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={16} style={{ color: 'var(--color-verde)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>O que você vai levar?</span>
          </div>
          <input
            type="text"
            className="input"
            placeholder="Ex: Refrigerante, Sobremesa, Guardanapos..."
            value={freeName}
            onChange={e => setFreeName(e.target.value)}
            required
            autoFocus
            maxLength={80}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input
              type="text"
              className="input"
              placeholder="Quantidade"
              value={freeQty}
              onChange={e => setFreeQty(e.target.value)}
            />
            <select className="input" value={freeUnit} onChange={e => setFreeUnit(e.target.value)}>
              {UNIT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn"
              onClick={() => { setShowAddFree(false); setFreeName('') }}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || !freeName.trim()}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              {saving ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      )}

      {/* Meus itens registrados livremente */}
      {myItems.length > 0 && (
        <div style={{
          background: 'var(--color-verde-bg)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
        }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-verde)', marginBottom: '0.5rem' }}>
            ✅ Você vai levar:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {myItems.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  🍖 {item.item_name} — {item.quantity} {item.unit}
                </span>
                <button
                  onClick={() => removeMyFreeItem(item.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.4rem',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
