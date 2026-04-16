import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const KB = `You are an expert HVAC AI inside Milvian Group's platform, monitoring CHL-03 factory chiller.
FAULT SIGNATURES: Refrigerant leak = steady efficiency drop + COP below design + superheat rising. Clogged filter = AHU airflow drop with stable RPM + supply air temp rising. Fan bearing wear = cooling tower RPM drifting down + approach temp rising. High load = pressure + power rising + COP declining.
NORMAL RANGES: COP 3.8-4.4 (design 4.1) · Power 175-195 kW (model 185) · Fouling 0-176e-6 m2K/W · Divergence <2.5 sigma
Speak plainly to a facilities manager. Reference actual numbers. Be concise.`;

const BASE = {
  chiller:       { efficiency: 87,   pressure: 4.3,  inlet_temp: 12.5, outlet_temp: 7.2   },
  cooling_tower: { fan_rpm: 850,     outlet_temp: 24.6, inlet_temp: 30.1, flow_rate: 320   },
  ahu:           { airflow: 4500,    supply_air_temp: 16.0, fan_rpm: 1200, return_air_temp: 24.0 },
};

const FAULTS = {
  refrigerant_leak: {
    label: "Refrigerant Leak", comp: "chiller", metric: "efficiency", delta: -0.09,
    hyps: [
      { name: "Refrigerant leak",   pct: 78, hot: true,  ev: "down efficiency · pressures falling · up superheat" },
      { name: "Compressor wear",    pct: 14, hot: false, ev: "up current draw · suction pressure normal" },
      { name: "Condenser fouling",  pct:  8, hot: false, ev: "less likely — approach temp stable" },
    ],
  },
  filter_clog: {
    label: "Clogged Air Filter", comp: "ahu", metric: "airflow", delta: -7,
    hyps: [
      { name: "Filter clogged",     pct: 83, hot: true,  ev: "down airflow · stable RPM · up supply air temp" },
      { name: "Fan degradation",    pct: 11, hot: false, ev: "possible — monitor RPM closely" },
      { name: "Sensor drift",       pct:  6, hot: false, ev: "unlikely — multiple sensors agree" },
    ],
  },
  fan_bearing: {
    label: "Fan Bearing Wear", comp: "cooling_tower", metric: "fan_rpm", delta: -0.9,
    hyps: [
      { name: "Bearing wear",       pct: 71, hot: true,  ev: "down RPM · vibration signature elevated" },
      { name: "Belt slippage",      pct: 21, hot: false, ev: "possible — inspect belt tension" },
      { name: "Motor degradation",  pct:  8, hot: false, ev: "less likely — current normal" },
    ],
  },
  high_load: {
    label: "High Load Event", comp: "chiller", metric: "pressure", delta: +0.07,
    hyps: [
      { name: "Occupancy surge",    pct: 65, hot: true,  ev: "up pressure · up power · up return air temp" },
      { name: "Ambient temp spike", pct: 27, hot: false, ev: "check weather data — possible correlation" },
      { name: "Control fault",      pct:  8, hot: false, ev: "unlikely — actuators responding normally" },
    ],
  },
};

const FLEET_BASE = [
  { id: "CHL-01", cop: 4.52, tag: "top",   tc: "#3fb950" },
  { id: "CHL-03", cop: 4.18, tag: "you",   tc: "#58a6ff" },
  { id: "CHL-05", cop: 4.01, tag: null,    tc: null },
  { id: "CHL-02", cop: 3.84, tag: null,    tc: null },
  { id: "CHL-06", cop: 3.71, tag: "watch", tc: "#e3b341" },
  { id: "CHL-04", cop: 3.44, tag: "fault", tc: "#f85149" },
];

const AHU_FLEET_BASE = [
  { id: "AHU-01", airflow: 4500, sat: 16.0, tag: "live" },
  { id: "AHU-02", airflow: 4200, sat: 16.4, tag: null },
  { id: "AHU-03", airflow: 3950, sat: 16.8, tag: "watch" },
  { id: "AHU-04", airflow: 4650, sat: 15.9, tag: null },
];

function PlantStrip({ fleet, ahus, onOpen }) {
  const tile = ({ id, top, bottom, accent, tag, focus }) => (
    <button
      key={id}
      onClick={() => onOpen({ focus, id })}
      style={{
        ...MONO,
        cursor: "pointer",
        textAlign: "left",
        padding: "10px 10px",
        borderRadius: 6,
        border: `1px solid ${T.border}`,
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{id}</span>
        {tag && (
          <span style={{ fontSize: 8, color: accent || T.muted, background: (accent || T.muted) + "18", border: `1px solid ${(accent || T.muted)}40`, borderRadius: 10, padding: "1px 7px" }}>
            {tag}
          </span>
        )}
        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: accent || T.muted }}>{top}</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 9, color: T.muted }}>{bottom}</div>
    </button>
  );

  return (
    <div style={card({ padding: 12 })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ ...SL, marginBottom: 0 }}>PLANT — ONE LEVEL DRILL-IN</span>
        <span style={{ fontSize: 9, color: T.dim }}>click any unit</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 7, marginBottom: 10 }}>
        {fleet.map((c) => tile({
          id: c.id,
          focus: "chiller",
          tag: c.tag,
          accent: c.id === "CHL-03" ? T.blue : (c.tag === "fault" ? T.red : c.tag === "watch" ? T.amber : c.tag === "top" ? T.green : null),
          top: `COP ${c.cop.toFixed(2)}`,
          bottom: c.id === "CHL-03" ? "live sensors" : "summary only (demo)",
        }))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
        {ahus.map((a) => tile({
          id: a.id,
          focus: "ahu",
          tag: a.tag,
          accent: a.id === "AHU-01" ? T.blue : (a.tag === "watch" ? T.amber : null),
          top: `${Math.round(a.airflow)} CFM`,
          bottom: `SAT ${a.sat.toFixed(1)}°C`,
        }))}
      </div>
    </div>
  );
}

