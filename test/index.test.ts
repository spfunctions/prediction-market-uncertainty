import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  uncertainty,
  geopolitical,
  momentum,
  activity,
  signals,
  clearCache,
  setCacheMs,
  uncertaintyBand,
  type UncertaintySignals,
} from '../src/index.js'

const FIXTURE: UncertaintySignals = {
  uncertainty: 22,
  geopolitical: 0,
  momentum: -0.08,
  activity: 99,
  timestamp: '2026-04-07T07:18:03.451Z',
}

function mockFetchOnce(body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  )
}

beforeEach(() => {
  clearCache()
  setCacheMs(5 * 60 * 1000) // restore default
})

afterEach(() => vi.restoreAllMocks())

describe('signal accessors', () => {
  it('uncertainty() returns the headline number', async () => {
    mockFetchOnce(FIXTURE)
    expect(await uncertainty()).toBe(22)
  })

  it('geopolitical() returns the geo component', async () => {
    mockFetchOnce(FIXTURE)
    expect(await geopolitical()).toBe(0)
  })

  it('momentum() returns the momentum signal', async () => {
    mockFetchOnce(FIXTURE)
    expect(await momentum()).toBe(-0.08)
  })

  it('activity() returns the activity signal', async () => {
    mockFetchOnce(FIXTURE)
    expect(await activity()).toBe(99)
  })

  it('signals() returns the full bundle', async () => {
    mockFetchOnce(FIXTURE)
    const s = await signals()
    expect(s).toEqual(FIXTURE)
  })

  it('hits /api/public/index', async () => {
    const spy = mockFetchOnce(FIXTURE)
    await signals()
    const url = spy.mock.calls[0][0]
    expect(String(url)).toBe('https://simplefunctions.dev/api/public/index')
  })
})

describe('caching', () => {
  it('caches the second call within TTL', async () => {
    const spy = mockFetchOnce(FIXTURE)
    await signals()
    await signals()
    await signals()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('clearCache forces a refetch', async () => {
    const spy = mockFetchOnce(FIXTURE)
    await signals()
    clearCache()
    mockFetchOnce({ ...FIXTURE, uncertainty: 88 })
    expect(await uncertainty()).toBe(88)
    expect(spy).toHaveBeenCalledTimes(1) // first spy only counted the first call
  })

  it('setCacheMs(0) disables caching', async () => {
    setCacheMs(0)
    mockFetchOnce(FIXTURE)
    await signals()
    mockFetchOnce({ ...FIXTURE, uncertainty: 50 })
    expect(await uncertainty()).toBe(50)
  })
})

describe('error handling', () => {
  it('throws on non-2xx with status code in message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('boom', { status: 503, headers: { 'content-type': 'text/plain' } }),
    )
    await expect(signals()).rejects.toThrow(/503/)
  })

  it('throws on malformed payload (missing fields)', async () => {
    mockFetchOnce({ uncertainty: 22 }) // missing other fields
    await expect(signals()).rejects.toThrow(/malformed/)
  })
})

describe('uncertaintyBand()', () => {
  it.each([
    [0, 'complacent'],
    [19, 'complacent'],
    [20, 'normal'],
    [39, 'normal'],
    [40, 'elevated'],
    [59, 'elevated'],
    [60, 'high'],
    [79, 'high'],
    [80, 'crisis'],
    [100, 'crisis'],
  ] as const)('maps %i → %s', (score, expected) => {
    expect(uncertaintyBand(score)).toBe(expected)
  })
})
