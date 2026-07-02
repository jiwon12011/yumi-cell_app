import { useState } from 'react';
import { CalendarScreen } from './components/CalendarScreen';
import { DayDetailSheet } from './components/DayDetailSheet';
import { Onboarding } from './components/Onboarding';
import { ReactionScreen } from './components/ReactionScreen';
import { SettingsSheet } from './components/SettingsSheet';
import { ShareCardModal } from './components/ShareCardModal';
import { StatsScreen } from './components/StatsScreen';
import { TabBar } from './components/TabBar';
import { TodayScreen } from './components/TodayScreen';
import { VillageScreen } from './components/VillageScreen';
import { useEntries } from './hooks/useEntries';
import type { EntryInput } from './hooks/useEntries';
import { useView } from './hooks/useView';
import { addDaysISO, todayISO, ymOf } from './logic/dateUtils';
import { chairStreak, topCellOfMonth } from './logic/stats';

export function App() {
  const { store, upsert, remove, markOnboarded, setName, resetAll } = useEntries();
  const { view, setTab, openSheet, closeSheet, openForm, showReactionFor } = useView();
  const [shareDate, setShareDate] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const today = todayISO();
  const showOnboarding = !store.onboarded && Object.keys(store.entries).length === 0;

  // 오늘 탭: 편집 날짜(기본 오늘). 이미 기록된 오늘 + 폼 요청 전 → 리액션 먼저 (기획서 §4.2)
  const editDate = view.editingDate ?? today;
  const editEntry = store.entries[editDate];
  const reactionMode = view.showReaction || (view.editingDate === null && !!store.entries[today]);

  const save = (input: EntryInput) => {
    upsert(input);
    showReactionFor(input.date);
  };

  const shareEntry = shareDate ? store.entries[shareDate] : undefined;
  const sheetEntry = view.sheetDate ? store.entries[view.sheetDate] : undefined;
  const primeCell = topCellOfMonth(store.entries, ymOf(today));

  return (
    <div className="app-shell">
      {view.tab === 'today' &&
        (reactionMode && editEntry ? (
          <ReactionScreen
            entry={editEntry}
            userName={store.userName}
            primeCell={primeCell}
            prevChair={store.entries[addDaysISO(editDate, -1)]?.cellId ?? null}
            chairDays={chairStreak(store.entries, editDate)}
            onEdit={() => openForm(editDate)}
            onShare={() => setShareDate(editDate)}
            onHome={() => setTab('calendar')}
          />
        ) : (
          <TodayScreen
            key={editDate}
            date={editDate}
            existing={editEntry}
            userName={store.userName}
            onSave={save}
          />
        ))}

      {view.tab === 'village' && (
        <VillageScreen
          entries={store.entries}
          userName={store.userName}
          onGoToday={() => setTab('today')}
        />
      )}

      {view.tab === 'calendar' && (
        <CalendarScreen entries={store.entries} onSelectDay={openSheet} />
      )}

      {view.tab === 'stats' && (
        <StatsScreen
          entries={store.entries}
          userName={store.userName}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      <TabBar tab={view.tab} onChange={setTab} />

      {view.sheetDate && (
        <DayDetailSheet
          date={view.sheetDate}
          entry={sheetEntry}
          onEdit={() => openForm(view.sheetDate!)}
          onDelete={() => {
            remove(view.sheetDate!);
            closeSheet();
          }}
          onShare={() => setShareDate(view.sheetDate)}
          onClose={closeSheet}
        />
      )}

      {shareEntry && <ShareCardModal entry={shareEntry} onClose={() => setShareDate(null)} />}

      {settingsOpen && (
        <SettingsSheet
          store={store}
          onSetName={setName}
          onReset={resetAll}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {showOnboarding && <Onboarding onDone={markOnboarded} />}
    </div>
  );
}
