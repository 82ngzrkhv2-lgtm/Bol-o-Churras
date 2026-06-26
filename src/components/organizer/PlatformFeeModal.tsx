import React, { useState } from 'react'
import { X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { RefreshCw } from 'lucide-react'

interface Props {
  groupId: string
  totalFee: number
  onClose: () => void
  onSuccess: () => void
}

export default function PlatformFeeModal({ groupId, totalFee, onClose, onSuccess }: Props) {
  const [uploading, setUploading] = useState(false)
  const [pixPayload, setPixPayload] = useState('')
  const [pixImage, setPixImage] = useState('')
  const [loadingPix, setLoadingPix] = useState(true)

  async function copyPixToClipboard() {
    try {
      await navigator.clipboard.writeText(pixPayload)
      toast.success('Código PIX Copia e Cola copiado!')
    } catch (err) {
      toast.error('Falha ao copiar o código.')
    }
  }

  React.useEffect(() => {
    async function generatePix() {
      try {
        // Captura o Device ID gerado pelo MercadoPago.JS V2 (anti-fraude obrigatório)
        const deviceId = (window as any).MP_DEVICE_SESSION_ID ?? undefined

        const response = await fetch('/api/create-pix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            groupId, 
            amount: totalFee,
            deviceId
          })
        })
        if (!response.ok) {
          throw new Error('Falha na resposta do servidor Vercel')
        }
        const data = await response.json()
        if (data?.qrCode) {
          setPixPayload(data.qrCode)
          setPixImage(data.qrCodeBase64)
        } else if (data?.error) {
          throw new Error(data.error)
        }
      } catch (err) {
        toast.error('Erro ao gerar PIX automático. Tente novamente.')
      } finally {
        setLoadingPix(false)
      }
    }
    generatePix()
  }, [groupId, totalFee])

  async function checkPaymentStatus() {
    setUploading(true)
    try {
      const { data: group, error } = await supabase
        .from('groups')
        .select('platform_fee_paid')
        .eq('id', groupId)
        .single()
        
      if (error) throw error
      
      if (group.platform_fee_paid) {
        toast.success('Pagamento confirmado com sucesso!')
        onSuccess()
      } else {
        toast.error('Ainda não identificamos o pagamento. Pode levar alguns segundos.')
      }
    } catch (err) {
      toast.error('Erro ao verificar pagamento.')
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
        <p className="text-center text-sm text-gray-600 mb-6">
          A taxa de <strong className="text-gray-900">R$ 1,50</strong> por participante é dividida: você fica com <strong className="text-emerald-600">R$ 0,50</strong> e repassa apenas <strong className="text-gray-900">R$ 1,00</strong> para a plataforma!
        </p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center mb-6">
          <p className="text-sm text-emerald-700 font-bold uppercase tracking-wider mb-1">Valor do Repasse</p>
          <p className="font-display font-black text-3xl text-emerald-900">R$ {totalFee.toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="flex justify-center bg-white p-4 rounded-xl mb-4 min-h-[232px] items-center">
          {loadingPix ? (
            <div className="flex flex-col items-center text-gray-500">
              <span className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-2" />
              <p className="text-sm font-bold">Gerando PIX...</p>
            </div>
          ) : pixImage ? (
            <img src={`data:image/png;base64,${pixImage}`} alt="QR Code PIX" className="w-[200px] h-[200px]" />
          ) : pixPayload ? (
            <QRCodeSVG value={pixPayload} size={200} />
          ) : (
            <p className="text-sm text-red-500 font-bold">Erro ao carregar PIX.</p>
          )}
        </div>
        
        <div className="mb-6">
          <button 
            onClick={copyPixToClipboard}
            disabled={!pixPayload}
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-emerald-400 border border-emerald-500/50 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            Copiar Código PIX (Copia e Cola)
          </button>
        </div>

        <div className="divider mb-6" />

        <p className="text-xs text-center text-gray-500 mb-4">
          O pagamento é identificado automaticamente. Após pagar, clique no botão abaixo para verificar.
        </p>

        <button 
          className="btn btn-primary btn-full"
          onClick={checkPaymentStatus}
          disabled={uploading || loadingPix}
        >
          {uploading ? (
            <><span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> Verificando...</>
          ) : (
            <><RefreshCw size={20} /> Já paguei, verificar agora</>
          )}
        </button>
      </div>
    </div>
  )
}