function deriveKPIs(s, rf) {
  const cop = Math.round((s.chiller.efficiency / 100) * 4.8 * 100) / 100;
  const pwr = Math.round(185 + (BASE.chiller.efficiency - s.chiller.efficiency) * 1.8);
  let maxDev = 0;
  const contributors = [];
  for (const [c, m] of Object.entries(s)) {
    for (const [k, v] of Object.entries(m)) {
      const baseline = BASE[c][k];
      const std = Math.abs(baseline) * 0.025 + 0.01;
      const dev = Math.abs(v - baseline) / std;
      contributors.push({
        comp: c,
        metric: k,
        devSigma: Math.round(dev * 100) / 100,
        value: v,
        baseline,
      });
      if (dev > maxDev) maxDev = dev;
    }
  }
  contributors.sort((a, b) => b.devSigma - a.devSigma);
  return {
    cop, pwr,
    div:     Math.round(maxDev * 100) / 100,
    rfPct:   Math.round(rf / 176 * 100),
    svcHrs:  Math.round((176 - rf) / 176 * 200),
    contributors,
  };
}

function doTick(prev, fKey) {
  const r = {};
  for (const [c, m] of Object.entries(prev)) {
    r[c] = {};
    for (const [k, v] of Object.entries(m)) {
      const noise = (Math.random() - 0.5) * 0.18;
      const rev   = (BASE[c][k] - v) * 0.007;
      const f     = fKey ? FAULTS[fKey] : null;
      const drift = (f && f.comp === c && f.metric === k) ? f.delta : 0;
      r[c][k] = Math.round((v + noise + rev + drift) * 100) / 100;
    }
  }
  return r;
}

const T = {
  bg: "#f7f9fc", card: "#ffffff", border: "#e2e8f0",
  text: "#0b1220", muted: "#4b5563", dim: "#94a3b8",
  green: "#16a34a", amber: "#b45309", red: "#dc2626", blue: "#2563eb",
};

const MONO = { fontFamily: "'JetBrains Mono','Cascadia Code','Fira Code',monospace" };
const card = (p = {}) => ({ background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, ...p });
const SL = { fontSize: 8, color: T.muted, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8, display: "block" };

function getRouteState() {
  const params = new URLSearchParams(window.location.search);
  const focusRaw = (params.get("focus") || "plant").toLowerCase();
  const focus = (focusRaw === "chiller" || focusRaw === "ahu" || focusRaw === "plant") ? focusRaw : "plant";
  const id = params.get("id") || "";
  return { focus, id };
}

function setRouteState(next, { replace = false } = {}) {
  const url = new URL(window.location.href);
  if (!next || !next.focus || next.focus === "plant") {
    url.searchParams.delete("focus");
    url.searchParams.delete("id");
  } else {
    url.searchParams.set("focus", next.focus);
    if (next.id) url.searchParams.set("id", next.id);
    else url.searchParams.delete("id");
  }
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", url.toString());
}

