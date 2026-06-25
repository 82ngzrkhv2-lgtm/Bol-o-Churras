// src/hooks/useCache.ts
// Sistema de cache de dois niveis: memoria (rapido) + sessionStorage (persistente na sessao)
import { useState, useEffect, useCallback } from "react"

type CacheEntry<T> = { data: T; expiresAt: number }

const memoryCache = new Map<string, CacheEntry<unknown>>()
const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutos

export function setCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS) {
  const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs }
  memoryCache.set(key, entry as CacheEntry<unknown>)
  try { sessionStorage.setItem(`bc_cache_${key}`, JSON.stringify(entry)) } catch { /* noop */ }
}

export function getCache<T>(key: string): T | null {
  const now = Date.now()
  const memEntry = memoryCache.get(key) as CacheEntry<T> | undefined
  if (memEntry && memEntry.expiresAt > now) return memEntry.data
  try {
    const raw = sessionStorage.getItem(`bc_cache_${key}`)
    if (raw) {
      const entry = JSON.parse(raw) as CacheEntry<T>
      if (entry.expiresAt > now) {
        memoryCache.set(key, entry as CacheEntry<unknown>)
        return entry.data
      }
      sessionStorage.removeItem(`bc_cache_${key}`)
    }
  } catch { /* noop */ }
  return null
}

export function invalidateCache(key: string) {
  memoryCache.delete(key)
  try { sessionStorage.removeItem(`bc_cache_${key}`) } catch { /* noop */ }
}

export function invalidateCachePrefix(prefix: string) {
  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(prefix)) memoryCache.delete(key)
  }
  try {
    const toRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k && k.startsWith(`bc_cache_${prefix}`)) toRemove.push(k)
    }
    toRemove.forEach((k) => sessionStorage.removeItem(k))
  } catch { /* noop */ }
}

interface UseCachedQueryOptions { ttlMs?: number; enabled?: boolean }

export function useCachedQuery<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: UseCachedQueryOptions = {}
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  const { ttlMs = DEFAULT_TTL_MS, enabled = true } = options
  const [data, setData] = useState<T | null>(() => getCache<T>(cacheKey))
  const [loading, setLoading] = useState(!data && enabled)
  const [error, setError] = useState<Error | null>(null)

  const run = useCallback(async () => {
    const cached = getCache<T>(cacheKey)
    if (cached !== null) { setData(cached); setLoading(false); return }
    setLoading(true); setError(null)
    try {
      const result = await fetcher()
      setCache(cacheKey, result, ttlMs)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally { setLoading(false) }
  }, [cacheKey, ttlMs])

  useEffect(() => { if (enabled) run() }, [enabled, run])
  return { data, loading, error, refetch: run }
}
