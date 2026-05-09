import { useState } from 'react';
import { useIFConnection } from './hooks/useIFConnection';
import { resolvePanel } from './aircraft/registry';
import { TabBar } from './components/TabBar';
import { APPanel } from './components/tabs/APPanel';
import { FMSPanel } from './components/tabs/FMSPanel';
import { LiveData } from './components/tabs/LiveData';
import type { Tab } from './types';

const STATUS_DOT: Record<string, string> = {
  connecting: 'bg-yellow-500',
  ws_connected: 'bg-yellow-400 animate-pulse',
  ready: 'bg-green-500',
  if_disconnected: 'bg-red-500',
  disconnected: 'bg-red-600',
};

export default function App() {
  const { status, states, sendCommand } = useIFConnection();
  const [activeTab, setActiveTab] = useState<Tab>('ap');

  const aircraftName = states['aircraft/0/name'] as string | undefined;
  const panel = aircraftName ? resolvePanel(aircraftName) : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
        <span className="text-amber-400 font-bold tracking-widest text-sm uppercase">
          IF EFB
        </span>
        <div className="flex items-center gap-3">
          {aircraftName && (
            <span className="text-zinc-400 text-xs truncate max-w-48">{aircraftName}</span>
          )}
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[status] ?? 'bg-zinc-600'}`}
            title={status}
          />
        </div>
      </header>

      {/* Tab navigation */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <main className="flex-1 overflow-auto">
        {activeTab === 'ap' && (
          <APPanel states={states} panel={panel} status={status} sendCommand={sendCommand} />
        )}
        {activeTab === 'fms' && (
          <FMSPanel states={states} status={status} />
        )}
        {activeTab === 'live' && (
          <LiveData states={states} status={status} />
        )}
      </main>
    </div>
  );
}
