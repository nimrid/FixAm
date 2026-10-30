"""FixAm video pipeline on Modal (CPU-only).

Receives a short generator clip, normalizes it with ffmpeg, uploads to the
Meta Files API, runs SAM 3.1 video tracking on engine + exhaust, and returns
per-frame tracks, a vibration index, and keyframes for the Spark verdict.

Deploy:  FIXAM_MODAL_SECRET=... modal deploy modal_app.py
Needs MODAL_TOKEN_ID / MODAL_TOKEN_SECRET env vars for auth (see .env).
"""

import base64
import hashlib
import hmac
import json
import os
import re
import subprocess
import tempfile
import urllib.parse

import modal

app = modal.App("fixam-video")

image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg")
    .pip_install("requests", "fastapi[standard]")
)

price_store = modal.Dict.from_name("fixam-price-reports", create_if_missing=True)

MAX_BYTES = 32 * 1024 * 1024
MAX_SECONDS = 10.0
SHARED_SECRET = os.environ.get("FIXAM_MODAL_SECRET", "")

BOX_RE = re.compile(
    r"(\d+)<\|box;x1=(\d+);y1=(\d+);x2=(\d+);y2=(\d+);w=(\d+);h=(\d+)(?:;c=([\d.]+))?\|>"
)
FRAME_RE = re.compile(r"<(\d+)f>")


def _run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if p.returncode != 0:
        raise RuntimeError(f"{cmd[0]} failed: {(p.stderr or '')[:300]}")
    return p.stdout


def _probe_duration(path):
    out = _run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path,
    ])
    return float(out.strip())


def _sam_video_track(meta_base, api_key, file_id, concept):
    """Stream one SAM video segmentation; return {frame_idx: [boxes]}."""
    import requests

    tracks = {}
    with requests.post(
        f"{meta_base}/responses",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json",
                  "Accept": "text/event-stream"},
        json={
            "model": "sam-3.1",
            "stream": True,
            "metadata": {"include_confidence": "true"},
            "input": [{
                "type": "message", "role": "user",
                "content": [
                    {"type": "input_text", "text": concept},
                    {"type": "input_video", "file_id": file_id},
                ],
            }],
        },
        stream=True,
        timeout=420,
    ) as r:
        r.raise_for_status()
        buf = ""
        for chunk in r.iter_content(chunk_size=4096, decode_unicode=True):
            if not chunk:
                continue
            buf += chunk
            *frames, buf = buf.split("\n\n")
            for fr in frames:
                for ln in fr.split("\n"):
                    if not ln.startswith("data:"):
                        continue
                    payload = ln[5:].strip()
                    if payload in ("", "[DONE]"):
                        continue
                    try:
                        evt = json.loads(payload)
                    except ValueError:
                        continue
                    t = evt.get("type", "")
                    text = ""
                    if t == "response.output_text.delta":
                        text = evt.get("delta", "")
                    elif t == "response.output_text.done" and evt.get("text"):
                        text = evt.get("text")
                    if text:
                        _accumulate(text, tracks)
    return tracks


def _accumulate(text, tracks):
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        fm = FRAME_RE.match(line)
        if not fm:
            continue
        fidx = int(fm.group(1))
        boxes = []
        for m in BOX_RE.finditer(line):
            _id, x1, y1, x2, y2, w, h, c = m.groups()
            W, H = int(w), int(h)
            boxes.append({
                "id": int(_id),
                "box": [int(x1) / W, int(y1) / H, int(x2) / W, int(y2) / H],
                "c": float(c) if c else 0.75,
            })
        if boxes:
            tracks.setdefault(fidx, []).extend(boxes)


def _vibration_index(tracks):
    """Mean frame-to-frame centroid displacement, normalized by box size."""
    import math

    cents, diags = [], []
    for f in sorted(tracks):
        b = max(tracks[f], key=lambda r: (r["box"][2] - r["box"][0]) * (r["box"][3] - r["box"][1]))
        x1, y1, x2, y2 = b["box"]
        cents.append(((x1 + x2) / 2, (y1 + y2) / 2))
        diags.append(math.hypot(x2 - x1, y2 - y1) or 1e-6)
    if len(cents) < 3:
        return {"frames_tracked": len(cents), "index": 0.0, "verdict": "unknown", "series": []}
    jumps = [math.hypot(cents[i + 1][0] - cents[i][0], cents[i + 1][1] - cents[i][1])
             for i in range(len(cents) - 1)]
    mean_diag = sum(diags) / len(diags)
    idx = (sum(jumps) / len(jumps)) / mean_diag
    verdict = "high" if idx > 0.02 else ("normal" if idx > 0.005 else "low")
    return {
        "frames_tracked": len(cents),
        "index": round(idx, 4),
        "verdict": verdict,
        "series": [round(j / mean_diag, 4) for j in jumps],
    }


def _auth_ok(payload):
    secret = payload.get("secret", "")
    return bool(SHARED_SECRET) and hmac.compare_digest(str(secret), SHARED_SECRET)


