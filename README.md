# Design Language Pills — Design Systems Builds

A pure-black, muted-brass-accented multi-select picker. **Hover a pill and it becomes the design style it names** — brushed metal, blunt flat, ripples, frost, squish and silence. All hand-rolled CSS, no images, no UI libraries.

Built with **Next.js (App Router) + Node**, styled with CSS variables and `:has()`.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | RSC + client islands, static prerender, zero config dev/prod |
| Runtime | Node 22 | bundled, no transpilation surprises |
| Language | TypeScript (strict) | the build catches `.style`-on-`Element` bugs before they ship |
| Fonts | `@fontsource/*` (self-hosted) | build never depends on Google Fonts at runtime — fully offline-buildable |
| Styling | Plain CSS + CSS variables | the whole trick is per-style hand-tuned CSS; a utility framework would just be abstraction |

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

## Structure

```
app/
  layout.tsx        # fonts, metadata, viewport (dark, #000000)
  page.tsx          # hero + pill list + sticky summary bar
  globals.css       # tokens + all per-style hover/checked states
components/
  Background.tsx    # ambient glows + grain + cursor spotlight (delegated)
  StyleRow.tsx      # one pill: label > hidden checkbox + styled row
  StyleChip.tsx     # per-style idle mini-icon (pure CSS pseudo-elements)
  SummaryBar.tsx    # sticky count, removable pills, select-all/clear
hooks/
  useStyleSelection.ts  # selection state, localStorage persistence
lib/
  styles.ts         # the seven design languages, in order
legacy/
  index.html        # the original single-file version (kept for reference)
```

## The seven pills (hover to see each become itself)

1. **Skeuomorphism** — brushed-metal texture + looping gloss sweep, pressed-brass checked state
2. **Flat design** — blunt warm-white card, black rules, zero shadows, slamming edge bar
3. **Material Design** — elevation lift + looping ripple + bobbing FAB
4. **Neumorphism (soft UI)** — dual soft shadows, 26px radius, gentle float; checked = inset "on"
5. **Glassmorphism** — `backdrop-filter` frost + endlessly sweeping sheen
6. **Claymorphism** — terracotta blob, breathing `border-radius` + squish loop; checked stays clay, never stuck squashed
7. **Minimalism** — strips to nothing but a drawing gold underline

## Details that make it "true CSS"

- Real `<input type="checkbox">` hit targets → click, `Tab`+`Space`, screen readers, all native
- `:has(input:checked)` drives every selected state — no JS styling
- Keyframes for: ripple, gloss sweeps, clay morph/squish, soft-UI float, check ping, entrance rows
- `prefers-reduced-motion` support
- Selection persists in `localStorage`
- Cursor-following gold spotlight via `--mx`/`--my` custom properties

Hand-built by Z · Rawalpindi, PK
