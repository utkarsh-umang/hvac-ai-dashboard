import { useState, useEffect, useRef } from "react";

// Load Google Fonts
const loadFonts = () => {
  if (document.getElementById("platform-fonts")) return;
  const link = document.createElement("link");
  link.id = "platform-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap";
  document.head.appendChild(link);
};

const T = {
  bg: "#05070d", card: "#0a0e18", border: "#141c2b",
  text: "#dde4f0", muted: "#6e7f96", dim: "#2a3545",
  amber: "#e3b341", blue: "#58a6ff", green: "#3fb950", red: "#f85149",
};

const MONO = { fontFamily: "'IBM Plex Mono','JetBrains Mono',monospace" };
const SANS = { fontFamily: "'Outfit',sans-serif" };

function SectionNum({ n, label }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 64px 0", display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ ...MONO, fontSize: 11, color: T.amber, letterSpacing: 3 }}>{n}</span>
      <div style={{ flex: 1, height: 1, background: T.border }} />
      <span style={{ ...MONO, fontSize: 9, color: T.muted, letterSpacing: 3 }}>{label}</span>
    </div>
  );
}

function Tag({ children, color }) {
  color = color || T.amber;
  return (
    <span style={{ ...MONO, fontSize: 9, color, background: color + "18", border: `1px solid ${color}35`, borderRadius: 3, padding: "2px 8px", letterSpacing: 2 }}>{children}</span>
  );
}

function GoalLine({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "12px 0 18px" }}>
      <span style={{ ...MONO, fontSize: 10, color: T.amber, letterSpacing: 2 }}>GOAL</span>
      <span style={{ fontSize: 14, color: T.muted, lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

function Details({ summary, children }) {
  return (
    <details style={{ marginTop: 14 }}>
      <summary style={{ cursor: "pointer", ...MONO, fontSize: 10, color: T.text, letterSpacing: 1 }}>
        {summary}
        <span style={{ marginLeft: 10, color: T.dim, fontSize: 9 }}>click to expand</span>
      </summary>
      <div style={{ marginTop: 12 }}>{children}</div>
    </details>
  );
}

// ── HERO ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const live = [
    { lbl: "COP",       val: (4.18 + Math.sin(tick / 10) * 0.05).toFixed(2), c: T.green },
    { lbl: "Power",     val: (185 + Math.sin(tick / 7) * 2).toFixed(0) + " kW", c: T.blue },
    { lbl: "Divergence",val: (0.41 + Math.abs(Math.sin(tick / 15)) * 0.09).toFixed(2) + "σ", c: T.amber },
    { lbl: "Fouling",   val: (3.2 + tick * 0.003).toFixed(1) + "×10⁻⁶", c: T.muted },
  ];

  return (
    <section style={{ minHeight: "72vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px 64px 44px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Live readout bar */}
      <div style={{ display: "flex", gap: 22, marginBottom: 34, flexWrap: "wrap", alignItems: "center" }}>
        {live.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: m.c, boxShadow: `0 0 6px ${m.c}` }} />
            <span style={{ ...MONO, fontSize: 10, color: T.muted }}>{m.lbl}</span>
            <span style={{ ...MONO, fontSize: 11, color: m.c }}>{m.val}</span>
          </div>
        ))}
        <span style={{ ...MONO, fontSize: 9, color: T.dim, marginLeft: "auto" }}>CHL-03 · LIVE</span>
      </div>

      <div style={{ ...MONO, fontSize: 10, color: T.amber, letterSpacing: 4, marginBottom: 24 }}>MILVIAN GROUP · PLATFORM</div>

      <h1 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.06, margin: "0 0 18px", letterSpacing: -2, maxWidth: 820 }}>
        Active<br />
        <span style={{ color: T.amber }}>facility</span><br />
        intelligence.
      </h1>

      <p style={{ fontSize: 18, color: T.muted, lineHeight: 1.65, maxWidth: 660, margin: "0 0 26px", fontWeight: 300 }}>
        Turn live HVAC telemetry into <span style={{ color: T.text }}>decisions</span>: detect drift early, explain the “why”, and recommend the next action in plain English.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, maxWidth: 860, marginBottom: 26 }}>
        {[
          { t: "Early warning", d: "Spot deviation before alarms trip." },
          { t: "Root-cause in minutes", d: "Hypotheses + evidence, not guesswork." },
          { t: "Anyone can use it", d: "Operators, techs, owners—same interface." },
        ].map((c) => (
          <div key={c.t} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 750, marginBottom: 6 }}>{c.t}</div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.55 }}>{c.d}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 40, height: 1, background: T.amber }} />
        <span style={{ ...MONO, fontSize: 10, color: T.muted, letterSpacing: 2 }}>SCROLL TO EXPLORE</span>
      </div>
    </section>
  );
}

