const API = 'https://simplefunctions.dev/api/public/index'

export interface UncertaintySignals {
  uncertainty: number
  geopolitical: number
  momentum: number
  activity: number
  timestamp: string
}

let _cache: { data: UncertaintySignals; at: number } | null = null
const CACHE_MS = 5 * 60 * 1000

async function fetchSignals(): Promise<UncertaintySignals> {
  if (_cache && Date.now() - _cache.at < CACHE_MS) return _cache.data
  const res = await fetch(API)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const d = await res.json()
  const signals: UncertaintySignals = { uncertainty: d.uncertainty, geopolitical: d.geopolitical, momentum: d.momentum, activity: d.activity, timestamp: d.timestamp }
  _cache = { data: signals, at: Date.now() }
  return signals
}

export async function uncertainty(): Promise<number> { return (await fetchSignals()).uncertainty }
export async function geopolitical(): Promise<number> { return (await fetchSignals()).geopolitical }
export async function momentum(): Promise<number> { return (await fetchSignals()).momentum }
export async function activity(): Promise<number> { return (await fetchSignals()).activity }
export async function signals(): Promise<UncertaintySignals> { return fetchSignals() }
export function clearCache() { _cache = null }
export default uncertainty
