#!/usr/bin/env node
import { signals } from './index.js'
async function main() {
  const s = await signals()
  if (process.argv.includes('--json')) { console.log(JSON.stringify(s, null, 2)); return }
  if (process.argv.includes('--number')) { console.log(s.uncertainty); return }
  console.log(`Uncertainty:  ${s.uncertainty}/100`)
  console.log(`Geopolitical: ${s.geopolitical}/100`)
  console.log(`Momentum:     ${s.momentum > 0 ? '+' : ''}${s.momentum}`)
  console.log(`Activity:     ${s.activity}/100`)
}
main().catch(e => { console.error(e.message); process.exit(1) })
