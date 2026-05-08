# IF-EFB — Infinite Flight Electronic Flight Bag

## Project Overview
A web dashboard that connects to Infinite Flight via the Connect API and renders interactive cockpit panels (MCP/FCU autopilot panel, FMS CDU scratchpad, live flight data).

## Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS (`/client`)
- Backend: Node.js + `ifc2` (IF Connect client) + `ws` (WebSocket server) (`/server`)

## Key Architecture Decisions
- Backend connects to IF via `ifc2` npm package (handles UDP discovery + TCP automatically)
- Backend runs a WebSocket server that streams IF states to the frontend in real time
- Frontend connects via WebSocket and renders panels dynamically based on current aircraft

## Aircraft Panel Registry (CRITICAL)
- Aircraft panels are a plugin/registry system — each aircraft maps to a panel module
- Adding a new aircraft = adding one module to the registry, never touching core code
- App reads `aircraft/0/name` on connection to detect aircraft and load the correct panel
- Panel families: Boeing MCP (737/757/747/777/787), Airbus FCU (A318–A380), Bombardier, Generic AP (GA/TBM)

## UI Approach (CRITICAL)
- Panels use real cockpit reference images (PNG/SVG) as the visual background layer
- Interactive elements (displays, buttons, knobs) are React components positioned with absolute positioning on top of the background image
- This creates a realistic 2D cockpit instrument look with real interactivity

## Tabbed Layout
- Tab 1: AP Panel (aircraft-specific MCP or FCU)
- Tab 2: FMS / CDU (LEGS page, two-way flight plan sync with IF)
- Tab 3: Live flight data strip

## Key IF Connect API States
- `aircraft/0/name` — detect current aircraft
- `aircraft/0/systems/autopilot/on|alt|vs|hdg|spd|nav|approach` — AP states
- `aircraft/0/systems/transponder/1/code` — squawk
- `aircraft/0/altitude_msl`, `/indicated_airspeed`, `/vertical_speed`, `/heading_magnetic`, `/groundspeed`
- `aircraft/0/flightplan/route`, `/flightplan/coordinates`, `/flightplan/next_waypoint_name`
- `aircraft/0/fuel_weight`

## IF API References
- Connect API + Live API reference: https://infiniteflight.com/llms.txt (fetch this at start of any API work)
- ifc2 JS client docs: https://github.com/likeablegeek/ifc2
- Live API rate limits: 30 req/min (free), 100 req/min (Pro)

## Reference Images
Cockpit panel reference images live in `/reference/panels/`

## Known Unknowns (test early)
- Does the TCP connection survive when IF is backgrounded (AP+ mode)?
- Does the Connect API support writing back to the flight plan?
