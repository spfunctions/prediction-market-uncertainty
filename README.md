# prediction-market-uncertainty

Real-time uncertainty index from 30,000+ prediction markets. One function, one number (0-100).

[![npm](https://img.shields.io/npm/v/prediction-market-uncertainty)](https://www.npmjs.com/package/prediction-market-uncertainty)

```ts
import uncertainty from 'prediction-market-uncertainty'
const score = await uncertainty() // 31 (0-100)
```

## What is this?

A single number (0-100) that measures how much prediction markets disagree with each other right now. Derived from orderbook spreads across 30,000+ markets on Kalshi and Polymarket.

- **0-20**: Markets are confident and agree (complacent)
- **20-40**: Normal uncertainty
- **40-60**: Elevated uncertainty
- **60-80**: High uncertainty, markets in flux
- **80-100**: Extreme uncertainty / crisis

Think of it as a VIX for prediction markets, but derived from actual betting spreads rather than options pricing.

## Install
```bash
npm install prediction-market-uncertainty
```

## Usage

```ts
import { uncertainty, geopolitical, momentum, signals } from 'prediction-market-uncertainty'

const u = await uncertainty()    // 0-100
const g = await geopolitical()   // 0-100 geopolitical risk
const m = await momentum()       // -1 to +1 directional bias
const all = await signals()      // all four at once
```

## CLI
```bash
npx prediction-market-uncertainty          # formatted output
npx prediction-market-uncertainty --number # just the number
npx prediction-market-uncertainty --json   # JSON
```

## Use cases
- Gate deployments: don't deploy if uncertainty > 80
- Agent context: inject uncertainty level into system prompts
- Dashboard widgets: show current market sentiment
- Trading bots: adjust position sizing based on uncertainty

## License
MIT — [SimpleFunctions](https://simplefunctions.dev)
