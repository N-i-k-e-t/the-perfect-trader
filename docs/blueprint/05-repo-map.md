# Repository map (brief)

```mermaid
flowchart TB
  subgraph repo [Rulesyci-main]
    direction TB
    SRC[src/ Web app]
    MOB[mobile/ Flutter]
    SB[supabase/ DB migrations]
    DOC[docs/]
    SCR[scripts/]
  end

  SRC --> APP[src/app routes]
  SRC --> LIB[src/lib state agents]
  SRC --> COMP[src/components UI]

  MOB --> MLIB[mobile/lib features]
  MOB --> CORE[mobile/lib core data domain]

  DOC --> BP[docs/blueprint THIS FOLDER]
  DOC --> PROD[docs/production deep specs]
  DOC --> MOBDOC[docs/mobile]
```

## Paths that matter

| Path | Purpose |
|------|---------|
| `src/app/(app)/` | Logged-in screens (today, journal, …) |
| `src/lib/context.tsx` | Web state + persistence |
| `src/lib/supabase-data.ts` | Cloud snapshot CRUD |
| `src/lib/agents/` | Coach, risk, orchestrator |
| `mobile/lib/features/` | Auth, today, journal, rules, stats, settings |
| `mobile/lib/data/` | Snapshot repo, Hive, mapper |
| `supabase/migrations/` | Schema source of truth |
| `docs/blueprint/` | Architecture & flow visuals |
| `scripts/secrets/` | Encrypted vault tooling |

## Deploy targets

| Artifact | Target |
|----------|--------|
| `src/` | Vercel (root = repo) |
| `mobile/` | Google Play + App Store |
| `supabase/migrations/` | `npm run db:push:url` → cloud |

Full tree: [../PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)