// ── ACTIVE VS REACTIVE ────────────────────────────────────────────────────────
function ActiveVsReactiveSection() {
  const reactive = [
    ["Fault starts developing", "Internal wear, refrigerant loss, filter buildup"],
    ["Hours or days pass", "Nobody knows yet"],
    ["Threshold trip or manual inspection", "Generic alarm — no context"],
    ["Expert called in", "Manual diagnosis, guesswork"],
    ["Root cause found (maybe)", "Hours of investigation"],
    ["Fix applied", "System recovers"],
  ];
  const active = [
    ["AI detects deviation", "σ crosses 1.2 — 45 minutes before any alarm"],
    ["Fault hypothesis generated", "78% probability: Refrigerant Leak"],
    ["Plain English alert fires", "'Efficiency dropping — schedule tech visit within 24h'"],
    ["Any team member can investigate", "Click, type a question, get an answer"],
    ["Guided root cause in minutes", "Evidence already assembled"],
    ["Fix applied, log auto-updated", "System + AI knowledge improves"],
  ];
  const row = (items, color, i) => (
    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", opacity: i === 1 ? 0.4 : 1 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${color}50`, background: color + "15", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ ...MONO, fontSize: 8, color }}>{i + 1}</span>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: i === 1 ? T.dim : T.text }}>{items[0]}</div>
        <div style={{ ...MONO, fontSize: 9, color: T.muted }}>{items[1]}</div>
      </div>
    </div>
  );

  return (
    <section style={{ padding: "34px 64px 46px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontSize: 38, fontWeight: 750, marginBottom: 0, letterSpacing: -1 }}>
        Watching vs <span style={{ color: T.amber }}>understanding</span>
      </h2>
      <GoalLine>Make the difference obvious: alarms + experts vs continuous detection + guided action.</GoalLine>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Tag color={T.muted}>TRADITIONAL</Tag>
            <span style={{ ...MONO, fontSize: 10, color: T.dim }}>reactive</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, lineHeight: 1.7, fontSize: 13 }}>
            <li>Fault develops → noticed late</li>
            <li>Generic alarms (no context)</li>
            <li>Diagnosis lives in one expert’s head</li>
          </ul>
          <div style={{ marginTop: 10, ...MONO, fontSize: 9, color: T.red }}>Typical response: hours</div>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.amber}30`, borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Tag color={T.amber}>ACTIVE AI</Tag>
            <span style={{ ...MONO, fontSize: 10, color: T.amber }}>continuous</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: T.muted, lineHeight: 1.7, fontSize: 13 }}>
            <li>Deviation detected early (σ rising)</li>
            <li>Hypotheses + evidence in one click</li>
            <li>Plain-English action for the whole team</li>
          </ul>
          <div style={{ marginTop: 10, ...MONO, fontSize: 9, color: T.green }}>Typical response: minutes</div>
        </div>
      </div>

      <Details summary="Full walkthrough (traditional vs active)">
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Reactive */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <Tag color={T.muted}>TRADITIONAL</Tag>
              <span style={{ ...MONO, fontSize: 10, color: T.dim }}>reactive loop</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {reactive.map((r, i) => row(r, T.muted, i))}
            </div>
            <div style={{ marginTop: 24, padding: "10px 14px", background: T.red + "12", border: `1px solid ${T.red}30`, borderRadius: 4 }}>
              <span style={{ ...MONO, fontSize: 9, color: T.red }}>avg. response: 4–24 hours · requires specialist</span>
            </div>
          </div>

          {/* Active */}
          <div style={{ background: T.card, border: `1px solid ${T.amber}30`, borderRadius: 8, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <Tag color={T.amber}>ACTIVE AI</Tag>
              <span style={{ ...MONO, fontSize: 10, color: T.amber }}>continuous intelligence</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {active.map((r, i) => row(r, T.amber, i))}
            </div>
            <div style={{ marginTop: 24, padding: "10px 14px", background: T.green + "12", border: `1px solid ${T.green}30`, borderRadius: 4 }}>
              <span style={{ ...MONO, fontSize: 9, color: T.green }}>avg. response: minutes · usable by anyone</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, padding: "16px 18px", background: T.amber + "10", border: `1px solid ${T.amber}25`, borderRadius: 8, maxWidth: 760 }}>
          <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.6 }}>
            The insight: <span style={{ color: T.amber }}>the data has always been there.</span> The missing piece was interpretation—turning readings into actions anyone can take.
          </span>
        </div>
      </Details>
    </section>
  );
}

// ── HVAC EXPLAINER ────────────────────────────────────────────────────────────
function HVACExplainerSection() {
  return (
    <section style={{ padding: "48px 64px 72px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontSize: 42, fontWeight: 700, marginBottom: 12, letterSpacing: -1 }}>
        What the system<br /><span style={{ color: T.amber }}>actually does.</span>
      </h2>
      <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.65, maxWidth: 580, marginBottom: 40, fontWeight: 300 }}>
        Three components, two water loops, one job: move heat from inside the building to outside air. Every KPI we track maps directly to how well this chain is working.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28, alignItems: "start" }}>
        {/* SVG Diagram */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20 }}>
          <svg width="100%" viewBox="0 0 540 350" style={{ display: "block" }}>
            <defs>
              <marker id="dn2" viewBox="0 0 8 8" refX="4" refY="7" markerWidth="5" markerHeight="5" orient="auto">
                <polygon points="0,0 8,0 4,8" fill={T.blue} />
              </marker>
              <marker id="up2" viewBox="0 0 8 8" refX="4" refY="1" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <polygon points="0,8 8,8 4,0" fill={T.amber} />
              </marker>
              <marker id="out2" viewBox="0 0 8 8" refX="4" refY="7" markerWidth="5" markerHeight="5" orient="auto">
                <polygon points="0,0 8,0 4,8" fill={T.green} />
              </marker>
            </defs>

            {/* Atmosphere */}
            <text x="270" y="18" textAnchor="middle" fill={T.dim} fontSize="9" fontFamily="monospace" letterSpacing="2">ATMOSPHERE</text>
            <line x1="100" y1="22" x2="200" y2="22" stroke={T.dim} strokeWidth="0.5" />
            <line x1="340" y1="22" x2="440" y2="22" stroke={T.dim} strokeWidth="0.5" />
            <line x1="270" y1="36" x2="270" y2="22" stroke={T.green} strokeWidth="1.5" markerEnd="url(#out2)" />
            <text x="280" y="35" fill={T.green} fontSize="8" fontFamily="monospace">heat rejected ↑</text>

            {/* Cooling Tower */}
            <rect x="60" y="40" width="420" height="60" rx="5" fill={T.card} stroke={T.blue} strokeWidth="0.8" />
            <text x="74" y="58" fill={T.muted} fontSize="7" letterSpacing="2" fontFamily="monospace">COOLING TOWER</text>
            <text x="74" y="75" fill={T.text} fontSize="13" fontWeight="700" fontFamily="monospace">fan + evaporation</text>
            <text x="255" y="75" fill={T.muted} fontSize="9" fontFamily="monospace">cools hot water with ambient air</text>
            <text x="74" y="91" fill={T.dim} fontSize="8" fontFamily="monospace">approach ΔT = how close outlet gets to ambient (key efficiency metric)</text>

            {/* Pipe CT ↔ Chiller */}
            <line x1="110" y1="100" x2="110" y2="128" stroke={T.blue}  strokeWidth="2" markerEnd="url(#dn2)" />
            <line x1="430" y1="128" x2="430" y2="100" stroke={T.amber} strokeWidth="1.5" markerEnd="url(#up2)" />
            <text x="118" y="118" fill={T.blue}  fontSize="8" fontFamily="monospace">cooled water 24.6°C</text>
            <text x="250" y="118" fill={T.muted}  fontSize="7" fontFamily="monospace" textAnchor="middle">condenser water loop</text>
            <text x="438" y="118" fill={T.amber} fontSize="8" fontFamily="monospace">hot water 30.1°C</text>

            {/* Chiller */}
            <rect x="60" y="130" width="420" height="60" rx="5" fill={T.card} stroke={T.amber} strokeWidth="0.8" />
            <text x="74" y="148" fill={T.muted} fontSize="7" letterSpacing="2" fontFamily="monospace">CHILLER</text>
            <text x="74" y="165" fill={T.text} fontSize="13" fontWeight="700" fontFamily="monospace">compressor + refrigerant</text>
            <text x="265" y="165" fill={T.muted} fontSize="9" fontFamily="monospace">phase-change cycle removes heat</text>
            <text x="74" y="181" fill={T.dim} fontSize="8" fontFamily="monospace">COP = cooling output / electricity used  ·  target: 4.1</text>

            {/* Pipe Chiller ↔ AHU */}
            <line x1="110" y1="190" x2="110" y2="218" stroke={T.blue}  strokeWidth="2" markerEnd="url(#dn2)" />
            <line x1="430" y1="218" x2="430" y2="190" stroke={T.amber} strokeWidth="1.5" markerEnd="url(#up2)" />
            <text x="118" y="208" fill={T.blue}  fontSize="8" fontFamily="monospace">chilled water 7.2°C</text>
            <text x="250" y="208" fill={T.muted}  fontSize="7" fontFamily="monospace" textAnchor="middle">chilled water loop</text>
            <text x="438" y="208" fill={T.amber} fontSize="8" fontFamily="monospace">warm return 12.5°C</text>

            {/* AHU */}
            <rect x="60" y="220" width="420" height="60" rx="5" fill={T.card} stroke={T.green} strokeWidth="0.8" />
            <text x="74" y="238" fill={T.muted} fontSize="7" letterSpacing="2" fontFamily="monospace">AIR HANDLING UNIT</text>
            <text x="74" y="255" fill={T.text} fontSize="13" fontWeight="700" fontFamily="monospace">coils + fan</text>
            <text x="195" y="255" fill={T.muted} fontSize="9" fontFamily="monospace">blows room air over chilled coils</text>
            <text x="74" y="271" fill={T.dim} fontSize="8" fontFamily="monospace">supply air: 16°C  ·  airflow: 4500 CFM  ·  return: 24°C</text>

            {/* Room air arrows */}
            <line x1="270" y1="280" x2="270" y2="306" stroke={T.green} strokeWidth="1.5" markerEnd="url(#out2)" />
            <text x="280" y="298" fill={T.green} fontSize="8" fontFamily="monospace">cooled air → rooms</text>
            <line x1="160" y1="306" x2="160" y2="280" stroke={T.dim} strokeWidth="1" markerEnd="url(#up2)" />
            <text x="168" y="298" fill={T.dim} fontSize="8" fontFamily="monospace">warm return</text>

            {/* Heat path annotation */}
            <text x="540" y="175" fill={T.dim} fontSize="8" fontFamily="monospace" textAnchor="end">heat travels</text>
            <text x="540" y="188" fill={T.dim} fontSize="8" fontFamily="monospace" textAnchor="end">room → AHU →</text>
            <text x="540" y="201" fill={T.dim} fontSize="8" fontFamily="monospace" textAnchor="end">chiller → tower →</text>
            <text x="540" y="214" fill={T.dim} fontSize="8" fontFamily="monospace" textAnchor="end">atmosphere</text>
          </svg>
        </div>

        {/* Callouts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { comp: "Cooling Tower", color: T.blue,  metric: "Approach ΔT",   body: "How close the cooled water gets to ambient air temperature. A rising gap = fan degradation or tube fouling." },
            { comp: "Chiller",       color: T.amber, metric: "COP + Pressure", body: "COP is your efficiency score. Refrigerant pressure tells you if the refrigerant circuit is intact. Both drift when faults develop." },
            { comp: "AHU",           color: T.green, metric: "Airflow CFM",    body: "If airflow drops with fan RPM stable, the filter is clogging. If RPM drops, the fan itself is degrading." },
            { comp: "All components",color: T.muted, metric: "Divergence σ",   body: "AI compares every sensor against its physics model baseline. When any metric drifts, σ climbs. Alert fires at 2.5σ." },
          ].map((c, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: "12px 14px" }}>
              <div style={{ display: "flex", justify: "space-between", alignItems: "baseline", marginBottom: 5, gap: 8 }}>
                <span style={{ ...MONO, fontSize: 8, color: c.color, letterSpacing: 1 }}>{c.comp.toUpperCase()}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: c.color, marginLeft: "auto" }}>{c.metric}</span>
              </div>
              <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, margin: 0 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── KPI SECTION ───────────────────────────────────────────────────────────────
function KPISection() {
  const kpis = [
    {
      name: "COP",
      full: "Coefficient of Performance",
      color: T.green,
      what: "Cooling output divided by electricity consumed. A COP of 4.1 means 4.1 units of cooling per unit of electricity.",
      good: "3.8 – 4.4",
      design: "4.1",
      alert: "< 3.8",
      why: "Trending downward usually signals refrigerant loss, compressor wear, or dirty condenser coils. Every 0.1 drop costs ~£80/day in wasted electricity.",
      visual: (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 36 }}>
          {[4.52, 4.18, 4.01, 3.84, 3.71, 3.44].map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${(v / 4.6) * 100}%`, background: i === 1 ? T.green : T.dim, borderRadius: 2, transition: "height 0.5s" }} />
          ))}
        </div>
      ),
    },
    {
      name: "Power Draw",
      full: "Actual kW vs Physics Model",
      color: T.blue,
      what: "The AI runs a physics model that predicts what the chiller should consume at any given load. The gap between actual and predicted is the signal.",
      good: "±3% of model",
      design: "185 kW",
      alert: "> +8%",
      why: "Rising above the model means the chiller is working harder than it should to deliver the same cooling — a classic sign of internal degradation before efficiency has visibly dropped.",
      visual: (
        <div style={{ position: "relative", height: 36 }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: T.dim, borderRadius: 2 }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "55%", height: "60%", background: T.blue + "80", borderRadius: 2 }} />
          <div style={{ ...MONO, position: "absolute", top: 0, right: 4, fontSize: 9, color: T.muted }}>model</div>
          <div style={{ ...MONO, position: "absolute", bottom: 0, left: 4, fontSize: 9, color: T.blue }}>actual</div>
        </div>
      ),
    },
    {
      name: "Fouling Rf",
      full: "Thermal Resistance (m²K/W)",
      color: T.amber,
      what: "Scale, mineral deposits, and biofilm build up inside heat exchanger tubes over time. Rf measures this as thermal resistance — how hard it is for heat to transfer.",
      good: "0 – 100 ×10⁻⁶",
      design: "ASHRAE: 176×10⁻⁶",
      alert: "> 140×10⁻⁶",
      why: "Rf is slow and predictable — it only goes up. That makes it ideal for scheduling maintenance proactively, before efficiency loss becomes costly. We track it in real time.",
      visual: (
        <div style={{ height: 36, background: T.dim, borderRadius: 2, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${T.green}50 0%, ${T.amber}70 50%, ${T.red}90 85%)`, borderRadius: 2 }} />
          <div style={{ position: "absolute", top: "50%", left: "3.5%", transform: "translateY(-50%)", width: 2, height: "70%", background: "#fff" }} />
          <div style={{ ...MONO, position: "absolute", top: 2, right: 4, fontSize: 8, color: "#fff80" }}>now: 3.2 / 176</div>
        </div>
      ),
    },
    {
      name: "Divergence σ",
      full: "Model Divergence Score",
      color: T.muted,
      what: "For every sensor, we compute how far the current reading deviates from what the physics model predicts. σ is the peak deviation, normalised to standard deviations.",
      good: "0 – 1.5σ",
      design: "Alert: 2.5σ",
      alert: "> 2.5σ",
      why: "This is the early warning system. A refrigerant leak won't trigger a COP alarm for hours — but σ starts climbing within minutes of the fault beginning, because the sensor readings begin to diverge from their predicted values.",
      visual: (
        <svg width="100%" height="36" viewBox="0 0 160 36">
          <polyline points="0,28 20,26 40,25 60,23 80,22 100,18 120,12 140,6 160,4" fill="none" stroke={T.muted} strokeWidth="1.5" />
          <line x1="0" y1="10" x2="160" y2="10" stroke={T.red} strokeDasharray="4 4" strokeWidth="1" />
          <text x="140" y="8" fill={T.red} fontSize="7" fontFamily="monospace">2.5σ</text>
        </svg>
      ),
    },
  ];

  return (
    <section style={{ padding: "34px 64px 46px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontSize: 38, fontWeight: 750, marginBottom: 0, letterSpacing: -1 }}>
        The 4 KPIs that <span style={{ color: T.amber }}>drive action</span>
      </h2>
      <GoalLine>Make the dashboard legible in one scan: “what’s healthy”, “what’s off”, “what to do next”.</GoalLine>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "16px 16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: k.color }}>{k.name}</span>
              <span style={{ ...MONO, fontSize: 9, color: T.muted }}>{k.full}</span>
            </div>
            <div style={{ marginBottom: 12 }}>{k.visual}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <div style={{ ...MONO, fontSize: 9, color: T.green, background: T.green + "15", border: `1px solid ${T.green}30`, borderRadius: 3, padding: "2px 7px" }}>GOOD: {k.good}</div>
              <div style={{ ...MONO, fontSize: 9, color: T.blue,  background: T.blue  + "15", border: `1px solid ${T.blue}30`,  borderRadius: 3, padding: "2px 7px" }}>TARGET: {k.design}</div>
              <div style={{ ...MONO, fontSize: 9, color: T.red,   background: T.red   + "15", border: `1px solid ${T.red}30`,   borderRadius: 3, padding: "2px 7px" }}>ALERT: {k.alert}</div>
            </div>
            <Details summary="What it means + why it matters">
              <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.65, margin: "0 0 10px" }}>{k.what}</p>
              <div style={{ fontSize: 12, color: T.amber, lineHeight: 1.6, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                {k.why}
              </div>
            </Details>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── DEMO ARCHITECTURE ─────────────────────────────────────────────────────────
function DemoArchSection() {
  return (
    <section style={{ padding: "34px 64px 46px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontSize: 38, fontWeight: 750, marginBottom: 0, letterSpacing: -1 }}>
        How the demo is <span style={{ color: T.amber }}>wired</span>
      </h2>
      <GoalLine>Clarify what’s “simulated” vs what’s real (the reasoning + UX patterns).</GoalLine>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          {[
            { t: "Simulated telemetry", d: "Sensor noise + slow drift faults (realistic dynamics)." },
            { t: "Real UX loop", d: "KPIs → alert → deep dive → action." },
            { t: "Real LLM calls", d: "Chat + analysis run on live readings + KB." },
          ].map((c) => (
            <div key={c.t} style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 10px" }}>
              <div style={{ fontSize: 13, fontWeight: 750 }}>{c.t}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: T.muted, lineHeight: 1.55 }}>{c.d}</div>
            </div>
          ))}
        </div>

        <Details summary="Architecture diagram + full explanation">
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24 }}>
            {/* Architecture diagram */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20 }}>
              <div style={{ ...MONO, fontSize: 8, color: T.muted, letterSpacing: 2, marginBottom: 16 }}>DEMO ARCHITECTURE</div>
              <svg width="100%" viewBox="0 0 440 280" style={{ display: "block" }}>
            <defs>
              <marker id="arc" viewBox="0 0 8 8" refX="4" refY="7" markerWidth="5" markerHeight="5" orient="auto">
                <polygon points="0,0 8,0 4,8" fill={T.muted} />
              </marker>
            </defs>

            {/* Mock Data Generator */}
            <rect x="20" y="20" width="180" height="65" rx="4" fill={T.card} stroke={T.border} strokeWidth="1" />
            <text x="32" y="38" fill={T.muted} fontSize="7" letterSpacing="2" fontFamily="monospace">MOCK DATA GENERATOR</text>
            <text x="32" y="55" fill={T.text} fontSize="10" fontWeight="600" fontFamily="monospace">random walk</text>
            <text x="32" y="69" fill={T.dim} fontSize="8" fontFamily="monospace">±0.09 noise + reversion to base</text>
            <text x="32" y="79" fill={T.dim} fontSize="8" fontFamily="monospace">1 tick per second</text>

            {/* Fault Injection */}
            <rect x="20" y="108" width="180" height="65" rx="4" fill={T.card} stroke={T.amber} strokeWidth="0.8" />
            <text x="32" y="126" fill={T.amber} fontSize="7" letterSpacing="2" fontFamily="monospace">FAULT INJECTION</text>
            <text x="32" y="143" fill={T.text} fontSize="10" fontWeight="600" fontFamily="monospace">continuous drift</text>
            <text x="32" y="157" fill={T.dim} fontSize="8" fontFamily="monospace">delta applied per tick to</text>
            <text x="32" y="167" fill={T.dim} fontSize="8" fontFamily="monospace">one component.metric</text>

            {/* Arrows left → middle */}
            <line x1="200" y1="52"  x2="240" y2="72"  stroke={T.muted} strokeWidth="1" markerEnd="url(#arc)" />
            <line x1="200" y1="140" x2="240" y2="120" stroke={T.amber} strokeWidth="1" markerEnd="url(#arc)" />

            {/* React State */}
            <rect x="240" y="72" width="180" height="70" rx="4" fill={T.card} stroke={T.blue} strokeWidth="0.8" />
            <text x="252" y="90" fill={T.blue} fontSize="7" letterSpacing="2" fontFamily="monospace">REACT STATE</text>
            <text x="252" y="107" fill={T.text} fontSize="10" fontWeight="600" fontFamily="monospace">rolling 90s buffer</text>
            <text x="252" y="121" fill={T.dim} fontSize="8" fontFamily="monospace">derived KPIs computed</text>
            <text x="252" y="131" fill={T.dim} fontSize="8" fontFamily="monospace">divergence sigma tracked</text>

            {/* Arrow → Dashboard */}
            <line x1="330" y1="142" x2="330" y2="164" stroke={T.muted} strokeWidth="1" markerEnd="url(#arc)" />

            {/* Dashboard UI */}
            <rect x="240" y="164" width="180" height="55" rx="4" fill={T.card} stroke={T.green} strokeWidth="0.8" />
            <text x="252" y="182" fill={T.green} fontSize="7" letterSpacing="2" fontFamily="monospace">DASHBOARD UI</text>
            <text x="252" y="199" fill={T.text} fontSize="10" fontWeight="600" fontFamily="monospace">CHL-03 twin</text>
            <text x="252" y="211" fill={T.dim} fontSize="8" fontFamily="monospace">recharts + live derived KPIs</text>

            {/* Arrow dashboard ↔ AI */}
            <line x1="330" y1="219" x2="330" y2="240" stroke={T.muted} strokeWidth="1" markerEnd="url(#arc)" />

            {/* Claude API */}
            <rect x="240" y="240" width="180" height="28" rx="4" fill={T.amber + "15"} stroke={T.amber} strokeWidth="0.8" />
            <text x="252" y="258" fill={T.amber} fontSize="9" fontWeight="600" fontFamily="monospace">Claude Sonnet via API</text>

            {/* Labels */}
            <text x="20" y="192" fill={T.muted} fontSize="8" fontFamily="monospace">fires on fault</text>
            <text x="20" y="202" fill={T.muted} fontSize="8" fontFamily="monospace">injection or</text>
            <text x="20" y="212" fill={T.muted} fontSize="8" fontFamily="monospace">user message</text>
            <line x1="200" y1="240" x2="240" y2="252" stroke={T.amber} strokeWidth="1" strokeDasharray="4 4" />
              </svg>
            </div>

            {/* Explanation */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Fake data, real dynamics", color: T.blue, body: "Random-walk noise around BASE values, plus gentle reversion. Looks like real sensors." },
                { label: "Faults drift (not spikes)", color: T.amber, body: "We apply continuous drift so the early-warning story is believable." },
                { label: "“Model” is baseline", color: T.muted, body: "For the demo, BASE is the reference. The gap is the signal." },
                { label: "AI is real", color: T.green, body: "Alerts + chat are real LLM calls over live readings and a KB prompt." },
              ].map((c, i) => (
                <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ ...MONO, fontSize: 9, color: c.color, letterSpacing: 1, marginBottom: 5 }}>{c.label.toUpperCase()}</div>
                  <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.65, margin: 0 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Details>
      </div>
    </section>
  );
}

// ── AI ENABLES EVERYONE ───────────────────────────────────────────────────────
function AIEnablesSection() {
  const qa = [
    { role: "Facilities Manager",  q: "System health?", a: "COP is at 4.18 — slightly above design. Power draw is within 2% of model. One thing worth watching: fouling Rf is trending up slowly. Worth scheduling a tube clean in the next 200 hours." },
    { role: "Building Owner",      q: "Is anything costing us money?", a: "Nothing urgent. The chiller is running efficiently. Your best lever right now is the setpoint optimisation — raising CHW from 7.2°C to 8.2°C would cut compressor work by 11% at today's load factor. Est. £22/day." },
    { role: "New technician",      q: "What's COP and why is 4.1 the target?", a: "COP is how efficient your chiller is — it's the ratio of cooling delivered to electricity consumed. 4.1 is the manufacturer's design rating at this load. Higher is better. Right now you're at 4.18, so slightly above target." },
    { role: "Sustainability lead",  q: "Best time to run the system hard today?", a: "Grid carbon is 182 gCO2/kWh right now vs a 245 average. Run hard now and pre-cool before 14:00 — peak tariff kicks in then. Estimated demand charge saving of £280 if you pre-cool during the 11:00–14:00 window." },
  ];

  const primary = qa.slice(0, 2);

  return (
    <section style={{ padding: "34px 64px 46px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontSize: 38, fontWeight: 750, marginBottom: 0, letterSpacing: -1 }}>
        Ask like a human. Get an <span style={{ color: T.amber }}>action</span>.
      </h2>
      <GoalLine>Make expertise accessible: different roles ask different questions, all get usable answers.</GoalLine>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {primary.map((item, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "18px 20px" }}>
            <div style={{ ...MONO, fontSize: 9, color: T.amber, marginBottom: 10 }}>{item.role.toUpperCase()}</div>
            {/* User message */}
            <div style={{ background: "#0e1e38", border: "1px solid #1d4ed860", borderRadius: 5, padding: "7px 10px", fontSize: 12, color: "#bfdbfe", marginBottom: 8 }}>{item.q}</div>
            {/* AI response */}
            <div style={{ background: "#0c1220", border: `1px solid ${T.border}`, borderRadius: 5, padding: "7px 10px" }}>
              <div style={{ ...MONO, fontSize: 7, color: T.muted, marginBottom: 3, letterSpacing: 1 }}>AI ASSISTANT</div>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.65 }}>{item.a}</div>
            </div>
          </div>
        ))}
      </div>

      <Details summary="More example questions (other roles)">
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {qa.slice(2).map((item, i) => (
            <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "18px 20px" }}>
              <div style={{ ...MONO, fontSize: 9, color: T.amber, marginBottom: 10 }}>{item.role.toUpperCase()}</div>
              <div style={{ background: "#0e1e38", border: "1px solid #1d4ed860", borderRadius: 5, padding: "7px 10px", fontSize: 12, color: "#bfdbfe", marginBottom: 8 }}>{item.q}</div>
              <div style={{ background: "#0c1220", border: `1px solid ${T.border}`, borderRadius: 5, padding: "7px 10px" }}>
                <div style={{ ...MONO, fontSize: 7, color: T.muted, marginBottom: 3, letterSpacing: 1 }}>AI ASSISTANT</div>
                <div style={{ fontSize: 12, color: T.text, lineHeight: 1.65 }}>{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </Details>

      <div style={{ marginTop: 18, padding: "16px 18px", background: T.amber + "10", border: `1px solid ${T.amber}25`, borderRadius: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.65 }}>
          The shift: <span style={{ color: T.amber }}>HVAC expertise no longer lives in one person's head.</span> It lives in the system — accessible to the whole team, 24/7, in plain language.
        </div>
      </div>
    </section>
  );
}

// ── REAL SYSTEMS ──────────────────────────────────────────────────────────────
function RealSystemsSection() {
  return (
    <section style={{ padding: "34px 64px 46px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontSize: 38, fontWeight: 750, marginBottom: 0, letterSpacing: -1 }}>
        Production: AI that <span style={{ color: T.amber }}>learns</span>
      </h2>
      <GoalLine>Explain the upgrade path: from a static prompt to building-specific knowledge via RAG.</GoalLine>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          {[
            { t: "Demo", d: "Hardcoded KB (great for known signatures)." },
            { t: "Production", d: "RAG over manuals + history + maintenance." },
            { t: "Outcome", d: "Answers grounded in your actual equipment + past fixes." },
          ].map((c) => (
            <div key={c.t} style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 10px" }}>
              <div style={{ fontSize: 13, fontWeight: 750 }}>{c.t}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: T.muted, lineHeight: 1.55 }}>{c.d}</div>
            </div>
          ))}
        </div>

        <Details summary="Comparison + production architecture">
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
            {/* Comparison: demo KB vs production RAG */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "18px 20px" }}>
                <Tag color={T.muted}>THIS DEMO</Tag>
                <div style={{ marginTop: 12, marginBottom: 10, fontSize: 14, fontWeight: 600 }}>Hardcoded knowledge base</div>
                <div style={{ ...MONO, fontSize: 9, color: T.muted, lineHeight: 2 }}>
                  {"// system prompt, written by hand"}<br />
                  {"const KB = `Fault signatures:"}<br />
                  {"- Refrigerant leak = efficiency falling..."}<br />
                  {"Normal ranges: COP 3.8–4.4...`"}
                </div>
                <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.65, marginTop: 12, marginBottom: 0 }}>Works well for known fault types. Static. Doesn’t learn building history.</p>
              </div>

              <div style={{ background: T.card, border: `1px solid ${T.amber}30`, borderRadius: 8, padding: "18px 20px" }}>
                <Tag color={T.amber}>PRODUCTION</Tag>
                <div style={{ marginTop: 12, marginBottom: 10, fontSize: 14, fontWeight: 600 }}>RAG-augmented knowledge base</div>
                <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.65, margin: "0 0 12px" }}>Retrieve the most relevant building-specific context at query time.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    ["OEM manuals", "fault codes, curves, service intervals"],
                    ["Fault + resolution logs", "what fixed it last time"],
                    ["Maintenance records", "what was serviced and when"],
                    ["Standards + config", "ranges, constraints, tariffs"],
                  ].map(([title, sub], i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.amber, marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.amber }}>{title}</span>
                        <span style={{ fontSize: 11, color: T.muted }}> — {sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Production Architecture SVG */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20 }}>
              <div style={{ ...MONO, fontSize: 8, color: T.muted, letterSpacing: 2, marginBottom: 16 }}>PRODUCTION ARCHITECTURE</div>
              <svg width="100%" viewBox="0 0 380 340" style={{ display: "block" }}>
            <defs>
              <marker id="arcP" viewBox="0 0 8 8" refX="4" refY="7" markerWidth="5" markerHeight="5" orient="auto">
                <polygon points="0,0 8,0 4,8" fill={T.muted} />
              </marker>
            </defs>

            {/* Sensors */}
            <rect x="10" y="10" width="360" height="38" rx="4" fill={T.card} stroke={T.blue} strokeWidth="0.8" />
            <text x="20" y="24" fill={T.blue} fontSize="7" letterSpacing="2" fontFamily="monospace">REAL SENSORS</text>
            <text x="20" y="39" fill={T.muted} fontSize="8" fontFamily="monospace">BACnet / Modbus / MQTT · 1s intervals · 20+ data points per chiller</text>
            <line x1="190" y1="48" x2="190" y2="66" stroke={T.muted} strokeWidth="1" markerEnd="url(#arcP)" />

            {/* TimescaleDB */}
            <rect x="10" y="66" width="360" height="38" rx="4" fill={T.card} stroke={T.border} strokeWidth="1" />
            <text x="20" y="80" fill={T.muted} fontSize="7" letterSpacing="2" fontFamily="monospace">TIME SERIES DATABASE</text>
            <text x="20" y="95" fill={T.muted} fontSize="8" fontFamily="monospace">TimescaleDB · continuous aggregates · anomaly pre-processing</text>
            <line x1="190" y1="104" x2="190" y2="122" stroke={T.muted} strokeWidth="1" markerEnd="url(#arcP)" />

            {/* RAG Pipeline */}
            <rect x="10" y="122" width="360" height="80" rx="4" fill={T.card} stroke={T.amber} strokeWidth="0.8" />
            <text x="20" y="138" fill={T.amber} fontSize="7" letterSpacing="2" fontFamily="monospace">RAG PIPELINE</text>
            <text x="20" y="155" fill={T.text} fontSize="10" fontWeight="600" fontFamily="monospace">semantic retrieval from document store</text>

            {/* Document store items */}
            {["OEM manuals", "fault + resolution history", "maintenance logs", "ASHRAE standards"].map((s, i) => (
              <g key={i}>
                <rect x={20 + i * 84} y="162" width="78" height="30" rx="3" fill={T.dim} />
                <text x={59 + i * 84} y="172" fill={T.muted} fontSize="7" fontFamily="monospace" textAnchor="middle">{s.split(" ")[0]}</text>
                <text x={59 + i * 84} y="183" fill={T.muted} fontSize="7" fontFamily="monospace" textAnchor="middle">{s.split(" ").slice(1).join(" ")}</text>
              </g>
            ))}
            <text x="20" y="210" fill={T.dim} fontSize="8" fontFamily="monospace">query → embed → vector search → top-k relevant chunks</text>

            <line x1="190" y1="202" x2="190" y2="222" stroke={T.amber} strokeWidth="1" markerEnd="url(#arcP)" />

            {/* Claude */}
            <rect x="10" y="222" width="360" height="50" rx="4" fill={T.amber + "15"} stroke={T.amber} strokeWidth="0.8" />
            <text x="20" y="240" fill={T.amber} fontSize="7" letterSpacing="2" fontFamily="monospace">CLAUDE SONNET + RETRIEVED CONTEXT</text>
            <text x="20" y="258" fill={T.text} fontSize="10" fontWeight="600" fontFamily="monospace">expert-level analysis + action plan</text>
            <text x="20" y="270" fill={T.muted} fontSize="8" fontFamily="monospace">grounded in your equipment history, not just generic theory</text>

            <line x1="190" y1="272" x2="190" y2="292" stroke={T.amber} strokeWidth="1" markerEnd="url(#arcP)" />

            {/* Output */}
            <rect x="10" y="292" width="360" height="38" rx="4" fill={T.card} stroke={T.green} strokeWidth="0.8" />
            <text x="20" y="308" fill={T.green} fontSize="7" letterSpacing="2" fontFamily="monospace">DASHBOARD + CHAT</text>
            <text x="20" y="322" fill={T.muted} fontSize="8" fontFamily="monospace">same interface · richer analysis · learns from every incident</text>
              </svg>
            </div>
          </div>
        </Details>
      </div>

      <div style={{ marginTop: 18, padding: "16px 18px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10 }}>
        <div style={{ ...MONO, fontSize: 9, color: T.amber, marginBottom: 6 }}>THE KEY UPGRADE</div>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, margin: 0 }}>
          With hardcoded KB: <em style={{ color: T.text }}>AI knows generic HVAC theory.</em> &nbsp;·&nbsp;
          With RAG: <em style={{ color: T.amber }}>AI knows your specific chiller, your maintenance history, and what actually worked the last time this fault occurred.</em> Every resolved incident makes the system smarter for the next one.
        </p>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTASection() {
  const [hov, setHov] = useState(false);
  return (
    <section style={{ padding: "56px 64px 90px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
      <div style={{ ...MONO, fontSize: 10, color: T.amber, letterSpacing: 4, marginBottom: 20 }}>LIVE DEMO</div>
      <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.2, marginBottom: 14, lineHeight: 1.1 }}>
        See it in action.
      </h2>
      <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.65, maxWidth: 620, margin: "0 auto 28px", fontWeight: 300 }}>
        Inject a fault. Watch the divergence climb. Ask the AI anything. The whole system — fake data, real intelligence.
      </p>
      <button
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? T.amber : "transparent",
          border: `2px solid ${T.amber}`,
          color: hov ? "#000" : T.amber,
          padding: "16px 48px",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 2,
          transition: "all 0.2s",
          ...MONO,
        }}
      >
        LAUNCH CHL-03 LIVE DEMO →
      </button>
      <div style={{ maxWidth: 680, margin: "22px auto 0", textAlign: "left" }}>
        <Details summary="Demo script (optional)">
          <div style={{ padding: "16px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10 }}>
            <div style={{ ...MONO, fontSize: 9, color: T.muted, letterSpacing: 2, marginBottom: 12 }}>DEMO SCRIPT</div>
            {[
              ["1", "Start on the live dashboard — all green, divergence ~0.4σ"],
              ["2", "Click 'Refrigerant Leak' in the fault injection panel"],
              ["3", "Watch: COP drops below design, divergence climbs toward 2.5σ over ~65s"],
              ["4", "AI alert fires automatically — click 'DEEP DIVE' for full analysis"],
              ["5", "Use chat: ask 'What's happening?' or 'How urgent is this?'"],
              ["6", "Click fault button again to resolve — everything reverts"],
            ].map(([n, step]) => (
              <div key={n} style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                <span style={{ ...MONO, fontSize: 9, color: T.amber, flexShrink: 0 }}>{n}</span>
                <span style={{ fontSize: 13, color: T.muted, lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
        </Details>
      </div>
    </section>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => { loadFonts(); }, []);

  return (
    <div style={{ ...SANS, background: T.bg, color: T.text, overflowX: "hidden", minHeight: "100vh" }}>
      {/* Subtle grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(${T.border}33 1px, transparent 1px), linear-gradient(90deg, ${T.border}33 1px, transparent 1px)`,
        backgroundSize: "52px 52px",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <HeroSection />
        <SectionNum n="01" label="THE SHIFT" />
        <ActiveVsReactiveSection />
        <SectionNum n="02" label="THE SYSTEM" />
        <HVACExplainerSection />
        <SectionNum n="03" label="THE METRICS" />
        <KPISection />
        <SectionNum n="04" label="HOW IT WAS BUILT" />
        <DemoArchSection />
        <SectionNum n="05" label="WHAT AI ENABLES" />
        <AIEnablesSection />
        <SectionNum n="06" label="REAL SYSTEMS + RAG" />
        <RealSystemsSection />
        <CTASection />
      </div>
    </div>
  );
}
