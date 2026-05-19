# Discipline formulas (user-facing spec)

**Implementation:** `src/lib/discipline.ts`

## What we measure

THE PERFECT TRADER scores **process**, not market P&L. Numbers below are visible on **Today**, **Calendar**, and **Stats**.

---

## 1. Rule checklist score (0–100)

Used on the home screen when you tick daily rules:

```
score = (rules checked ÷ active rules) × 100
```

Example: 8 of 10 rules checked → **80%**.

---

## 2. Full daily compliance (0–100)

When pre-plan and post-note are tracked:

| Component | Weight |
|-----------|--------|
| Rule checklist | 50% |
| Pre-session plan logged | 25% |
| Post-session review logged | 25% |

```
daily = (rules_checked/active × 50) + (pre_plan ? 25 : 0) + (post_note ? 25 : 0)
```

Capped at **100**.

---

## 3. Letter grade

| Score | Grade |
|-------|-------|
| 90–100 | A |
| 80–89 | B |
| 70–79 | C |
| 60–69 | D |
| 1–59 | F |
| 0 | None |

---

## 4. Streaks and “perfect” days

| Concept | Rule |
|---------|------|
| Streak day | Daily compliance **≥ 75%** |
| Perfect day | Compliance **= 100%** (calendar badges) |

---

## 5. What we do NOT compute

- Buy/sell signals or position sizing advice
- Tax or brokerage P&L guarantees
- Automated trading actions

Indiscipline cost and AI coaching use **behavioral** inputs (broken rules, mood, patterns)—see agent modules under `src/lib/agents/`.
