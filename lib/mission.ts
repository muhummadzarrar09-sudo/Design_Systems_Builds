export const NAV = ["Overview", "Telemetry", "Crew", "Logs", "Settings"] as const;
export type NavId = (typeof NAV)[number];

export const CREW = [
  { name: "Alvarez", role: "CDR", status: "nominal", note: "Command · suit 1" },
  { name: "Okoye", role: "PLT", status: "nominal", note: "Pilot · suit 2" },
  { name: "Voss", role: "MS1", status: "warn", note: "EVA prep · thermal" },
] as const;

export const LOGS = [
  { t: "14:28:10", level: "crit" as const, msg: "COMMS SYNC ERR", src: "Antenna array" },
  { t: "14:22:41", level: "warn" as const, msg: "LIFE SUPPORT DRIFT", src: "ECLSS" },
  { t: "14:15:00", level: "ok" as const, msg: "STAGE 2 INITIATION", src: "Propulsion" },
  { t: "14:08:17", level: "ok" as const, msg: "ORBITAL CORRECTION", src: "Guidance" },
  { t: "13:56:02", level: "info" as const, msg: "GROUND HANDOVER", src: "Comms" },
];

export const SUBSYSTEMS = [
  { sub: "Propulsion", value: "NOMINAL", ok: true },
  { sub: "Thermal", value: "NOMINAL", ok: true },
  { sub: "Power", value: "−4%", ok: true },
  { sub: "Life support", value: "WARN", ok: false },
  { sub: "Comms", value: "LINK", ok: true },
];
