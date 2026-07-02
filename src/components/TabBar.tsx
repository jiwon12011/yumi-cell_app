import type { Tab } from '../hooks/useView';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'today', label: '오늘' },
  { id: 'village', label: '마을' },
  { id: 'calendar', label: '달력' },
  { id: 'stats', label: '통계' },
];

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" role="tablist" aria-label="메인 탭">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={tab === t.id}
          aria-label={t.label}
          onClick={() => onChange(t.id)}
        >
          <span>{t.label}</span>
          <span className="tab-dot" aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
