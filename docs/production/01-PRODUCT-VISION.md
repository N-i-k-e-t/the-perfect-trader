# 01 — Product vision & principles

## Mission

**THE PERFECT TRADER** is a psychology-first discipline system for active traders. It optimizes **behavioral consistency** (rules, mood, compliance) so that P&amp;L becomes a byproduct of process—not the primary scorecard.

## Who it is for

| Persona | Need |
|---------|------|
| Day / swing trader | Stop revenge trades, track rule breaks, daily grade |
| Options / index trader (e.g. NIFTY) | Session prep, event calendar, streak discipline |
| Self-directed learner | Journal + AI-style coaching without a signal service |

## What we are

- A **discipline operating system** (rules, pre-session, trade log, diary scans)
- A **behavioral lab** (compliance score, indiscipline cost, patterns)
- A **PWA-ready web app** (mobile-first, installable)

## What we are not (legal & product boundary)

- Not financial advice, signals, or trade recommendations
- Not automated trading or broker execution
- Not a replacement for tax/compliance reporting

All entries are **manual** by design—accountability through intentional logging.

## Core loops (why each exists)

| Loop | Why |
|------|-----|
| **Pre-session** | Emotional baseline before risk; prevents trading blind |
| **Rule check + grade** | Makes discipline measurable (A–F), not vague guilt |
| **Trade log** | Links outcome to rules followed/broken |
| **Coach / insights** | Closes feedback: “what pattern is costing you?” |
| **Cloud sync** | Same identity across devices when logged in |

## Success metrics (product)

| Metric | Meaning |
|--------|---------|
| Daily active discipline log | User completed pre-session or logged trade |
| Rule adherence % | Rules followed / total rule checks |
| Streak days | Consecutive days with structured activity |
| Trial → Pro conversion | Willingness to pay for continued access |
| Retention (D7, D30) | Habit stickiness |

## Strategic phases

| Phase | Focus |
|-------|--------|
| **Now (MVP)** | Web PWA, Supabase auth + JSON snapshot, client-side agents |
| **Next** | OAuth callback, normalized DB tables, wire Gemini to trade entry |
| **Later** | Broker read-only import, team/coach view, native apps |

See [02-USER-FLOWS-AND-LOOPS.md](./02-USER-FLOWS-AND-LOOPS.md) for how loops work in the UI.
