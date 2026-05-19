# 07 — UI, UX & responsive design

## Design intent

**Mobile-first discipline app**—trader checks rules and logs trades on phone between sessions. Desktop is supported but secondary.

## Layout system

| Element | Spec |
|---------|------|
| Main column | `max-width ~430px` centered in `AppShell` |
| Touch targets | `min-height: 52px` (globals.css) |
| Inputs | `font-size: 16px` (prevents iOS zoom) |
| Safe areas | `env(safe-area-inset-*)` for notched phones |
| Font | Inter, tabular nums for figures |

## Color tokens (`globals.css`)

| Token | Value | Use |
|-------|-------|-----|
| `--color-primary` | `#1a1a2e` | Brand navy |
| `--color-success` | `#22c55e` | Wins, adherence |
| `--color-danger` | `#ef4444` | Losses, breaks |
| `--color-warning` | `#f59e0b` | Alerts |
| Text primary | `#1a1a2e` | Headings |
| Text secondary | `#94a3b8` | Labels |

## Device matrix

| Device class | Width | Experience |
|--------------|-------|------------|
| Phone | &lt; 480px | Primary: BottomTabs + FAB |
| Large phone / small tablet | 480–768px | Same layout, more whitespace |
| Tablet landscape | 768–1024px | Centered column; **Sidebar unused** |
| Desktop | &gt; 1024px | Centered column; consider enabling `Sidebar` |

**Production recommendation:** Mount `Sidebar` at `md:` breakpoint for desktop; keep BottomTabs on mobile.

## PWA

| Item | File | Status |
|------|------|--------|
| Manifest | `public/manifest.json` | `display: standalone`, `start_url: /today` |
| Icons | `icon-192.png`, `icon-512.png` | **Referenced but missing from repo** |
| Install prompt | `InstallPrompt.tsx` | Dismiss key in localStorage |
| Apple meta | `layout.tsx` | `appleWebApp` configured |

## Key interactions

| Interaction | Component | Feedback |
|-------------|-----------|----------|
| Log trade | FAB → CaptureHub | Multi-step; toast on save |
| Rule toggle | `/today` | Immediate grade recalc |
| Coach dismiss | InsightCards | `removeCoachMessage` |
| Settings | Header avatar | Sheet slide-over |
| Lab mode | Context flag | Hides chrome for focus |

## Accessibility (target)

| Area | Current | Target |
|------|---------|--------|
| Focus rings | Partial | Visible on all interactive |
| ARIA on modals | Partial | `role="dialog"`, focus trap |
| Color contrast | Generally good on white | Audit marketing dark sections |
| Motion | Framer Motion | `prefers-reduced-motion` |

## UX gaps for production

| Gap | User impact |
|-----|-------------|
| No desktop nav | Large screens feel phone-stretched |
| Broken journal detail link | Frustration on trade tap |
| Stats insights not saved | Inconsistent coach presence |
| Trial gate only client-side | Bypass risk if API added later |

## User capacity (UI perspective)

UI is **client-rendered**—each user’s session is independent. Bottleneck is not React; it’s **API/DB** (see [10-SCALING-AND-CAPACITY.md](./10-SCALING-AND-CAPACITY.md)).

Recommended soft limits for current architecture:

| Metric | Comfortable | Degrades |
|--------|-------------|----------|
| Trades in snapshot | &lt; 2,000 | Slow hydrate/save |
| Rules | &lt; 100 | Fine |
| Diary images in JSON | Avoid | Use Storage instead |
