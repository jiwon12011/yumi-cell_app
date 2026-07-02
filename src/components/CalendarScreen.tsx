import { useMemo, useState } from 'react';
import { CELL_BY_ID } from '../data/cells';
import { addMonths, formatYmKorean, monthGrid, todayISO, ymOf } from '../logic/dateUtils';
import { monthDistribution, topCellOfMonth } from '../logic/stats';
import type { EntriesMap } from '../logic/types';
import { CellFace } from './CellFace';

interface Props {
  entries: EntriesMap;
  onSelectDay: (date: string) => void;
}

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarScreen({ entries, onSelectDay }: Props) {
  const today = todayISO();
  const thisYm = ymOf(today);
  const [ym, setYm] = useState(thisYm);

  const grid = useMemo(() => monthGrid(ym), [ym]);
  const monthCount = useMemo(
    () => Object.values(entries).filter((e) => ymOf(e.date) === ym).length,
    [entries, ym],
  );
  const top = useMemo(() => topCellOfMonth(entries, ym), [entries, ym]);
  const topCount = useMemo(
    () => (top ? monthDistribution(entries, ym).find((d) => d.cellId === top)!.count : 0),
    [entries, ym, top],
  );

  return (
    <div className="screen">
      <div
        className="screen-bg"
        style={{ background: 'linear-gradient(180deg, #F3EDFF 0%, #FFF0F6 60%, #FFF7FB 100%)' }}
        aria-hidden="true"
      />
      <div className="screen-content">
        <div className="calendar-head">
          <button
            className="month-nav"
            aria-label="이전 달"
            onClick={() => setYm((m) => addMonths(m, -1))}
          >
            ◀
          </button>
          <h1 className="month-label">{formatYmKorean(ym)}</h1>
          <button
            className="month-nav"
            aria-label="다음 달"
            disabled={ym >= thisYm}
            onClick={() => setYm((m) => addMonths(m, 1))}
          >
            ▶
          </button>
        </div>

        <div className="calendar-grid" role="grid" aria-label={`${formatYmKorean(ym)} 기록 달력`}>
          {DOW.map((d) => (
            <div key={d} className="calendar-dow" role="columnheader">
              {d}
            </div>
          ))}
          {grid.map((cell) => {
            const entry = entries[cell.date];
            const isToday = cell.date === today;
            const isFuture = cell.date > today;
            const dayNum = Number(cell.date.slice(8));
            if (!cell.inMonth) {
              return <div key={cell.date} aria-hidden="true" />;
            }
            return (
              <button
                key={cell.date}
                className={`day-cell${isToday ? ' is-today' : ''}`}
                style={
                  entry
                    ? { ['--cell-color' as string]: CELL_BY_ID[entry.cellId].color }
                    : undefined
                }
                disabled={isFuture}
                aria-label={`${dayNum}일${entry ? ` — ${CELL_BY_ID[entry.cellId].name} 기록됨` : isFuture ? '' : ' — 기록 없음'}`}
                onClick={() => onSelectDay(cell.date)}
              >
                <span className="day-num">{dayNum}</span>
                {entry ? (
                  <CellFace
                    cellId={entry.cellId}
                    pose={entry.poseIndex}
                    size={38}
                    className="day-face"
                  />
                ) : (
                  <span className="day-dot" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        <p className="month-summary">
          {monthCount > 0 && top
            ? `이번 달 ${monthCount}일 기록 · ${CELL_BY_ID[top].name}가 ${topCount}번으로 1등`
            : '이 달의 기록이 아직 없어요'}
        </p>
      </div>
    </div>
  );
}
