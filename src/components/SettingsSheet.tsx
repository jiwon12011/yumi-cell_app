import { useEffect, useState } from 'react';
import { NAME_MAX, serialize } from '../logic/entriesStore';
import { todayISO } from '../logic/dateUtils';
import type { StoreV1 } from '../logic/types';

interface Props {
  store: StoreV1;
  onSetName: (name: string) => void;
  onReset: () => void;
  onClose: () => void;
}

/** 설정 시트 — 이름 변경·데이터 초기화(2단 확인)·내보내기·앱 정보 (기획서 §4.7) */
export function SettingsSheet({ store, onSetName, onReset, onClose }: Props) {
  const [name, setNameInput] = useState(store.userName);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const exportJson = () => {
    const blob = new Blob([serialize(store)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `세포일기-백업-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (!window.confirm('모든 기록을 지울까요?')) return;
    if (!window.confirm('정말요? 지운 기록은 되돌릴 수 없어요.')) return;
    onReset();
    onClose();
  };

  const count = Object.keys(store.entries).length;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet anim-fade-slide"
        role="dialog"
        aria-modal="true"
        aria-label="설정"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <h2 className="title-md" style={{ textAlign: 'center', marginBottom: 12 }}>
          설정
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="note-field">
            <label className="text-caption" htmlFor="settings-name">
              내 이름 — “○○의 세포들”
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="settings-name"
                value={name}
                maxLength={NAME_MAX * 2}
                placeholder="이름 또는 별명"
                style={{ flex: 1 }}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <button
                className="btn btn--secondary"
                style={{ minHeight: 48 }}
                onClick={() => onSetName(name)}
              >
                저장
              </button>
            </div>
          </div>
          <button className="btn btn--secondary" onClick={exportJson}>
            데이터 내보내기 (JSON)
          </button>
          <button className="btn btn--ghost" style={{ color: '#C0392B' }} onClick={reset}>
            데이터 초기화
          </button>
          <p className="text-caption" style={{ textAlign: 'center', margin: '8px 0 0' }}>
            세포 감정일기 v0.1.0 · 기록 {count}건 · 모든 데이터는 이 기기에만 저장돼요
          </p>
        </div>
      </div>
    </div>
  );
}
