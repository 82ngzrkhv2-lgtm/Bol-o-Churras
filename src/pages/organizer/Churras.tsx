import { useState, useEffect, useCallback } from 'react'
import { ShoppingBag, Plus, Trash2, CheckCircle, Circle, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useGroupContext } from '../../contexts/GroupContext'
import type { EventItemWithParticipant } from '../../types'
import toast from 'react-hot-toast'

const UNIT_OPTIONS = [
  { value: 'un', label: 'Unidade(s)' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'gramas' },
  { value: 'L', label: 'Litro(s)' },
  { value: 'ml', label: 'ml' },
  { value: 'pacote', label: 'Pacote(s)' },
  { value: 'caixa', label: 'Caixa(s)' },
  { value: 'dúzia', label: 'Dúzia(s)' },
  { value: 'porção', label: 'Porção(ões)' },
]

export default function Churras() {
  const { activeGroup: group } = useGroupContext()
  const [items, setItems] = useState<EventItemWithParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('un')

  const loadItems = useCallback(async () => {
    if (!group) return
    setLoading(true)
    try {
      const { data: itemsData } = await supabase
        .from('event_items')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: true })

      if (!itemsData) { setItems([]); return }

      // Busca os participantes que reservaram itens
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
  }, [group])

  useEffect(() => { loadItems() }, [loadItems])

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    if (!group || !itemName.trim()) return
    setSaving(true)
    try {
      const { error } = await supabase.from('event_items').insert({
        group_id: group.id,
        item_name: itemName.trim(),
        quantity: quantity.trim() || '1',
        unit,
        assigned: false,
        participant_id: null,
      })
      if (error) throw error
      toast.success('Item adicionado! 🍖')
      setItemName('')
      setQuantity('1')
      setUnit('un')
      await loadItems()
    } catch {
      toast.error('Erro ao adicionar item')
    } finally {
      setSaving(false)
    }
  }

  async function removeItem(id: string) {
    if (!confirm('Remover este item da lista?')) return
    const { error } = await supabase.from('event_items').delete().eq('id', id)
    if (!error) {
      toast.success('Item removido')
      setItems(prev => prev.filter(i => i.id !== id))
    } else {
      toast.error('Erro ao remover item')
    }
  }

  if (!group) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhum evento ativo selecionado.
      </div>
    )
  }

  const reserved = items.filter(i => i.assigned)
  const available = items.filter(i => !i.assigned)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl flex items-center gap-2">
          <ShoppingBag size={24} className="text-green-600" />
          Lista do Churras
        </h2>
        {items.length > 0 && (
          <span style={{
            background: 'var(--color-verde-bg)',
            color: 'var(--color-verde)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-full)',
            padding: '0.25rem 0.75rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
          }}>
            {reserved.length}/{items.length} reservados
          </span>
        )}
      </div>

      {/* Progresso */}
      {items.length > 0 && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Progresso da lista
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-verde)' }}>
              {Math.round((reserved.length / items.length) * 100)}%
            </span>
          </div>
          <div style={{ background: 'var(--border-default)', borderRadius: 'var(--radius-full)', height: 8 }}>
            <div style={{
              background: 'var(--color-verde)',
              borderRadius: 'var(--radius-full)',
              height: '100%',
              width: `${(reserved.length / items.length) * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ✅ {reserved.length} reservado{reserved.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              🔓 {available.length} disponível{available.length !== 1 ? 'is' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Adicionar Item */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} style={{ color: 'var(--color-verde)' }} />
          Adicionar Item
        </h3>
        <form onSubmit={addItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="text"
            className="input"
            placeholder="Ex: Carvão, Gelo, Carne, Cerveja..."
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            required
            maxLength={80}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Quantidade
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ex: 5, 2, 1.5"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Unidade
              </label>
              <select
                className="input"
                value={unit}
                onChange={e => setUnit(e.target.value)}
              >
                {UNIT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || !itemName.trim()}
            style={{ alignSelf: 'flex-end' }}
          >
            {saving ? 'Adicionando...' : (
              <>
                <Plus size={16} />
                Adicionar à Lista
              </>
            )}
          </button>
        </form>
      </div>

      {/* Lista de Itens */}
      {loading ? (
        <div className="text-center p-8 text-gray-400">Carregando lista...</div>
      ) : items.length === 0 ? (
        <div style={{
          background: 'var(--bg-surface)',
          border: '2px dashed var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          textAlign: 'center',
        }}>
          <Package size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <p style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Nenhum item na lista ainda
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Adicione os itens que a galera pode trazer pro churras!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${item.assigned ? 'var(--border-accent)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'var(--transition-fast)',
              }}
            >
              {/* Status Icon */}
              <div style={{ flexShrink: 0 }}>
                {item.assigned
                  ? <CheckCircle size={20} style={{ color: 'var(--color-verde)' }} />
                  : <Circle size={20} style={{ color: 'var(--border-default)' }} />
                }
              </div>

              {/* Item Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  {item.item_name}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.quantity} {item.unit}
                </p>
              </div>

              {/* Assigned / Available badge */}
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                {item.assigned && item.participant ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <img
                      src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${item.participant.avatar_seed}&backgroundColor=16A34A`}
                      alt={item.participant.name}
                      style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--color-verde)' }}
                    />
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-verde)',
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.participant.name}
                    </span>
                  </div>
                ) : (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.2rem 0.6rem',
                  }}>
                    Disponível
                  </span>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  flexShrink: 0,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '0.25rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'var(--transition-fast)',
                }}
                title="Remover item"
                className="hover-text-danger"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