@app.function(image=image, timeout=600, env={"FIXAM_MODAL_SECRET": SHARED_SECRET})
def _analyze_job(job: dict):
    """Background worker: full pipeline. Spawned by submit_clip."""
    return _run_analysis(job["api_key"], job["meta_base"], job["raw_b64"])


@app.function(image=image, env={"FIXAM_MODAL_SECRET": SHARED_SECRET})
@modal.fastapi_endpoint(method="POST")
def submit_clip(payload: dict):
    """Fast submit (<5s): validates, spawns background job, returns call_id."""
    if not _auth_ok(payload):
        return {"ok": False, "error": "unauthorized"}
    api_key = payload.get("model_api_key", "")
    if not api_key:
        return {"ok": False, "error": "model_api_key missing"}
    b64 = payload.get("video_b64", "")
    if "," in b64:
        b64 = b64.split(",", 1)[1]
    if len(b64) < 1000 or len(b64) > 44 * 1024 * 1024:
        return {"ok": False, "error": "clip must be 1KB-32MB"}
    call = _analyze_job.spawn({
        "api_key": api_key,
        "meta_base": payload.get("meta_base", "https://api.meta.ai/v1"),
        "raw_b64": b64,
    })
    return {"ok": True, "call_id": call.object_id}


@app.function(image=image, env={"FIXAM_MODAL_SECRET": SHARED_SECRET})
@modal.fastapi_endpoint(method="POST")
def clip_result(payload: dict):
    """Non-blocking poll: {done:false} or {done:true, result}."""
    if not _auth_ok(payload):
        return {"ok": False, "error": "unauthorized"}
    call_id = payload.get("call_id", "")
    if not call_id:
        return {"ok": False, "error": "call_id missing"}
    try:
        fc = modal.functions.FunctionCall.from_id(call_id)
        try:
            result = fc.get(timeout=0)
        except TimeoutError:
            return {"ok": True, "done": False}
        return {"ok": True, "done": True, "result": result}
    except Exception as e:
        return {"ok": True, "done": True, "result": {"ok": False, "error": f"job failed: {str(e)[:200]}"}}


@app.function(image=image, timeout=600, env={"FIXAM_MODAL_SECRET": SHARED_SECRET})
@modal.fastapi_endpoint(method="POST")
def analyze_clip(payload: dict):
    """Synchronous path (local dev). Production UI uses submit_clip/clip_result."""
    if not _auth_ok(payload):
        return {"ok": False, "error": "unauthorized"}
    api_key = payload.get("model_api_key", "")
    if not api_key:
        return {"ok": False, "error": "model_api_key missing"}
    return _run_analysis(api_key, payload.get("meta_base", "https://api.meta.ai/v1"), payload.get("video_b64", ""))


def _run_analysis(api_key, meta_base, video_b64):
    b64 = video_b64 or ""
    if "," in b64:
        b64 = b64.split(",", 1)[1]
    try:
        raw = base64.b64decode(b64)
    except Exception:
        return {"ok": False, "error": "video_b64 is not valid base64"}
    if len(raw) > MAX_BYTES or len(raw) < 1000:
        return {"ok": False, "error": f"clip must be 1KB-32MB, got {len(raw)} bytes"}

    warnings = []
    with tempfile.TemporaryDirectory() as td:
        src = os.path.join(td, "in.mp4")
        with open(src, "wb") as f:
            f.write(raw)
        try:
            dur = _probe_duration(src)
        except Exception as e:
            return {"ok": False, "error": f"not a readable video: {e}"}
        if dur > MAX_SECONDS:
            return {"ok": False, "error": f"clip too long ({dur:.1f}s), max {MAX_SECONDS:.0f}s"}

        norm = os.path.join(td, "norm.mp4")
        _run(["ffmpeg", "-y", "-i", src, "-vf", "scale=640:-2", "-r", "10",
              "-an", "-c:v", "libx264", "-preset", "veryfast", norm])

        keyframes = []
        for frac in (0.15, 0.5, 0.85):
            kf = os.path.join(td, f"kf{frac}.jpg")
            _run(["ffmpeg", "-y", "-ss", str(max(0.1, dur * frac)), "-i", src,
                  "-frames:v", "1", "-vf", "scale=640:-2", "-q:v", "4", kf])
            with open(kf, "rb") as f:
                keyframes.append("data:image/jpeg;base64," + base64.b64encode(f.read()).decode())

        import requests
        try:
            up = requests.post(
                f"{meta_base}/files",
                headers={"Authorization": f"Bearer {api_key}"},
                files={"file": ("clip.mp4", open(norm, "rb"), "video/mp4")},
                data={"purpose": "user_data"},
                timeout=120,
            )
            up.raise_for_status()
            file_id = up.json().get("id")
            if not file_id:
                return {"ok": False, "error": "Files API returned no id"}
        except Exception as e:
            return {"ok": False, "error": f"Files API upload failed: {str(e)[:200]}"}

        tracks = {}
        for concept in ("engine", "exhaust pipe"):
            try:
                tracks[concept] = _sam_video_track(meta_base, api_key, file_id, concept)
            except Exception as e:
                warnings.append(f"{concept} tracking failed: {str(e)[:160]}")
                tracks[concept] = {}

    eng = tracks.get("engine", {})
    exh = tracks.get("exhaust pipe", {})
    nframes = max([f for t in tracks.values() for f in t], default=0) + 1
    vib = _vibration_index(eng)

    def compact(t):
        return {str(f): [round(v, 3) for v in r["box"]] for f, rs in sorted(t.items()) for r in rs[:1]}

    return {
        "ok": True,
        "file_id": file_id,
        "duration_s": round(dur, 2),
        "frames_seen": nframes,
        "engine": {
            "frames_tracked": len(eng),
            "present_ratio": round(len(eng) / max(nframes, 1), 3),
            "vibration": vib,
            "track": compact(eng),
        },
        "exhaust": {
            "frames_tracked": len(exh),
            "present_ratio": round(len(exh) / max(nframes, 1), 3),
            "track": compact(exh),
        },
        "keyframes": keyframes,
        "warnings": warnings,
    }


