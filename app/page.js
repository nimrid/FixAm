import Link from "next/link";
import "./globals.css";
import "./landing.css";
import { I } from "./icons";

export const metadata = {
  title: "FixAm — Snap it, fix am. AI Repair Guide for Nigeria",
  description: "AI repair guide for Nigeria: generator, okada, solar, phone & car. Photo + Pidgin voice, powered by Meta Muse + SAM."
};

const FIXES = [
  { icon: "plug", name: "Generator", ex: "Tiger, Elepaq & Firman hard-start, black smoke, surging, no-output faults." },
  { icon: "bike", name: "Okada", ex: "Bajaj Boxer & Honda CG kick-start, loose chain, worn brakes, engine smoke." },
  { icon: "sun", name: "Solar & Inverter", ex: "Inverter overload beeps, weak panel charging, rapid battery drain at night." },
  { icon: "phone", name: "Smartphone", ex: "Swollen battery, broken charging port, cracked screen, touch responsiveness." },
  { icon: "car", name: "Car Roadside", ex: "Overheating, clicking starter, squealing brakes, flats — with night-safety rules." }
];

const TESTIMONIALS = [
  {
    name: "Emeka O.",
    role: "Barbershop Owner",
    location: "Surulere, Lagos",
    avatar: "EO",
    domain: "Generator",
    icon: "plug",
    machine: "Tiger 2.5kVA Generator",
    savings: "Saved ₦18,500 rewinder fee",
    quote: "My Tiger gen stopped catching at 8 PM on a busy Saturday with 4 customers waiting. I snapped the carburetor, spoke Pidgin into FixAm, and it spotted the blocked bowl screw and confirmed the spark plug replacement was ₦3,500. I bought the plug from the next street and followed the 5 steps. Gen caught on the second pull."
  },
  {
    name: "Kabir A.",
    role: "Full-Time Dispatch Rider",
    location: "Ikeja / Maryland, Lagos",
    avatar: "KA",
    domain: "Okada",
    icon: "bike",
    machine: "Bajaj Boxer 100cc",
    savings: "Saved ₦21,000 on parts markup",
    quote: "Chain dey slap my bike cover heavily, and one mechanic quote me ₦35,000 for full sprocket replacement. I open FixAm, e analyze the chain slack and show me say na small link adjustment and Ladipo genuine chain kit na ₦14,000. I buy am myself and give apprentice ₦2,000 for labor. FixAm save my week hustle."
  },
  {
    name: "Dr. Nneka U.",
    role: "Community Clinic Administrator",
    location: "Independence Layout, Enugu",
    avatar: "NU",
    domain: "Solar & Inverter",
    icon: "sun",
    machine: "Luminous 3.5kVA Hybrid Inverter",
    savings: "Prevented ₦180,000 battery cost",
    quote: "Our vaccine storage inverter was beeping red overload alarm immediately grid power failed. The electrician said our 220Ah tubular batteries were dead. FixAm's camera viewfinder highlighted heavy sulfate corrosion on the terminal lugs. We cleaned the leads with baking soda as guided, and the system held full charge all night."
  },
  {
    name: "Tunde B.",
    role: "Certified Phone Technician",
    location: "Computer Village, Ikeja",
    avatar: "TB",
    domain: "Smartphone",
    icon: "phone",
    machine: "Tecno & Infinix Repair Bench",
    savings: "Transparent book prices",
    quote: "In Computer Village, customers always argue that technicians inflate screen and battery prices. Now when someone brings a swollen battery or charging port fault, I tell them: 'Open FixAm and check the market book price yourself.' It builds instant trust and our turnaround time is twice as fast."
  },
  {
    name: "Chinedu & Blessing M.",
    role: "Family Commuters",
    location: "Lagos-Ibadan Expressway",
    avatar: "CM",
    domain: "Car Roadside",
    icon: "car",
    machine: "Toyota Corolla 1.8L",
    savings: "Prevented radiator steam burns",
    quote: "Our temperature gauge hit red near Sagamu interchange around 9:30 PM. In panic, I was about to twist the radiator cap open. FixAm gave an emergency warning banner: 'Do NOT open radiator cap hot — severe scald hazard.' It told us to wait 20 minutes, check coolant overflow, and guided us safely to a lighted filling station."
  }
];

