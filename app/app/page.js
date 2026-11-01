"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "../globals.css";
import { I } from "../icons";
import { MOTION_DOMAINS, motionConfig } from "../../lib/motion";

const DOMAIN_UI = {
  gen: {
    hero: "AI repair guide for Tiger, Elepaq & Firman generators.",
    heroPg: "AI repair guide for Tiger, Elepaq & Firman gen.",
    photo: "Side view, engine and panel visible, daylight if possible.",
    photoPg: "Side view, make engine and panel show, daylight better.",
    ph: "e.g. Coughs but won't catch, black smoke",
    phPg: "e.g. Dey cough but e no catch, black smoke dey"
  },
  okada: {
    hero: "AI repair guide for Bajaj Boxer, Honda CG & TVS.",
    heroPg: "AI repair guide for Boxer, Honda CG & TVS okada.",
    photo: "Side view, full bike visible, engine and wheels showing.",
    photoPg: "Side view, full bike show, engine and wheel dey.",
    ph: "e.g. Kick turns but won't catch / chain noise",
    phPg: "e.g. Kick dey turn but e no catch / chain noise"
  },
  solar: {
    hero: "AI repair guide for inverters, panels & batteries.",
    heroPg: "AI repair guide for inverter, panel & battery.",
    photo: "Snap what fails: inverter display, battery bank, or panels.",
    photoPg: "Snap wetin fail: inverter display, battery, or panel.",
    ph: "e.g. Inverter beeps then cuts / panels not charging",
    phPg: "e.g. Inverter dey beep then cut / panel no dey charge"
  },
  phone: {
    hero: "AI repair guide for Tecno, Infinix, Samsung & iPhone.",
    heroPg: "AI repair guide for Tecno, Infinix & iPhone.",
    photo: "Snap the fault: screen, charging port, or swollen back.",
    photoPg: "Snap the fault: screen, charging port, or back.",
    ph: "e.g. Battery dies fast / phone won't charge",
    phPg: "e.g. Battery dey quick finish / e no dey charge"
  },
  car: {
    hero: "AI roadside guide for Toyota, Honda & Lexus.",
    heroPg: "AI roadside guide for Toyota, Honda & Lexus.",
    photo: "Snap the problem: dashboard lights, engine bay, or tyre.",
    photoPg: "Snap the wahala: dashboard light, engine, or tyre.",
    ph: "e.g. Temperature gauge red / car won't start",
    phPg: "e.g. Temperature don red / motor no gree start"
  }
};

const DEMO_PHOTOS = {
  gen: { url: "/demo/gen-tiger.jpg", label: "Tiger 2.5kVA Generator", prompt: "Gen dey cough but e no catch, black smoke dey" },
  okada: { url: "/demo/okada-boxer.jpg", label: "Bajaj Boxer Motorcycle", prompt: "Kick dey turn but e no catch, chain loose" },
  solar: { url: "/demo/solar-inverter.jpg", label: "Solar Inverter 3.5kVA", prompt: "Inverter dey beep overload, battery quick finish" },
  phone: { url: "/demo/phone-screen.jpg", label: "Smartphone Repair", prompt: "Battery swell up, phone no dey charge well" }
};

const QUICK_SYMPTOMS = {
  gen: [
    { en: "Coughs but won't start", pg: "Dey cough but e no catch" },
    { en: "Heavy black smoke from exhaust", pg: "Black smoke dey come out" },
    { en: "Runs 2 mins then dies", pg: "E go run 2 mins then die" },
    { en: "No electric power output", pg: "No light output from socket" }
  ],
  okada: [
    { en: "Kick turns but engine won't catch", pg: "Kick dey turn but e no catch" },
    { en: "Drive chain loose and slapping", pg: "Chain loose dey slap cover" },
    { en: "Weak front and rear brakes", pg: "Brake weak no dey hold" },
    { en: "White/blue smoke from exhaust", pg: "Smoke dey come out from exhaust" }
  ],
  solar: [
    { en: "Inverter beeps red overload alarm", pg: "Inverter dey beep overload alarm" },
    { en: "Battery drops fast after NEPA cuts", pg: "Battery dey quick drop when light go" },
    { en: "Panels not charging during afternoon", pg: "Panel no dey charge for afternoon" },
    { en: "Cooling fan making grinding noise", pg: "Fan dey make loud grinding noise" }
  ],
  phone: [
    { en: "Battery swelling and draining rapidly", pg: "Battery swell up, dey quick finish" },
    { en: "Phone won't charge unless cord is bent", pg: "No dey charge unless cable bend" },
    { en: "Screen cracked and touch unresponsive", pg: "Screen crack, touch no dey answer" },
    { en: "Overheating during calls or charging", pg: "Phone dey hot well-well for call" }
  ],
  car: [
    { en: "Temperature gauge red / overheating", pg: "Temperature don red / water boil" },
    { en: "Clicking sound but engine won't crank", pg: "Dey click but motor no gree crank" },
    { en: "Squealing noise when pressing brakes", pg: "Brake dey make sharp squeal noise" },
    { en: "Engine vibration and shaking at idle", pg: "Engine dey shake well-well for idle" }
  ]
};

