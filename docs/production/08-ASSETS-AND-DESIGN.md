# 08 — Assets & design system

## Asset inventory (current)

### `public/`

| File | Purpose | Status |
|------|---------|--------|
| `manifest.json` | PWA metadata | OK |
| `favicon.svg` | Browser tab | OK |
| `icon-192.png` | PWA / Apple | **Missing** (manifest references) |
| `icon-512.png` | PWA splash | **Missing** |
| `next.svg`, `vercel.svg`, etc. | Placeholder | Remove from prod or ignore |

### External / CDN images

Marketing and onboarding reference URLs under `/brain/...` paths—verify hosting on production domain or move to `public/brain/`.

### Repo-level PDFs

`docs/assets/` — product research PDFs (not bundled in Next build).

### Legacy

`legacy/anchor/` — old Vite assets; do not deploy.

## Required assets for production launch

| Asset | Spec | Why |
|-------|------|-----|
| App icon 192×192 | PNG, brand mark | PWA install |
| App icon 512×512 | PNG | Splash / store |
| Apple touch icon | 180×180 | iOS home screen |
| OG image | 1200×630 | Social sharing (`metadata.openGraph`) |
| Favicon | SVG + ICO fallback | Tabs |

## Design system (code-level)

| Concern | Location |
|---------|----------|
| Colors, radius | `src/app/globals.css` `@theme` |
| Components | `src/components/*` (no separate UI kit) |
| Icons | `lucide-react` |
| Typography | Inter via `next/font` |

### Radius scale

- `--radius-xl`: 32px  
- `--radius-2xl`: 40px  
- `--radius-3xl`: 48px  

Cards and modals use large rounded corners—consistent “soft discipline” aesthetic.

## Naming conventions for new assets

```
public/
  icons/
    icon-192.png
    icon-512.png
    apple-touch-icon.png
  og/
    og-default.png
  brain/                    # product screenshots
    onboarding-dashboard.png
```

Use **kebab-case**; avoid spaces in filenames.

## Brand copy (source of truth)

`src/lib/brand.ts`:

- `APP_NAME` = "The Perfect Trader"
- `APP_NAME_SHORT` = "Perfect Trader"
- `STORAGE_KEY` = `perfect_trader_data`

All new UI strings should import from `brand.ts` or a future `copy.ts` i18n file.

## Motion & components to standardize

| Pattern | Examples |
|---------|----------|
| Primary CTA | Navy `#1a1a2e` filled button |
| Success | Green compliance badges |
| Danger | Red rule-break indicators |
| Sheets | SettingsSheet, PersonaSheet |
| Empty states | `EmptyState.tsx` |

**Future:** Extract `Button`, `Card`, `Badge` into `components/ui/` for Figma parity.

## Asset pipeline (recommended)

1. Design in Figma → export @2x PNG/WebP  
2. Place in `public/`  
3. Reference via `next/image` for optimization  
4. Document in this file when added  

See [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) for brand mark / logo decision.
