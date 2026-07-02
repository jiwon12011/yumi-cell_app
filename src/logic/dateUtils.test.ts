import { describe, expect, it } from 'vitest';
import {
  addDaysISO,
  addMonths,
  formatKorean,
  formatYmKorean,
  monthGrid,
  parseISODate,
  todayISO,
  ymOf,
} from './dateUtils';

describe('todayISO', () => {
  it('로컬 기준 날짜를 만든다 (자정 직전/직후)', () => {
    expect(todayISO(new Date(2026, 6, 2, 23, 59, 59))).toBe('2026-07-02');
    expect(todayISO(new Date(2026, 6, 3, 0, 0, 1))).toBe('2026-07-03');
  });

  it('한 자리 월/일을 0-패딩한다', () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('addDaysISO', () => {
  it('월 경계를 넘는다', () => {
    expect(addDaysISO('2026-06-30', 1)).toBe('2026-07-01');
    expect(addDaysISO('2026-07-01', -1)).toBe('2026-06-30');
  });

  it('연 경계를 넘는다', () => {
    expect(addDaysISO('2025-12-31', 1)).toBe('2026-01-01');
  });

  it('윤년 2월을 처리한다', () => {
    expect(addDaysISO('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDaysISO('2025-02-28', 1)).toBe('2025-03-01');
  });
});

describe('ymOf / addMonths', () => {
  it('YYYY-MM을 추출한다', () => {
    expect(ymOf('2026-07-02')).toBe('2026-07');
  });

  it('12→1월 경계를 넘는다', () => {
    expect(addMonths('2025-12', 1)).toBe('2026-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });
});

describe('monthGrid', () => {
  it('항상 42칸(7×6)이다', () => {
    expect(monthGrid('2026-07')).toHaveLength(42);
    expect(monthGrid('2024-02')).toHaveLength(42);
  });

  it('2026-07은 수요일 시작 — 앞 패딩 3칸(6/28~30)', () => {
    const grid = monthGrid('2026-07');
    expect(grid[0]).toEqual({ date: '2026-06-28', inMonth: false });
    expect(grid[3]).toEqual({ date: '2026-07-01', inMonth: true });
    expect(grid.filter((c) => c.inMonth)).toHaveLength(31);
  });

  it('윤년 2월(2024)은 29칸이 inMonth', () => {
    expect(monthGrid('2024-02').filter((c) => c.inMonth)).toHaveLength(29);
  });

  it('일요일로 시작하는 달(2026-11)도 1일이 첫 칸', () => {
    const grid = monthGrid('2026-11');
    expect(grid[0]).toEqual({ date: '2026-11-01', inMonth: true });
  });
});

describe('format', () => {
  it('한국어 날짜 포맷', () => {
    expect(formatKorean('2026-07-02')).toBe('2026.07.02 목요일');
    expect(formatYmKorean('2026-07')).toBe('2026년 7월');
  });

  it('parseISODate는 로컬 자정', () => {
    const d = parseISODate('2026-07-02');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 6, 2]);
    expect(d.getHours()).toBe(0);
  });
});
