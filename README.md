# HVAC AI Dashboard (demo)

This repo contains two standalone React demo screens:

- `hvac-intro.jsx` (Intro)
- `hvac-digital-twin.jsx` (Digital Twin)

## OpenAI setup (GPT-4o)

This demo calls OpenAI **from a small local API server** so your API key never ships to the browser.

1) Create `.env` from the example:

```bash
cp .env.example .env
```

2) Set `OPENAI_API_KEY` in `.env`.

## Run (local dev)

```bash
npm install
npm run dev
```

Then open:

- Intro: `http://localhost:5173/?view=intro`
- Digital Twin: `http://localhost:5173/?view=digital-twin`

You can also switch views using the on-page toggle (top-right).

## Production build

```bash
npm run build
npm run preview
```

