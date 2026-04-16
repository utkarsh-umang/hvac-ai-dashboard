import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load .env from repo root regardless of cwd (important when launched by tools/process managers)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();
app.use(express.json({ limit: "1mb" }));

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat", async (req, res) => {
  if (!client) {
    res.status(500).json({ error: "Missing OPENAI_API_KEY on server." });
    return;
  }

  const { system, messages, model } = req.body ?? {};

  if (messages && !Array.isArray(messages)) {
    res.status(400).json({ error: "`messages` must be an array." });
    return;
  }

  const input = [];
  if (typeof system === "string" && system.trim()) {
    input.push({ role: "system", content: system });
  }

  for (const m of messages ?? []) {
    if (!m || typeof m !== "object") continue;
    if (m.role !== "user" && m.role !== "assistant" && m.role !== "system") continue;
    if (typeof m.content !== "string" || !m.content.trim()) continue;
    input.push({ role: m.role, content: m.content });
  }

  if (input.length === 0) {
    res.status(400).json({ error: "No valid input messages." });
    return;
  }

  try {
    const resp = await client.responses.create({
      model: typeof model === "string" && model.trim() ? model : "gpt-4o",
      input,
    });

    res.json({
      id: resp.id,
      text: resp.output_text ?? "",
    });
  } catch (err) {
    const status = typeof err === "object" && err && "status" in err ? err.status : undefined;
    const code = typeof err === "object" && err && "code" in err ? err.code : undefined;
    const message = err instanceof Error ? err.message : "OpenAI request failed.";
    res.status(typeof status === "number" ? status : 500).json({
      error: message,
      ...(code ? { code } : {}),
      ...(typeof status === "number" ? { status } : {}),
    });
  }
});

// In production, serve the built Vite app.
if (process.env.NODE_ENV === "production") {
  const distDir = path.resolve(__dirname, "..", "dist");

  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get("*", (_req, res) => res.sendFile(path.join(distDir, "index.html")));
  }
}

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${PORT}`);
});

