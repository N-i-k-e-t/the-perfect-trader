# Data flow

## Snapshot model (v1)

One row per user — no normalized trade tables yet.

```mermaid
erDiagram
  auth_users ||--|| trader_snapshots : owns
  auth_users {
    uuid id PK
  }
  trader_snapshots {
    uuid user_id PK
    jsonb data
    text version
    timestamptz updated_at
  }
```

**Inside `data` jsonb:** `user`, `session`, `rules[]`, `trades[]`, `dailyLogs[]`, `analytics`, `userModel` (optional).

Contract: [../mobile/DATA_CONTRACT.md](../mobile/DATA_CONTRACT.md)

## Sync sequence (web or mobile)

```mermaid
sequenceDiagram
  participant UI as Screen
  participant State as App state
  participant Local as localStorage / Hive
  participant SB as Supabase

  UI->>State: edit rules / trade / session
  State->>Local: write immediately
  State->>State: debounce 1.2s
  State->>SB: upsert trader_snapshots
  Note over SB: last-write-wins v1

  UI->>State: login
  State->>SB: select by user_id
  SB-->>State: hydrate jsonb
  State->>Local: cache
  State-->>UI: render
```

## Auth flow

```mermaid
sequenceDiagram
  participant U as User
  participant App as Client
  participant Auth as Supabase Auth
  participant DB as trader_snapshots

  U->>App: email password or OAuth
  App->>Auth: signIn / signUp
  Auth-->>App: session JWT
  App->>DB: load snapshot
  alt no row
    App->>DB: insert default snapshot
  end
```

## AI data path

```mermaid
flowchart LR
  T[trades] --> O[orchestrator]
  R[rules] --> O
  L[dailyLogs] --> O
  M[userModel] --> O
  O --> C[coachMessages]
  O --> I[insights]
  O --> A[riskAlerts]

  Upload[trade screenshot] --> API["POST /api/parse-trade"]
  API --> G[Gemini]
  G --> Parsed[trade fields]
```

Coach runs **client-side** today; parse-trade is **server-only** (`GEMINI_API_KEY`).
