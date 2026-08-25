# Skeuo · Hi-Fi — Visual Reference

> **Source image:** `inspo/skeuo-hifi.jpg`
> **Subject:** A 1970s stereo receiver, photographed front-on against a dark background.
> **Purpose:** The single canonical reference for what a skeuomorphic UI should *feel* like — every pixel imitates a real physical object, lit by warm side-light, with materials you can almost touch.

---

## What's in the image (and why it matters)

The reference is divided into a **strict 3-row, symmetric layout** that maps cleanly to a web/UI grid:

```
┌──────────────────────────────────────────────────────────────────┐
│  ROW 1  │   [VU METER]   │   [TUNER DIAL — wide]   │  [VU METER]   │
│  ROW 2  │       (wood)       │   [8 PUSH-BUTTONS]   │  [VOLUME KNOB]│
│  ROW 3  │  [small switches]  │  [CASSETTE DECK]     │  [BASS/TRE/BAL]│
└──────────────────────────────────────────────────────────────────┘
        ↑ walnut wood end-caps          brushed aluminum faceplate
```

### 1. Cabinet (the frame)
- **Walnut wood end-caps** on the left and right, with visible vertical grain
- **Brushed aluminum faceplate** in the center, with horizontal grain and a soft top-down highlight
- Subtle shadow under the unit on a wood surface (it's sitting on a desk)

### 2. Top row — the "hero" instruments
- **Two large circular VU meters** (left + right channel)
  - Chrome bezel (thick, polished, with a clear top-edge highlight)
  - Cream parchment face, slightly aged
  - Black tick marks + black numerals (0, 20, 40, 60, 80, 100)
  - Black sub-scale (VU decibels)
  - **Orange glowing needle** with a counterweight
  - Red zone on the right side
  - "dB" label and "POWER OUTPUT" / "LEFT/RIGHT CHANNEL" text engraved at the bottom
  - Brass center cap

- **One wide horizontal tuner dial** in the middle
  - Recessed into the aluminum (shadow around the edges)
  - **Backlit with warm orange glow** (this is the most skeuomorphic element — light *through* a physical surface)
  - Two scales: FM (88–108 MHz) on top, AM (550–1600 kHz) on bottom
  - A vertical orange indicator line marking the tuned frequency
  - "STEREO RECEIVER" engraved above

### 3. Middle row — input selectors + the big knob
- **Row of 8 round chrome push-buttons** in the center
  - POWER (with a glowing green LED to its left when on)
  - PHONO 1, PHONO 2, AUX, FM, AM, TAPE 1, TAPE 2
  - Engraved labels above each
  - The pressed one has a slightly different (lit) appearance
- **One large chrome volume knob** on the far right
  - **Knurled edge** (visible vertical ridges around the perimeter)
  - Numbered 0–10 around the arc
  - "VOLUME" label

### 4. Bottom row — utility controls
- **Left:** PHONES jack (small black circle), SPEAKER toggle (2-position chrome), HIGH FILTER toggle
- **Center:** Cassette deck slot — the iconic window with two visible spools and a "70'S MIX" label on the cassette face, plus a small **tape counter** (mechanical number display showing "104")
- **Right:** Three small chrome knobs — BASS, TREBLE, BALANCE — each numbered 0–10 with the same knurled-edge treatment

### 5. Engraved text
- "LEFT CHANNEL" and "RIGHT CHANNEL" sit *above* the VU meters, in small sans-serif engraved type
- "STEREO RECEIVER" appears twice (top and middle-left) — the same engraved-text style throughout
- Every label is **engraved into the metal**, not printed on top of it

---

## Material palette (the hex codes to use)

| Surface | Color | Notes |
|---|---|---|
| Walnut wood | `#3a1c0a` → `#2a1208` | Vertical grain, warm |
| Brushed aluminum | `#b8bcc0` base, `#dde0e2` highlights | Horizontal grain |
| Chrome (bezels, knobs) | `#e8eaec` → `#8a8e92` → `#3a3e42` | Radial gradient, polished |
| Cream face | `#f4ead0` → `#d8c8a0` | Slightly aged parchment |
| Needle orange | `#e85a10` (body), `#ffd060` (glow) | Emissive |
| Tuner backlight | `#ff9020` → `#c85010` (gradient) | The hot center |
| Power LED green | `#5aff30` with bloom | |
| Engraved text | `#1a1208` | Looks pressed into metal |
| Engraved shadows | White text-shadow `0 1px 0 rgba(255,255,255,0.4)` | Gives the press-into effect |

---

## What the 3D build will reproduce

When this becomes the live 3D scene at `/`, every element above will be a real Three.js object:

| In the image | In the 3D build |
|---|---|
| Walnut end-caps | Two `boxGeometry` blocks with procedural wood-grain CanvasTexture, `roughness: 0.6` |
| Brushed aluminum faceplate | One large box with brushed-aluminum CanvasTexture, `metalness: 0.85`, `roughness: 0.42` |
| 2 VU meters | `torusGeometry` chrome bezel + cream `cylinderGeometry` face plate (procedural face texture) + orange needle group + brass center cap + glass cover |
| Tuner dial | Recessed box with an emissive orange backlight plane behind a face plate with FM/AM numbers + a moving orange indicator line |
| 8 push-buttons | Round chrome `cylinderGeometry` bases + chrome paddle cylinders, click to "press" |
| Volume knob | Tall chrome cylinder with knurled-edge ring, drags to rotate, numbered 0-10 around base |
| 3 small knobs (bass/treble/balance) | Smaller version of the volume knob |
| Cassette deck | Recessed box with the cassette-window texture (two black "spools" + a label) |
| Tape counter | Small mechanical-style numeric display, ticking up over time |
| Power LED | Small sphere with emissive material + bloom |
| Engraved text | CanvasTexture with text drawn in dark color, applied to flat planes slightly raised above the faceplate |
| Wood desk below | Large plane with wood-grain texture, receives the contact shadow |

---

## Why this is the *correct* skeuomorphism reference

The aviation panel failed because it was *retro-futurism* (gauges = abstraction).
The leather planner failed because it was *bookbinding* (not what people mean by "skeuo").

This hi-fi works because:

1. **Every UI element is also a real object you can buy** — VU meters, knobs, push-buttons, cassette deck, LED. The metaphor is *direct*, not abstract.
2. **The light tells the story** — the orange tuner backlight, the warm side-light, the green LED. Skeuomorphism lives or dies on lighting.
3. **The materials are tactile** — wood, aluminum, chrome, cream paper. You can tell what each thing would *feel* like to touch.
4. **It maps 1:1 to a UI layout** — top row (hero info), middle row (input + master), bottom row (utility). That's a clean grid you can fill with real app data.
