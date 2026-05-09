'use strict';

const IFC2 = require('ifc2');
const { WebSocketServer, OPEN } = require('ws');

const WSS_PORT = 8080;

// All states polled continuously and streamed to the frontend
const POLL_STATES = [
  'aircraft/0/name',
  'aircraft/0/systems/autopilot/on',
  'aircraft/0/systems/autopilot/alt/on',
  'aircraft/0/systems/autopilot/alt/target',
  'aircraft/0/systems/autopilot/vs/on',
  'aircraft/0/systems/autopilot/vs/target',
  'aircraft/0/systems/autopilot/hdg/on',
  'aircraft/0/systems/autopilot/hdg/target',
  'aircraft/0/systems/autopilot/spd/on',
  'aircraft/0/systems/autopilot/spd/target',
  'aircraft/0/systems/autopilot/spd/mode',
  'aircraft/0/systems/autopilot/nav/on',
  'aircraft/0/systems/autopilot/approach/on',
  'aircraft/0/altitude_msl',
  'aircraft/0/indicated_airspeed',
  'aircraft/0/vertical_speed',
  'aircraft/0/heading_magnetic',
  'aircraft/0/groundspeed',
  'aircraft/0/flightplan/route',
  'aircraft/0/flightplan/coordinates',
  'aircraft/0/flightplan/next_waypoint_name',
  'aircraft/0/systems/nav_sources/gps/next_waypoint_name',
  'aircraft/0/systems/transponder/1/code',
  'aircraft/0/fuel_weight',
];

// ── WebSocket server ──────────────────────────────────────────────────────────

const wss = new WebSocketServer({ port: WSS_PORT });
const clients = new Set();

function broadcast(msg) {
  const json = JSON.stringify(msg);
  for (const ws of clients) {
    if (ws.readyState === OPEN) ws.send(json);
  }
}

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected (${clients.size} total)`);

  // Send current state snapshot so the UI is populated immediately
  const snapshot = {};
  for (const [key, entry] of Object.entries(IFC2.ifData || {})) {
    snapshot[key] = entry.data;
  }
  ws.send(JSON.stringify({ type: 'snapshot', states: snapshot }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'set' && msg.key != null && msg.value != null) {
        console.log(`[WS→IF] set ${msg.key} = ${msg.value}`);
        IFC2.set(msg.key, msg.value);
      } else if (msg.type === 'run' && msg.command) {
        console.log(`[WS→IF] run ${msg.command}`);
        IFC2.run(msg.command);
      }
    } catch (e) {
      console.error('[WS] Bad message:', e.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected (${clients.size} remaining)`);
  });
});

console.log(`[WS] Server listening on port ${WSS_PORT}`);

// ── IF Connect via ifc2 ───────────────────────────────────────────────────────

IFC2.on('IFC2manifest', () => {
  console.log('[IF] Manifest loaded — registering poll states');
  for (const state of POLL_STATES) {
    try {
      IFC2.pollRegister(state);
    } catch (e) {
      // State name not found in manifest — skip silently, log for debugging
      console.warn(`[IF] Skipping "${state}": not in manifest`);
    }
  }
  broadcast({ type: 'manifest_ready' });
});

IFC2.on('IFC2data', (data) => {
  broadcast({ type: 'state', key: data.command, value: data.data });
});

IFC2.on('IFC2msg', (msg) => {
  if (msg.code === 'connect') {
    console.log(`[IF] TCP connected (${msg.context})`);
    if (msg.context === 'client') broadcast({ type: 'if_connected' });
  } else if (msg.code === 'close' || msg.code === 'error') {
    console.log(`[IF] ${msg.code} (${msg.context}): ${msg.msg || ''}`);
    broadcast({ type: 'if_disconnected', reason: msg.code });
  } else if (msg.code === 'reconnected') {
    console.log(`[IF] Reconnected (${msg.context})`);
    broadcast({ type: 'if_connected' });
  }
});

IFC2.init(() => {
  console.log('[IF] Init complete — polling active');
}, {
  enableLog: false,
  doReconnect: true,
  // pollThrottle: 0 — no artificial delay; local WiFi RTT keeps pace naturally
  pollThrottle: 0,
});
