import { useState } from 'react'
import { Users, CheckCircle, Clock, MessageCircle, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useGroupContext } from '../../contexts/GroupContext'
import type { Participant } from '../../types'
import { generateChargeMessage, formatWhatsAppLink } from '../../lib/api-football'
import toast from 'react-hot-toast'

export default function Participants() {
  const { activeGroup: group, participantsList, refreshActiveGroup, loading } = useGroupContext()
  const [isProcessing, setIsProcessing] = useState(false)

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando participantes...</div>
  }

  if (!group) {
    return <div className="p-8 text-center text-gray-500">Nenhum evento ativo selecionado.</div>
  }

  const pending = participantsList.filter(p => p.payment_status !== 'paid')

  async function togglePaid(participant: Participant) {
    setIsProcessing(true)
    const newStatus = participant.payment_status === 'paid' ? 'pending' : 'paid'
    
    const { error } = await supabase
      .from('participants')
      .update({ payment_status: newStatus, paid_at: newStatus === 'paid' ? new Date().toISOString() : null })
      .eq('id', participant.id)

    if (!error) {
      toast.success(newStatus === 'paid' ? 'Pagamento confirmado!' : 'Marcado como pendente')
      await refreshActiveGroup()
    } else {
      toast.error('Erro ao atualizar pagamento')
    }
    setIsProcessing(false)
  }

  async function rejectPayment(participant: Participant) {
    setIsProcessing(true)
    const { error } = await supabase
      .from('participants')
      .update({ payment_status: 'pending', receipt_url: null })
      .eq('id', participant.id)

    if (!error) {
      toast.success('Comprovante recusado')
      await refreshActiveGroup()
    }
    setIsProcessing(false)
  }

  async function removeParticipant(participant: Participant) {
    if (!confirm(`Remover ${participant.name} do bolão?`)) return
    setIsProcessing(true)
    const { error } = await supabase.from('participants').delete().eq('id', participant.id)
    if (!error) {
      toast.success('Participante removido')
      await refreshActiveGroup()
    }
    setIsProcessing(false)
  }

  function chargeOnWhatsApp(participant: Participant) {
    if (!group) return
    const message = generateChargeMessage(
      participant.name,
      group.name,
      group.pool_entry_fee,
      group.pix_key || 'Ver com o organizador'
    )
    const link = formatWhatsAppLink(participant.whatsapp, message)
    window.open(link, '_blank')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl flex items-center gap-2">
          <Users size={24} className="text-green-600" />
          Participantes ({participantsList.length})
        </h2>
      </div>

      {pending.length > 0 && (
        <div className="card border-l-4 border-yellow-500 p-4 mb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-display font-bold text-sm">
                {pending.length} inadimplente{pending.length > 1 ? 's' : ''} • R$ {(pending.length * (group.pool_entry_fee || 0)).toFixed(2)} pendente
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Clique no ícone do WhatsApp em cada participante para cobrar
              </p>
            </div>
            <span className="badge badge-amarelo">⚠ Pendente</span>
          </div>
        </div>
      )}

      {participantsList.length === 0 ? (
        <div className="card text-center p-10">
          <p className="text-gray-500">Nenhum participante ainda.</p>
          <p className="text-gray-400 text-sm mt-2">
            Compartilhe o link público com a galera!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {participantsList.map(p => (
            <div key={p.id} className="card p-4 flex items-center gap-3">
              <img
                src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${p.avatar_seed}&backgroundColor=16A34A`}
                alt={p.name}
                className="w-10 h-10 rounded-full border border-gray-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{p.name}</p>
                <p className="text-gray-500 text-xs">{p.whatsapp}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {p.confirmed_presence && (
                  <span className="badge badge-verde text-[10px] px-2 py-1">🍖</span>
                )}
                
                <div className="flex flex-col items-end gap-1">
                  {p.receipt_url && (
                    <a href={p.receipt_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-1">
                      📎 Comprovante
                    </a>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      className={`badge border-none cursor-pointer ${p.payment_status === 'paid' ? 'bg-green-100 text-green-700' : p.payment_status === 'verifying' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}
                      onClick={() => togglePaid(p)}
                      disabled={isProcessing}
                    >
                      {p.payment_status === 'paid' ? <CheckCircle size={12} className="mr-1 inline" /> : p.payment_status === 'verifying' ? <Clock size={12} className="mr-1 inline" /> : <span className="text-[10px] mr-1 inline">●</span>}
                      {p.payment_status === 'paid' ? 'Pago' : p.payment_status === 'verifying' ? 'Aprovar' : 'Pendente'}
                    </button>
                    {p.payment_status === 'verifying' && (
                      <button onClick={() => rejectPayment(p)} disabled={isProcessing} className="text-red-500 hover:text-red-700 p-1 text-xs font-bold">
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {(!p.payment_status || p.payment_status !== 'paid') && group.pool_entry_fee > 0 && (
                  <button
                    className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                    onClick={() => chargeOnWhatsApp(p)}
                    title="Cobrar no WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>
                )}
                
                <button
                  className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                  onClick={() => removeParticipant(p)}
                  title="Remover participante"
                  disabled={isProcessing}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
