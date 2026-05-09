export type PanelFamily = 'boeing-mcp' | 'airbus-fcu' | 'bombardier' | 'generic';

export interface PanelConfig {
  family: PanelFamily;
  displayName: string;
}

// One entry per aircraft (or family). Add entries to the registry array in
// registry.ts — never touch the registry lookup logic itself.
export interface AircraftEntry {
  /** Substrings matched case-insensitively against aircraft/0/name */
  namePatterns: string[];
  panel: PanelConfig;
}