export default function App() {
  const [route, setRoute] = useState(getRouteState);
  const [sensors,      setSensors]      = useState(BASE);
  const [history,      setHistory]      = useState(() =>
    Array.from({ length: 72 }, (_, i) => ({
      i, cop: 4.1 + (Math.random() - .5) * .08,
      pwr: 185 + (Math.random() - .5) * 3,
      div: .35 + Math.random() * .25,
      appTemp: 24.6 + (Math.random() - .5) * .2,
      chEff: 87 + (Math.random() - .5) * 0.6,
      chPres: 4.3 + (Math.random() - .5) * 0.06,
      chwIn: 12.5 + (Math.random() - .5) * 0.3,
      chwOut: 7.2 + (Math.random() - .5) * 0.2,
      cdwIn: 30.1 + (Math.random() - .5) * 0.3,
      cdwOut: 24.6 + (Math.random() - .5) * 0.3,
      ahCfm: 4500 + (Math.random() - .5) * 80,
      ahFan: 1200 + (Math.random() - .5) * 10,
      ahSat: 16 + (Math.random() - .5) * 0.15,
      ahRat: 24 + (Math.random() - .5) * 0.2,
      zoneTemp: 23.6 + (Math.random() - .5) * 0.3,
      zoneSp: 23.5,
    }))
  );
  const [fault,        setFault]        = useState(null);
  const [rf,           setRf]           = useState(3.2);
  const [msgs,         setMsgs]         = useState([]);
  const [inp,          setInp]          = useState("");
  const [chatBusy,     setChatBusy]     = useState(false);
  const [aiAlert,      setAiAlert]      = useState(null);
  const [alertLoading, setAlertLoading] = useState(false);

  const faultRef   = useRef(fault);
  const sensorsRef = useRef(sensors);
  const rfRef      = useRef(rf);
  const chatBot    = useRef(null);

  useEffect(() => { faultRef.current   = fault;   }, [fault]);
  useEffect(() => { sensorsRef.current = sensors; }, [sensors]);
  useEffect(() => { rfRef.current      = rf;      }, [rf]);

  useEffect(() => {
    const onPopState = () => setRoute(getRouteState());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const fKey = faultRef.current;
      setSensors(prev => {
        const next = doTick(prev, fKey);
        const kpis = deriveKPIs(next, rfRef.current);
        setHistory(h => [...h.slice(-90), {
          i: h[h.length - 1].i + 1,
          cop: kpis.cop, pwr: kpis.pwr, div: kpis.div,
          appTemp: next.cooling_tower.outlet_temp,
          chEff: next.chiller.efficiency,
          chPres: next.chiller.pressure,
          chwIn: next.chiller.inlet_temp,
          chwOut: next.chiller.outlet_temp,
          cdwIn: next.cooling_tower.inlet_temp,
          cdwOut: next.cooling_tower.outlet_temp,
          ahCfm: next.ahu.airflow,
          ahFan: next.ahu.fan_rpm,
          ahSat: next.ahu.supply_air_temp,
          ahRat: next.ahu.return_air_temp,
          zoneTemp: Math.round((22.8 + (next.ahu.return_air_temp - 24.0) * 0.4 + Math.sin(h[h.length - 1].i / 10) * 0.15) * 100) / 100,
          zoneSp: 23.5,
        }]);
        return next;
      });
      setRf(r => Math.round((r + (fKey === "refrigerant_leak" ? 0.012 : 0.003)) * 1000) / 1000);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!fault) { setAiAlert(null); return; }
    setAlertLoading(true); setAiAlert(null);
    const fKey = fault;
    const kpis = deriveKPIs(sensorsRef.current, rfRef.current);
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        system: KB,
        messages: [{
          role: "user",
          content:
            `Fault: ${FAULTS[fKey].label}\n` +
            `COP: ${kpis.cop} vs design 4.1\n` +
            `Power: ${kpis.pwr}kW vs model 185kW\n` +
            `Divergence: ${kpis.div} sigma\n` +
            `Two sentences only: what is happening and what should the facilities manager do right now?`,
        }],
      }),
    })
      .then(r => r.json())
      .then(j => { setAiAlert(j.text || ""); setAlertLoading(false); })
      .catch(() => { setAiAlert("AI analysis unavailable."); setAlertLoading(false); });
  }, [fault]);

  useEffect(() => { chatBot.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const sendChat = useCallback(async (msg) => {
    if (!msg.trim() || chatBusy) return;
    const userMsg = { role: "user", content: msg };
    setMsgs(p => [...p, userMsg]);
    setChatBusy(true);
    const kpis = deriveKPIs(sensors, rf);
    const ctx  = `CHL-03 live -- COP: ${kpis.cop}/4.1, Power: ${kpis.pwr}kW vs 185kW model, Fouling Rf: ${rf.toFixed(1)}e-6 (${kpis.rfPct}% of ASHRAE limit), Divergence: ${kpis.div} sigma. Active fault: ${fault ? FAULTS[fault].label : "none"}.`;
    try {
      const text = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o",
          system: KB,
          messages: [
            { role: "user",      content: ctx },
            { role: "assistant", content: "Understood - I have all live readings. What would you like to know?" },
            ...msgs.map(m => ({ role: m.role, content: m.content })),
            userMsg,
          ],
        }),
      }).then(r => r.json()).then(j => j.text || "No response.");
      setMsgs(p => [...p, { role: "assistant", content: text }]);
    } catch { setMsgs(p => [...p, { role: "assistant", content: "Connection error." }]); }
    setChatBusy(false);
  }, [sensors, rf, fault, msgs, chatBusy]);

  const kpis     = deriveKPIs(sensors, rf);
  const fObj     = fault ? FAULTS[fault] : null;
  const cData    = history.slice(-72);
  const fleet    = FLEET_BASE.map(f => f.id === "CHL-03" ? { ...f, cop: kpis.cop } : f).sort((a, b) => b.cop - a.cop);
  const ahuFleet = AHU_FLEET_BASE.map(a => a.id === "AHU-01" ? { ...a, airflow: sensors.ahu.airflow, sat: sensors.ahu.supply_air_temp } : a);
  const divColor = kpis.div > 2.5 ? T.red : kpis.div > 1.5 ? T.amber : T.green;

  const openPlant = useCallback(() => {
    setRouteState({ focus: "plant" });
    setRoute({ focus: "plant", id: "" });
  }, []);

  const openUnit = useCallback((focus, id) => {
    setRouteState({ focus, id });
    setRoute({ focus, id });
  }, []);

  return (
    <div style={{ ...MONO, display: "flex", height: "100vh", background: T.bg, color: T.text, overflow: "hidden" }}>

      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.border}`, background: "rgba(255,255,255,0.72)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2 }}>MILVIAN GROUP · PLATFORM</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
              {route.focus === "plant" ? "Plant overview — HVAC digital twin" : `${route.id || (route.focus === "chiller" ? "Chiller" : "AHU")} — drill-in`}
            </div>
          </div>
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <Pill color={T.green} label="Online" />
            {fault && <Pill color={T.amber} label="1 fault detected" />}
            {kpis.rfPct > 40 && <Pill color={T.blue} label={`${kpis.rfPct}% fouling`} />}
            <span style={{ fontSize: 9, color: T.muted, marginLeft: 4 }}>Updated 1s ago</span>
          </div>
        </div>

        <div style={{ padding: "10px 14px 20px", display: "flex", flexDirection: "column", gap: 9 }}>

          {/* Drill-in header */}
          {route.focus !== "plant" && (
            <div style={{ ...card({ padding: "9px 12px" }), display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={openPlant}
                style={{ ...MONO, fontSize: 10, letterSpacing: 1, padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", cursor: "pointer", color: T.muted }}
              >
                ← Back to Plant
              </button>
              <span style={{ fontSize: 10, color: T.dim }}>Plant</span>
              <span style={{ fontSize: 10, color: T.dim }}>→</span>
              <span style={{ fontSize: 10, color: T.text, fontWeight: 700 }}>{route.id || (route.focus === "chiller" ? "Chiller" : "AHU")}</span>
              <span style={{ marginLeft: "auto", fontSize: 9, color: T.dim }}>one-level drill-in</span>
            </div>
          )}

          {/* KPI Strip */}
          <KPIStrip kpis={kpis} rf={rf} divColor={divColor} />

          {/* Plant strip (overview only) */}
          {route.focus === "plant" && (
            <PlantStrip
              fleet={fleet}
              ahus={ahuFleet}
              onOpen={({ focus, id }) => {
                openUnit(focus, id);
              }}
            />
          )}

          {/* Middle row */}
          {route.focus === "plant" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 9 }}>
              <SystemFlow sensors={sensors} kpis={kpis} />
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <FaultDiagnosis fObj={fObj} kpis={kpis} />
                <ComponentHealth sensors={sensors} kpis={kpis} />
              </div>
            </div>
          ) : (
            route.focus === "chiller"
              ? <ChillerDetail id={route.id} sensors={sensors} kpis={kpis} rf={rf} data={cData} divColor={divColor} />
              : <AhuDetail id={route.id} sensors={sensors} kpis={kpis} data={cData} divColor={divColor} />
          )}

          {/* AI Alert banner */}
          {(aiAlert || alertLoading) && (
            <div style={{ ...card({ padding: "10px 14px", borderColor: T.amber }), display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 8, color: T.amber, letterSpacing: 2, flexShrink: 0, paddingTop: 1 }}>AI ALERT</span>
              <span style={{ fontSize: 11, color: T.amber, lineHeight: 1.65 }}>{alertLoading ? "Analyzing fault pattern..." : aiAlert}</span>
              {!alertLoading && (
                <button onClick={() => sendChat(`Deep dive on the ${fObj?.label} fault -- full root cause analysis and step by step action plan`)}
                  style={{ marginLeft: "auto", flexShrink: 0, background: "transparent", border: `1px solid ${T.amber}`, color: T.amber, padding: "3px 9px", borderRadius: 3, cursor: "pointer", fontSize: 8, letterSpacing: 1, ...MONO }}>
                  DEEP DIVE
                </button>
              )}
            </div>
          )}

          {/* Recommendations */}
          <Recommendations kpis={kpis} rf={rf} onAsk={sendChat} />

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            <TrendChart data={cData} dataKey="appTemp" label="Approach temperature" sub="actual vs physics model prediction" color={T.blue} modelVal={24.6} modelLabel="Model" unit="C" domain={[23, 27]} degrading={fault === "fan_bearing"} />
            <TrendChart data={cData} dataKey="cop" label="COP -- actual vs design" sub="load-adjusted design benchmark" color={T.green} modelVal={4.1} modelLabel="Design" unit="" domain={[3.5, 4.6]} degrading={fault === "refrigerant_leak" || fault === "high_load"} />
          </div>

          <DivergenceChart data={cData} divColor={divColor} />
          <FleetBenchmark fleet={fleet} />
          <FaultPanel fault={fault} onToggle={(f) => setFault(a => a === f ? null : f)} />

        </div>
      </div>

      {/* Chat sidebar */}
      <ChatSidebar msgs={msgs} inp={inp} setInp={setInp} sendChat={sendChat} chatBusy={chatBusy} chatBot={chatBot} />
    </div>
  );
}

function MetricRow({ label, value, sub, color }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 10, color: T.muted, width: 140 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: color || T.text }}>{value}</span>
      {sub && <span style={{ fontSize: 9, color: T.dim, marginLeft: "auto" }}>{sub}</span>}
    </div>
  );
}

function ContributorsCard({ title, contributors, filterComp }) {
  const items = (contributors || []).filter(c => !filterComp || c.comp === filterComp).slice(0, 5);
  return (
    <div style={card({ padding: 12 })}>
      <span style={SL}>{title}</span>
      {items.length === 0 ? (
        <div style={{ fontSize: 10, color: T.dim }}>No contributor data.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((c) => (
            <div key={`${c.comp}.${c.metric}`} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 10, width: 88, color: T.muted }}>{c.comp}</span>
              <span style={{ fontSize: 10, width: 120, color: T.text }}>{c.metric}</span>
              <div style={{ flex: 1, height: 4, background: T.dim, borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${Math.min(100, (c.devSigma / 3.5) * 100)}%`, background: c.devSigma > 2.5 ? T.red : c.devSigma > 1.5 ? T.amber : T.green, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, width: 44, textAlign: "right" }}>{c.devSigma}σ</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChillerDetail({ id, sensors, kpis, rf, data, divColor }) {
  const isLive = !id || id === "CHL-03";
  const s = sensors;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 9 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={card({ padding: 12 })}>
          <span style={SL}>{(id || "CHL-03").toUpperCase()} — PERFORMANCE</span>
          {!isLive && <div style={{ fontSize: 9, color: T.dim, marginBottom: 8 }}>summary-only unit (demo)</div>}
          <MetricRow label="COP" value={`${kpis.cop} / 4.1`} color={kpis.cop < 3.8 ? T.red : kpis.cop < 4.1 ? T.amber : T.green} sub="actual / design" />
          <MetricRow label="Power draw" value={`${kpis.pwr} kW`} sub="vs model 185kW" color={Math.abs(kpis.pwr - 185) > 15 ? T.amber : T.text} />
          <MetricRow label="Efficiency" value={`${s.chiller.efficiency}%`} sub="proxy for cooling output" />
          <MetricRow label="Pressure" value={`${s.chiller.pressure} bar`} sub="refrigerant circuit signal" />
          <MetricRow label="CHW temps" value={`${s.chiller.inlet_temp}°C → ${s.chiller.outlet_temp}°C`} sub="inlet → outlet" />
          <MetricRow label="Condenser temps" value={`${s.cooling_tower.inlet_temp}°C → ${s.cooling_tower.outlet_temp}°C`} sub="inlet → outlet" />
          <div style={{ marginTop: 8, fontSize: 9, color: T.dim }}>
            Fouling Rf: <span style={{ color: kpis.rfPct > 70 ? T.red : kpis.rfPct > 40 ? T.amber : T.green, fontWeight: 700 }}>{rf.toFixed(1)}×10⁻⁶</span> ({kpis.rfPct}% to ASHRAE limit)
          </div>
        </div>

        <ContributorsCard title={`WHY σ IS ${kpis.div}${"σ"} — TOP DRIVERS`} contributors={kpis.contributors} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <TrendChart data={data} dataKey="chEff" label="Chiller efficiency (%)" sub="derived sensor proxy" color={T.blue} modelVal={BASE.chiller.efficiency} modelLabel="Baseline" unit="%" domain={[80, 92]} degrading={false} />
          <TrendChart data={data} dataKey="chPres" label="Refrigerant pressure" sub="bar" color={T.amber} modelVal={BASE.chiller.pressure} modelLabel="Baseline" unit=" bar" domain={[4.0, 4.6]} degrading={false} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <TrendChart data={data} dataKey="chwOut" label="CHW supply (outlet)" sub="°C" color={T.green} modelVal={BASE.chiller.outlet_temp} modelLabel="Baseline" unit="°C" domain={[6.4, 8.4]} degrading={false} />
          <TrendChart data={data} dataKey="chwIn" label="CHW return (inlet)" sub="°C" color={T.muted} modelVal={BASE.chiller.inlet_temp} modelLabel="Baseline" unit="°C" domain={[11.6, 13.6]} degrading={false} />
        </div>
        <DivergenceChart data={data} divColor={divColor} />
      </div>
    </div>
  );
}

