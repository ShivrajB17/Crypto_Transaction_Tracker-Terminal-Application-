# Crypto Forensics Tracer

## Purpose
Tracing cryptocurrency funds across multiple hops and identifying known entities (exchanges, mixers, illicit actors) is complex and often requires expensive tools. Crypto Forensics Tracer aims to provide an accessible, terminal-based solution for building and analyzing transaction graphs.

## MVP Scope
The initial version will focus on:
- Fetching Ethereum transaction data via API.
- Constructing and traversing a transaction graph.
- Identifying known addresses from a local dataset.
- Generating a terminal-friendly forensic report.

## Current Development Status
Project initialized. Setting up the core Node.js + TypeScript structure and development environment. No blockchain interactions or tracing logic have been implemented yet.

## Technology Stack
- **Language**: TypeScript (Node.js)
- **CLI Framework**: Commander.js
- **Styling & Loading**: Chalk, Ora
- **Graph Analysis**: Graphology
- **Testing**: Vitest

## Setup Instructions

1. Clone the repository or navigate to the project root.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```

## How to run the CLI

For development:
```bash
npm run dev
```

To build and run:
```bash
npm run build
npm start
```

## How to run the Backend Server

For development:
```bash
npm run dev:server
```

To build and run:
```bash
npm run build
npm run start:server
```

**Test Endpoints:**
- `GET /health` : Returns `{ "status": "ok" }`
- `GET /api/test` : Returns `{ "message": "Crypto Forensics Tracer API is working" }`

## How to run tests
```bash
npm test
```
