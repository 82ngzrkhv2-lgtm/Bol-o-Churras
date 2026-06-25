import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { Group, Participant, Match } from '../types'

interface ActiveGroupStats {
  participants: number
  paid: number
  predictions: number
}

interface GroupContextData {
  activeGroup: Group | null
  stats: ActiveGroupStats | null
  participantsList: Participant[]
  matchesList: Match[]
  loading: boolean
  refreshActiveGroup: (force?: boolean) => Promise<void>
}

const GroupContext = createContext<GroupContextData>({} as GroupContextData)

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [stats, setStats] = useState<ActiveGroupStats | null>(null)
  const [participantsList, setParticipantsList] = useState<Participant[]>([])
  const [matchesList, setMatchesList] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (user) {
      refreshActiveGroup()
    } else {
      setLoading(false)
    }
  }, [user])

  const refreshActiveGroup = useCallback(async (_force = false) => {
    // Cancela request anterior se ainda pendente
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    try {
      const { data: groups } = await supabase
        .from('groups')
        .select('*')
        .eq('organizer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!groups || groups.length === 0) {
        setActiveGroup(null)
        setStats(null)
        setParticipantsList([])
        setMatchesList([])
        setLoading(false)
        return
      }

      const group = groups[0]
      setActiveGroup(group)

      const [
        { data: parts },
        { data: mats }
      ] = await Promise.all([
        supabase.from('participants').select('*').eq('group_id', group.id).order('name'),
        supabase.from('matches').select('*').eq('group_id', group.id).order('match_date')
      ])

      const pList = parts || []
      const mList = mats || []

      setParticipantsList(pList)
      setMatchesList(mList)

      const paidCount = pList.filter(p => p.payment_status === 'paid').length

      const matchIds = mList.map(m => m.id)
      let predCount = 0
      if (matchIds.length > 0) {
        const { count } = await supabase
          .from('predictions')
          .select('id', { count: 'exact', head: true })
          .in('match_id', matchIds)
        predCount = count || 0
      }

      setStats({
        participants: pList.length,
        paid: paidCount,
        predictions: predCount
      })



    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Error fetching active group:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  return (
    <GroupContext.Provider value={{
      activeGroup,
      stats,
      participantsList,
      matchesList,
      loading,
      refreshActiveGroup
    }}>
      {children}
    </GroupContext.Provider>
  )
}

export function useGroupContext() {
  return useContext(GroupContext)
}
