# THE PERFECT TRADER — Project structure

> Repo is **flat**: the Next.js app lives at the **repository root** (not in a subfolder).  
> Vercel **Root Directory** = `.` (repository root).

## Repository tree

```
                 ← rename local folder (was Rulesyci-main)
│
├── README.md                       ← start here
├── package.json                    ← npm scripts (dev, build, db:*)
├── .env.local                      ← secrets (gitignored)
├── .env.local.example
│
├── src/                            ← application code
│   ├── app/                        ← Next.js routes
│   ├── components/                 ← UI
│   ├── lib/                        ← context, agents, brand, supabase-data
│   ├── types/
│   └── utils/supabase/
│
├── public/                         ← static assets, manifest, favicon
├── supabase/                       ← migrations, config.toml, seed
├── scripts/                        ← setup-supabase.ps1, sync-env-local.ps1
│
├── docs/                           ← all documentation
│   ├── blueprint/                  ← **diagrams: architecture, flows, mind map**
│   ├── MASTER_AI_PROMPT.md         ← paste into AI tools
│   ├── PROJECT_STRUCTURE.md        ← this file
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── SUPABASE.md
│   ├── production/                 ← 01–10 production specs
│   ├── guides/
│   │   ├── LOCAL_DEVELOPMENT.md
│   │   └── CLOUD_DEPLOYMENT.md
│   ├── supabase/                   ← project credentials (local.md gitignored)
│   └── assets/                     ← PDF references
│
└── legacy/                         ← not deployed
    ├── anchor-app/                 ← old Vite prototype
    ├── anchor-root/
    ├── DisciplineOS/
    ├── apks/
    ├── refernce-ui/
    └── scripts/                    ← old .bat files
```

## What lives where

| You want to… | Go to |
|--------------|--------|
| Change UI / pages | `src/app/`, `src/components/` |
| Change global state | `src/lib/context.tsx` |
| Change AI agents | `src/lib/agents/` |
| Change DB schema | `supabase/migrations/*.sql` → `npm run db:push` |
| Change env / keys | `.env.local` + `docs/supabase/` |
| Product / flow specs | `docs/production/` |
| Run locally | [guides/LOCAL_DEVELOPMENT.md](./guides/LOCAL_DEVELOPMENT.md) |
| Deploy cloud | [guides/CLOUD_DEPLOYMENT.md](./guides/CLOUD_DEPLOYMENT.md) |

## Naming

| Layer | Value |
|-------|--------|
| Product | **The Perfect Trader** |
| npm package | `the-perfect-trader` |
| localStorage | `perfect_trader_data` |
| Supabase table | `trader_snapshots` |
| Supabase project | `firqlsjixojnrofycwbs` |

## Daily commands (from repo root)

```powershell
npm run dev
npm run build
npm run db:push
npm run db:studio
```

## Production documentation

[production/README.md](./production/README.md)
