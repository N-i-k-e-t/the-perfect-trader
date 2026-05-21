# Design and UX guidelines

## Brand (locked from web)

| Token | Value | Usage |
|-------|-------|-------|
| Primary background | `#1a1a2e` | App shell, headers |
| Accent | `#f59e0b` | CTAs, highlights |
| Text | Light on dark | Mobile-first dark theme |

Source: [`src/app/globals.css`](../../src/app/globals.css), [`mobile/lib/core/theme/app_theme.dart`](../../mobile/lib/core/theme/app_theme.dart)

## Identity

Psychology-first **discipline** app — not signals, not financial advice. Copy must reinforce behavior and rule adherence.

## Navigation (mobile Phase 1)

Bottom tabs (match web mobile):

| Tab | Route | Purpose |
|-----|-------|---------|
| Today | `/today` | Pre-session, grade |
| Journal | `/journal` | Trades |
| Rules | `/rules` | Active rules |
| Settings | `/settings` | Account, sync |

## UX principles

- **Log a trade in &lt; 30 seconds** (target)
- Pre-session psychology: strongly encouraged; blocking trades on bad mood = product decision (TBD)
- Empty states: sample rules or guided setup for new users
- Loading: prefer skeleton/shimmer over blocking spinners on lists
- Errors: SnackBar for transient; dialog for destructive
- Input font size ≥ 16sp on mobile (avoid iOS zoom on focus)

## Platform adaptation

| Pattern | iOS | Android |
|---------|-----|---------|
| Back | Swipe + back chevron | System back |
| Date/time | Cupertino pickers where appropriate | Material pickers |
| Safe area | Notch, Dynamic Island | Status bar, gesture nav |

## Web (Next.js)

Separate codebase under `src/`. Max width ~430px in app shell. Do not assume Flutter Web parity for v1.

## Accessibility checklist

- [ ] Semantic labels on icon-only buttons
- [ ] Contrast ratio on accent text
- [ ] VoiceOver / TalkBack pass on auth + Today flow
- [ ] Tap targets ≥ 44pt

## Open design questions

See [MASTER_QUESTIONS.md](./MASTER_QUESTIONS.md) §4. Track Figma link when available.
