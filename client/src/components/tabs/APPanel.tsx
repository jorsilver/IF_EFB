import type { ConnectionStatus, IFStates, SendCommand } from '../../types';
import type { PanelConfig } from '../../aircraft/types';

interface Props {
  states: IFStates;
  panel: PanelConfig | null;
  status: ConnectionStatus;
  sendCommand: (cmd: SendCommand) => void;
}

export function APPanel({ panel, status }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-6 p-8">
      <div className="text-zinc-600 text-xs tracking-widest uppercase">Autopilot Panel</div>

      {panel ? (
        <div className="text-center space-y-2">
          <div className="text-amber-400 text-xl font-bold tracking-wide">
            {panel.displayName}
          </div>
          <div className="text-zinc-500 text-xs uppercase tracking-widest">
            {panel.family}
          </div>
        </div>
      ) : (
        <div className="text-zinc-600 text-sm">
          {status === 'ready' ? 'No aircraft detected' : 'Waiting for IF connection…'}
        </div>
      )}

      <div className="text-zinc-700 text-xs mt-8">
        Panel UI coming soon — reference images go in /reference/panels/
      </div>
    </div>
  );
}
