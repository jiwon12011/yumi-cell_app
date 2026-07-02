import { COMMENTS } from '../data/comments';
import type { CellId, Intensity } from './types';

/** FNV-1a 32bit — 결정적이고 빠른 문자열 해시 */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * 리액션 멘트 결정적 선택 (기획서 §5.1).
 * 같은 (날짜, 세포, 강도) → 항상 같은 멘트. 랜덤 금지.
 */
export function pickComment(cellId: CellId, intensity: Intensity, dateISO: string): string {
  const pool = COMMENTS[cellId][intensity];
  return pool[hashString(`${dateISO}|${cellId}|${intensity}`) % pool.length];
}
