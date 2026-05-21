# System architecture (brief)

## Topology

```mermaid
flowchart TB
  subgraph clients [Clients]
    Web[Next.js 16 PWA]
    Mob[Flutter iOS Android]
  end

  subgraph edge [Hosting]
    Vercel[Vercel]
    Stores[App Store Play]
  end

  subgraph supa [Supabase Tokyo]
    Auth[Auth]
    PG[(Postgres RLS)]
    Snap[trader_snapshots jsonb]
  end

  subgraph ai [Server AI]
    API["/api/parse-trade"]
    Agents[Coach Risk Orchestrator]
  end

  Web --> Vercel
  Mob --> Stores
  Web --> Auth
  Mob --> Auth
  Web --> Snap
  Mob --> Snap
  Web --> Agents
  Web --> API
  API --> Gemini[(Gemini)]
  Auth --> PG
  Snap --> PG
```

## Layers

| Layer | Stack | Role |
|-------|--------|------|
| **Presentation** | React 19 / Flutter 3 | UI, navigation, forms |
| **App state** | Context reducer / Riverpod | Rules, trades, session, analytics |
| **Sync** | `supabase-data.ts` / `TraderSnapshotRepository` | Load + debounced upsert ~1.2s |
| **Local cache** | localStorage / Hive | Offline-first write, sync when online |
| **Backend** | Supabase only (v1) | Auth + one jsonb row per user |
| **AI** | Gemini via API route | Trade parse; coach logic mostly client |

## Monorepo (deploy units)

```mermaid
flowchart LR
  Root[Rulesyci-main repo]
  Root --> Src[src/ Next.js]
  Root --> Mob[mobile/ Flutter]
  Root --> SB[supabase/ migrations]
  Root --> Docs[docs/]
  Src --> Vercel
  Mob --> Stores
  SB --> Cloud[(Supabase cloud)]
```

## Security boundary

```mermaid
flowchart LR
  Public[anon JWT in client]
  Server[service role server only]
  Vault[secrets vault local]
  Public --> RLS[RLS auth.uid]
  Server -.->|never bundle| X[Browser]
  Vault --> Dev[CLI migrations]
```

See [../SECURITY_SECRETS.md](../SECURITY_SECRETS.md).
