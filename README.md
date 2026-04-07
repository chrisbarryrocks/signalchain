# SignalChain

SignalChain is a Desteia-inspired logistics operations demo that ingests vendor email updates, extracts structured shipment risk data with AI, and surfaces actionable alerts in a lightweight operations dashboard.

## Why this exists

The goal of this project is to demonstrate a product-minded interpretation of a real supply chain workflow:

- vendor communication arrives through email
- the system interprets the update
- operations teams receive structured, actionable information instead of inbox chaos

This repo intentionally focuses on one polished workflow rather than a broad, shallow feature set.

## Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Node.js
- TypeScript
- Express

### Integrations
- Gmail API
- OpenAI API
- Zod for validation

## Architecture

1. The backend reads recent emails from either Gmail or a mock source
2. The frontend renders an inbox and selected message view
3. The user analyzes an email
4. The backend extracts structured shipment risk data
5. The frontend renders a risk alert, extracted details, and recommended actions

## Run locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `server/.env` using `server/.env.example`.

### 3. Start the app

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:4000`

## Modes

### Email source
- `mock` - use local mock logistics emails
- `gmail` - use Gmail API

### Extractor mode
- `mock` - use deterministic extraction for local development
- `openai` - use OpenAI structured extraction

These are controlled through server environment variables.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Repo layout

```text
client/   React frontend
server/   Express API + integrations
docs/     Product and implementation docs
```

## Demo story

A vendor sends an email saying a shipment is delayed due to port congestion. SignalChain reads the email, extracts the issue, assesses the risk, and shows the operations user what changed and what to do next.

## Notes

This project is intentionally scoped as a demo:
- no auth
- no persistence
- no background sync
- one polished happy path

The emphasis is on clean architecture, strong typing, and product-oriented UX.
