# FixAm 🇳🇬 — Snap it, fix am

AI repair guide for Nigeria. Snap a photo, describe the fault in English or Pidgin, get parts identified on your photo plus step-by-step fix, Naira prices, and safety warnings.

Built for the Meta Global AI Developer Hackathon (Indie track, Build for Your World).

## Domains

| | Domain | Covers |
|---|---|---|
| ⚡ | Generator | Tiger, Elepaq, Firman small petrol gens |
| 🏍 | Okada | Bajaj Boxer, Honda CG, TVS |
| ☀ | Solar | Inverters, panels, tubular batteries |
| 📱 | Phone | Tecno, Infinix, Samsung, iPhone |
| 🚗 | Car | Roadside guide for Toyota, Honda, Lexus (incl. night safety) |

## How it works

1. **Photo** → SAM 3.1 segments parts, boxes drawn on your photo. Spark first reads your symptom and picks *which* parts to segment (agentic routing).
2. **Symptom** → typed or Pidgin voice (auto-converted to 16kHz WAV for Muse Voice Transcribe).
3. **Fix** → Muse Spark (vision + strict JSON schema) returns diagnosis, steps, tools, parts with Naira prices, rewinder-vs-DIY savings, and safety warnings.
4. **Extras** → Muse Image repair diagram, WhatsApp share, and a Modal-powered **motion check**: record 3s of a running engine, SAM tracks it frame-by-frame, Spark judges vibration + smoke. Motion runs async (submit → poll) so serverless timeouts never force a mock.

Every route falls back to offline results if a live API is unreachable, so demos never die on bad network.

## Run

```bash
cd FixAm
cp .env.example .env   # add MODEL_API_KEY (hackathon credits)
npm install
npm run dev -- -H 0.0.0.0 -p 3000
```

Open on your phone via same-WiFi `http://<mac-ip>:3000`. Note: mic/camera *recording* needs HTTPS — use the Vercel URL (below) or a `cloudflared tunnel --url http://localhost:3000` for those; photo capture + typing work over plain HTTP.

`FIXAM_DEMO_MODE=true` runs fully offline with local mocks (no API spend).

## Deploy

**App (Vercel):** `npx vercel` — add env vars from `.env` in the dashboard. Hobby tier caps uploads at ~4.5MB, so clips are capped client-side at ~10MB; Pro/Fluid recommended for video.

**Video pipeline (Modal, CPU-only):**
```bash
pip install modal
export MODAL_TOKEN_ID=... MODAL_TOKEN_SECRET=...   # hackathon partner creds
export FIXAM_MODAL_SECRET=$(openssl rand -hex 24) # must match .env
modal deploy modal_app.py   # paste the analyze_clip URL into MODAL_VIDEO_URL
```

## Stack

Next.js 14 PWA · Meta Model API (`muse-spark-1.3`, `sam-3.1`, `muse-image-1.0`, `muse-voice-transcribe-1.0`) · Modal (ffmpeg video pipeline) · no other deps.

Adding a domain = `lib/domains/<id>/{faults.json,prices.json}` + one registry entry in `lib/domains.js` + one picker button. No pipeline changes.