# --- Community price learning: reports -> consensus medians ---
PART_KEY_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,39}$")
PRICE_DOMAINS = ("gen", "okada", "solar", "phone", "car")


def _bump_index(k):
    try:
        idx = set(price_store.get("__index__", []))
    except Exception:
        idx = set()
    if k not in idx:
        idx.add(k)
        price_store["__index__"] = sorted(idx)


@app.function(image=image, env={"FIXAM_MODAL_SECRET": SHARED_SECRET})
@modal.fastapi_endpoint(method="POST")
def report_price(payload: dict):
    """One user correction: {domain, part, price_naira, market}."""
    if not _auth_ok(payload):
        return {"ok": False, "error": "unauthorized"}
    domain = str(payload.get("domain", ""))
    part = str(payload.get("part", ""))
    try:
        price = int(payload.get("price_naira", 0))
    except (TypeError, ValueError):
        return {"ok": False, "error": "price_naira must be an integer"}
    market = str(payload.get("market", ""))[:60]
    if domain not in PRICE_DOMAINS:
        return {"ok": False, "error": "unknown domain"}
    if not PART_KEY_RE.match(part):
        return {"ok": False, "error": "bad part key"}
    if not 100 <= price <= 50_000_000:
        return {"ok": False, "error": "price out of range"}
    import time
    k = f"{domain}:{part}"
    try:
        items = price_store.get(k, [])
    except Exception:
        items = []
    items = (items + [{"price": price, "market": market, "ts": int(time.time())}])[-50:]
    price_store[k] = items
    _bump_index(k)
    return {"ok": True, "count": len(items)}


@app.function(image=image, env={"FIXAM_MODAL_SECRET": SHARED_SECRET})
@modal.fastapi_endpoint(method="POST")
def community_prices(payload: dict):
    """Consensus medians per part (needs 3+ reports), rounded to nearest 100."""
    if not _auth_ok(payload):
        return {"ok": False, "error": "unauthorized"}
    import statistics
    domain = str(payload.get("domain", ""))
    if domain not in PRICE_DOMAINS:
        return {"ok": False, "error": "unknown domain"}
    out = {}
    try:
        idx = price_store.get("__index__", [])
    except Exception:
        idx = []
    for k in idx:
        if not k.startswith(domain + ":"):
            continue
        part = k.split(":", 1)[1]
        try:
            items = price_store.get(k, [])[-20:]
        except Exception:
            continue
        vals = sorted(i["price"] for i in items if isinstance(i.get("price"), int))
        if len(vals) >= 3:
            med = int(statistics.median(vals))
            out[part] = {"median": med - (med % 100), "count": len(vals)}
    return {"ok": True, "prices": out}


@app.function(image=image, env={"FIXAM_MODAL_SECRET": SHARED_SECRET})
@modal.fastapi_endpoint(method="POST")
def clear_price(payload: dict):
    """Admin: delete all reports for one part (test-data / spam cleanup)."""
    if not _auth_ok(payload):
        return {"ok": False, "error": "unauthorized"}
    domain = str(payload.get("domain", ""))
    part = str(payload.get("part", ""))
    if domain not in PRICE_DOMAINS:
        return {"ok": False, "error": "unknown domain"}
    if not PART_KEY_RE.match(part):
        return {"ok": False, "error": "bad part key"}
    k = f"{domain}:{part}"
    try:
        had = k in price_store
        if had:
            del price_store[k]
        idx = [x for x in price_store.get("__index__", []) if x != k]
        price_store["__index__"] = idx
    except Exception as e:
        return {"ok": False, "error": f"clear failed: {str(e)[:160]}"}
    return {"ok": True, "cleared": had}


@app.local_entrypoint()
def selftest():
    print("fixam-video app loads OK. Deploy with: modal deploy modal_app.py")
