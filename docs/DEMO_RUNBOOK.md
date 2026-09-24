# CAT Spotter — Demo Runbook

## Pre-Demo Checklist

- [ ] Open in **Chrome** (required for Web Speech API)
- [ ] Grant **microphone permission** once (click the Spotter Orb)
- [ ] Check the **connection pill** is green ("Connected")
- [ ] Check the LLM badge shows "Claude" or "Template" (both work)
- [ ] **Reset** the scenario via Demo Panel (press `D`, then "Reset")
- [ ] Sound is **ON** (for TTS playback)
- [ ] Screen resolution: **1280×800+** landscape
- [ ] Sun Day theme is **OFF** (start with Cab Night dark theme)

## Narrative (3–4 minutes)

### 1. Boot & Greeting (B0, 0:00)
> "This is CAT Spotter — not a dashboard, but a **foreman in the cab**."

- Show the boot animation (wordmark stroke-draws, panels reveal)
- The Spotter greets: "Good morning, I see rain at 11:00 and wind after 14:00"
- **Key moment:** The schedule **auto-reorders** with a highlighted ribbon showing "moved ahead of rain"

### 2. Pre-Shift Briefing (B1, 0:20)
> "Before we start, the system already knows we need to refuel."

- Point to the **refuel warning** (fuel gauge animation)
- The Spotter speaks: "You'll need more fuel for the tasks at Site B"
- Show the **resource forecast** in the Insights sheet

### 3. First Task — Voice Control (B2, 0:40)
> "The operator wears gloves — everything works by voice."

- Say or click **"start task"**
- Watch the ETA range + confidence ring animate in
- Cycle counter climbs; no alerts (this is a healthy window)
- Show the **"why" chips** explaining the prediction

### 4. Trouble — Seatbelt + Idle (B3, 1:10)
> "Now things go wrong. The operator unbuckles and idles for 55 minutes."

- **Critical seatbelt takeover** fills the screen (red vignette, voice warning)
- After acknowledging: idle warning, unproductive interval anomaly
- **Key moment:** Spotter asks "Truck delay, machine fault, break, or shut down?"
- Answer by voice → logged as labelled data
- **Idle cost meter** jumps (₹ ticking up in real time)

### 5. Weather Change (B4, 1:40)
> "The weather just changed. Watch what happens to the predictions."

- Use Demo Panel or say "it's raining"
- **ETA recalculates live** — old ETA ghost fades, delta chip shows "+6 min, Rainy"
- Task rail reorders again (rain-sensitive tasks move)

### 6. Training Auto-Triggered (B5, 2:10)
> "The system doesn't just monitor — it teaches."

- A task finishes 18% over ETA
- **Training toast** appears: "Micro-lesson queued: Trenching in wet ground"
- Open Training sheet → show the queued lesson with reason
- **Ghost Operator** shows how an expert would have done it

### 7. Proximity Danger (B6, 2:40)
> "Safety is always first."

- After a healthy window (safe-hour streak +1)
- Toggle proximity to 4m in Demo Panel
- **Proximity DANGER takeover** — full screen, voice warning
- Acknowledge → show the proximity radar widget

### 8. Fatigue & End of Shift (B7, 3:10)
> "After a tough shift, the system knows when to recommend a break."

- Row 4: everything goes wrong again
- Fatigue gauge rises to "High"
- **Break recommended** with projected time
- Incident auto-drafted with conditions snapshot
- **End-of-shift summary** card with stats

### Close
> "Three things make this different:
> 1. **Cross-module intelligence** — a task overrun auto-triggers training
> 2. **Voice-first** — everything works with gloves on
> 3. **Live ML** — predictions recalculate when conditions change
>
> And the AI never makes safety decisions — rules decide, Claude just phrases the message."

## Fallback Procedures

| Situation | Fallback |
|---|---|
| No internet | Template nudges work offline; weather uses scripted fallback |
| No microphone (non-Chrome) | Typed input bar + quick-reply chips appear |
| WebSocket disconnects | Auto-reconnect pill shows; data resyncs on reconnect |
| Model file missing | Loader retrains at startup (< 30 seconds) |
| LLM API down | Template fallback (shown as "Template" badge in TopBar) |
| Demo gets stuck | Use Demo Panel beat buttons to jump to any beat |
| Need to restart | Demo Panel "Reset" button resets everything |

## Judge Q&A Crib Sheet

**Q: Why RandomForest?**
A: Interpretable, handles categorical features natively, provides prediction intervals via tree variance. With only 5 real rows, a simpler model is more appropriate than deep learning.

**Q: Why rules + LLM instead of a trained anomaly model?**
A: Safety decisions must be deterministic and auditable. Rules provide guaranteed behavior; the LLM only phrases human-readable messages. If the LLM fails, template messages take over with zero impact on safety.

**Q: Is the data real?**
A: We have 5 real task rows and 4 real telemetry rows. We generated 800 synthetic rows calibrated to the real data patterns. All synthetic data is labelled "synthetic" in the dataset and "Simulated" in the UI. The model card in the Insights sheet discloses everything.

**Q: How would this scale to real equipment?**
A: Replace the CSV simulator with a CAN-bus/MQTT adapter. The rule engine, ML model, and UI are protocol-agnostic. The WebSocket-based architecture handles real-time data natively.

**Q: What about the LLM making dangerous decisions?**
A: The LLM has no tools and cannot trigger actions. It receives structured facts and returns formatted text within a validated JSON schema. All safety logic runs in deterministic rules with fixed thresholds. The product works fully without any LLM API key.