function AhuDetail({ id, sensors, kpis, data, divColor }) {
  const isLive = !id || id === "AHU-01";
  const s = sensors;
  const comfortDelta = Math.round((data[data.length - 1]?.zoneTemp - data[data.length - 1]?.zoneSp) * 10) / 10;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 9 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={card({ padding: 12 })}>
          <span style={SL}>{(id || "AHU-01").toUpperCase()} — AIR-SIDE + COMFORT</span>
          {!isLive && <div style={{ fontSize: 9, color: T.dim, marginBottom: 8 }}>summary-only unit (demo)</div>}
          <MetricRow label="Airflow" value={`${s.ahu.airflow} CFM`} sub="supply fan" color={s.ahu.airflow < 3800 ? T.amber : T.text} />
          <MetricRow label="Fan speed" value={`${s.ahu.fan_rpm} RPM`} sub="should track airflow" />
          <MetricRow label="Supply air temp" value={`${s.ahu.supply_air_temp}°C`} sub="SAT" />
          <MetricRow label="Return air temp" value={`${s.ahu.return_air_temp}°C`} sub="RAT" />
          <MetricRow
            label="Zone proxy"
            value={`${(data[data.length - 1]?.zoneTemp ?? 23.6).toFixed(1)}°C`}
            sub={`setpoint ${(data[data.length - 1]?.zoneSp ?? 23.5).toFixed(1)}°C · Δ ${(comfortDelta >= 0 ? "+" : "")}${comfortDelta}°C`}
            color={Math.abs(comfortDelta) > 0.8 ? T.amber : T.green}
          />
          <div style={{ marginTop: 8, fontSize: 9, color: T.dim }}>
            Comfort values are demo proxies (not a full zone model).
          </div>
        </div>

        <ContributorsCard title={`WHY σ IS ${kpis.div}${"σ"} — TOP DRIVERS`} contributors={kpis.contributors} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <TrendChart data={data} dataKey="ahCfm" label="Airflow" sub="CFM" color={T.blue} modelVal={BASE.ahu.airflow} modelLabel="Baseline" unit=" CFM" domain={[3400, 5000]} degrading={false} />
          <TrendChart data={data} dataKey="ahFan" label="Fan RPM" sub="should be stable" color={T.muted} modelVal={BASE.ahu.fan_rpm} modelLabel="Baseline" unit=" RPM" domain={[1120, 1280]} degrading={false} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <TrendChart data={data} dataKey="ahSat" label="Supply air temp" sub="SAT" color={T.green} modelVal={BASE.ahu.supply_air_temp} modelLabel="Baseline" unit="°C" domain={[15.2, 17.6]} degrading={false} />
          <TrendChart data={data} dataKey="zoneTemp" label="Zone proxy temp" sub="comfort tracking" color={T.amber} modelVal={23.5} modelLabel="Setpoint" unit="°C" domain={[22.2, 25.2]} degrading={false} />
        </div>
        <DivergenceChart data={data} divColor={divColor} />
      </div>
    </div>
  );
}

