# Real Jetour T1 asset slot

Drop the production 3D asset here as **`jetour-t1.glb`** and the site will
automatically switch from the procedural replica to the real model
(auto-scaled to the true 4.705 m length, grounded and centered).

## Where to get the real asset
- **Best (for the official website): ask Jetour Pakistan's marketing/brand
  team for the OEM configurator asset.** It is their car and their site —
  the official CAD-derived GLB is the only legally clean source for
  commercial use.
- Marketplace alternative: "2026 Chery Jetour T1 with Interior" (MantangCG,
  ~268k polys, PBR textures, 96 MB) — ~$179 on TurboSquid / RenderHub,
  ~$95 on 3dmodels.org. Buy the **commercial/editorial license** that covers
  website use.
- There is NO free official download: Jetour's sites use 360° photo spinners
  (not WebGL), the official Jetour Sketchfab account has zero models, and the
  only free "T1" online is an AI image-to-3D generation that looks worse
  than the procedural build.

## Notes
- `.glb` files are git-ignored (too big for the repo) — serve them from this
  folder locally / from your host's storage in production.
- If the GLB's forward axis differs, the loader auto-rotates the longest
  horizontal axis to +Z.
