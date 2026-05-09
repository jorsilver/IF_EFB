import type { ConnectionStatus, IFStates } from '../../types';

interface Props {
  states: IFStates;
  status: ConnectionStatus;
}

export function FMSPanel({ states, status }: Props) {
  const route = states['aircraft/0/flightplan/route'] as string | undefined;
  const nextWpt = (
    states['aircraft/0/flightplan/next_waypoint_name'] ??
    states['aircraft/0/systems/nav_sources/gps/next_waypoint_name']
  ) as string | undefined;

  return (
    <div className="flex flex-col min-h-96 p-8 gap-6">
      <div className="text-zinc-600 text-xs tracking-widest uppercase">FMS / CDU</div>

      {status === 'ready' ? (
        <div className="space-y-4">
          {nextWpt && (
            <div>
              <div className="text-zinc-600 text-xs uppercase tracking-wider mb-1">Next Waypoint</div>
              <div className="text-green-400 font-mono text-lg">{nextWpt}</div>
            </div>
          )}
          {route ? (
            <div>
              <div className="text-zinc-600 text-xs uppercase tracking-wider mb-1">Route</div>
              <div className="text-zinc-300 font-mono text-sm leading-relaxed break-all">{route}</div>
            </div>
          ) : (
            <div className="text-zinc-600 text-sm">No active flight plan</div>
          )}
        </div>
      ) : (
        <div className="text-zinc-600 text-sm">Waiting for IF connection…</div>
      )}

      <div className="text-zinc-700 text-xs mt-auto">
        CDU panel UI coming soon
      </div>
    </div>
  );
}