function Pill({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, background: color + "18", border: `1px solid ${color}40`, borderRadius: 20, padding: "3px 9px" }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 9, color, letterSpacing: 0.5 }}>{label}</span>
    </div>
  );
}

function KPIStrip({ kpis, rf, divColor }) {
  const copDelta = Math.round((kpis.cop - 4.1) * 100) / 100;
  const pwrDelta = Math.round((kpis.pwr - 185) / 185 * 100);
  const rfColor  = kpis.rfPct > 70 ? T.red : kpis.rfPct > 40 ? T.amber : T.green;
  const copColor = kpis.cop >= 4.1 ? T.green : kpis.cop >= 3.8 ? T.amber : T.red;
  const tiles = [
    { lbl: "COP actual / design", val: kpis.cop, unit: " / 4.1", sub: `${copDelta >= 0 ? "+" : ""}${copDelta} ${copDelta >= 0 ? "above" : "below"} design`, sc: copColor },
    { lbl: "Power draw",          val: kpis.pwr,  unit: " kW",   sub: `${pwrDelta >= 0 ? "+" : ""}${pwrDelta}% vs model`, sc: pwrDelta > 5 ? T.amber : T.green },
    { lbl: "Fouling Rf",          val: rf.toFixed(1), unit: "x10-6", sub: `${kpis.rfPct}% to ASHRAE limit`, sc: rfColor },
    { lbl: "Model divergence",    val: kpis.div,  unit: " σ",    sub: kpis.div > 2.5 ? "ALERT threshold" : kpis.div > 1.5 ? "Elevated" : "Near alert threshold", sc: divColor },
    { lbl: "Fleet COP rank",      val: "#2",      unit: " / 6",  sub: "Norm. COP 4.18", sc: T.blue },
    { lbl: "Grid carbon now",     val: "182",     unit: " gCO2", sub: "vs 245 avg — run hard", sc: T.green },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 7 }}>
      {tiles.map((t, i) => (
        <div key={i} style={{ ...card({ padding: "10px 11px" }) }}>
          <span style={{ ...SL, marginBottom: 4 }}>{t.lbl}</span>
          <div style={{ fontSize: 21, fontWeight: 700, color: t.sc, lineHeight: 1.1 }}>
            {t.val}<span style={{ fontSize: 10, color: T.muted, fontWeight: 400 }}>{t.unit}</span>
          </div>
          <div style={{ fontSize: 9, color: t.sc, marginTop: 3 }}>{t.sub}</div>
        </div>
      ))}
    </div>
  );
}

