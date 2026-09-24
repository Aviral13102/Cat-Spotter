# CAT Spotter — Decisions Log

Every assumption and design decision is recorded here for traceability.

| ID | Decision | Reason | How to change |
|---|---|---|---|
| D-01 | Each telemetry row is a 60-minute reporting window snapshot. `idle_ratio = min(1, idling_time_min / 60)` | Consistent with window_min=60 assumption. Original data has no explicit window field. | Change `WINDOW_MIN` in config.py |
| D-02 | Historical task IDs T001–T005 are past data. Today's schedule uses new IDs D-01 to D-05 with the same five task types. | Separation of historical training data from live schedule. | Modify schedule_seed.json |
| D-03 | Operator OP1001 default skill = Intermediate. Editable in Demo Panel. | Most balanced default; Expert/Beginner are edge cases. | Change `DEFAULT_SKILL` in config.py or toggle in Demo Panel |
| D-04 | Diesel price ₹92/L, idle burn 3 L/hr, CO₂ 2.68 kg/L are labelled "Assumed rate" in all UI surfaces. | No real rate data available; transparency required. | Update values in config.py; UI labels auto-apply |
| D-05 | Using Barlow Condensed (display) + Inter (body) fonts bundled via @fontsource. No CDN dependency. | Industrial aesthetic matching the CAT theme; offline-capable. | Swap font packages in frontend/package.json |
| D-06 | Currency symbol is ₹ (INR) matching the Indian locale context from the reference UI. | Reference image shows dollar sign but plan specifies INR. Following plan's INR spec with ₹ symbol. | Change CURRENCY_SYMBOL in config.py |
| D-07 | Frontend WebSocket URL derived from window.location (wss:// on HTTPS, ws:// on HTTP). No hardcoded hosts. | Works across dev/staging/prod without config changes. | N/A |
| D-08 | SQLite database stored at data/cat_spotter.db, auto-created with migrations on first startup. | Simplest persistence that survives restarts; no external DB needed. | Change DB_PATH in config.py |
| D-09 | Random seed 42 used globally for augmentation, model training, and scenario replay. | Deterministic demos that reproduce identically every run per plan requirement. | Change SEED in .env |
| D-10 | Using Open-Meteo free API for weather with scripted JSON fallback when offline. | No API key required; reliable for demos. | Replace weather provider in sim/weather.py |
| D-11 | UI theme follows the uploaded reference: dark bg #0E0F11, yellow #FFCD11 accents, bordered cards with subtle rounded corners, large industrial typography. | Matches the provided UI mockup image. | Modify tokens.css |
| D-12 | The sim clock default speed is 1 real second = 1 sim minute, so the full 4-row telemetry replay completes in ~48 real seconds. | Fast enough for demo beats (B0-B7 in ~4 min) while being observable. | Change SIM_SPEED in Demo Panel or config |
