const API = 'https://simplefunctions.dev/api/public/index'

export interface UncertaintySignals {
  /** 0-100 — overall disagreement across all tracked markets */
  uncertainty: number
  /** 0-100 — geopolitical risk component */
  geopolitical: number
  /** -1 to +1 — directional bias of recent moves */
  momentum: number
  /** 0-100 — recent trading activity */
  activity: number
  /** ISO-8601 server timestamp at which the index was computed */
  timestamp: string
}

let _cache: { data: UncertaintySignals; at: number } | null = null
const DEFAULT_CACHE_MS = 5 * 60 * 1000
let _cacheMs = DEFAULT_CACHE_MS

/** Override the in-memory cache TTL (default: 5 minutes). Pass 0 to disable. */
export function setCacheMs(ms: number): void {
  _cacheMs = Math.max(0, ms)
}

/** Drop any cached signals so the next call refetches. */
export function clearCache(): void {
  _cache = null
}

async function fetchSignals(): Promise<UncertaintySignals> {
  if (_cacheMs > 0 && _cache && Date.now() - _cache.at < _cacheMs) return _cache.data
  const res = await fetch(API)
  if (!res.ok) throw new Error(`SimpleFunctions API error ${res.status} for ${API}`)
  const d = (await res.json()) as Partial<UncertaintySignals>
  if (
    typeof d.uncertainty !== 'number' ||
    typeof d.geopolitical !== 'number' ||
    typeof d.momentum !== 'number' ||
    typeof d.activity !== 'number'
  ) {
    throw new Error(`SimpleFunctions API returned malformed index payload`)
  }
  const signals: UncertaintySignals = {
    uncertainty: d.uncertainty,
    geopolitical: d.geopolitical,
    momentum: d.momentum,
    activity: d.activity,
    timestamp: d.timestamp ?? new Date().toISOString(),
  }
  _cache = { data: signals, at: Date.now() }
  return signals
}

/** Get the headline uncertainty score (0-100). */
export async function uncertainty(): Promise<number> {
  return (await fetchSignals()).uncertainty
}

/** Get the geopolitical risk score (0-100). */
export async function geopolitical(): Promise<number> {
  return (await fetchSignals()).geopolitical
}

/** Get the momentum signal (-1 to +1). Positive = risk-on, negative = risk-off. */
export async function momentum(): Promise<number> {
  return (await fetchSignals()).momentum
}

/** Get the activity signal (0-100). High = lots of trading; low = quiet markets. */
export async function activity(): Promise<number> {
  return (await fetchSignals()).activity
}

/** Get all four signals at once (single network call, cached). */
export async function signals(): Promise<UncertaintySignals> {
  return fetchSignals()
}

/**
 * Map an uncertainty score to a coarse 5-band label. Useful for prompts and dashboards.
 *
 *  0-19  → 'complacent'
 *  20-39 → 'normal'
 *  40-59 → 'elevated'
 *  60-79 → 'high'
 *  80-100 → 'crisis'
 */
export function uncertaintyBand(score: number): 'complacent' | 'normal' | 'elevated' | 'high' | 'crisis' {
  if (score < 20) return 'complacent'
  if (score < 40) return 'normal'
  if (score < 60) return 'elevated'
  if (score < 80) return 'high'
  return 'crisis'
}

export default uncertainty
