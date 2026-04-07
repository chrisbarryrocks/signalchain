# SignalChain

SignalChain is a logistics intelligence workspace that transforms unstructured email communication into structured, actionable operational insight.

It connects to a Gmail inbox, analyzes selected messages, and extracts key information such as shipment issues, business impact, and recommended actions. The goal is to reduce time spent parsing email threads and make operational decisions faster and clearer.

## Features

- Gmail OAuth connection and inbox ingestion
- Smart grouping of emails into relevant vs other
- AI-powered classification and structured extraction
- Structured output including:
  - risk summary
  - business impact
  - key shipment details
  - recommended actions
- Safe handling of non-relevant emails without generating false data
- Re-analyze and refresh workflows

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
- Zod

## Architecture

1. The backend connects to Gmail via OAuth and fetches recent emails
2. The frontend renders an inbox grouped by likely relevance
3. The user selects an email and triggers analysis
4. The backend performs structured extraction using OpenAI
5. The frontend presents risk classification, key details, business impact, and recommended actions

## Run locally

### Install dependencies

```bash
npm install
```

### Configure environment

Create `server/.env` based on `server/.env.example`.

### Start the app

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:4000

## Environment Modes

### Email source
- mock - local test data
- gmail - live Gmail integration

### Extraction mode
- mock - deterministic output
- openai - real structured extraction

Configured via server environment variables.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Project Structure

```text
client/   React frontend
server/   Express API and integrations
```

The application is deployed as a full-stack system with a separate frontend and API layer.
