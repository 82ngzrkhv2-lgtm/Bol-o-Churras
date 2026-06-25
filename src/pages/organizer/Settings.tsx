import { useState } from 'react'
import { Settings as SettingsIcon, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useGroupContext } from '../../contexts/GroupContext'
import toast from 'react-hot-toast'
import { formatPixKey, detectPixKeyType } from '../../lib/pix'
import { useEffect } from 'react'

export default function Settings() {
  const { activeGroup: group, refreshActiveGroup, loading } = useGroupContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'cnpj' | 'phone' | 'email' | 'random'>('phone')
  const [formData, setFormData] = useState({
    name: group?.name || '',
    pool_entry_fee: group?.pool_entry_fee || 0,
    pix_key: group?.pix_key || ''
  })

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        pool_entry_fee: group.pool_entry_fee,
        pix_key: group.pix_key || ''
      })
      if (group.pix_key) {
        setPixKeyType(detectPixKeyType(group.pix_key))
      }
    }
  }, [group])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando configurações...</div>
  }

  if (!group) {
    return <div className="p-8 text-center text-gray-500">Nenhum evento ativo selecionado.</div>
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setIsProcessing(true)
    const formattedPixKey = formData.pix_key ? formatPixKey(formData.pix_key, pixKeyType) : null

    const { error } = await supabase
      .from('groups')
      .update({
        name: formData.name,
        pool_entry_fee: formData.pool_entry_fee,
        pix_key: formattedPixKey
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
            <label className="input-label">Nome do Evento</label>
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
            <label className="input-label" htmlFor="pix_key_type">Tipo de Chave PIX</label>
            <select
              id="pix_key_type"
              className="input mb-4"
              value={pixKeyType}
              onChange={(e) => setPixKeyType(e.target.value as any)}
            >
              <option value="phone">Celular (Telefone)</option>
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="email">E-mail</option>
              <option value="random">Chave Aleatória (EVP)</option>
            </select>
          </div>
          <div>
            <label className="input-label">Chave PIX *</label>
            <input
              type="text"
              className="input"
              placeholder={
                pixKeyType === 'phone' ? 'Ex: (73) 98190-6662' :
                pixKeyType === 'cpf' ? 'Ex: 123.456.789-00' :
                pixKeyType === 'cnpj' ? 'Ex: 12.345.678/0001-00' :
                pixKeyType === 'email' ? 'Ex: seu-email@dominio.com' :
                'Ex: 123e4567-e89b-12d3-a456-426614174000'
              }
              value={formData.pix_key}
              onChange={e => setFormData({ ...formData, pix_key: e.target.value })}
              required={formData.pool_entry_fee > 0}
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
              {pixKeyType === 'phone' && 'A chave de celular será formatada automaticamente no padrão internacional (+55).'}
              {pixKeyType === 'cpf' && 'Apenas os números do CPF serão salvos.'}
              {pixKeyType === 'cnpj' && 'Apenas os números do CNPJ serão salvos.'}
              {pixKeyType === 'email' && 'O e-mail será salvo em letras minúsculas.'}
              {pixKeyType === 'random' && 'Insira a chave aleatória completa incluindo os traços.'}
            </p>
          </div>
          <button type="submit" className="btn btn-primary w-full mt-4 flex justify-center items-center gap-2" disabled={isProcessing}>
            <Save size={18} /> {isProcessing ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
