"use client";

/* ===================================================================
   JETOUR T1 — 1:1 procedural replica (website / configurator grade)
   ─────────────────────────────────────────────────────────────────
   True envelope: 4705 × 1967 × 1843 mm · wheelbase 2800 mm
                  front overhang 918 · rear overhang 987
                  track 1690 / 1700 · 235/60 R19 on 19" petal alloys
   buildJetourT1() is pure three.js so scripts/shot.ts and
   scripts/inspect.ts can rasterise / audit it headlessly.
   +Z = nose, +Y = up, +X = the car's LEFT (driver's side, LHD).
   =================================================================== */

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  DIM,
  Kit,
  clusterTex,
  makeMats,
  mergeByMaterial,
  screenTex,
  wordTex,
  type Mats,
} from "./t1/kit";
import {
  buildBodyShell,
  buildCladding,
  buildDoorHardware,
  buildGreenhouse,
  buildRoof,
  buildTailgate,
} from "./t1/body";
import { buildCowl, buildDetails, buildFront, buildRear, placeWheels } from "./t1/exterior";
import { buildInterior } from "./t1/interior";

export type BuildOpts = { textures?: boolean; merge?: boolean };

/** badge / UI materials that need a <canvas> (browser only) */
function makeBadges(textures: boolean) {
  if (!textures) return { plate: null, word: null, screen: null, cluster: null };
  const plateTex = wordTex("T1", { color: "#f2f2f2", bg: "#111317", spacing: 10, size: 110 });
  const wordTexT = wordTex("JETOUR", { color: "#e6ebef", spacing: 62, size: 78 });
  const screenT = screenTex();
  const clusterT = clusterTex();

  const plate = plateTex
    ? new THREE.MeshStandardMaterial({
        name: "plate",
        map: plateTex,
        roughness: 0.4,
        metalness: 0.15,
      })
    : null;
  const word = wordTexT
    ? new THREE.MeshStandardMaterial({
        name: "wordmark",
        map: wordTexT,
        transparent: true,
        roughness: 0.22,
        metalness: 0.95,
        envMapIntensity: 1.6,
      })
    : null;
  const screen = screenT
    ? new THREE.MeshStandardMaterial({
        name: "infotainment",
        color: "#000000",
        emissive: new THREE.Color("#ffffff"),
        emissiveMap: screenT,
        emissiveIntensity: 1.25,
        roughness: 0.25,
      })
    : null;
  const cluster = clusterT
    ? new THREE.MeshStandardMaterial({
        name: "cluster",
        color: "#000000",
        emissive: new THREE.Color("#ffffff"),
        emissiveMap: clusterT,
        emissiveIntensity: 1.35,
        roughness: 0.25,
      })
    : null;
  return { plate, word, screen, cluster };
}

export function buildJetourT1(opts?: BuildOpts) {
  const textures = opts?.textures ?? typeof document !== "undefined";
  const merge = opts?.merge ?? true;
  const mats: Mats = makeMats();
  const kit = new Kit(mats);
  const badges = makeBadges(textures);

  /* structure */
  buildBodyShell(kit);
  buildGreenhouse(kit);
  buildRoof(kit);
  buildTailgate(kit, badges.plate);
  buildCladding(kit);
  buildDoorHardware(kit);
  buildCowl(kit);

  /* lamps / bumpers / badges */
  buildFront(kit, badges.plate);
  buildRear(kit, badges.word);
  buildDetails(kit);

  /* cabin */
  buildInterior(kit, badges.screen, badges.cluster);

  /* wheels — one template cloned to the four corners */
  const wheels = placeWheels(kit);

  /* collapse hundreds of little parts into one draw call per material
     (wheel groups stay separate so they can still be spun) */
  if (merge) mergeByMaterial(kit.group);

  kit.group.name = "jetour-t1";

  return { group: kit.group, mats, wheels };
}

/* ---------------- React wrapper ---------------- */

function HeadBeam({ x, night }: { x: number; night: boolean }) {
  const { light, target, cone } = useMemo(() => {
    const l = new THREE.SpotLight("#eaf4ff", night ? 120 : 0, 26, 0.52, 0.6, 1.3);
    l.position.set(x, 1.0, 2.3);
    const t = new THREE.Object3D();
    t.position.set(x * 1.5, -0.2, 14);
    l.target = t;
    const c = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 9, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: "#cfe6ff",
        transparent: true,
        opacity: 0.055,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    c.position.set(x * 1.35, 0.72, 7.2);
    c.rotation.x = Math.PI / 2;
    return { light: l, target: t, cone: c };
  }, [x, night]);
  return (
    <>
      <primitive object={light} />
      <primitive object={target} />
      {night && <primitive object={cone} />}
    </>
  );
}

export function JetourT1({
  paint = "#93b3a1",
  night = false,
  wheels = true,
}: {
  paint?: string;
  night?: boolean;
  wheels?: boolean;
}) {
  const { group, mats } = useMemo(() => buildJetourT1(), []);

  useEffect(() => {
    mats.paint.color.set(paint);
  }, [mats, paint]);

  useEffect(() => {
    mats.drl.emissiveIntensity = night ? 6.5 : 1.1;
    mats.tail.emissiveIntensity = night ? 4.2 : 1.0;
    mats.stopLamp.emissiveIntensity = night ? 3.4 : 0.8;
    mats.amber.emissiveIntensity = night ? 2.6 : 0.15;
    mats.indicator.emissiveIntensity = night ? 3.0 : 0.2;
    mats.ambient.emissiveIntensity = night ? 3.4 : 1.4;
    mats.dome.emissiveIntensity = night ? 3.0 : 0.6;
    mats.beam.emissiveIntensity = night ? 1.6 : 0.25;
  }, [mats, night]);

  useEffect(() => {
    group.traverse((o) => {
      if ((o as THREE.Object3D).name.startsWith("wheel-") || o.userData.wheel) {
        o.visible = wheels;
      }
    });
  }, [group, wheels]);

  return (
    <>
      <primitive object={group} />
      <HeadBeam x={0.79} night={night} />
      <HeadBeam x={-0.79} night={night} />
    </>
  );
}

export { DIM };
