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

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

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
│   │   ├── theme-hub.tsx      # hub UI
│   │   └── theme-selector.tsx # dropdown switcher
│   └── sections/<theme>/     # one folder per design style
├── contexts/theme-context.tsx  # theme + persistence
├── themes/definitions.ts       # theme metadata
└── types/theme.ts
```
