# Design System Playground

A multi-theme design system showcase. **One app, seven design languages** — pick a style and the entire UI rebrands instantly. Each theme ships with its own light + dark mode.

## Design styles included

- 🪵 **Skeuomorphism** — tactile realism, serif typography, gradient fills
- 🎨 **Flat Design** — bold 2D, no shadows, vibrant
- 📐 **Material Design** — elevation, Roboto type, z-depth
- 🫧 **Neumorphism** — soft UI, dual-tone shadows, extruded
- 🪟 **Glassmorphism** — frosted glass, backdrop blur, Outfit type
- 🏺 **Claymorphism** — squishy 3D, Baloo type, playful pastels
- ✦ **Minimalism** — whitespace, Inter type, zero noise

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** with CSS custom properties
- **Self-hosted fonts** via `@fontsource/*` npm packages (zero external requests)

## Theming architecture

Every component renders using CSS variables (`--bg`, `--fg`, `--primary`, `--shadow`, `--radius-val`, etc.). Switching themes is just swapping the values of these vars on `<html>`:

```
[data-theme="skeuomorphism"] { --primary: #8b4513; --radius-val: 6px; ... }
[data-theme="flat"]          { --primary: #e17055; --radius-val: 0px; ... }
[data-theme="material"]      { --primary: #1976d2; --radius-val: 4px; ... }
// ...etc
```

No recompile. No flicker. Instant rebrand.

Typography follows the same rule: the `[data-theme="X"]` blocks are the single
source of truth for `--font-stack` / `--font-heading` / `--font-accent`, and
only reference family names that are actually registered via `@fontsource`
(e.g. `"Inter Variable"`, not `"Inter"`). Mode blocks own color only — they
must not define fonts, or their higher specificity silently overrides the
theme fonts.

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Using it

- **Hub (`/`)** — every card is a link straight into that theme's app, and each card
  carries a **live preview island**: a real mini-UI rendered in that theme's own
  design language (scoped `data-theme`, never interactive).
- **Themed app (`/app?theme=X&page=Y`)** — the theme's real pages are listed in
  the header tabs; the dropdown switches theme and updates the URL; the 🌙/☀️
  button toggles light/dark. Choices persist across refreshes with no flash.
- **Gear icon (hub + app)** — slide-in appearance panel: all 7 styles with live
  color swatches and a Light/Dark segmented toggle.
- **Hub footer** — live status from the internal API (`API: 7 themes online ✓`).

## Motion & feedback

Theme switching plays a **theme-aware ink-splash overlay** — it renders in the
new theme's colors with a spinner in that style's own language (minimal thin
ring, flat bouncing squares, material ripple rings, skeuo gear, neumo soft
pulse, glass frosted ring, clay squish blob). Sections enter with per-theme
entrance animations (fade-up, block rise, scale bloom, settle, blur-fade,
blur-drift, spring bounce), and the Material theme gets a true click ripple
that emanates from the cursor position. All of it honors
`prefers-reduced-motion`, and none of it needed an animation library.

## What each theme actually ships

Honest page counts — this table is generated from the same registry the router
uses (`src/themes/definitions.ts`), so it cannot drift from reality:

| Theme | Pages |
|---|---|
| 🪵 Skeuomorphism | 2 — Home, Dashboard |
| 🎨 Flat Design | 4 — Home, Pricing, Team, Stats |
| 📐 Material Design | 3 — Home, Principles, FAQ |
| 🫧 Neumorphism | 3 — Media, Settings, Profile |
| 🪟 Glassmorphism | 3 — Home, Features, Pricing |
| 🏺 Claymorphism | 2 — Home, Plans |
| ✦ Minimalism | 5 — Home, Principles, Writings, Contact, Works |

## Internal API

```
GET /api/themes        — list all 7 themes
GET /api/themes/[id]   — single theme lookup
```

## Project structure

```
src/
├── app/
│   ├── api/themes/        # internal JSON endpoints
│   ├── app/               # themed-app route (/app?theme=X)
│   ├── layout.tsx         # theme boot script + provider
│   ├── page.tsx           # hub
│   └── globals.css        # ALL theme CSS variables
├── components/
│   ├── dashboard/
│   │   ├── theme-hub.tsx      # hub UI (live preview islands + API status)
│   │   ├── theme-selector.tsx # dropdown switcher
│   │   ├── settings-panel.tsx # gear slide-in appearance panel
│   │   └── preview-islands.tsx
│   ├── effects/
│   │   ├── ink-splash.tsx     # theme-aware switch overlay + spinners
│   │   └── material-ripple.tsx# cursor-position ripple (material only)
│   └── sections/<theme>/     # one folder per design style
├── contexts/theme-context.tsx  # theme + persistence
├── themes/definitions.ts       # theme metadata
└── types/theme.ts
```
