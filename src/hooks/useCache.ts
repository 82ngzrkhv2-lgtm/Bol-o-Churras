// src/hooks/useCache.ts
// Dummy/no-op caching system to avoid compile/runtime errors, ensuring data is always fetched fresh.
import { useState, useEffect, useCallback } from "react"

export function setCache<T>(_key: string, _data: T, _ttlMs?: number): void {
  // No-op: do not save anything
}

export function getCache<T>(_key: string): T | null {
  // No-op: always return null so we never get cached data
  return null
}

export function invalidateCache(_key: string): void {
  // No-op
}

export function invalidateCachePrefix(_prefix: string): void {
  // No-op
}

interface UseCachedQueryOptions { ttlMs?: number; enabled?: boolean }

export function useCachedQuery<T>(
  _cacheKey: string,
  fetcher: () => Promise<T>,
  options: UseCachedQueryOptions = {}
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  const { enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)

  const run = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => { if (enabled) run() }, [enabled, run])

  return { data, loading, error, refetch: run }
}
