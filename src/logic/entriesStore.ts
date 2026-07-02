import type { CellId, DiaryEntry, EntriesMap, StoreV1 } from './types';

export const STORAGE_KEY = 'cell-mood-diary:v1';
export const NOTE_MAX = 80;

const CELL_ID_SET = new Set<string>([
  'emotion',
  'reason',
  'love',
  'pride',
  'rest',
  'anxiety',
  'impulse',
]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const NAME_MAX = 12;

export function emptyStore(): StoreV1 {
  return { version: 1, onboarded: false, userName: '', entries: {} };
}

/** trim + 최대 12자 (코드포인트 기준) */
export function clampName(s: string): string {
  return Array.from(s.trim()).slice(0, NAME_MAX).join('');
}

/** trim + 최대 80자. 서로게이트 페어(이모지)를 쪼개지 않도록 코드포인트 기준. */
export function clampNote(s: string): string {
  return Array.from(s.trim()).slice(0, NOTE_MAX).join('');
}

function isValidEntry(v: unknown, dateKey: string): v is DiaryEntry {
  if (typeof v !== 'object' || v === null) return false;
  const e = v as Record<string, unknown>;
  return (
    e.date === dateKey &&
    typeof dateKey === 'string' &&
    DATE_RE.test(dateKey) &&
    typeof e.cellId === 'string' &&
    CELL_ID_SET.has(e.cellId) &&
    typeof e.poseIndex === 'number' &&
    e.poseIndex >= 1 &&
    e.poseIndex <= 5 &&
    Number.isInteger(e.poseIndex) &&
    typeof e.intensity === 'number' &&
    e.intensity >= 1 &&
    e.intensity <= 3 &&
    Number.isInteger(e.intensity) &&
    typeof e.note === 'string' &&
    typeof e.createdAt === 'number' &&
    typeof e.updatedAt === 'number'
  );
}

/**
 * 원문 → 스토어 복원. 어떤 입력에도 크래시하지 않는다 (기획서 §6.2):
 * 파싱 실패 → 빈 스토어. 불량 항목 → 그 항목만 드롭. 80자 초과 노트 → 클램프.
 */
export function deserialize(raw: string | null): StoreV1 {
  if (!raw) return emptyStore();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyStore();
  }
  if (typeof parsed !== 'object' || parsed === null) return emptyStore();
  const p = parsed as Record<string, unknown>;
  const entries: EntriesMap = {};
  if (typeof p.entries === 'object' && p.entries !== null) {
    for (const [date, value] of Object.entries(p.entries as Record<string, unknown>)) {
      if (isValidEntry(value, date)) {
        entries[date] = { ...value, cellId: value.cellId as CellId, note: clampNote(value.note) };
      }
    }
  }
  return {
    version: 1,
    onboarded: p.onboarded === true,
    userName: typeof p.userName === 'string' ? clampName(p.userName) : '',
    entries,
  };
}

export function serialize(store: StoreV1): string {
  return JSON.stringify(store);
}

// --- localStorage 래퍼 (브라우저 밖에서는 no-op — 테스트는 순수 계층만 다룸) ---

export function loadStore(): StoreV1 {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    return deserialize(localStorage.getItem(STORAGE_KEY));
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: StoreV1): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, serialize(store));
  } catch {
    // 저장 실패(용량 등)는 조용히 무시 — 다음 저장에서 재시도
  }
}
