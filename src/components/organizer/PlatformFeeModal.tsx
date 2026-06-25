import React, { useState, useRef } from 'react'
import { X, Upload } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../../lib/supabase'
import { generatePixPayload } from '../../lib/pix'
import toast from 'react-hot-toast'

interface Props {
  groupId: string
  totalFee: number
  onClose: () => void
  onSuccess: () => void
}

export default function PlatformFeeModal({ groupId, totalFee, onClose, onSuccess }: Props) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Chave PIX e Nome extraídos das variáveis de ambiente (.env) para não expor no código fonte
  const CREATOR_PIX_KEY = import.meta.env.VITE_PLATFORM_PIX_KEY || ''
  const PIX_MERCHANT_NAME = import.meta.env.VITE_PLATFORM_PIX_NAME || 'Bolao e Churras'
  const pixPayload = generatePixPayload(CREATOR_PIX_KEY, totalFee, PIX_MERCHANT_NAME)

  async function copyPixToClipboard() {
    try {
      await navigator.clipboard.writeText(pixPayload)
      toast.success('Código PIX Copia e Cola copiado!')
    } catch (err) {
      toast.error('Falha ao copiar o código.')
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `platform_fee_${groupId}_${Date.now()}.${fileExt}`
      const filePath = `platform_fees/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('receipts') // Reaproveitando o bucket receipts
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('groups')
        .update({ platform_fee_paid: true, platform_fee_receipt_url: publicUrl })
        .eq('id', groupId)

      if (updateError) throw updateError

      toast.success('Taxa repassada com sucesso! Funcionalidades liberadas.')
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar comprovante.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card p-6 animate-fade-in-up max-w-sm w-full relative">
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>

        <h3 className="font-display font-bold text-xl mb-2 text-center text-emerald-500">
          Acerto com a Plataforma
        </h3>
        <p className="text-center text-sm text-gray-400 mb-6">
          A taxa de <strong className="text-white">R$ 1,50</strong> por participante é dividida: você fica com <strong className="text-emerald-400">R$ 0,50</strong> e repassa apenas <strong className="text-white">R$ 1,00</strong> para a plataforma!
        </p>

        <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 text-center mb-6">
          <p className="text-sm text-emerald-400 font-bold uppercase tracking-wider mb-1">Valor do Repasse</p>
          <p className="font-display font-black text-3xl text-white">R$ {totalFee.toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="flex justify-center bg-white p-4 rounded-xl mb-4">
          <QRCodeSVG value={pixPayload} size={200} />
        </div>
        
        <div className="mb-6">
          <button 
            onClick={copyPixToClipboard}
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-emerald-400 border border-emerald-500/50 rounded-lg text-sm font-bold transition-colors"
          >
            Copiar Código PIX (Copia e Cola)
          </button>
        </div>

        <div className="divider mb-6" />

        <input
          type="file"
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button 
          className="btn btn-primary btn-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <><span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> Enviando...</>
          ) : (
            <><Upload size={20} /> Anexar Comprovante do Repasse</>
          )}
        </button>
      </div>
    </div>
  )
}
