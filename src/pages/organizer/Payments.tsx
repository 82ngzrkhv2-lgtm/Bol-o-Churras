import { DollarSign, Search, CheckCircle, Clock } from 'lucide-react'
import { useGroupContext } from '../../contexts/GroupContext'
import { useState } from 'react'
import PlatformFeeModal from '../../components/organizer/PlatformFeeModal'

export default function Payments() {
  const { activeGroup: group, participantsList, loading, refreshActiveGroup } = useGroupContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [showFeeModal, setShowFeeModal] = useState(false)

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando pagamentos...</div>
  }

  if (!group) {
    return <div className="p-8 text-center text-gray-500">Nenhum grupo ativo selecionado.</div>
  }

  const fee = group.pool_entry_fee || 0
  const paidList = participantsList.filter(p => p.payment_status === 'paid')
  const totalArrecadado = paidList.length * fee
  
  const PLATFORM_FEE = 1.50
  const platformDebt = paidList.length * PLATFORM_FEE

  const filteredParticipants = participantsList.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl flex items-center gap-2">
          <DollarSign size={24} className="text-emerald-500" />
          Financeiro
        </h2>
      </div>

      <div className="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6">
        <p className="text-emerald-100 font-display text-sm uppercase tracking-wider mb-1">Total Arrecadado</p>
        <h3 className="font-display font-bold text-3xl">R$ {totalArrecadado.toFixed(2)}</h3>
        <p className="text-emerald-100 text-sm mt-2">
          {paidList.length} de {participantsList.length} pessoas já pagaram a cota de R$ {fee.toFixed(2)}.
        </p>
      </div>

      {platformDebt > 0 && (
        <div className="card bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-gray-400 font-display text-sm uppercase tracking-wider mb-1">Taxa da Plataforma</p>
              <h3 className="font-display font-bold text-2xl text-white">R$ {platformDebt.toFixed(2)}</h3>
              <p className="text-gray-400 text-sm mt-1">
                Repasse pendente ({paidList.length} pagantes x R$ 1,50)
              </p>
            </div>
            {group.platform_fee_paid ? (
              <div className="flex items-center gap-2 text-emerald-500 font-bold bg-emerald-500/10 px-4 py-2 rounded-lg">
                <CheckCircle size={20} />
                Taxa Paga
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowFeeModal(true)}>
                Fazer Repasse
              </button>
            )}
          </div>
        </div>
      )}

      <div className="relative mt-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar participante..." 
          className="input pl-10"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {filteredParticipants.length === 0 ? (
          <p className="text-center text-gray-500 p-4">Nenhum participante encontrado.</p>
        ) : (
          filteredParticipants.map(p => (
            <div key={p.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${p.avatar_seed}&backgroundColor=10B981`}
                  alt={p.name}
                  className="w-10 h-10 rounded-full bg-gray-100"
                />
                <div>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-gray-500 text-xs">R$ {fee.toFixed(2)}</p>
                </div>
              </div>
              <div>
                {p.payment_status === 'paid' ? (
                  <span className="badge bg-emerald-100 text-emerald-700 border-none px-3 py-1.5 font-bold">
                    <CheckCircle size={14} className="mr-1 inline" /> Pago
                  </span>
                ) : p.payment_status === 'verifying' ? (
                  <span className="badge bg-blue-100 text-blue-700 border-none px-3 py-1.5 font-bold">
                    <Clock size={14} className="mr-1 inline" /> Verificando
                  </span>
                ) : (
                  <span className="badge bg-yellow-100 text-yellow-700 border-none px-3 py-1.5 font-bold">
                    Pendente
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showFeeModal && (
        <PlatformFeeModal 
          groupId={group.id} 
          totalFee={platformDebt} 
          onClose={() => setShowFeeModal(false)}
          onSuccess={() => {
            setShowFeeModal(false)
            if (group) refreshActiveGroup()
          }}
        />
      )}
    </div>
  )
}
