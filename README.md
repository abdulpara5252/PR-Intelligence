# PR Intelligence

Dashboard for pull request metrics, engineer performance, and AI-generated PR insights. Monorepo with a NestJS GraphQL API and a Next.js frontend.

## Prerequisites

- Node.js 20+
- PostgreSQL
- Redis

## Setup

### Backend

```bash
cd backend
npm install
cp .env.local.example .env.local
```

Edit `backend/.env.local` with your database, Redis, GitHub, and OpenAI credentials.

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

`NEXT_PUBLIC_API_URL` should point to the backend (default `http://localhost:3001`).

## Run

Start PostgreSQL and Redis, then run both apps:

```bash
# Terminal 1 — backend (port 3001)
cd backend
npm run start:dev

# Terminal 2 — frontend (port 3000)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
