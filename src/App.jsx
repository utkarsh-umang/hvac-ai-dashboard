import { useEffect, useMemo, useState } from "react";
import Intro from "../hvac-intro.jsx";
import DigitalTwin from "../hvac-digital-twin.jsx";

function getInitialRoute() {
  const params = new URLSearchParams(window.location.search);
  const view = (params.get("view") || "").toLowerCase();
  if (view === "digital-twin" || view === "digital_twin" || view === "twin") return "twin";
  return "intro";
}

function setViewQueryParam(next) {
  const url = new URL(window.location.href);
  url.searchParams.set("view", next === "twin" ? "digital-twin" : "intro");
  window.history.replaceState({}, "", url.toString());
}

export default function App() {
  const [view, setView] = useState(getInitialRoute);

  useEffect(() => {
    const onPopState = () => setView(getInitialRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    setViewQueryParam(view);
  }, [view]);

  const Screen = useMemo(() => (view === "twin" ? DigitalTwin : Intro), [view]);

  return (
    <div>
      <div
        style={{
          position: "fixed",
          right: 14,
          top: 14,
          zIndex: 9999,
          display: "flex",
          gap: 8,
          padding: 8,
          borderRadius: 10,
          background: "rgba(10, 14, 24, 0.72)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(8px)",
        }}
      >
        <button
          onClick={() => setView("intro")}
          style={{
            cursor: "pointer",
            borderRadius: 8,
            padding: "8px 10px",
            border: "1px solid rgba(255,255,255,0.14)",
            background: view === "intro" ? "rgba(227,179,65,0.18)" : "transparent",
            color: "rgba(255,255,255,0.85)",
            fontSize: 12,
          }}
        >
          Intro
        </button>
        <button
          onClick={() => setView("twin")}
          style={{
            cursor: "pointer",
            borderRadius: 8,
            padding: "8px 10px",
            border: "1px solid rgba(255,255,255,0.14)",
            background: view === "twin" ? "rgba(88,166,255,0.18)" : "transparent",
            color: "rgba(255,255,255,0.85)",
            fontSize: 12,
          }}
        >
          Digital Twin
        </button>
      </div>
      <Screen />
    </div>
  );
}

