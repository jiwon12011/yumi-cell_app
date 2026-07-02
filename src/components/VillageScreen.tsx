import { useMemo, useState } from 'react';
import { bgPath, heroPath, propPath } from '../data/assets';
import { CELL_BY_ID } from '../data/cells';
import { COMMENTS } from '../data/comments';
import { formatYmKorean, todayISO, ymOf } from '../logic/dateUtils';
import { hashString } from '../logic/pickComment';
import type { CellId, EntriesMap, PoseIndex } from '../logic/types';
import { CellFace } from './CellFace';
import { SpeechBubble } from './SpeechBubble';

interface Resident {
  cellId: CellId;
  count: number;
  /** 가장 최근 기록의 포즈 — 마을에서 그 모습으로 서 있는다 */
  pose: PoseIndex;
}

interface Props {
  entries: EntriesMap;
  userName: string;
  onGoToday: () => void;
}

/**
 * 세포 마을 — 이번 달 기록된 세포들이 모여 사는 홈.
 * 최다 기록 세포(프라임)가 단상 위에 왕관을 쓰고 서고, 나머지는 주민으로 늘어선다.
 * 주민을 탭하면 오늘의 한마디(date-hash 결정적)를 말한다.
 */
export function VillageScreen({ entries, userName, onGoToday }: Props) {
  const today = todayISO();
  const ym = ymOf(today);

  const { residents, activeDays } = useMemo(() => {
    const byCell = new Map<CellId, { count: number; pose: PoseIndex; latest: string }>();
    let days = 0;
    for (const e of Object.values(entries)) {
      if (ymOf(e.date) !== ym) continue;
      days++;
      const cur = byCell.get(e.cellId);
      if (!cur) {
        byCell.set(e.cellId, { count: 1, pose: e.poseIndex, latest: e.date });
      } else {
        cur.count++;
        if (e.date > cur.latest) {
          cur.latest = e.date;
          cur.pose = e.poseIndex;
        }
      }
    }
    const list: Resident[] = [...byCell.entries()]
      .map(([cellId, v]) => ({ cellId, count: v.count, pose: v.pose }))
      .sort((a, b) => b.count - a.count);
    return { residents: list, activeDays: days };
  }, [entries, ym]);

  const prime = residents[0] ?? null;
  const others = residents.slice(1);
  const [talking, setTalking] = useState<CellId | null>(null);

  const dailyLine = (cellId: CellId) => {
    const pool = COMMENTS[cellId][2];
    return pool[hashString(`${today}|${cellId}|village`) % pool.length];
  };

  return (
    <div className="screen">
      <img src={bgPath('result-celebration')} alt="" className="screen-bg" decoding="async" />
      <div className="screen-content village">
        <header style={{ textAlign: 'center' }}>
          <h1 className="title-lg">{userName ? `${userName}의 세포 마을` : '나의 세포 마을'}</h1>
          <p className="text-caption">
            {formatYmKorean(ym)} · {activeDays}일 활동 · 주민 {residents.length}명
          </p>
        </header>

        {prime ? (
          <>
            <div className="village-bubble-slot" aria-live="polite">
              {talking && (
                <SpeechBubble animate key={`${talking}-${today}`}>
                  <span style={{ color: CELL_BY_ID[talking].color }}>
                    {CELL_BY_ID[talking].name.replace('세포', '')}
                  </span>
                  : {dailyLine(talking)}
                </SpeechBubble>
              )}
            </div>

            <button
              className="village-prime"
              aria-label={`프라임 세포 ${CELL_BY_ID[prime.cellId].name} — 한마디 듣기`}
              onClick={() => setTalking(prime.cellId)}
            >
              <img src={propPath('crown')} alt="" className="chair-crown" decoding="async" />
              <img
                src={heroPath(prime.cellId)}
                alt={CELL_BY_ID[prime.cellId].name}
                decoding="async"
              />
              <span className="village-name" style={{ color: CELL_BY_ID[prime.cellId].color }}>
                프라임 · {CELL_BY_ID[prime.cellId].name.replace('세포', '')} ×{prime.count}
              </span>
            </button>

            {others.length > 0 && (
              <div className="village-residents" role="group" aria-label="마을 주민들">
                {others.map((r) => (
                  <button
                    key={r.cellId}
                    className="village-resident"
                    aria-label={`${CELL_BY_ID[r.cellId].name} — 한마디 듣기`}
                    onClick={() => setTalking(r.cellId)}
                  >
                    <CellFace cellId={r.cellId} pose={r.pose} size={64} />
                    <span className="village-name" style={{ color: CELL_BY_ID[r.cellId].color }}>
                      {CELL_BY_ID[r.cellId].name.replace('세포', '')} ×{r.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-caption" style={{ textAlign: 'center' }}>
              세포를 누르면 오늘의 한마디를 들려줘요
            </p>
          </>
        ) : (
          <div className="panel empty-state" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <CellFace cellId="rest" pose={3} size={120} />
            <p style={{ margin: 0 }}>아직 마을에 아무도 이사 오지 않았어요</p>
            <button className="btn btn--primary" onClick={onGoToday}>
              첫 주민 데려오기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
