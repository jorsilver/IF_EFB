import type { AircraftEntry, PanelConfig } from './types';
import { boeing737 } from './boeing-737';

// ── Registry ──────────────────────────────────────────────────────────────────
// To add a new aircraft: create a new file (e.g. airbus-a320.ts), export an
// AircraftEntry, and append it to this array. Never edit the lookup logic below.

const REGISTRY: AircraftEntry[] = [
  boeing737,
  // airbus_a320,
  // bombardier_crj,
];

// ─────────────────────────────────────────────────────────────────────────────

const GENERIC: PanelConfig = {
  family: 'generic',
  displayName: 'Generic Autopilot',
};

export function resolvePanel(aircraftName: string): PanelConfig {
  const normalized = aircraftName.toLowerCase();
  for (const entry of REGISTRY) {
    if (entry.namePatterns.some((p) => normalized.includes(p.toLowerCase()))) {
      return entry.panel;
    }
  }
  return GENERIC;
}
