# Dictée Interactive

An interactive French dictation platform for learning spelling rules while writing.
Live at **[dicteeinteractive.fr](https://www.dicteeinteractive.fr)**.

Users play an audio dictation, type what they hear, and get real-time feedback on
misspelled words along with the underlying spelling rule and a per-dictation
leaderboard.

## Features

- Audio-based dictation with segmented playback
- Live word-by-word comparison and scoring
- Spelling-rule helpers surfaced on incorrect words
- Per-dictation ranking and personal best scores
- Difficulty levels (CE1 → adult)
- Google OAuth and email/password sign-in

## Tech stack

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript
- **Styling:** Tailwind CSS 4
- **Auth:** NextAuth v5 (Google + credentials)
- **Database:** PostgreSQL via Prisma 6
- **Hosting:** Vercel + Vercel Postgres
- **Other:** Framer Motion, Radix UI, next-sitemap

## Getting started

Requires **Node 22.x** and **Yarn**.

```bash
yarn install
cp .env.example .env.local   # then fill in the values
yarn prisma migrate deploy
yarn dev
```

The app is available at [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable                | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `POSTGRES_URL`          | Prisma connection string                 |
| `NEXTAUTH_SECRET`       | NextAuth session secret                  |
| `NEXTAUTH_URL`          | Base URL (e.g. `http://localhost:3000`)  |
| `GOOGLE_CLIENT_ID`      | Google OAuth client id                   |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth client secret               |

## Project structure

```
app/
├── (routes)/           # App Router pages: /, /dictee, /regle, /contact, /auth/*
├── api/                # Route handlers (auth, robots, sitemap)
├── components/         # Shared UI components
│   ├── auth/           # Login / logout / user chip
│   └── dictation/      # Dictation-screen sub-components
├── context/            # React context providers
├── hooks/              # Custom hooks (timer, scoring, word comparison, ...)
├── lib/                # Prisma client, data access, static datasets
├── ui/                 # Layout primitives (navbar, dropdown)
└── utils/              # Pure helpers (formatting, text)
prisma/                 # Prisma schema and migrations
public/                 # Static assets (audio, images, fonts)
```

## Scripts

| Command       | What it does                                        |
| ------------- | --------------------------------------------------- |
| `yarn dev`    | Start the dev server                                |
| `yarn build`  | Generate the Prisma client and build the app       |
| `yarn start`  | Run the production build                            |
| `yarn lint`   | Run ESLint                                          |

## License

This project is released for personal / portfolio purposes. Feel free to open an
issue or reach out via the contact page if you have questions.