function SystemFlow({ sensors, kpis }) {
  const s = sensors;
  const chtC = s.chiller.efficiency < 82 ? T.red : s.chiller.efficiency < 85 ? T.amber : T.blue;
  const ctC  = s.cooling_tower.fan_rpm < 800 ? T.amber : T.blue;
  const ahuC = s.ahu.airflow < 3800 ? T.amber : T.blue;
  return (
    <div style={card({ padding: 12 })}>
      <span style={SL}>SYSTEM FLOW -- LIVE STATE</span>
      <svg width="100%" viewBox="0 0 360 254" style={{ display: "block" }}>
        <defs>
          <marker id="dn" viewBox="0 0 8 8" refX="4" refY="7" markerWidth="5" markerHeight="5" orient="auto">
            <polygon points="0,0 8,0 4,8" fill="#58a6ff" />
          </marker>
          <marker id="up" viewBox="0 0 8 8" refX="4" refY="1" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <polygon points="0,8 8,8 4,0" fill="#e3b341" />
          </marker>
        </defs>
        {/* Cooling Tower */}
        <rect x="8" y="6"   width="344" height="58" rx="4" fill={T.card} stroke={ctC}  strokeWidth="0.8" />
        <text x="16" y="20" fill={T.muted} fontSize="7" letterSpacing="2" fontFamily="monospace">COOLING TOWER</text>
        <text x="16" y="38" fill={T.text}  fontSize="13" fontWeight="700" fontFamily="monospace">{s.cooling_tower.fan_rpm}<tspan fill={T.muted} fontSize="9" fontWeight="400"> RPM</tspan></text>
        <text x="140" y="38" fill={T.muted} fontSize="9" fontFamily="monospace">in:{s.cooling_tower.inlet_temp}C  out:{s.cooling_tower.outlet_temp}C</text>
        <text x="16" y="55" fill={T.dim}   fontSize="8" fontFamily="monospace">flow: {s.cooling_tower.flow_rate} L/min</text>
        {/* Pipes CT <-> Chiller */}
        <line x1="55"  y1="64" x2="55"  y2="94" stroke={T.blue}  strokeWidth="2"   markerEnd="url(#dn)" />
        <line x1="305" y1="94" x2="305" y2="64" stroke={T.amber} strokeWidth="1.5" markerEnd="url(#up)" />
        <text x="62"  y="82" fill={T.blue}  fontSize="8" fontFamily="monospace">{s.cooling_tower.outlet_temp}C</text>
        <text x="312" y="82" fill={T.amber} fontSize="8" fontFamily="monospace">{s.cooling_tower.inlet_temp}C</text>
        <text x="175" y="78" fill={T.dim}   fontSize="7" fontFamily="monospace" textAnchor="middle">condenser water loop</text>
        {/* Chiller */}
        <rect x="8" y="94"  width="344" height="58" rx="4" fill={T.card} stroke={chtC} strokeWidth="0.8" />
        <text x="16" y="108" fill={T.muted} fontSize="7" letterSpacing="2" fontFamily="monospace">CHILLER</text>
        <text x="16" y="126" fill={T.text}  fontSize="13" fontWeight="700" fontFamily="monospace">COP {kpis.cop}<tspan fill={T.muted} fontSize="9" fontWeight="400"> / 4.1 design</tspan></text>
        <text x="175" y="126" fill={T.muted} fontSize="9" fontFamily="monospace">eff:{s.chiller.efficiency}%  pres:{s.chiller.pressure} bar</text>
        <text x="16" y="143" fill={T.dim}   fontSize="8" fontFamily="monospace">in:{s.chiller.inlet_temp}C  out:{s.chiller.outlet_temp}C</text>
        {/* Pipes Chiller <-> AHU */}
        <line x1="55"  y1="152" x2="55"  y2="184" stroke={T.blue}  strokeWidth="2"   markerEnd="url(#dn)" />
        <line x1="305" y1="184" x2="305" y2="152" stroke={T.amber} strokeWidth="1.5" markerEnd="url(#up)" />
        <text x="62"  y="170" fill={T.blue}  fontSize="8" fontFamily="monospace">{s.chiller.outlet_temp}C</text>
        <text x="312" y="170" fill={T.amber} fontSize="8" fontFamily="monospace">{s.chiller.inlet_temp}C</text>
        <text x="175" y="166" fill={T.dim}   fontSize="7" fontFamily="monospace" textAnchor="middle">chilled water loop</text>
        {/* AHU */}
        <rect x="8" y="184" width="344" height="58" rx="4" fill={T.card} stroke={ahuC} strokeWidth="0.8" />
        <text x="16" y="198" fill={T.muted} fontSize="7" letterSpacing="2" fontFamily="monospace">AIR HANDLING UNIT</text>
        <text x="16" y="216" fill={T.text}  fontSize="13" fontWeight="700" fontFamily="monospace">{s.ahu.airflow}<tspan fill={T.muted} fontSize="9" fontWeight="400"> CFM</tspan></text>
        <text x="140" y="216" fill={T.muted} fontSize="9" fontFamily="monospace">supply:{s.ahu.supply_air_temp}C  fan:{s.ahu.fan_rpm} RPM</text>
        <text x="16" y="233" fill={T.dim}   fontSize="8" fontFamily="monospace">return air: {s.ahu.return_air_temp}C  to building rooms</text>
      </svg>
    </div>
  );
}

