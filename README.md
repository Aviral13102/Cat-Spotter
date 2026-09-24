# CAT Spotter

**Smart Operator Assistant for CAT Machinery** — a conversational, voice-first co-pilot that behaves like an experienced foreman riding in the cab.

## Quick Start (Local Development)

```bash
# 1. Clone and setup
git clone <repo-url> cat-spotter && cd cat-spotter
make setup

# 2. Configure (optional — works without API key using template fallback)
cp .env.example .env
# Edit .env to add ANTHROPIC_API_KEY if desired

# 3. Generate data and train ML model
make data
make train

# 4. Start development servers
make dev
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

## Architecture

- **Frontend:** React 18 + TypeScript (strict) + Vite + Framer Motion + Zustand + Recharts
- **Backend:** FastAPI + Uvicorn + SQLite + scikit-learn + Anthropic SDK
- **Voice:** Web Speech API (Chrome/Edge; typed fallback always available)
- **ML:** RandomForest ETA prediction with 5 real + 795 synthetic training rows (clearly labelled)

## Data Honesty

This is a demo/hackathon product. All simulated, synthetic, or assumed data is clearly labelled in the UI:
- **"Simulated sensor"** — telemetry data is replayed from CSV, not real CAN-bus
- **"Augmented training data"** — ML model trained on 5 real rows + 795 seeded synthetic rows
- **"Assumed rate"** — fuel price (₹92/L), idle burn rate (3 L/hr), CO₂ factor (2.68 kg/L)

## Key Features

- 📊 **Daily Task Dashboard** — Weather-optimised task sequencing with pre-shift fuel forecast
- 🔒 **Safety Monitoring** — Seatbelt compliance, proximity hazards, fatigue scoring
- 🤖 **AI Co-pilot** — Voice-enabled nudges, proactive alerts, LLM-phrased messages (with template fallback)
- ⏱️ **Predictive ETA** — RandomForest model with confidence ranges and "why" driver chips
- 📚 **Auto-triggered Training** — Task overruns auto-queue targeted micro-lessons
- 🎮 **Gamification** — Safe-hour streaks, badges, leaderboard (all positive reinforcement)
- 💰 **Idle Cost Quantification** — Live ₹/L/CO₂ meters with cost-per-minute tracking

## Safety Principle

The LLM **never makes safety decisions**. Deterministic rules evaluate telemetry and decide severity/thresholds. Claude only phrases the human-readable message, with a template fallback if the API is unavailable.

## No Caterpillar Trademarks

This product uses the "CAT Spotter" wordmark and a yellow/black industrial palette. No Caterpillar logos or trademarked artwork are used.

## Commands

| Command | Description |
|---|---|
| `make setup` | Install Python venv + npm dependencies |
| `make data` | Generate augmented training CSV |
| `make train` | Train RandomForest model |
| `make test` | Run all backend + frontend tests |
| `make dev` | Start backend + frontend dev servers |
| `make build` | Production build |
| `make smoke` | WebSocket smoke test |
| `make deploy` | Deploy to production |

## Documentation

- [DECISIONS.md](DECISIONS.md) — All assumptions and design decisions
- [docs/PROGRESS.md](docs/PROGRESS.md) — Phase-by-phase progress
- [docs/DEMO_RUNBOOK.md](docs/DEMO_RUNBOOK.md) — Demo script and fallbacks
- [docs/API.md](docs/API.md) — API reference

## License

Hackathon project — not for production use.
