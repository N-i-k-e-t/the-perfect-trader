# User flows

## Journey (high level)

```mermaid
flowchart LR
  A[Landing /] --> B[Signup]
  B --> C[Onboarding]
  C --> D[Today]
  D --> E[Pre-session]
  E --> F[Log activity]
  F --> G[Stats feedback]
  G --> D
```

## Daily discipline loop (core)

```mermaid
flowchart TD
  Start([Open app]) --> Load[Hydrate snapshot]
  Load --> Pre{Pre-session done?}
  Pre -->|no| Mood[Baseline mood + energy]
  Mood --> Rules[Check active rules]
  Rules --> Lock[Optional lock rules]
  Lock --> PreY[preSessionComplete = true]
  Pre -->|yes| Today[Today dashboard]
  PreY --> Today
  Today --> Act{Action}
  Act --> Trade[Log trade FAB / Journal]
  Act --> Note[Capture note voice photo]
  Act --> Scan[Diary scan]
  Trade --> Grade[Update compliance grade]
  Note --> Grade
  Scan --> Grade
  Grade --> Stats[Stats coach insight]
  Stats --> Sync[Save to Supabase]
  Sync --> End([Loop tomorrow])
```

**Why:** Without pre-session + graded check-in, the app is just another journal—this loop is the product.

## Route map — web

```mermaid
flowchart TB
  subgraph public [Public]
    home[/]
    login[/login]
    signup[/signup]
    pricing[/pricing]
  end

  subgraph app [Authenticated]
    today[/today]
    journal[/journal]
    calendar[/calendar]
    stats[/stats]
    rules[/rules]
    diary[/diary]
    settings[/settings]
  end

  login --> today
  signup --> onboarding[/onboarding]
  onboarding --> today
```

**Bottom nav (mobile web):** Today · Diary · Calendar · Rules · Stats

## Route map — Flutter mobile

```mermaid
flowchart TB
  auth[Auth login signup]
  auth --> shell[Bottom nav shell]
  shell --> t[/today]
  shell --> j[/journal]
  shell --> s[/stats]
  shell --> r[/rules]
  shell --> set[/settings]
  t --> pre[/pre-session]
  j --> add[/journal/add]
```

## Trial gate

```mermaid
flowchart TD
  Login[Authenticated] --> Trial{trial expired?}
  Trial -->|no or Pro| App[Full app]
  Trial -->|yes| Block[Trial expired screen / pricing]
```

## Capture sub-flow (web)

```mermaid
stateDiagram-v2
  [*] --> initial: FAB tap
  initial --> checklist: Log trade
  initial --> note: Quick note
  initial --> voice: Voice
  initial --> photo: Photo
  checklist --> [*]: ADD_TRADE
  note --> [*]: save
```
