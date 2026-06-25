import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Shield, Users, Trophy, DollarSign, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import type { Profile, Group } from '../../types'

interface AdminStats {
  totalOrganizers: number
  totalGroups: number
  activeGroups: number
  paidGroups: number
  pendingFeeGroups: number
  totalRevenue: number
}

interface OrganizerWithGroups extends Profile {
  groups: Group[]
  fee_status: {
    paid: number
    pending: number
  }
}

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const [organizers, setOrganizers] = useState<OrganizerWithGroups[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Verifica se o usuário atual é admin baseado no .env ou no banco de dados
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'reinandzn01@gmail.com'
  const isSuperAdmin = profile?.is_admin || user?.email === adminEmail

  useEffect(() => {
    if (!isSuperAdmin) return
    loadAdminData()
  }, [isSuperAdmin])

  async function loadAdminData() {
    setLoading(true)
    try {
      // Busca todos os organizadores (bypassing RLS or relying on admin policy)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Busca todos os grupos
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')

      if (groupsError) throw groupsError

      // Processa os dados
      let activeG = 0
      let paidG = 0
      let pendingG = 0
      let revenue = 0

      const organizersMap = new Map<string, OrganizerWithGroups>()

      profilesData.forEach(p => {
        organizersMap.set(p.id, {
          ...p,
          groups: [],
          fee_status: { paid: 0, pending: 0 }
        })
      })

      groupsData.forEach(g => {
        if (g.is_active) activeG++
        if (g.platform_fee_paid) {
          paidG++
          revenue += 1.0 // Taxa de R$ 1.00 por transação paga
        } else {
          pendingG++
        }

        const org = organizersMap.get(g.organizer_id)
        if (org) {
          org.groups.push(g)
          if (g.platform_fee_paid) org.fee_status.paid++
          else org.fee_status.pending++
        }
      })

      setStats({
        totalOrganizers: profilesData.length,
        totalGroups: groupsData.length,
        activeGroups: activeG,
        paidGroups: paidG,
        pendingFeeGroups: pendingG,
        totalRevenue: revenue
      })

      setOrganizers(Array.from(organizersMap.values()))
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao carregar dados do admin. Você rodou a migração SQL?')
    } finally {
      setLoading(false)
    }
  }

  async function toggleBlock(orgId: string, currentStatus: boolean) {
    if (!confirm(currentStatus ? 'Desbloquear usuário?' : 'Bloquear usuário e impedir acesso ao sistema?')) return
    const { error } = await supabase.from('profiles').update({ is_blocked: !currentStatus }).eq('id', orgId)
    if (error) {
      toast.error('Erro ao alterar status do usuário.')
    } else {
      toast.success(currentStatus ? 'Usuário desbloqueado!' : 'Usuário bloqueado!')
      loadAdminData()
    }
  }

  if (authLoading) return <div>Carregando...</div>
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-dvh flex flex-col p-4 md:p-8" style={{ background: 'var(--bg-base)' }}>
      <header className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 border border-green-200">
          <Shield size={24} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-gray-900">Super Admin</h1>
          <p className="text-sm text-gray-500">Visão Geral da Plataforma</p>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Carregando dados da plataforma...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="card p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Users size={16} />
                <span className="text-sm font-semibold">Organizadores</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalOrganizers || 0}</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Trophy size={16} />
                <span className="text-sm font-semibold">Grupos Criados</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalGroups || 0}</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle size={16} />
                <span className="text-sm font-semibold">Taxas Pagas (Qtd)</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.paidGroups || 0}</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <Clock size={16} />
                <span className="text-sm font-semibold">Taxas Pend. (Qtd)</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingFeeGroups || 0}</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <DollarSign size={16} />
                <span className="text-sm font-semibold">Total Recebido</span>
              </div>
              <p className="text-2xl font-bold text-green-600">R$ {(stats?.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <DollarSign size={16} />
                <span className="text-sm font-semibold">Total Pendente</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">R$ {((stats?.pendingFeeGroups || 0) * 1.0).toFixed(2)}</p>
            </div>
          </div>

          {/* Lista de Organizadores */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900">Organizadores e Status</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="p-4 font-medium">Nome</th>
                    <th className="p-4 font-medium">E-mail</th>
                    <th className="p-4 font-medium">WhatsApp</th>
                    <th className="p-4 font-medium">Grupos</th>
                    <th className="p-4 font-medium">Pagos</th>
                    <th className="p-4 font-medium">Pendentes</th>
                    <th className="p-4 font-medium">Criado em</th>
                    <th className="p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {organizers.map(org => (
                    <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{org.full_name || '-'}</td>
                      <td className="p-4">{org.email}</td>
                      <td className="p-4">{org.whatsapp || '-'}</td>
                      <td className="p-4">{org.groups.length}</td>
                      <td className="p-4 text-green-600 font-semibold">{org.fee_status.paid}</td>
                      <td className="p-4 text-yellow-600 font-semibold">{org.fee_status.pending}</td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(org.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleBlock(org.id, org.is_blocked || false)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${org.is_blocked ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          {org.is_blocked ? 'Desbloquear' : 'Bloquear'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {organizers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        Nenhum organizador encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
