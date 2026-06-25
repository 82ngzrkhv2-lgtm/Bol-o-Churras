import { useState } from 'react'
import { Calendar, MapPin, Clock, Edit2, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useGroupContext } from '../../contexts/GroupContext'
import toast from 'react-hot-toast'

export default function EventInfo() {
  const { activeGroup: group, refreshActiveGroup, loading } = useGroupContext()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    event_date: '',
    event_location: '',
    is_active: true
  })
  const [isProcessing, setIsProcessing] = useState(false)

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando evento...</div>
  }

  if (!group) {
    return <div className="p-8 text-center text-gray-500">Nenhum grupo ativo selecionado.</div>
  }

  function startEditing() {
    setFormData({
      event_date: group!.event_date ? new Date(group!.event_date).toISOString().slice(0, 16) : '',
      event_location: group!.event_location || '',
      is_active: group!.is_active
    })
    setIsEditing(true)
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault()
    setIsProcessing(true)
    const { error } = await supabase
      .from('groups')
      .update({
        event_date: formData.event_date ? new Date(formData.event_date).toISOString() : null,
        event_location: formData.event_location || null,
        is_active: formData.is_active
      })
      .eq('id', group!.id)

    if (!error) {
      toast.success('Evento atualizado!')
      setIsEditing(false)
      await refreshActiveGroup()
    } else {
      toast.error('Erro ao salvar evento')
    }
    setIsProcessing(false)
  }

  async function toggleEventStatus() {
    if (!window.confirm(group!.is_active ? 'Tem certeza que deseja encerrar o evento? Ninguém mais poderá enviar palpites.' : 'Deseja reabrir o evento?')) {
      return
    }
    setIsProcessing(true)
    const { error } = await supabase
      .from('groups')
      .update({ is_active: !group!.is_active })
      .eq('id', group!.id)

    if (!error) {
      toast.success(group!.is_active ? 'Evento encerrado!' : 'Evento reaberto!')
      await refreshActiveGroup()
    } else {
      toast.error('Erro ao alterar status do evento')
    }
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl flex items-center gap-2">
          <Calendar size={24} className="text-blue-500" />
          O Evento / Churras
        </h2>
        {!isEditing && (
          <div className="flex gap-2">
            <button 
              onClick={toggleEventStatus} 
              className={`btn btn-sm ${group.is_active ? 'btn-outline border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300' : 'btn-outline border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300'}`}
              disabled={isProcessing}
            >
              {group.is_active ? 'Encerrar Evento' : 'Reabrir Evento'}
            </button>
            <button onClick={startEditing} className="btn btn-outline btn-sm flex items-center gap-1">
              <Edit2 size={16} /> Editar
            </button>
          </div>
        )}
      </div>

      <div className="card p-6">
        {isEditing ? (
          <form onSubmit={saveEvent} className="flex flex-col gap-4">
            <div>
              <label className="input-label">Data e Hora do Evento</label>
              <input
                type="datetime-local"
                className="input"
                value={formData.event_date}
                onChange={e => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Local (Endereço / Link Google Maps)</label>
              <textarea
                className="input min-h-[80px]"
                placeholder="Ex: Sítio do João - R. das Flores, 123"
                value={formData.event_location}
                onChange={e => setFormData({ ...formData, event_location: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost" disabled={isProcessing}>Cancelar</button>
              <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={isProcessing}>
                <Save size={18} /> Salvar
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-6">
            {!group.is_active && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-center font-bold">
                Evento Encerrado! Novos palpites e entradas estão bloqueados.
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-700">Quando?</h3>
                <p className="text-gray-600 mt-1">
                  {group.event_date 
                    ? new Date(group.event_date).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })
                    : 'Data não definida'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-700">Onde?</h3>
                <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                  {group.event_location || 'Local não definido'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
