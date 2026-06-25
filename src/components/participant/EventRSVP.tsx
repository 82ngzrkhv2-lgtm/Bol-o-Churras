import { useEffect, useState, useRef } from 'react'
import { CheckCircle, Plus, Trash2, Copy, Upload, Clock } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../../lib/supabase'
import type { Group, Participant, EventItem } from '../../types'
import { generatePixPayload } from '../../lib/pix'
import toast from 'react-hot-toast'

interface Props {
  group: Group
  participant: Participant
  onUpdate: () => void
}

export default function EventRSVP({ group, participant, onUpdate }: Props) {
  const [items, setItems] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [newItem, setNewItem] = useState('')
  const [copied, setCopied] = useState(false)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadItems()
  }, [group.id])

  async function loadItems() {
    const { data } = await supabase
      .from('event_items')
      .select('*')
      .eq('group_id', group.id)
      .order('created_at')
    setItems(data || [])
    setLoading(false)
  }

  async function togglePresence() {
    setConfirming(true)
    const newVal = !participant.confirmed_presence
    const { error } = await supabase
      .from('participants')
      .update({ confirmed_presence: newVal })
      .eq('id', participant.id)

    if (!error) {
      toast.success(newVal ? '🍖 Presença confirmada!' : 'Presença removida')
      onUpdate()

      // Envia notificação push para o organizador
      fetch('/api/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizer_id: group.organizer_id,
          participant_name: participant.name,
          status: newVal,
          group_name: group.name
        })
      }).catch(err => {
        console.error('Erro ao enviar notificação push:', err)
      })
    }
    setConfirming(false)
  }

  async function addItem() {
    if (!newItem.trim()) return
    const { data, error } = await supabase
      .from('event_items')
      .insert({
        group_id: group.id,
        participant_id: participant.id,
        item_name: newItem.trim(),
        quantity: '1',
        unit: 'un',
        assigned: true,
      })
      .select()
      .single()

    if (!error && data) {
      setItems(i => [...i, data])
      setNewItem('')
      toast.success(`"${data.item_name}" adicionado! 🍖`)
    }
  }

  async function removeItem(itemId: string) {
    const { error } = await supabase.from('event_items').delete().eq('id', itemId).eq('participant_id', participant.id)
    if (!error) setItems(i => i.filter(it => it.id !== itemId))
  }

  const PLATFORM_FEE = 1.50
  const totalAmount = group.pool_entry_fee > 0 ? group.pool_entry_fee + PLATFORM_FEE : 0

  const pixPayload = (group.pix_key && totalAmount > 0) 
    ? generatePixPayload(group.pix_key, totalAmount) 
    : group.pix_key

  function copyPix() {
    if (!pixPayload) return
    navigator.clipboard.writeText(pixPayload)
    setCopied(true)
    toast.success('PIX Copia e Cola copiado! 💰')
    setTimeout(() => setCopied(false), 3000)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.')
      return
    }

    setUploadingReceipt(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${participant.id}_${Date.now()}.${fileExt}`
      const filePath = `${group.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('participants')
        .update({ payment_status: 'verifying', receipt_url: publicUrl })
        .eq('id', participant.id)

      if (updateError) throw updateError

      toast.success('Comprovante enviado com sucesso!')
      onUpdate()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar comprovante.')
    } finally {
      setUploadingReceipt(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const myItems = items.filter(i => i.participant_id === participant.id)
  const otherItems = items.filter(i => i.participant_id !== participant.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
      {/* Data e Local */}
      {(group.event_date || group.event_location) && (
        <div className="card animate-fade-in-up" style={{ padding: '1rem', borderColor: 'var(--border-gold)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--color-amarelo)' }}>
            🍖 DETALHES DO EVENTO
          </h3>
          {group.event_date && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              📅 {new Date(group.event_date).toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          {group.event_location && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              📍 {group.event_location}
            </p>
          )}
        </div>
      )}

      {/* Confirmação de presença */}
      <div className="card animate-fade-in-up stagger-1" style={{
        padding: '1.25rem',
        borderColor: participant.confirmed_presence ? 'var(--border-accent)' : 'var(--border-default)',
        background: participant.confirmed_presence ? 'var(--color-verde-bg)' : 'var(--bg-card)',
      }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
              CONFIRMAÇÃO DE PRESENÇA
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              Vai aparecer no churrasco?
            </p>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem',
            color: participant.confirmed_presence ? 'var(--color-verde)' : 'var(--text-muted)',
          }}>
            {participant.confirmed_presence ? '✅' : '❓'}
          </div>
        </div>

        <button
          className={`btn btn-full ${participant.confirmed_presence ? 'btn-outline' : 'btn-primary'}`}
          onClick={togglePresence}
          disabled={confirming}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {confirming ? (
            <><span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> Atualizando...</>
          ) : participant.confirmed_presence ? (
            <>✅ Presença Confirmada — Cancelar</>
          ) : (
            <>Confirmar Presença 🙋</>
          )}
        </button>
      </div>

      {/* PIX */}
      {group.pix_key && (
        <div className="card animate-fade-in-up stagger-2" style={{
          padding: '1.25rem',
          borderColor: participant.payment_status === 'paid' ? 'var(--border-accent)' : participant.payment_status === 'verifying' ? 'var(--border-default)' : 'var(--border-gold)',
          background: participant.payment_status === 'paid' ? 'var(--color-verde-bg)' : participant.payment_status === 'verifying' ? 'var(--color-azul-bg)' : 'var(--color-amarelo-bg)',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
            💰 PAGAMENTO VIA PIX
          </h3>

          {participant.payment_status === 'paid' ? (
            <div className="flex items-center gap-2" style={{ color: 'var(--color-verde)' }}>
              <CheckCircle size={20} />
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                PAGAMENTO CONFIRMADO!
              </p>
            </div>
          ) : participant.payment_status === 'verifying' ? (
            <div className="flex items-center gap-2" style={{ color: 'var(--color-azul, #3b82f6)' }}>
              <Clock size={20} />
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  EM ANÁLISE
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>O organizador está verificando seu comprovante.</p>
              </div>
            </div>
          ) : (
            <>
              {group.pool_entry_fee > 0 && (
                <div style={{
                  textAlign: 'center', padding: '1rem',
                  background: 'var(--color-amarelo-bg)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span>Cota do Bolão:</span>
                    <span>R$ {group.pool_entry_fee.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
                    <span>Taxa do Sistema:</span>
                    <span>R$ {PLATFORM_FEE.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>Total a Transferir:</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.8rem', color: 'var(--color-amarelo)', lineHeight: 1 }}>
                      R$ {totalAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              )}

              <div style={{
                background: 'white',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'center'
              }}>
                {pixPayload && <QRCodeSVG value={pixPayload} size={200} />}
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>PIX Copia e Cola:</p>
              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                marginBottom: '0.75rem',
                fontFamily: 'monospace',
                fontSize: '0.88rem',
                wordBreak: 'break-all',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
              }}>
                {pixPayload}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  className={`btn flex-1 ${copied ? 'btn-primary' : 'btn-gold'}`}
                  onClick={copyPix}
                >
                  {copied ? <><CheckCircle size={18} /> Copiado!</> : <><Copy size={18} /> Copiar PIX</>}
                </button>
                <button
                  className="btn btn-outline flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingReceipt}
                >
                  {uploadingReceipt ? 'Enviando...' : <><Upload size={18} /> Anexar</>}
                </button>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
              />

              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
                Copie a chave, faça o PIX e anexe o comprovante.
              </p>
            </>
          )}
        </div>
      )}

      {/* Lista de Itens */}
      <div className="card animate-fade-in-up stagger-3" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
          🛒 LISTA DE ITENS DO CHURRASCO
        </h3>

        {/* Adicionar item */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            className="input"
            style={{ flex: 1, fontSize: '0.9rem' }}
            placeholder="Ex: Cerveja, Carvão, Linguiça..."
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={addItem}>
            <Plus size={18} />
          </button>
        </div>

        {/* Meus itens */}
        {myItems.length > 0 && (
          <>
            <p style={{ color: 'var(--color-verde)', fontSize: '0.78rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              VOCÊ VAI LEVAR:
            </p>
            {myItems.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-2" style={{
                padding: '0.6rem 0.75rem',
                background: 'var(--color-verde-bg)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.4rem',
                border: '1px solid var(--border-accent)',
              }}>
                <span style={{ fontSize: '0.9rem' }}>✅ {item.item_name}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.25rem', color: 'var(--color-danger)' }}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </>
        )}

        {/* Itens dos outros */}
        {otherItems.length > 0 && (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
              JÁ COMPROMETIDO PELA GALERA:
            </p>
            {otherItems.map(item => (
              <div key={item.id} style={{
                padding: '0.6rem 0.75rem',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.4rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}>
                🛒 {item.item_name}
              </div>
            ))}
          </>
        )}

        {items.length === 0 && !loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
            Lista vazia. Adicione o que vai levar! 🍖
          </p>
        )}
      </div>
    </div>
  )
}