export default function Home() {
  const [lang, setLang] = useState("en");
  const [domain, setDomain] = useState("gen");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [symptom, setSymptom] = useState("");
  const [parts, setParts] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState("");
  const [recording, setRecording] = useState(false);
  const [notice, setNotice] = useState(null);
  const [diagram, setDiagram] = useState(null);
  const [agentic, setAgentic] = useState(false);
  const [clip, setClip] = useState(null);
  const [clipBase64, setClipBase64] = useState(null);
  const [motion, setMotion] = useState(null);
  const [clipRecording, setClipRecording] = useState(false);
  const [segmented, setSegmented] = useState(false);
  const [motionProgress, setMotionProgress] = useState("");
  const [community, setCommunity] = useState({});
  const [mine, setMine] = useState(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(window.localStorage.getItem("fixam-my-prices") || "{}"); }
    catch { return {}; }
  });
  const [reporting, setReporting] = useState(null);
  const [repPrice, setRepPrice] = useState("");
  const [repMarket, setRepMarket] = useState("");
  const [repSending, setRepSending] = useState(false);
  const [clipFallback, setClipFallback] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});
  const [copiedToast, setCopiedToast] = useState(false);
  const [highlightedPart, setHighlightedPart] = useState(null);

  const clipFileRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const agenticRef = useRef(false);
  const fileRef = useRef(null);
  const symptomRef = useRef(null);

  const t = (en, pg) => (lang === "pidgin" ? pg : en);

  function setPhoto(dataUrl) {
    setImage(dataUrl);
    setImageBase64(dataUrl);
    setParts([]);
    setResult(null);
    setDiagram(null);
    setNotice(null);
    setAgentic(false);
    agenticRef.current = false;
    setCompletedSteps({});
  }

  function startOver() {
    setImage(null);
    setImageBase64(null);
    setSymptom("");
    setParts([]);
    setResult(null);
    setDiagram(null);
    setClip(null);
    setClipBase64(null);
    setMotion(null);
    setNotice(null);
    setAgentic(false);
    agenticRef.current = false;
    setSegmented(false);
    setCompletedSteps({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectDomain(id) {
    if (id === domain) return;
    setSegmented(false);
    setDomain(id);
    setImage(null);
    setImageBase64(null);
    setSymptom("");
    setParts([]);
    setResult(null);
    setDiagram(null);
    setClip(null);
    setClipBase64(null);
    setMotion(null);
    setNotice(null);
    setAgentic(false);
    agenticRef.current = false;
    setSegmented(false);
    setCompletedSteps({});
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setPhoto(await downscaleImage(reader.result));
      } catch {
        setPhoto(reader.result);
      }
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  async function useDemoPhoto(dom = domain) {
    const demoInfo = DEMO_PHOTOS[dom] || DEMO_PHOTOS.gen;
    setLoading("demo");
    try {
      const res = await fetch(demoInfo.url);
      if (!res.ok) throw new Error("demo photo missing");
      const dataUrl = await blobToDataUrl(await res.blob());
      setPhoto(await downscaleImage(dataUrl));
      if (!symptom.trim() && demoInfo.prompt) {
        setSymptom(demoInfo.prompt);
      }
    } catch (e) {
      setNotice({ text: t("Could not load the demo photo.", "No fit load demo photo.") });
    }
    setLoading("");
  }

  async function runDemo() {
    selectDomain("gen");
    setNotice(null);
    try {
      const res = await fetch("/demo/gen-tiger.jpg");
      if (!res.ok) throw new Error("demo photo missing");
      const ds = await downscaleImage(await blobToDataUrl(await res.blob()));
      const demoSymptom = "Gen dey cough but e no catch, black smoke dey";
      setPhoto(ds);
      setSymptom(demoSymptom);
      const segParts = await identifyParts(ds, demoSymptom, "gen");
      await diagnose(ds, demoSymptom, lang, segParts || [], "gen");
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: document.body.scrollHeight, behavior: calm ? "auto" : "smooth" });
    } catch (e) {
      setNotice({ text: t("Demo failed: ", "Demo fail: ") + e.message });
      setLoading("");
    }
  }

  async function identifyParts(img = imageBase64, sym = symptom, dom = domain) {
    if (!img) return null;
    setLoading("segment");
    setNotice(null);
    try {
      const res = await fetch("/api/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: img, symptom: sym, domain: dom })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setParts(data.parts || []);
      setAgentic(!!data.agentic);
      agenticRef.current = !!data.agentic;
      if (data.fallback) setNotice({ text: t("Live segmentation is unreachable. Showing an offline result.", "Live segmentation no connect. Offline result we show."), action: "segment" });
      else if ((data.parts || []).length === 0) setNotice({ text: t("No parts found in this photo. Retake closer, or continue to diagnosis anyway.", "We no see parts for this photo. Take am again near, or continue to diagnosis.") });
      else if ((data.parts || []).length < 2) setNotice({ text: t("Few parts found. Move closer and retake the photo.", "We see small parts. Move near, take am again.") });
      setLoading("");
      setSegmented(true);
      return data.parts || [];
    } catch (e) {
      setNotice({ text: t("Could not find parts: ", "No fit find parts: ") + e.message, action: "segment" });
      setLoading("");
      return null;
    }
  }

  async function diagnose(img = imageBase64, sym = symptom, langV = lang, partsV = parts, dom = domain) {
    if (!sym.trim()) {
      setNotice({ text: t("Describe the fault first, or use the microphone.", "Describe wetin dey do am first, or use mic.") });
      symptomRef.current?.focus();
      return;
    }
    // Stale-parts guard: if parts were found before symptom existed, re-segment agentically
    let p = partsV;
    if (img && !agenticRef.current) {
      const fresh = await identifyParts(img, sym, dom);
      if (fresh) p = fresh;
    }
    setLoading("diagnose");
    setDiagram(null);
    setCompletedSteps({});
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: img, symptom: sym, lang: langV, parts: p, domain: dom })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      if (data.fallback) setNotice({ text: t("Live diagnosis is unreachable. Showing an offline result.", "Live diagnosis no connect. Offline result we show."), action: "diagnose" });
    } catch (e) {
      setNotice({ text: t("Diagnosis failed: ", "Diagnose fail: ") + e.message, action: "diagnose" });
    }
    setLoading("");
  }

  function retryNotice() {
    if (!notice?.action) return;
    if (notice.action === "segment") identifyParts();
    else if (notice.action === "diagnose") diagnose();
    else if (notice.action === "diagram") showDiagram();
    else if (notice.action === "motion") analyzeMotion();
  }

  function pickVideoMime() {
    const cands = ["video/mp4", "video/mp4;codecs=avc1", "video/webm;codecs=h264", "video/webm"];
    if (typeof window === "undefined" || !window.MediaRecorder) return "";
    return cands.find((c) => { try { return window.MediaRecorder.isTypeSupported(c); } catch { return false; } }) || "";
  }

  async function recordClip() {
    if (clipRecording) return;
    setNotice(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true });
      const mime = pickVideoMime();
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 2000000 } : undefined);
      const chunks = [];
      mr.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setClipRecording(false);
        const blob = new Blob(chunks, { type: mr.mimeType || "video/mp4" });
        setClip(URL.createObjectURL(blob));
        const dataUrl = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        setClipBase64(dataUrl);
        setMotion(null);
      };
      mr.start();
      setClipRecording(true);
      setTimeout(() => { if (mr.state !== "inactive") mr.stop(); }, 3200);
    } catch (e) {
      if (typeof window !== "undefined" && !window.isSecureContext) {
        setClipFallback(true);
        setNotice({ text: t("In-browser recording needs HTTPS. Use the Camera button below instead — it works over WiFi.", "In-app record need HTTPS. Use Camera button for down — e go work.") });
      } else {
        setNotice({ text: t("Camera unavailable for video. Check permissions.", "Camera no gree for video. Check permission.") });
      }
    }
  }

  function onClipFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setNotice({ text: t("Clip too large for upload (max ~10MB). Record a shorter 3s clip.", "Video too big to upload (max ~10MB). Record short 3s clip.") });
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setClip(URL.createObjectURL(f));
      setClipBase64(reader.result);
      setMotion(null);
      setNotice(null);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function analyzeMotion() {
    if (!clipBase64) return;
    setLoading("motion");
    setNotice(null);
    setMotionProgress(t("Uploading clip…", "Dey upload clip…"));
    try {
      const res = await fetch("/api/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clipBase64, domain })
      });
      if (res.status === 413) throw new Error(t("Clip too large to upload. Record a shorter one.", "Video too big. Record short one."));
      const sub = await res.json();
      if (sub.error) throw new Error(sub.error);
      if (sub.done) {
        setMotion(sub);
        if (sub.fallback) setNotice({ text: t("Live motion analysis is unreachable. Showing an offline result.", "Live motion check no connect. Offline result we show."), action: "motion" });
        return;
      }
      const t0 = Date.now();
      for (let i = 0; i < 72; i++) {
        await sleep(5000);
        const elapsed = Math.round((Date.now() - t0) / 1000);
        setMotionProgress(t(`Tracking motion… ${elapsed}s`, `Dey track motion… ${elapsed}s`));
        const r = await fetch(`/api/motion-status?id=${encodeURIComponent(sub.call_id)}&domain=${encodeURIComponent(sub.domain || domain)}`);
        const d = await r.json();
        if (d.error) throw new Error(d.error);
        if (d.done) {
          setMotion(d);
          if (d.fallback) setNotice({ text: t("Live motion analysis is unreachable. Showing an offline result.", "Live motion check no connect. Offline result we show."), action: "motion" });
          return;
        }
      }
      throw new Error(t("Timed out after 6 minutes. Try a shorter clip.", "E too tey (6 mins). Try shorter clip."));
    } catch (e) {
      setNotice({ text: t("Motion analysis failed: ", "Motion check fail: ") + e.message, action: "motion" });
    } finally {
      setLoading("");
      setMotionProgress("");
    }
  }

  async function showDiagram() {
    if (!result) return;
    setLoading("diagram");
    try {
      const part = result.needed_parts?.[0]?.name || result.needed_parts?.[0]?.key || "component";
      const diagText = lang === "pidgin"
        ? (result.diagnosis_pidgin || result.display_diagnosis || "")
        : (result.diagnosis_en || result.display_diagnosis || "");
      const res = await fetch("/api/diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosis: diagText, part, domain })
      });
      const data = await res.json();
      if (data.imageUrl) setDiagram(data.imageUrl);
      else setNotice({ text: t("Diagram is unavailable right now.", "Diagram no dey now."), action: "diagram" });
    } catch (e) {
      setNotice({ text: t("Diagram failed: ", "Diagram fail: ") + e.message, action: "diagram" });
    }
    setLoading("");
  }

  async function toggleRecord() {
    if (recording) {
      mediaRef.current?.stop();
      return;
    }
    setNotice(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        setRecording(false);
        stream.getTracks().forEach((tr) => tr.stop());
        setLoading("transcribe");
        try {
          const blob = new Blob(chunksRef.current, { type: mr.mimeType });
          const wavDataUrl = await recordingToWav16k(blob);
          const res = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioBase64: wavDataUrl, domain })
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          if (data.text) setSymptom(data.text);
          if (data.fallback) setNotice({ text: t("Voice service is unreachable. Please type the symptom.", "Voice no connect. Abeg type wetin do am.") });
        } catch (e) {
          setNotice({ text: t("Transcription failed: ", "Voice fail: ") + e.message });
        }
        setLoading("");
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e) {
      if (typeof window !== "undefined" && !window.isSecureContext) {
        setNotice({ text: t("Microphone needs HTTPS. Type the symptom, or open the Vercel URL for voice.", "Mic need HTTPS. Type wetin do am, or open Vercel link for voice.") });
      } else {
        setNotice({ text: t("Microphone is blocked. Check browser permissions, or type instead.", "Mic block. Check permission, or type am.") });
      }
    }
  }

  const steps = result ? (lang === "pidgin" ? result.steps_pidgin || result.display_steps : result.steps_en || result.display_steps) : [];
  const diagnosis = result ? (lang === "pidgin" ? result.diagnosis_pidgin || result.display_diagnosis : result.diagnosis_en || result.display_diagnosis) : "";
  const danger = result ? (lang === "pidgin" ? result.danger_pidgin || result.display_danger : result.danger_en || result.display_danger) : "";
  const partsTotal = result?.needed_parts?.reduce((s, p) => s + (effPrice(p).value || 0), 0) || 0;
  const savings = (result?.shop_cost_naira || 0) - partsTotal;
  const priceBookMonth = (() => {
    const v = result?.needed_parts?.find((p) => p.verified)?.verified || "2026-10";
    const [y, m] = v.split("-");
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${names[parseInt(m, 10) - 1] || m} ${y}`;
  })();
  const shortDiagnosis = diagnosis.length > 64 ? diagnosis.slice(0, 64).trimEnd() + "…" : diagnosis;

  function whatsappLink() {
    if (!result) return "#";
    const lines = [
      "FixAm AI Repair Guide",
      (lang === "pidgin" ? "Wahala: " : "Fault: ") + diagnosis,
      "",
      "Steps to fix:",
      ...(steps || []).slice(0, 5).map((s, i) => `${i + 1}) ${s}`),
      "",
      `Fair Parts: ~₦${partsTotal.toLocaleString()} | Rewinder: ~₦${(result.shop_cost_naira || 0).toLocaleString()} (Save ~₦${Math.max(0, savings).toLocaleString()})`
    ];
    return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  async function copyRepairPlan() {
    if (!result) return;
    const lines = [
      "FixAm AI Repair Plan",
      `Machine: ${domain.toUpperCase()}`,
      `Fault: ${diagnosis}`,
      "",
      "Steps:",
      ...(steps || []).map((s, i) => `${i + 1}) ${s}`),
      "",
      `Parts Cost: ~₦${partsTotal.toLocaleString()}`,
      `Rewinder/Mechanic Cost: ~₦${(result.shop_cost_naira || 0).toLocaleString()}`,
      `Estimated Savings: ~₦${Math.max(0, savings).toLocaleString()}`
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch (e) {
      setNotice({ text: t("Could not copy. Long-press the steps to copy manually.", "No fit copy. Hold the steps to copy by hand.") });
    }
  }

  function toggleStep(idx) {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  // Community medians load progressively once a diagnosis exists
  useEffect(() => {
    if (!result?.needed_parts?.length) return;
    let live = true;
    fetch(`/api/community-prices?domain=${encodeURIComponent(domain)}`)
      .then((r) => r.json())
      .then((d) => { if (live) setCommunity(d.prices || {}); })
      .catch(() => {});
    return () => { live = false; };
  }, [result, domain]);

  function effPrice(p) {
    const over = mine?.[domain]?.[p.key];
    if (over && typeof over.price === "number") return { value: over.price, tag: "you" };
    const c = community?.[p.key];
    if (c && typeof c.median === "number" && c.source !== "book" && (c.count || 0) >= 3) {
      return { value: c.median, tag: `community · ${c.count}` };
    }
    return { value: typeof p.price_naira === "number" ? p.price_naira : null, tag: null };
  }

  function saveMine(partKey, price, market) {
    setMine((prev) => {
      const next = { ...prev, [domain]: { ...(prev[domain] || {}), [partKey]: { price, market, ts: Date.now() } } };
      try { window.localStorage.setItem("fixam-my-prices", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  async function submitReport(e) {
    e.preventDefault();
    const price = parseInt(repPrice.replace(/[^0-9]/g, ""), 10);
    if (!reporting || !Number.isInteger(price) || price < 100) {
      setNotice({ text: t("Enter a valid amount in Naira.", "Put correct amount for Naira.") });
      return;
    }
    setRepSending(true);
    try {
      const res = await fetch("/api/report-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, part: reporting, price_naira: price, market: repMarket.trim() })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      saveMine(reporting, price, repMarket.trim());
      setReporting(null);
      setRepPrice("");
      setRepMarket("");
      setNotice({ text: t("Thanks — your price is now used in your totals.", "Thank you — we go use your price for your totals.") });
    } catch (err) {
      setNotice({ text: t("Could not send report: ", "No fit send report: ") + err.message });
    }
    setRepSending(false);
  }

  // Landing "Run demo" deep-link: /app?demo=1 auto-plays full demo
  const demoStarted = useRef(false);
  useEffect(() => {
    if (demoStarted.current) return;
    if (typeof window !== "undefined" && window.location.search.includes("demo=1")) {
      demoStarted.current = true;
      runDemo();
    }
  }, []);

  // Stepper + smart bottom-bar state
  const s1 = image ? "done" : "now";
  const s2 = symptom.trim() ? "done" : image ? "now" : "";
  const s3 = result ? "done" : parts.length > 0 ? "now" : "";
  const primary = !image
    ? { label: t("Take a photo", "Snap photo"), fn: () => fileRef.current?.click(), busy: false, sub: t("Start with a clear photo in daylight", "Start with clear photo") }
    : parts.length === 0 && !segmented
      ? { label: loading === "segment" ? t("Finding parts…", "Dey find parts…") : t("Find parts", "Find parts"), fn: () => identifyParts(), busy: loading === "segment", sub: agentic ? "" : t("Tip: describe the fault first for smarter detection", "Tip: talk wetin do am first") }
      : !result
        ? { label: loading === "diagnose" ? t("Diagnosing…", "Dey check am…") : t("Diagnose fault", "Check am"), fn: () => diagnose(), busy: loading === "diagnose", sub: t("Spark reads photo + symptom + parts", "Spark go read photo + wetin you talk") }
        : { label: loading === "diagnose" ? t("Updating…", "Dey update…") : t("Update diagnosis", "Check am again"), fn: () => diagnose(), busy: loading === "diagnose", sub: "" };

  return (
    <>
      <header className="appbar">
        <div className="appbar-inner">
          <Link href="/" className="appbar-back" aria-label="Back to home">
            {I.arrowLeft(18)}
          </Link>
          <Link href="/" className="brand-link">
            <div className="brandmark">{I.mark(20)}</div>
            <div className="brandname">
              FixAm <span>{domain.toUpperCase()}</span>
            </div>
          </Link>
          <div className="appbar-spacer" />
          <div className="seg" role="group" aria-label="Language selection">
            <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
            <button aria-pressed={lang === "pidgin"} onClick={() => setLang("pidgin")}>Pidgin</button>
          </div>
        </div>
      </header>

      <main className="shell">
        <div className="hero">
          <span className="hero-badge">{I.sparkles(13)} {t("AI Repair Guide", "AI Repair Guide")}</span>
          <h1>{t("Snap it, fix am.", "Snap am, fix am.")}</h1>
          <p>{lang === "pidgin" ? DOMAIN_UI[domain].heroPg : DOMAIN_UI[domain].hero}</p>
        </div>

        <div className="domains" role="group" aria-label={t("What are you fixing?", "Wetin you dey fix?")}>
          <button className="domain" aria-pressed={domain === "gen"} onClick={() => selectDomain("gen")}>
            <span className="domain-icon">{I.plug(18)}</span>
            <span>Gen</span>
            <small>Tiger · Elepaq</small>
          </button>
          <button className="domain" aria-pressed={domain === "okada"} onClick={() => selectDomain("okada")}>
            <span className="domain-icon">{I.bike(18)}</span>
            <span>Okada</span>
            <small>Boxer · CG</small>
          </button>
          <button className="domain" aria-pressed={domain === "solar"} onClick={() => selectDomain("solar")}>
            <span className="domain-icon">{I.sun(18)}</span>
            <span>Solar</span>
            <small>Inverter · Bat</small>
          </button>
          <button className="domain" aria-pressed={domain === "phone"} onClick={() => selectDomain("phone")}>
            <span className="domain-icon">{I.phone(18)}</span>
            <span>Phone</span>
            <small>Tecno · iPhone</small>
          </button>
          <button className="domain" aria-pressed={domain === "car"} onClick={() => selectDomain("car")}>
            <span className="domain-icon">{I.car(18)}</span>
            <span>Car</span>
            <small>Toyota · Honda</small>
          </button>
        </div>

        <ol className="steps" aria-label="Progress tracker">
          <li className={s1} aria-current={s1 === "now" ? "step" : undefined}>
            <span className="n">{s1 === "done" ? "✓" : "1"}</span>
            <span>{t("Photograph", "Photo")}</span>
          </li>
          <li className={s2} aria-current={s2 === "now" ? "step" : undefined}>
            <span className="n">{s2 === "done" ? "✓" : "2"}</span>
            <span>{t("Fault details", "Wetin do")}</span>
          </li>
          <li className={s3} aria-current={s3 === "now" ? "step" : undefined}>
            <span className="n">{s3 === "done" ? "✓" : "3"}</span>
            <span>{t("Repair guide", "Fix am")}</span>
          </li>
        </ol>

        {!image && !result && (
          <div className="demo-banner">
            <div className="demo-text">
              <strong>{I.sparkles(16)} {t("New here? See it work instantly.", "New here? See how e work.")}</strong>
              <span>{t("Run a full demo diagnosis on real generator machine imagery.", "Full demo diagnosis with real gen photo.")}</span>
            </div>
            <button className="btn btn-primary" onClick={runDemo} disabled={loading !== ""}>
              {t("Run demo", "Run demo")}
            </button>
          </div>
        )}

        {notice && (
          <div className="notice" role="status">
            {I.alert(18)}
            <span style={{ flex: 1 }}>{notice.text}</span>
            {notice.action && (
              <button className="notice-retry" onClick={retryNotice}>{t("Retry", "Try again")}</button>
            )}
          </div>
        )}

        {copiedToast && (
          <div className="notice" style={{ background: "var(--brand-soft)", borderColor: "var(--brand)", color: "var(--brand-ink-on-soft)" }}>
            {I.check(18)}
            <span>{t("Repair plan copied to clipboard!", "Repair plan don copy to clipboard!")}</span>
          </div>
        )}

        <section className="card" aria-labelledby="photo-h">
          <div className="card-head">
            <span className="card-num">1</span>
            <div className="card-head-text">
              <h2 id="photo-h">{t("Photograph your machine", "Snap am")}</h2>
              <p>{lang === "pidgin" ? DOMAIN_UI[domain].photoPg : DOMAIN_UI[domain].photo}</p>
            </div>
          </div>

          <div className={`viewfinder${image ? " filled" : ""}`}>
            {loading === "segment" && <div className="vf-scanline" />}
            {image ? (
              <>
                <img src={image} alt={t("What you are fixing", "Wetin you dey fix")} />
                {parts.map((p, i) => {
                  const isHovered = highlightedPart === p.label;
                  return (
                    <div
                      key={i}
                      className="bbox"
                      style={{
                        left: `${p.box[0] * 100}%`,
                        top: `${p.box[1] * 100}%`,
                        width: `${(p.box[2] - p.box[0]) * 100}%`,
                        height: `${(p.box[3] - p.box[1]) * 100}%`,
                        borderColor: isHovered ? "#10b981" : "var(--sam-box)",
                        boxShadow: isHovered ? "0 0 20px #10b981" : undefined
                      }}
                    >
                      <span className="bbox-label" style={{ background: isHovered ? "#10b981" : undefined }}>
                        {p.label} · {(p.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
                {result && diagnosis && (
                  <div className="verdict-bug" aria-hidden="true">
                    <span className="bug-dot" />
                    <span className="bug-text">{shortDiagnosis}</span>
                    {typeof result.confidence === "number" && (
                      <span className="bug-conf">{Math.round(result.confidence * 100)}%</span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="viewfinder-empty">
                <span className="vf-corner vf-tl" />
                <span className="vf-corner vf-tr" />
                <span className="vf-corner vf-bl" />
                <span className="vf-corner vf-br" />
                {I.camera(34)}
                <strong>{t("Camera Viewfinder Ready", "Camera Ready")}</strong>
                <span>{t("Snap a clear photo or upload an existing image from your device.", "Snap clear photo or choose photo for your phone.")}</span>

                {DEMO_PHOTOS[domain] && (
                  <div className="demo-photo-strip">
                    <span className="demo-strip-label">{t("Or test immediately with sample:", "Or test with sample:")}</span>
                    <button
                      className="demo-strip-btn"
                      onClick={() => useDemoPhoto(domain)}
                      disabled={loading === "demo"}
                    >
                      {I.image(16)}
                      {loading === "demo" ? t("Loading…", "Dey load…") : t(`Use sample: ${DEMO_PHOTOS[domain].label}`, `Use sample: ${DEMO_PHOTOS[domain].label}`)}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFile}
            aria-hidden="true"
            tabIndex={-1}
          />

          {loading === "segment" && (
            <div aria-live="polite" style={{ marginTop: 14 }}>
              <div className="skel" style={{ height: 18, width: "65%" }} />
              <div className="skel skel-line" style={{ width: "45%" }} />
            </div>
          )}

          {parts.length > 0 && (
            <>
              <div className="chips">
                {parts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    className="chip"
                    aria-pressed={highlightedPart === p.label}
                    onMouseEnter={() => setHighlightedPart(p.label)}
                    onMouseLeave={() => setHighlightedPart(null)}
                    onClick={() => setHighlightedPart(highlightedPart === p.label ? null : p.label)}
                  >
                    <span className="dot" aria-hidden="true" />
                    {p.label} · {(p.confidence * 100).toFixed(0)}%
                  </button>
                ))}
              </div>
              {agentic && (
                <p className="agent-note">
                  {I.check(16)}
                  <span>{t("Spark dynamically chose these parts based on your symptom.", "Spark choose these parts from wetin you talk before e segment.")}</span>
                </p>
              )}
            </>
          )}

          {image && (
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
                {I.retake(18)}
                {t("Retake / Change photo", "Snap again")}
              </button>
            </div>
          )}

          {MOTION_DOMAINS.includes(domain) && (
            <>
              <hr className="report-sep" />
              <p className="subhead">
                {I.video(18)}
                <span>{t("Vibration & Exhaust Telemetry (Optional)", "Motion & Exhaust Check (Optional)")}</span>
              </p>
              <p className="hint">{lang === "pidgin" ? motionConfig(domain).hintPg : motionConfig(domain).hintEn}</p>
              <p className="hint">{lang === "pidgin" ? motionConfig(domain).filmPg : motionConfig(domain).filmEn}</p>
              {!clip ? (
                <div className="btn-row">
                  {!clipFallback ? (
                    <button className="btn btn-secondary" onClick={recordClip} disabled={clipRecording}>
                      {I.activity(18)}
                      {clipRecording ? t("Recording… hold steady", "Dey record… hold am") : t("Record 3s clip", "Record 3s clip")}
                    </button>
                  ) : (
                    <>
                      <label className="btn btn-secondary" onClick={() => clipFileRef.current?.click()} style={{ cursor: "pointer" }}>
                        {I.video(18)}{t("Record with Camera", "Record with Camera")}
                      </label>
                      <input ref={clipFileRef} type="file" accept="video/*" capture="camcorder" onChange={onClipFile} aria-hidden="true" tabIndex={-1} />
                    </>
                  )}
                </div>
              ) : (
                <>
                  <video className="video-preview" src={clip} controls playsInline muted />
                  <div className="btn-row">
                    {clipFallback ? (
                      <>
                        <label className="btn btn-secondary" onClick={() => clipFileRef.current?.click()} style={{ cursor: "pointer" }}>
                          {I.retake(18)}{t("Re-record", "Record again")}
                        </label>
                        <input ref={clipFileRef} type="file" accept="video/*" capture="camcorder" onChange={onClipFile} aria-hidden="true" tabIndex={-1} />
                      </>
                    ) : (
                      <button className="btn btn-secondary" onClick={recordClip} disabled={clipRecording || loading === "motion"}>
                        {I.retake(18)}{t("Re-record", "Record again")}
                      </button>
                    )}
                    <button className="btn btn-primary" onClick={analyzeMotion} disabled={loading === "motion"}>
                      {I.activity(18)}{loading === "motion" ? t("Analyzing…", "Dey check…") : t("Analyze motion", "Check motion")}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </section>

        <section className="card" aria-labelledby="symptom-h">
          <div className="card-head">
            <span className="card-num">2</span>
            <div className="card-head-text">
              <h2 id="symptom-h">{t("Describe what's wrong", "Talk wetin do am")}</h2>
              <p>{t("Speak in Pidgin or English, or tap a common symptom below.", "Talk English or Pidgin, or tap wetin match for down.")}</p>
            </div>
          </div>

          <div className="mic-row">
            <button
              className={`mic-btn${recording ? " rec" : ""}`}
              onClick={toggleRecord}
              disabled={loading === "transcribe"}
              aria-label={recording ? t("Stop recording", "Stop") : t("Record voice note", "Record voice")}
              aria-pressed={recording}
            >
              {recording ? I.stop(22) : I.mic(22)}
            </button>
            <span className="mic-hint">
              {loading === "transcribe"
                ? t("Transcribing Pidgin/English with Voice AI…", "Dey write am with Voice AI…")
                : recording
                  ? t("Listening… speak clearly and tap to finish.", "Dey record… tap to finish.")
                  : t("Tap microphone to describe the fault in English or Pidgin.", "Tap mic, talk in English or Pidgin.")}
            </span>
          </div>

          {QUICK_SYMPTOMS[domain] && (
            <div className="symptom-chips">
              {QUICK_SYMPTOMS[domain].map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="symptom-chip-btn"
                  onClick={() => setSymptom(lang === "pidgin" ? s.pg : s.en)}
                >
                  {lang === "pidgin" ? s.pg : s.en}
                </button>
              ))}
            </div>
          )}

          <label className="field-label" htmlFor="symptom">
            {t("Fault description", "Wetin happen")}
          </label>
          <textarea
            id="symptom"
            ref={symptomRef}
            rows={3}
            placeholder={lang === "pidgin" ? DOMAIN_UI[domain].phPg : DOMAIN_UI[domain].ph}
            value={symptom}
            maxLength={600}
            aria-describedby="symptom-count"
            onChange={(e) => setSymptom(e.target.value)}
          />
          {symptom.length > 450 && (
            <p id="symptom-count" className="price-note" aria-live="polite">
              {symptom.length}/600 characters
            </p>
          )}
        </section>

        {loading === "diagnose" && (
          <section className="card" aria-live="polite" aria-label={t("Loading diagnosis", "Dey load diagnosis")}>
            <div className="skel" style={{ height: 24, width: "65%" }} />
            <div className="skel skel-line" style={{ width: "90%" }} />
            <div className="skel skel-line" style={{ width: "80%" }} />
            <div className="skel skel-line" style={{ width: "55%" }} />
          </section>
        )}

        {result && (
          <section className="card" aria-labelledby="fix-h">
            <div className="card-head">
              <span className="card-num">3</span>
              <div className="card-head-text">
                <h2 id="fix-h">
                  {t("AI Diagnosis & Repair Plan", "How to fix am")}
                  {(result.fallback || result.demo) && <span className="lvl lvl-mid">offline demo</span>}
                </h2>
              </div>
            </div>

            <div className="verdict">
              <div className="verdict-badge">{I.wrench(24)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3>{diagnosis}</h3>
                {typeof result.confidence === "number" && (
                  <div className="conf-row">
                    <div className="conf-bar">
                      <i style={{ width: `${Math.round(result.confidence * 100)}%` }} />
                    </div>
                    <span className="conf-val">{Math.round(result.confidence * 100)}% match</span>
                  </div>
                )}
              </div>
            </div>

            {steps?.length > 0 && (
              <>
                <hr className="report-sep" />
                <p className="report-label">
                  {I.checkCircle(16)}
                  <span>{t("Step-by-step checklist (tap to complete)", "Wetin to do (tap to check)")}</span>
                </p>
                <ol className="timeline">
                  {steps.map((s, i) => {
                    const done = !!completedSteps[i];
                    return (
                      <li key={i} className={done ? "step-completed" : ""}>
                        <button
                          type="button"
                          className="step-toggle"
                          role="checkbox"
                          aria-checked={done}
                          onClick={() => toggleStep(i)}
                        >
                          <span className="t-num" aria-hidden="true">{done ? "✓" : i + 1}</span>
                          {s}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}

            {result.tools?.length > 0 && (
              <>
                <hr className="report-sep" />
                <p className="tools-row">
                  <strong>{t("Required Tools", "Tools wey you need")}:</strong> {result.tools.join(" · ")}
                </p>
              </>
            )}

            {result.needed_parts?.length > 0 && (
              <>
                <hr className="report-sep" />
                <p className="report-label">
                  {I.info(16)}
                  <span>{t("Fair Market Parts & Prices", "Parts & fair market price")}</span>
                </p>
                <ul className="prices">
                  {result.needed_parts.map((p, i) => {
                    const eff = effPrice(p);
                    return (
                      <li key={i}>
                        <span className="p-name">
                          {p.name || p.key}
                          {p.market && <span className="p-market">{p.market}</span>}
                          {eff.tag === "you" && (
                            <span className="p-tag">{t("You reported this price", "Na you report this price")}</span>
                          )}
                          {eff.tag && eff.tag !== "you" && (
                            <span className="p-tag">{t("Community", "Community")} · {eff.tag.split("·")[1]?.trim()} {t("reports", "reports")}</span>
                          )}
                          <button
                            className="rep-link"
                            onClick={() => {
                              setReporting(p.key);
                              setRepPrice("");
                              setRepMarket(p.market || "");
                            }}
                          >
                            {t("Report your market price", "Report price")}
                          </button>
                        </span>
                        <span className="p-dots" aria-hidden="true" />
                        <span className="p-val">
                          {typeof eff.value === "number" ? `₦${eff.value.toLocaleString()}` : t("Ask market", "Ask market")}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {reporting && (
                  <form className="rep-form" onSubmit={submitReport}>
                    <p>
                      <strong>
                        {t("What did you pay for", "How much you pay for")} {result.needed_parts.find((x) => x.key === reporting)?.name || reporting}?
                      </strong>
                    </p>
                    <div className="rep-row">
                      <input
                        type="number"
                        inputMode="numeric"
                        min="100"
                        max="50000000"
                        required
                        aria-label={t("Correct price in Naira", "Correct price for Naira")}
                        placeholder="₦ Amount"
                        value={repPrice}
                        onChange={(e) => setRepPrice(e.target.value)}
                      />
                      <input
                        type="text"
                        maxLength={40}
                        aria-label={t("Market (optional)", "Market (optional)")}
                        placeholder={t("Market name e.g. Ladipo", "Market name e.g. Ladipo")}
                        value={repMarket}
                        onChange={(e) => setRepMarket(e.target.value)}
                      />
                    </div>
                    <div className="rep-row">
                      <button className="btn btn-primary" type="submit" disabled={repSending}>
                        {repSending ? t("Submitting…", "Dey send…") : t("Submit price report", "Send am")}
                      </button>
                      <button className="btn btn-secondary" type="button" onClick={() => setReporting(null)}>
                        {t("Cancel", "Cancel")}
                      </button>
                    </div>
                  </form>
                )}
                <p className="price-note">
                  {t(`Grounded in our ${priceBookMonth} Ladipo & Computer Village market book — confirm before paying.`, `Na ${priceBookMonth} market price be this — confirm before you buy.`)}
                </p>
              </>
            )}

            {danger && (
              <div className="warnblock" style={{ marginTop: 16 }}>
                {I.alert(18)}
                <span>{danger}</span>
              </div>
            )}

            {result.take_to_shop && (
              <div className="warnblock" style={{ marginTop: 12 }}>
                {I.alert(18)}
                <span>{t("Take it to a professional rewinder or mechanic. This fault requires workshop machinery.", "Carry am go rewinder or mechanic. This one pass home fix.")}</span>
              </div>
            )}

            <div className="btn-row">
              <button className="btn btn-secondary" onClick={showDiagram} disabled={loading === "diagram"}>
                {I.image(18)}
                {loading === "diagram" ? t("Generating blueprint…", "Dey draw…") : t("View diagram", "Diagram")}
              </button>
              <button className="btn btn-secondary" onClick={copyRepairPlan}>
                {I.copy(18)}
                {t("Copy plan", "Copy plan")}
              </button>
              <a className="btn btn-wa" href={whatsappLink()} target="_blank" rel="noreferrer">
                {I.chat(18)}WhatsApp
              </a>
            </div>

            {diagram && (
              <figure className="figure">
                <img src={diagram} alt={t("Labeled repair diagram", "Repair diagram")} />
                <figcaption>{t("AI-generated technical schematic. Cross-check against your physical machine part.", "AI draw am. Confirm with real part.")}</figcaption>
              </figure>
            )}

            <div style={{ textAlign: "center", marginTop: 10 }}>
              <button className="link-btn" onClick={startOver}>
                {I.retake(14)} {t("Start a new diagnosis", "Start again")}
              </button>
            </div>

            {result.shop_cost_naira > 0 && (
              <div className="savings-band">
                <div className="s-row">
                  <span>{t("DIY replacement parts cost", "Do am yourself parts")}</span>
                  <strong>₦{partsTotal.toLocaleString()}</strong>
                </div>
                <div className="s-row">
                  <span>{t("Typical rewinder / mechanic charge", "Rewinder estimate")}</span>
                  <strong>~₦{result.shop_cost_naira.toLocaleString()}</strong>
                </div>
                <div className="s-row s-save">
                  <span>{t("Your potential savings", "Wetin you save")}</span>
                  <span>~₦{Math.max(0, savings).toLocaleString()}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {loading === "motion" && (
          <section className="card" aria-live="polite" aria-label={t("Analyzing motion", "Dey check motion")}>
            <div className="skel" style={{ height: 20, width: "60%" }} />
            <div className="skel skel-line" style={{ width: "85%" }} />
            <div className="skel skel-line" style={{ width: "70%" }} />
            <p className="hint" style={{ marginTop: 12 }}>
              {motionProgress || t("Tracking frame-by-frame on Modal + SAM 3.1 video…", "Dey track motion on Modal + SAM…")}
            </p>
          </section>
        )}

        {motion?.verdict && (
          <section className="card" aria-label={t("Motion telemetry report", "Motion report")}>
            <div className="card-head">
              <div className="verdict-badge">{I.activity(22)}</div>
              <div className="card-head-text">
                <h2>
                  {t("Motion & Vibration Report", "Motion report")}
                  {motion.fallback && <span className="lvl lvl-mid">offline demo</span>}
                </h2>
                <p>
                  {t("3-second clip", "3-second clip")} · {motion.metrics?.frames_seen || 0} {t("frames tracked", "frames")} · {motion.metrics?.subject || motion.subject || motionConfig(motion.domain || domain).subjectLabel}
                </p>
              </div>
            </div>

            <div className="motion-row">
              <p className="report-label">
                {t("Vibration index", "Shake level")} <LevelChip level={motion.verdict.vibration_level} />
              </p>
              <div className="conf-row">
                <div className="conf-bar">
                  <i style={{ width: `${Math.min(100, Math.round(((motion.metrics?.engine?.vibration?.index || 0) / 0.04) * 100))}%` }} />
                </div>
                <span className="conf-val">{(motion.metrics?.engine?.vibration?.index || 0).toFixed(3)}</span>
              </div>
              {(motion.metrics?.engine?.vibration?.series?.length || 0) > 2 && (
                <MotionSpark series={motion.metrics.engine.vibration.series} />
              )}
              <p style={{ marginTop: 10, fontSize: 14.5 }}>
                {lang === "pidgin" ? motion.verdict.vibration_pidgin : motion.verdict.vibration_en}
              </p>
            </div>

            <hr className="report-sep" />
            <div>
              <p className="report-label">
                {t("Exhaust smoke check", "Exhaust smoke")} <LevelChip level={motion.verdict.smoke_level} smoke />
              </p>
              <p style={{ fontSize: 14.5 }}>
                {lang === "pidgin" ? motion.verdict.smoke_pidgin : motion.verdict.smoke_en}
              </p>
            </div>

            <hr className="report-sep" />
            <p className="tools-row">
              <strong>{t("Safety & Operational Advice", "Advice")}:</strong>{" "}
              {lang === "pidgin" ? motion.verdict.advice_pidgin : motion.verdict.advice_en}
            </p>

            {motion.keyframes?.length > 0 && (
              <div className="kf-row">
                {motion.keyframes.map((kf, i) => (
                  <img key={i} src={kf} alt={t("Keyframe", "Keyframe") + ` ${i + 1}`} />
                ))}
              </div>
            )}
          </section>
        )}

        <footer>
          FixAm Naija · {t("Built on Meta Model API for Nigeria", "Built on Meta Model API for Nigeria")}<br />
          Muse Spark 1.3 · SAM 3.1 Vision · Muse Image · Voice Transcribe · Modal Pipeline
        </footer>
      </main>

      {primary && (
        <div className="bottombar">
          <div className="bottombar-inner">
            <button className="btn btn-primary" onClick={primary.fn} disabled={primary.busy}>
              {primary.label} {I.chev(18)}
            </button>
            {primary.sub && !primary.busy && <p className="bottombar-sub">{primary.sub}</p>}
          </div>
        </div>
      )}
    </>
  );
}

// Shrink uploads: iPhone photos are 2-4MB. 1280px JPEG is plenty for SAM + Spark,
// uploads ~10x faster on 3G and burns far fewer credits.
function downscaleImage(dataUrl, maxDim = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      if (scale >= 1 && dataUrl.startsWith("data:image/jpeg")) return resolve(dataUrl);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function MotionSpark({ series }) {
  const W = 300, H = 46, PAD = 5;
  const max = Math.max(...series, 0.001);
  const pts = series.map((v, i) => [
    PAD + (i / (series.length - 1)) * (W - PAD * 2),
    H - PAD - (v / max) * (H - PAD * 2)
  ]);
  const line = pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
  const mean = series.reduce((s, v) => s + v, 0) / series.length;
  const peaks = pts.filter((_, i) => series[i] > mean * 2 && series[i] > 0.005);
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Vibration over time">
      <polyline points={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {peaks.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" className="spark-peak" />)}
    </svg>
  );
}

function LevelChip({ level, smoke }) {
  const good = smoke ? level === "none" : level === "low";
  const mid = smoke ? level === "light" : level === "normal";
  const cls = good ? "lvl-ok" : mid ? "lvl-mid" : "lvl-bad";
  return <span className={`lvl ${cls}`}>{level}</span>;
}

// Meta ASR requires mono 16-bit PCM WAV at 16kHz. Convert any recording via Web Audio.
async function recordingToWav16k(blob) {
  const ab = await blob.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  try {
    const decoded = await ctx.decodeAudioData(ab);
    const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
    const src = offline.createBufferSource();
    src.buffer = decoded;
    src.connect(offline.destination);
    src.start();
    const rendered = await offline.startRendering();
    const samples = rendered.getChannelData(0);
    const wav = encodeWavPCM16(samples, 16000);
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(new Blob([wav], { type: "audio/wav" }));
    });
  } finally {
    ctx.close();
  }
}

function encodeWavPCM16(samples, sampleRate) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const wstr = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  wstr(0, "RIFF");
  v.setUint32(4, 36 + samples.length * 2, true);
  wstr(8, "WAVE");
  wstr(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  wstr(36, "data");
  v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buf;
}