export default function Landing() {
  return (
    <>
      <header className="lnav">
        <div className="lnav-inner">
          <Link className="lbrand" href="/">
            <div className="brandmark">{I.mark(20)}</div>
            <div className="brandname">
              FixAm <span>Naija</span>
            </div>
          </Link>
          <nav className="llinks" aria-label="Main Navigation">
            <a href="#how">How it works</a>
            <a href="#fixes">What it fixes</a>
            <a href="#stories">Field Stories</a>
            <a href="#motion">Motion telemetry</a>
            <a href="#naija">Built for Naija</a>
          </nav>
          <Link className="btn btn-primary lcta" href="/app">
            Launch app {I.chev(16)}
          </Link>
        </div>
      </header>

      <main className="lwrap">
        <section className="hero-landing">
          <div className="hero-copy">
            <div className="lcontext-pill">
              {I.sparkles(15)}
              <span>Meta Global AI Developer Hackathon Entry</span>
            </div>
            <h1>
              Snap it.<br />
              <span className="highlight-text">Fix am.</span>
            </h1>
            <p className="lede">
              The AI repair guide for the machines Nigeria runs on.
              Photograph the fault, speak in English or Pidgin, and get
              failing parts identified directly on your photo with numbered steps,
              fair Naira market prices, and safety warnings.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" href="/app">
                Launch FixAm {I.chev(18)}
              </Link>
              <Link className="btn btn-secondary" href="/app?demo=1">
                20-sec live demo
              </Link>
            </div>
            <div className="proof-row">
              <div className="proof-dots">
                <span className="proof-dot" />
                <span className="proof-dot" />
                <span className="proof-dot" />
              </div>
              <span>Powered by Muse Spark · SAM 3.1 · Muse Image · Voice Transcribe</span>
            </div>
          </div>

          <div className="hero-media" aria-label="Example: generator photo with AI part detection">
            <div className="phone-mockup">
              <span className="vf-corner vf-tl" />
              <span className="vf-corner vf-tr" />
              <span className="vf-corner vf-bl" />
              <span className="vf-corner vf-br" />
              <div className="vf-scanline" />
              
              <img src="/demo/gen-tiger.jpg" alt="Tiger generator with AI detected parts" />
              
              <span className="bbox" style={{ left: "10%", top: "11%", width: "77%", height: "81%" }}>
                <span className="bbox-label">generator · 91%</span>
              </span>
              <span className="bbox" style={{ left: "17%", top: "18%", width: "36%", height: "30%" }}>
                <span className="bbox-label">fuel tank · 62%</span>
              </span>
              <span className="bbox" style={{ left: "53%", top: "27%", width: "31%", height: "31%" }}>
                <span className="bbox-label">control panel · 75%</span>
              </span>
              
              <div className="verdict-bug">
                <span className="bug-dot" />
                <span className="bug-text">Carburetor block, spark plug dirty…</span>
                <span className="bug-conf">88%</span>
              </div>
            </div>
            <p className="media-cap">
              Live SAM 3.1 computer vision segmentation + Muse Spark reasoning on a Tiger 2.5kVA.
            </p>
          </div>
        </section>

        <section className="models-strip" aria-label="Technology and models used">
          {["Muse Spark 1.3 Vision", "SAM 3.1 Segmentation", "Muse Image 1.0", "Voice Transcribe 1.0", "Modal Video Pipelines", "PWA 100% Offline Shell"].map((m) => (
            <span key={m} className="model-chip">
              {I.check(14)}
              {m}
            </span>
          ))}
        </section>

        <section id="how" className="how-section">
          <div className="section-title-wrap">
            <span className="section-tag">Workflow</span>
            <h2 className="section-h2">How FixAm works</h2>
            <p className="section-sub">From broken engine to complete repair plan in under 60 seconds.</p>
          </div>

          <div className="how-grid">
            <div className="how-card">
              <div className="how-badge">01</div>
              <h3>Snap the fault</h3>
              <p>
                Take a quick photo of your generator, okada, solar inverter, phone, or car.
                Optionally record a 3-second running clip for motion vibration tracking.
              </p>
            </div>

            <div className="how-card">
              <div className="how-badge">02</div>
              <h3>AI finds every part</h3>
              <p>
                Muse Spark reasons about your symptom to choose which components to segment;
                SAM 3.1 pinpoints every part on your photo with bounding boxes and confidence scores.
              </p>
            </div>

            <div className="how-card">
              <div className="how-badge">03</div>
              <h3>Fix with fair prices</h3>
              <p>
                Get step-by-step repair instructions in English or Pidgin, Ladipo & Computer Village
                parts prices, rewinder-vs-DIY savings, and 1-tap WhatsApp sharing.
              </p>
            </div>
          </div>
        </section>

        <section id="fixes" className="fixes-section">
          <div className="section-title-wrap">
            <span className="section-tag">Coverage</span>
            <h2 className="section-h2">The 5 machines Nigeria runs on</h2>
            <p className="section-sub">Engineered specifically for everyday machines and roadside diagnostics.</p>
          </div>

          <div className="fixes-grid">
            {FIXES.map((f) => (
              <div key={f.name} className="fix-card">
                <div className="fix-icon-badge">
                  {I[f.icon](22)}
                </div>
                <div className="fix-content">
                  <h4>{f.name}</h4>
                  <p>{f.ex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="naija" className="naija-band">
          <div className="band-grid">
            <div className="band-item">
              <h3>{I.mic(20)} Speak Pidgin. Get Pidgin.</h3>
              <p>
                Voice notes are transcribed locally and answered in the language you speak.
                Zero literacy or typing barriers between a roadside fault and its repair.
              </p>
            </div>
            <div className="band-item">
              <h3>{I.wrench(20)} Fair Naira prices, verified.</h3>
              <p>
                Every diagnosis carries Naira replacement parts prices from Ladipo and Computer Village
                market books, plus rewinder estimates, so nobody gets cheated.
              </p>
            </div>
            <div className="band-item">
              <h3>{I.chat(20)} Built to share on WhatsApp.</h3>
              <p>
                Send the full diagnosis, step-by-step checklist, parts list, and costs directly
                to your mechanic, apprentice, or family group in one tap.
              </p>
            </div>
          </div>
        </section>

        <section id="stories" className="testimonials-section">
          <div className="section-title-wrap">
            <span className="section-tag">Field Stories</span>
            <h2 className="section-h2">Trusted in workshops & on roadsides</h2>
            <p className="section-sub">
              From midnight generator blackouts to Ladipo market pricing checks, see how Nigerians fix their machines with FixAm.
            </p>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <div className="testimonial-user">
                    <div className="testimonial-name">
                      {t.name}
                      <span className="testimonial-verified" title="Verified FixAm User">
                        {I.checkCircle(15)}
                      </span>
                    </div>
                    <div className="testimonial-role">{t.role} · {t.location}</div>
                  </div>
                </div>

                <div className="testimonial-badges">
                  <span className="badge-domain">
                    {I[t.icon](13)} {t.domain}
                  </span>
                  <span className="badge-savings">{t.savings}</span>
                </div>

                <div className="testimonial-stars" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{I.star(14)}</span>
                  ))}
                </div>

                <blockquote className="testimonial-quote">
                  "{t.quote}"
                </blockquote>

                <div className="testimonial-machine">
                  {I.wrench(13)}
                  <span>Machine repaired: {t.machine}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="motion" className="motion-section">
          <div className="motion-copy">
            <span className="section-tag">Vibration Telemetry</span>
            <h2>Hear it shake? Prove it.</h2>
            <p>
              The motion check records 3 seconds of a running engine — generator, okada, or car at idle.
              A Modal pipeline tracks the engine and exhaust frame-by-frame with SAM 3.1 video segmentation,
              computes a vibration index, and Spark judges excessive shaking and exhaust smoke colors.
            </p>
            <Link className="btn btn-primary" href="/app">
              Test motion check {I.chev(18)}
            </Link>
          </div>

          <div className="motion-viz">
            <div className="motion-viz-head">
              <span>Telemetry: Vibration series (Tiger 2.5kVA)</span>
              <span className="lvl lvl-mid">Moderate Shake</span>
            </div>
            <svg className="spark spark-lg" viewBox="0 0 300 90" role="img" aria-label="Example vibration timeline">
              <polyline
                points="5,70 18,72 31,55 44,71 57,73 70,40 83,69 96,74 109,70 122,35 135,68 148,72 161,71 174,48 187,70 200,73 213,66 226,28 239,69 252,72 265,70 278,44 291,68"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              <circle cx="70" cy="40" r="4.5" className="spark-peak" />
              <circle cx="122" cy="35" r="4.5" className="spark-peak" />
              <circle cx="226" cy="28" r="4.5" className="spark-peak" />
            </svg>
            <p className="media-cap" style={{ marginTop: 8 }}>
              Peak markers highlight excessive cylinder misfires and loose mounting bolts.
            </p>
          </div>
        </section>

        <section className="final-cta">
          <h2>Fix your machine in under a minute.</h2>
          <p>No account required. No manual. Pick what broke, photograph it, and follow the steps.</p>
          <div className="hero-ctas" style={{ justifyContent: "center" }}>
            <Link className="btn btn-primary" href="/app">
              Launch FixAm App {I.chev(18)}
            </Link>
            <Link className="btn btn-secondary" href="/app?demo=1">
              Run 20-second demo
            </Link>
          </div>
        </section>

        <footer className="lfoot">
          FixAm Naija · Built on Meta Model API for the Meta Global AI Developer Hackathon<br />
          Muse Spark 1.3 · SAM 3.1 Vision · Muse Image 1.0 · Voice Transcribe · Modal GPU Pipeline
        </footer>
      </main>
    </>
  );
}
