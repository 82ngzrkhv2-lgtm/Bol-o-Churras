import { useState } from 'react'
import { Settings as SettingsIcon, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useGroupContext } from '../../contexts/GroupContext'
import toast from 'react-hot-toast'

export default function Settings() {
  const { activeGroup: group, refreshActiveGroup, loading } = useGroupContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: group?.name || '',
    pool_entry_fee: group?.pool_entry_fee || 0,
    pix_key: group?.pix_key || ''
  })

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando configurações...</div>
  }

  if (!group) {
    return <div className="p-8 text-center text-gray-500">Nenhum grupo ativo selecionado.</div>
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setIsProcessing(true)
    const { error } = await supabase
      .from('groups')
      .update({
        name: formData.name,
        pool_entry_fee: formData.pool_entry_fee,
        pix_key: formData.pix_key
      })
      .eq('id', group!.id)

    if (!error) {
      toast.success('Configurações salvas!')
      await refreshActiveGroup()
    } else {
      toast.error('Erro ao salvar configurações')
    }
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl flex items-center gap-2">
          <SettingsIcon size={24} className="text-gray-600" />
          Configurações
        </h2>
      </div>

      <div className="card p-6">
        <form onSubmit={saveSettings} className="flex flex-col gap-4">
          <div>
            <label className="input-label">Nome do Grupo</label>
            <input
              type="text"
              required
              className="input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="input-label">Valor da Cota (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              className="input"
              value={formData.pool_entry_fee}
              onChange={e => setFormData({ ...formData, pool_entry_fee: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="input-label">Chave PIX (Para receber)</label>
            <input
              type="text"
              className="input"
              placeholder="CPF, E-mail, Celular ou Aleatória"
              value={formData.pix_key}
              onChange={e => setFormData({ ...formData, pix_key: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-4 flex justify-center items-center gap-2" disabled={isProcessing}>
            <Save size={18} /> {isProcessing ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
