# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# IF-EFB — Infinite Flight Electronic Flight Bag

## Project Overview
A web dashboard that connects to Infinite Flight via the Connect API and renders interactive cockpit panels (MCP/FCU autopilot panel, FMS CDU scratchpad, live flight data).

## Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS v4 (`/client`)
- Backend: Node.js + `ifc2` (IF Connect client) + `ws` (WebSocket server) (`/server`)

## Dev Commands

**Backend** (run first; requires IF running on same WiFi network):
```bash
cd server && node index.js          # production
cd server && npm run dev            # auto-restart on file changes (node --watch)
```

**Frontend:**
```bash
cd client && npm install            # first time only
cd client && npm run dev            # Vite dev server — http://localhost:5173
cd client && npm run build          # type-check + production bundle
cd client && npm run lint           # ESLint
```

## Key Architecture Decisions
- Backend connects to IF via `ifc2` npm package (handles UDP discovery + TCP automatically)
- Backend runs a WebSocket server on **port 8080** that streams IF states to the frontend in real time
- Frontend connects via WebSocket (`ws://localhost:8080`) and accumulates state into a single flat object
- The `useIFConnection` hook is the single source of truth for all IF state on the frontend

## WebSocket Message Protocol

**Server → Client:**
| `type`           | Payload                                | Meaning                                 |
|------------------|----------------------------------------|-----------------------------------------|
| `snapshot`       | `{ states: { [key]: value } }`         | Full state dump sent on WS connect      |
| `state`          | `{ key: string, value: unknown }`      | Single state update (fires per poll)    |
| `manifest_ready` | —                                      | Manifest loaded, polling active         |
| `if_connected`   | —                                      | IF TCP socket connected                 |
| `if_disconnected`| `{ reason: string }`                   | IF TCP socket dropped                   |

**Client → Server:**
| `type` | Payload                               | Meaning              |
|--------|---------------------------------------|----------------------|
| `set`  | `{ key: string, value: unknown }`     | Write state to IF    |
| `run`  | `{ command: string }`                 | Run an IF command    |

## Aircraft Panel Registry (CRITICAL)
- Aircraft panels are a plugin/registry system — each aircraft maps to a panel module
- Adding a new aircraft = creating one file in `/client/src/aircraft/`, exporting an `AircraftEntry`, and appending it to the `REGISTRY` array in `registry.ts` — never touching core code
- App reads `aircraft/0/name` on connection to detect aircraft and load the correct panel via `resolvePanel()`
- Panel families: `boeing-mcp` (737/757/747/777/787), `airbus-fcu` (A318–A380), `bombardier`, `generic`

## UI Approach (CRITICAL)
- Panels use real cockpit reference images (PNG/SVG) as the visual background layer
- Interactive elements (displays, buttons, knobs) are React components positioned with absolute positioning on top of the background image
- This creates a realistic 2D cockpit instrument look with real interactivity
- Cockpit-style color scheme: `zinc-950` background, `amber-400` accents, `green-400` for active/positive values, `font-mono` throughout

## Tabbed Layout
- Tab 1: AP Panel (aircraft-specific MCP or FCU)
- Tab 2: FMS / CDU (LEGS page, two-way flight plan sync with IF)
- Tab 3: Live Data (raw state dump — use this to verify the IF connection is working)

## Key IF Connect API States
- `aircraft/0/name` — detect current aircraft
- `aircraft/0/systems/autopilot/on|alt/on|alt/target|vs/on|vs/target|hdg/on|hdg/target|spd/on|spd/target|spd/mode|nav/on|approach/on` — AP states
- `aircraft/0/systems/transponder/1/code` — squawk
- `aircraft/0/altitude_msl`, `/indicated_airspeed`, `/vertical_speed`, `/heading_magnetic`, `/groundspeed`
- `aircraft/0/flightplan/route`, `/flightplan/coordinates`, `/flightplan/next_waypoint_name`
- `aircraft/0/systems/nav_sources/gps/next_waypoint_name`
- `aircraft/0/fuel_weight`

## IF API References
- Connect API + Live API reference: https://infiniteflight.com/llms.txt (fetch at start of any API work — note: llms.txt covers the REST Live API, not the Connect TCP API)
- ifc2 JS client source + README: https://github.com/likeablegeek/ifc2
- ifc2 key events: `IFC2manifest` (manifest loaded), `IFC2data` `{command, data}` (state update), `IFC2msg` `{code, context}` (connection events)
- Live API rate limits: 30 req/min (free), 100 req/min (Pro)

## Reference Images
Cockpit panel reference images live in `/reference/panels/`

## Step Climb Scheduler (future)
The backend architecture is designed to accommodate a step climb scheduler — a polling loop that monitors altitude/fuel/time and fires autopilot altitude set commands at defined trigger points. The WS `set` command path (`IFC2.set`) already provides the write-back capability needed.

## Known Unknowns (test early)
- Does the TCP connection survive when IF is backgrounded (AP+ mode)?
- Does the Connect API support writing back to the flight plan?
- Exact manifest paths for some states (e.g. `autopilot/nav/on`) — verify via Live Data tab on first connection
