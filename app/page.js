import Link from "next/link";
import "./globals.css";
import "./landing.css";
import { I } from "./icons";

export const metadata = {
  title: "FixAm — Snap it, fix am",
  description: "AI repair guide for Nigeria: generator, okada, solar, phone & car. Photo + Pidgin voice, powered by Meta Muse + SAM."
};

const FIXES = [
  { icon: "plug", name: "Generator", ex: "Tiger & Elepaq hard-start, black smoke, no-output faults." },
  { icon: "bike", name: "Okada", ex: "Boxer & CG starting, chain, brakes, oil, flats." },
  { icon: "sun", name: "Solar", ex: "Inverter faults, weak charging, battery care." },
  { icon: "phone", name: "Phone", ex: "Battery drain, charging, cracked screen, storage." },
  { icon: "car", name: "Car", ex: "Roadside overheating, no-start, brakes, flats — with night-safety rules." }
];

export default function Landing() {
  return (
    <>
      <header className="lnav">
        <div className="lnav-inner">
          <Link className="lbrand" href="/">
            <span className="brandmark">{I.mark(20)}</span>
            <span className="brandname">FixAm <span>Naija</span></span>
          </Link>
          <nav className="llinks">
            <a href="#how">How it works</a>
            <a href="#fixes">What it fixes</a>
            <a href="#motion">Motion check</a>
          </nav>
          <Link className="btn btn-primary lcta" href="/app">Launch app</Link>
        </div>
      </header>

      <main className="lwrap">
        <section className="hero">
          <div className="hero-copy">
            <p className="lcontext">Indie entry · Meta Global AI Developer Hackathon</p>
            <h1>Snap it.<br />Fix am.</h1>
            <p className="lede">
              FixAm is an AI repair guide for the machines Nigeria runs on.
              Photograph the fault, describe it in English or Pidgin, and get
              the failing parts identified on your photo, step-by-step fix,
              fair Naira prices, and safety warnings.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" href="/app">Launch the app {I.chev(18)}</Link>
              <Link className="btn btn-secondary" href="/app?demo=1">Run a live demo</Link>
            </div>
            <p className="proof">Built on Muse Spark · SAM 3.1 · Muse Image · Voice Transcribe</p>
          </div>
          <div className="hero-media" aria-label="Example: generator photo with AI part detection">
            <div className="phone">
              <img src="/demo/gen-tiger.jpg" alt="Tiger generator with detected parts" />
              <span className="bbox" style={{ left: "10%", top: "11%", width: "77%", height: "81%" }}>
                <span className="bbox-label">generator · 91%</span>
              </span>
              <span className="bbox" style={{ left: "17%", top: "18%", width: "36%", height: "30%" }}>
                <span className="bbox-label">fuel tank · 62%</span>
              </span>
              <span className="bbox" style={{ left: "53%", top: "27%", width: "31%", height: "31%" }}>
                <span className="bbox-label">control panel · 75%</span>
              </span>
              <span className="verdict-bug">
                <span className="bug-dot" />
                <span className="bug-text">Carburetor block, spark plug dirty…</span>
                <span className="bug-conf">88%</span>
              </span>
            </div>
            <p className="media-cap">Real output: SAM 3.1 boxes + Spark verdict on a Tiger 2.5kVA.</p>
          </div>
        </section>

        <section className="models" aria-label="Models used">
          {["Muse Spark 1.3", "SAM 3.1", "Muse Image", "Voice Transcribe", "Modal pipelines"].map((m) => (
            <span key={m} className="model-chip">{I.check(14)}{m}</span>
          ))}
        </section>

        <section id="how" className="how">
          <h2>How it works</h2>
          <ol>
            <li>
              <span className="hnum">01</span>
              <div><strong>Snap the fault.</strong> One photo of the gen, bike, panel, phone, or car — plus an optional 3-second clip of it running.</div>
            </li>
            <li>
              <span className="hnum">02</span>
              <div><strong>AI finds the parts.</strong> Spark reads your symptom and picks what to look for; SAM 3.1 draws every match on your photo with confidence scores.</div>
            </li>
            <li>
              <span className="hnum">03</span>
              <div><strong>Fix with steps + prices.</strong> Vision diagnosis in English or Pidgin, Naira parts list, rewinder-vs-DIY savings, repair diagram, one-tap WhatsApp share.</div>
            </li>
          </ol>
        </section>

        <section id="fixes" className="fixes">
          <h2>What it fixes</h2>
          <ul>
            {FIXES.map((f) => (
              <li key={f.name}>
                <span className="fix-icon">{I[f.icon](22)}</span>
                <div><strong>{f.name}.</strong> {f.ex}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="band">
          <div className="band-grid">
            <div>
              <h3>{I.mic(18)} Speak Pidgin. Get Pidgin.</h3>
              <p>Voice notes are transcribed and answered in the language you used — no literacy or typing barrier between a fault and its fix.</p>
            </div>
            <div>
              <h3>{I.wrench(18)} Fair prices, on screen.</h3>
              <p>Every diagnosis carries Naira parts prices and what a rewinder would charge, so nobody gets cheated at the market.</p>
            </div>
            <div>
              <h3>{I.chat(18)} Built to share.</h3>
              <p>Send the full fix — steps, parts, cost — to your mechanic, rewinder, or family group on WhatsApp in one tap.</p>
            </div>
          </div>
        </section>

        <section id="motion" className="motion-l">
          <div>
            <h2>Hear it shake? Prove it.</h2>
            <p>
              The motion check records 3 seconds of a running engine. A Modal pipeline
              tracks it frame-by-frame with SAM 3.1 video segmentation, computes a
              vibration index, and Spark judges shake + exhaust smoke against keyframes —
              rendered as a per-frame timeline with peak markers.
            </p>
            <Link className="btn btn-secondary" href="/app">Try it in the app {I.chev(18)}</Link>
          </div>
          <svg className="spark spark-lg" viewBox="0 0 300 90" role="img" aria-label="Example vibration timeline">
            <polyline
              points="5,70 18,72 31,55 44,71 57,73 70,40 83,69 96,74 109,70 122,35 135,68 148,72 161,71 174,48 187,70 200,73 213,66 226,28 239,69 252,72 265,70 278,44 291,68"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx="70" cy="40" r="4" className="spark-peak" />
            <circle cx="122" cy="35" r="4" className="spark-peak" />
            <circle cx="226" cy="28" r="4" className="spark-peak" />
          </svg>
        </section>

        <section className="final">
          <h2>Fix your first thing in under a minute.</h2>
          <p>No signup. No manual. Pick what broke and follow the steps.</p>
          <div className="hero-ctas">
            <Link className="btn btn-primary" href="/app">Launch the app {I.chev(18)}</Link>
            <Link className="btn btn-secondary" href="/app?demo=1">Run a live demo</Link>
          </div>
        </section>

        <footer className="lfoot">
          FixAm Naija · Built on Meta Model API for the Meta Global AI Developer Hackathon<br />
          Muse Spark · SAM 3.1 · Muse Image · Voice · Modal
        </footer>
      </main>
    </>
  );
}
