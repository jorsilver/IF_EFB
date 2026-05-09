export type Tab = 'ap' | 'fms' | 'live';

export type ConnectionStatus =
  | 'connecting'       // Trying to reach the WS server
  | 'ws_connected'     // WS up, waiting for IF
  | 'ready'            // IF connected + manifest loaded, polling active
  | 'if_disconnected'  // IF TCP dropped (WS still alive)
  | 'disconnected';    // WS down

export interface IFStates {
  [key: string]: unknown;
}

export type SendCommand =
  | { type: 'set'; key: string; value: unknown }
  | { type: 'run'; command: string };
