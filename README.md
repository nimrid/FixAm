<div align="center">
  <img src="public/icon.svg" width="88" alt="FixAm logo" />
  <h1>FixAm — Snap it, fix am</h1>
  <p><strong>AI repair guide for the machines Nigeria runs on.</strong><br />
  Photograph the fault, describe it in English or Pidgin, get the failing parts<br />
  drawn on your photo plus steps, fair Naira prices, and safety warnings.</p>
  <p>
    <a href="https://fixam-iota.vercel.app/"><strong>🌐 Live demo</strong></a> ·
    <a href="https://fixam-iota.vercel.app/app?demo=1"><strong>▶ 20-second auto demo</strong></a> ·
    <a href="https://github.com/nimrid/FixAm">Code</a>
  </p>
  <p><em>Indie entry · Meta Global AI Developer Hackathon · Build for Your World</em></p>
</div>

---

## The problem

When a generator dies at night, an okada won't start, or a car overheats on the express, most Nigerians can't tell what's wrong — and finding an honest mechanic or rewinder is stressful, expensive, and at night, unsafe. Repair knowledge lives in people's heads; FixAm puts it in your pocket, in your language.

## What it does

Pick what broke — **generator, okada, solar, phone, or car** — snap a photo, say what's wrong (typed or Pidgin voice note), and FixAm:

1. **Finds the parts** — SAM 3.1 segments components and draws labeled boxes on your photo. Spark first reads your symptom and decides *which* parts to look for (agentic routing, not a fixed list).
2. **Diagnoses with vision** — Muse Spark reads photo + symptom + parts and returns strict-JSON diagnosis: verdict, confidence, numbered steps, tools, and warnings.
3. **Prices it fairly** — every fix carries Naira parts prices, a rewinder/mechanic estimate, and your DIY savings, plus a one-tap WhatsApp share and an AI repair diagram.
4. **Checks motion** — record 3 seconds of a running engine: a Modal pipeline tracks it frame-by-frame with SAM 3.1 video segmentation, computes a vibration index, and Spark judges shake + exhaust smoke on a per-frame timeline.

Real output, Tiger 2.5kVA (boxes + verdict from the live API):

![SAM segmentation on a Tiger generator](public/demo/gen-tiger.jpg)

## Meta technology

| Model / API | Where it works | Evidence |
|---|---|---|
| Muse Spark 1.3 | Vision diagnosis (strict JSON schema), agentic concept router, motion verdict | `lib/meta.js` → `callSparkDiagnosis`, `callSparkConcepts`, `callSparkMotion` |
| SAM 3.1 | Per-concept streaming segmentation, boxes + confidence overlaid on photos | `callSAMParts`, `parseSamLine` |
| SAM 3.1 video | Frame-by-frame engine/exhaust tracking on 3s clips | `modal_app.py` → `_sam_video_track` |
| Muse Image 1.0 | Labeled repair diagrams per diagnosis | `callImageGen`, `/api/diagram` |
| Voice Transcribe 1.0 | Pidgin/English voice notes (browser converts to 16kHz WAV first) | `callTranscribe`, `/api/transcribe` |
| Files API | Clip upload for video segmentation (`purpose=user_data`) | `modal_app.py` upload step |

Compute: **Modal** (CPU) runs the video pipeline — ffmpeg normalize, Files upload, SAM stream parsing, vibration math — exposed as async `submit_clip`/`clip_result` endpoints so serverless timeouts can never force a mock result.

## Domains

| | Domain | Covers |
|---|---|---|
| ⚡ | Generator | Tiger, Elepaq, Firman: hard-start, smoke, no-output |
| 🏍 | Okada | Bajaj Boxer, Honda CG: starting, chain, brakes, oil |
| ☀ | Solar | Inverter faults, weak charging, battery care |
| 📱 | Phone | Battery, charging, cracked screen, storage, network |
| 🚗 | Car | Roadside overheating, no-start, brakes, flats — with night-safety rules |

Adding a domain = `lib/domains/<id>/{faults.json,prices.json}` + one registry entry in `lib/domains.js` + one picker button. No pipeline changes.

## Reliability

- **Offline-first fallbacks:** every API route degrades to local mocks with an explicit `offline demo` badge — demos survive dead networks and empty credits.
- **Guardrails:** photo-quality coaching, clip size caps, strict JSON schemas on all model output, safety warnings on every fix.
- **PWA:** installable, works from the home screen, English/Pidgin throughout.

## Run locally

```bash
cd FixAm
cp .env.example .env   # add MODEL_API_KEY (hackathon credits)
npm install
npm run dev -- -H 0.0.0.0 -p 3000
```

Open `http://<your-lan-ip>:3000` on your phone (same WiFi). Mic/camera *recording* needs HTTPS — use the Vercel URL above or `cloudflared tunnel --url http://localhost:3000`; photo capture + typing work over plain HTTP.

`FIXAM_DEMO_MODE=true` runs fully offline with local mocks (zero API spend).

## Deploy

**App (Vercel):** `npx vercel`, then add the `.env` values in the dashboard. Hobby tier caps function time at 60s — the motion pipeline is async (submit → poll) specifically so it survives that.

**Video pipeline (Modal):**

```bash
pip install modal
export MODAL_TOKEN_ID=... MODAL_TOKEN_SECRET=...   # hackathon partner creds
export FIXAM_MODAL_SECRET=$(openssl rand -hex 24)  # must match .env
modal deploy modal_app.py   # paste any endpoint URL into MODAL_VIDEO_URL
```

## Project structure

```
app/            landing (/) + tool (/app) + 6 API routes
lib/            Meta client, domain registry, prompts, offline mocks
lib/domains/    per-domain faults, Naira prices, SAM vocabularies
modal_app.py    video pipeline: ffmpeg → Files API → SAM tracking → metrics
public/         PWA icons, manifest, demo photo
```

## Roadmap

- Field validation: real-shop accuracy checks per domain, Pidgin voice eval
- More domains (fans, pumps) via the data-driven registry
- Follow-up questions that refine a diagnosis conversationally

---

Built solo in Nigeria with Next.js, Meta Model API, and Modal. No other dependencies.
