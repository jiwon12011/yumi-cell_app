// 날짜 유틸 — 전부 로컬 타임존 기준. toISOString() 금지(UTC 밀림, 기획서 §6.2).

export interface MonthCell {
  date: string; // 'YYYY-MM-DD'
  inMonth: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Date → 로컬 기준 'YYYY-MM-DD' */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** 오늘 날짜 문자열 (now 주입 가능 — 테스트용) */
export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

/** 'YYYY-MM-DD' → Date (로컬 자정) */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** iso에 n일 더한 날짜 문자열 */
export function addDaysISO(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** 'YYYY-MM-DD' → 'YYYY-MM' */
export function ymOf(iso: string): string {
  return iso.slice(0, 7);
}

/** 'YYYY-MM'에 n개월 더하기 */
export function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

const WEEKDAYS_KO = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

/** '2026-07-02' → '2026.07.02 수요일' */
export function formatKorean(iso: string): string {
  const d = parseISODate(iso);
  return `${iso.replaceAll('-', '.')} ${WEEKDAYS_KO[d.getDay()]}`;
}

/** '2026-07' → '2026년 7월' */
export function formatYmKorean(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${y}년 ${m}월`;
}

/**
 * 달력 그리드: 일요일 시작, 항상 7×6 = 42칸.
 * 앞뒤 패딩은 이웃 달 날짜(inMonth: false).
 */
export function monthGrid(ym: string): MonthCell[] {
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const start = new Date(y, m - 1, 1 - first.getDay());
  const cells: MonthCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date: toISODate(d), inMonth: d.getMonth() === m - 1 });
  }
  return cells;
}
