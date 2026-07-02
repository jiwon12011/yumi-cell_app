import { CELL_IDS } from '../data/cells';
import { addDaysISO, ymOf } from './dateUtils';
import type { CellId, EntriesMap } from './types';

export interface CellShare {
  cellId: CellId;
  count: number;
  /** 정수 %, 전체 합 100 (최대 잉여 보정). 기록 0건인 달은 전부 0. */
  percent: number;
}

/** 해당 월(YYYY-MM)의 세포별 기록 수·비율. CELL_IDS 순서 고정. */
export function monthDistribution(entries: EntriesMap, ym: string): CellShare[] {
  const counts = new Map<CellId, number>(CELL_IDS.map((id) => [id, 0]));
  let total = 0;
  for (const e of Object.values(entries)) {
    if (ymOf(e.date) === ym) {
      counts.set(e.cellId, (counts.get(e.cellId) ?? 0) + 1);
      total++;
    }
  }
  if (total === 0) {
    return CELL_IDS.map((cellId) => ({ cellId, count: 0, percent: 0 }));
  }
  // 최대 잉여법: 내림 후 나머지 큰 순으로 +1 해서 합 100 보장
  const raw = CELL_IDS.map((cellId) => {
    const count = counts.get(cellId)!;
    const exact = (count * 100) / total;
    return { cellId, count, floor: Math.floor(exact), frac: exact - Math.floor(exact) };
  });
  let remain = 100 - raw.reduce((s, r) => s + r.floor, 0);
  const order = [...raw].sort((a, b) => b.frac - a.frac);
  const bonus = new Set<CellId>();
  for (const r of order) {
    if (remain <= 0) break;
    if (r.count > 0) {
      bonus.add(r.cellId);
      remain--;
    }
  }
  return raw.map((r) => ({
    cellId: r.cellId,
    count: r.count,
    percent: r.floor + (bonus.has(r.cellId) ? 1 : 0),
  }));
}

/** 이번 달 최다 세포. 동률이면 가장 최근에 기록된 세포 (기획서 §4.5). 기록 없으면 null. */
export function topCellOfMonth(entries: EntriesMap, ym: string): CellId | null {
  const dist = monthDistribution(entries, ym);
  const max = Math.max(...dist.map((d) => d.count));
  if (max === 0) return null;
  const tied = new Set(dist.filter((d) => d.count === max).map((d) => d.cellId));
  let winner: CellId | null = null;
  let latest = -1;
  for (const e of Object.values(entries)) {
    if (ymOf(e.date) === ym && tied.has(e.cellId) && e.updatedAt > latest) {
      latest = e.updatedAt;
      winner = e.cellId;
    }
  }
  return winner;
}

/**
 * 현재 연속 기록일. 오늘 기록이 있으면 오늘부터, 없으면 어제부터 거슬러 센다
 * (오늘은 아직 기록 전일 수 있으므로 스트릭을 끊지 않는다).
 */
export function currentStreak(entries: EntriesMap, todayISO: string): number {
  let cursor = entries[todayISO] ? todayISO : addDaysISO(todayISO, -1);
  let streak = 0;
  while (entries[cursor]) {
    streak++;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

/** date까지 같은 세포가 연속으로 의장(기록)을 맡은 일수 — 해당 날짜 포함 */
export function chairStreak(entries: EntriesMap, date: string): number {
  const cell = entries[date]?.cellId;
  if (!cell) return 0;
  let n = 0;
  let cursor = date;
  while (entries[cursor]?.cellId === cell) {
    n++;
    cursor = addDaysISO(cursor, -1);
  }
  return n;
}

/** 역대 최장 연속 기록일 */
export function longestStreak(entries: EntriesMap): number {
  const dates = new Set(Object.keys(entries));
  let best = 0;
  for (const date of dates) {
    if (dates.has(addDaysISO(date, -1))) continue; // 연속 구간의 시작만
    let len = 0;
    let cursor = date;
    while (dates.has(cursor)) {
      len++;
      cursor = addDaysISO(cursor, 1);
    }
    best = Math.max(best, len);
  }
  return best;
}
