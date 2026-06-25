import { useState } from 'react';
import type { CSSProperties } from 'react';
import { CellImage } from '../components/CellImage';
import { CELL_BY_ID } from '../data/cells';
import { getFortune } from '../data/fortunes';
import type { ResultType } from '../data/types';
import { shareResult } from '../share/shareResult';

interface Props {
  result: ResultType;
  onRestart: () => void;
}

const TOAST: Record<string, string> = {
  copied: '링크가 복사됐어!',
  failed: '공유에 실패했어. 잠시 후 다시 시도해줘.',
};

export function Result({ result, onRestart }: Props) {
  const [toast, setToast] = useState('');
  const cellMeta = CELL_BY_ID[result.cell];
  const heroSize = result.cell === 'emotion' ? 260 : 240;
  const fortune = getFortune(result.cell, new Date());

  async function handleShare() {
    const outcome = await shareResult(result);
    setToast(TOAST[outcome] ?? '');
  }

  return (
    <section
      className="screen result"
      style={{ '--cell': cellMeta?.color } as CSSProperties}
    >
      <span className="result__badge">{cellMeta?.name} 우세</span>

      <div className="result__hero">
        <CellImage cell={result.cell} size={heroSize} frame="hero" eager />
      </div>

      <h1 className="result__title">{result.title}</h1>
      <p className="result__subtitle">{result.subtitle}</p>
      <p className="result__desc">{result.description}</p>

      <p className="result__quote">{result.cellQuote}</p>

      <div className="result__fortune">
        <span className="result__fortune-label">오늘의 세포 운세</span>
        <span className="result__fortune-text">{fortune}</span>
      </div>

      <div className="btn-row result__actions">
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          다시하기
        </button>
        <button type="button" className="btn btn--primary" onClick={handleShare}>
          공유하기
        </button>
      </div>

      <p className="result__toast" role="status" aria-live="polite">
        {toast}
      </p>
    </section>
  );
}
