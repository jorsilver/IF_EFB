import type { ConnectionStatus, IFStates } from '../../types';

interface Props {
  states: IFStates;
  status: ConnectionStatus;
}

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: 'Connecting to server…',
  ws_connected: 'Server connected — waiting for IF',
  ready: 'Live',
  if_disconnected: 'IF disconnected',
  disconnected: 'Server disconnected',
};

const STATUS_DOT: Record<ConnectionStatus, string> = {
  connecting: 'bg-yellow-500',
  ws_connected: 'bg-yellow-400',
  ready: 'bg-green-500',
  if_disconnected: 'bg-red-500',
  disconnected: 'bg-red-600',
};

// Show these first, in order
const PRIORITY_KEYS = [
  'aircraft/0/name',
  'aircraft/0/altitude_msl',
  'aircraft/0/indicated_airspeed',
  'aircraft/0/vertical_speed',
  'aircraft/0/heading_magnetic',
  'aircraft/0/groundspeed',
  'aircraft/0/systems/autopilot/on',
  'aircraft/0/systems/autopilot/alt/target',
  'aircraft/0/systems/autopilot/vs/target',
  'aircraft/0/systems/autopilot/hdg/target',
  'aircraft/0/systems/autopilot/spd/target',
  'aircraft/0/systems/autopilot/spd/mode',
  'aircraft/0/systems/transponder/1/code',
  'aircraft/0/fuel_weight',
];

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'number') {
    return Number.isInteger(v) ? String(v) : v.toFixed(4);
  }
  return String(v);
}

function StateRow({ label, value }: { label: string; value: unknown }) {
  return (
    <tr className="border-b border-zinc-900 hover:bg-zinc-900/50">
      <td className="py-1.5 pr-6 text-zinc-500 text-xs font-mono align-top whitespace-nowrap">
        {label}
      </td>
      <td className="py-1.5 text-zinc-200 text-xs font-mono">
        {formatValue(value)}
      </td>
    </tr>
  );
}

export function LiveData({ states, status }: Props) {
  const allKeys = Object.keys(states);
  const priorityKeys = PRIORITY_KEYS.filter((k) => k in states);
  const otherKeys = allKeys.filter((k) => !PRIORITY_KEYS.includes(k)).sort();

  return (
    <div className="p-4 max-w-3xl">
      {/* Status bar */}
      <div className="flex items-center gap-2 mb-5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[status]}`} />
        <span className="text-xs font-mono text-zinc-400">{STATUS_LABEL[status]}</span>
        {allKeys.length > 0 && (
          <span className="text-zinc-700 text-xs ml-2">{allKeys.length} states</span>
        )}
      </div>

      {allKeys.length === 0 ? (
        <div className="text-zinc-600 text-sm font-mono">No data received yet.</div>
      ) : (
        <table className="w-full">
          <tbody>
            {priorityKeys.map((k) => (
              <StateRow key={k} label={k} value={states[k]} />
            ))}
            {otherKeys.length > 0 && (
              <tr>
                <td colSpan={2} className="pt-5 pb-2 text-zinc-700 text-xs font-mono">
                  ── remaining states ──
                </td>
              </tr>
            )}
            {otherKeys.map((k) => (
              <StateRow key={k} label={k} value={states[k]} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
