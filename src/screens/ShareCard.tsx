import type { CSSProperties } from 'react';
import { CellImage } from '../components/CellImage';
import { CELL_BY_ID, SCORED_CELL_IDS } from '../data/cells';
import { RESULT_BY_CELL } from '../data/results';
import type { ScoredCellId } from '../data/types';

const SCORED = new Set<string>(SCORED_CELL_IDS);

/** URL ?card=<cellId> 파라미터를 읽어 유효한 점수 세포면 반환 (캡처 라우트 분기용). */
export function getCardCell(): ScoredCellId | null {
  if (typeof window === 'undefined') return null;
  const c = new URLSearchParams(window.location.search).get('card');
  return c && SCORED.has(c) ? (c as ScoredCellId) : null;
}

interface Props {
  cell: ScoredCellId;
}

// 캡처 전용 카드: 1080×1350 고정 박스. 불투명 배경, 웹폰트 적용 상태로 렌더.
// 본 플로우와 분리(App에서 ?card= 있을 때만 렌더).
export function ShareCard({ cell }: Props) {
  const meta = CELL_BY_ID[cell];
  const result = RESULT_BY_CELL.get(cell);
  if (!result) return null;

  return (
    <div className="card-capture" style={{ '--cell': meta?.color } as CSSProperties}>
      {/* 데코 (은은) */}
      <span className="card-capture__deco card-capture__deco--1" aria-hidden="true">♥</span>
      <span className="card-capture__deco card-capture__deco--2" aria-hidden="true">✦</span>
      <span className="card-capture__deco card-capture__deco--3" aria-hidden="true">♥</span>
      <span className="card-capture__deco card-capture__deco--4" aria-hidden="true">✧</span>

      <p className="card-capture__eyebrow">오늘의 세포 회의 결과</p>

      <div className="card-capture__char">
        <CellImage cell={cell} size={520} frame="hero" eager />
      </div>

      <h1 className="card-capture__title">{result.title}</h1>
      <p className="card-capture__quote">{result.cellQuote}</p>

      <p className="card-capture__wordmark">오늘의 세포 회의</p>
    </div>
  );
}
