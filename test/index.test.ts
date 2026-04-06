import { describe, it, expect } from 'vitest'
import { uncertainty, signals, clearCache } from '../src/index.js'
describe('uncertainty', () => {
  it('returns 0-100', async () => {
    clearCache()
    const u = await uncertainty()
    expect(u).toBeGreaterThanOrEqual(0)
    expect(u).toBeLessThanOrEqual(100)
  }, 15000)
  it('returns all signals', async () => {
    const s = await signals()
    expect(s).toHaveProperty('uncertainty')
    expect(s).toHaveProperty('geopolitical')
    expect(s).toHaveProperty('momentum')
    expect(s).toHaveProperty('activity')
  }, 15000)
})
