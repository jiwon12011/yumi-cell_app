import { useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { bgPath, heroPath, poseMidPath } from '../data/assets';
import {
  CELL_BY_ID,
  CELLS,
  INTENSITY_LABEL,
  INTENSITY_POSE,
  POSE_INDEXES,
} from '../data/cells';
import { warmImages } from '../hooks/usePreload';
import type { EntryInput } from '../hooks/useEntries';
import { NOTE_MAX, clampNote } from '../logic/entriesStore';
import { formatKorean, todayISO } from '../logic/dateUtils';
import type { CellId, DiaryEntry, Intensity, PoseIndex } from '../logic/types';
import { CellFace } from './CellFace';

interface Props {
  /** 편집 대상 날짜 (기본: 오늘) */
  date: string;
  existing: DiaryEntry | undefined;
  userName: string;
  onSave: (input: EntryInput) => void;
}

const INTENSITIES: Intensity[] = [1, 2, 3];

export function TodayScreen({ date, existing, userName, onSave }: Props) {
  const [cellId, setCellId] = useState<CellId | null>(existing?.cellId ?? null);
  const [intensity, setIntensity] = useState<Intensity>(existing?.intensity ?? 2);
  const [poseOverride, setPoseOverride] = useState<PoseIndex | null>(
    existing ? existing.poseIndex : null,
  );
  const [note, setNote] = useState(existing?.note ?? '');
  const [showPoses, setShowPoses] = useState(false);

  const pose: PoseIndex = poseOverride ?? INTENSITY_POSE[intensity];
  const isToday = date === todayISO();
  const noteLen = useMemo(() => Array.from(note.trim()).length, [note]);

  const selectCell = (id: CellId) => {
    setCellId(id);
    setPoseOverride(null);
    // 예측 프리로드: 리액션 전환 시 캐시 히트 (기획서 §10.3)
    warmImages([heroPath(id), bgPath('reaction-stage')]);
  };

  const selectIntensity = (i: Intensity) => {
    setIntensity(i);
    setPoseOverride(null);
  };

  // radiogroup 화살표 키 탐색 (기획서 §11)
  const onCellKey = (e: KeyboardEvent, idx: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (idx + (e.key === 'ArrowRight' ? 1 : CELLS.length - 1)) % CELLS.length;
    selectCell(CELLS[next].id);
    (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
  };

  const submit = () => {
    if (!cellId) return;
    onSave({ date, cellId, poseIndex: pose, intensity, note: clampNote(note) });
  };

  const color = cellId ? CELL_BY_ID[cellId].color : undefined;

  return (
    <div className="screen">
      <img
        src={bgPath('question-room')}
        alt=""
        className="screen-bg"
        fetchPriority="high"
        decoding="async"
      />
      <div className="screen-content">
        <header>
          <p className="text-caption">
            {userName ? `${userName}의 세포들 · ` : ''}
            {formatKorean(date)}
          </p>
          <h1 className="title-lg">
            {isToday ? '오늘의 의장 세포를 골라줘' : '이 날의 의장 세포를 골라줘'}
          </h1>
        </header>

        <div className="today-form anim-fade-slide">
          {cellId && (
            <img
              key={`${cellId}-${pose}`}
              src={poseMidPath(cellId, pose)}
              alt={`${CELL_BY_ID[cellId].name} 미리보기`}
              className="pose-preview"
              decoding="async"
            />
          )}

          <div className="cell-grid" role="radiogroup" aria-label="세포 선택">
            {CELLS.map((cell, idx) => (
              <button
                key={cell.id}
                role="radio"
                aria-checked={cellId === cell.id}
                aria-label={cell.name}
                className="cell-option"
                style={{ ['--cell-color' as string]: cell.color }}
                onClick={() => selectCell(cell.id)}
                onKeyDown={(e) => onCellKey(e, idx)}
                tabIndex={cellId === cell.id || (!cellId && idx === 0) ? 0 : -1}
              >
                <CellFace cellId={cell.id} pose={1} size={64} lazy={false} />
                <span className="cell-name">{cell.name.replace('세포', '')}</span>
              </button>
            ))}
          </div>

          {cellId && (
            <p
              className="text-caption anim-fade-slide"
              style={{ textAlign: 'center', margin: '-4px 0 0' }}
            >
              <span style={{ color: color, fontWeight: 700 }}>{CELL_BY_ID[cellId].name}</span>
              {' — '}
              {CELL_BY_ID[cellId].keyword}
            </p>
          )}

          <div className="chip-row" role="radiogroup" aria-label="감정 강도">
            {INTENSITIES.map((i) => (
              <button
                key={i}
                role="radio"
                aria-checked={intensity === i}
                className="chip"
                style={{ ['--cell-color' as string]: color }}
                onClick={() => selectIntensity(i)}
              >
                {INTENSITY_LABEL[i]}
              </button>
            ))}
          </div>

          {cellId && (
            <>
              <button className="toggle-poses" onClick={() => setShowPoses((s) => !s)}>
                {showPoses ? '포즈 접기' : '다른 포즈 보기'}
              </button>
              {showPoses && (
                <div className="pose-row" role="radiogroup" aria-label="포즈 선택">
                  {POSE_INDEXES.map((p) => (
                    <button
                      key={p}
                      role="radio"
                      aria-checked={pose === p}
                      aria-label={`포즈 ${p}`}
                      className="pose-swatch"
                      style={{ ['--cell-color' as string]: color }}
                      onClick={() => setPoseOverride(p)}
                    >
                      <CellFace cellId={cellId} pose={p} size={48} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="note-field">
            <label className="sr-only" htmlFor="note-input">
              오늘 한 줄
            </label>
            <input
              id="note-input"
              value={note}
              maxLength={NOTE_MAX * 2 /* 서로게이트 여유 — 저장 시 clampNote */}
              placeholder="오늘 한 줄… (선택)"
              onChange={(e) => setNote(e.target.value)}
            />
            <span className="note-counter" aria-live="polite">
              {Math.min(noteLen, NOTE_MAX)}/{NOTE_MAX}
            </span>
          </div>

          <button className="btn btn--primary" disabled={!cellId} onClick={submit}>
            {existing ? '수정하기' : '회의 열기'}
          </button>
          {!cellId && <p className="text-caption" style={{ textAlign: 'center' }}>세포를 골라줘!</p>}
        </div>
      </div>
    </div>
  );
}
