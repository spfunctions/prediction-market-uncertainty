# prediction-market-uncertainty

[![npm](https://img.shields.io/npm/v/prediction-market-uncertainty)](https://www.npmjs.com/package/prediction-market-uncertainty)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Real-time uncertainty index from the live prediction-market universe. One function, one number (0-100).**
Zero dependencies. Built-in 5-minute cache. Works in Node, browsers, Deno, Bun, edge runtimes.

```ts
import uncertainty from 'prediction-market-uncertainty'
const score = await uncertainty()   // 22
```

---

## What is this?

A single number (0-100) that measures **how much real-money prediction markets
disagree with each other right now**. Derived from orderbook spreads across
the live market universe on Kalshi and Polymarket — narrow spreads = traders agree on
where the price should be (low uncertainty); wide spreads = traders disagree
(high uncertainty).

Think of it as a VIX for prediction markets, but derived from actual betting
spreads rather than options pricing.

| Band | Score | Meaning |
|------|-------|---------|
| `complacent` | 0-19 | Very tight spreads, markets confident, often overconfident |
| `normal` | 20-39 | Standard market conditions |
| `elevated` | 40-59 | Spreads widening, narrative shifting |
| `high` | 60-79 | Markets in flux, low confidence in resolution |
| `crisis` | 80-100 | Extreme disagreement, often around macro shocks |

## Install

```bash
npm install prediction-market-uncertainty
```

No peer dependencies. No API key. No rate limit. No auth.

## Usage

### One number

```ts
import uncertainty from 'prediction-market-uncertainty'
console.log(await uncertainty())  // 22
```

### All four signals

```ts
import { signals } from 'prediction-market-uncertainty'

const s = await signals()
// {
//   uncertainty: 22,        // 0-100
//   geopolitical: 0,        // 0-100
//   momentum: -0.08,        // -1 to +1
//   activity: 99,           // 0-100
//   timestamp: '2026-04-07T07:18:03.451Z',
// }
```

### Individual signals

```ts
import { uncertainty, geopolitical, momentum, activity } from 'prediction-market-uncertainty'

const u = await uncertainty()   // 0-100  — overall disagreement
const g = await geopolitical()  // 0-100  — geopolitical risk component
const m = await momentum()      // -1..+1 — directional bias of recent moves
const a = await activity()      // 0-100  — recent trading activity
```

### Coarse 5-band label

```ts
import uncertainty, { uncertaintyBand } from 'prediction-market-uncertainty'

const band = uncertaintyBand(await uncertainty())
// 'complacent' | 'normal' | 'elevated' | 'high' | 'crisis'
```

### CLI

```bash
npx prediction-market-uncertainty           # formatted output
npx prediction-market-uncertainty --number  # just the number
npx prediction-market-uncertainty --json    # JSON
```

## Caching

Calls are cached in memory for 5 minutes by default — every helper shares the
same cached payload, so calling `uncertainty()` and `signals()` back-to-back
makes a single network request.

```ts
import { setCacheMs, clearCache } from 'prediction-market-uncertainty'

setCacheMs(60_000)  // change TTL to 1 minute
setCacheMs(0)       // disable caching entirely
clearCache()        // drop the cached payload
```

## Use cases

- **Gate deployments** — block prod pushes when uncertainty > 80 (markets are pricing a shock)
- **System-prompt context** — inject the band into LLM agent system prompts so they reason about regime
- **Dashboard widgets** — show a single number on your home dashboard
- **Position sizing** — scale bot position size inversely with uncertainty
- **Alerting** — fire a Slack message when the band crosses into `high` or `crisis`

```ts
// Example: gate a deploy script on uncertainty
import uncertainty, { uncertaintyBand } from 'prediction-market-uncertainty'

const score = await uncertainty()
if (uncertaintyBand(score) === 'crisis') {
  console.error(`Aborting deploy: market uncertainty is ${score} (crisis band)`)
  process.exit(1)
}
```

## Errors

Throws `Error("SimpleFunctions API error <status> for <url>")` on non-2xx
responses, and `Error("...malformed index payload")` if the response is missing
expected fields. Wrap in try/catch if your call site needs to degrade gracefully.

## Sister packages

| Need | Package |
|------|---------|
| Add a labeled regime state on top | [`prediction-market-regime`](https://github.com/spfunctions/prediction-market-regime) |
| Get the full world snapshot | [`agent-world-awareness`](https://github.com/spfunctions/agent-world-awareness) |
| Get actionable mispricings | [`prediction-market-edge-detector`](https://github.com/spfunctions/prediction-market-edge-detector) |
| Use inside a LangChain / Vercel AI / OpenAI / CrewAI agent | [`langchain-prediction-markets`](https://github.com/spfunctions/langchain-prediction-markets), [`vercel-ai-prediction-markets`](https://github.com/spfunctions/vercel-ai-prediction-markets), [`openai-agents-prediction-markets`](https://github.com/spfunctions/openai-agents-prediction-markets), [`crewai-prediction-markets`](https://github.com/spfunctions/crewai-prediction-markets) |
| MCP / Claude / Cursor | [`simplefunctions-cli`](https://github.com/spfunctions/simplefunctions-cli) |

## Testing

```bash
npm test
```

21 tests, all `fetch`-mocked — no network required.

## License

MIT — built by [SimpleFunctions](https://simplefunctions.dev).
