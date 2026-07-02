import { useEffect, useRef, useState } from 'react';
import { CARD_BG_NAMES, DEFAULT_CARD_BG, cardBgPath } from '../data/assets';
import type { CardBgName } from '../data/assets';
import type { DiaryEntry } from '../logic/types';
import { drawShareCard } from '../share/drawShareCard';
import { shareOrDownload } from '../share/shareOrDownload';

interface Props {
  entry: DiaryEntry;
  onClose: () => void;
}

const FRAME_LABEL: Record<CardBgName, string> = {
  'cozy-desk': '아늑한 책상',
  'lavender-panel': '라벤더',
  'meeting-board': '회의 보드',
  'night-dream': '밤하늘',
  'pink-blue-cloud': '핑크 구름',
  'sky-cloud': '하늘 구름',
};

export function ShareCardModal({ entry, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState<CardBgName>(DEFAULT_CARD_BG[entry.cellId]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    setError(null);
    drawShareCard(canvas, entry, frame).catch(() => {
      if (!cancelled) setError('카드를 그리지 못했어요. 다시 시도해줘!');
    });
    return () => {
      cancelled = true;
    };
  }, [entry, frame]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const share = async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      await shareOrDownload(canvasRef.current, entry.date);
    } catch {
      setError('공유에 실패했어요. 다시 시도해줘!');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet anim-fade-slide"
        role="dialog"
        aria-modal="true"
        aria-label="공유 카드 만들기"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="title-md" style={{ textAlign: 'center', marginBottom: 12 }}>
          공유 카드
        </h2>

        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: 20,
            boxShadow: 'var(--shadow-soft)',
            display: 'block',
          }}
          aria-label="공유 카드 미리보기"
        />
        {error && (
          <p className="text-caption" style={{ color: '#C0392B', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <div className="pose-row" role="radiogroup" aria-label="카드 프레임 선택" style={{ marginTop: 12 }}>
          {CARD_BG_NAMES.map((name) => (
            <button
              key={name}
              role="radio"
              aria-checked={frame === name}
              aria-label={FRAME_LABEL[name]}
              className="pose-swatch"
              onClick={() => setFrame(name)}
            >
              <img src={cardBgPath(name)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="btn btn--primary" style={{ flex: 2 }} disabled={busy} onClick={share}>
            {busy ? '만드는 중…' : '공유하기'}
          </button>
          <button className="btn btn--ghost" style={{ flex: 1 }} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
