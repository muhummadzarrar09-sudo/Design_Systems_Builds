/* Headless smoke test for the *browser* code path: canvas textures,
   badge materials and the merged build all run exactly as they do in the
   page.  Run with `npx tsx scripts/browserpath.ts`. */
/* Minimal document/canvas stub — enough for the procedural texture
   painters to run head-less so the browser code path is exercised. */
const noop = () => {};
const ctx2d = new Proxy(
  {
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createPattern: () => null,
    getImageData: (_x: number, _y: number, w: number, h: number) => ({
      data: new Uint8ClampedArray(Math.max(4, w * h * 4)),
      width: w,
      height: h,
    }),
    measureText: () => ({ width: 10 }),
  } as Record<string, unknown>,
  {
    get(t, k) {
      if (k in t) return t[k as string];
      return noop;
    },
    set() {
      return true;
    },
  },
);
class CanvasStub {
  width = 512;
  height = 512;
  style: Record<string, string> = {};
  getContext() {
    return ctx2d;
  }
  toDataURL() {
    return "data:image/png;base64,";
  }
  addEventListener() {}
  removeEventListener() {}
}
const g = globalThis as unknown as Record<string, unknown>;
g.self = g;
g.HTMLCanvasElement = CanvasStub;
g.OffscreenCanvas = CanvasStub;
g.ImageData = class {
  data: Uint8ClampedArray;
  constructor(d: Uint8ClampedArray | number, w?: number) {
    this.data = typeof d === "number" ? new Uint8ClampedArray(d * (w ?? 1) * 4) : d;
  }
};
g.document = {
  createElement: (tag: string) => (tag === "canvas" ? new CanvasStub() : { style: {}, appendChild: noop, setAttribute: noop }),
  createElementNS: () => new CanvasStub(),
  body: { appendChild: noop },
};
g.window = { devicePixelRatio: 1, innerWidth: 1280, innerHeight: 720, addEventListener: noop };

async function main() {
  const { buildJetourT1 } = await import("../components/scene/JetourT1");
  const t0 = Date.now();
  const { group, wheels } = buildJetourT1({ textures: true, merge: true });
  let meshes = 0;
  let tris = 0;
  group.traverse((o) => {
    const m = o as import("three").Mesh;
    if (!m.isMesh) return;
    meshes++;
    const geo = m.geometry as import("three").BufferGeometry;
    const n = geo.index ? geo.index.count : geo.attributes.position.count;
    tris += n / 3;
  });
  console.log(`browser-path build ok · meshes ${meshes} · tris ${Math.round(tris)} · wheels ${wheels.length} · ${Date.now() - t0} ms`);
}
try { void main(); } catch (e) { console.error(e); process.exit(1); }
