import { useMemo } from 'react';
import { heroPath, propPath } from '../data/assets';
import { CELL_BY_ID, CELLS } from '../data/cells';
import { formatYmKorean, todayISO, ymOf } from '../logic/dateUtils';
import { currentStreak, longestStreak, monthDistribution, topCellOfMonth } from '../logic/stats';
import type { EntriesMap } from '../logic/types';
import { CellFace } from './CellFace';

interface Props {
  entries: EntriesMap;
  userName: string;
  onOpenSettings: () => void;
}

export function StatsScreen({ entries, userName, onOpenSettings }: Props) {
  const today = todayISO();
  const ym = ymOf(today);
  const dist = useMemo(() => monthDistribution(entries, ym), [entries, ym]);
  const top = useMemo(() => topCellOfMonth(entries, ym), [entries, ym]);
  const streak = useMemo(() => currentStreak(entries, today), [entries, today]);
  const best = useMemo(() => longestStreak(entries), [entries]);
  const total = dist.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(1, ...dist.map((d) => d.count));

  return (
    <div className="screen">
      <div
        className="screen-bg"
        style={{ background: 'linear-gradient(180deg, #EAF6FF 0%, #FFF0F6 60%, #FFF7FB 100%)' }}
        aria-hidden="true"
      />
      <div className="screen-content" style={{ gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="title-lg">
            {userName ? `${userName}의 ` : ''}
            {formatYmKorean(ym)}
          </h1>
          <button
            className="icon-btn"
            aria-label="설정"
            style={{ width: 40, height: 40 }}
            onClick={onOpenSettings}
          >
            ⚙
          </button>
        </div>

        {total === 0 ? (
          <div className="panel empty-state">
            <CellFace cellId="rest" pose={3} size={120} />
            <p style={{ margin: 0 }}>아직 기록이 없어… 오늘부터 시작!</p>
          </div>
        ) : (
          <>
            {top && (
              <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={heroPath(top)}
                  alt={CELL_BY_ID[top].name}
                  width={72}
                  height={72}
                  style={{ objectFit: 'contain' }}
                  decoding="async"
                />
                <div>
                  <p className="text-caption" style={{ margin: 0 }}>
                    이번 달 프라임 세포
                  </p>
                  <p className="title-md" style={{ margin: 0, color: CELL_BY_ID[top].color }}>
                    {userName ? `${userName}의 프라임 세포는 ${CELL_BY_ID[top].name}!` : `이번 달은 ${CELL_BY_ID[top].name}의 달!`}
                  </p>
                  <p className="text-caption" style={{ margin: 0 }}>
                    {CELL_BY_ID[top].keyword}
                  </p>
                </div>
              </div>
            )}

            <div className="panel stats-list" aria-label="세포별 기록 분포">
              {CELLS.map((cell) => {
                const d = dist.find((x) => x.cellId === cell.id)!;
                return (
                  <div
                    key={cell.id}
                    className={`stat-row${d.count === 0 ? ' is-zero' : ''}`}
                    style={{ ['--cell-color' as string]: cell.color }}
                  >
                    <CellFace cellId={cell.id} pose={1} size={28} />
                    <span className="stat-label">{cell.name.replace('세포', '')}</span>
                    <div className="bar-track" aria-hidden="true">
                      <div
                        className="bar-fill"
                        style={{ width: `${(d.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="stat-value">
                      {d.count}회 · {d.percent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="panel streak-panel">
          <img src={propPath('crown')} alt="" width={44} height={44} decoding="async" />
          <div>
            <p className="title-md" style={{ margin: 0 }}>
              {streak > 0 ? `${streak}일 연속 기록 중` : '연속 기록을 시작해봐'}
            </p>
            <p className="text-caption" style={{ margin: 0 }}>
              최장 {best}일
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
