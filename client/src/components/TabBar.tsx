import type { Tab } from '../types';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'ap', label: 'AP Panel' },
  { id: 'fms', label: 'FMS / CDU' },
  { id: 'live', label: 'Live Data' },
];

export function TabBar({ active, onChange }: Props) {
  return (
    <nav className="flex border-b border-zinc-800 bg-zinc-950">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            'px-6 py-3 text-xs font-mono tracking-widest uppercase transition-colors cursor-pointer',
            active === tab.id
              ? 'text-amber-400 border-b-2 border-amber-400 -mb-px'
              : 'text-zinc-500 hover:text-zinc-300',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
