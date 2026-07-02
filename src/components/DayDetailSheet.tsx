import { useEffect, useRef } from 'react';
import { poseMidPath } from '../data/assets';
import { CELL_BY_ID, INTENSITY_LABEL } from '../data/cells';
import { formatKorean } from '../logic/dateUtils';
import { pickComment } from '../logic/pickComment';
import type { DiaryEntry } from '../logic/types';

interface Props {
  date: string;
  entry: DiaryEntry | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onClose: () => void;
}

/** 달력 날짜 상세 바텀시트 (기획서 §4.4) */
export function DayDetailSheet({ date, entry, onEdit, onDelete, onShare, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // 열릴 때 포커스 이동, Esc로 닫기 (기획서 §11)
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const cell = entry ? CELL_BY_ID[entry.cellId] : null;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        ref={ref}
        className="sheet anim-fade-slide"
        role="dialog"
        aria-modal="true"
        aria-label={`${formatKorean(date)} 기록`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <p className="text-caption" style={{ textAlign: 'center' }}>
          {formatKorean(date)}
        </p>

        {entry && cell ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <img
              src={poseMidPath(entry.cellId, entry.poseIndex)}
              alt={cell.name}
              width={140}
              height={140}
              style={{ objectFit: 'contain' }}
              decoding="async"
            />
            <p className="title-md" style={{ color: cell.color }}>
              {cell.name} · {INTENSITY_LABEL[entry.intensity]}
            </p>
            <p style={{ margin: 0, textAlign: 'center' }}>
              “{pickComment(entry.cellId, entry.intensity, entry.date)}”
            </p>
            {entry.note && (
              <p className="text-caption" style={{ margin: 0, textAlign: 'center' }}>
                내 한 줄: {entry.note}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 8 }}>
              <button className="btn btn--secondary" style={{ flex: 1 }} onClick={onEdit}>
                수정
              </button>
              <button className="btn btn--secondary" style={{ flex: 1 }} onClick={onShare}>
                공유
              </button>
              <button
                className="btn btn--ghost"
                style={{ flex: 1, color: '#C0392B' }}
                onClick={() => {
                  if (window.confirm('이 날의 기록을 지울까요?')) onDelete();
                }}
              >
                삭제
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <p style={{ margin: '8px 0 0' }}>이 날의 기록이 없어요</p>
            <button className="btn btn--primary" style={{ width: '100%' }} onClick={onEdit}>
              이 날 기록 남기기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