function FaultDiagnosis({ fObj, kpis }) {
  const hyps = fObj ? fObj.hyps : [
    { name: "No active fault",    pct: 94, hot: false, ev: `all sensors within normal range` },
    { name: "Minor sensor noise", pct:  4, hot: false, ev: `divergence at ${kpis.div}σ — below threshold` },
    { name: "Low-level fouling",  pct:  2, hot: false, ev: "Rf trending up — normal accumulation" },
  ];
  return (
    <div style={card({ padding: 12, flex: 1 })}>
      <span style={SL}>BAYESIAN FAULT DIAGNOSIS</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {hyps.map((h, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
              <span style={{ fontSize: i === 0 ? 12 : 11, fontWeight: i === 0 ? 600 : 400, color: h.hot ? T.amber : T.text }}>{h.name}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: h.hot ? T.amber : T.muted }}>{h.pct}%</span>
            </div>
            <div style={{ height: 3, background: T.dim, borderRadius: 2, marginBottom: 3 }}>
              <div style={{ height: "100%", width: `${h.pct}%`, background: h.hot ? T.amber : T.dim, borderRadius: 2, transition: "width 0.8s ease" }} />
            </div>
            <div style={{ fontSize: 9, color: T.muted }}>{h.ev}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentHealth({ sensors, kpis }) {
  const s = sensors;
  const ch = Math.round(s.chiller.efficiency / 95 * 100);
  const ct = Math.round(Math.min(s.cooling_tower.fan_rpm, 1000) / 1000 * 100);
  const ah = Math.round(Math.min(s.ahu.airflow, 5000) / 5000 * 100);
  const hc = (h) => h < 80 ? T.red : h < 90 ? T.amber : T.green;
  return (
    <div style={card({ padding: 12 })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ ...SL, marginBottom: 0 }}>COMPONENT HEALTH</span>
        <span style={{ fontSize: 9, color: T.blue }}>~{kpis.svcHrs}h to service</span>
      </div>
      {[["Chiller", ch], ["Cooling Tower", ct], ["AHU", ah]].map(([n, h]) => (
        <div key={n} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 10 }}>{n}</span>
            <span style={{ fontSize: 10, color: hc(h), fontWeight: 600 }}>{h}%</span>
          </div>
          <div style={{ height: 4, background: T.dim, borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${h}%`, background: hc(h), borderRadius: 2, transition: "width 0.8s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Recommendations({ kpis, rf, onAsk }) {
  const recs = [
    {
      color: T.amber,
      title: `Schedule tube cleaning — ${kpis.svcHrs}h window`,
      body:  `Rf = ${rf.toFixed(1)}x10-6 m2K/W and rising. At current fouling rate, ASHRAE threshold breach in ~${kpis.svcHrs}h. Optimal window: Sat 06:00-10:00. Required parts in stock. Est. labor: 4h.`,
      save:  "Saves £120/day · avoids unplanned downtime",
      q:     "Explain the tube cleaning recommendation in detail — how urgent is it and what happens if delayed?",
    },
    {
      color: T.blue,
      title: "Raise CHW setpoint to 8.2°C",
      body:  `Load factor 62%. ROM simulation shows +1.2°C setpoint reduces compressor work 11%. Zone temps stay within ASHRAE 55 comfort band (+0.3°C max delta). Verified against model.`,
      save:  "Est. £22/day saving at current load",
      q:     "Explain the setpoint optimisation recommendation — why would raising it save energy?",
    },
    {
      color: T.green,
      title: "Pre-cool tomorrow 11:00-14:00",
      body:  `Peak tariff 14:00-18:00 at 3x rate. Forecast ambient 38°C. Building thermal mass absorbs 2.5°C pre-cooling. Grid carbon now 182 vs 245 avg — optimal time to run hard.`,
      save:  "Est. £280 demand charge saving for event",
      q:     "Explain the pre-cooling strategy — how does pre-cooling work and how do you calculate the saving?",
    },
  ];
  return (
    <div style={card({ padding: 12 })}>
      <span style={SL}>RECOMMENDATIONS</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
        {recs.map((r, i) => (
          <div key={i} style={{ background: r.color + "12", border: `1px solid ${r.color}35`, borderRadius: 5, padding: "10px 11px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: r.color, marginBottom: 6, lineHeight: 1.35 }}>{r.title}</div>
            <div style={{ fontSize: 9, color: T.muted, lineHeight: 1.65, marginBottom: 7 }}>{r.body}</div>
            <div style={{ fontSize: 9, color: r.color, fontWeight: 600, marginBottom: 8 }}>{r.save}</div>
            <button onClick={() => onAsk(r.q)} style={{ background: "transparent", border: `1px solid ${r.color}50`, color: r.color, padding: "3px 8px", borderRadius: 3, cursor: "pointer", fontSize: 8, letterSpacing: 1, ...MONO }}>
              EXPLAIN
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendChart({ data, dataKey, label, sub, color, modelVal, modelLabel, unit, domain, degrading }) {
  return (
    <div style={card({ padding: 12 })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: degrading ? T.amber : T.text }}>
            {label} {degrading && <span style={{ color: T.amber, fontSize: 9 }}>(degrading)</span>}
          </div>
          <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{sub}</div>
        </div>
        <div style={{ display: "flex", gap: 9, fontSize: 8, color: T.muted }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 14, height: 2, background: color }} /> Actual</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 14, height: 1, background: T.muted, borderTop: "1px dashed " + T.muted }} /> {modelLabel}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data}>
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <ReferenceLine y={modelVal} stroke={T.muted} strokeDasharray="4 4" strokeWidth={1} />
          <XAxis dataKey="i" hide />
          <YAxis domain={domain} hide />
          <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, fontSize: 9, ...MONO }} formatter={(v) => [`${v}${unit}`, label]} labelFormatter={() => ""} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DivergenceChart({ data, divColor }) {
  return (
    <div style={card({ padding: 12 })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600 }}>Model divergence score</div>
          <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>σ above expected — alert fires at 2.5σ</div>
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 8, color: T.muted }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 2, background: T.blue }} /> Divergence</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 2, background: T.red }} /> Alert (2.5σ)</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={70}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="div" stroke={divColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <ReferenceLine y={2.5} stroke={T.red} strokeDasharray="4 4" strokeWidth={1} />
          <XAxis dataKey="i" hide />
          <YAxis domain={[0, 3.5]} hide />
          <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, fontSize: 9, ...MONO }} formatter={(v) => [`${v}σ`, "Divergence"]} labelFormatter={() => ""} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function FleetBenchmark({ fleet }) {
  const maxCOP = 4.6;
  return (
    <div style={card({ padding: 12 })}>
      <span style={SL}>FLEET COP BENCHMARK -- NORMALISED FOR LOAD FACTOR + AMBIENT</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {fleet.map((f) => {
          const you = f.id === "CHL-03";
          const bc  = f.tag === "fault" ? T.red : f.tag === "watch" ? T.amber : f.tag === "top" ? T.green : you ? T.blue : T.muted;
          return (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 10, color: you ? T.text : T.muted, width: 46, fontWeight: you ? 600 : 400 }}>{f.id}</span>
              <div style={{ flex: 1, height: 5, background: T.dim, borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${Math.min(100, f.cop / maxCOP * 100)}%`, background: bc, borderRadius: 3, transition: "width 0.5s ease" }} />
              </div>
              <span style={{ fontSize: 11, color: bc, fontWeight: 700, width: 34, textAlign: "right" }}>{f.cop.toFixed(2)}</span>
              {f.tag
                ? <div style={{ fontSize: 8, color: bc, background: bc + "18", border: `1px solid ${bc}40`, borderRadius: 10, padding: "1px 7px", width: 36, textAlign: "center" }}>{f.tag}</div>
                : <div style={{ width: 51 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FaultPanel({ fault, onToggle }) {
  return (
    <div style={card({ padding: 12 })}>
      <span style={SL}>FAULT SIMULATION -- INJECT CONTINUOUS DRIFT</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {Object.entries(FAULTS).map(([key, f]) => {
          const active = fault === key;
          return (
            <button key={key} onClick={() => onToggle(key)} style={{
              background: active ? T.amber + "20" : "transparent",
              border: `1px solid ${active ? T.amber : T.border}`,
              color: active ? T.amber : T.muted,
              padding: "9px 10px", borderRadius: 5, cursor: "pointer",
              textAlign: "left", transition: "all 0.2s", ...MONO,
            }}>
              <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: 1, marginBottom: 3 }}>{active ? "ACTIVE" : "INJECT"}</div>
              <div style={{ fontSize: 10, color: active ? T.amber : T.text, fontWeight: active ? 700 : 400 }}>{f.label}</div>
              <div style={{ fontSize: 8, color: T.dim, marginTop: 2 }}>{f.comp} · {f.metric}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChatSidebar({ msgs, inp, setInp, sendChat, chatBusy, chatBot }) {
  return (
    <aside style={{ width: 270, borderLeft: `1px solid ${T.border}`, background: T.card, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "9px 13px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 8, color: T.muted, letterSpacing: 2 }}>AI ASSISTANT</div>
        <div style={{ fontSize: 12, color: T.blue, fontWeight: 600 }}>Facility Intelligence</div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "10px 10px 0", display: "flex", flexDirection: "column", gap: 7 }}>
        {msgs.length === 0 && (
          <div style={{ color: T.dim, fontSize: 10, textAlign: "center", marginTop: 28, lineHeight: 2 }}>
            Live sensor data loaded.<br />Ask me anything about CHL-03.
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "93%",
            background: m.role === "user" ? "#eff6ff" : T.card,
            border: `1px solid ${m.role === "user" ? `${T.blue}33` : T.border}`,
            borderRadius: 5, padding: "7px 9px", fontSize: 10, lineHeight: 1.65,
            color: m.role === "user" ? "#1e3a8a" : T.text,
          }}>
            {m.role === "assistant" && <div style={{ fontSize: 7, color: T.muted, letterSpacing: 1, marginBottom: 3 }}>AI ASSISTANT</div>}
            {m.content}
          </div>
        ))}
        {chatBusy && <div style={{ alignSelf: "flex-start", background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, padding: "7px 9px", fontSize: 10, color: T.dim }}>Analyzing...</div>}
        <div ref={chatBot} />
      </div>
      <div style={{ padding: "8px 10px", borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["System health?", "Any risks?", "Save energy?"].map(q => (
            <button key={q} onClick={() => sendChat(q)} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.muted, padding: "2px 7px", borderRadius: 3, cursor: "pointer", fontSize: 8, ...MONO }}>{q}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={inp} onChange={e => setInp(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (sendChat(inp), setInp(""))}
            placeholder="Ask anything..."
            style={{ flex: 1, background: T.bg, border: `1px solid ${T.border}`, color: T.text, padding: "6px 9px", borderRadius: 4, fontSize: 10, outline: "none", ...MONO }}
          />
          <button onClick={() => { sendChat(inp); setInp(""); }} style={{ background: T.blue, border: "none", color: "#fff", padding: "6px 11px", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
            →
          </button>
        </div>
      </div>
    </aside>
  );
}
